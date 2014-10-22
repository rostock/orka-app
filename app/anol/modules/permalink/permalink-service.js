angular.module('anol.permalink', [])

.factory('PermalinkService', ['$rootScope', '$location', 'MapService', 'LayersService', function($rootScope, $location, MapService, LayersService) {
    var layersShortcuts;
    var lon;
    var lat;
    var zoom;
    var self = this;
    var map = MapService.getMap();

    var generatePermalink = function(evt) {
        if(zoom === undefined || lon === undefined || lat === undefined) {
            return;
        }
        var urlAddon = 'map=' + [zoom, lon, lat, layersShortcuts].join('/');
        $location.path(urlAddon);
        self.permalink = $location.absUrl();
    };

    var moveendHandler = function(evt) {
        var view = map.getView();


        var projection = view.getProjection();
        // projection string from provider config
        var center = ol.proj.transform(view.getCenter(), projection, 'EPSG:25833');
        lon = center[0];
        lat = center[1];

        zoom = view.getZoom();
        $rootScope.$apply(function() {
            generatePermalink();
        });
    };

    var extractMapParams = function(path) {
        var permalinkRegEx = /.*map=(\d+)\/(\d+\.?\d+?)\/(\d+\.?\d+?)\/?([A-Z]+)?$/g;
        var mapParams = permalinkRegEx.exec(path);
        if(mapParams !== null && mapParams.length == 5) {
            return {
                'zoom': mapParams[1],
                'center': [mapParams[2], mapParams[3]],
                'shortcuts': mapParams[4]
            };
        }
        return false;
    };

    map.on('moveend', moveendHandler);

    $rootScope.$watchCollection(
        function() {
            return LayersService.visibleLayerShortcuts;
        }, function(newVal, oldVal) {
            if(newVal !== undefined) {
                layersShortcuts = newVal.join('');
                generatePermalink();
            }
        }
    );

    var mapParams = extractMapParams($location.path());
    if(mapParams !== false) {
        var view = map.getView();
        view.setCenter(mapParams.center);
        view.setZoom(mapParams.zoom);
        if(mapParams.shortcuts !== undefined) {
            LayersService.setVisibleByShortcuts(mapParams.shortcuts);
        }
    }

    return self;
}]);

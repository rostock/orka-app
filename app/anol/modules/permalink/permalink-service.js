angular.module('anol.permalink', [])

.factory('PermalinkService', ['$rootScope', '$location', 'MapService', 'LayersService', function($rootScope, $location, MapService, LayersService) {
    var permalinkRegEx = /.*map=(\d+)\/(\d+\.?\d+?)\/(\d+\.?\d+?)\/?([A-Z]+)?$/g;
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

        //TODO reproject center when 25833 can be reprojected to 4326
        var projection = view.getProjection();

        var center = view.getCenter();//ol.proj.transform(view.getCenter(), projection, 'EPSG:4326');
        lon = center[0];
        lat = center[1];

        zoom = view.getZoom();
        $rootScope.$apply(function() {
            generatePermalink();
        });
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
    var path = $location.path();
    var mapParams = permalinkRegEx.exec(path);
    if(mapParams !== null && mapParams.length == 5) {
        map.getView().setZoom(mapParams[1]);
        //TODO reproject center when 25833 can be reprojected to 4326
        map.getView().setCenter([mapParams[2], mapParams[3]]);
        if(mapParams[4] !== undefined) {
            angular.forEach(LayersService.layers, function(layer) {
                var shortcut = layer.get('shortcut');
                if(shortcut !== undefined) {
                    layer.setVisible($.inArray(shortcut, mapParams[4]) !== -1);
                }
            });
        }

    }

    return self;
}]);

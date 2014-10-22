angular.module('anol.permalink', [])

.provider('PermalinkService', [function() {
    var _urlCrs;
    var extractMapParams = function(path) {
        var permalinkRegEx = /.*map=(\d+)\/(\d+\.?\d+?)\/(\d+\.?\d+?)\/(EPSG:\d+)\/?([A-Z]+)?$/g;
        var mapParams = permalinkRegEx.exec(path);
        if(mapParams !== null && mapParams.length == 6) {
            return {
                'zoom': parseInt(mapParams[1]),
                'center': [parseFloat(mapParams[2]), parseFloat(mapParams[3])],
                'crs': mapParams[4],
                'shortcuts': mapParams[5]
            };
        }
        return false;
    };

    this.setUrlCrs = function(crs) {
        _urlCrs = crs;
    };

    var Permalink = function($rootScope, $location, MapService, LayersService, urlCrs) {
        var self = this;
        self.urlCrs = urlCrs;
        self.$rootScope = $rootScope;
        self.$location = $location;
        self.LayersService = LayersService;
        self.zoom = undefined;
        self.lon = undefined;
        self.lat = undefined;
        self.layersShortcuts = undefined;
        self.map = MapService.getMap();
        self.view = self.map.getView();

        self.map.on('moveend', self.moveendHandler, self);

        self.$rootScope.$watchCollection(
            function() {
                return self.LayersService.visibleLayerShortcuts;
            }, function(newVal, oldVal) {
                if(newVal !== undefined) {
                    self.layersShortcuts = newVal.join('');
                    self.generatePermalink();
                }
            }
        );

        var mapParams = extractMapParams(self.$location.path());
        if(mapParams !== false) {
            var center = ol.proj.transform(mapParams.center, mapParams.crs, self.view.getProjection());
            self.view.setCenter(center);
            self.view.setZoom(mapParams.zoom);
            if(mapParams.shortcuts !== undefined) {
                self.LayersService.setVisibleByShortcuts(mapParams.shortcuts);
            }
        }
    };
    Permalink.prototype.moveendHandler = function(evt) {
        var self = this;
        var center = ol.proj.transform(self.view.getCenter(), self.view.getProjection(), self.urlCrs);
        self.lon = center[0];
        self.lat = center[1];

        self.zoom = self.view.getZoom();
        self.$rootScope.$apply(function() {
            self.generatePermalink();
        });
    };
    Permalink.prototype.generatePermalink = function(evt) {
        var self = this;
        if(self.zoom === undefined || self.lon === undefined || self.lat === undefined) {
            return;
        }
        var urlAddon = 'map=' + [self.zoom, self.lon, self.lat, self.urlCrs, self.layersShortcuts].join('/');
        self.$location.path(urlAddon);
        self.permalink = self.$location.absUrl();
    };

    this.$get = ['$rootScope', '$location', 'MapService', 'LayersService', function($rootScope, $location, MapService, LayersService) {
        return new Permalink($rootScope, $location, MapService, LayersService, _urlCrs);
    }];
}]);

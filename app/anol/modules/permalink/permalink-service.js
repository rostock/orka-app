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

    this.$get = ['$rootScope', '$location', 'MapService', 'LayersService', function($rootScope, $location, MapService, LayersService) {
        var Permalink = function(urlCrs) {
            var self = this;
            self.urlCrs = urlCrs;
            self.zoom = undefined;
            self.lon = undefined;
            self.lat = undefined;
            self.layersShortcuts = undefined;
            self.map = MapService.getMap();
            self.view = self.map.getView();

            self.map.on('moveend', self.moveendHandler, self);

            $rootScope.$watchCollection(
                function() {
                    return LayersService.visibleLayerShortcuts;
                }, function(newVal, oldVal) {
                    if(newVal !== undefined) {
                        self.layersShortcuts = newVal.join('');
                        self.generatePermalink();
                    }
                }
            );

            var mapParams = extractMapParams($location.path());
            if(mapParams !== false) {
                var center = ol.proj.transform(mapParams.center, mapParams.crs, self.view.getProjection());
                self.view.setCenter(center);
                self.view.setZoom(mapParams.zoom);
                if(mapParams.shortcuts !== undefined) {
                    LayersService.setVisibleByShortcuts(mapParams.shortcuts);
                }
            }
        };
        Permalink.prototype.moveendHandler = function(evt) {
            var self = this;
            var center = ol.proj.transform(self.view.getCenter(), self.view.getProjection(), self.urlCrs);
            self.lon = center[0];
            self.lat = center[1];

            self.zoom = self.view.getZoom();
            $rootScope.$apply(function() {
                self.generatePermalink();
            });
        };
        Permalink.prototype.generatePermalink = function(evt) {
            var self = this;
            if(self.zoom === undefined || self.lon === undefined || self.lat === undefined) {
                return;
            }
            var urlAddon = 'map=' + [self.zoom, self.lon, self.lat, self.urlCrs, self.layersShortcuts].join('/');
            $location.path(urlAddon);
            self.permalink = $location.absUrl();
        };
        return new Permalink(_urlCrs);
    }];
}]);

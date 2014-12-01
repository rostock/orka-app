angular.module('anol.permalink')

/**
 * @ngdoc object
 * @name anol.permalink.PermalinkServiceProvider
 */
.provider('PermalinkService', [function() {
    var _urlCrs;
    var _precision = 100000;
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

    /**
     * @ngdoc method
     * @name setUrlCrs
     * @methodOf anol.permalink.PermalinkServiceProvider
     * @param {string} crs EPSG code of coordinates in url
     * @description
     * Define crs of coordinates in url
     */
    this.setUrlCrs = function(crs) {
        _urlCrs = crs;
    };

    /**
     * @ngdoc method
     * @name setPrecision
     * @methodOf anol.permalink.PermalinkServiceProvider
     * @param {number} precision Precision of coordinates in url
     * @description
     * Define precision of coordinates in url
     */
    this.setPrecision = function(precision) {
        _precision = precision;
    };

    this.$get = ['$rootScope', '$location', 'MapService', 'LayersService', function($rootScope, $location, MapService, LayersService) {
        /**
         * @ngdoc service
         * @name anol.permalink.PermalinkService
         *
         * @requires $rootScope
         * @requires $location
         * @requires anol.map.MapService
         * @requires anol.map.LayersService
         *
         * @description
         * Looks for a `map`-parameter in current url and move map to location specified in
         *
         * Updates browser-url with current zoom and location when map moved
         */
        var Permalink = function(urlCrs, precision) {
            var self = this;
            self.urlCrs = urlCrs;
            self.precision = precision;
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
        /**
         * @private
         * @name moveendHandler
         * @methodOf anol.permalink.PermalinkService
         * @param {Object} evt ol3 event object
         * @description
         * Get lat, lon and zoom after map stoped moving
         */
        Permalink.prototype.moveendHandler = function(evt) {
            var self = this;
            var center = ol.proj.transform(self.view.getCenter(), self.view.getProjection(), self.urlCrs);
            self.lon = Math.round(center[0] * this.precision) / this.precision;
            self.lat = Math.round(center[1] * this.precision) / this.precision;

            self.zoom = self.view.getZoom();
            $rootScope.$apply(function() {
                self.generatePermalink();
            });
        };
        /**
         * @private
         * @name generatePermalink
         * @methodOf anol.permalink.PermalinkService
         * @param {Object} evt ol3 event object
         * @description
         * Builds the permalink url addon
         */
        Permalink.prototype.generatePermalink = function(evt) {
            var self = this;
            if(self.zoom === undefined || self.lon === undefined || self.lat === undefined) {
                return;
            }
            var urlAddon = 'map=' + [self.zoom, self.lon, self.lat, self.urlCrs, self.layersShortcuts].join('/');
            $location.path(urlAddon);
            self.permalink = $location.absUrl();
        };
        return new Permalink(_urlCrs, _precision);
    }];
}]);

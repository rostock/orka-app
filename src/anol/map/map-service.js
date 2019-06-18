angular.module('anol.map')

 /**
 * @ngdoc object
 * @name anol.map.MapServiceProvider
 *
 * @description
 * MapService handles ol3 map creation including adding interactions, controls and layers to it.
 *
 * The ol.View is added with the provider method addView
 * It will only create one instance of an ol map
 */
.provider('MapService', [function() {
    var _view;

    var buildMapConfig = function(layers, controls, interactions) {
        var map = new ol.Map(angular.extend({}, {
            controls: controls,
            interactions: interactions,
            layers: layers,
            logo: false
        }));
        map.setView(_view);
        return map;
    };

    /**
     * @ngdoc method
     * @name addView
     * @methodOf anol.map.MapServiceProvider
     *
     * @param {Object} view ol3 view object
     *
     * @description
     * Set the map view
     */
    this.addView = function(view) {
        _view = view;
    };

    this.$get = ['LayersService', 'ControlsService', 'InteractionsService', function(LayersService, ControlsService, InteractionsService) {
        /**
         * @ngdoc service
         * @name anol.map.MapService
         *
         * @requires anol.map.LayersService
         * @requires anol.map.ControlsService
         * @requires anol.map.InteractionsService
         *
         * @description
         * MapService handles ol3 map creation including adding interactions, controls and layers to it.
         *
         * The ol.View is added with the provider method addView
         * It will only create one instance of an ol map
         */
        var MapService = function() {
            this.map = undefined;
        };
        /**
         * @ngdoc method
         * @name getMap
         * @methodOf anol.map.MapService
         *
         * @returns {Object} ol.Map
         *
         * @description
         * Get the current ol map. If not previosly requested, a new map
         * is created.
         */
        MapService.prototype.getMap = function() {
            if(angular.isUndefined(this.map)) {
                this.map = buildMapConfig(
                    LayersService.layers,
                    ControlsService.controls,
                    InteractionsService.interactions
                );
                LayersService.registerMap(this.map);
                ControlsService.registerMap(this.map);
                InteractionsService.registerMap(this.map);
            }
            return this.map;
        };
        return new MapService();
    }];
}]);

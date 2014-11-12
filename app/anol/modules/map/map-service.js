angular.module('anol.map')

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

    this.addView = function(view) {
        _view = view;
    };

    this.$get = ['LayersService', 'ControlsService', 'InteractionsService', function(LayersService, ControlsService, InteractionsService) {
        var MapService = function() {
            this.map = undefined;
        };
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

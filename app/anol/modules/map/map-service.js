angular.module('anol.map')

.provider('MapService', [function() {
    var _view;

    var buildMapConfig = function(layers, controls) {
        var map = new ol.Map(angular.extend({}, {
            controls: controls,
            layers: layers
        }));
        map.setView(_view);
        return map;
    };

    this.addView = function(view) {
        _view = view;
    };

    this.$get = ['LayersService', 'ControlsService', function(LayersService, ControlsService) {
        var MapService = function() {
            this.map = undefined;
        };
        MapService.prototype.getMap = function() {
            if(angular.isUndefined(this.map)) {
                this.map = buildMapConfig(
                    LayersService.layers,
                    ControlsService.controls
                );
                LayersService.registerMap(this.map);
            }
            return this.map;
        };
        return new MapService();
    }];
}]);

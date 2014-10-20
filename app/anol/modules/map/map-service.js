angular.module('anol.map')

.provider('MapService', [function() {
    var _view;

    var buildMapConfig = function(layers, controls) {
        var map = new ol.Map(angular.extend({}, {
            'controls': controls
        }));
        map.setView(_view);
        angular.forEach(layers, function(layer) {
            map.addLayer(layer);
        });
        return map;
    };

    this.addView = function(view) {
        _view = view;
    };

    var MapService = function(layersService, controlsService) {
        this.LayersService = layersService;
        this.ControlsService = controlsService;
        this.map = undefined;
    };
    MapService.prototype.getMap = function() {
        if(angular.isUndefined(this.map)) {
            this.map = buildMapConfig(
                this.LayersService.layers,
                this.ControlsService.controls
            );
        }
        return this.map;
    };

    this.$get = ['LayersService', 'ControlsService', function(LayersService, ControlsService) {
        return new MapService(LayersService, ControlsService);
    }];
}]);

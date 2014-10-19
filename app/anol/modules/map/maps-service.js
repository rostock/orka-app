angular.module('anol.map')

.config(function(DefaultMapName, MapsServiceProvider) {
    MapsServiceProvider.setDefaultMapName(DefaultMapName);
})

.provider('MapsService', [function() {
    var _defaultMapName;
    var _views = {};

    var buildMapConfig = function(name, layers, controls) {
        var map = new ol.Map(angular.extend({}, {
            'controls': controls
        }));
        map.setView(_views[name]);
        angular.forEach(layers, function(layer) {
            map.addLayer(layer);
        });
        return map;
    };

    this.setDefaultMapName = function(name) {
        _defaultMapName = name;
    };

    this.addView = function(view, name) {
        name = name || _defaultMapName;
        _views[name] = view;
    };

    var MapsService = function(layersService, controlsService) {
        this.LayersService = layersService;
        this.ControlsService = controlsService;
        this.maps = {};
    };
    MapsService.prototype.getMap = function(name) {
        name = name || _defaultMapName;

        if(angular.isUndefined(this.maps[name])) {
            this.maps[name] = buildMapConfig(name, 
                this.LayersService.layers[name], 
                this.ControlsService.controls[name]
            );
        }
        return this.maps[name];
    };

    this.$get = ['LayersService', 'ControlsService', function(LayersService, ControlsService) {
        return new MapsService(LayersService, ControlsService);
    }];
}]);

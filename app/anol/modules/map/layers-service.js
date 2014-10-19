angular.module('anol.map')

.config(function(DefaultMapName, LayersServiceProvider) {
    LayersServiceProvider.setDefaultMapName(DefaultMapName);
})

.provider('LayersService', [function() {
    var _defaultMapName;
    var _layers = {};

    this.setDefaultMapName = function(name) {
        _defaultMapName = name;
    };

    this.setLayers = function(layers, name) {
        name = name || _defaultMapName;

        _layers[name] = layers;
    };

    // and this is the service part
    var Layers = function(layers) {
        this.layers = layers;
    };
    Layers.prototype.addLayer = function(layer, name) {
        name = name || _defaultMapName;

        if(angular.isUndefined(this.layers[name])) {
            this.layers[name] = [];
        }
        this.layers.push(layer);
    };
    Layers.prototype.addLayers = function(layers, name) {
        name = name || _defaultMapName;

        if(angular.isUndefined(this.layers[name])) {
            this.layers[name] = [];
        }
        this.layers = this.layers.concat(layers);
    };

    this.$get = [function() {
        return new Layers(_layers);
    }];
}]);

angular.module('anol.map')

.provider('LayersService', [function() {
    var _layers = [];

    this.setLayers = function(layers) {
        _layers = layers;
    };

    // and this is the service part
    var Layers = function(layers) {
        this.layers = layers;
    };
    Layers.prototype.addLayer = function(layer) {
        this.layers.push(layer);
    };
    Layers.prototype.addLayers = function(layers) {
        this.layers = this.layers.concat(layers);
    };

    this.$get = [function() {
        return new Layers(_layers);
    }];
}]);

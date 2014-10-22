angular.module('anol.map')

.provider('LayersService', [function() {
    var _layers = [];

    this.setLayers = function(layers) {
        _layers = layers;
    };

    // and this is the service part
    var Layers = function(layers) {
        this.layers = [];
        this.visibleLayerShortcuts = [];
        this.addLayers(layers);
    };
    Layers.prototype.prepareLayers = function(layers, listener) {
        var self = this;
        angular.forEach(layers, function(layer) {
            if(layer.getVisible()) {
                var shortcut = layer.get('shortcut');
                if(shortcut !== undefined) {
                    self.visibleLayerShortcuts.push(shortcut);
                }
            }
            layer.on('change:visible', listener);
        });
    };
    Layers.prototype.visibleChangedHandler = function(evt) {
        var layer = evt.target;
        var shortcut = layer.get('shortcut');
        if(shortcut === undefined) {
            return;
        }
        var shortcutIdx = $.inArray(shortcut, this.visibleLayerShortcuts);
        var visible = layer.getVisible();
        if(visible && shortcutIdx == -1) {
            this.visibleLayerShortcuts.push(shortcut);
        } else if(!visible && shortcutIdx != -1) {
            this.visibleLayerShortcuts.splice(shortcutIdx, 1);
        }
    };
    Layers.prototype.addLayer = function(layer) {
        var self = this;
        this.prepareLayers([layer], function(evt) {
            self.visibleChangedHandler(evt);
        });
        this.layers.push(layer);
    };
    Layers.prototype.addLayers = function(layers) {
        var self = this;
        this.prepareLayers(layers, function(evt) {
            self.visibleChangedHandler(evt);
        });
        this.layers = this.layers.concat(layers);
    };

    this.$get = [function() {
        return new Layers(_layers);
    }];
}]);

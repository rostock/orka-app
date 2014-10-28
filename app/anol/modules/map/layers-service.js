angular.module('anol.map')

.provider('LayersService', [function() {
    var _layers = [];

    this.setLayers = function(layers) {
        _layers = layers;
    };

    this.$get = [function() {
        // and this is the service part
        var Layers = function(layers) {
            this.map = undefined;
            this.layers = [];
            // TODO store the only active background layer in this.backgroundlayer
            this.backgroundLayers = [];
            this.overlayLayers = [];
            this.visibleLayerShortcuts = [];
            this.shortcutMapping = {};
            this.addLayers(layers);
        };
        Layers.prototype.registerMap = function(map) {
            this.map = map;
        };
        Layers.prototype.prepareLayers = function(layers, listener) {
            var self = this;
            angular.forEach(layers, function(layer) {
                var shortcut = layer.get('shortcut');
                if(shortcut !== undefined) {
                    self.shortcutMapping[shortcut] = layer;
                    if(layer.getVisible()) {
                        self.visibleLayerShortcuts.push(shortcut);
                    }
                }
                if(layer.get('isBackground')) {
                    self.backgroundLayers.push(layer);
                } else {
                    self.overlayLayers.push(layer);
                }
                layer.on('change:visible', listener);
                // while map is undefined, don't add layers to it
                // when map is created, all this.layers are added to map
                // after that, this.map is registered
                // so, wehen map is defined, added layers are not in map
                // and must be added
                if(self.map !== undefined) {
                    self.map.addLayer(layer);
                }
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
        Layers.prototype.setVisibleByShortcuts = function(visibleShortcuts) {
            var self = this;
            visibleShortcuts = visibleShortcuts.split('');
            angular.forEach(visibleShortcuts, function(shortcut) {
                if(self.shortcutMapping[shortcut] !== undefined) {
                    self.shortcutMapping[shortcut].setVisible(true);
                }
            });
            var nonVisibleShortcuts = $.grep(self.visibleLayerShortcuts, function(el) {
                return $.inArray( el, visibleShortcuts ) == -1;
            });
            angular.forEach(nonVisibleShortcuts, function(shortcut) {
                if(self.shortcutMapping[shortcut] !== undefined) {
                    self.shortcutMapping[shortcut].setVisible(false);
                }
            });
        };
        Layers.prototype.backgroundLayer = function() {
            var backgroundLayer;
            angular.forEach(this.backgroundLayers, function(layer) {
                if(layer.getVisible() === true) {
                    backgroundLayer = layer;
                }
            });
            return backgroundLayer;
        };
        Layers.prototype.layersByProperty = function(key, value) {
            var self = this;
            var layers = [];
            angular.forEach(self.layers, function(layer) {
                if(layer.get(key) === value) {
                    layers.push(layer);
                }
            });
            return layers;
        };
        return new Layers(_layers);
    }];
}]);

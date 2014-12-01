angular.module('anol.map')

/**
 * @ngdoc object
 * @name anol.map.LayersServiceProvider
 */
.provider('LayersService', [function() {
    var _layers = [];

    /**
     * @ngdoc method
     * @name setLayers
     * @methodOf anol.map.LayersServiceProvider
     * @param {Array.<Object>} layers ol3 layers
     */
    this.setLayers = function(layers) {
        _layers = _layers.concat(layers);
    };

    this.$get = [function() {
        /**
         * @ngdoc service
         * @name anol.map.LayersService
         *
         * @description
         * Stores ol3 layerss and add them to map, if map present
         */
        var Layers = function(layers) {
            this.map = undefined;
            this.layers = [];
            this.backgroundLayers = [];
            this.overlayLayers = [];
            this.visibleLayerShortcuts = [];
            this.shortcutMapping = {};
            this.addLayers(layers);
        };
        /**
         * @ngdoc method
         * @name registerMap
         * @methodOf anol.map.LayersService
         * @param {Object} map ol3 map object
         * @description
         * Register an ol3 map in `LayersService`
         */
        Layers.prototype.registerMap = function(map) {
            this.map = map;
        };
        /**
         * private function
         *
         * prepares short cut mapping,
         * stores layer into background- or overlaylayers list
         * adds event handler to change:visible event
         */
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
                // so, when map is defined, added layers are not in map
                // and must be added
                if(self.map !== undefined) {
                    self.map.addLayer(layer);
                }
            });
        };
        /**
         * private function
         *
         * updates shortcut list on change:visible event
         */
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
        /**
         * @ngdoc method
         * @name addLayer
         * @methodOf anol.map.LayersService
         * @param {Object} layer ol3 layer object
         * @description
         * Adds a single layer
         */
        Layers.prototype.addLayer = function(layer) {
            var self = this;
            this.prepareLayers([layer], function(evt) {
                self.visibleChangedHandler(evt);
            });

            this.layers.push(layer);
        };
        /**
         * @ngdoc method
         * @name addLayers
         * @methodOf anol.map.LayersService
         * @param {Array.<Object>} layers ol3 layers
         * @description
         * Adds an array of layers
         */
        Layers.prototype.addLayers = function(layers) {
            var self = this;
            this.prepareLayers(layers, function(evt) {
                self.visibleChangedHandler(evt);
            });

            this.layers = this.layers.concat(layers);
        };
        /**
         * @ngdoc method
         * @name setVisibleByShortcuts
         * @methodOf anol.map.LayersService
         * @param {string} visibleShortcuts shortcuts of layer which should be visible
         * @description
         * Make all layer related to given shortcuts visible
         */
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
        /**
         * @ngdoc method
         * @name backgroundLayer
         * @methodOf anol.map.LayersService
         * @returns {Array.<Object>} backgroundLayers all background layers
         * @description
         * Returns all background layers
         */
        Layers.prototype.backgroundLayer = function() {
            var backgroundLayer;
            angular.forEach(this.backgroundLayers, function(layer) {
                if(layer.getVisible() === true) {
                    backgroundLayer = layer;
                }
            });
            return backgroundLayer;
        };
        /**
         * @ngdoc method
         * @name layersByProperty
         * @methodOf anol.map.LayersService
         * @param {string} key property name
         * @param {string} value property value
         * @returns {Array.<Object>} all layer with key = value
         * @description
         * Returns all layers with key matching value
         */
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

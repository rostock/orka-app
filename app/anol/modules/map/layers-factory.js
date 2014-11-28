angular.module('anol.map')

/**
 * @ngdoc service
 * @name anol.map.LayersFactory
 *
 * @description
 * Provide functions for creating ol3 layers with source for common
 * use cases
 */

// TODO think about a better solution to provide layer objects
.provider('LayersFactory', [function() {
    var self = this;

    var createBasicSourceOptions = function(options) {
        var sourceOptions = {};
        if(options.projection !== undefined) {
            sourceOptions.projection = options.projection;
        }
        if(options.attributions !== undefined) {
            if(!(options.attributions instanceof Array)) {
                options.attributions = [options.attributions];
            }
            sourceOptions.attributions = [];
            angular.forEach(options.attributions, function(attributionText) {
                sourceOptions.attributions.push(new ol.Attribution({
                    html: attributionText
                }));
            });
        }
        return sourceOptions;
    };

    var applyLayerProperties = function(layer, options) {
        if(options.title !== undefined) {
            layer.set('title', options.title);
        }
        if(options.shortcut !== undefined) {
            layer.set('shortcut', options.shortcut);
        }
        if(options.visible !== undefined) {
            layer.setVisible(options.visible);
        }
        if(options.extent !== undefined) {
            layer.setExtent(options.extent);
        }
        if(options.displayInLayerswitcher !== undefined) {
            layer.set('displayInLayerswitcher', options.displayInLayerswitcher);
        }
        if(options.isBackground !== undefined) {
            layer.set('isBackground', options.isBackground);
        }
        if(options.layer !== undefined) {
            layer.set('layer', options.layer);
        }
        if(options.style !== undefined) {
            layer.setStyle(options.style);
        }
        return layer;
    };

    /**
     * @ngdoc function
     * @name newTMS
     * @methodOf anol.map.LayersFactory
     * @parameters {Object} options
     * @parameters {string} options.baseURL Layers base url
     * @parameters {string} options.format tile image format
     * @parameters {Array} options.extent Layer extent
     * @parameters {Array} options.resolutions Layer resolutions
     * @parameters {Object} options.projection Layer projection
     * @parameters {Array|string} options.attributions Layer attributions
     * @parameters {string} options.title Layer title
     * @parameters {string} options.shortcut Layer shortcut
     * @parameters {Boolean} options.visible Initial layer visibility
     * @parameters {Boolean} options.displayInLayerswitcher Layer should apear in layerswitcher
     * @parameters {Boolean} options.isBackground Layer is a background layer
     * @parameters {string} options.layer Layer name
     *
     * @description
     * Creates a TMS layer
     */
    this.newTMS = function(options) {
        var tileGrid = false;

        var tileURL = function(tileCoord, pixelRatio, projection) {
            var url = '';
            if (tileCoord[1] > 0 && tileCoord[2] > 0) {
                url += options.baseURL + '/';
                url += options.layer + '/';
                url += tileCoord[0].toString() + '/';
                url += tileCoord[1].toString() + '/';
                url += tileCoord[2].toString();
                url += '.' + options.format;
            }
            return url;
        };

        if(options.extent && options.resolutions) {
            tileGrid = new ol.tilegrid.TileGrid({
                origin: [options.extent[0], options.extent[1]],
                resolutions: options.resolutions
            });
        }

        var sourceOptions = createBasicSourceOptions(options);
        sourceOptions.tileUrlFunction = tileURL;

        if(tileGrid) {
            sourceOptions.tileGrid = tileGrid;
        }

        var layer = new ol.layer.Tile({
            source: new ol.source.TileImage(sourceOptions)
        });

        return applyLayerProperties(layer, options);
    };

    /**
     * @ngdoc function
     * @name newDynamicGeoJSON
     * @methodOf anol.map.LayersFactory
     * @parameters {Object} options
     * @parameters {string} options.url source url
     * @parameters {function} options.additionalParameters function must return a list of parameters to add to the source url for each request
     * @parameters {Object} options.projection Layer projection
     * @parameters {Object} options.style Layer style
     * @parameters {string} options.title Layer title
     * @parameters {string} options.shortcut Layer shortcut
     * @parameters {Boolean} options.visible Initial layer visibility
     * @parameters {Boolean} options.displayInLayerswitcher Layer should apear in layerswitcher
     * @parameters {string} options.layer Layer name
     *
     * @description
     * Creates a DynamicGeoJSON layer
     * This layer calls its source url when map extent changes and loads geojson-objects.
     * Loaded objects are styled by given style or by ol3 default style if no style given.
     */
    this.newDynamicGeoJSON = function(options) {
        var source;

        var loader = function(extent, resolution, projection) {
            var params = [
                'srs=' + projection.getCode(),
                'bbox=' + extent.join(',')
            ];
            if(angular.isFunction(options.additionalParameters)) {
                params.push(options.additionalParameters());
            }

            var url = options.url + params.join('&');
            $.ajax({
                url: url,
                dataType: 'json'
            })
            .done(function(response) {
                // TODO find a better solution
                // remove all features from source.
                // otherwise features in source might be duplicated
                // cause source.readFeatures don't look in source for
                // existing received features.
                // we can't use source.clear() at this place, cause
                // source.clear() will trigger to reload features from server
                // and this leads to an infinite loop
                var sourceFeatures = source.getFeatures();
                for(var i = 0; i < sourceFeatures.length; i++) {
                    source.removeFeature(sourceFeatures[i]);
                }
                source.addFeatures(source.readFeatures(response));
                // we have to dispatch own event couse change-event triggered
                // for each feature remove and for feature added
                // remove when ol3 provide something like source.update
                source.dispatchEvent('anolSourceUpdated');
            });
        };

        var sourceOptions = createBasicSourceOptions(options);
        sourceOptions.format = new ol.format.GeoJSON();
        sourceOptions.strategy = ol.loadingstrategy.bbox;
        sourceOptions.loader = loader;

        source = new ol.source.ServerVector(sourceOptions);

        var layer = new ol.layer.Vector({
            source: source
        });

        return applyLayerProperties(layer, options);
    };

    this.newGeoJSON = function(options) {
        var sourceOptions = createBasicSourceOptions(options);
        sourceOptions.url = options.url;
        source = new ol.source.GeoJSON(sourceOptions);
        var layer = new ol.layer.Vector({
            source: source
        });

        return applyLayerProperties(layer, options);
    };

    /**
     * @ngdoc function
     * @name newSingleTileWMS
     * @methodOf anol.map.LayersFactory
     * @parameters {Object} options
     * @parameters {string} options.url source url
     * @parameters {Object} options.params wms parameter
     * @parameters {Object} options.projection Layer projection
     * @parameters {string} options.title Layer title
     * @parameters {string} options.shortcut Layer shortcut
     * @parameters {Boolean} options.visible Initial layer visibility
     * @parameters {Boolean} options.displayInLayerswitcher Layer should apear in layerswitcher
     * @parameters {string} options.layer Layer name
     *
     * @description
     * Creates a SingleTileWMS layer
     */
    this.newSingleTileWMS = function(options) {
        var sourceOptions = createBasicSourceOptions(options);
        sourceOptions.url = options.url;
        sourceOptions.params = options.params;

        var layer = new ol.layer.Image({source: new ol.source.ImageWMS(sourceOptions)});
        return applyLayerProperties(layer, options);
    };

    /**
     * @ngdoc function
     * @name newFeatureLayer
     * @methodOf anol.map.LayersFactory
     * @parameters {Object} options
     * @parameters {Object} options.projection Layer projection
     * @parameters {Object} options.style Layer style
     * @parameters {string} options.title Layer title
     * @parameters {string} options.shortcut Layer shortcut
     * @parameters {Boolean} options.visible Initial layer visibility
     * @parameters {Boolean} options.displayInLayerswitcher Layer should apear in layerswitcher
     * @parameters {string} options.layer Layer name
     *
     * @description
     * Creates a FeatureLayer layer
     * FeatureLayer is a ol3 vector layer with an ol3 vector source
     */
    this.newFeatureLayer = function(options) {
        var sourceOptions = createBasicSourceOptions(options);
        var layer = new ol.layer.Vector({
            source: new ol.source.Vector(sourceOptions)
        });
        return applyLayerProperties(layer, options);
    };

    this.$get = [function() {
        return self;
    }];
}]);

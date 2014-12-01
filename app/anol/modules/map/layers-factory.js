angular.module('anol.map')

/**
 * @ngdoc object
 * @name anol.map.LayersFactoryProvider
 *
 * @description
 * Provide functions for creating ol3 layers with source for common
 * use cases
 */

// TODO think about a better solution to provide layer objects
.provider('LayersFactory', [function() {
    var self = this;

    // prepares ol.source with common source opitons
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

    // adds common properties to ol.layer
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
     * @ngdoc method
     * @name newTMS
     * @methodOf anol.map.LayersFactoryProvider
     * @param {Object} options
     * - **baseURL** - {string} - Layers base url
     * - **format ** - {string} - Tile image format
     * - **extent** - {Array.<number>} - Layer extent
     * - **resolutions** - {Array.<number>} - Layer resolutions
     * - **projection** - {Object} - Layer projection (ol.proj.Projection)
     * - **attributions** - {Array.<string>|string} - Layer attributions
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **isBackground** - {boolean} - Layer is a background layer
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Tile with ol.source.TileImage
     *
     * @description
     * Creates a TMS layer
     */
    /**
     * @ngdoc method
     * @name newTMS
     * @methodOf anol.map.LayersFactory
     * @param {Object} options
     * - **baseURL** - {string} - Layers base url
     * - **format ** - {string} - Tile image format
     * - **extent** - {Array.<number>} - Layer extent
     * - **resolutions** - {Array.<number>} - Layer resolutions
     * - **projection** - {Object} - Layer projection (ol.proj.Projection)
     * - **attributions** - {Array.<string>|string} - Layer attributions
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **isBackground** - {boolean} - Layer is a background layer
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Tile with ol.source.TileImage
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
     * @ngdoc method
     * @name newDynamicGeoJSON
     * @methodOf anol.map.LayersFactoryProvider
     * @param {Object} options
     * - **url** - {string} - source url
     * - **additionalParameters** - {Function} - function must return a list of parameters to add to the source url for each request
     * - **projection** - {Object} - Layer projection
     * - **style** - {Object} - Layer style
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Vector with ol.source.ServerVector
     *
     * @description
     * Creates a DynamicGeoJSON layer
     * This layer calls its source url when map extent changes and loads geojson-objects.
     * Loaded objects are styled by given style or by ol3 default style if no style given.
     */
    /**
     * @ngdoc method
     * @name newDynamicGeoJSON
     * @methodOf anol.map.LayersFactory
     * @param {Object} options
     * - **url** - {string} - source url
     * - **additionalParameters** - {Function} - function must return a list of parameters to add to the source url for each request
     * - **projection** - {Object} - Layer projection
     * - **style** - {Object} - Layer style
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Vector with ol.source.ServerVector
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

    /**
     * @ngdoc method
     * @name newGeoJSON
     * @methodOf anol.map.LayersFactoryProvider
     * @param {Object} options
     * - **url** - {string} - url of geojson file
     * - **projection** - {Object} - Layer projection
     * - **style** - {Object} - Layer style
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Vector with ol.source.GeoJSON
     *
     * @description
     * Create a vector lyer including all geometries from given geojson file
     */
    /**
     * @ngdoc method
     * @name newGeoJSON
     * @methodOf anol.map.LayersFactory
     * @param {Object} options
     * - **url** - {string} - url of geojson file
     * - **projection** - {Object} - Layer projection
     * - **style** - {Object} - Layer style
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Vector with ol.source.GeoJSON
     *
     * @description
     * Create a vector lyer including all geometries from given geojson file
     */
    this.newGeoJSON = function(options) {
        var sourceOptions = createBasicSourceOptions(options);
        sourceOptions.url = options.url;
        var source = new ol.source.GeoJSON(sourceOptions);
        var layer = new ol.layer.Vector({
            source: source
        });

        return applyLayerProperties(layer, options);
    };

    /**
     * @ngdoc method
     * @name newSingleTileWMS
     * @methodOf anol.map.LayersFactoryProvider
     * @param {Object} options
     * - **url** - {string} - source url
     * - **params** - {Object} - wms parameter
     * - **projection** - {Object} - Layer projection
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Image with ol.source.ImageWMS
     *
     * @description
     * Creates a SingleTileWMS layer
     */
    /**
     * @ngdoc method
     * @name newSingleTileWMS
     * @methodOf anol.map.LayersFactory
     * @param {Object} options
     * - **url** - {string} - source url
     * - **params** - {Object} - wms parameter
     * - **projection** - {Object} - Layer projection
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Image with ol.source.ImageWMS
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
     * @ngdoc method
     * @name newFeatureLayer
     * @methodOf anol.map.LayersFactoryProvider
     * @param {Object} options
     * - **projection** - {Object} - Layer projection
     * - **style** - {Object} - Layer style
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Vector with ol.source.Vector
     *
     * @description
     * Creates a FeatureLayer layer
     * FeatureLayer is a ol3 vector layer with an ol3 vector source
     */
    /**
     * @ngdoc method
     * @name newFeatureLayer
     * @methodOf anol.map.LayersFactory
     * @param {Object} options
     * - **projection** - {Object} - Layer projection
     * - **style** - {Object} - Layer style
     * - **title** - {string} - Layer title
     * - **shortcut** - {string} - Layer shortcut
     * - **visible** - {boolean} - Initial layer visibility
     * - **displayInLayerswitcher** - {boolean} - Layer should apear in layerswitcher
     * - **layer** - {string} - Layer name
     *
     * @returns {Object} ol.layer.Vector with ol.source.Vector
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
        /**
         * @ngdoc service
         * @name anol.map.LayersFactory
         *
         * @description
         * Provide functions for creating ol3 layers with source for common
         * use cases
         */
        return self;
    }];
}]);

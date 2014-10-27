angular.module('anol.map')
// TODO think about a better solution to provide layer objects
.provider('LayersFactory', [function() {
    var self = this;

    var createBasicSourceOptions = function(options) {
        var sourceOptions = {};
        if(options.projection !== undefined) {
            sourceOptions.projection = options.projection;
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
        return layer;
    };

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

        if(options.atrtibution !== undefined) {
            sourceOptions.attributions = options.attributions;
        }

        var layer = new ol.layer.Tile({
            source: new ol.source.TileImage(sourceOptions)
        });

        return applyLayerProperties(layer, options);
    };

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
                source.addFeatures(source.readFeatures(response));
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

    this.newSingleTileWMS = function(options) {
        var sourceOptions = createBasicSourceOptions(options);
        sourceOptions.url = options.url;
        sourceOptions.params = options.params;

        var layer = new ol.layer.Image({source: new ol.source.ImageWMS(sourceOptions)});
        return applyLayerProperties(layer, options);
    };

    this.$get = [function() {
        return self;
    }];
}]);

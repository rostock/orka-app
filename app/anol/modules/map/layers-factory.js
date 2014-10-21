angular.module('anol.map')
.provider('LayersFactory', [function() {
    var self = this;

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

        var sourceOptions = {
            tileUrlFunction: tileURL
        };

        if(tileGrid) {
            sourceOptions.tileGrid = tileGrid;
        }
        if(options.projection !== undefined) {
            sourceOptions.projection = options.projection;
        }
        if(options.atrtibution !== undefined) {
            sourceOptions.attributions = options.attributions;
        }

        return new ol.layer.Tile({
            source: new ol.source.TileImage(sourceOptions)
        });
    };

    this.newDynamicGeoJSON = function(options) {
        var source;
        var sourceOptions = {
            format: new ol.format.GeoJSON(),
            strategy: ol.loadingstrategy.bbox
        };
        if(options.projection !== undefined) {
            sourceOptions.projection = options.projection;
        }

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

        sourceOptions.loader = loader;

        source = new ol.source.ServerVector(sourceOptions);

        return new ol.layer.Vector({
            source: source
        });
    };

    this.$get = [function() {
        return self;
    }];
}]);

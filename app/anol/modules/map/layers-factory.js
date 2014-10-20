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

    this.$get = [function() {
        return self;
    }];
}]);

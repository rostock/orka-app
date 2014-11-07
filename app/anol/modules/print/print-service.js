angular.module('anol.print')

.provider('PrintService', [function() {
    // Better move directive configuration in directive so
    // direcitve can be replaced by custom one?
    var _pageSizes, _outputFormats, _defaultScale, _createDownloadUrl, _checkDownloadUrl, _checkDownloadDelay;

    this.setPageSizes = function(pageSizes) {
        _pageSizes = pageSizes;
    };
    this.setOutputFormats = function(outputFormats) {
        _outputFormats = outputFormats;
    };
    this.setDefaultScale = function(scale) {
        _defaultScale = scale;
    };
    this.setCreateDownloadUrl = function(url) {
        _createDownloadUrl = url;
    };
    this.setCheckDownloadUrl = function(url) {
        _checkDownloadUrl = url;
    };
    this.setCheckDownloadDelay = function(delay) {
        _checkDownloadDelay = delay;
    };

    this.$get = ['$rootScope', '$q', '$http', '$timeout', 'MapService', 'LayersService', 'LayersFactory', 'InteractionsService', function($rootScope, $q, $http, $timeout, MapService, LayersService, LayersFactory, InteractionsService) {
        var _modify;
        var _printArea;
        var _dragFeatures = {
            top: undefined,
            lefttop: undefined,
            left: undefined,
            leftbottom: undefined,
            bottom: undefined,
            rightbottom: undefined,
            right: undefined,
            righttop: undefined,
            center: undefined
        };
        var _modifyFeatures = new ol.Collection();

        var _printLayer = LayersFactory.newFeatureLayer({
            'title': 'PrintLayer',
            'displayInLayerswitcher': false
        });
        var _printSource = _printLayer.getSource();
        LayersService.addLayer(_printLayer);

        var Print = function(createDownloadUrl, checkDownloadUrl, checkDownloadDelay, pageSizes, outputFormats, defaultScale) {
            this.createDownloadUrl = createDownloadUrl;
            this.checkDownloadUrl = checkDownloadUrl;
            this.checkDownloadDelay = checkDownloadDelay;
            this.pageSizes = pageSizes;
            this.outputFormats = outputFormats;
            this.defaultScale = defaultScale;
            this.currentPageSize = undefined;
            this.currentScale = undefined;
        };
        Print.prototype.createPrintArea = function(pageSize, scale, center) {
            this.currentPageSize = pageSize;
            this.currentScale = scale;
            this.mapWidth = this.currentPageSize[0] / 1000 * this.currentScale;
            this.mapHeight = this.currentPageSize[1] / 1000 * this.currentScale;

            var view = MapService.getMap().getView();
            center = center || view.getCenter();
            var top = center[1] + (this.mapHeight / 2);
            var bottom = center[1] - (this.mapHeight / 2);
            var left = center[0] - (this.mapWidth / 2);
            var right = center[0] + (this.mapWidth / 2);

            _printSource.clear();
            _printArea = undefined;
            this.updatePrintArea(left, top, right, bottom);
            this.createDragFeatures(left, top, right, bottom, center);
        };
        Print.prototype.createDragFeatures = function(left, top, right, bottom, center) {
            _modifyFeatures.clear();

            // TOTO refactor
            _dragFeatures.left = new ol.Feature(new ol.geom.Point([left, center[1]]));
            _dragFeatures.left.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.left);

            _dragFeatures.right = new ol.Feature(new ol.geom.Point([right, center[1]]));
            _dragFeatures.right.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.right);

            _dragFeatures.top = new ol.Feature(new ol.geom.Point([center[0], top]));
            _dragFeatures.top.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.top);

            _dragFeatures.bottom = new ol.Feature(new ol.geom.Point([center[0], bottom]));
            _dragFeatures.bottom.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.bottom);

            _dragFeatures.leftbottom = new ol.Feature(new ol.geom.Point([left, bottom]));
            _dragFeatures.leftbottom.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.leftbottom);

            _dragFeatures.lefttop = new ol.Feature(new ol.geom.Point([left, top]));
            _dragFeatures.lefttop.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.lefttop);

            _dragFeatures.rightbottom = new ol.Feature(new ol.geom.Point([right, bottom]));
            _dragFeatures.rightbottom.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.rightbottom);

            _dragFeatures.righttop = new ol.Feature(new ol.geom.Point([right, top]));
            _dragFeatures.righttop.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.righttop);

            _dragFeatures.center = new ol.Feature(new ol.geom.Point(center));
            _dragFeatures.center.on('change', this.dragFeatureCenterChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.center);

            _printSource.addFeatures(_modifyFeatures.getArray());

            if(_modify !== undefined) {
                InteractionsService.removeInteraction(_modify);
            }
            _modify = new ol.interaction.Modify({features: _modifyFeatures});

            InteractionsService.addInteraction(_modify);
        };
        Print.prototype.updateDragFeatures = function(currentFeature) {
            var self = this;
            var edgePoints = _printArea.getGeometry().getCoordinates()[0];
            var left = edgePoints[0][0];
            var right = edgePoints[1][0];
            var top = edgePoints[0][1];
            var bottom = edgePoints[2][1];
            var center = _printArea.getGeometry().getInteriorPoint().getCoordinates();

            var updateFeature = function(dragFeature, currentFeature, coords, handler) {
                // TODO remove modify when we can
                dragFeature.un('change', handler, self);
                if(dragFeature !== currentFeature) {
                    _modifyFeatures.remove(dragFeature);
                    dragFeature.getGeometry().setCoordinates(coords);
                    _modifyFeatures.push(dragFeature);
                }
                dragFeature.on('change', handler, self);
            };

            updateFeature(_dragFeatures.left, currentFeature, [left, center[1]], this.dragFeatureNormalChangeHandler);
            updateFeature(_dragFeatures.bottom, currentFeature, [center[0], bottom], this.dragFeatureNormalChangeHandler);
            updateFeature(_dragFeatures.right, currentFeature, [right, center[1]], this.dragFeatureNormalChangeHandler);
            updateFeature(_dragFeatures.top, currentFeature, [center[0], top], this.dragFeatureNormalChangeHandler);

            updateFeature(_dragFeatures.leftbottom, currentFeature, [left, bottom], this.dragFeatureDiagonalChangeHandler);
            updateFeature(_dragFeatures.rightbottom, currentFeature, [right, bottom], this.dragFeatureDiagonalChangeHandler);
            updateFeature(_dragFeatures.righttop, currentFeature, [right, top], this.dragFeatureDiagonalChangeHandler);
            updateFeature(_dragFeatures.lefttop, currentFeature, [left, top], this.dragFeatureDiagonalChangeHandler);

            updateFeature(_dragFeatures.center, currentFeature, center, this.dragFeatureCenterChangeHandler);
        };

        Print.prototype.dragFeatureNormalChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaNormal();
            this.updateDragFeatures(currentFeature);
            this.updatePrintSize();
        };

        Print.prototype.dragFeatureDiagonalChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaDiagonal(currentFeature);
            this.updateDragFeatures(currentFeature);
            this.updatePrintSize();
        };
        Print.prototype.dragFeatureCenterChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaCenter(currentFeature);
            this.updateDragFeatures(currentFeature);
        };
        Print.prototype.updatePrintAreaDiagonal = function(currentFeature) {
            var lefttop, righttop, leftbottom, rightbottom;
            if(_dragFeatures.lefttop === currentFeature || _dragFeatures.rightbottom === currentFeature) {
                lefttop = _dragFeatures.lefttop.getGeometry().getCoordinates();
                rightbottom = _dragFeatures.rightbottom.getGeometry().getCoordinates();
                this.updatePrintArea(lefttop[0], lefttop[1], rightbottom[0], rightbottom[1]);
            } else {
                righttop = _dragFeatures.righttop.getGeometry().getCoordinates();
                leftbottom = _dragFeatures.leftbottom.getGeometry().getCoordinates();
                this.updatePrintArea(leftbottom[0], righttop[1], righttop[0], leftbottom[1]);
            }
        };
        Print.prototype.updatePrintAreaNormal = function() {
            var left = _dragFeatures.left.getGeometry().getCoordinates()[0];
            var right = _dragFeatures.right.getGeometry().getCoordinates()[0];
            var top = _dragFeatures.top.getGeometry().getCoordinates()[1];
            var bottom = _dragFeatures.bottom.getGeometry().getCoordinates()[1];

            this.updatePrintArea(left, top, right, bottom);
        };
        Print.prototype.updatePrintAreaCenter = function(currentFeature) {
            var center = currentFeature.getGeometry().getCoordinates();
            var top = center[1] + (this.mapHeight / 2);
            var bottom = center[1] - (this.mapHeight / 2);
            var left = center[0] - (this.mapWidth / 2);
            var right = center[0] + (this.mapWidth / 2);
            this.updatePrintArea(left, top, right, bottom);
        };
        Print.prototype.updatePrintArea = function(left, top, right, bottom) {
            var coords = [[
                [left, top],
                [right, top],
                [right, bottom],
                [left, bottom],
                [left, top]
            ]];

            if(_printArea !== undefined) {
                _printSource.removeFeature(_printArea);
            }
            _printArea = new ol.Feature(new ol.geom.Polygon(coords));
            _printSource.addFeatures([_printArea]);
        };
        Print.prototype.updatePrintSize = function() {
            var self = this;
            $rootScope.$apply(function() {
                self.mapWidth = _dragFeatures.right.getGeometry().getCoordinates()[0] - _dragFeatures.left.getGeometry().getCoordinates()[0];
                self.mapHeight = _dragFeatures.top.getGeometry().getCoordinates()[1] - _dragFeatures.bottom.getGeometry().getCoordinates()[1];
                self.currentPageSize = [
                    self.mapWidth * 1000 / self.currentScale,
                    self.mapHeight * 1000 / self.currentScale
                ];
            });
        };
        Print.prototype.addFeatureFromPageSize = function(pageSize, scale) {
            if(_printArea === undefined) {
                this.createPrintArea(pageSize, scale);
            } else {
                this.createPrintArea(pageSize, scale, _printArea.getGeometry().getInteriorPoint().getCoordinates());
            }
        };
        // TODO move into orka namespace
        Print.prototype.createDownload = function(format, layer, streetIndex, poiTypes, trackTypes) {
            var self = this;
            var bounds = [];
            bounds = bounds.concat(_dragFeatures.leftbottom.getGeometry().getCoordinates());
            bounds = bounds.concat(_dragFeatures.righttop.getGeometry().getCoordinates());

            var data = {
                bbox: bounds.join(','),
                scale: self.currentScale,
                format: format,
                layer: layer,
                params: {
                    'street_index': streetIndex,
                    'poi_types': poiTypes.length === 0 ? false : poiTypes.join(','),
                    'track_types': trackTypes.length === 0 ? false : trackTypes.join(','),
                }
            };

            var deferred = $q.defer();

            // promise with "success" and "error" methods (specific to $http)
            var createPromise = $http.post(self.createDownloadUrl, data);
            createPromise.success(function(data, status, headers, config) {
                var checkPromise = self.checkDownload(data.status_url);
                checkPromise.then(function(url) {
                    deferred.resolve(url);
                });
            });
            createPromise.error(function(data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        };
        // TODO move into orka namespace
        Print.prototype.checkDownload = function(statusUrl) {
            var self = this;
            var deferred = $q.defer();

            var wrapper = function() {
                var checkPromise = $http.get(self.checkDownloadUrl + statusUrl);
                checkPromise.success(function(data, status, headers, config) {

                    if(data.status !== 'done') {
                        $timeout(wrapper, self.checkDownloadDelay);
                    } else {
                        deferred.resolve(data.url);
                    }
                });
            };
            wrapper();
            return deferred.promise;
        };
        return new Print(_createDownloadUrl, _checkDownloadUrl, _checkDownloadDelay, _pageSizes, _outputFormats, _defaultScale);
    }];
}]);

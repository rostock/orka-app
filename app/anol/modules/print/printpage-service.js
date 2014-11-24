angular.module('anol.print', [])

.provider('PrintPageService', [function() {
    // Better move directive configuration in directive so
    // direcitve can be replaced by custom one?
    var _pageSizes, _outputFormats, _defaultScale;

    this.setPageSizes = function(pageSizes) {
        _pageSizes = pageSizes;
    };
    this.setOutputFormats = function(outputFormats) {
        _outputFormats = outputFormats;
    };
    this.setDefaultScale = function(scale) {
        _defaultScale = scale;
    };

    this.$get = ['$rootScope', 'MapService', 'LayersService', 'LayersFactory', 'InteractionsService', function($rootScope, MapService, LayersService, LayersFactory, InteractionsService) {
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

        var PrintPage = function(pageSizes, outputFormats, defaultScale) {
            this.pageSizes = pageSizes;
            this.outputFormats = outputFormats;
            this.defaultScale = defaultScale;
            this.currentPageSize = undefined;
            this.currentScale = undefined;
        };
        PrintPage.prototype.createPrintArea = function(pageSize, scale, center) {
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
        PrintPage.prototype.createDragFeatures = function(left, top, right, bottom, center) {
            _modifyFeatures.clear();

            // TOTO refactor
            _dragFeatures.left = new ol.Feature(new ol.geom.Point([left, center[1]]));
            _dragFeatures.left.set('position', 'left');
            _dragFeatures.left.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.left);

            _dragFeatures.right = new ol.Feature(new ol.geom.Point([right, center[1]]));
            _dragFeatures.right.set('position', 'right');
            _dragFeatures.right.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.right);

            _dragFeatures.top = new ol.Feature(new ol.geom.Point([center[0], top]));
            _dragFeatures.top.set('position', 'top');
            _dragFeatures.top.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.top);

            _dragFeatures.bottom = new ol.Feature(new ol.geom.Point([center[0], bottom]));
            _dragFeatures.bottom.set('position', 'bottom');
            _dragFeatures.bottom.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.bottom);

            _dragFeatures.leftbottom = new ol.Feature(new ol.geom.Point([left, bottom]));
            _dragFeatures.leftbottom.set('position', 'leftbottom');
            _dragFeatures.leftbottom.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.leftbottom);

            _dragFeatures.lefttop = new ol.Feature(new ol.geom.Point([left, top]));
            _dragFeatures.lefttop.set('position', 'lefttop');
            _dragFeatures.lefttop.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.lefttop);

            _dragFeatures.rightbottom = new ol.Feature(new ol.geom.Point([right, bottom]));
            _dragFeatures.rightbottom.set('position', 'rightbottom');
            _dragFeatures.rightbottom.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.rightbottom);

            _dragFeatures.righttop = new ol.Feature(new ol.geom.Point([right, top]));
            _dragFeatures.righttop.set('position', 'righttop');
            _dragFeatures.righttop.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.righttop);

            _dragFeatures.center = new ol.Feature(new ol.geom.Point(center));
            _dragFeatures.center.set('position', 'center');
            _dragFeatures.center.on('change', this.dragFeatureCenterChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.center);

            _printSource.addFeatures(_modifyFeatures.getArray());

            if(_modify !== undefined) {
                InteractionsService.removeInteraction(_modify);
            }
            _modify = new ol.interaction.Modify({features: _modifyFeatures});

            InteractionsService.addInteraction(_modify);
        };
        PrintPage.prototype.updateDragFeatures = function(currentFeature) {
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

        PrintPage.prototype.dragFeatureNormalChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaNormal();
            this.updateDragFeatures(currentFeature);
            this.updatePrintSize();
        };

        PrintPage.prototype.dragFeatureDiagonalChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaDiagonal(currentFeature);
            this.updateDragFeatures(currentFeature);
            this.updatePrintSize();
        };
        PrintPage.prototype.dragFeatureCenterChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaCenter(currentFeature);
            this.updateDragFeatures(currentFeature);
        };
        PrintPage.prototype.updatePrintAreaDiagonal = function(currentFeature) {
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
        PrintPage.prototype.updatePrintAreaNormal = function() {
            var left = _dragFeatures.left.getGeometry().getCoordinates()[0];
            var right = _dragFeatures.right.getGeometry().getCoordinates()[0];
            var top = _dragFeatures.top.getGeometry().getCoordinates()[1];
            var bottom = _dragFeatures.bottom.getGeometry().getCoordinates()[1];

            this.updatePrintArea(left, top, right, bottom);
        };
        PrintPage.prototype.updatePrintAreaCenter = function(currentFeature) {
            var center = currentFeature.getGeometry().getCoordinates();
            var top = center[1] + (this.mapHeight / 2);
            var bottom = center[1] - (this.mapHeight / 2);
            var left = center[0] - (this.mapWidth / 2);
            var right = center[0] + (this.mapWidth / 2);
            this.updatePrintArea(left, top, right, bottom);
        };
        PrintPage.prototype.updatePrintArea = function(left, top, right, bottom) {
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
        PrintPage.prototype.updatePrintSize = function() {
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
        PrintPage.prototype.addFeatureFromPageSize = function(pageSize, scale) {
            if(_printArea === undefined) {
                this.createPrintArea(pageSize, scale);
            } else {
                this.createPrintArea(pageSize, scale, _printArea.getGeometry().getInteriorPoint().getCoordinates());
            }
        };
        PrintPage.prototype.getBounds = function() {
            var bounds = [];
            bounds = bounds.concat(_dragFeatures.leftbottom.getGeometry().getCoordinates());
            bounds = bounds.concat(_dragFeatures.righttop.getGeometry().getCoordinates());
            return bounds;
        };
        
        return new PrintPage(_pageSizes, _outputFormats, _defaultScale);
    }];
}]);

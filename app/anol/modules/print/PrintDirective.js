angular.module('anol.print', [])

.provider('PrintService', [function() {
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

    this.$get = ['$rootScope', 'MapService', 'LayersService', 'InteractionsService', function($rootScope, MapService, LayersService, InteractionsService) {
        var modify;
        var printArea;
        var dragFeatures = {
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
        var modifyFeatures = new ol.Collection();
        // create print layer
        // TODO create FeatureLayer or something like that to layers factory
        var printSource = new ol.source.Vector();
        var printLayer = new ol.layer.Vector({
            source: printSource
        });
        printLayer.set('title', 'PrintLayer');

        LayersService.addLayer(printLayer);

        var Print = function(pageSizes, outputFormats, defaultScale) {
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

            printSource.clear();
            this.updatePrintArea(left, top, right, bottom);
            this.createDragFeatures(left, top, right, bottom, center);
        };
        Print.prototype.createDragFeatures = function(left, top, right, bottom, center) {
            modifyFeatures.clear();

            // TOTO refactor
            dragFeatures.left = new ol.Feature(new ol.geom.Point([left, center[1]]));
            dragFeatures.left.on('change', this.dragFeatureNormalChangeHandler, this);
            modifyFeatures.push(dragFeatures.left);

            dragFeatures.right = new ol.Feature(new ol.geom.Point([right, center[1]]));
            dragFeatures.right.on('change', this.dragFeatureNormalChangeHandler, this);
            modifyFeatures.push(dragFeatures.right);

            dragFeatures.top = new ol.Feature(new ol.geom.Point([center[0], top]));
            dragFeatures.top.on('change', this.dragFeatureNormalChangeHandler, this);
            modifyFeatures.push(dragFeatures.top);

            dragFeatures.bottom = new ol.Feature(new ol.geom.Point([center[0], bottom]));
            dragFeatures.bottom.on('change', this.dragFeatureNormalChangeHandler, this);
            modifyFeatures.push(dragFeatures.bottom);

            dragFeatures.leftbottom = new ol.Feature(new ol.geom.Point([left, bottom]));
            dragFeatures.leftbottom.on('change', this.dragFeatureDiagonalChangeHandler, this);
            modifyFeatures.push(dragFeatures.leftbottom);

            dragFeatures.lefttop = new ol.Feature(new ol.geom.Point([left, top]));
            dragFeatures.lefttop.on('change', this.dragFeatureDiagonalChangeHandler, this);
            modifyFeatures.push(dragFeatures.lefttop);

            dragFeatures.rightbottom = new ol.Feature(new ol.geom.Point([right, bottom]));
            dragFeatures.rightbottom.on('change', this.dragFeatureDiagonalChangeHandler, this);
            modifyFeatures.push(dragFeatures.rightbottom);

            dragFeatures.righttop = new ol.Feature(new ol.geom.Point([right, top]));
            dragFeatures.righttop.on('change', this.dragFeatureDiagonalChangeHandler, this);
            modifyFeatures.push(dragFeatures.righttop);

            dragFeatures.center = new ol.Feature(new ol.geom.Point(center));
            modifyFeatures.push(dragFeatures.center);

            printSource.addFeatures(modifyFeatures.getArray());

            if(modify !== undefined) {
                InteractionsService.removeInteraction(modify);
            }
            modify = new ol.interaction.Modify({features: modifyFeatures});

            InteractionsService.addInteraction(modify);
        };
        Print.prototype.updateDragFeatures = function(currentFeature) {
            var self = this;
            var edgePoints = printArea.getGeometry().getCoordinates()[0];
            var left = edgePoints[0][0];
            var right = edgePoints[1][0];
            var top = edgePoints[0][1];
            var bottom = edgePoints[2][1];
            var center = printArea.getGeometry().getInteriorPoint().getCoordinates();

            var updateFeature = function(dragFeature, currentFeature, coords, handler) {
                // TODO remove modify when we can
                dragFeature.un('change', handler, self);
                if(dragFeature !== currentFeature) {
                    modifyFeatures.remove(dragFeature);
                    dragFeature.getGeometry().setCoordinates(coords);
                    modifyFeatures.push(dragFeature);
                }
                dragFeature.on('change', handler, self);
            };

            updateFeature(dragFeatures.left, currentFeature, [left, center[1]], this.dragFeatureNormalChangeHandler);
            updateFeature(dragFeatures.bottom, currentFeature, [center[0], bottom], this.dragFeatureNormalChangeHandler);
            updateFeature(dragFeatures.right, currentFeature, [right, center[1]], this.dragFeatureNormalChangeHandler);
            updateFeature(dragFeatures.top, currentFeature, [center[0], top], this.dragFeatureNormalChangeHandler);

            updateFeature(dragFeatures.leftbottom, currentFeature, [left, bottom], this.dragFeatureDiagonalChangeHandler);
            updateFeature(dragFeatures.rightbottom, currentFeature, [right, bottom], this.dragFeatureDiagonalChangeHandler);
            updateFeature(dragFeatures.righttop, currentFeature, [right, top], this.dragFeatureDiagonalChangeHandler);
            updateFeature(dragFeatures.lefttop, currentFeature, [left, top], this.dragFeatureDiagonalChangeHandler);

            updateFeature(dragFeatures.center, currentFeature, center, this.dragFeatureNormalChangeHandler);
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
        Print.prototype.updatePrintAreaDiagonal = function(currentFeature) {
            var lefttop, righttop, leftbottom, rightbottom;
            if(dragFeatures.lefttop === currentFeature || dragFeatures.rightbottom === currentFeature) {
                lefttop = dragFeatures.lefttop.getGeometry().getCoordinates();
                rightbottom = dragFeatures.rightbottom.getGeometry().getCoordinates();
                this.updatePrintArea(lefttop[0], lefttop[1], rightbottom[0], rightbottom[1]);
            } else {
                righttop = dragFeatures.righttop.getGeometry().getCoordinates();
                leftbottom = dragFeatures.leftbottom.getGeometry().getCoordinates();
                this.updatePrintArea(leftbottom[0], righttop[1], righttop[0], leftbottom[1]);
            }
        };
        Print.prototype.updatePrintAreaNormal = function() {
            var left = dragFeatures.left.getGeometry().getCoordinates()[0];
            var right = dragFeatures.right.getGeometry().getCoordinates()[0];
            var top = dragFeatures.top.getGeometry().getCoordinates()[1];
            var bottom = dragFeatures.bottom.getGeometry().getCoordinates()[1];

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

            if(printArea !== undefined) {
                printSource.removeFeature(printArea);
            }
            printArea = new ol.Feature(new ol.geom.Polygon(coords));
            printSource.addFeatures([printArea]);
        };
        Print.prototype.updatePrintSize = function() {
            var self = this;
            $rootScope.$apply(function() {
                self.currentPageSize = [
                    (dragFeatures.right.getGeometry().getCoordinates()[0] - dragFeatures.left.getGeometry().getCoordinates()[0]) * 1000 / self.currentScale,
                    (dragFeatures.top.getGeometry().getCoordinates()[1] - dragFeatures.bottom.getGeometry().getCoordinates()[1]) * 1000 / self.currentScale
                ];
            });
        };
        Print.prototype.addFeatureFromPageSize = function(pageSize, scale) {
            if(printArea === undefined) {
                this.createPrintArea(pageSize, scale);
            } else {
                this.createPrintArea(pageSize, scale, printArea.getGeometry().getInteriorPoint().getCoordinates());
            }
        };
        return new Print(_pageSizes, _outputFormats, _defaultScale);
    }];
}])

.directive('anolPrint', ['PrintService', function(PrintService) {
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'anol/modules/print/templates/print.html',
        scope: {},
        link: function(scope, element, attrs) {
            scope.isPrintable = function() {
                return scope.pageSize !== undefined && scope.pageSize[0] !== undefined && scope.pageSize[1] !== undefined && scope.scale !== undefined;
            };
            scope.startPrint = function() {
                console.warn('Implement me');
            };
            scope.setPageSize = function(size) {
                scope.pageSize = angular.copy(size);
                scope.updatePrintLayer();
            };
            scope.updatePrintLayer = function() {
                if(scope.isPrintable()) {
                    PrintService.addFeatureFromPageSize(scope.pageSize, scope.scale);
                }
            };
            scope.resetPrintArea = function() {
                if(scope.isPrintable()) {
                    PrintService.createPrintArea(scope.pageSize, scope.scale);
                }
            };
        },
        controller: function($scope, $element, $attrs) {
            // if we assign pageSize = value in template angular put only a reverence
            // into scope.pageSize and typing somethink into width/height input fields
            // will result in modifying selected availablePageSize value

            $scope.isPageSize = function(size) {
                return angular.equals(size, $scope.pageSize);
            };

            $scope.outputFormats = PrintService.outputFormats;
            $scope.pageSizes = PrintService.pageSizes;
            $scope.scale = angular.copy(PrintService.defaultScale);

            $scope.outputFormat = $scope.outputFormats[0];

            $scope.$watch(
                function() {
                    return PrintService.currentPageSize;
                },
                function(newVal, oldVal) {
                    $scope.pageSize = newVal;
                }
            );
        }
    };
}]);

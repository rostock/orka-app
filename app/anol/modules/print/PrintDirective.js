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
        Print.prototype.createPrintArea = function(pageSize, scale) {
            this.currentPageSize = pageSize;
            this.currentScale = scale;
            this.mapWidth = this.currentPageSize[0] / 1000 * this.currentScale;
            this.mapHeight = this.currentPageSize[1] / 1000 * this.currentScale;

            var view = MapService.getMap().getView();

            dragFeatures.center = new ol.Feature(new ol.geom.Point(view.getCenter()));

            this.createDragFeatures();
            this.updatePrintArea(pageSize, scale);

            var featureList = [dragFeatures.left,
                dragFeatures.lefttop,
                dragFeatures.top,
                dragFeatures.righttop,
                dragFeatures.right,
                dragFeatures.rightbottom,
                dragFeatures.bottom,
                dragFeatures.leftbottom,
                dragFeatures.center
            ];
            printSource.addFeatures(featureList);

            if(modify !== undefined) {
                InteractionsService.removeInteraction(modify);
            }
            modify = new ol.interaction.Modify({features: new ol.Collection(featureList)});

            InteractionsService.addInteraction(modify);
        };
        Print.prototype.createDragFeatures = function() {
            var center = dragFeatures.center.getGeometry().getCoordinates();
            var top = center[1] + (this.mapHeight / 2);
            var bottom = center[1] - (this.mapHeight / 2);
            var left = center[0] - (this.mapWidth / 2);
            var right = center[0] + (this.mapWidth / 2);

            dragFeatures.left = new ol.Feature(new ol.geom.Point([left, center[1]]));
            dragFeatures.left.on('change', this.updateLeft, this);
            dragFeatures.leftbottom = new ol.Feature(new ol.geom.Point([left, bottom]));
            dragFeatures.leftbottom.on('change', this.updateLeftbottom, this);
            dragFeatures.lefttop = new ol.Feature(new ol.geom.Point([left, top]));
            dragFeatures.lefttop.on('change', this.updateLefttop, this);


            dragFeatures.top = new ol.Feature(new ol.geom.Point([center[0], top]));
            dragFeatures.righttop = new ol.Feature(new ol.geom.Point([right, top]));
            dragFeatures.right = new ol.Feature(new ol.geom.Point([right, center[1]]));
            dragFeatures.rightbottom = new ol.Feature(new ol.geom.Point([right, bottom]));
            dragFeatures.bottom = new ol.Feature(new ol.geom.Point([center[0], bottom]));

        };

        Print.prototype.updateLeft = function(evt) {
            var leftCoords = evt.target.getGeometry().getCoordinates();

            var lefttop = dragFeatures.lefttop;
            var leftbottom = dragFeatures.leftbottom;

            lefttop.un('change', this.updateLefttop, this);
            leftbottom.un('change', this.updateLeftbottom, this);

            lefttop.getGeometry().setCoordinates([leftCoords[0], lefttop.getGeometry().getCoordinates()[1]]);
            leftbottom.getGeometry().setCoordinates([leftCoords[0], leftbottom.getGeometry().getCoordinates()[1]]);

            lefttop.on('change', this.updateLefttop, this);
            leftbottom.on('change', this.updateLeftbottom, this);

            this.updatePrintArea();
            this.updatePrintSize();

        };
        Print.prototype.updateLefttop = function(evt) {
            var coords = evt.target.getGeometry().getCoordinates();
            console.log('lefttop changed to', coords);
        };
        Print.prototype.updateTop = function(evt) {
            var coords = evt.target.getGeometry().getCoordinates();
            console.log('top changed to', coords);
        };
        Print.prototype.updateRighttop = function(evt) {
            var coords = evt.target.getGeometry().getCoordinates();
            console.log('righttop changed to', coords);
        };
        Print.prototype.updateRight = function(evt) {
            var coords = evt.target.getGeometry().getCoordinates();
            console.log('right changed to', coords);
        };
        Print.prototype.updateRightbottom = function(evt) {
            var coords = evt.target.getGeometry().getCoordinates();
            console.log('rightbottom changed to', coords);
        };
        Print.prototype.updateBottom = function(evt) {
            var coords = evt.target.getGeometry().getCoordinates();
            console.log('bottom changed to', coords);
        };
        Print.prototype.updateLeftbottom = function(evt) {
            var coords = evt.target.getGeometry().getCoordinates();
            console.log('leftbottm changed to', coords);
        };
        Print.prototype.updateCenter = function(evt) {
            var coords = evt.target.getGeometry().getCoordinates();
            console.log('center changed to', coords);
        };
        Print.prototype.updatePrintArea = function(pageSize, scale) {
            var coords = [[
                dragFeatures.lefttop.getGeometry().getCoordinates(),
                dragFeatures.righttop.getGeometry().getCoordinates(),
                dragFeatures.rightbottom.getGeometry().getCoordinates(),
                dragFeatures.leftbottom.getGeometry().getCoordinates(),
                dragFeatures.lefttop.getGeometry().getCoordinates()
            ]];

            if(this.printArea !== undefined) {
                printSource.removeFeature(this.printArea);
            }

            this.printArea = new ol.Feature(new ol.geom.Polygon(coords));

            printSource.addFeatures([this.printArea]);
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
            if(this.printArea === undefined) {
                this.createPrintArea(pageSize, scale);
            } else {
                this.updatePrintArea(pageSize, scale);
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

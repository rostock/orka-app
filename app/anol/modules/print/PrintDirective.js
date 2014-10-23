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

    this.$get = ['MapService', 'LayersService', function(MapService, LayersService) {
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
            this.printArea = undefined;
            this.printAreaCenter = undefined;
        };
        Print.prototype.createPrintArea = function(pageSize, scale) {
            var view = MapService.getMap().getView();
            this.printAreaCenter = view.getCenter();
            this.updatePrintArea(pageSize, scale);
        };
        Print.prototype.updatePrintArea = function(pageSize, scale) {
            var mapWidth = pageSize[0] / 1000 * scale;
            var mapHeight = pageSize[1] / 1000 * scale;

            var top = this.printAreaCenter[1] + (mapHeight / 2);
            var bottom = this.printAreaCenter[1] - (mapHeight / 2);
            var left = this.printAreaCenter[0] - (mapWidth / 2);
            var right = this.printAreaCenter[0] + (mapWidth / 2);

            var coords = [[
                [left, bottom],
                [left, top],
                [right, top],
                [right, bottom],
                [left, bottom]
            ]];
            this.printArea = new ol.Feature(new ol.geom.Polygon(coords));
            printSource.clear();
            printSource.addFeature(this.printArea);
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
        }
    };
}]);

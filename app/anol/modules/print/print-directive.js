angular.module('anol.print', [])

.directive('anolPrint', ['PrintService', 'LayertreeService', 'LayersService', function(PrintService, LayertreeService, LayersService) {
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'anol/modules/print/templates/print.html',
        scope: {},
        link: function(scope, element, attrs) {
            scope.isPrintable = function() {
                // TODO refactor
                return scope.pageSize !== undefined && scope.pageSize[0] !== undefined && scope.pageSize[1] !== undefined && scope.scale !== undefined;
            };
            scope.startPrint = function() {
                scope.downloadUrl = false;
                var layerName;

                // TODO replace with LayersService.backgroundLayer if present in LayersService
                angular.forEach(LayersService.backgroundLayers, function(layer) {
                    if(layer.getVisible() && layerName === undefined) {
                        layerName = layer.get('layerName');
                    }
                });
                var downloadPromise = PrintService.createDownload(
                    scope.outputFormat.value,
                    layerName,
                    scope.streetIndex,
                    LayertreeService.selectedPoiTypes,
                    LayertreeService.selectedTrackTypes
                );

                downloadPromise.then(function(url) {
                    scope.downloadUrl = url;
                });
            };
            // if we assign pageSize = value in template angular put only a reverence
            // into scope.pageSize and typing somethink into width/height input fields
            // will result in modifying selected availablePageSize value
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
            $scope.isPageSize = function(size) {
                return angular.equals(size, $scope.pageSize);
            };

            $scope.outputFormats = PrintService.outputFormats;
            $scope.pageSizes = PrintService.pageSizes;
            $scope.scale = angular.copy(PrintService.defaultScale);
            $scope.streetIndex = false;
            $scope.licenceAgreed = false;
            $scope.downloadUrl = false;

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

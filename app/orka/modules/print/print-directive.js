angular.module('orka.print', [])

.directive('orkaPrint', ['ConfigService', 'PrintPageService', 'LayertreeService', 'LayersService', 'PrintService', function(ConfigService, PrintPageService, LayertreeService, LayersService, PrintService) {
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'orka/modules/print/templates/print.html',
        scope: {},
        link: function(scope, element, attrs) {
            scope.isPrintable = function() {
                // TODO refactor
                return scope.pageSize !== undefined && scope.pageSize[0] !== undefined && scope.pageSize[1] !== undefined && scope.scale !== undefined;
            };
            scope.startPrint = function() {
                scope.downloadUrl = false;
                var layerName = LayersService.backgroundLayer().get('layer');

                var downloadPromise = PrintService.createDownload(
                    PrintPageService.getBounds(),
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
                scope.updatePrintPage();
            };
            scope.updatePrintPage = function() {
                console.log(scope)
                if(scope.isPrintable()) {
                    PrintPageService.addFeatureFromPageSize(scope.pageSize, scope.scale);
                }
            };
            scope.resetPrintPage = function() {
                if(scope.isPrintable()) {
                    PrintPageService.createPrintArea(scope.pageSize, scope.scale);
                }
            };
        },
        controller: function($scope, $element, $attrs) {
            $scope.show = ConfigService.config.print !== undefined;
            if(!$scope.show) {
                return;
            }
            $scope.isPageSize = function(size) {
                return angular.equals(size, $scope.pageSize);
            };

            $scope.outputFormats = PrintPageService.outputFormats;
            $scope.pageSizes = PrintPageService.pageSizes;
            $scope.scale = angular.copy(PrintPageService.defaultScale);
            $scope.streetIndex = false;
            $scope.licenceAgreed = false;
            $scope.downloadUrl = false;

            $scope.outputFormat = $scope.outputFormats[0];

            $scope.$watch(
                function() {
                    return PrintPageService.currentPageSize;
                },
                function(newVal, oldVal) {
                    $scope.pageSize = newVal;
                }
            );
        }
    };
}]);

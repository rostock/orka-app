angular.module('anol.print', [])

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

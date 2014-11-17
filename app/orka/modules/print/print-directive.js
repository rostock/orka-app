angular.module('orka.print', [])

.directive('orkaPrint', ['$modal', 'ConfigService', 'PrintPageService', 'LayertreeService', 'LayersService', 'PrintService', function($modal, ConfigService, PrintPageService, LayertreeService, LayersService, PrintService) {
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'orka/modules/print/templates/print.html',
        scope: {},
        link: {
            pre: function(scope, element, attrs) {
                // TODO find a better solution to prevent directive to be executed
                // when ConfigService.config.print is undefined
                scope.show = ConfigService.config.print !== undefined;

                if(scope.show) {
                    scope.outputFormats = PrintPageService.outputFormats;
                    scope.pageSizes = PrintPageService.pageSizes;
                    scope.scale = angular.copy(PrintPageService.defaultScale);
                    scope.streetIndex = false;
                    scope.licenceAgreed = false;
                    scope.downloadUrl = false;

                    scope.outputFormat = scope.outputFormats[0];
                }


                scope.isPageSize = function(size) {
                    return angular.equals(size, scope.pageSize);
                };
                scope.isPrintable = function() {
                    if(scope.scale === undefined || scope.scale <= 0) {
                        return false;
                    }
                    if(scope.pageSize === undefined) {
                        return false;
                    }
                    if(scope.pageSize[0] === undefined || scope.pageSize[0] <= 0) {
                        return false;
                    }
                    if(scope.pageSize[1] === undefined || scope.pageSize[1] <= 0) {
                        return false;
                    }
                    return true;
                };
                // TODO test with running printqueue & gearmand
                scope.startPrint = function() {
                    scope.downloadUrl = false;
                    var layerName = LayersService.backgroundLayer().get('layer');

                    var downloadPromise = PrintService.createDownload(
                        PrintPageService.getBounds(),
                        scope.outputFormat.value,
                        PrintPageService.currentScale,
                        layerName,
                        scope.streetIndex,
                        LayertreeService.selectedPoiTypes,
                        LayertreeService.selectedTrackTypes
                    );

                    downloadPromise.then(function(url) {
                        scope.downloadUrl = url;
                    });
                    var modalInstance = $modal.open({
                        templateUrl: 'orka/modules/print/templates/print-modal.html',
                        scope: scope,
                        backdrop: 'static'
                    });

                    modalInstance.result.then(
                        function() { /* TODO somethink on success */},
                        function() { PrintService.abort = true; }
                    );
                };
                // if we assign pageSize = value in template angular put only a reverence
                // into scope.pageSize and typing somethink into width/height input fields
                // will result in modifying selected availablePageSize value
                scope.setPageSize = function(size) {
                    scope.pageSize = angular.copy(size);
                    scope.updatePrintPage();
                };
                scope.updatePrintPage = function() {
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
            post: function(scope, element, attrs) {
                scope.$watch(
                    function() {
                        return PrintPageService.currentPageSize;
                    },
                    function(newVal, oldVal) {
                        scope.pageSize = newVal;
                    }
                );
                scope.$watch(
                    function() {
                        return PrintService.status;
                    }, function(newVal, oldVal) {
                        scope.printStatus = newVal;
                    });
            }
        }
    };
}]);

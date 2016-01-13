angular.module('orka.print')
/**
 * @ngdoc directive
 * @name orka.print.directive:orkaPrint
 *
 * @requires $modal
 * @requires $timeout
 * @requires orka.config.ConfigService
 * @requires anolApi/anol.print.PrintPageService
 * @requires orka.layertree.LayertreeService
 * @requires anolApi/anol.map.LayersService
 * @requires orka.print.PrintService
 * @requires anolApi/anol.map.MapService
 * @requires anolApi/anol.scale.calculateScale
 *
 * @param {expression} showPrintBox show/hide print box geometry in map
 *
 * @description
 * Frontend of orka print module.
 *
 * Here all print related user input is collected. Also user interface for requesting, checking and downloading printed pages is provided.
 */
.directive('orkaPrint', ['$modal', '$timeout', 'ConfigService', 'PrintPageService', 'LayertreeService', 'LayersService', 'PrintService', 'MapService', 'calculateScale', function($modal, $timeout, ConfigService, PrintPageService, LayertreeService, LayersService, PrintService, MapService, calculateScale) {
    return {
        restrict: 'A',
        templateUrl: 'src/modules/print/templates/print.html',
        scope: {
            showPrintBox: '=showPrintBox'
        },
        link: {
            pre: function(scope, element, attrs) {
                scope.show = ConfigService.config.print !== undefined;
                scope.view = MapService.getMap().getView();
                if(scope.show) {
                    scope.outputFormats = PrintPageService.outputFormats;
                    scope.pageSizes = PrintPageService.pageSizes;
                    scope.maxPageSize = ConfigService.config.print.maxPageSize;
                    scope.pageSizeError = false;
                    scope.scale = angular.copy(PrintPageService.defaultScale);
                    scope.minScale = ConfigService.config.print.minScale;
                    scope.maxScale = ConfigService.config.print.maxScale;
                    scope.streetIndex = false;
                    scope.licenceAgreed = false;
                    scope.downloadUrl = false;

                    scope.outputFormat = scope.outputFormats[0];
                }


                scope.isPageSize = function(size) {
                    return angular.equals(size, scope.pageSize);
                };
                scope.isPrintable = function() {
                    scope.pageSizeError = false;
                    if(scope.scale === undefined || scope.scale < scope.minScale || scope.scale > scope.maxScale) {
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
                    if(scope.pageSize[0] * scope.pageSize[1] > scope.maxPageSize) {
                        scope.pageSizeError = true;
                        return false;
                    }
                    return true;
                };
                scope.startPrint = function() {
                    scope.downloadUrl = false;
                    var layerName = LayersService.backgroundLayer().get('printLayer');
                    var downloadPromise = PrintService.createDownload(
                        PrintPageService.getBounds(),
                        scope.outputFormat.value,
                        PrintPageService.currentScale,
                        layerName,
                        scope.streetIndex,
                        LayertreeService.selectedPoiTypes
                    );

                    downloadPromise.then(function(url) {
                        scope.downloadUrl = url;
                    });
                    var modalInstance = $modal.open({
                        templateUrl: 'src/modules/print/templates/print-modal.html',
                        scope: scope,
                        backdrop: 'static'
                    });

                    modalInstance.result.then(
                        function() {},
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
                    }
                );
                scope.$watch('showPrintBox', function(newVal, oldVal) {
                    PrintPageService.visible(newVal);
                });
                scope.view.on('change:resolution', function() {
                    if(scope.pageSize === undefined) {
                        // used $timeout instead of $apply to avoid "$apply already in progress"-error
                        $timeout(function() {
                            scope.scale = calculateScale(scope.view);
                        }, 0, true);
                    }
                });
                scope.scale = calculateScale(scope.view);
            }
        }
    };
}]);

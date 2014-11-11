angular.module('orka.layertree')

.directive('orkaLayertreeLegend', ['LayertreeService', function(LayertreeService) {
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'orka/modules/layertree/templates/layertree-legend.html',
        scope: {},
        link: function(scope, element, attrs) {
            scope.selectedPois = LayertreeService.selectedPoiTypes;
            scope.selectedTracks = LayertreeService.selectedTrackTypes;
            scope.typeMap = LayertreeService.typeMap;

            scope.$watch(function() {
                    return LayertreeService.selectedPoiTypes;
                }, function(newVal, oldVal) {
                    scope.selectedPois = newVal;
                }
            );

            scope.$watch(function() {
                    return LayertreeService.selectedTrackTypes;
                }, function(newVal, oldVal) {
                    scope.selectedTracks = newVal;
                }
            );

            scope.$watch(function() {
                    return LayertreeService.typeMap;
                }, function(newVal, oldVal) {
                    scope.typeMap = newVal;
                }
            );
        }
    };
}]);

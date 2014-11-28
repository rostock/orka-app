angular.module('orka.layertree')

.directive('orkaLayertreeLegend', ['LayertreeService', function(LayertreeService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        templateUrl: 'orka/modules/layertree/templates/layertree-legend.html',
        scope: {
            orkaLayertreeLegend: '@orkaLayertreeLegend'
        },
        link: {
            pre: function(scope, element, attrs, AnolMapController) {
                scope.selectedPois = LayertreeService.selectedPoiTypes;
                scope.selectedTracks = LayertreeService.selectedTrackTypes;
                scope.typeMap = LayertreeService.typeMap;

                if(angular.isDefined(AnolMapController)) {
                    scope.collapsed = scope.orkaLayertreeLegend !== 'open';
                    element.addClass('ol-unselectable');
                    AnolMapController.getMap().addControl(
                        new ol.control.Control({
                            element: element.first().context
                        })
                    );
                }
            },
            post: function(scope, element, attrs) {
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
        }
    };
}]);

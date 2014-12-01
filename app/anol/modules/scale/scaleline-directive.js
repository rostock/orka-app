angular.module('anol.scale')

/**
 * @ngdoc directive
 * @name anol.scale.directive:anolScaleLine
 *
 * @requires MapService
 *
 * @description
 * Add a ol scaleline to element directive is used in.
 * If element is defined inside anol-map-directive, scaleline is added to map
 */
.directive('anolScaleLine', ['MapService', function(MapService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        scope: {},
        link: {
            pre: function(scope, element, attrs, AnolMapController) {
                scope.map = MapService.getMap();

                var controlOptions = {};
                if(angular.isUndefined(AnolMapController)) {
                    controlOptions = {
                        target: element[0]
                    };
                }

                scope.map.addControl(
                    new ol.control.ScaleLine(controlOptions)
                );
            }
        }
    };
}]);

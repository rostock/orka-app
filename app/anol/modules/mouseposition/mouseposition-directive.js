angular.module('anol.mouseposition')

.directive('anolMousePosition', ['MapService', function(MapService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        scope: {},
        link: {
            pre: function(scope, element, attrs) {
                scope.map = MapService.getMap();
            },
            post: function(scope, element, attrs, AnolMapController) {
                var controlOptions = {};

                if(angular.isFunction(scope.coordinateFormat)) {
                    controlOptions.coordinateFormat = scope.coordinateFormat;
                }

                if(angular.isUndefined(AnolMapController)) {
                    controlOptions = {
                        target: element[0]
                    };
                }

                scope.map.addControl(
                    new ol.control.MousePosition(controlOptions)
                );
            }
        }
    };
}]);

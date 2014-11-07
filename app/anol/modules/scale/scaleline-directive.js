angular.module('anol.scale')

.directive('anolScaleLine', ['MapService', function(MapService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        scope: {},
        link: function(scope, element, attrs, AnolMapController) {
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
    };
}]);

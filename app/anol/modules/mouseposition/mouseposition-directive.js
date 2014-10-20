angular.module('anol.mouseposition', [])

.directive('anolMousePosition', ['MapService', function(MapService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        scope: {},
        link: function(scope, element, attrs, AnolMapController) {
            // TODO use only one new ol.control.ScaleLine and
            // asign target later if needed
            var controlOptions = {};

            scope.map = MapService.getMap();

            if(angular.isUndefined(AnolMapController)) {
                controlOptions = {
                    target: element[0]
                };
            }

            scope.map.addControl(
                new ol.control.MousePosition(controlOptions)
            );
        }
    };
}]);

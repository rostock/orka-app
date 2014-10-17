angular.module('anol.mouseposition', [])

.directive('anolMousePosition', [function() {
    return {
        restrict: 'A',
        scope: {
            map: '=anolMousePositionMap'
        },
        link: function(scope, element, attrs) {
            var control = new ol.control.MousePosition({
                target: element[0]
            });
            scope.map.addControl(control);
        }
    };
}]);

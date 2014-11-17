angular.module('orka.mouseposition', ['anol.mouseposition'])

.directive('orkaMousePosition', ['$injector', 'MapService', function($injector, MapService) {
    var anolMousePositionDirective = $injector.get('anolMousePositionDirective')[0];
    anolMousePositionDirective.link.pre = function(scope, element, attrs) {
        scope.map = MapService.getMap();
        scope.coordinateFormat = function(coordinate) {
            var x = Math.round(coordinate[0]);
            var y = Math.round(coordinate[1]);
            return x + ' m Ost || ' + y + ' m Nord (ETRS89/UTM-33N)';
        };
    };
    return anolMousePositionDirective;
}]);

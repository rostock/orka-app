angular.module('anol.map')

.directive('anolMap', ['DefaultMapName', 'MapService', function(DefaultMapName, MapService) {
    return {
        scope: {},
        link: function (scope, element, attrs) {
            element
                .attr('id', scope.mapName)
                .attr('class', scope.mapName);

            scope.map.setTarget(scope.mapName);
        },
        controller: function($scope, $element, $attrs) {
            $scope.mapName = DefaultMapName;

            $scope.map = MapService.getMap();

            this.getMap = function() {
                return $scope.map;
            };
        }
    };
}]);

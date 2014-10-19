angular.module('anol.map')

.directive('anolMap', ['DefaultMapName', 'MapsService', function(DefaultMapName, MapsService) {
    return {
        scope: {
            mapName: '@?anolMapName'
        },
        link: function (scope, element, attrs) {
            element
                .attr('id', scope.mapName)
                .attr('class', scope.mapName);

            scope.map.setTarget(scope.mapName);
        },
        controller: function($scope, $element, $attrs) {
            $scope.mapName = $scope.mapName || DefaultMapName;

            $scope.map = MapsService.getMap($scope.mapName);

            this.getMap = function() {
                return $scope.map;
            };
        }
    };
}]);

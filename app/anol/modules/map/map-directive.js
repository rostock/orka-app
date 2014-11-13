angular.module('anol.map')

.directive('anolMap', ['DefaultMapName', 'MapService', function(DefaultMapName, MapService) {
    return {
        scope: {},
        link: {
            pre: function(scope, element, attrs) {
                scope.mapName = DefaultMapName;
                scope.map = MapService.getMap();
            },
            post: function (scope, element, attrs) {
                element
                    .attr('id', scope.mapName)
                    .addClass(scope.mapName);

                scope.map.setTarget(scope.mapName);
            }
        },
        controller: function($scope, $element, $attrs) {
            this.getMap = function() {
                return $scope.map;
            };
        }
    };
}]);

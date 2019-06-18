angular.module('anol.map')

/**
 * @ngdoc directive
 * @name anol.map.directive:anolMap
 *
 * @requires anol.DefaultMapName
 * @requires anol.map.MapService
 *
 * @description
 * The anol-map directive adds the map defined in MapService to the dom.
 *
 * It also add the DefaultMapName as id and class to the map element.
 */
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

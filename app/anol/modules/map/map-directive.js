angular.module('anol.map')

/**
 * @ngdoc directive
 * @name anol.map.directive:anolMap
 *
 * @requires anol.DefaultMapName
 * @requires anol.map.MapService
 *
 * @param {string=} autoResize Autoresize map when width, height or both of browser window changes
 *
 * @description
 * The anol-map directive adds the map defined in MapService to the dom.
 *
 * It also add the DefaultMapName as id and class to the map element.
 *
 * If it's autoResize property is defined, the map will be resized when browser window dimensions
 * changes. Atm only 'height' is supported
 */
.directive('anolMap', ['DefaultMapName', 'MapService', function(DefaultMapName, MapService) {
    return {
        scope: {
            autoResize: '@autoResize'
        },
        link: {
            pre: function(scope, element, attrs) {
                scope.mapName = DefaultMapName;
                scope.map = MapService.getMap();

                scope.setContainerHeight = function(height) {
                    element.css('height', height);
                    scope.map.updateSize();
                };
            },
            post: function (scope, element, attrs) {
                element
                    .attr('id', scope.mapName)
                    .addClass(scope.mapName);

                scope.map.setTarget(scope.mapName);

                if(attrs.autoResize==='height' || attrs.autoResize === 'both') {
                    scope.$watch(function() {
                        return window.innerHeight;
                    }, function(newVal, oldVal) {
                        if(newVal !== undefined) {
                            // TODO update when support others than px
                            var marginTop = element.css('margin-top');
                            marginTop = parseInt(marginTop.slice(0, marginTop.length -2));

                            var marginBottom = element.css('margin-bottom');
                            marginBottom = parseInt(marginBottom.slice(0, marginBottom.length -2));
                            // TODO find out why mapHeight needs to be 4 px smaller than it could be
                            scope.setContainerHeight(newVal - marginTop - marginBottom - 4);
                        }
                    });
                }
            }
        },
        controller: function($scope, $element, $attrs) {
            this.getMap = function() {
                return $scope.map;
            };
        }
    };
}]);

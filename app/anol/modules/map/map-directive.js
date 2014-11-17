angular.module('anol.map')

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
                            scope.setContainerHeight(newVal - marginTop - marginBottom);
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

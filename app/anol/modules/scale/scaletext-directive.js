angular.module('anol.scale')

.constant('INCHES_PER_METER', 39.37)
.constant('DPI', 72)

.directive('anolScaleText', ['MapService', 'INCHES_PER_METER', 'DPI', function(MapService, INCHES_PER_METER, DPI) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        template: '<div>1 : {{ scale }}</div>',
        scope: {},
        link: {
            pre: function(scope, element, attrs) {
                scope.view = MapService.getMap().getView();
                scope.calculateScale = function() {
                    // found at https://groups.google.com/d/msg/ol3-dev/RAJa4locqaM/4AzBrkndL9AJ
                    var resolution = scope.view.getResolution();
                    var mpu = scope.view.getProjection().getMetersPerUnit();
                    var scale = resolution * mpu * INCHES_PER_METER * DPI;
                    return Math.round(scale);
                };

                scope.scale = scope.calculateScale();
            },
            post: function(scope, element, attrs) {
                scope.view.on('change:resolution', function() {
                    scope.$apply(function() {
                        scope.scale = scope.calculateScale();
                    });
                });

            }
        }
    };
}]);
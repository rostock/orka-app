angular.module('anol.scale')

.directive('anolScaleText', ['MapService', function(MapService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        template: '<div>1 : {{ scale }}</div>',
        scope: {},
        link: function(scope, element, attrs, AnolMapController) {
            var controlOptions = {};

            if(angular.isUndefined(AnolMapController)) {
                controlOptions = {
                    target: element[0]
                };
            }
        },
        controller: function($scope, $element, $attrs) {
            var calculateScale = function() {
                // found at https://groups.google.com/d/msg/ol3-dev/RAJa4locqaM/4AzBrkndL9AJ
                var resolution = $scope.view.getResolution();
                var mpu = $scope.view.getProjection().getMetersPerUnit();
                // TODO make dpi configurable
                var dpi = 72;
                // TODO find out why 39.37
                var scale = resolution * mpu * 39.37 * dpi;

                return Math.round(scale);
            };
            $scope.view = MapService.getMap().getView();
            $scope.view.on('change:resolution', function() {
                $scope.$apply(function() {
                    $scope.scale = calculateScale();
                });
            });

            $scope.scale = calculateScale();
        }
    };
}]);
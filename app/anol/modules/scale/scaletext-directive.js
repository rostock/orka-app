angular.module('anol.scale')

.constant('calculateScale', function(view) {
    var INCHES_PER_METER = 39.37;
    var DPI = 72;
    // found at https://groups.google.com/d/msg/ol3-dev/RAJa4locqaM/4AzBrkndL9AJ
    var resolution = view.getResolution();
    var mpu = view.getProjection().getMetersPerUnit();
    var scale = resolution * mpu * INCHES_PER_METER * DPI;
    return Math.round(scale);
})

.directive('anolScaleText', ['MapService', 'calculateScale', function(MapService, calculateScale) {

    return {
        restrict: 'A',
        require: '?^anolMap',
        templateUrl: 'anol/modules/scale/templates/scaletext.html',
        scope: {},
        link: {
            pre: function(scope, element, attrs, AnolMapController) {
                scope.view = MapService.getMap().getView();
                if(angular.isDefined(AnolMapController)) {
                    element.addClass('ol-unselectable');
                    MapService.getMap().addControl(
                        new ol.control.Control({
                            element: element.first().context
                        })
                    );
                }

                scope.scale = calculateScale(scope.view);
            },
            post: function(scope, element, attrs) {
                scope.view.on('change:resolution', function() {
                    scope.$apply(function() {
                        scope.scale = calculateScale(scope.view);
                    });
                });

            }
        }
    };
}]);
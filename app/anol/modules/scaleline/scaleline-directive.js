angular.module('anol.scaleline', [])

.directive('anolScaleline', [function() {
    return {
        restrict: 'A',
        scope: {
            map: '=anolScalelineMap',
            extern: '@anolScalelineExternal'
        },
        link: function(scope, element, attrs) {
            // TODO use only one new ol.control.ScaleLine and
            // asign target later if needed
            var control;
            if(scope.extern) {
                control = new ol.control.ScaleLine({
                    target: element[0]
                });
            } else {
                control = new ol.control.ScaleLine();
            }

            scope.map.addControl(control);
        }
    };
}]);

angular.module('anol.mouseposition', [])

.directive('anolMousePosition', ['MapsService', function(MapsService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        scope: {
            mapName: '@?anolMapName'
        },
        link: function(scope, element, attrs, AnolMapController) {
            // TODO use only one new ol.control.ScaleLine and
            // asign target later if needed
            var controlOptions = {};

            if(angular.isUndefined(AnolMapController)) {
                scope.map = MapsService.getMap(scope.mapName);
                controlOptions = {
                    target: element[0]
                };
            } else {
                scope.map = AnolMapController.getMap();
            }

            scope.map.addControl(
                new ol.control.MousePosition(controlOptions)
            );
        },
        controller: function($scope, $element, $attrs) {
            $scope.lat = 0;
            $scope.lon = 0;
        }
    };
}]);

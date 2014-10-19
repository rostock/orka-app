angular.module('anol.scaleline', [])

.directive('anolScaleline', ['MapsService', function(MapsService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        scope: {
            mapName: '@?anolMapName'
        },
        link: function(scope, element, attrs, AnolMapController) {
            var controlOptions = {};

            if(angular.isUndefined(AnolMapController)) {
                scope.map = MapsService.getMap(scope.mapName);
                controlOptions = {
                    target: element[0]
                };
            } else {
                scope.map = AnolMapController.getMap(scope.mapName);
            }

            scope.map.addControl(
                new ol.control.ScaleLine(controlOptions)
            );
        }
    };
}]);

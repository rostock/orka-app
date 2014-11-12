angular.module('anol.layerswitcher', [])

.directive('anolLayerswitcher', ['LayersService', function(LayersService) {
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'anol/modules/layerswitcher/templates/layerswitcher.html',
        scope: {},
        link: function(scope, element, attrs) {
            scope.$watch('backgroundLayer', function(newVal, oldVal) {
                oldVal.setVisible(false);
                newVal.setVisible(true);
            });
        },
        controller: function($scope, $element, $attrs) {
            $scope.backgroundLayers = LayersService.backgroundLayers;
            angular.forEach($scope.backgroundLayers, function(layer) {
                if(layer.getVisible() === true && $scope.backgroundLayer === undefined) {
                    $scope.backgroundLayer = layer;
                    $scope.backgroundLayer.setVisible(false);
                } else {
                    layer.setVisible(false);
                }
            });
            var overlayLayers = [];
            angular.forEach(LayersService.overlayLayers, function(layer) {
                if(layer.get('displayInLayerswitcher') !== false) {
                    overlayLayers.push(layer);
                }
            });
            $scope.overlayLayers = overlayLayers;
        }
    };
}]);

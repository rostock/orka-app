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
                if(layer.getVisible() === true) {
                    if($scope.backgroundLayer !== undefined) {
                        $scope.backgroundLayer.setVisible(false);
                    }
                    $scope.backgroundLayer = layer;
                }
            });
            $scope.overlayLayers = LayersService.overlayLayers;
        }
    };
}]);

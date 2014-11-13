angular.module('anol.layerswitcher', [])

.directive('anolLayerswitcher', ['LayersService', function(LayersService) {
    return {
        restrict: 'A',
        templateUrl: 'anol/modules/layerswitcher/templates/layerswitcher.html',
        scope: {},
        link: {
            pre: function(scope, element, attrs) {
                scope.backgroundLayers = LayersService.backgroundLayers;
                var overlayLayers = [];
                angular.forEach(LayersService.overlayLayers, function(layer) {
                    if(layer.get('displayInLayerswitcher') !== false) {
                        overlayLayers.push(layer);
                    }
                });
                scope.overlayLayers = overlayLayers;
            },
            post: function(scope, element, attrs) {
                angular.forEach(scope.backgroundLayers, function(layer) {
                    if(layer.getVisible() === true && scope.backgroundLayer === undefined) {
                        scope.backgroundLayer = layer;
                        scope.backgroundLayer.setVisible(false);
                    } else {
                        layer.setVisible(false);
                    }
                });
                scope.$watch('backgroundLayer', function(newVal, oldVal) {
                    oldVal.setVisible(false);
                    newVal.setVisible(true);
                });
            }
        }
    };
}]);

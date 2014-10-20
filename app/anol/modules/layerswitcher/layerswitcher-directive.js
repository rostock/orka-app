angular.module('anol.layerswitcher', [])

.directive('anolLayerswitcher', ['LayersService', function(LayersService) {
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'anol/modules/layerswitcher/templates/layerswitcher.html',
        scope: {},
        link: function(scope, element, attrs) {
            scope.layers = LayersService.layers;
        }
    };
}]);

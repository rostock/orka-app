angular.module('anol.map')

.directive('anolMap', ['ViewService', 'LayersService', 'ControlsService', function(ViewService, LayersService, ControlsService) {
    return {
        scope: {
            map: '=anolMap'
        },
        link: function (scope, element, attrs) {
            element
                .attr('id', 'anol-map')
                .attr('class', 'anol-map');

            scope.map.setView(ViewService.view);
            angular.forEach(LayersService.layers, function(layer) {
                scope.map.addLayer(layer);
            });
            scope.map.setTarget('anol-map');
        }
    };
}]);

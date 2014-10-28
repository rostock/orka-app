angular.module('anol.featurepopup', [])

.directive('anolFeaturePopup', ['MapService', function(MapService) {
    return {
        restrict: 'A',
        scope: {
            'featureLayer': '@featureLayer'
        },
        require: '?^anolFeatureList',
        replace: true,
        templateUrl: 'anol/modules/featurepopup/templates/popup.html',
        link: function(scope, element, attrs, AnolFeatureListController) {
            scope.handleClick = function(evt) {
                var feature = scope.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                    if(layer.get('layer') === scope.featureLayer) {
                        return feature;
                    }
                });
                if(feature) {
                    scope.popup.setPosition(evt.coordinate);
                    scope.$apply(function() {
                        scope.feature = feature;
                        scope.popupVisible = true;
                    });
                    if(angular.isDefined(AnolFeatureListController)) {
                        AnolFeatureListController.scrollTo(feature);
                    }
                }
            };

            scope.map.on('click', scope.handleClick, this);

            scope.popup = new ol.Overlay({
                element: element[0]
            });
            scope.map.addOverlay(scope.popup);
        },
        controller: function($scope, $element, $attrs) {
            $scope.map = MapService.getMap();
            $scope.feature = undefined;
            $scope.popupVisible = false;
        }
    };
}]);

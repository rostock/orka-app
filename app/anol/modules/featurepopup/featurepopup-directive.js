angular.module('anol.featurepopup', [])

.directive('anolFeaturePopup', ['MapService', function(MapService) {
    return {
        restrict: 'A',
        scope: {
            'featureLayer': '@featureLayer'
        },
        replace: true,
        templateUrl: 'anol/modules/featurepopup/templates/popup.html',
        link: function(scope, element, attrs) {
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

            $scope.handleClick = function(evt) {
                var feature = $scope.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                    if(layer.get('layer') === $scope.featureLayer) {
                        return feature;
                    }
                });
                if(feature) {
                    $scope.$apply(function() {
                        $scope.feature = feature;

                        $scope.popup.setPosition(evt.coordinate);
                        $scope.popupVisible = true;
                    });
                }
            };
        }
    };
}]);

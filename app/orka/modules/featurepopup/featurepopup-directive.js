angular.module('orka.featurepopup', [])

.directive('orkaFeaturePopup', ['MapService', function(MapService) {
    return {
        restrict: 'A',
        scope: {
            'featureLayer': '@featureLayer'
        },
        require: '?^orkaFeatureList',
        replace: true,
        templateUrl: 'orka/modules/featurepopup/templates/popup.html',
        link: function(scope, element, attrs, OrkaFeatureListController) {
            console.log('orka feature popup post link')
            scope.handleClick = function(evt) {
                var feature = scope.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                    if(layer.get('layer') === scope.featureLayer) {
                        return feature;
                    }
                });
                if(feature) {
                    console.log(feature.getProperties())
                    scope.popup.setPosition(evt.coordinate);
                    scope.$apply(function() {
                        scope.feature = feature;
                        scope.popupVisible = true;
                    });
                    if(angular.isDefined(OrkaFeatureListController)) {
                        OrkaFeatureListController.scrollTo(feature);
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
            console.log('orka feature popup controller')
            $scope.map = MapService.getMap();
            $scope.feature = undefined;
            $scope.popupVisible = false;
        }
    };
}]);

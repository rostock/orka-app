angular.module('orka.featurepopup', ['anol.featurepopup'])

.directive('orkaFeaturePopup', ['$injector', 'MapService', 'ConfigService', 'LayertreeService', function($injector, MapService, ConfigService, LayertreeService) {
    var anolFeaturePopupDirective = $injector.get('anolFeaturePopupDirective')[0];
    return {
        restrict: 'A',
        scope: {
            'featureLayer': '@featureLayer'
        },
        require: '?^orkaFeatureList',
        replace: true,
        templateUrl: 'orka/modules/featurepopup/templates/popup.html',
        link: {
            pre: function(scope, element, attrs, OrkaFeatureListController) {
                scope.map = MapService.getMap();
                scope.feature = undefined;
                scope.popupVisible = false;
                scope.overlayOptions = {
                    element: element[0],
                    positioning: ConfigService.config.popup.positioning,
                    offset: ConfigService.config.popup.offset
                };

                scope.typeMap = {};

                LayertreeService.poisLoaded.then(function() {
                    scope.typeMap = LayertreeService.typeMap;
                });

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
                        var popupExtent = scope.calculatePopupExtent(evt.pixel);
                        scope.moveMap(popupExtent);
                        if(angular.isDefined(OrkaFeatureListController)) {
                            OrkaFeatureListController.scrollTo(feature);
                        }
                    }
                };
            },
            post: anolFeaturePopupDirective.link.post
        },
        controller: anolFeaturePopupDirective.controller
    };
}]);

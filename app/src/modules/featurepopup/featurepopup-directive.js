angular.module('orka.featurepopup')
/**
 * @ngdoc directive
 * @name orka.featurelist.directive:orkaFeaturePopup
 *
 * @requires $injector
 * @requires $timeout
 * @requires anolApi/anol.map.MapService
 * @requires orka.config.ConfigService
 * @requires LayertreeService
 *
 * @description
 * Shows a popup when click on POI in map.
 *
 * If placed inside a {@link orka.featurelist.directive:orkaFeatureList `orkaFeatureList directive`}, list will scroll to selected POI in map.
 *
 * *Note* This is an extension of {@link anolApi/anol.featurepopup.directive:anolFeaturePopup `anolFeaturePopup`}
 */
.directive('orkaFeaturePopup', ['$injector', '$timeout', 'MapService', 'ConfigService', 'LayertreeService', function($injector, $timeout, MapService, ConfigService, LayertreeService) {
    var anolFeaturePopupDirective = $injector.get('anolFeaturePopupDirective')[0];
    return {
        restrict: 'A',
        scope: {},
        require: '?^orkaFeatureList',
        replace: true,
        templateUrl: 'src/modules/featurepopup/templates/popup.html',
        link: {
            pre: function(scope, element, attrs, OrkaFeatureListController) {
                scope.map = MapService.getMap();
                scope.featureLayer = ConfigService.config.poi.layerName;
                scope.feature = undefined;
                scope.popupVisible = false;
                var offset = ConfigService.config.popup.offset;
                var noseWidth = element.find('.orka-popup-nose').width();
                offset[0] += noseWidth;
                scope.overlayOptions = {
                    element: element[0],
                    positioning: ConfigService.config.popup.positioning,
                    offset: offset
                };

                scope.typeMap = {};

                LayertreeService.poisLoaded.then(function() {
                    scope.typeMap = LayertreeService.typeMap;
                });

                scope.handleClick = function(evt) {
                    var visible = false;
                    var feature = scope.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                        if(layer.get('layer') === scope.featureLayer) {
                            return feature;
                        }
                    });
                    if(feature) {
                        scope.popup.setPosition(feature.getGeometry().getCoordinates());
                        visible = true;

                        $timeout(function() {
                            var popupExtent = scope.calculatePopupExtent(evt.pixel);
                            scope.moveMap(popupExtent);
                            // TODO add support for other popup-placements than center-left
                            var noseElement = element.find('.orka-popup-nose');
                            noseElement.css('top', (scope.popupInnerHeight() / 2) + (noseElement.height() / 2) + 'px');

                        }, 0, false);
                        if(angular.isDefined(OrkaFeatureListController)) {
                            OrkaFeatureListController.showListFeature(feature);
                        }
                    } else {
                        scope.popupClosed();
                    }
                    scope.$apply(function() {
                        scope.feature = feature;
                        scope.popupVisible = visible;
                    });
                };

                scope.popupClosed = function() {
                    if(angular.isDefined(OrkaFeatureListController)) {
                        OrkaFeatureListController.showListFeature();
                    }
                };

                if(angular.isDefined(OrkaFeatureListController)) {
                    OrkaFeatureListController.registerPopupScope(scope);
                    scope.$watch(
                        function() {
                            return LayertreeService.selectedPoiTypes;
                        },
                        function(newVal, oldVal) {
                            if(scope.feature !== undefined && scope.popupVisible && $.inArray(scope.feature.get('type'), newVal) === -1) {
                                scope.popupVisible = false;
                                OrkaFeatureListController.showListFeature();
                            }
                        }
                    );
                }
            },
            post: anolFeaturePopupDirective.link.post
        },
        controller: anolFeaturePopupDirective.controller
    };
}]);

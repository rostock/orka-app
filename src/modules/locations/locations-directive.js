angular.module('orka.locations')
/**
 * @ngdoc directive
 * @name orka.locations.directive:orkaLocations
 *
 * @requires anolApi/anol.map.LayersFactory
 * @requires anolApi/anol.map.LayersService
 * @requires anolApi/anol.map.MapService
 * @requires orka.config.ConfigService
 *
 * @param {expression} showLocationFeature show/hide feature in map
 *
 * @description
 * Shows a list of selectable geometries. Selected geometry will be shown in map. Map will be centered on selected geometry.
 *
 * List of selectable geometries is provided by {@link orka.config.ConfigServiceProvider#property_config `ConfigServiceProvider.config.locations`}.
 *
 * With `showLocationFeature` === `false` shown geometry will be hidden.
 */
.directive('orkaLocations', ['LayersFactory', 'LayersService', 'ConfigService', 'MapService', function(LayersFactory, LayersService, ConfigService, MapService) {
    return {
        scope: {
            showLocationFeature: '=showLocationFeature'
        },
        templateUrl: 'src/modules/locations/templates/locations.html',
        link: {
            pre: function(scope, element, attrs) {
                scope.features = [];
                scope.featureLayer = LayersService.layersByProperty('layer', ConfigService.config.poi.layerName)[0];
                scope.selectedFeature = undefined;
                scope.title = ConfigService.config.locationsTitle;
                scope.layer = LayersFactory.newGeoJSON({
                    projection: ConfigService.config.map.projection,
                    url: ConfigService.config.locations,
                    style: function(feature, resolution) {
                        if(scope.selectedFeature === undefined) {
                            return;
                        }
                        var styles = [];
                        if(scope.selectedFeature.get('name') === feature.get('name')) {
                            var style = feature.get('style');
                            // use styling from feature properties
                            if(style !== undefined) {
                                var stroke, fill;
                                if(style.stroke !== undefined) {
                                    stroke = new ol.style.Stroke(style.stroke);
                                }
                                if(style.fill !== undefined) {
                                    fill = new ol.style.Fill(style.fill);
                                }
                                styles.push(new ol.style.Style({
                                    stroke: stroke,
                                    fill: fill
                                }));
                            }
                        }
                        return styles;
                    },
                    displayInLayerswitcher: false,
                    visible: true
                });
                LayersService.addLayer(scope.layer);
                scope.layer.getSource().on('addfeature', function(evt) {
                    scope.features.push(evt.feature);
                });

                scope.selectFeature = function(feature) {
                    scope.selectedFeature = feature;
                    var source = scope.layer.getSource();
                    if(scope.selectedFeature !== undefined) {
                        var map = MapService.getMap();
                        map.getView().fit(scope.selectedFeature.getGeometry().getExtent(), map.getSize());
                        scope.featureLayer.getSource().clear();
                    }

                    // source.dispatchChangeEvent();
                };
            },
            post: function(scope, element, attrs) {
                scope.$watch('showLocationFeature', function(newVal, oldVal) {
                    if(newVal === false) {
                        scope.selectFeature();
                    }
                });
            }
        }
    };
}]);

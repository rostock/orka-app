angular.module('orka.locations')

// use proj4 either to load 25833 geojson or display transformed geojson?
// http://ahocevar.net/2014/07/10/proj4js-2-2-x-with-ol3.html
.directive('orkaLocations', ['LayersFactory', 'LayersService', 'ConfigService', 'MapService', function(LayersFactory, LayersService, ConfigService, MapService) {
    return {
        scope: {
            showLocationFeature: '=showLocationFeature'
        },
        templateUrl: 'orka/modules/locations/templates/locations.html',
        link: {
            pre: function(scope, element, attrs) {
                scope.selectedTitle = undefined;
                scope.selectedFeature = undefined;
                scope.layer = LayersFactory.newGeoJSON({
                    projection: ConfigService.config.map.projection,
                    url: ConfigService.config.locations,
                    style: function(feature, resolution) {
                        var styles = [];
                        if(scope.selectedTitle === feature.get('title')) {
                            var style = feature.get('style');
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
                scope.titles = [];
                scope.layer.getSource().on('addfeature', function(evt) {
                    scope.titles.push(evt.feature.get('title'));
                });

                scope.selectTitle = function(title) {
                    scope.selectedTitle = title;
                    var source = scope.layer.getSource();
                    if(scope.selectedTitle !== undefined) {
                        source.forEachFeature(function(feature) {
                            if(feature.get('title') === scope.selectedTitle) {
                                var map = MapService.getMap();
                                map.getView().fitExtent(feature.getGeometry().getExtent(), map.getSize());
                            }
                        });
                    }
                    source.dispatchChangeEvent();
                };
            },
            post: function(scope, element, attrs) {
                scope.$watch('showLocationFeature', function(newVal, oldVal) {
                    if(newVal === false) {
                        scope.selectTitle();
                    }
                });
            }
        }
    };
}]);

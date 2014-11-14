angular.module('orka.featurelist', [])

.directive('orkaFeatureList', ['$filter', '$timeout', 'MapService', 'LayersService', 'LayertreeService', function($filter, $timeout, MapService, LayersService, LayertreeService) {
    return {
        restrict: 'A',
        scope: {
            'featureLayerName': '@featureLayer',
            'markerLayerName': '@markerLayer'
        },
        transclude: true,
        templateUrl: 'orka/modules/featurelist/templates/featurelist.html',
        link: {
            pre: function(scope, element, attr) {
                scope.map = MapService.getMap();
                scope.featureLayer = LayersService.layersByProperty('layer', scope.featureLayerName)[0];
                scope.markerLayer = LayersService.layersByProperty('layer', scope.markerLayerName)[0];

                scope.typeMap = {};

                LayertreeService.poisLoaded.then(function() {
                    scope.typeMap = LayertreeService.typeMap;
                });

                scope.toggleMarker = function(feature) {
                    if(scope.showFeatureContent !== false && feature !== undefined) {
                        var geometry = feature.getGeometry().clone();
                        if(scope.markerFeature === undefined) {
                            scope.markerFeature = new ol.Feature();
                            scope.markerLayer.getSource().addFeatures([scope.markerFeature]);
                        }
                        scope.markerFeature.setGeometry(geometry);
                    }
                    scope.markerLayer.setVisible(scope.showFeatureContent !== false);
                };

                scope.moveContentOutofOverflow = function() {
                    if(scope.showFeatureContent !== false) {
                        var id = 'feature_' + scope.showFeatureContent;
                        var featureElement = element.find('#' + id);
                        var featureListContainer = element.find('#orka-feature-list-container');

                        var elementBottom = featureElement.offset().top + featureElement.height();
                        var containerBottom = featureListContainer.offset().top + featureListContainer.height();

                        var delta = elementBottom - containerBottom;
                        if(delta > 0) {
                            var currentScrollTop = featureListContainer.scrollTop();
                            var scrollTo = currentScrollTop + delta;
                            featureListContainer.scrollTop(scrollTo);
                        }
                    }
                };

                scope.toggleFeatureContent = function(feature) {
                    scope.showFeatureContent = scope.showFeatureContent === feature.get('osm_id') ? false : feature.get('osm_id');
                    scope.toggleMarker(feature);
                    // timeout function is runing right after scope digest completet.
                    // before digest is not complete, browser has not updated html.
                    // so element is hidden although scope.showFeatureContent is true
                    $timeout(scope.moveContentOutofOverflow, 0, false);
                };

                scope.hasAddress = function(feature) {
                    return feature.get('addr:street') !== undefined && feature.get('addr:city') !== undefined;
                };
            },
            post: function(scope, element, attr) {
                var calculateExtent = function(map) {
                    return map.getView().calculateExtent(map.getSize());
                };
                var sortFeaturesByNumValue = function(feature) {
                    return feature.get('osm_id');
                };
                var featuresByExtent = function() {
                    var featureGroups = {};
                    var selectedFeatureRemoved = scope.showFeatureContent !== false;
                    if(scope.featureLayer.getVisible()) {
                        var _features = scope.featureLayer.getSource().getFeatures();
                        angular.forEach(_features, function(feature) {
                            if(ol.extent.intersects(scope.extent, feature.getGeometry().getExtent())) {
                                var featureType = feature.get('type');
                                if(selectedFeatureRemoved === true) {
                                    selectedFeatureRemoved = scope.showFeatureContent === feature.get('osm_id') ? false : true;
                                }
                                if(featureGroups[featureType] === undefined) {
                                    featureGroups[featureType] = [];
                                }
                                featureGroups[featureType].push(feature);
                            }
                        });
                    }
                    angular.forEach(featureGroups, function(features) {
                        features = $filter('orderBy')(features, sortFeaturesByNumValue, false);
                    });
                    if(selectedFeatureRemoved) {
                        scope.showFeatureContent = false;
                        scope.toggleMarker();
                    }

                    return featureGroups;
                };

                scope.map.on('moveend', function(evt) {
                    scope.$apply(function() {
                        scope.extent = calculateExtent(evt.target);
                    });
                });

                scope.map.on('click', function(evt) {
                    scope.$apply(function() {
                        scope.markerLayer.setVisible(false);
                    });
                });

                scope.featureLayer.getSource().on('anolSourceUpdated', function() {
                    var features = featuresByExtent();
                    scope.$apply(function() {
                        scope.featureGroups = features;
                        if(scope.showFeatureContent !== false) {
                            $timeout(scope.moveContentOutofOverflow, 0, false);
                        }
                    });
                });

                scope.$watch('extent', function(newVal, oldVal) {
                    scope.featureGroups = featuresByExtent();
                });

                scope.extent = calculateExtent(scope.map);
            }
        },
        controller: function($scope, $element, $attrs) {
            this.scrollTo = function(feature) {
                $scope.$apply(function() {
                    $scope.showGroup = feature.get('type');
                    $scope.showFeatureContent = feature.get('osm_id');
                });
                var id = 'feature_' + feature.get('osm_id');
                var featureElement = $element.find('#' + id);
                var featureListContainer = $element.find('#orka-feature-list-container');

                var currentScrollTop = featureListContainer.scrollTop();
                var containerTop = featureListContainer.offset().top;
                var elementTop = featureElement.offset().top;
                var scrollTo = (elementTop + currentScrollTop) - containerTop;

                featureListContainer.scrollTop(scrollTo);
            };
        }
    };
}]);

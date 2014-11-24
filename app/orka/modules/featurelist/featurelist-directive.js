angular.module('orka.featurelist', [])

.directive('orkaFeatureList', ['$filter', '$timeout', 'MapService', 'LayersService', 'LayertreeService', 'ConfigService', function($filter, $timeout, MapService, LayersService, LayertreeService, ConfigService) {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            'featureLayerName': '@featureLayer',
            'markerLayerName': '@markerLayer'
        },
        transclude: true,
        templateUrl: 'orka/modules/featurelist/templates/featurelist.html',
        link: {
            pre: function(scope, element, attr) {
                scope.map = MapService.getMap();
                scope.featureGroups = false;
                scope.featureLayer = LayersService.layersByProperty('layer', scope.featureLayerName)[0];
                scope.markerLayer = LayersService.layersByProperty('layer', scope.markerLayerName)[0];

                scope.typeMap = {};

                LayertreeService.poisLoaded.then(function() {
                    scope.typeMap = LayertreeService.typeMap;
                });

                // TODO simplify
                scope.toggleMarker = function(feature) {
                    if(scope.markerFeature !== undefined) {
                        var markerVisible = ol.extent.containsCoordinate(scope.extent, scope.markerFeature.getGeometry().getCoordinates());
                        if(!markerVisible) {
                            scope.markerFeature.set('highlightMarker', false);
                            return;
                        } else if(feature === undefined) {
                            scope.markerFeature.set('highlightMarker', true);
                            return;
                        }
                        if(feature === undefined) {
                            scope.markerFeature.set('highlightMarker', false);
                            scope.markerFeature = feature;
                            return;
                        }
                        if(feature !== scope.markerFeature) {
                            scope.markerFeature.set('highlightMarker', false);
                            scope.markerFeature = feature;
                            scope.markerFeature.set('highlightMarker', true);
                            return;
                        } else {
                            scope.markerFeature.set('highlightMarker', false);
                            scope.markerFeature = undefined;
                            return;
                        }
                    } else if(feature !== undefined) {
                        scope.markerFeature = feature;
                        scope.markerFeature.set('highlightMarker', true);
                    }
                };

                scope.moveContentOutofOverflow = function() {
                    var id;
                    if(scope.showFeatureContent !== false) {
                        id = 'feature_' + scope.showFeatureContent;
                        scope.scrollToFeatureById(id);
                    }
                };
                scope.scrollToFeatureById = function(id) {
                    var featureElement = element.find('#' + id);
                    if(featureElement.length > 0) {
                        var currentScrollTop = element.scrollTop();
                        var containerTop = element.offset().top;
                        var elementTop = featureElement.offset().top;
                        var scrollTo = (elementTop + currentScrollTop) - containerTop;
                        element.scrollTop(scrollTo);
                    }
                };
                scope.toggleFeatureContent = function(feature) {
                    scope.showFeatureContent = scope.showFeatureContent === feature.get('osm_id') ? false : feature.get('osm_id');

                    if(scope.markerFeature !== undefined || scope.showFeatureContent !== false) {
                        scope.toggleMarker(feature);
                    }

                    if(angular.isDefined(scope.popupScope)) {
                        scope.popupScope.popupVisible = false;
                    }
                    // timeout function is runing right after scope digest completet.
                    // before digest is not complete, browser has not updated html.
                    // so element is hidden although scope.showFeatureContent is true
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
                    if(scope.featureLayer.getVisible()) {
                        var _features = scope.featureLayer.getSource().getFeatures();
                        angular.forEach(_features, function(feature) {
                            if(ol.extent.intersects(scope.extent, feature.getGeometry().getExtent())) {
                                var featureType = feature.get('type');
                                if(scope.markerFeature !== undefined && scope.markerFeature.get('osm_id') === feature.get('osm_id')) {
                                    scope.markerFeature = feature;
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
                    if(Object.keys(featureGroups).length === 0) {
                        return false;
                    }
                    return featureGroups;
                };

                scope.map.on('moveend', function(evt) {
                    var extent = calculateExtent(evt.target);
                    scope.$apply(function() {
                        scope.extent = extent;
                    });
                });

                scope.featureLayer.getSource().on('anolSourceUpdated', function() {
                    var features = featuresByExtent();
                    scope.$apply(function() {
                        scope.featureGroups = features;
                    });
                    scope.toggleMarker();
                });

                scope.$watch(function() {
                    return LayertreeService.selectedPoiTypes;
                }, function(newVal, oldVal) {
                    if(newVal.length === 0) {
                        scope.featureGroups = featuresByExtent();
                    }
                    scope.toggleMarker();
                });

                scope.$watch('featureGroups', function(newVal, oldVal) {
                    if(scope.showFeatureContent !== false) {
                        $timeout(scope.moveContentOutofOverflow, 0, false);
                    }
                });

                scope.extent = calculateExtent(scope.map);
            }
        },
        controller: function($scope, $element, $attrs) {
            this.showListFeature = function(feature) {
                var type, osmId;
                if($scope.markerFeature !== undefined) {
                    $scope.markerFeature.set('highlightMarker', false);
                    $scope.markerFeature = undefined;
                }
                $scope.toggleMarker();

                if(feature !== undefined) {
                    type = feature.get('type');
                    osmId = feature.get('osm_id');
                    $scope.$apply(function() {
                        $scope.showGroup = type;
                        $scope.showFeatureContent = osmId;
                    });
                    $timeout($scope.moveContentOutofOverflow, 0, false);
                } else {
                    $scope.showFeatureContent = osmId;
                }


            };
            this.registerPopupScope = function(popupScope) {
                $scope.popupScope = popupScope;
            };
        }
    };
}]);

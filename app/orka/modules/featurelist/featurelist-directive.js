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

                LayertreeService.poisLoaded.then(function(topics) {
                    angular.forEach(topics, function(topic) {
                        scope.typeMap[topic.name] = topic.title;
                        if(topic.groups !== undefined) {
                            angular.forEach(topic.groups, function(group) {
                                scope.typeMap[group.type] = group.title;
                            });
                        }
                    });
                });

                scope.toggleMarker = function(feature) {
                    if(scope.showFeatureContent) {
                        var geometry = feature.getGeometry().clone();
                        if(scope.markerFeature === undefined) {
                            scope.markerFeature = new ol.Feature();
                            scope.markerLayer.getSource().addFeatures([scope.markerFeature]);
                        }
                        scope.markerFeature.setGeometry(geometry);
                    }
                    scope.markerLayer.setVisible(scope.showFeatureContent);
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
                    scope.showFeatureContent = scope.showFeatureContent === feature.get('num') ? false : feature.get('num');
                    scope.toggleMarker(feature);
                    // timeout function is runing right after scope digest completet.
                    // before digest is not complete, browser has not updated html.
                    // so element is hidden although scope.showFeatureContent is true
                    $timeout(scope.moveContentOutofOverflow, 0, false);
                };
            },
            post: function(scope, element, attr) {
                var calculateExtent = function(map) {
                    return map.getView().calculateExtent(map.getSize());
                };
                var sortFeaturesByNumValue = function(feature) {
                    return feature.get('num');
                };
                var featuresByExtent = function() {
                    var featureGroups = {};
                    if(scope.featureLayer.getVisible()) {
                        var _features = scope.featureLayer.getSource().getFeatures();
                        angular.forEach(_features, function(feature) {
                            if(ol.extent.intersects(scope.extent, feature.getGeometry().getExtent())) {
                                var featureType = feature.get('type');
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

                    return featureGroups;
                };

                scope.map.on('moveend', function(evt) {
                    scope.$apply(function() {
                        scope.extent = calculateExtent(evt.target);
                    });
                });

                scope.featureLayer.getSource().on('change', function() {
                    var features = featuresByExtent();
                    scope.$applyAsync(function() {
                        scope.featureGroups = features;
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
                    $scope.showFeatureContent = feature.get('num');
                });
                $scope.toggleMarker();
                var id = 'feature_' + feature.get('num');
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

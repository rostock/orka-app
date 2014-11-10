angular.module('anol.featurelist', [])

.directive('anolFeatureList', ['$filter', 'ConfigService', 'MapService', 'LayersService', 'LayertreeService', function($filter, ConfigService, MapService, LayersService, LayertreeService) {
    return {
        restrict: 'A',
        scope: {
            'featureLayerName': '@featureLayer',
            'markerLayerName': '@markerLayer'
        },
        transclude: true,
        templateUrl: 'anol/modules/featurelist/templates/featurelist.html',
        link: function(scope, element, attr) {
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
                // TODO improve sorting
                // using angular orderBy filter is not very fast.
                angular.forEach(featureGroups, function(features) {
                    features = $filter('orderBy')(features, sortFeaturesByNumValue, false);
                });

                return featureGroups;
            };

            scope.toggleMarker = function(feature, show) {
                show = show === false || show === undefined ? false : true;
                if(show) {
                    var geometry = feature.getGeometry().clone();
                    if(scope.markerFeature === undefined) {
                        scope.markerFeature = new ol.Feature();
                        scope.markerLayer.getSource().addFeatures([scope.markerFeature]);
                    }
                    scope.markerFeature.setGeometry(geometry);
                }
                scope.markerLayer.setVisible(show);
            };

            scope.map = MapService.getMap();
            scope.extent = calculateExtent(scope.map);

            scope.featureLayer = LayersService.layersByProperty('layer', scope.featureLayerName)[0];
            scope.markerLayer = LayersService.layersByProperty('layer', scope.markerLayerName)[0];
            scope.markerLayer.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    src: scope.marker
                })
            }));

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
                var featureListContainer = $element.find('#anol-feature-list-container');

                var currentScrollTop = featureListContainer.scrollTop();
                var containerTop = featureListContainer.offset().top;
                var elementTop = featureElement.offset().top;
                var scrollTo = (elementTop + currentScrollTop) - containerTop;

                featureListContainer.scrollTop(scrollTo);
            };
            $scope.marker = ConfigService.config.mapThemes.poiMarkerIcon;

            $scope.typeMap = {};

            LayertreeService.poisLoaded.then(function(topics) {
                angular.forEach(topics, function(topic) {
                    $scope.typeMap[topic.name] = topic.title;
                    if(topic.groups !== undefined) {
                        angular.forEach(topic.groups, function(group) {
                            $scope.typeMap[group.type] = group.title;
                        });
                    }
                });
            });
        }
    };
}]);

angular.module('anol.featurelist', [])

.directive('anolFeatureList', ['MapService', 'LayersService', function(MapService, LayersService) {
    return {
        restrict: 'A',
        scope: {
            'featureLayer': '@featureLayer'
        },
        transclude: true,
        templateUrl: 'anol/modules/featurelist/templates/featurelist.html',
        controller: function($scope, $element, $attrs) {
            var calculateExtent = function(map) {
                return map.getView().calculateExtent(map.getSize());
            };
            var featuresByExtent = function() {
                var features = [];
                if($scope.layer.getVisible()) {
                    var _features = $scope.layer.getSource().getFeatures();
                    angular.forEach(_features, function(feature) {
                        if(ol.extent.intersects($scope.extent, feature.getGeometry().getExtent())) {
                            features.push(feature);
                        }
                    });
                }
                return features;
            };

            this.scrollTo = function(feature) {
                var id = 'feature_' + feature.get('num');
                var featureElement = $element.find('#' + id);
                var featureListContainer = $element.find('#anol-feature-list-container');

                var currentScrollTop = featureListContainer.scrollTop();
                var containerTop = featureListContainer.offset().top;
                var elementTop = featureElement.offset().top;
                var scrollTo = (elementTop + currentScrollTop) - containerTop;

                featureListContainer.scrollTop(scrollTo);
            };

            $scope.map = MapService.getMap();
            $scope.extent = calculateExtent($scope.map);
            $scope.currentExtent =
            $scope.layer = LayersService.layersByProperty('layer', $scope.featureLayer)[0];

            $scope.map.on('moveend', function(evt) {
                $scope.$apply(function() {
                    $scope.extent = calculateExtent(evt.target);
                });
            });

            $scope.layer.getSource().on('change', function() {
                var features = featuresByExtent();
                $scope.$applyAsync(function() {
                    $scope.features = features;
                });
            });

            $scope.$watch('extent', function(newVal, oldVal) {
                $scope.features = featuresByExtent();
            });
        }
    };
}]);

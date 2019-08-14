angular.module('orka.layertree')
/**
 * @ngdoc directive
 * @name orka.layertree.directive:orkaLayertree
 *
 * @requires orka.layertree.LayertreeService
 * @requires orka.config.ConfigService
 *
 * @description
 * Adds a tree like themes chooser for POI- and Track-Themes
 */
.directive('orkaLayertree', ['LayertreeService', 'ConfigService', function(LayertreeService, ConfigService) {
    // used to render the tree and interact with the service above
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'src/modules/layertree/templates/layertree.html',
        scope: {},
        link: {
            pre: function(scope, element, attrs) {
                scope.title = ConfigService.config.poi.title;
                scope.plusCodes = ConfigService.config.plusCodes;
                scope.locationCode = false;
                LayertreeService.poisLoaded.then(function(pois) {
                    scope.pois = pois;
                });

                if (angular.isDefined(LayertreeService.tracksLoaded)) {
                    LayertreeService.tracksLoaded.then(function(tracks) {
                        scope.tracks = tracks;
                    });
                }
                scope.collectSelectedTypes = function(topics) {
                    var selectedTypes = [];
                    angular.forEach(topics, function(topic) {
                        if(topic.groups !== undefined) {
                            var activeGroups = 0;
                            angular.forEach(topic.groups, function(group) {
                                if(group.active === true) {
                                    selectedTypes.push(group.type);
                                    activeGroups++;
                                }
                            });
                            topic.active = activeGroups == topic.groups.length;
                        } else if(topic.active === true) {
                            selectedTypes.push(topic.type);
                        }
                    });
                    return selectedTypes;
                };
                scope.toggleTopic = function(topic) {
                    angular.forEach(topic.groups, function(group) {
                        group.active = topic.active;
                    });
                };

                scope.updatePois = function(pois) {
                    scope.selectedPoiTypes = scope.collectSelectedTypes(pois);
                    LayertreeService.updateSelectedPoiTypes(scope.selectedPoiTypes);
                };

                scope.togglePoiTopic = function(topic) {
                    scope.toggleTopic(topic);
                    scope.updatePois(scope.pois);
                };

                scope.updateTracks = function(tracks) {
                    scope.selectedTrackTypes = scope.collectSelectedTypes(tracks);
                    LayertreeService.updateSelectedTrackTypes(scope.selectedTrackTypes);
                };

                scope.toggleTrackTopic = function(topic) {
                    scope.toggleTopic(topic);
                    scope.updateTracks(scope.tracks);
                };

                scope.toggleLocationCode = function(visible) {
                    LayertreeService.updatePlusCodeVisibility(visible);
                };
            }
        }
    };
}]);

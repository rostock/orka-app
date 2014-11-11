angular.module('orka.layertree', [])

.directive('orkaLayertree', ['LayertreeService', function(LayertreeService) {
    // used to render the tree and interact with the service above
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'orka/modules/layertree/templates/layertree.html',
        scope: {},
        link: function(scope, element, attrs) {
            LayertreeService.poisLoaded.then(function(pois) {
                scope.pois = pois;
            });
            LayertreeService.tracksLoaded.then(function(tracks) {
                scope.tracks = tracks;
            });

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
                var selectedTypes = scope.collectSelectedTypes(pois);
                LayertreeService.updateSelectedPoiTypes(selectedTypes);
            };

            scope.togglePoiTopic = function(topic) {
                scope.toggleTopic(topic);
                scope.updatePois(scope.pois);
            };

            scope.updateTracks = function(tracks) {
                var selectedTypes = scope.collectSelectedTypes(tracks);
                LayertreeService.updateSelectedTrackTypes(selectedTypes);
            };

            scope.toggleTrackTopic = function(topic) {
                scope.toggleTopic(topic);
                scope.updateTracks(scope.tracks);
            };
        }
    };
}]);

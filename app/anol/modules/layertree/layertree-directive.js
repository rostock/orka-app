angular.module('anol.layertree', [])

.provider('LayertreeService', [function() {
    var _treeLayer, _topicsUrl;

    var _selectedTypes = [];

    this.setTreeLayer = function(treeLayer) {
        _treeLayer = treeLayer;
    };

    this.setTopicsUrl = function(url) {
        _topicsUrl = url;
    };

    // the dynamicGeoJSON layer needs a function at create time to add
    // aditional parameters to it's request
    this.getAdditionalParametersCallback = function() {
        return function() {
            var param = 'poi_types=' + _selectedTypes.join(',');
            return param;
        };
    };

    var LayerTree = function($q, treeLayer, topicsUrl) {
        this.$q = $q;
        this.treeLayer = treeLayer;

        this.topicsLoaded = this._loadTopics(topicsUrl);
    };
    LayerTree.prototype.updateSelectedTypes = function(selectedTypes) {
        _selectedTypes = selectedTypes;
        // TODO find a better solution to make a new request after selectedTypes has change
        // using clear result in removing all points and redraw them. So the vector data
        // are flickering
        this.treeLayer.getSource().clear();
    };
    LayerTree.prototype._loadTopics = function(url) {
        var deferred = this.$q.defer();
        $.ajax({
            url: url,
            dataType: 'json'
        }).done(function(response) {
            deferred.resolve(response.topics);
        });
        return deferred.promise;
    };

    this.$get = ['$q', function($q) {
        return new LayerTree($q, _treeLayer, _topicsUrl);
    }];
}])

.directive('anolLayertree', ['LayertreeService', function(LayertreeService) {
    // used to render the tree and interact with the service above
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'anol/modules/layertree/templates/layertree.html',
        scope: {},
        link: function(scope, element, attrs) {
            LayertreeService.topicsLoaded.then(function(topics) {
                scope.topics = topics;
            });

            scope.update = function() {
                var selectedTypes = [];
                angular.forEach(scope.topics, function(topic) {
                    angular.forEach(topic.groups, function(group) {
                        if(group.active === true) {
                            selectedTypes.push(group.type);
                        }
                    });
                });
                LayertreeService.updateSelectedTypes(selectedTypes);
            };
        }
    };
}]);

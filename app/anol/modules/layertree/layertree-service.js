angular.module('anol.layertree')

.provider('LayertreeService', [function() {
    var _poiLayer, _poisUrl, _iconBaseUrl, _tracksUrl, _trackLayer;
    var _selectedPoiTypes = [];

    this.setPoiLayer = function(poiLayer) {
        _poiLayer = poiLayer;
    };

    this.setTrackLayer = function(trackLayer) {
        _trackLayer = trackLayer;
    };

    this.setPoisUrl = function(url) {
        _poisUrl = url;
    };
    this.setTracksUrl = function(url) {
        _tracksUrl = url;
    };

    this.setIconBaseUrl = function(url) {
        _iconBaseUrl = url || '';
    };

    // the dynamicGeoJSON layer needs a function at config time to add
    // aditional parameters to it's request
    this.getAdditionalPoiParametersCallback = function() {
        return function() {
            var param = 'poi_types=' + _selectedPoiTypes.join(',');
            return param;
        };
    };

    this.$get = ['$q', function($q) {
        var LayerTree = function(poiLayer, trackLayer, poiUrl, tracksUrl, iconBaseUrl) {
            var self = this;
            this.iconBaseUrl = iconBaseUrl;
            this.poiLayer = poiLayer;
            this.trackLayer = trackLayer;
            this.typeMap = {};
            this.selectedPoiTypes = {};
            this.selectedTrackTypes = [];

            this.poiLayer.setStyle(function(feature, resolution) {
                return [new ol.style.Style({
                    image: new ol.style.Icon({
                        src: self.typeMap[feature.get('type')].icon
                    })
                })];
            });

            this.poisLoaded = this._loadPois(poiUrl);
            this.tracksLoaded = this._loadTracks(tracksUrl);
        };
        LayerTree.prototype.updateSelectedPoiTypes = function(selectedTypes) {
            // keep internal and external types in sync cause we need it both as service value
            // and as internal otherwise getAdditionalPoiParametersCallback won't work
            this.selectedPoiTypes = _selectedPoiTypes = selectedTypes;
            // TODO find a better solution to make a new request after selectedTypes has change
            // using clear result in removing all points and redraw them. So the vector data
            // are flickering
            this.poiLayer.getSource().clear();
            this.poiLayer.setVisible(_selectedPoiTypes.length > 0);
        };
        LayerTree.prototype.updateSelectedTrackTypes = function(selectedTypes) {
            var source = this.trackLayer.getSource();
            var params = source.getParams();
            this.selectedTrackTypes = selectedTypes;
            params.track_types = selectedTypes.join(',');
            this.trackLayer.setVisible(selectedTypes.length > 0);
            source.updateParams(params);
        };
        LayerTree.prototype._prepareTopics = function(topics) {
            var self = this;
            angular.forEach(topics, function(topic) {
                topic.active = false;
                if(topic.groups !== undefined) {
                    angular.forEach(topic.groups, function(group) {
                        group.active = false;
                        self.typeMap[group.type] = {
                            'icon': self.iconBaseUrl + group.icon,
                            'title': group.title
                        };
                    });
                } else {
                    self.typeMap[topic.type] = {
                        'icon': self.iconBaseUrl + topic.icon,
                        'title': topic.title
                    };
                }
            });
            return topics;
        };
        LayerTree.prototype._loadPois = function(url) {
            var self = this;
            var deferred = $q.defer();
            $.ajax({
                url: url,
                dataType: 'json'
            }).done(function(response) {
                var topics = self._prepareTopics(response.topics);
                deferred.resolve(topics);
            });
            return deferred.promise;
        };

        LayerTree.prototype._loadTracks = function(url) {
            var self = this;
            var deferred = $q.defer();
            $.ajax({
                url: url,
                dataType: 'json'
            }).done(function(response) {
                var topics = self._prepareTopics(response.topics);
                deferred.resolve(topics);
            });
            return deferred.promise;
        };
        return new LayerTree(_poiLayer, _trackLayer, _poisUrl, _tracksUrl, _iconBaseUrl);
    }];
}]);

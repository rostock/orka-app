angular.module('orka.print')

.provider('PrintService', [function() {
	var _createDownloadUrl, _checkDownloadUrl, _checkDownloadDelay;

	this.setCreateDownloadUrl = function(url) {
        _createDownloadUrl = url;
    };
    this.setCheckDownloadUrl = function(url) {
        _checkDownloadUrl = url;
    };
    this.setCheckDownloadDelay = function(delay) {
        _checkDownloadDelay = delay;
    };

    this.$get = ['$q', '$http', '$timeout', function($q, $http, $timeout) {
    	var Print = function(createDownloadUrl, checkDownloadUrl, checkDownloadDelay) {
            this.createDownloadUrl = createDownloadUrl;
            this.checkDownloadUrl = checkDownloadUrl;
            this.checkDownloadDelay = checkDownloadDelay;
        };

        // TODO move into orka namespace
        Print.prototype.createDownload = function(bounds, format, layer, streetIndex, poiTypes, trackTypes) {
            var self = this;

            var data = {
                bbox: bounds.join(','),
                scale: self.currentScale,
                format: format,
                layer: layer,
                params: {
                    'street_index': streetIndex,
                    'poi_types': poiTypes.length === 0 ? false : poiTypes.join(','),
                    'track_types': trackTypes.length === 0 ? false : trackTypes.join(','),
                }
            };

            var deferred = $q.defer();

            // promise with "success" and "error" methods (specific to $http)
            var createPromise = $http.post(self.createDownloadUrl, data);
            createPromise.success(function(data, status, headers, config) {
                var checkPromise = self.checkDownload(data.status_url);
                checkPromise.then(function(url) {
                    deferred.resolve(url);
                });
            });
            createPromise.error(function(data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        };
        // TODO move into orka namespace
        Print.prototype.checkDownload = function(statusUrl) {
            var self = this;
            var deferred = $q.defer();

            var wrapper = function() {
                var checkPromise = $http.get(self.checkDownloadUrl + statusUrl);
                checkPromise.success(function(data, status, headers, config) {

                    if(data.status !== 'done') {
                        $timeout(wrapper, self.checkDownloadDelay);
                    } else {
                        deferred.resolve(data.url);
                    }
                });
            };
            wrapper();
            return deferred.promise;
        };
        return new Print(_createDownloadUrl, _checkDownloadUrl, _checkDownloadDelay);
    }];
}]);
angular.module('orka.print')

.config(['$httpProvider', function($httpProvider) {
    
    // initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }    

    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get.pragma = 'no-cache';
}])

/**
 * @ngdoc object
 * @name orka.print.PrintServiceProvider
 */
.provider('PrintService', [function() {
	var _createDownloadUrl, _checkDownloadUrl, _checkDownloadDelay, _downloadUrl;
    /**
     * @ngdoc method
     * @name setCreateDownloadUrl
     * @methodOf orka.print.PrintServiceProvider
     *
     * @param {string} url URI to create endpoint of printqueue
     */
	this.setCreateDownloadUrl = function(url) {
        _createDownloadUrl = url;
    };
    /**
     * @ngdoc method
     * @name setCheckDownloadUrl
     * @methodOf orka.print.PrintServiceProvider
     *
     * @param {string} url URI to check endpoint of printqueue
     */
    this.setCheckDownloadUrl = function(url) {
        _checkDownloadUrl = url;
    };
    /**
     * @ngdoc method
     * @name setCheckDownloadDelay
     * @methodOf orka.print.PrintServiceProvider
     *
     * @param {number} delay Delay between request against check endpoint of printqueue
     */
    this.setCheckDownloadDelay = function(delay) {
        _checkDownloadDelay = delay;
    };
    /**
     * @ngdoc method
     * @name setDownloadUrl
     * @methodOf orka.print.PrintServiceProvider
     *
     * @param {string} url URI to download endpoint of printueue
     */
    this.setDownloadUrl = function(url) {
        _downloadUrl = url;
    };

    this.$get = ['$q', '$http', '$timeout', function($q, $http, $timeout) {
        /**
         * @ngdoc service
         * @name orka.print.PrintService
         * @requires $q
         * @requires $http
         * @requires $timeout
         *
         * @description
         * Service for comunication with printqueue
         */
        var Print = function(createDownloadUrl, checkDownloadUrl, checkDownloadDelay, downloadUrl) {
            this.status = 'waiting';
            this.abort = false;
            this.createDownloadUrl = createDownloadUrl;
            this.checkDownloadUrl = checkDownloadUrl;
            this.checkDownloadDelay = checkDownloadDelay;
            this.downloadUrl = downloadUrl;
        };
        /**
         * @ngdoc method
         * @name createDownload
         * @methodOf orka.print.PrintService
         *
         * @param {Array.<number>} bounds Map bounds to be printed
         * @param {string} format Output format
         * @param {number} scale Output map scale
         * @param {string} layer Print layer name
         * @param {string} streetIndex Create street index. Empty string when no street index should be created
         *
         * @returns {Object} promise
         *
         * @description
         * Requests the printqueue to create a download with given parameters
         */
        Print.prototype.createDownload = function(bounds, format, scale, layer, streetIndex, poiTypes) {
            var self = this;
            self.abort = false;
            self.status = 'waiting';
            var data = {
                bbox: bounds.join(','),
                scale: scale,
                format: format,
                layer: layer,
                params: {
                    'street_index': streetIndex,
                    'poi_types':  poiTypes.join(','),
                    'track_types': '',
                }
            };
            var deferred = $q.defer();
            $http.post(self.createDownloadUrl, data).then(
                function successCallback(response) {
                    var checkPromise = self.checkDownload(response.data.status_url);
                    checkPromise.then(function(url) {
                        deferred.resolve(self.downloadUrl + url);
                    });

                }, function errorCallback(response) {
                    self.status = 'error';
                    deferred.reject(response.data);
                });
            return deferred.promise;
        };
        /**
         * @ngdoc method
         * @name checkDownload
         * @methodOf orka.print.PrintService
         *
         * @param {string} statusUrl URI with download token for printqueue check endpoint
         *
         * @returns {Object} promise
         *
         * @description
         * Checks current status of requested print job. Will resolve returned promise with download url, when download ready.
         */
        Print.prototype.checkDownload = function(statusUrl) {
            var self = this;
            var deferred = $q.defer();
            var wrapper = function() {
                $http.get(self.checkDownloadUrl + statusUrl)
                    .then(function successCallback(data) {
                        if(data.status === 'done') {
                            deferred.resolve(data.url);
                        } else if(self.abort === true || data.status === 'error') {
                            self.abort = false;
                            deferred.reject('aborted');
                        } else {
                            $timeout(wrapper, self.checkDownloadDelay);
                        }
                        self.status = data.status;
                    }, function errorCallback(data) {
                        self.status = 'error';
                        deferred.reject(data);
                    });
            };
            wrapper();
            return deferred.promise;
        };
        return new Print(_createDownloadUrl, _checkDownloadUrl, _checkDownloadDelay, _downloadUrl);
    }];
}]);
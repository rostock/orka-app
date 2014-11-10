angular.module('anol.config', [])

.provider('ConfigService', [function() {
    var deferred = new $.Deferred();
    this.configLoaded = deferred.promise();

    this.config = {}; // TODO add default config here

    this.setConfig = function(config) {
        this.config = $.extend({}, this.config, config);
        if(this.config.map !== undefined && this.config.map.projection !== undefined) {
            this.config.map.projection = new ol.proj.Projection(this.config.map.projection);
            ol.proj.addProjection(this.config.map.projection);
        }
    };

    this.$get = [function() {
        return this;
    }];
}]);

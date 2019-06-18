angular.module('anol.map')

/**
 * @ngdoc object
 * @name anol.map.ControlsServiceProvider
 */
.provider('ControlsService', [function() {
    var _controls;

    /**
     * @ngdoc method
     * @name setControls
     * @methodOf anol.map.ControlsServiceProvider
     * @param {Array.<Object>} controls ol3 controls
     */
    this.setControls = function(controls) {
        _controls = controls;
    };

    this.$get = [function() {
        /**
         * @ngdoc service
         * @name anol.map.ControlsService
         *
         * @description
         * Stores ol3 controls and add them to map, if map present
         */
        var Controls = function(controls) {
            this.controls = controls || ol.control.defaults();
            this.map = undefined;
        };
        /**
         * @ngdoc method
         * @name registerMap
         * @methodOf anol.map.ControlsService
         * @param {Object} map ol3 map
         * @description
         * Register an ol3 map in `ControlsService`
         */
        Controls.prototype.registerMap = function(map) {
            this.map = map;
        };
        /**
         * @ngdoc method
         * @name addControl
         * @methodOf anol.map.ControlsService
         * @param {Object} control ol3 control
         * @description
         * Adds a single control
         */
        Controls.prototype.addControl = function(control) {
            if(this.map !== undefined) {
                this.map.addControl(control);
            }
            this.controls.push(control);
        };
        /**
         * @ngdoc method
         * @name addControls
         * @methodOf anol.map.ControlsService
         * @param {Array.<Object>} controls ol3 controls
         * @description
         * Adds an array of controls
         */
        Controls.prototype.addControls = function(controls) {
            var self = this;
            if(this.map !== undefined) {
                angular.forEach(controls, function(control) {
                    self.map.addControl(control);
                });
            }
            this.controls = this.controls.concat(controls);
        };
        return new Controls(_controls);
    }];
}]);

angular.module('anol.map')

/**
 * @ngdoc service
 * @name anol.map.ControlsService
 *
 * @description
 * Stores ol3 controls and add them to map, if map present
 */
.provider('ControlsService', [function() {
    var _controls;

    this.setControls = function(controls) {
        _controls = controls;
    };

    this.$get = [function() {
        // and this is the service part
        var Controls = function(controls) {
            this.controls = controls || ol.control.defaults();
            this.map = undefined;
        };
        /**
         * @ngdoc function
         * @name registerMap
         * @methodOf anol.map.ControlsService
         * @parameter {Object} map ol3 map object
         * @description
         * Register an ol3 map in `ControlsService`
         */
        Controls.prototype.registerMap = function(map) {
            this.map = map;
        };
        /**
         * @ngdoc function
         * @name addControl
         * @methodOf anol.map.ControlsService
         * @parameter {Object} control ol3 control object
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
         * @ngdoc function
         * @name addControls
         * @methodOf anol.map.ControlsService
         * @parameter {Array|Object} controls Array of ol3 control objects
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

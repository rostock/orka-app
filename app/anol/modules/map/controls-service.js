angular.module('anol.map')

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
        Controls.prototype.registerMap = function(map) {
            this.map = map;
        };
        Controls.prototype.addControl = function(control) {
            if(this.map !== undefined) {
                this.map.addControl(control);
            }
            this.controls.push(control);
        };
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

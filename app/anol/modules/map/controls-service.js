angular.module('anol.map')

.provider('ControlsService', [function() {
    var _controls = ol.control.defaults();

    this.setControls = function(controls) {
        _controls = controls;
    };

    // and this is the service part
    var Controls = function(controls) {
        this.controls = controls;
    };
    Controls.prototype.addControl = function(control) {
        this.controls.push(control);
    };
    Controls.prototype.addControls = function(controls) {
        this.controls = this.controls.concat(controls);
    };

    this.$get = [function() {
        return new Controls(_controls);
    }];
}]);

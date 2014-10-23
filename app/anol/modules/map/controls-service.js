angular.module('anol.map')

.provider('ControlsService', [function() {
    var _controls = [];

    this.setControls = function(controls) {
        _controls = controls;
    };

    this.$get = [function() {
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
        return new Controls(_controls);
    }];
}]);

angular.module('anol.map')

.config(function(DefaultMapName, ControlsServiceProvider) {
    ControlsServiceProvider.setDefaultMapName(DefaultMapName);
})

.provider('ControlsService', [function() {
    var _defaultMapName;
    var _controls = {};

    this.setDefaultMapName = function(name) {
        _defaultMapName = name;
    };

    this.setControls = function(controls, name) {
        name = name || _defaultMapName;

        _controls[name] = controls;
    };

    // and this is the service part
    var Controls = function(controls) {
        this.controls = controls;
    };
    Controls.prototype.addControl = function(control, name) {
        name = name || _defaultMapName;

        if(angular.isUndefined(this.controls[name])) {
            this.controls[name] = ol.control.defaults();
        }

        this.controls.push(control);
    };
    Controls.prototype.addControls = function(controls, name) {
        name = name || _defaultMapName;

        if(angular.isUndefined(this.controls[name])) {
            this.controls[name] = ol.controls.defaults();
        }
        this.controls = this.controls.concat(controls);
    };

    this.$get = [function() {
        return new Controls(_controls);
    }];
}]);

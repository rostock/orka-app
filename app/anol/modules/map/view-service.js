angular.module('anol.map')

.provider('ViewService', [function() {
    var _view = undefined;

    this.setView = function(view) {
        _view = view;
    };

    var View = function(view) {
        this.view = view;
    }

    this.$get = [function() {
        return new View(_view);
    }]
}]);

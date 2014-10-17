angular.module('anol.map')
.controller('MapController', ['$scope', 'ControlsService', function($scope, ControlsService) {
    // To be able to remove default ol controllers
    var mapOptions = {};
    mapOptions['controls'] = ControlsService.controls;

    $scope.map = new ol.Map(mapOptions);
}]);

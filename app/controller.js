angular.module('orkaApp')

.controller('appCtrl', ['$scope', '$timeout', 'MapService', 'ConfigService', function ($scope, $timeout, MapService, ConfigService) {
    $scope.selectedTab = false;
    $scope.fullscreen = true;
    $scope.printAvailable = ConfigService.config.print !== undefined;
    $scope.themesAvailable = (ConfigService.config.poi !== undefined && ConfigService.config.track !== undefined);
    $scope.showHeader = ConfigService.config.header;

    $scope.selectTab = function(tab) {
        $scope.selectedTab = tab === $scope.selectedTab ? false : tab;
        $scope.fullscreen = $scope.selectedTab === false;
    };

    $scope.$watch('fullscreen', function() {
        $timeout(function() {
            MapService.getMap().updateSize();
        }, 0, false);
    });

    $scope.appReady = true;
}]);
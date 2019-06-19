angular.module('orkaApp')

.controller('appCtrl', ['$scope', '$timeout', 'MapService', 'ConfigService', function ($scope, $timeout, MapService, ConfigService) {
    $scope.selectedTab = false;
    $scope.fullscreen = true;
    $scope.printAvailable = ConfigService.config.print !== undefined;
    $scope.themesAvailable = (ConfigService.config.poi !== undefined);
    $scope.locationsAvailable = ConfigService.config.locations !== undefined;
    $scope.showHeader = ConfigService.config.header;
    $scope.layerswitcherStatus = ConfigService.config.map.layerswitcher;
    $scope.legendStatus = ConfigService.config.map.legend;

    $scope.selectTab = function(tab) {
        $scope.selectedTab = tab === $scope.selectedTab ? false : tab;
        $scope.fullscreen = $scope.selectedTab === false;
    };

    $scope.$watch('fullscreen', function() {
        $timeout(function() {
            MapService.getMap().updateSize();
        }, 0, false);
    });

    $('body').on('click', '.orka-search-result', function(e) {
        var map = MapService.getMap();
        var x1 = parseInt($(e.target).data('x1'));
        var y1 = parseInt($(e.target).data('y1'));
        var x2 = parseInt($(e.target).data('x2'));
        var y2 = parseInt($(e.target).data('y2'));
        map.getView().fitExtent([x1, y1, x2, y2], map.getSize());
        if ($scope.searchType === 'poi') {
            var theme = $('label:contains(' + $(e.target).data('theme') + ') > :input');
            if (!theme.is(':checked'))
                $('label:contains(' + $(e.target).data('theme') + ') > :input').click();
        }
    });

    $scope.appReady = true;
}]);

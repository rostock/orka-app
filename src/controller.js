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
    
    $scope.searchInput = '';
    $scope.searchType = 'address';
    $scope.searchCurrentBboxOnly = false;
    
    $scope.search = function(query) {
        var ajaxData = {
            key: $scope.searchType === 'address' ? ConfigService.config.addressSearch.key : ConfigService.config.poiSearch.key,
            type: $scope.searchType === 'address' ? ConfigService.config.addressSearch.type : ConfigService.config.poiSearch.type,
            class: $scope.searchType === 'address' ? ConfigService.config.addressSearch.class : ConfigService.config.poiSearch.class,
            shape: $scope.searchType === 'address' ? ConfigService.config.addressSearch.shape : ConfigService.config.poiSearch.shape,
            limit: $scope.searchType === 'address' ? ConfigService.config.addressSearch.limit : ConfigService.config.poiSearch.limit,
            query: $scope.searchType === 'address' ? 'rostock,' + query : query
        };
        if ($scope.searchCurrentBboxOnly) {
            var map = MapService.getMap();
            var x1 = map.getView().calculateExtent(map.getSize())[0];
            var y1 = map.getView().calculateExtent(map.getSize())[1];
            var x2 = map.getView().calculateExtent(map.getSize())[2];
            var y2 = map.getView().calculateExtent(map.getSize())[3];
            ajaxData.bbox = x1 + ',' + y1 + ',' + x2 + ',' + y2;
            ajaxData.bbox_epsg = '25833';
        }
        $.ajax({
            url: $scope.searchType === 'address' ? ConfigService.config.addressSearch.url : ConfigService.config.poiSearch.url,
            data: ajaxData,
            dataType: 'json',
            success: function(data) {
                $scope.showSearchResults = true;
                $scope.populateSearchResults(data.features);
            }
        });
    }
    
    $scope.searchInputKeyup = function() {
        if ($scope.searchInput.length > 2) {
            var value = $scope.searchInput.toLowerCase().trim();
            if (value != '') {
                $scope.search(value);
            }
            else {
                $scope.showSearchResults = false;
            }
        }
        else {
            $scope.showSearchResults = false;
        }
    };
    
    $scope.searchChange = function() {
        $scope.searchInputKeyup();
    };
    
    $scope.populateSearchResults = function(resultsData) {
        var results = '';
        jQuery.each(resultsData, function(index, item) {
            if (item.properties.objektgruppe != 'Gemeinde') {
                var geometry = item.geometry;
                if (geometry.type === 'Point') {
                    var x1 = geometry.coordinates[0];
                    var y1 = geometry.coordinates[1];
                    var x2 = geometry.coordinates[0];
                    var y2 = geometry.coordinates[1];
                } else {
                    var x1 = geometry.coordinates[0][0][0];
                    var y1 = geometry.coordinates[0][0][1];
                    var x2 = geometry.coordinates[0][2][0];
                    var y2 = geometry.coordinates[0][2][1];
                }
                if ($scope.searchType === 'poi') {
                    results += '<li class="list-group-item feature orka-search-result" data-theme="' + item.properties.category_title + '" data-x1="' + x1 + '" data-y1="' + y1 + '" data-x2="' + x2 + '" data-y2="' + y2 + '">';
                } else {
                    results += '<li class="list-group-item feature orka-search-result" data-x1="' + x1 + '" data-y1="' + y1 + '" data-x2="' + x2 + '" data-y2="' + y2 + '">';
                }
                if ($scope.searchType === 'address') {
                    if (item.properties.objektgruppe === 'Gemeindeteil') {
                        results += '<span title="Stadtteil">&#x25cb;</span> ';
                        results += item.properties.gemeindeteil_name;
                    } else {
                        if (item.properties.objektgruppe === 'Straße')
                            results += '<span class="glyphicon glyphicon-road" title="Straße"></span> ';
                        else
                            results += '<span title="Adresse">&#x1f3e0;</span> ';
                        results += item.properties.gemeindeteil_name;
                        results += ', ';
                        results += item.properties._title_.substring(item.properties._title_.lastIndexOf(',') + 2);
                    }
                } else {
                    results += item.properties._title_;
                }
                results += '</li>';
            }
        });
        $('#orka-search-results').html(results);
    };
    
    $scope.clearSearchInput = function() {
        $scope.searchInput = '';
        $scope.showSearchResults = false;
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

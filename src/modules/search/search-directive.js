angular.module('orka.search')
/**
 * @ngdoc directive
 * @name orka.searcg.directive:orkaSearch *
 * 
 * @requires anolApi/anol.map.MapService
 * @requires orka.config.ConfigService
 *
 * @description
 * Add Search bar to the map and move map to selected result
 *
 */

.directive('orkaSearch', ['$timeout', 'ConfigService', 'MapService', function($timeout, ConfigService, MapService) {
    return {
        scope: {},
        templateUrl: 'src/modules/search/templates/search.html',
        link: {
            pre: function(scope, element, attrs) {
                scope.searchInput = undefined;
                scope.searchType = 'address';
                scope.searchCurrentBboxOnly = false;
                scope.resultData = [];
                scope.showSearchResults = false;

                function search(query) {
                    var ajaxData = {
                        key: scope.searchType === 'address' ? ConfigService.config.addressSearch.key : ConfigService.config.poiSearch.key,
                        type: scope.searchType === 'address' ? ConfigService.config.addressSearch.type : ConfigService.config.poiSearch.type,
                        class: scope.searchType === 'address' ? ConfigService.config.addressSearch.class : ConfigService.config.poiSearch.class,
                        shape: scope.searchType === 'address' ? ConfigService.config.addressSearch.shape : ConfigService.config.poiSearch.shape,
                        limit: scope.searchType === 'address' ? ConfigService.config.addressSearch.limit : ConfigService.config.poiSearch.limit,
                        query: query
                    };
                    if (scope.searchCurrentBboxOnly) {
                        var map = MapService.getMap();
                        var size = map.getView().calculateExtent(map.getSize()); 
                        var x1 = size[0];
                        var y1 = size[1];
                        var x2 = size[2];
                        var y2 = size[3];
                        ajaxData.bbox = x1 + ',' + y1 + ',' + x2 + ',' + y2;
                        ajaxData.bbox_epsg = '25833';
                    } else if (scope.searchType === 'poi') {
                        ajaxData.bbox = '206885,5890624,460857,6060841';
                        ajaxData.bbox_epsg = '25833';
                    }
                    $.ajax({
                        url: scope.searchType === 'address' ? ConfigService.config.addressSearch.url : ConfigService.config.poiSearch.url,
                        data: ajaxData,
                        dataType: 'json',
                        success: function(data) {
                            $timeout(function() {
                                scope.showSearchResults = true;
                                scope.resultData = data.features;
                            });
                        }
                    });
                }

                function querySearch(n) {
                    if (n.length >= 3) {
                        var value = n.toLowerCase().trim();
                        search(value);
                    } else {
                        scope.resultData = [];                        
                    }
                }
                
                scope.$watch('searchInput', function(n, o) {
                    if (angular.isDefined(n)) {
                        querySearch(n);
                    }
                });

                scope.$watch('searchType', function(n) {
                    if (angular.isDefined(n)) {
                        if (angular.isDefined(scope.searchInput)) {
                            querySearch(scope.searchInput);
                        }
                    }
                });

                scope.showList = function() {
                    scope.showSearchResults = true;
                };
            },
            post: function(scope) {
                scope.loadResult = function(result) {
                    var x1, y1, x2, y2;
                    if (result.geometry.type === 'Point') {
                        x1 = result.geometry.coordinates[0];
                        y1 = result.geometry.coordinates[1];
                        x2 = result.geometry.coordinates[0];
                        y2 = result.geometry.coordinates[1];
                    } else {
                        x1 = result.geometry.coordinates[0][0][0];
                        y1 = result.geometry.coordinates[0][0][1];
                        x2 = result.geometry.coordinates[0][2][0];
                        y2 = result.geometry.coordinates[0][2][1];
                    }
                    var map = MapService.getMap();
                    map.getView().fit([x1, y1, x2, y2], map.getSize());
                    scope.showSearchResults = false;
                    if (scope.searchType === 'poi') {
                        var theme = $('label:contains(' + result.properties.category_title + ') > :input');
                        if (!theme.is(':checked')) {
                            $('label:contains(' + result.properties.category_title + ') > :input').click();
                        }
                    }
                };
            }
        }
    };
}])
 
.filter('title', function() {
    return function (item) {
        var results = '';
        var gemeinde = item.properties.gemeinde_name.indexOf(',') !== -1 ? item.properties.gemeinde_name.substring(0, item.properties._title_.indexOf(',')) : item.properties.gemeinde_name;
        if (item.properties.objektgruppe === 'Gemeinde') {
            results += gemeinde;
        } else if (item.properties.objektgruppe === 'Gemeindeteil') {
            results += gemeinde;
            results += ', ';
            results += item.properties.gemeindeteil_name;
        } else {
            results += gemeinde;
            results += ', ';
            if (item.properties.gemeindeteil_name) {
                results += item.properties.gemeindeteil_name;
                results += ', ';
            }
            results += item.properties._title_.substring(item.properties._title_.lastIndexOf(',') + 2);
        }
        return results;
    };
});
  




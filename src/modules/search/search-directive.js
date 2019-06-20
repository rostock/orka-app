angular.module('orka.search')
/**
 * @ngdoc directive
 * @name orka.searcg.directive:orkaSearch *
 * 
 * @requires anolApi/anol.map.LayersFactory
 * @requires anolApi/anol.map.LayersService
 * @requires anolApi/anol.map.MapService
 * @requires orka.config.ConfigService
 *
 * @description
 * Add Search bar to the map and move map to selected result
 *
 */

.directive('orkaSearch', ['$timeout', 'LayersFactory', 'LayersService', 'ConfigService', 'MapService', 
  function($timeout, LayersFactory, LayersService, ConfigService, MapService) {
    return {
        scope: {},
        templateUrl: 'src/modules/search/templates/search.html',
        link: {
            pre: function(scope, element, attrs) {
                scope.searchInput = undefined;
                scope.hasPlusCodes = ConfigService.config.plusCodes;
                scope.searchType = 'address';
                scope.searchCurrentBboxOnly = false;
                scope.resultData = [];
                scope.showSearchResults = false;
                scope.coordSystem = '4326';
                scope.resultInside = false;
                scope.showNoResultFound = false;
                var styles = [
                    new ol.style.Style({
                      stroke: new ol.style.Stroke({
                        color: 'blue',
                        width: 3
                      }),
                      fill: new ol.style.Fill({
                        color: 'rgba(0, 0, 255, 0.1)'
                      })
                    })
                ];                
                scope.resultLayer = LayersFactory.newFeatureLayer({
                    projection: ConfigService.config.map.projection,
                    style: styles,
                    displayInLayerswitcher: false,
                    visible: true
                });
                scope.resultSource = scope.resultLayer.getSource();
                LayersService.addLayer(scope.resultLayer);

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
                        ajaxData.bbox = ConfigService.config.poiSearch.bbox.join(',');
                        ajaxData.bbox_epsg = ConfigService.config.poiSearch.bbox_epsg;
                    }
                    $.ajax({
                        url: scope.searchType === 'address' ? ConfigService.config.addressSearch.url : ConfigService.config.poiSearch.url,
                        data: ajaxData,
                        dataType: 'json',
                        success: function(data) {
                            $timeout(function() {
                                scope.showSearchResults = true;
                                scope.resultData = data.features;
                                if (scope.resultData.length == 0) {
                                    scope.showNoResultFound = true;
                                }
                            });
                        }
                    });
                }

                function searchPlusCode(query) {
                    if (query.indexOf(',') > -1) {
                        if (scope.coordSystem === '25833') {
                            var coords = query.split(',');
                            var coordstransformed = ol.proj.transform([coords[0], coords[1]], 'EPSG:25833', 'EPSG:4326');
                            query = coordstransformed.join(',');
                        }
                    }

                    var ajaxData = {
                        query: query.replace(/\s/g, "")
                    };

                    $.ajax({
                        url: ConfigService.config.plusCodesSearch.url,
                        data: ajaxData,
                        dataType: 'json',
                        success: function(data) {
                            $timeout(function() {
                                scope.resultSource.clear();
                                var coords = [data.properties.center_x, data.properties.center_y];
                                var transfomedExtent = ol.proj.transformExtent(
                                    ConfigService.config.plusCodesSearch.bbox, 'EPSG:25833', 'EPSG:4326');
                                scope.resultInside = ol.extent.containsCoordinate(transfomedExtent, coords);
                                scope.showSearchResults = true;
                                scope.resultData = data;
                            });
                        },
                        error: function() {
                            $timeout(function() {
                                scope.showNoResultFound = true;
                            });

                        }
                    });
                }

                function querySearch(n) {
                    scope.showNoResultFound = false;
                    if (n.length >= 3) {
                        var value = n.toLowerCase().trim();
                        search(value);
                    } else {
                        scope.resultData = [];                        
                    }
                }
                
                function queryPlusCode(query) {
                    if (query) {
                        scope.showSearchResults = false;
                        scope.showNoResultFound = false;
                        scope.resultData = [];
                        searchPlusCode(query);
                    }
                }

                scope.$watch('searchInput', function(n, o) {
                    if (angular.isDefined(n)) {
                        if (scope.searchType === 'address' || scope.searchType === 'poi') {
                            querySearch(n);
                        } else {
                            queryPlusCode(n);
                        }
                    }
                });

                scope.changeCoordSystem = function(n) {
                    scope.coordSystem = n;
                    queryPlusCode(scope.searchInput);
                };

                scope.$watch('searchType', function(n, o) {
                    // scope.resultSource.clear();
                    if (angular.isDefined(o)) {
                        if (o == 'pluscodes') {
                            scope.showNoResultFound = false;
                            scope.searchInput = undefined;
                            scope.showSearchResults = false;
                            scope.resultData = [];                        
                        }
                    }
                    if (angular.isDefined(n)) {
                        if (n === 'address' || n === 'poi') {
                            if (angular.isDefined(scope.searchInput)) {
                                querySearch(scope.searchInput);
                            }
                        } else if (n === 'pluscodes') {
                            scope.showNoResultFound = false;
                            scope.searchInput = undefined;
                            scope.showSearchResults = false;
                            scope.resultData = [];                        
                        }
                    }
                });

                scope.showList = function() {
                    if (scope.searchType === 'address' || scope.searchType === 'poi') {
                        scope.showSearchResults = true;
                    }
                };
            },
            post: function(scope) {
                scope.loadPlusCodeResult = function(result) {
                    if (!scope.resultInside) {
                        return;
                    }
                    var feature = new ol.Feature(new ol.geom.Polygon(result.geometry.coordinates));
                    feature.getGeometry().transform('EPSG:4326', 'EPSG:25833');
                    scope.resultSource.addFeatures([feature]);

                    var map = MapService.getMap();
                    var extent = scope.resultSource.getExtent();
                    map.getView().fit(extent, map.getSize());
                };

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
  




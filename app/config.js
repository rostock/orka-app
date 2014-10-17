angular.module('orkaApp', ['anol.map'])

.config(function (anolLayersServiceProvider) {
    anolLayersServiceProvider.setLayers([
        new ol.layer.Tile({source: new ol.source.OSM()})
    ]);
});
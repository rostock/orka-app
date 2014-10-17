angular.module('orkaApp', ['anol.map', 'anol.scaleline'])

.config(function (LayersServiceProvider, ViewServiceProvider, ControlsServiceProvider) {
    ViewServiceProvider.setView(new ol.View({
        center: [0, 0],
        zoom: 2
    }));

    LayersServiceProvider.setLayers([
        new ol.layer.Tile({source: new ol.source.OSM()})
    ]);

    ControlsServiceProvider.setControls(
        ol.control.defaults().extend([
            new ol.control.ZoomSlider()
        ])
    );
});

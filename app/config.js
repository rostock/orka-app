angular.module('orkaApp', ['anol', 'anol.map', 'anol.scaleline', 'anol.mouseposition'])

.config(['LayersServiceProvider','MapServiceProvider', 'ControlsServiceProvider', 'LayersFactoryProvider',
    function (LayersServiceProvider, MapServiceProvider, ControlsServiceProvider, LayersFactoryProvider) {
    var projection = new ol.proj.Projection({
        code: 'EPSG:25388',
        units: 'm'
    });

    var extent = [200000, 5880000, 480000, 6075000];
    var resolutions = [
        529.166666667,
        352.777777778,
        264.583333333,
        176.388888889,
        88.1944444444,
        52.9166666667,
        35.2777777778,
        28.2222222222,
        22.9305555556,
        17.6388888889,
        12.3472222222,
        8.8194444444,
        7.0555555556,
        5.2916666667,
        3.5277777778,
        2.6458333333,
        1.7638888889,
        0.8819444444,
        0.3527777778,
        0.1763888889
    ];

    MapServiceProvider.addView(new ol.View({
        projection: projection,
        center: [313282, 6003693],
        resolutions: resolutions,
        zoom: 9
    }));

    var tms = LayersFactoryProvider.newTMS({
        resolutions: resolutions,
        format: 'png',
        extent: extent,
        baseURL: 'http://geo.sv.rostock.de/geodienste/stadtplan/tms/1.0.0/',
        layer: 'stadtplan_EPSG25833',
        projection: projection
    });

    LayersServiceProvider.setLayers([
        tms
    ]);

    ControlsServiceProvider.setControls(
        ol.control.defaults().extend([
            new ol.control.ZoomSlider()
        ])
    );
}]);

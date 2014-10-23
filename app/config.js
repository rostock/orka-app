angular.module('orkaApp', ['anol', 'anol.map', 'anol.scaleline', 'anol.mouseposition', 'anol.layerswitcher', 'anol.layertree', 'anol.permalink'])

.config(['LayersServiceProvider','MapServiceProvider', 'ControlsServiceProvider', 'LayersFactoryProvider', 'LayertreeServiceProvider', 'PermalinkServiceProvider',
    function (LayersServiceProvider, MapServiceProvider, ControlsServiceProvider, LayersFactoryProvider, LayertreeServiceProvider, PermalinkServiceProvider) {
    /* extend projection to allow ol3 transforming coordinates from 25833 to 4326 or/and 3857 */
    var projection = new ol.proj.Projection({
        code: 'EPSG:25833',
        units: 'm'
    });
    ol.proj.addProjection(projection);

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

    PermalinkServiceProvider.setUrlCrs(projection.getCode());

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
        projection: projection,
        title: 'BasisLayer',
        shortcut: 'B'
    });

    var tmsGray = LayersFactoryProvider.newTMS({
        resolutions: resolutions,
        format: 'png',
        extent: extent,
        baseURL: 'http://geo.sv.rostock.de/geodienste/stadtplan/tms/1.0.0/',
        layer: 'stadtplan_greyscale_EPSG25833',
        projection: projection,
        title: 'Grauer Layer',
        shortcut: 'G'
    });

    var pois = LayersFactoryProvider.newDynamicGeoJSON({
        url: 'http://localhost:8888/proxy/http://www.orka-mv.de/citymap/poi.geojson?',
        projection: projection,
        additionalParameters: LayertreeServiceProvider.getAdditionalPoiParametersCallback(),
        title: 'POI Layer',
        visible: false
    });

    var tracks = LayersFactoryProvider.newSingleTileWMS({
        extent: extent,
        url: 'http://www.orka-mv.de/citymap/tracks',
        params: {
            'LAYERS': 'tracks',
            'TRANSPARENT': true,
            'SRS': projection.getCode()
        },
        title: 'Track Layer',
        visible: false
    });

    LayertreeServiceProvider.setPoiLayer(pois);
    LayertreeServiceProvider.setTrackLayer(tracks);
    LayertreeServiceProvider.setPoisUrl('/static/data/poi_legend_data.json');
    LayertreeServiceProvider.setTracksUrl('/static/data/track_legend_data.json');
    LayertreeServiceProvider.setIconBaseUrl('http://www.orka-mv.de/static/icons/');

    LayersServiceProvider.setLayers([
        tms,
        tmsGray,
        tracks,
        pois
    ]);

    ControlsServiceProvider.setControls(
        ol.control.defaults().extend([
            new ol.control.ZoomSlider()
        ])
    );
}])

// need to start PermalinkService, can be removed if app using PermalinkDirective (when exist)
.run(['PermalinkService', function(PermalinkService) {}]);

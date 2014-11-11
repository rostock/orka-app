angular.module('orkaApp', [
    'anol', 'anol.config', 'anol.map', 'anol.scale', 'anol.mouseposition', 'anol.layerswitcher', 'anol.permalink', 'anol.print', 
    'orka.print', 'orka.featurepopup', 'orka.featurelist', 'orka.layertree'
])

.config(['ConfigServiceProvider', function(ConfigServiceProvider) {
    ConfigServiceProvider.setConfig(orkaAppConfig);
}])

.config(['ConfigServiceProvider', 'MapServiceProvider', function(ConfigServiceProvider, MapServiceProvider) {
    MapServiceProvider.addView(new ol.View({
        projection: ConfigServiceProvider.config.map.projection,
        center: ConfigServiceProvider.config.map.center,
        resolutions: ConfigServiceProvider.config.map.resolutions,
        zoom: ConfigServiceProvider.config.map.zoom
    }));
}])

.config(['ControlsServiceProvider', function(ControlsServiceProvider) {
    ControlsServiceProvider.setControls(
        ol.control.defaults().extend([
            new ol.control.ZoomSlider()
        ])
    );
}])

.config(['ConfigServiceProvider', 'PermalinkServiceProvider', function(ConfigServiceProvider, PermalinkServiceProvider) {
    PermalinkServiceProvider.setUrlCrs(ConfigServiceProvider.config.map.projection.getCode());
}])

.config(['ConfigServiceProvider', 'LayersFactoryProvider', 'LayersServiceProvider', function(ConfigServiceProvider, LayersFactoryProvider, LayersServiceProvider) {
    var layers = [];
    angular.forEach(ConfigServiceProvider.config.backgroundLayer, function(backgroundLayer) {
        layers.push(LayersFactoryProvider.newTMS({
            projection: ConfigServiceProvider.config.map.projection,
            resolutions: ConfigServiceProvider.config.map.resolutions,
            extent: ConfigServiceProvider.config.map.extent,
            format: backgroundLayer.format,
            baseURL: backgroundLayer.baseURL,
            layer: backgroundLayer.layer,
            title: backgroundLayer.title,
            shortcut: backgroundLayer.shortcut,
            isBackground: true
        }));
    });
    LayersServiceProvider.setLayers(layers);
}])

.config(['ConfigServiceProvider', 'LayersFactoryProvider', 'LayersServiceProvider', 'LayertreeServiceProvider', function(ConfigServiceProvider, LayersFactoryProvider, LayersServiceProvider, LayertreeServiceProvider) {
    var poiLayer = LayersFactoryProvider.newDynamicGeoJSON({
        projection: ConfigServiceProvider.config.map.projection,
        url: ConfigServiceProvider.config.mapThemes.poiLayerURL,
        title: 'POI Layer',
        layer: 'poi_layer',
        visible: false,
        displayInLayerswitcher: false,
        additionalParameters: LayertreeServiceProvider.getAdditionalPoiParametersCallback(),
    });
    var trackLayer = LayersFactoryProvider.newSingleTileWMS({
        extent: ConfigServiceProvider.config.map.extent,
        url: ConfigServiceProvider.config.mapThemes.trackLayerURL,
        title: 'Track Layer',
        layer: 'track_layer',
        visible: false,
        displayInLayerswitcher: false,
        params: {
            'LAYERS': ConfigServiceProvider.config.mapThemes.trackLayerName,
            'TRANSPARENT': true,
            'SRS': ConfigServiceProvider.config.map.projection.getCode()
        }
    });
    var markerLayer = LayersFactoryProvider.newFeatureLayer({
        title: 'Marker Layer',
        layer: 'marker_layer',
        displayInLayerswitcher: false
    });

    LayertreeServiceProvider.setPoiLayer(poiLayer);
    LayertreeServiceProvider.setTrackLayer(trackLayer);
    LayertreeServiceProvider.setPoiLegendUrl(ConfigServiceProvider.config.mapThemes.poiLegendURL);
    LayertreeServiceProvider.setTrackLegendUrl(ConfigServiceProvider.config.mapThemes.trackLegendURL);
    LayertreeServiceProvider.setIconBaseUrl(ConfigServiceProvider.config.mapThemes.poiIconBaseURL);

    LayersServiceProvider.setLayers([
        poiLayer,
        trackLayer,
        markerLayer
    ]);
}])

.config(['ConfigServiceProvider', 'PrintPageServiceProvider', 'PrintServiceProvider', function(ConfigServiceProvider, PrintPageServiceProvider, PrintServiceProvider) {
    if(ConfigServiceProvider.config.print !== undefined) {
        PrintPageServiceProvider.setPageSizes(ConfigServiceProvider.config.print.pageSizes);
        PrintPageServiceProvider.setOutputFormats(ConfigServiceProvider.config.print.outputFormats);
        PrintPageServiceProvider.setDefaultScale(ConfigServiceProvider.config.print.defaultScale);
        PrintServiceProvider.setCreateDownloadUrl(ConfigServiceProvider.config.print.createURL);
        PrintServiceProvider.setCheckDownloadUrl(ConfigServiceProvider.config.print.checkURL);
        PrintServiceProvider.setCheckDownloadDelay(ConfigServiceProvider.config.print.checkDelay);
    }
}])

// need to start PermalinkService, can be removed if app using PermalinkDirective (when exist)
.run(['PermalinkService', function(PermalinkService) {}]);

angular.module('orkaApp', [
    'ui.bootstrap',
    'anol.layerswitcher', 'anol.permalink',
    'orka.config', 'orka.print', 
    'orka.featurelist', 'orka.layertree', 
    'orka.featurepopup', 'orka.mouseposition', 
    'orka.locations', 'orka.search'
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
    ControlsServiceProvider.setControls([
        new ol.control.Zoom({
            zoomInTipLabel: 'hineinzoomen',
            zoomOutTipLabel: 'herauszoomen'
        }),
        new ol.control.Rotate(),
        new ol.control.Attribution({
            collapsed: false,
            collapsible: false
        }),
        new ol.control.ZoomSlider()
    ]);
}])

.config(['ConfigServiceProvider', 'PermalinkServiceProvider', function(ConfigServiceProvider, PermalinkServiceProvider) {
    PermalinkServiceProvider.setUrlCrs(ConfigServiceProvider.config.map.projection.getCode());
}])

.config(['ConfigServiceProvider', 'LayersFactoryProvider', 'LayersServiceProvider', function(ConfigServiceProvider, LayersFactoryProvider, LayersServiceProvider) {
    var layers = [];
    angular.forEach(ConfigServiceProvider.config.backgroundLayer, function(backgroundLayer) {
        var layer;
        if(backgroundLayer.matrixSet !== undefined) {
            layer = LayersFactoryProvider.newWMTS({
                projection: ConfigServiceProvider.config.map.projection,
                resolutions: backgroundLayer.resolutions,
                extent: ConfigServiceProvider.config.map.projection.getExtent(),
                matrixIds: backgroundLayer.matrixIds,
                matrixSet: backgroundLayer.matrixSet,
                format: backgroundLayer.format,
                baseURL: backgroundLayer.baseURL,
                layer: backgroundLayer.layer,
                title: backgroundLayer.title,
                shortcut: backgroundLayer.shortcut,
                isBackground: true,
                attributions: backgroundLayer.attributions
            });
        } else {
            layer = LayersFactoryProvider.newTMS({
                projection: ConfigServiceProvider.config.map.projection,
                resolutions: ConfigServiceProvider.config.map.resolutions,
                extent: ConfigServiceProvider.config.map.projection.getExtent(),
                format: backgroundLayer.format,
                baseURL: backgroundLayer.baseURL,
                layer: backgroundLayer.layer,
                title: backgroundLayer.title,
                shortcut: backgroundLayer.shortcut,
                isBackground: true,
                attributions: backgroundLayer.attributions
            });
        }
        layer.set('printLayer', backgroundLayer.printLayer);
        layers.push(layer);
    });
    LayersServiceProvider.setLayers(layers);
}])

.config(['ConfigServiceProvider', 'LayersFactoryProvider', 'LayersServiceProvider', 'LayertreeServiceProvider', function(ConfigServiceProvider, LayersFactoryProvider, LayersServiceProvider, LayertreeServiceProvider) {
    var layers = [];
    if(ConfigServiceProvider.config.track) {
        var trackLayer = LayersFactoryProvider.newSingleTileWMS({
            extent: ConfigServiceProvider.config.map.extent,
            url: ConfigServiceProvider.config.track.layerURL,
            title: 'Track Layer',
            layer: ConfigServiceProvider.config.track.layerName,
            visible: false,
            displayInLayerswitcher: false,
            params: {
                'LAYERS': ConfigServiceProvider.config.track.layerName,
                'TRANSPARENT': true,
                'SRS': ConfigServiceProvider.config.map.projection.getCode()
            }
        });
        LayertreeServiceProvider.setTrackLayer(trackLayer);
        LayertreeServiceProvider.setTrackLegendUrl(ConfigServiceProvider.config.track.legendURL);
        layers.push(trackLayer);
    }

    if (ConfigServiceProvider.config.plusCodes !== undefined) {
        var plusCodesLayer = LayersFactoryProvider.newDynamicGeoJSON({
            projection: ConfigServiceProvider.config.map.projection,
            url: ConfigServiceProvider.config.plusCodes.layerURL,
            title: ConfigServiceProvider.config.plusCodes.title,
            layer: ConfigServiceProvider.config.plusCodes.layerName,
            visible: false,
            clearResolutions: [0.3, 2],
            displayInLayerswitcher: false,
            style: function(feature) {
                var styles = [];
                if (feature.getGeometry().getType() == 'Point') {
                    styles.push(new ol.style.Style({
                        text: new ol.style.Text({
                            font: 'bold 12px PT Sans, Verdana, sans-serif',
                            fill: new ol.style.Fill({ color: '#32285a' }),
                            stroke: new ol.style.Stroke({
                              color: '#fff', 
                              width: 1
                            }),
                            text: feature.get('name')
                          })
                      }))
                } else {
                    styles.push(new ol.style.Style({
                        stroke: new ol.style.Stroke({
                          color: '#645a8c',
                          width: 1.5
                        }),
                        fill: new ol.style.Fill({
                          color: 'rgba(0, 0, 255, 0.1)'
                        })
                      }))
                }
                return styles;
            },            
        });
        layers.push(plusCodesLayer);
        LayertreeServiceProvider.setPlusCodesLayer(plusCodesLayer);
    }

    if (ConfigServiceProvider.config.poi !== undefined) {
        var poiLayer = LayersFactoryProvider.newDynamicGeoJSON({
            projection: ConfigServiceProvider.config.map.projection,
            url: ConfigServiceProvider.config.poi.layerURL,
            title: 'POI Layer',
            layer: ConfigServiceProvider.config.poi.layerName,
            visible: false,
            displayInLayerswitcher: false,
            additionalParameters: LayertreeServiceProvider.getAdditionalPoiParametersCallback(),
        });
        layers.push(poiLayer);
        LayertreeServiceProvider.setPoiLegendUrl(ConfigServiceProvider.config.poi.legendURL);
        LayertreeServiceProvider.setPoiLayer(poiLayer);
        LayertreeServiceProvider.setIconBaseUrl(ConfigServiceProvider.config.poi.iconBaseURL);
    }

    LayersServiceProvider.setLayers(layers);
}])

.config(['ConfigServiceProvider', 'PrintPageServiceProvider', 'PrintServiceProvider', function(ConfigServiceProvider, PrintPageServiceProvider, PrintServiceProvider) {
    if(ConfigServiceProvider.config.print !== undefined) {
        PrintPageServiceProvider.setPageSizes(ConfigServiceProvider.config.print.pageSizes);
        PrintPageServiceProvider.setOutputFormats(ConfigServiceProvider.config.print.outputFormats);
        PrintPageServiceProvider.setDefaultScale(ConfigServiceProvider.config.print.defaultScale);
        PrintPageServiceProvider.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: ConfigServiceProvider.config.print.style.fillColor
            }),
            stroke: new ol.style.Stroke({
                color: ConfigServiceProvider.config.print.style.strokeColor,
                width: ConfigServiceProvider.config.print.style.strokeWidth
            }),
            image: new ol.style.Circle({
                radius: ConfigServiceProvider.config.print.style.pointRadius,
                cursor: ConfigServiceProvider.config.print.style.pointCursor,
                fill: new ol.style.Fill({
                    color: ConfigServiceProvider.config.print.style.pointFillColor
                }),
                stroke: new ol.style.Stroke({
                    color: ConfigServiceProvider.config.print.style.pointStrokeColor,
                    width: ConfigServiceProvider.config.print.style.pointStrokeWidth
                })
            })
        }));

        PrintServiceProvider.setCreateDownloadUrl(ConfigServiceProvider.config.print.createURL);
        PrintServiceProvider.setCheckDownloadUrl(ConfigServiceProvider.config.print.checkURL);
        PrintServiceProvider.setCheckDownloadDelay(ConfigServiceProvider.config.print.checkDelay);
        PrintServiceProvider.setDownloadUrl(ConfigServiceProvider.config.print.downloadURL);
    }
}])

// need to start PermalinkService, can be removed if app using PermalinkDirective (when exist)
.run(['PermalinkService', function(PermalinkService) {}]);

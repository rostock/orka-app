angular.module('orka.config')

/**
 * @ngdoc object
 * @name orka.config.ConfigServiceProvider
 */
.provider('ConfigService', [function() {
    /**
     * @ngdoc object
     * @name config
     * @propertyOf orka.config.ConfigServiceProvider
     *
     * @description
     * This object contains all configurateble values for orka-app.
     *
     * Most values can be set using {@link orka.config.ConfigServiceProvider#methods_setConfig `setConfig()`}.
     *
     * Below the config structure is documented.
     *
     * - **map** - {Object} - Containing configurations for ol.Map and ol.View
     *   - projection - {Object} - ol.proj.Projection object containing app projection
     *   - extent - {Array.<number>} - View extent
     *   - resolutions - {Array.<number>} - Resolutions used in view
     *   - center - {Array.<number} - Initial center
     *   - zoom - {number} - Initial zoom
     * - **attributions** - {Array.<string>|string} - Attributions added to all background layer
     * - **backgroundLayer** - {Object} - Available background layer configuration. At the moment, only {@link anolApi/anol.map.LayersFactory#methods_newTMS `TMS layer`} supported.
     * - **poi** - {Object} - Configuration of POI map themes.
     *   - layerURL - {string} - URI to poi request backend
     *   - layerName - {string} - Name of layer POIs shown in
     *   - iconBaseURL - {string} - Base URI of used POI-icons
     *   - markerIcon - {string} - URI to used marker icon for highlighting selected POIs
     *   - legendURL - {string} - URI to POI-legend JSON
     *   - symbolAnchor - {Array.<number>} - Placement offset of POI-icons
     *   - markerAnchor - {Array.<number>} - Placement offset of highlight marker icon
     * - **track** - {Object} - Configuration if Track map themes.
     *   - layerURL - {string} - URI to track request backend
     *   - layerName - {string} - Name of layer tracks shown in
     *   - legendURL - {string} - URI to Track-legend json
     * - **print** - {Object} - Configuration of print module
     *   - maxPageSize - {number} - Largest printable page size in square mm
     *   - defaultScale - {number} - Initial scale factor
     *   - createURL - {string} - URI to create endpoint of printqueue
     *   - checkURL - {string} - URI to check endpoint of printqueue to receive current state of requested document
     *   - downloadURL - {string} - URI to download endpoint in printqueue for downloading requested document
     *   - checkDelay - {number} - Time in ms between requests to `checkURL`
     *   - pageSizes - {Array.<Object>} - List of available default print page sizes. See {@link anolApi/anol.print.PrintPageServiceProvider#methods_setPageSizes `PrintPageServiceProvider.setPageSizes`}
     *   - outputFormats - {Array.<Object>} - List of available output formats. See {@link anolApi/anol.print.PrintPageServiceProvider#methods_setOutputFormats `PrintPageServiceProvider.setOutputFormats`}
     *   - style - {Object} - Styling of print area geometry in map
     *     - fillColor {string} - RGBA value for area color
     *     - strokeColor {string} - RGBA value for area outline color
     *     - strokeWidth {number} - Width of area outline
     *     - pointRadius {number} - Radius of draggable points
     *     - pointCursor {string} - Define which cursur apears when mouse over draggeble point
     *     - pointFillColor {string} - RGBA value for point area color
     *     - pointStrokeColor {string} - RGBA value for point outline color
     *     - pointStrokeWidth {number} - Width of point outline
     * - **popup** - {Object} - Configuration of feature popup
     *   - positioning - {string} - Popup placement type. Currently only `center-left` supported. See {@link http://openlayers.org/en/v3.0.0/apidoc/ol.html#OverlayPositioning `ol3 Overlay positioning`} for valid values.
     *   - offset - {Array.<number>} - Popup placement offset.
     *   - buffer - {Array.<number>} - Min distance between popup element and map border for automatical popup movement into view.
     */
    this.config = {};

    var maxResolution = 4891.96981025;
    var mapResolutions = [];
    var matrixIds = [];

    // calculate the resoltuion
    for (var i = 0; i < 15; i++) {
        matrixIds[i] = i.toString();
        mapResolutions[i] = maxResolution / Math.pow(2, i);
    }
    var minZoomLevel = 6;
    var layerResolution = mapResolutions.slice(minZoomLevel, mapResolutions.length);
    var layerMatrixIds = matrixIds.slice(minZoomLevel, matrixIds.length);

    var defaults = {
        map: {
            projection: new ol.proj.Projection({
                code: 'EPSG:25833',
                units: 'm',
                extent: [-464849.38, 5057815.86858, 787494.891424, 6310160.14]
            }),
            resolutions:  layerResolution,
            center: [313282, 6003693],
            zoom: 2
        },
        attributions: [
            '<div>Kartenbild © Hanse- und Universitätsstadt Rostock (<a rel="license" target="_blank" href="http://creativecommons.org/licenses/by/4.0/deed.de">CC BY 4.0</a>)<div>',
            '<div>Kartendaten © <a target="_blank" href="http://www.openstreetmap.org">OpenStreetMap</a> (<a rel="license" target="_blank" href="http://opendatacommons.org/licenses/odbl">ODbL</a>) und LkKfS-MV</div>',
            '<div>Daten für Overlay-Themen © OpenStreetMap (ODbL)</div>'
        ],
        backgroundLayer: {
            'ORKA_STADTPLAN': {
                baseURL: 'https://www.orka-mv.de/geodienste/orkamv/wmts',
                layer: 'orkamv',
                matrixSet: 'epsg_25833_adv',
                resolutions: layerResolution,
                matrixIds: layerMatrixIds,
                format: 'png',
                title: 'ORKa.MV',
                shortcut: 'S',
                printLayer: 'orkamv-printqueue'
            },
            'ORKA_STADTPLAN_OHNE_TEXT': {
                baseURL: 'https://www.orka-mv.de/geodienste/orkamv/wmts',
                layer: 'orkamv-ohnetext',
                matrixSet: 'epsg_25833_adv',
                resolutions: layerResolution,
                matrixIds: layerMatrixIds,
                format: 'png',
                title: 'ORKa.MV ohne Text',
                shortcut: 'O',
                printLayer: 'orkamv-printqueue-ohnetext'
            },
            'ORKA_STADTPLAN_GRAU': {
                baseURL: 'https://www.orka-mv.de/geodienste/orkamv/wmts',
                layer: 'orkamv-graustufen',
                matrixSet: 'epsg_25833_adv',
                resolutions: layerResolution,
                matrixIds: layerMatrixIds,
                format: 'png',
                title: 'ORKa.MV in Graustufen',
                shortcut: 'G',
                printLayer: 'orkamv-printqueue-graustufen'
            }
        },
        poi: {
            layerName: 'poi_layer',
            layerURL: '/citymap/poi.geojson?',
            iconBaseURL: '/app/icons/',
            markerIcon: 'img/highlightMarker.png',
            legendURL: 'js/poi_legend_data.json',
            symbolAnchor: [10, 26],
            markerAnchor: [17, 33]
        },
        track: {
            layerURL: '/citymap/tracks',
            layerName: 'tracks',
            legendURL: 'data/track_legend_data.json'
        },
        print: {
            maxPageSize: 200000,
            defaultScale: 250000,
            maxScale: 250000,
            minScale: 500,
            createURL: '/printqueue/print',
            checkURL: '',
            downloadURL: '',
            checkDelay: 1000,
            pageSizes: [{
                'label': 'A4',
                'icon': 'glyphicon-resize-vertical',
                'value': [210, 297]
            }, {
                'label': 'A4',
                'icon': 'glyphicon-resize-horizontal',
                'value': [297, 210]
            }, {
                'label': 'A3',
                'icon': 'glyphicon-resize-vertical',
                'value': [297, 420]
            }, {
                'label': 'A3',
                'icon': 'glyphicon-resize-horizontal',
                'value': [420, 297]
            }],
            outputFormats: [{
                'label': 'PDF',
                'value': 'pdf'
            },
            {
                'label': 'JPG',
                'value': 'jpg'
            },
            {
                'label': 'PNG',
                'value': 'png'
            },
            {
                'label': 'SVG',
                'value': 'svg'
            },
            {
                'label': 'TIFF',
                'value': 'tiff'
            }],
            style: {
                fillColor: 'rgba(255, 255, 255, 0.4)',
                strokeColor: 'rgba(0, 0, 0, 1)',
                strokeWidth: 1,
                pointRadius: 5,
                pointCursor: 'pointer',
                pointFillColor: 'rgba(255, 255, 255, 1)',
                pointStrokeColor: 'rgba(0, 0, 0, 1)',
                pointStrokeWidth: 1
            }
        },
        popup: {
            positioning: 'center-left',
            offset: [10, -15],
            buffer: [5, 5, 5, 5]
        }
    };

    /**
     * @ngdoc method
     * @name setConfig
     * @methodOf orka.config.ConfigServiceProvider
     *
     * @param {Object} config
     * - **header** - {string|boolean} - If containing '0px' header is set to false, otherwise it will be true
     * - **map** - {Object} - Containing map related configurations
     *   - **center** - {Array.<number>} - Initial map center
     *   - **zoom** - {number} - Initial map zoom
     *   - **layers** - {Array.<string>} - Background layer names to include in map
     *   - **attributions** - {Array.<string>|string} - Map attributions
     *   - **openLayerswitcher** - {boolean} - Expand layerswitcher at startup
     *   - **openLegend** - {boolean} - Expand legend at startup
     * - **locations** - {string} - Path/url to geojson containing locations
     * - **themes** - {boolean} - Activate themes module
     * - **print** - {boolean} - Activate print module
     */
    this.setConfig = function(config) {
        var self = this;
        if(config.header === undefined) {
            self.config.header = true;
        } else {
            self.config.header = config.header.height === '0px' ? false : true;
        }
        if(config.fullConfig === true) {
            self.config = $.extend({}, config);
        } else {
            self.config.popup = $.extend({}, defaults.popup);
            self.config.map = $.extend({}, defaults.map);
            self.config.backgroundLayer = [];
            if(config.map !== undefined) {
                if(config.map.center !== undefined) {
                    self.config.map.center = config.map.center;
                }
                if(config.map.zoom !== undefined) {
                    self.config.map.zoom = config.map.zoom;
                }
                angular.forEach(config.map.layers, function(layerName) {
                    var layer = defaults.backgroundLayer[layerName];
                    layer.attributions = config.map.attributions || defaults.attributions;
                    self.config.backgroundLayer.push(layer);
                });
                if(config.map.openLayerswitcher !== undefined) {
                    self.config.map.layerswitcher = config.map.openLayerswitcher === true ? 'open' : 'closed';
                }
                if(config.map.openLegend !== undefined) {
                    self.config.map.legend = config.map.openLegend === true ? 'open' : 'closed';
                }
            }
            if(config.locations !== undefined) {
                self.config.locations = config.locations;
            }
            if(config.themes === true) {
                self.config.poi = $.extend({}, defaults.poi);
                if(config.poi !== undefined && config.poi.legendURL !== undefined) {
                    self.config.poi.legendURL = config.poi.legendURL;
                }
                self.config.track = $.extend({}, defaults.track);
            }
            if(config.print === true) {
                self.config.print = $.extend({}, defaults.print);
            }
        }
    };

    this.$get = [function() {
        /**
         * @ngdoc service
         * @name orka.config.ConfigService
         * @description
         * Service to receive config
         */

        /**
         * @ngdoc object
         * @name config
         * @propertyOf orka.config.ConfigService
         * @description
         * `ConfigService.config` is the same object as {@link orkaApi/orka.config.ConfigServiceProvider#properties_config `ConfigServiceProvider.config`}.
         */
        return this;
    }];
}]);

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
     *   - defaultScale - {number} - Initial scale factor
     *   - createURL - {string} - URI to create endpoint of printqueue
     *   - checkURL - {string} - URI to check endpoint of printqueue to receive current state of requested document
     *   - downloadURL - {string} - URI to download endpoint in printqueue for downloading requested document
     *   - checkDelay - {number} - Time in ms between requests to `checkURL`
     *   - pageSizes - {Array.<Object>} - List of available default print page sizes. See {@link anolApi/anol.print.PrintPageServiceProvider#methods_setPageSizes `PrintPageServiceProvider.setPageSizes`}
     *   - outputFormats - {Array.<Object>} - List of available output formats. See {@link anolApi/anol.print.PrintPageServiceProvider#methods_setOutputFormats `PrintPageServiceProvider.setOutputFormats`}
     * - **popup** - {Object} - Configuration of feature popup
     *   - positioning - {string} - Popup placement type. Currently only `center-left` supported. See {@link http://openlayers.org/en/v3.0.0/apidoc/ol.html#OverlayPositioning `ol3 Overlay positioning`} for valid values.
     *   - offset - {Array.<number>} - Popup placement offset.
     *   - buffer - {Array.<number>} - Min distance between popup element and map border for automatical popup movement into view.
     */
    this.config = {};
    var defaults = {
        map: {
            projection: new ol.proj.Projection({
                code: 'EPSG:25833',
                units: 'm'
            }),
            extent: [200000, 5880000, 480000, 6075000],
            resolutions:  [
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
            ],
            center: [313282, 6003693],
            zoom: 9
        },
        attributions: [
            '<div>Kartenbild © Hansestadt Rostock (<a target="_blank" href="http://creativecommons.org/licenses/by/3.0/deed.de">CC BY 3.0</a>)<div>',
            '<div>Kartendaten © <a target="_blank" href="http://www.openstreetmap.org/">OpenStreetMap</a>(<a target="_blank" href="http://opendatacommons.org/licenses/odbl/">ODbL</a>) und <a target="_blank" href="https://geo.sv.rostock.de/uvgb.html">uVGB-MV</a></div>'
        ],
        backgroundLayer: {
            'ORKA_STADTPLAN': {
                baseURL: 'http://10.1.1.49:8080/tms/1.0.0',
                layer: 'stadtplan_EPSG25833',
                format: 'png',
                title: 'Stadtplan',
                shortcut: 'S',
                printLayer: 'mvp-mapserver-print'
            },
            'ORKA_STADTPLAN_OHNE_TEXT': {
                baseURL: 'http://10.1.1.49:8080/tms/1.0.0',
                layer: 'stadtplan_notext_EPSG25833',
                format: 'png',
                title: 'Stadtplan ohne Text',
                shortcut: 'S',
                printLayer: 'mvp-mapserver-notext-print'
            },
            'ORKA_STADTPLAN_SCHUMMERUNG': {
                baseURL: 'http://10.1.1.49:8080/tms/1.0.0',
                layer: 'stadtplan_hillshade_EPSG25833',
                format: 'png',
                title: 'Stadtplan Schummerung',
                shortcut: 'S',
                printLayer: 'mvp-mapserver-hillshade-print'
            },
            'ORKA_STADTPLAN_SCHUMMERUNG_OHNE_TEXT': {
                baseURL: 'http://10.1.1.49:8080/tms/1.0.0',
                layer: 'stadtplan_hillshade_notext_EPSG25833',
                format: 'png',
                title: 'Stadtplan Schummerung ohne Text',
                shortcut: 'S',
                printLayer: 'mvp-mapserver-hillshade-notext-print'
            },
            'ORKA_STADTPLAN_GRAU': {
                baseURL: 'http://10.1.1.49:8080/tms/1.0.0',
                layer: 'stadtplan_grau_EPSG25833',
                format: 'png',
                title: 'Stadtplan Grau',
                shortcut: 'G',
                printLayer: 'mvp-mapserver-grayscale-print'
            },
            'ORKA_STADTPLAN_GRAU_OHNE_TEXT': {
                baseURL: 'http://10.1.1.49:8080/tms/1.0.0',
                layer: 'stadtplan_grau_notext_EPSG25833',
                format: 'png',
                title: 'Stadtplan Grau ohne Text',
                shortcut: 'S',
                printLayer: 'mvp-mapserver-grayscale-notext-print'
            }
        },
        poi: {
            layerURL: 'http://10.1.1.49:8888/proxy/http://10.1.1.49:4000/poi.geojson?',
            iconBaseURL: 'http://www.orka-mv.de/static/icons/',
            markerIcon: '/static/img/highlightMarker.png',
            legendURL: '/static/data/poi_legend_data.json',
            symbolAnchor: [10, 26],
            markerAnchor: [17, 33]
        },
        track: {
            layerURL: 'http://www.orka-mv.de/citymap/tracks',
            layerName: 'tracks',
            legendURL: '/static/data/track_legend_data.json'
        },
        print: {
            defaultScale: 250000,
            createURL: 'http://10.1.1.49:8888/proxy/http://10.1.1.49:5000/print',
            checkURL: 'http://10.1.1.49:8888/proxy/http://10.1.1.49:5000',
            downloadURL: 'http://10.1.1.49:8888/proxy/http://10.1.1.49:5000',
            checkDelay: 2000,
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
                'label': 'PNG',
                'value': 'png'
            }]
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
     *   - **openLayerswitcher** - {boolean} - Expand layerswitcher at startup
     *   - **openLagend** - {boolean} - Expand legend at startup
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
                layer.attributions = config.attributions || defaults.attributions;
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
            self.config.poi = $.extend({}, defaults.poi, config.poi);
            self.config.track = $.extend({}, defaults.track, config.track);
        }
        if(config.print === true) {
            self.config.print = $.extend({}, defaults.print);
        }
        ol.proj.addProjection(self.config.map.projection);
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

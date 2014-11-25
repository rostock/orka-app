angular.module('orka.config', [])

.provider('ConfigService', [function() {
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
                layer: 'stadtplan_hillshade_EPSG25833',
                format: 'png',
                title: 'Stadtplan',
                shortcut: 'S',
                printLayer: 'mvp-mapserver-print'
            },
            'ORKA_STADTPLAN_GRAU': {
                baseURL: 'http://10.1.1.49:8080/tms/1.0.0',
                layer: 'stadtplan_grau_EPSG25833',
                format: 'png',
                title: 'Stadtplan Grau',
                shortcut: 'G',
                printLayer: 'mvp-mapserver-greyscale-print'
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
            offset: [10, 0],
            buffer: [5, 5, 5, 5]
        }
    };

    this.setConfig = function(config) {
        var self = this;
        self.config.popup = $.extend({}, defaults.popup);
        self.config.map = $.extend({}, defaults.map, config.map);
        self.config.backgroundLayer = [];
        angular.forEach(config.layers, function(layerName) {
            var layer = defaults.backgroundLayer[layerName];
            layer.attributions = config.attributions || defaults.attributions;
            self.config.backgroundLayer.push(layer);
        });
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
        return this;
    }];
}]);

var orkaAppConfig = {
    map: {
        projection: {
            code: 'EPSG:25833',
            units: 'm'
        },
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
        // TODO attribution
    },
    backgroundLayer: [{
        baseURL: 'http://geo.sv.rostock.de/geodienste/stadtplan/tms/1.0.0/',
        layer: 'stadtplan_EPSG25833',
        format: 'png',
        title: 'Stadtplan',
        shortcut: 'S'
    }, {
        baseURL: 'http://geo.sv.rostock.de/geodienste/stadtplan/tms/1.0.0/',
        layer: 'stadtplan_greyscale_EPSG25833',
        format: 'png',
        title: 'Stadtplan Grau',
        shortcut: 'G'
    }],
    mapThemes: {
        poiLayerURL: 'http://localhost:8888/proxy/http://localhost:4000/poi.geojson?',
        poiIconBaseURL: 'http://www.orka-mv.de/static/icons/',
        poiMarkerIcon: '/static/img/marker.svg',
        poiLegendURL: '/static/data/poi_legend_data.json',
        trackLayerURL: 'http://www.orka-mv.de/citymap/tracks',
        trackLayerName: 'tracks',
        trackLegendURL: '/static/data/track_legend_data.json'
    },
    print: {
        defaultScale: 250000,
        createURL: '/print',
        checkURL: '',
        checkDelay: 2000,
        pageSizes: [{
            'label': 'DIN A4 Hoch',
            'icon': 'glyphicon-resize-horizontal',
            'value': [210, 297]
        }, {
            'label': 'DIN A4 Quer',
            'icon': 'glyphicon-resize-vertical',
            'value': [297, 210]
        }],
        outputFormats: [{
            'label': 'PDF',
            'value': 'pdf'
        },
        {
            'label': 'PNG',
            'value': 'png'
        }]
    }
};

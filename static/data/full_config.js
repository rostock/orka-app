// Konfigurationsobject für die ORKaApp
// Dieser muss immer 'orkaAppConfig' lauten
var orkaAppConfig = {
    // Einstellungen für die Karte
    map: {
        // Initiales Zentrum der Karte
        center: [313282, 6003693],
        // Initiales Zoomlevel der Karte
        zoom: 1,
        // Aktivieren der Hintergrundlayer der Anwendung
        // jeder Hintergrundlayer ist gleichzeitig ein Drucklayer
        layers: [
            'ORKA_STADTPLAN',
            'ORKA_STADTPLAN_OHNE_TEXT',
            'ORKA_STADTPLAN_GRAU'
        ],
        // Festlegung der Kartenattributionen
        attributions: [
            '<div>Kartenbild © Hanse- und Universitätsstadt Rostock (<a rel="license" target="_blank" href="http://creativecommons.org/licenses/by/4.0/deed.de">CC BY 4.0</a>)<div>',
            '<div>Kartendaten © <a target="_blank" href="http://www.openstreetmap.org">OpenStreetMap</a> (<a rel="license" target="_blank" href="http://opendatacommons.org/licenses/odbl">ODbL</a>) und LkKfS-MV</div>',
            '<div>Daten für Overlay-Themen © OpenStreetMap (ODbL)</div>',
            '<div>Gitternetz berechnet mit <a href="https://plus.codes">Plus Codes</a></div>'
        ],
        // Anwendung startet mit geöffneten Layerswitcher, sofern vorhanden
        openLayerswitcher: true,
        // Anwendung startet mit geöffneter Legende, sofern vorhanden
        openLegend: true
    },
    // Einstellungen für den Header der Anwendung
    header: {
        // Höhe des Headers. Die Angabe erfolgt in Pixel und muss mit 'px' enden
        height: '50px',
        // Abstand des Textes im Header zum oberen Browserfensterrand
        paddingTop: '10px',
        // Text der im Header stehen soll
        text: 'ORKa.MV – Offene Regionalkarte Mecklenburg-Vorpommern'
    },
    // Aktivieren des Druckmoduls.
    // Weglassen oder ein anderer Wert als 'true'
    // deaktiviert das Druckmodul.
    print: true,
    // Aktivieren der Kartenthemen-Modul.
    // Weglassen oder ein anderer Wert als 'true'
    // deaktiviert das Kartenthemen-Modul.
    themes: true,
    // Zu verwendende POIs Definition
    poi: {
        title: 'Themen',
        layerName: 'poi_layer',
        layerURL: 'poi.geojson?',
        markerIcon: 'static/img/highlightMarker.png',
        legendURL: '/static/data/poi_legend_data.json',
        symbolAnchor: [10, 26],
        markerAnchor: [17, 33]
    },
    printConfig: {
        maxPageSize: 200000,
        defaultScale: 250000,
        maxScale: 250000,
        minScale: 500,
        createURL: 'http://localhost:8888/proxy/http://localhost:5000/print',
        checkURL: 'http://localhost:8888/proxy/http://localhost:5000',
        downloadURL: 'http://localhost:8888/proxy/http://localhost:5000',
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
    track: {
        layerURL: '/tracks',
        layerName: 'tracks',
        legendURL: 'data/track_legend_data.json'
    },
    // Pfad zu GeoJSON mit Polygonen für "Ortliste"
    // Wenn nicht vorhanden ist das Ortemodul deaktiviert
    locations: {
        url: 'data/locations.geojson',
        title: 'verfügbare Bereiche'
    },
    // Open Location Code (Plus Codes) in der Themenauswahl anzeigen und suchen
    plusCodes: {
        title: 'Plus Codes',
        layerName: 'pc_layer',
        // layerURL: 'citymap/olc.geojson?',
        layerURL: 'http://localhost:8888/proxy/http://localhost:4000/olc.geojson?',
    },
    // Plus Code Suche
    plusCodesSearch: {
        url: 'https://geo.sv.rostock.de/olca/',
        bbox: [206885,5890624,460857,6060841],
    },
    // Adressensuche
    addressSearch: {
        url: 'https://geo.sv.rostock.de/geocodr/query',
        key: '5c5281c45c5f4a729e8ecdb716637859',
        type: 'search',
        class: 'address',
        shape: 'bbox',
        limit: '10'
    },
    // POI-Suche
    poiSearch: {
        url: 'https://geo.sv.rostock.de/geocodr/query',
        key: '5c5281c45c5f4a729e8ecdb716637859',
        type: 'search',
        class: 'orka-app',
        shape: 'bbox',
        limit: '10',
        bbox: [206885,5890624,460857,6060841],
        bbox_epsg: '25833'
    }
};
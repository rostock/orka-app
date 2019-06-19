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
            'ORKA_STADTPLAN'
        ],
        // Festlegung der Kartenattributionen
        attributions: [
            '<div>Kartenbild © Hanse- und Universitätsstadt Rostock (<a rel="license" target="_blank" href="http://creativecommons.org/licenses/by/4.0/deed.de">CC BY 4.0</a>)<div>',
            '<div>Kartendaten © <a target="_blank" href="http://www.openstreetmap.org">OpenStreetMap</a> (<a rel="license" target="_blank" href="http://opendatacommons.org/licenses/odbl">ODbL</a>) und LkKfS-MV</div>',
            '<div>Daten für Overlay-Themen: Hanse- und Universitätsstadt Rostock und <a target="_blank" href="meta/sbz.php">SBZ-HRO</a> (<a rel="license" target="_blank" href="https://creativecommons.org/publicdomain/zero/1.0/deed.de">CC0 1.0</a>), © OpenStreetMap (ODbL)</div>'
        ],
        // Anwendung startet mit geöffneten Layerswitcher, sofern vorhanden
        openLayerswitcher: true,
        // Anwendung startet mit geöffneter Legende, sofern vorhanden
        openLegend: true
    },
    // Einstellungen für den Header der Anwendung
    header: {
        // Höhe des Headers. Die Angabe erfolgt in Pixel und muss mit 'px' enden
        height: '80px',
        // Abstand des Textes im Header zum oberen Browserfensterrand
        paddingTop: '10px',
        // Text der im Header stehen soll
        text: 'Stadtteillotse Rostock'
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
        legendURL: 'data/poi_legend_data.json',
        title: 'Was suchen Sie?'
    },
    track: false,
    // Pfad zu GeoJSON mit Polygonen für "Ortliste"
    // Wenn nicht vorhanden ist das Ortemodul deaktiviert
    locations: {
        url: 'data/locations.geojson',
        title: false
    },
    // Adressensuche
    addressSearch: {
        url: 'https://geo.sv.rostock.de/geocodr/query',
        key: '5c5281c45c5f4a729e8ecdb716637859',
        type: 'search',
        class: 'address_hro',
        shape: 'bbox',
        limit: '10'
    },
    // POI-Suche
    poiSearch: {
        url: 'https://geo.sv.rostock.de/geocodr/query',
        key: '5c5281c45c5f4a729e8ecdb716637859',
        type: 'search',
        class: 'stadtteillotse',
        shape: 'bbox',
        limit: '10'
    }
};
// Konfigurationsobject für die ORKaApp
// Dieser muss immer 'orkaAppConfig' lauten
var orkaAppConfig = {
    // Einstellungen für die Karte
    map: {
        // Initiales Zentrum der Karte
        center: [312313.88958, 5996030.31389],
        // Initiales Zoomlevel der Karte
        zoom: 14,
        // Aktivieren der Hintergrundlayer der Anwendung
        // jeder Hintergrundlayer ist gleichzeitig ein Drucklayer
        layers: [
            'ORKA_STADTPLAN',
            'ORKA_STADTPLAN_OHNE_TEXT',
            'ORKA_STADTPLAN_GRAU',
            'ORKA_STADTPLAN_GRAU_OHNE_TEXT',
            'ORKA_STADTPLAN_SCHUMMERUNG',
            'ORKA_STADTPLAN_SCHUMMERUNG_OHNE_TEXT'
        ],
        // Festlegung der Kartenattributionen
        attributions: [
            '<div>Kartenbild © Hansestadt Oldenburg (<a target="_blank" href="http://creativecommons.org/licenses/by/3.0/deed.de">CC BY 3.0</a>)<div>',
            '<div>Kartendaten © <a target="_blank" href="http://www.openstreetmap.org/">OpenStreetMap</a>(<a target="_blank" href="http://opendatacommons.org/licenses/odbl/">ODbL</a>) und <a target="_blank" href="https://geo.sv.rostock.de/uvgb.html">uVGB-MV</a></div>'
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
        paddingTop: '12px',
        // Text der im Header stehen soll
        text: 'ORKa.MVP'
    },
    // Pfad zu GeoJSON mit Polygonen für "Ortliste"
    // Wenn nicht vorhanden ist das Ortemodul deaktiviert
    locations: '/static/data/locations.geojson',
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
        legendURL: '/static/data/poi_legend_data.json'
    }
};
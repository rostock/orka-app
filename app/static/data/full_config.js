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
        openLayerswitcher: true,
        openLegend: true
    },
    // Einstellungen für den Header der Anwendung
    header: {
        // Höhe des Headers. Die Angabe erfolgt in Pixel und muss mit 'px' enden
        height: '50px',
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
    themes: true
};

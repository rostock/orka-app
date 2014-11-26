// Konfigurationsobject für die ORKaApp
// Dieser muss immer 'orkaAppConfig' lauten
var orkaAppConfig = {
    // Einstellungen für die Karte
    map: {
        // Initiales Zentrum der Karte
        center: [313282, 6003693],
        // Initiales Zoomlevel der Karte
        zoom: 15,
        // Aktivieren der Hintergrundlayer der Anwendung
        // jeder Hintergrundlayer ist gleichzeitig ein Drucklayer
        layers: [
            'ORKA_STADTPLAN',
            'ORKA_STADTPLAN_OHNE_TEXT',
            'ORKA_STADTPLAN_GRAU',
            'ORKA_STADTPLAN_GRAU_OHNE_TEXT',
            'ORKA_STADTPLAN_SCHUMMERUNG',
            'ORKA_STADTPLAN_SCHUMMERUNG_OHNE_TEXT'
        ]
    },
    // Einstellungen für den Header der Anwendung
    header: {
        // Höhe des Headers. Die Angabe erfolgt in Pixel und muss mit 'px' enden
        height: '50px',
        // Text der im Header stehen soll
        text: 'ORKa.MVP'
    },
    // Aktivieren des Druckmoduls.
    // Weglassen oder ein anderer Wert als 'true'
    // deaktiviert das Druckmodul.
    print: true,
    // Aktivieren der Kartenthemen-Modul.
    // Weglassen oder ein anderer Wert als 'true'
    // deaktiviert das Kartenthemen-Modul.
    themes: false
};

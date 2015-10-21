angular.module('orkaApp').run(['$templateCache', function($templateCache) {
    'use strict';

    $templateCache.put('src/modules/scale/templates/scaletext.html',
        "<div class=\"anol-map-scale\">Maßstab 1 : {{ scale }}</div>" +
        "<div id=\"imprint-link\"><a href='/datenschutz.html' target='_blank'>Datenschutz</a> | <a href='/impressum.html' target='_blank'>Impressum</a> | <a href='/nutzungsbedingungen.html' target='_blank'>Nutzungsbedingungen</a></div>"
    );

    $templateCache.put('src/modules/layerswitcher/templates/layerswitcher.html',
        "<div class=\"orka-layerswitcher-toggle\" ng-show=\"showToggle\" ng-if=\"$parent.themesAvailable || backgroundLayers.length > 1\">\n" +
        "  <span class=\"glyphicon\" ng-class=\"{'glyphicon-chevron-left': collapsed, 'glyphicon-chevron-right': !collapsed}\" ng-click=\"$parent.collapsed=!$parent.collapsed\"></span>\n" +
        "</div>\n" +
        "<div class=\"orka-layerswitcher\" ng-show=\"!collapsed\">" +
        "  <div ng-show=\"backgroundLayers.length > 1\">\n" +
        "    <span class=\"bold\">Hintergrundkarte</span>\n" +
        "    <div ng-repeat=\"layer in backgroundLayers\">\n" +
        "      <label class=\"no-style pointer\">\n" +
        "        <input type=\"radio\" ng-model=\"$parent.backgroundLayer\" ng-value=\"layer\">\n" +
        "        {{ layer.get('title') }}\n" +
        "      </label>\n" +
        "    </div>\n" +
        "  </div>\n" +
        "  <ng-transclude></ng-transclude>\n" +
        "</div>"
    );

}]);

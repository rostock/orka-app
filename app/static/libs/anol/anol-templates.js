angular.module('anol').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/modules/featurepopup/templates/popup.html',
    "<div ng-show=\"popupVisible\">\n" +
    "    <div class=\"label label-info\">{{ feature.get('name') }}</div>\n" +
    "</div>\n"
  );


  $templateCache.put('src/modules/layerswitcher/templates/layerswitcher.html',
    "<div class=\"anol-layerswitcher-toggle\" ng-show=\"showToggle\" ng-show=\"backgroundLayers.length > 1 || overlayLayers.length > 0\">\n" +
    "    <span class=\"glyphicon\" ng-class=\"{'glyphicon-chevron-left': collapsed, 'glyphicon-chevron-right': !collapsed}\" ng-click=\"collapsed=!collapsed\"></span>\n" +
    "</div>\n" +
    "<div class=\"anol-layerswitcher\" ng-show=\"!collapsed\">\n" +
    "    <div ng-show=\"backgroundLayers.length > 1\">\n" +
    "        <h4>Background Layers</h4>\n" +
    "        <div ng-repeat=\"layer in backgroundLayers\">\n" +
    "             <!-- double $parent cause ng-if and ng-repeat create own closed scopes -->\n" +
    "            <input type=\"radio\" ng-model=\"$parent.$parent.backgroundLayer\" ng-value=\"layer\">\n" +
    "            {{ layer.get('title') }}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-show=\"overlayLayers.length > 0\">\n" +
    "        <h4>Overlay Layers</h4>\n" +
    "        <div ng-repeat=\"layer in overlayLayers\">\n" +
    "            <span class=\"glyphicon\"\n" +
    "                  ng-class=\"{'glyphicon-eye-open': layer.getVisible(), 'glyphicon-eye-close': !layer.getVisible()}\"\n" +
    "                  ng-click=\"layer.setVisible(!layer.getVisible())\">\n" +
    "            </span>\n" +
    "            {{ layer.get('title') }}\n" +
    "            <span ng-if=\"layer.get('isBackground') === true\" class=\"glyphicon glyphicon-paperclip\"></span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <ng-transclude></ng-transclude>\n" +
    "</div>"
  );


  $templateCache.put('src/modules/scale/templates/scaletext.html',
    "<div class=\"anol-map-scale\">1 : {{ scale }}</div>"
  );

}]);

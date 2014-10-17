var projection = new ol.proj.Projection({
    code: 'EPSG:25388',
    units: 'm'
});

var extent = [200000, 5880000, 480000, 6075000];
var resolutions = [529.166666667, 352.777777778, 264.583333333, 176.388888889, 88.1944444444, 52.9166666667, 35.2777777778, 28.2222222222, 22.9305555556, 17.6388888889, 12.3472222222, 8.8194444444, 7.0555555556, 5.2916666667, 3.5277777778, 2.6458333333, 1.7638888889, 0.8819444444, 0.3527777778, 0.1763888889]

var attribution = new ol.Attribution({
  html: 'Kartenbild © Hansestadt Rostock'+
    '(<a href="http://creativecommons.org/licenses/by/3.0/deed.de" target="_blank">CC BY 3.0</a>)<br/>'+
    'Kartendaten © <a href="http://www.openstreetmap.org/"" target="_blank">'+
    '<span lang="en">OpenStreetMap</span></a>'+
    '(<a href="http://opendatacommons.org/licenses/odbl/" target="_blank">ODbL</a>)'+
    ' und <a href="https://geo.sv.rostock.de/uvgb.html" target="_blank">uVGB-MV</a>'
});

var backlyr = new ol.layer.Tile({
    source: new ol.source.TileImage({
        projection: projection,
        tileGrid: new ol.tilegrid.TileGrid({
          origin: [extent[0], extent[1]],
          resolutions: resolutions
        }),
        attributions: [attribution],
        tileUrlFunction: function(tileCoord, pixelRatio, projection) {
            if (tileCoord[1] < 0 || tileCoord[2] < 0) {
                return "";}
            var url = 'http://geo.sv.rostock.de/geodienste/stadtplan/tms/1.0.0/stadtplan_EPSG25833/' + tileCoord[0].toString()+'/'+ tileCoord[1].toString() +'/'+tileCoord[2].toString() +'.png';
            return url;
        }
    })
});

var map = new ol.Map({
  target: 'map',
  layers: [
    backlyr
  ],
  controls: [
    new ol.control.Zoom(),
    new ol.control.ZoomSlider(),
    new ol.control.Attribution({
      collapsible: false
    })
  ],
  view: new ol.View({
    projection: projection,
    center: [313282, 6003693],
    zoom: 9
  }),
});
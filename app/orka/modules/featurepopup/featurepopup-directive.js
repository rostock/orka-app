angular.module('orka.featurepopup', [])
// TODO inherit somehow from anol.featurepopup
.directive('orkaFeaturePopup', ['MapService', function(MapService) {
    return {
        restrict: 'A',
        scope: {
            'featureLayer': '@featureLayer'
        },
        require: '?^orkaFeatureList',
        replace: true,
        templateUrl: 'orka/modules/featurepopup/templates/popup.html',
        link: function(scope, element, attrs, OrkaFeatureListController) {
            var calculatePopupExtent = function(placementPixel) {
                // left, bottom, right, top
                var popupBuffer = [20, 20, 20, 20];
                var popupElement =  angular.element(scope.popup.getElement());
                var popupOffset = scope.popup.getOffset();
                var xPx = placementPixel[0] + popupOffset[0];
                var yPx = placementPixel[1] + popupOffset[1];

                var width = popupElement.width();
                var height = popupElement.height();

                var position = scope.popup.getPositioning().split('-');

                var leftPx, rightPx;
                // x-axis
                switch(position[1]) {
                    case 'left':
                        leftPx = xPx;
                        rightPx = xPx + width;
                    break;
                    case 'center':
                        leftPx = xPx - (width / 2);
                        rightPx = xPx + (width / 2);
                    break;
                    case 'right':
                        leftPx = xPx - width;
                        rightPx = xPx;
                    break;
                }
                leftPx = leftPx - popupBuffer[0];
                rightPx = rightPx + popupBuffer[2];

                var topPx, bottomPx;
                // y-axis
                switch(position[0]) {
                    case 'top':
                        topPx = yPx;
                        bottomPx = yPx + (height);
                    break;
                    case 'center':
                        topPx = yPx - (height / 2);
                        bottomPx = yPx + (height / 2);
                    break;
                    case 'bottom':
                        topPx = yPx - height;
                        bottomPx = yPx;
                    break;
                }
                bottomPx = bottomPx + popupBuffer[1];
                topPx = topPx - popupBuffer[3];

                var extent = [];
                var lb = scope.map.getCoordinateFromPixel([leftPx, bottomPx]);
                var rt = scope.map.getCoordinateFromPixel([rightPx ,topPx]);
                extent = extent.concat(lb);
                extent = extent.concat(rt);

                return extent;
            };

            var moveMap = function(popupExtent) {
                var view = scope.map.getView();
                var mapExtent = view.calculateExtent(scope.map.getSize());
                var dx = 0;
                var dy = 0;
                if(popupExtent[0] < mapExtent[0]) {
                    dx = popupExtent[0] - mapExtent[0];
                } else if (popupExtent[2] > mapExtent[2]) {
                    dx = popupExtent[2] - mapExtent[2];
                }

                if(popupExtent[1] < mapExtent[1]) {
                    dy = popupExtent[1] - mapExtent[1];
                } else if (popupExtent[3] > mapExtent[3]) {
                    dy = popupExtent[3] - mapExtent[3];
                }

                if(dx !== 0 || dy !== 0) {
                    var center = view.getCenter();
                    view.setCenter([
                        center[0] + dx,
                        center[1] + dy
                    ]);
                }
            };

            scope.handleClick = function(evt) {
                var feature = scope.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                    if(layer.get('layer') === scope.featureLayer) {
                        return feature;
                    }
                });
                if(feature) {
                    scope.popup.setPosition(evt.coordinate);

                    scope.$apply(function() {
                        scope.feature = feature;
                        scope.popupVisible = true;
                    });
                    var popupExtent = calculatePopupExtent(evt.pixel);
                    moveMap(popupExtent);
                    if(angular.isDefined(OrkaFeatureListController)) {
                        OrkaFeatureListController.scrollTo(feature);
                    }
                }
            };

            scope.map.on('click', scope.handleClick, this);

            // TODO make Overlay.positioning and Overlay.offset configurable
            scope.popup = new ol.Overlay({
                element: element[0],
                positioning: 'top-left',
                offset: [10, 0]
            });
            scope.map.addOverlay(scope.popup);
        },
        controller: function($scope, $element, $attrs) {
            $scope.map = MapService.getMap();
            $scope.feature = undefined;
            $scope.popupVisible = false;
        }
    };
}]);
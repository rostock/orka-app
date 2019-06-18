angular.module('anol.featurepopup')
/**
 * @ngdoc directive
 * @name anol.featurepopup.directive:anolFeaturePopup
 *
 * @restrict A
 * @requires $timeout
 * @requires anol.map.MapService
 *
 * @param {string} featureLayer Layer to bind popup to
 *
 * @description
 * Shows a popup on feature click
 */
.directive('anolFeaturePopup', ['$timeout', 'MapService', function($timeout, MapService) {
    return {
        restrict: 'A',
        scope: {
            'featureLayer': '@featureLayer'
        },
        replace: true,
        templateUrl: 'src/modules/featurepopup/templates/popup.html',
        link: {
            pre: function(scope, element, attrs) {
                scope.map = MapService.getMap();
                scope.feature = undefined;
                scope.popupVisible = false;
                scope.overlayOptions = {
                    element: element[0]
                };

                scope.handleClick = function(evt) {
                    var visible = false;
                    var feature = scope.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                        if(layer.get('layer') === scope.featureLayer) {
                            return feature;
                        }
                    });
                    if(feature) {
                        scope.popup.setPosition(evt.coordinate);
                        visible = true;
                        $timeout(function() {
                            var popupExtent = scope.calculatePopupExtent(evt.pixel);
                            scope.moveMap(popupExtent);
                        }, 0, false);
                    }

                    scope.$apply(function() {
                        scope.feature = feature;
                        scope.popupVisible = visible;
                    });
                };
            },
            post: function(scope, element, attrs) {
                scope.map.on('click', scope.handleClick, this);

                scope.popup = new ol.Overlay(scope.overlayOptions);
                scope.map.addOverlay(scope.popup);
            }
        },
        controller: function($scope, $element, $attrs) {
            $scope.calculatePopupExtent = function(placementPixel) {
                // left, bottom, right, top
                var popupBuffer = [5, 5, 5, 5];

                var popupOffset = $scope.popup.getOffset();
                var xPx = placementPixel[0] + popupOffset[0];
                var yPx = placementPixel[1] + popupOffset[1];

                var width = $scope.popupOuterWidth();
                var height = $scope.popupOuterHeight();

                var position = $scope.popup.getPositioning().split('-');

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
                var lb = $scope.map.getCoordinateFromPixel([leftPx, bottomPx]);
                var rt = $scope.map.getCoordinateFromPixel([rightPx ,topPx]);
                extent = extent.concat(lb);
                extent = extent.concat(rt);

                return extent;
            };

            $scope.moveMap = function(popupExtent) {
                var view = $scope.map.getView();
                var mapExtent = view.calculateExtent($scope.map.getSize());
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

            $scope.popupOuterHeight = function() {
                var popupElement =  angular.element($scope.popup.getElement());
                var paddingTop = popupElement.css('padding-top');
                var paddingBottom = popupElement.css('padding-bottom');

                paddingTop = parseInt(paddingTop.slice(0, paddingTop.length -2));
                paddingBottom = parseInt(paddingBottom.slice(0, paddingBottom.length -2));

                return popupElement.height() + paddingTop + paddingBottom;
            };

            $scope.popupOuterWidth = function() {
                var popupElement =  angular.element($scope.popup.getElement());

                var paddingLeft = popupElement.css('padding-left');
                var paddingRight = popupElement.css('padding-right');

                paddingLeft = parseInt(paddingLeft.slice(0, paddingLeft.length -2));
                paddingRight = parseInt(paddingRight.slice(0, paddingRight.length -2));

                return popupElement.width() + paddingLeft + paddingRight;
            };

            $scope.popupInnerHeight = function() {
                var popupElement =  angular.element($scope.popup.getElement());
                return popupElement.height();
            };

            $scope.popupInnerWidth = function() {
                var popupElement =  angular.element($scope.popup.getElement());
                return popupElement.width();
            };
        }
    };
}]);

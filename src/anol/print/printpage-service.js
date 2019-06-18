angular.module('anol.print')

/**
 * @ngdoc object
 * @name anol.print.PrintPageServiceProvider
 */
.provider('PrintPageService', [function() {
    // Better move directive configuration in directive so
    // direcitve can be replaced by custom one?
    var _pageSizes, _outputFormats, _defaultScale, _style;

    /**
     * @ngdoc method
     * @name setPageSizes
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {Array.<Object>} pageSizes List of page sizes.
     * Each page size is an object, containing the following elements
     * - **label** - {string} - Label of defined page size. Will be displayed in html
     * - **icon** - {string} - Icon of defined page size
     * - **value** - {Array.<number>} - Height, width of defined page size
     */
    this.setPageSizes = function(pageSizes) {
        _pageSizes = pageSizes;
    };
    /**
     * @ngdoc method
     * @name setOutputFormats
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {Array.<Object>} outputFormats List of available output formats
     * Each output format is an object, containing the following elements
     * - **label** - {string} - Label of defined output format. Will be displayed in html
     * - **value** - {string} - File format ending
     */
    this.setOutputFormats = function(outputFormats) {
        _outputFormats = outputFormats;
    };
    /**
     * @ngdoc method
     * @name setDefaultScale
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {number} scale Initial scale
     */
    this.setDefaultScale = function(scale) {
        _defaultScale = scale;
    };
    /**
     * @ngdoc method
     * @name setStyle
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {Object} ol3 style object
     * @description
     * Define styling of print page feature displayed in map
     */
    this.setStyle = function(style) {
        _style = style;
    };

    this.$get = ['$rootScope', 'MapService', 'LayersService', 'LayersFactory', 'InteractionsService', function($rootScope, MapService, LayersService, LayersFactory, InteractionsService) {
        var _modify;
        var _printArea;
        var _dragFeatures = {
            top: undefined,
            lefttop: undefined,
            left: undefined,
            leftbottom: undefined,
            bottom: undefined,
            rightbottom: undefined,
            right: undefined,
            righttop: undefined,
            center: undefined
        };
        var _modifyFeatures = new ol.Collection();

        var layerOptions = {
            'title': 'PrintLayer',
            'displayInLayerswitcher': false
        };
        if(_style) {
            layerOptions.style = _style;
        }
        var _printLayer = LayersFactory.newFeatureLayer(layerOptions);

        var _printSource = _printLayer.getSource();
        LayersService.addLayer(_printLayer);
        /**
         * @ngdoc service
         * @name anol.print.PrintPageService
         *
         * @requires $rootScope
         * @requires MapService
         * @requires LayersService
         * @requires LayersFactory
         * @requires InteractionsService
         *
         * @description
         * Provides a rectabgular ol geometry representing a paper size.
         * Geometry can be moved or resized. With a given scale, the needed
         * paper size for selected area is calculated.
         *
         */
        var PrintPage = function(pageSizes, outputFormats, defaultScale) {
            this.pageSizes = pageSizes;
            this.outputFormats = outputFormats;
            this.defaultScale = defaultScale;
            this.currentPageSize = undefined;
            this.currentScale = undefined;
        };
        /**
         * @ngdoc method
         * @name createPrintArea
         * @methodOf anol.print.PrintPageService
         *
         * @param {Array.<number>} pageSize Width, height of page in mm
         * @param {number} scale Map scale in printed output
         * @param {Array.<number>} center Center of print page. optional
         *
         * @description
         * Creates the print area geometry visible in map
         */
        PrintPage.prototype.createPrintArea = function(pageSize, scale, center) {
            this.currentPageSize = pageSize;
            this.currentScale = scale;
            this.mapWidth = this.currentPageSize[0] / 1000 * this.currentScale;
            this.mapHeight = this.currentPageSize[1] / 1000 * this.currentScale;

            var view = MapService.getMap().getView();
            center = center || view.getCenter();
            var top = center[1] + (this.mapHeight / 2);
            var bottom = center[1] - (this.mapHeight / 2);
            var left = center[0] - (this.mapWidth / 2);
            var right = center[0] + (this.mapWidth / 2);

            _printSource.clear();
            _printArea = undefined;
            this.updatePrintArea(left, top, right, bottom);
            this.createDragFeatures(left, top, right, bottom, center);
        };
        /**
         * @private
         * @name createDragFeatures
         * @methodOf anol.print.PrintPageService
         *
         * @param {number} left left coordinate
         * @prarm {number} top top coordinate
         * @param {number} right right coordinate
         * @param {number} bottom bottom coordinate
         * @param {Array.<number>} center center coordinates
         *
         * @description
         * Creates draggable points to modify print area
         */
        PrintPage.prototype.createDragFeatures = function(left, top, right, bottom, center) {
            _modifyFeatures.clear();

            // TOTO refactor
            _dragFeatures.left = new ol.Feature(new ol.geom.Point([left, center[1]]));
            _dragFeatures.left.set('position', 'left');
            _dragFeatures.left.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.left);

            _dragFeatures.right = new ol.Feature(new ol.geom.Point([right, center[1]]));
            _dragFeatures.right.set('position', 'right');
            _dragFeatures.right.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.right);

            _dragFeatures.top = new ol.Feature(new ol.geom.Point([center[0], top]));
            _dragFeatures.top.set('position', 'top');
            _dragFeatures.top.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.top);

            _dragFeatures.bottom = new ol.Feature(new ol.geom.Point([center[0], bottom]));
            _dragFeatures.bottom.set('position', 'bottom');
            _dragFeatures.bottom.on('change', this.dragFeatureNormalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.bottom);

            _dragFeatures.leftbottom = new ol.Feature(new ol.geom.Point([left, bottom]));
            _dragFeatures.leftbottom.set('position', 'leftbottom');
            _dragFeatures.leftbottom.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.leftbottom);

            _dragFeatures.lefttop = new ol.Feature(new ol.geom.Point([left, top]));
            _dragFeatures.lefttop.set('position', 'lefttop');
            _dragFeatures.lefttop.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.lefttop);

            _dragFeatures.rightbottom = new ol.Feature(new ol.geom.Point([right, bottom]));
            _dragFeatures.rightbottom.set('position', 'rightbottom');
            _dragFeatures.rightbottom.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.rightbottom);

            _dragFeatures.righttop = new ol.Feature(new ol.geom.Point([right, top]));
            _dragFeatures.righttop.set('position', 'righttop');
            _dragFeatures.righttop.on('change', this.dragFeatureDiagonalChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.righttop);

            _dragFeatures.center = new ol.Feature(new ol.geom.Point(center));
            _dragFeatures.center.set('position', 'center');
            _dragFeatures.center.on('change', this.dragFeatureCenterChangeHandler, this);
            _modifyFeatures.push(_dragFeatures.center);

            _printSource.addFeatures(_modifyFeatures.getArray());

            if(_modify !== undefined) {
                InteractionsService.removeInteraction(_modify);
            }
            var modifyOptions = {features: _modifyFeatures};


            if(_style !== undefined) {
                // TODO find a way to style cursor when it's hover a feature
                modifyOptions.style = _style;
            }
            _modify = new ol.interaction.Modify(modifyOptions);

            InteractionsService.addInteraction(_modify);
        };
        /**
         * @private
         * @name updateDragFeatures
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} currentFeature dragged feature
         *
         * @description
         * Update draggable points after one points (currentFeature) was dragged
         */
        PrintPage.prototype.updateDragFeatures = function(currentFeature) {
            var self = this;
            var edgePoints = _printArea.getGeometry().getCoordinates()[0];
            var left = edgePoints[0][0];
            var right = edgePoints[1][0];
            var top = edgePoints[0][1];
            var bottom = edgePoints[2][1];
            var center = _printArea.getGeometry().getInteriorPoint().getCoordinates();

            var updateFeature = function(dragFeature, currentFeature, coords, handler) {
                // TODO remove modify when we can
                // TODO realign dragged feature after drag action complete
                dragFeature.un('change', handler, self);
                if(dragFeature !== currentFeature) {
                    _modifyFeatures.remove(dragFeature);
                    dragFeature.getGeometry().setCoordinates(coords);
                    _modifyFeatures.push(dragFeature);
                }
                dragFeature.on('change', handler, self);
            };

            updateFeature(_dragFeatures.left, currentFeature, [left, center[1]], this.dragFeatureNormalChangeHandler);
            updateFeature(_dragFeatures.bottom, currentFeature, [center[0], bottom], this.dragFeatureNormalChangeHandler);
            updateFeature(_dragFeatures.right, currentFeature, [right, center[1]], this.dragFeatureNormalChangeHandler);
            updateFeature(_dragFeatures.top, currentFeature, [center[0], top], this.dragFeatureNormalChangeHandler);

            updateFeature(_dragFeatures.leftbottom, currentFeature, [left, bottom], this.dragFeatureDiagonalChangeHandler);
            updateFeature(_dragFeatures.rightbottom, currentFeature, [right, bottom], this.dragFeatureDiagonalChangeHandler);
            updateFeature(_dragFeatures.righttop, currentFeature, [right, top], this.dragFeatureDiagonalChangeHandler);
            updateFeature(_dragFeatures.lefttop, currentFeature, [left, top], this.dragFeatureDiagonalChangeHandler);

            updateFeature(_dragFeatures.center, currentFeature, center, this.dragFeatureCenterChangeHandler);
        };

        /**
         * @private
         * @name dragFeatureNormalChangeHandler
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} evt ol3 event
         *
         * @description
         * Perfroms actions for horizontal or vertical dragging
         */
        PrintPage.prototype.dragFeatureNormalChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaNormal();
            this.updateDragFeatures(currentFeature);
            this.updatePrintSize();
        };

        /**
         * @private
         * @name dragFeatureDiagonalChangeHandler
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} evt ol3 event
         *
         * @description
         * Perfroms actions for diagonal dragging
         */
        PrintPage.prototype.dragFeatureDiagonalChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaDiagonal(currentFeature);
            this.updateDragFeatures(currentFeature);
            this.updatePrintSize();
        };
        /**
         * @private
         * @name dragFeatureCenterChangeHandler
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} evt ol3 event
         *
         * @description
         * Performs actions for dragging the center point
         */
        PrintPage.prototype.dragFeatureCenterChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaCenter(currentFeature);
            this.updateDragFeatures(currentFeature);
        };
        /**
         * @private
         * @name updatePrintAreaDiagonal
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} currentFeature dragged feature
         *
         * @description
         * Calculates print area bbox after diagonal dragging
         */
        PrintPage.prototype.updatePrintAreaDiagonal = function(currentFeature) {
            var lefttop, righttop, leftbottom, rightbottom;
            if(_dragFeatures.lefttop === currentFeature || _dragFeatures.rightbottom === currentFeature) {
                lefttop = _dragFeatures.lefttop.getGeometry().getCoordinates();
                rightbottom = _dragFeatures.rightbottom.getGeometry().getCoordinates();
                this.updatePrintArea(lefttop[0], lefttop[1], rightbottom[0], rightbottom[1]);
            } else {
                righttop = _dragFeatures.righttop.getGeometry().getCoordinates();
                leftbottom = _dragFeatures.leftbottom.getGeometry().getCoordinates();
                this.updatePrintArea(leftbottom[0], righttop[1], righttop[0], leftbottom[1]);
            }
        };
        /**
         * @private
         * @name updatePrintAreaNormal
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} currentFeature dragged feature
         *
         * @description
         * Calculates print area bbox after horizontal or vertical dragging
         */
        PrintPage.prototype.updatePrintAreaNormal = function() {
            var left = _dragFeatures.left.getGeometry().getCoordinates()[0];
            var right = _dragFeatures.right.getGeometry().getCoordinates()[0];
            var top = _dragFeatures.top.getGeometry().getCoordinates()[1];
            var bottom = _dragFeatures.bottom.getGeometry().getCoordinates()[1];

            this.updatePrintArea(left, top, right, bottom);
        };
        /**
         * @private
         * @name updatePrintAreaCenter
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} currentFeature dragged feature
         *
         * @description
         * Calculates print area bbox after center point was dragged
         */
        PrintPage.prototype.updatePrintAreaCenter = function(currentFeature) {
            var center = currentFeature.getGeometry().getCoordinates();
            var top = center[1] + (this.mapHeight / 2);
            var bottom = center[1] - (this.mapHeight / 2);
            var left = center[0] - (this.mapWidth / 2);
            var right = center[0] + (this.mapWidth / 2);
            this.updatePrintArea(left, top, right, bottom);
        };
        /**
         * @private
         * @name updatePrintArea
         * @methodOf anol.print.PrintPageService
         *
         * @param {number} left left coordinate
         * @param {number} top top coordinate
         * @param {number} right right coordinate
         * @param {number} bottom bottom coordinate
         *
         * @description
         * Updates print area geometry
         */
        PrintPage.prototype.updatePrintArea = function(left, top, right, bottom) {
            var coords = [[
                [left, top],
                [right, top],
                [right, bottom],
                [left, bottom],
                [left, top]
            ]];

            if(_printArea !== undefined) {
                _printSource.removeFeature(_printArea);
            }
            _printArea = new ol.Feature(new ol.geom.Polygon(coords));
            _printSource.addFeatures([_printArea]);
        };
        /**
         * @private
         * @name updatePrintSize
         * @methodOf anol.print.PrintPageService
         *
         * @description
         * Recalculate page size in mm
         */
        PrintPage.prototype.updatePrintSize = function() {
            var self = this;
            $rootScope.$apply(function() {
                self.mapWidth = _dragFeatures.right.getGeometry().getCoordinates()[0] - _dragFeatures.left.getGeometry().getCoordinates()[0];
                self.mapHeight = _dragFeatures.top.getGeometry().getCoordinates()[1] - _dragFeatures.bottom.getGeometry().getCoordinates()[1];
                self.currentPageSize = [
                    self.mapWidth * 1000 / self.currentScale,
                    self.mapHeight * 1000 / self.currentScale
                ];
            });
        };
        /**
         * @ngdoc method
         * @name addFeatureFromPageSize
         * @methodOf anol.print.PrintPageService
         *
         * @param {Array.<number>} pageSize Width, height of page in mm
         * @param {number} scale Map scale in printed output
         *
         * @description
         * Create or update print page geometry by given pageSize and scale
         */
        PrintPage.prototype.addFeatureFromPageSize = function(pageSize, scale) {
            if(_printArea === undefined) {
                this.createPrintArea(pageSize, scale);
            } else {
                this.createPrintArea(pageSize, scale, _printArea.getGeometry().getInteriorPoint().getCoordinates());
            }
        };
        /**
         * @ngdoc method
         * @name getBounds
         * @methodOf anol.print.PrintPageService
         *
         * @returns {Array.<number>} Current bounds of area to print in map units
         *
         * @description
         * Returns the current print area bounds in map units
         */
        PrintPage.prototype.getBounds = function() {
            var bounds = [];
            bounds = bounds.concat(_dragFeatures.leftbottom.getGeometry().getCoordinates());
            bounds = bounds.concat(_dragFeatures.righttop.getGeometry().getCoordinates());
            return bounds;
        };
        /**
         * @ngdoc method
         * @name visible
         * @methodOf anol.print.PrintPageService
         *
         * @param {boolean} visibility Set page geometry visibility
         *
         * @description
         * Set visibility of print page geometry
         */
        PrintPage.prototype.visible = function(visibility) {
            _printLayer.setVisible(visibility);
        };

        return new PrintPage(_pageSizes, _outputFormats, _defaultScale);
    }];
}]);

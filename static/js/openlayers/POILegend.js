OpenLayers.Control.POILegend = OpenLayers.Class(OpenLayers.Control, {

    // DOM Elements

    /**
     * Property: legendDiv
     * {DOMElement}
     */
    legendDiv: null,

    /**
     * Property: poiLegendDiv
     * {DOMElement}
     */
    poiLegendDiv: null,

    /**
     * Property: trackLegendDiv
     * {DOMElement}
     */
    trackLegendDiv: null,

    /**
     * Constructor: OpenLayers.Control.POILegend
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        var self = this;

        OpenLayers.Control.prototype.initialize.apply(self, arguments);

        self.poiLegendElements = {};
        self.trackLegendElements = {};

        self.poiLayerSwitcher.events.register('refreshed', self, self.redraw);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        var self = this;

        self.poiLegendElements = [];
        self.trackLegendElements = [];

        self.poiLayerSwitcher.events.unregister('refreshed', self, self.redraw);

        OpenLayers.Control.prototype.destroy.apply(self, arguments);
    },

    /**
     * Method: addElementEvent
     * Add event to specific element. Browser indipendent
     *
     * Parameters:
     * element - {DOMElement}
     * evtType - {String}
     * observer - {Function}
     */
    addElementEvent: function(element, evtType, observer) {
        //add the actual browser event listener
        if (element.addEventListener) {
            element.addEventListener(evtType, observer);
        } else if (element.attachEvent) {
            element.attachEvent('on' + evtType, observer);
        }
    },

    /**
     * Method: stopPropagation
     *
     * Parameters:
     * evt - {Event}
     */
    stopPropagation: function(evt) {
        evt.stopPropagation();
    },

    /**
     * Method: draw
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the
     *     legend tabs.
     */
    draw: function() {
        var self = this;
        OpenLayers.Control.prototype.draw.apply(self);



        self.loadContents();

        self.redraw();

        if(!self.outsideViewport) {
            self.minimizeControl();
        }

        self.addElementEvent(self.div, 'dblclick', self.stopPropagation);
        self.addElementEvent(self.div, 'mousemove', self.stopPropagation);

        return self.div;
    },

    /**
     * Method: redraw
     * Refreshes poi- and trackLegend after POILayerSwitcher refreshed map
     *
     */
    redraw: function() {
        var self = this;

        self.refreshLegend(
            self.poiLegendDiv,
            self.poiLegendElements,
            self.poiLayerSwitcher.poiLegendJSON,
            self.poiLayerSwitcher.poiLayerTypes.slice(),
            self.poiIconSize
        );

        self.refreshLegend(self.trackLegendDiv,
            self.trackLegendElements,
            self.poiLayerSwitcher.trackLegendJSON,
            self.poiLayerSwitcher.trackLayerTypes.slice(),
            self.trackIconSize
        );
    },

    /**
     * Method: refreshLegend
     * Clears given container, iterates over given legendJSON and fills given
     * container with selected (types) legend items
     *
     * Properties:
     * container - {DOMElement}
     * elements - {Object} Containing already created legend elements
     * legendJSON - {Object}
     * types - {String[]}
     * legendType - {Integer}
     * iconSize - {<OpenLayers.Size>}
     */
    refreshLegend: function(container, elements, legendJSON, types, iconSize) {
        var self = this

        // remove elements
        for(var i = container.childNodes.length - 1; i > -1 ; i--) {
            container.removeChild(container.childNodes[i]);
        }

        // stop if no types given
        if(types.length == 0) {
            return;
        }

        // Add elements recusive
        var addElements = function(source) {
            for(var i = 0; i < source.length; i++) {
                if(source[i]['type'] !== undefined && OpenLayers.Util.indexOf(types, source[i]['type']) != -1) {
                    container.appendChild(
                        self.createElement(source[i]['type'], source[i]['title'],
                            source[i]['icon'], elements, iconSize)
                    );
                } else if(source[i]['groups'] !== undefined) {
                    addElements(source[i]['groups']);
                }
            }
        }

        addElements(legendJSON['topics']);
    },

    /**
     * Method: createElement
     * Creates a legend element if not already in elements property
     *
     * Properties:
     * type - {String}
     * title - {String}
     * icon - {String}
     * elements - {Object} Containing already created legend elements
     * iconSize - {<OpenLayers.Size>}
     *
     * Returns:
     * {DOMElement}
     */
    createElement: function(type, title, icon, elements, iconSize) {
        var self = this;

        // use already created elements
        if(elements[type] === undefined) {
            var newElement = document.createElement('div');
            newElement.id = OpenLayers.Util.createUniqueID(self.id + '_legend_item_');
            newElement.className = 'legendItem';

            var iconElement = OpenLayers.Util.createImage(
                OpenLayers.Util.createUniqueID(newElement.id + '_icon_'),
                null, iconSize, self.iconPath + icon
            );

            var titleElement = document.createElement('span');
            titleElement.className = 'itemTitle';
            titleElement.innerHTML = title;
            newElement.appendChild(iconElement);
            newElement.appendChild(titleElement);
            elements[type] = newElement;
        }
        return elements[type];
    },

    /**
     * Method: loadContents
     * Set up basic structor of this control
     */
    loadContents: function() {
        var self = this;

        self.legendDiv = document.createElement("div");
        self.legendDiv.id = self.id + "_legendrDiv";
        self.legendDiv.className = 'legendDiv';

        var legendHeader = document.createElement("h5");
        legendHeader.innerHTML = 'Legende';

        self.poiLegendDiv = document.createElement("div");
        self.poiLegendDiv.id = self.id + '_poiLegendDiv';
        self.poiLegendDiv.className = 'poiLegendDiv';

        self.trackLegendDiv = document.createElement("div");
        self.trackLegendDiv.id = self.id + '_trackLegendDiv';
        self.trackLegendDiv.className = 'trackLegendDiv';

        self.legendDiv.appendChild(legendHeader);
        self.legendDiv.appendChild(self.poiLegendDiv);
        self.legendDiv.appendChild(self.trackLegendDiv);

        // create maximize button div
        var img = OpenLayers.Util.getImageLocation('legend-maximize.png');
        self.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
            "OpenLayers_Control_MaximizeDiv",
            null,
            null,
            img,
            "absolute"
        );
        OpenLayers.Element.addClass(self.maximizeDiv, "maximizeDiv olButton");
        self.maximizeDiv.style.display = "none";

        // create minimize button div
        var img = OpenLayers.Util.getImageLocation('layer-switcher-minimize.png');
        self.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
            "OpenLayers_Control_MinimizeDiv",
            null,
            null,
            img,
            "absolute"
        );
        OpenLayers.Element.addClass(self.minimizeDiv, "minimizeDiv olButton");
        self.minimizeDiv.style.display = "none";

        self.div.appendChild(self.legendDiv);
        self.div.appendChild(self.maximizeDiv);
        self.div.appendChild(self.minimizeDiv);
    },

    /**
     * Method: maximizeControl
     * Set up the labels and divs for the control
     *
     * Parameters:
     * e - {Event}
     */
    maximizeControl: function(e) {
        var self = this;

        // set the div's width and height to empty values, so
        // the div dimensions can be controlled by CSS
        self.div.style.width = "";
        self.div.style.height = "";

        self.showControls(false);

        if (e != null) {
            OpenLayers.Event.stop(e);
        }
    },

    /**
     * Method: minimizeControl
     * Hide all the contents of the control, shrink the size,
     *     add the maximize icon
     *
     * Parameters:
     * e - {Event}
     */
    minimizeControl: function(e) {
        var self = this;

        // to minimize the control we set its div's width
        // and height to 0px, we cannot just set "display"
        // to "none" because it would hide the maximize
        // div
        self.div.style.width = "0px";
        self.div.style.height = "0px";

        self.showControls(true);

        if (e != null) {
            OpenLayers.Event.stop(e);
        }
    },

    /**
     * Method: onButtonClick
     * Handle all button click actions
     *
     * Parameters:
     * evt - {Event}
     */
    onButtonClick: function(evt) {
        var self = this;

        var button = evt.buttonElement;

        if (button === self.minimizeDiv) {
            self.minimizeControl();
        } else if (button === self.maximizeDiv) {
            self.maximizeControl();
        }
    },

    /**
     * Method: showControls
     * Hide/Show all LayerSwitcher controls depending on whether we are
     *     minimized or not
     *
     * Parameters:
     * minimize - {Boolean}
     */
    showControls: function(minimize) {
        var self = this;

        self.maximizeDiv.style.display = minimize ? "" : "none";
        self.minimizeDiv.style.display = minimize ? "none" : "";

        self.legendDiv.style.display = minimize ? "none" : "";
    },

    /**
     * Method: setMap
     *
     * Properties:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        var self = this;

        OpenLayers.Control.prototype.setMap.apply(self, arguments);

        if (self.outsideViewport) {
            self.events.attachToElement(self.div);
            self.events.register("buttonclick", self, self.onButtonClick);
        } else {
            self.map.events.register("buttonclick", self, self.onButtonClick);
        }
    },

    CLASS_NAME: 'OpenLayers.Control.POILegend'
});

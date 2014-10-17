OpenLayers.Control.POILayerSwitcher = OpenLayers.Class(OpenLayers.Control, {

    // DOM Elements

    /**
     * Property: layersDiv
     * {DOMElement}
     */
    layersDiv: null,

    /**
     * Property: poiLayersDiv
     * {DOMElement}
     */
    poiLayersDiv: null,

    /**
     * Property: trackLayersDiv
     * {DOMElement}
     */
    trackLayersDiv: null,

    /**
     * Property: backgroundLayersDiv
     * {DOMElement}
     */
    backgroundLayersDiv: null,

    /**
     * Property: minimizeDiv
     * {DOMElement}
     */
    minimizeDiv: null,

    /**
     * Property: maximizeDiv
     * {DOMElement}
     */
    maximizeDiv: null,

    /**
     * Constructor: OpenLayers.Control.POILayerSwitcher
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        var self = this;

        OpenLayers.Control.prototype.initialize.apply(self, arguments);

        // set default values for icon if not specified
        self.iconWidth = self.iconWidth || 24;
        self.iconHeight = self.iconHeight || 32;
        self.iconXOffset = self.iconXOffset || -12;
        self.iconYOffset = self.iconYOffset || -32;

        self.jsonFormat = new OpenLayers.Format.JSON();
        self.rules = {};

        self.poiLayerTypes = [];
        self.trackLayerTypes = [];

        self.poiLayer.setVisibility(false);
        self.poiLayer.protocol.options.params = {
            // easy access to params.types
            'poi_types': self.poiLayerTypes
        }

        self.trackLayer.setVisibility(false);

        OpenLayers.Request.GET({
            url: self.poiLegendURL,
            async: false,
            success: function(response) {
                self.poiLegendJSON = self.jsonFormat.read(response.responseText);
            }
        });

        OpenLayers.Request.GET({
            url: self.trackLegendURL,
            async: false,
            success: function(response) {
                self.trackLegendJSON = self.jsonFormat.read(response.responseText);
            }
        });
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        var self = this;

        // remove rules from layer and destroy them
        for(var type in self.rules) {
            var rule = self.rules[type];
            var style = self.poiLayer.styleMap.styles['default'];

            var idx = OpenLayers.Util.indexOf(style.rules, rule);
            if(idx != -1) {
                style.rules.splice(idx, 1);
            }
            rule.destroy();
        }
        self.rules = null;
        self.poiLayer = null;
        self.poiLegendJSON = null;
        self.poiLayerTypes = [];
        delete self.poiLayerTypes;
        self.trackLegendJSON = null;
        self.jsonFormat = null;

        // unregister used events
        self.map.events.un({
            buttonclick: self.onButtonClick,
            scope: self
        });
        self.events.unregister("buttonclick", self, self.onButtonClick);

        self.removeElementEvent("dblclick", self, self.stopPropagation);
        self.removeElementEvent("mousemove", self, self.stopPropagation);

        OpenLayers.Control.prototype.destroy.apply(self, arguments);
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

        self.poiLayer.protocol.options.params['srs'] = map.getProjection()

        if (self.outsideViewport) {
            self.events.attachToElement(self.div);
            self.events.register("buttonclick", self, self.onButtonClick);
        } else {
            self.map.events.register("buttonclick", self, self.onButtonClick);
        }
    },

    /**
     * Method: draw
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the
     *     switcher tabs.
     */
    draw: function() {
        var self = this;

        OpenLayers.Control.prototype.draw.apply(self);

        self.createBaseStructur();

        // render backgroundLayers
        self.addBackgroundLayers();

        // render poiLayers
        self.addLegendLayers(self.poiLayersDiv, self.poiLegendJSON,
            OpenLayers.Control.POILayerSwitcher.POI);

        // render trackLayers
        self.addLegendLayers(self.trackLayersDiv, self.trackLegendJSON,
            OpenLayers.Control.POILayerSwitcher.TRACK);

        if(!self.outsideViewport) {
            self.minimizeControl();
        }

        // don't move or zoom map if mouse over POILayerSwitcher
        self.addElementEvent(self.div, 'dblclick', self.stopPropagation);
        self.addElementEvent(self.div, 'mousemove', self.stopPropagation);

        return self.div;
    },

    /**
     * Method: createBaseStructur
     *
     */
    createBaseStructur: function() {
        var self = this;

        // create a master. we clone this when we need a separator
        var separator = document.createElement('hr');

        // create the main div
        self.layersDiv = document.createElement('div');
        self.layersDiv.id = self.id + '_layersDiv';
        self.layersDiv.className = 'layersDiv';

        // create the background layer div
        self.backgroundLayersDiv = document.createElement('div');
        self.backgroundLayersDiv.id = self.id + '_backgroundLayersDiv';
        self.backgroundLayersDiv.className = 'backgroundLayersDiv';

        // create the poi layer div
        self.poiLayersDiv = document.createElement("div");
        self.poiLayersDiv.id = self.id + "_poiLayersDiv";
        self.poiLayersDiv.className = "poiLayersDiv";

        // create the track layer div
        self.trackLayersDiv = document.createElement("div");
        self.trackLayersDiv.id = self.id + "_trackLayersDiv";
        self.trackLayersDiv.className = "trackLayersDiv";

        // create maximize button div
        var img = OpenLayers.Util.getImageLocation('layer-switcher-maximize.png');
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

        // put all together
        self.layersDiv.appendChild(self.backgroundLayersDiv);
        self.layersDiv.appendChild(separator.cloneNode());
        self.layersDiv.appendChild(self.poiLayersDiv);
        self.layersDiv.appendChild(separator.cloneNode());
        self.layersDiv.appendChild(self.trackLayersDiv);

        self.div.appendChild(self.layersDiv);
        self.div.appendChild(self.maximizeDiv);
        self.div.appendChild(self.minimizeDiv);
    },

    /**
     * Method: createBackgroundLayers
     *
     */
    addBackgroundLayers: function() {
        var self = this;

        for(var i = 0; i < self.backgroundLayers.length; i++) {
            var layer = self.backgroundLayers[i];
            // create container
            var backgroundLayerDiv = document.createElement('div');
            backgroundLayerDiv.id = OpenLayers.Util.createUniqueID(self.id + '_background_layer_');

            // create radio button
            var backgroundLayerInput = document.createElement('input');
            backgroundLayerInput.id = OpenLayers.Util.createUniqueID(self.id + '_background_layer_');
            backgroundLayerInput.type = 'radio';
            backgroundLayerInput.className = 'olButton';
            backgroundLayerInput.checked = layer.getVisibility();
            backgroundLayerInput._background_layer_id = layer.id;
            backgroundLayerInput._poiLayerSwitcherID = self.id;

            // set the checked radio input as accessable active element
            if(backgroundLayerInput.checked) {
                self.activeBackgroundLayerInput = backgroundLayerInput;
            }

            backgroundLayerDiv.appendChild(backgroundLayerInput);

            // create label
            backgroundLayerTitle = document.createElement('label');
            backgroundLayerTitle['for'] = backgroundLayerInput.id;
            backgroundLayerTitle.className = "labelSpan olButton";
            backgroundLayerTitle._poiLayerSwitcherID = self.id;
            backgroundLayerTitle.innerHTML = layer.title || layer.name;

            backgroundLayerDiv.appendChild(backgroundLayerTitle);

            self.backgroundLayersDiv.appendChild(backgroundLayerDiv);
        }
    },

    /**
     * Method: addPOILayers
     *
     * Parameters:
     * containerElement - {DOMElement}
     * legendJSON - {Object}
     * legendType - {Integer}
     */
    addLegendLayers: function(containerElement, legendJSON, legendType) {
        var self = this;

        for(var topicID = 0; topicID < legendJSON['topics'].length; topicID++) {
            var topic = legendJSON['topics'][topicID];
            var title = topic['title'];
            var topicHaveGroup = topic['groups'] !== undefined;

            // create the topic
            var topicDiv = document.createElement('div');
            topicDiv.id = OpenLayers.Util.createUniqueID(self.id + '_topic_');

            // create topic checkbox
            var topicInput = document.createElement('input');
            topicInput.id = OpenLayers.Util.createUniqueID(topicDiv.id + '_input_')
            topicInput.type = 'checkbox';
            topicInput.className = 'olButton'
            topicInput._poiLayerSwitcherID = self.id
            topicInput._legendType = legendType;
            topicDiv.appendChild(topicInput);

            var groupContainerID = false;

            if(topicHaveGroup) {
                // create group attributes and expander
                groupContainerID = OpenLayers.Util.createUniqueID(topicDiv.id + '_group_container_');
                topicInput._groupClassName = OpenLayers.Util.createUniqueID(topicDiv.id +'_group_');

                //TODO replace with image
                var groupExpander = document.createElement('span');
                groupExpander.innerHTML = "&#9658"; // collapsed "&#9658" //expanded "&#9660"
                groupExpander.className = 'olButton';
                groupExpander._poiLayerSwitcherID = self.id
                groupExpander._groupContainerID = groupContainerID;
                // append group expander before append topicTitle
                topicDiv.appendChild(groupExpander);
            }

            // add topic title
            var topicTitle = document.createElement('label');
            topicTitle['for'] = topicInput.id;
            topicTitle.className = "labelSpan olButton";
            topicTitle._poiLayerSwitcherID = self.id
            topicTitle.innerHTML = title;
            topicDiv.appendChild(topicTitle);

            if(topicHaveGroup) {
                // create group if we have one
                var groupContainer = document.createElement('div');
                groupContainer.id = groupContainerID;
                groupContainer.className = 'olGroupContainer';
                // have to set display as element style
                // otherwise we don't now the display kind in self.toggleGroupContainer
                groupContainer.style.display = 'none';
                for(var groupID = 0; groupID < topic['groups'].length; groupID++) {
                    var group = topic['groups'][groupID];

                    // create the group
                    var groupDiv = document.createElement('div');
                    groupDiv.id = OpenLayers.Util.createUniqueID(self.id + '_group_');

                    // create checkbox
                    var groupInput = document.createElement('input');
                    groupInput.id = OpenLayers.Util.createUniqueID(groupDiv.id + '_input_');
                    groupInput.type = 'checkbox';
                    groupInput.className = 'olButton ' + topicInput._groupClassName;
                    groupInput._type = group['type'];
                    if(legendType === OpenLayers.Control.POILayerSwitcher.POI) {
                        groupInput._icon = group['icon'];
                    }
                    groupInput._legendType = legendType;
                    groupInput._topicInputID = topicInput.id;
                    groupInput._poiLayerSwitcherID = self.id
                    groupDiv.appendChild(groupInput);

                    // create group title
                    var groupTitle = document.createElement('label');
                    groupTitle['for'] = groupInput.id;
                    groupTitle.className = 'labelSpan olButton';
                    groupTitle._poiLayerSwitcherID = self.id
                    groupTitle.innerHTML = group['title'];
                    groupDiv.appendChild(groupTitle);

                    groupContainer.appendChild(groupDiv);
                }
                topicDiv.appendChild(groupContainer);
            } else {
                // otherwise we have a top level group
                topicInput._type = topic['type'];
                if(legendType === OpenLayers.Control.POILayerSwitcher.POI) {
                    topicInput._icon = topic['icon'];
                }
            }
            containerElement.appendChild(topicDiv);
        }
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
     * Method: removeElementEvent
     * Remove event from specific element. Browser indipendent
     *
     * Parameters:
     * element - {DOMElement}
     * evtType - {String}
     * observer - {Function}
     */
    removeElementEvent: function(element, evtType, observer) {
        //remove the actual browser event listener
        if (element.removeEventListener) {
            element.removeEventListener(evtType, observer);
        } else if (element && element.detachEvent) {
            element.detachEvent('on' + evtType, observer);
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

        self.layersDiv.style.display = minimize ? "none" : "";
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
        } else if(button._poiLayerSwitcherID === self.id) {
            // get real buttton if clicked on label
            if(button['for']) {
                button = document.getElementById(button['for']);
            }
            if(button._groupContainerID !== undefined) {
                // only expanders have a _groupContainerID attribute
                self.toggleGroupContainer(button, button._groupContainerID)
            } else if(button.type === 'checkbox') {
                // set checkbox to new state
                button.checked = !button.checked;
                if(button._groupClassName) {
                    // only topic with groups have a checkbox
                    // with _groupClassName attribute
                    self.toggleGroups(button, button.checked);
                } else {
                    self.toggleGroup(button);
                }
            } else if(button.type === 'radio') {
                // only backgroundLayers have a radio button
                if(button.id !== self.activeBackgroundLayerInput.id) {
                    self.activateBackgroundLayer(button);
                }
            }
        }
    },

    /**
     * Method: toggleGroupContainer
     * Expand/Collapse given group container
     *
     * Parameters:
     * expander - {DOMElement}
     * groupContainerID - {String}
     */
    toggleGroupContainer: function(expander, groupContainerID) {
        var self = this;

        var groupContainer = document.getElementById(groupContainerID);
        var display = groupContainer.style.display;

        if(display === 'none') {
            expander.innerHTML = "&#9660";
            groupContainer.style.display = 'block';
        } else {
            expander.innerHTML = "&#9658";
            groupContainer.style.display = 'none';
        }
    },

    /**
     * Method: toggleGroups
     * Show all group elements icons in map
     *
     * Parameters:
     * groupElement - {DOMElement}
     * checked - {Boolean}
     */
    toggleGroups: function(groupElement, checked) {
        var self = this;

        var olLayer = self._getLayer(groupElement);

        var groupClassName = groupElement._groupClassName;

        // work not in IE8 or lower
        // work not in FF3 or lower
        var groups = document.getElementsByClassName(groupClassName);

        var visibility = olLayer.visibility;

        for(var i = 0; i < groups.length; i++) {
            var group = groups[i];
            // set checkbox to new state
            group.checked = checked;
            visibility = self._toggleLayerStyle(group, olLayer);
        }

        // refresh layer after all styles applied
        self._refreshLayer(olLayer, visibility);
    },

    /**
     * Method: toggleGroup
     * Show the group elements icons in map
     *
     * Parameters:
     * group - {DOMElement}
     */
    toggleGroup: function(group) {
        var self = this;

        var olLayer = self._getLayer(group);

        // only grouped elements have a topicInputID
        if(group._topicInputID !== undefined) {
            var topicInput = document.getElementById(group._topicInputID);
            var groups = document.getElementsByClassName(topicInput._groupClassName);

            var allGroupsChecked = true;
            for(var i = 0; i < groups.length; i++) {
                allGroupsChecked = groups[i].checked;
                if(!allGroupsChecked) {
                    break;
                }
            }
            // topic checkbox is only checked if all group checkboxes are checked
            topicInput.checked = allGroupsChecked;
        }

        var visibility = self._toggleLayerStyle(group, olLayer);
        self._refreshLayer(olLayer, visibility);


    },

    /**
     * Method: _toggleLayerStyle
     * Add rule to layer style, so we see the specific icons
     *
     * Parameters:
     * group - {DOMElement}
     */
    _toggleLayerStyle: function(group, olLayer) {
        var self = this;

        var legendType = group._legendType;
        var type = group._type;
        var show = group.checked;

        if(legendType == OpenLayers.Control.POILayerSwitcher.POI) {
            var style = olLayer.styleMap.styles['default'];
            if(show) {
                // don't add rule if already in style.rules
                if(OpenLayers.Util.indexOf(style.rules, self.rules[type]) == -1) {
                    self.poiLayerTypes.push(type);
                    style.addRules([self.createRule(type, group._icon)]);
                }
            } else {
                // remove rule if in style.rules
                var idx = OpenLayers.Util.indexOf(style.rules, self.rules[type]);
                if(idx != -1) {
                    var t_idx = OpenLayers.Util.indexOf(self.poiLayerTypes, type);
                    self.poiLayerTypes.splice(t_idx, 1);
                    style.rules.splice(idx, 1);
                }
            }
            // true if layer have rules
            return style.rules.length > 0;
        } else {
            if(show) {
                // don't add a layer twice
                if(OpenLayers.Util.indexOf(self.trackLayerTypes, type) == -1) {
                    self.trackLayerTypes.push(type);
                }
            } else {
                var idx = OpenLayers.Util.indexOf(self.trackLayerTypes, type);
                if(idx != -1) {
                    self.trackLayerTypes.splice(idx, 1);
                }
            }

            // add types as string to layers params
            olLayer.params.track_types = self.trackLayerTypes.toString();

            // true if layer have types
            return olLayer.params.track_types.length > 0;
        }
    },

    /**
     * Method: createRule
     *
     * Parameters:
     * type - {String}
     * icon - {String}
     *
     * Returns:
     * {<OpenLayers.Rule>}
     */
    createRule: function(type, icon) {
        var self = this;

        // use already create rule
        if(self.rules[type] === undefined) {
            self.rules[type] = new OpenLayers.Rule({
                name: type,
                filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: 'type',
                    value: type
                }),
                symbolizer: {
                    externalGraphic: self.iconPath + icon,
                    fillOpacity: 1,
                    graphicWidth: self.iconWidth,
                    graphicHeight: self.iconHeight,
                    graphicXOffset: self.iconXOffset || -(self.iconWidth / 2),
                    graphicYOffset: self.iconYOffset || -(self.iconHeight / 2)
                },
                propertyFilter: true
            });
        }
        return self.rules[type];
    },

    /**
     * Method: activateBackgroundLayer
     *
     * Parameters:
     * layerInput - {DOMElement}
     */
    activateBackgroundLayer: function(layerInput) {
        var self = this;

        // uncheck formal checked radio
        self.activeBackgroundLayerInput.checked = false;

        // change active background layer
        self.activeBackgroundLayerInput = layerInput;

        // activate new background layer
        self.map.setBaseLayer(self.map.getLayer(self.activeBackgroundLayerInput._background_layer_id))
        self.activeBackgroundLayerInput.checked = true;
    },

    /**
     * Method: activeBackgroundLayer
     *
     * Returns:
     * {<OpenLayers.Layer>}
     */
    backgroundLayerPrintName: function() {
        var self = this;
        return self.map.baseLayer.printLayername;
    },

    /**
     * Method: _getLayer
     * Get layer depending on elements legendType
     *
     * Parameters:
     * element - {DOMElement}
     *
     * Returns:
     * {<OpenLayers.Layer>}
     */
    _getLayer: function(element) {
        var self = this;
        if(element._legendType === undefined) {
            return false;
        }
        return element._legendType === OpenLayers.Control.POILayerSwitcher.POI ? self.poiLayer : self.trackLayer;
    },

    /**
     * Method: _refreshLayer
     * Refresh/redraw layer depending on its type
     *
     * Parameters:
     * olLayer - {<OpenLayers.Layer>}
     * visibility - {Boolean}
     */
    _refreshLayer: function(olLayer, visibility) {
        if(olLayer.visibility != visibility) {
            olLayer.setVisibility(visibility);
        }
        if(olLayer.visibility) {
            if(olLayer instanceof OpenLayers.Layer.WMS) {
                olLayer.redraw(true);
            } else {
                olLayer.refresh({force: true});
            }
        }
        this.events.triggerEvent("refreshed");
    },

    CLASS_NAME: 'OpenLayers.Control.POILayerSwitcher'
});

/**
 * Constant: POI
 * {Integer} Constant tell item is a POI
 */
OpenLayers.Control.POILayerSwitcher.POI = 1;
/**
 * Constant: TRACK
 * {Integer} Constant tell item is a TRACK
 */
OpenLayers.Control.POILayerSwitcher.TRACK = 2;

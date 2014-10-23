angular.module('anol.map')

.provider('InteractionsService', [function() {
    var _interactions;

    this.setInteractions = function(interactions) {
        _interactions = interactions;
    };

    this.$get = [function() {
        // and this is the service part
        var Interactions = function(interactions) {
            this.interactions = interactions || ol.interaction.defaults();
            this.map = undefined;
        };
        Interactions.prototype.registerMap = function(map) {
            this.map = map;
        };
        Interactions.prototype.addInteraction = function(interaction) {
            if(this.map !== undefined) {
                this.map.addInteraction(interaction);
            }
            this.interactions.push(interaction);
        };
        Interactions.prototype.addInteractions = function(interactions) {
            var self = this;
            if(this.map !== undefined) {
                angular.forEach(interactions, function(interaction) {
                    self.map.addInteraction(interaction);
                });
            }
            this.interactions = this.interactions.concat(interactions);
        };
        return new Interactions(_interactions);
    }];
}]);

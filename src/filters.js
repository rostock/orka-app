angular.module('orkaApp')

.filter('externalLink', function() {
    var externalLinkRegex = /^http(s?):\/\//;
    return function(link) {
        if(externalLinkRegex.exec(link) === null) {
            return 'http://' + link;
        }
    };
});

angular.module('anol', [])
.constant('DefaultMapName', 'anol-map')
// found at http://stackoverflow.com/a/21098541
.filter('html',['$sce', function($sce) {
    return function(input){
        return $sce.trustAsHtml(input);
    };
}]);
// TODO: We need a structure for modules
angular.module('anol.map', []);
angular.module('anol.scale', []);

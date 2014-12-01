/**
 * @ngdoc overview
 * @name anol
 * @description
 * Base anol module
 */
angular.module('anol', [])
/**
 * @ngdoc object
 * @name anol.constant:DefaultMapName
 * @description
 * Id and class added to ol.Map DOM-element
 */
.constant('DefaultMapName', 'anol-map')
// found at http://stackoverflow.com/a/21098541
.filter('html',['$sce', function($sce) {
    return function(input){
        return $sce.trustAsHtml(input);
    };
}]);

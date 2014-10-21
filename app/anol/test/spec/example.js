describe('Testing anolLayerswitcher directive', function() {
  var scope,
      elem,
      directive,
      compiled,
      html;

  beforeEach(function (){
    //load the module
    module('anol.layerswitcher');

    //set our view html.
    html = '<div anol-layerswticher></div>';

    inject(function($compile, $rootScope) {
      //create a scope (you could just use $rootScope, I suppose)
      scope = $rootScope.$new();

      //get the jqLite or jQuery element
      elem = angular.element(html);

      //compile the element into a function to
      // process the view.
      compiled = $compile(elem);

      //run the compiled view.
      compiled(scope);

      //call digest on the scope!
      scope.$digest();
    });
  });

  it('Test the scope layers object.', function() {
    scope.layers = 'bar';
    expect(scope.layers).toBe('bar');
  });
});
(function () {
    'use strict';
  
    angular.module('core')
      .directive('markdown', markdown);
    
    markdown.$inject = ['$window','$sanitize'];      

    function markdown($window,$sanitize) {
      var directive = {
        restrict: 'E',
        require: 'ngModel',
        link: link
      };
  
      return directive;

      function link(scope, element, attrs, model) {      
          var converter = new $window.showdown.Converter();            
        
          var render = function(){            
              var htmlText = converter.makeHtml(model.$modelValue);
              element.html($sanitize(htmlText)); //client side sanitize
          };
          scope.$watch(attrs['ngModel'], render);
          render();        
      };

    }
  }());
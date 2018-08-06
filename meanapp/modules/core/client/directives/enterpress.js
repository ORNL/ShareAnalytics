(function () {
    'use strict';
  
    angular.module('core')
      .directive('enterpress', enterpress);
    
    function enterpress() {
      var directive = {
        link: link
      };
  
      return directive;

      function link(scope, element, attrs) {      
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.enterpress);
                });

                event.preventDefault();
            }
        });      
      };

    }
  }());
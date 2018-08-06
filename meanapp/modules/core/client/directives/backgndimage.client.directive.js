(function () {
    'use strict';
  
    // Focus the element on page load
    // Unless the user is on a small device, because this could obscure the page with a keyboard
  
    angular.module('core')
      .directive('bgimage', bgimage);
    
    function bgimage() {
      var directive = {
        restrict: 'A',
        link: link
      };
  
      return directive;
  
      function link(scope, element, attrs) {
        element.css({
            'background-image': 'url(' + attrs.bgimage + ')',
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
                'background-position': 'center center'
        });
      }
    }
  }());
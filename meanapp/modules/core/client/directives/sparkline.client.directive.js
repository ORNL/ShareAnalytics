(function () {
    'use strict';

    // Requires jQuery from http://jquery.com/
    // and jQuerySparklines from http://omnipotent.net/jquery.sparkline
    // pjsvis
  
    angular.module('core')
      .directive('sparkline', sparkline);
    
    sparkline.$inject = [];      

    function sparkline() {
      var directive = {
        restrict: 'E',
        require: 'ngModel',
        link: link
      };
  
      return directive;

      function link(scope, elem, attrs, ngModel) {      
        var opts={};

       opts.type = attrs.type || 'line';

       scope.$watch(attrs.ngModel, function () {
           render();
       });
       
       scope.$watch(attrs.opts, function(){
                render();
       });

       var render = function () {
           var model;
           if(attrs.opts) angular.extend(opts, angular.fromJson(attrs.opts));
           // Trim trailing comma if it is a string
           angular.isString(ngModel.$viewValue) ? model = ngModel.$viewValue.replace(/(^,)|(,$)/g, "") : model = ngModel.$viewValue;
           var data;
           // Verify array contains numeric values
           angular.isArray(model) ? data = model : data = model.split(',');
           $(elem).sparkline(data, opts);     
      };

    }
    }
  }());
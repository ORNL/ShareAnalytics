(function () {
  'use strict';

  angular
    .module('locations')
    .controller('LocationsFormController', LocationsFormController);

  LocationsFormController.$inject = ['$scope', '$http', '$state', '$window', 'utilityService', 'AnalyticsService', 'locationResolve', 'Authentication','toaster'];

  function LocationsFormController($scope, $http, $state, $window, utilityService, AnalyticsService, location, Authentication,toaster) {
    var vm = this;

    vm.location = location;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.analytics = AnalyticsService.query();  
    vm.totalPercentage = 0;

    var locationimage = null;

    vm.percentScore = 0;
    vm.minmax = function(model,min, max) 
    {
        if(typeof model == "undefined") {
          return 0;
        }
        
        if(model != null) {

          if(parseInt(model) < min || isNaN(parseInt(model))) 
              return 0; 
          else if(parseInt(model) > max) 
              return 100;
          else
            return model; 
        }
    };

    //need to change underlying analytic model and then recalc total
    //use the id - should both update the total and update the value in the table
    vm.minmaxwithid = function(id,model,min, max) 
    {
        var index = 0;
        for(var i =0; i < vm.location.analytics.length; i++) {
          if(vm.location.analytics[i].id == id) {
            index = i;
            break;
          }
        }

        if(typeof model == "undefined") {
          vm.location.analytics[index].percent = 0;
        }
        
        if(model != null) {
          if(parseInt(model) < min || isNaN(parseInt(model))) 
            vm.location.analytics[index].percent = 0; 
          else if(parseInt(model) > max) 
            vm.location.analytics[index].percent = 100;
          else
            vm.location.analytics[index].percent = model; 
        }

        getTotalPercentage();
    };

    vm.findAnalytic = function(id) {
      for(var i = 0; i < vm.analytics.length; i++) {
        if(vm.analytics[i]._id == id) {
          return vm.analytics[i];
        }
      }

      return null;
    };

    //Wait until server has responded
    vm.analytics.$promise.then(function(){ 
      
      //Create analytics array if new location
      if(!vm.location.analytics) {
        vm.location.analytics = [];      
      } else {       //Create variable to hold analytic objects for selection boxes        
        for(var i = 0; i < vm.location.analytics.length; i++) {
          vm.location.analytics[i].mod = vm.findAnalytic(vm.location.analytics[i].id);
        }
      }

      getTotalPercentage();

    });

    vm.addanalytic = function() {

      if(vm.selectedAnalytic != null) {

        var alreadyUsed = false;
        for(var i = 0; i < vm.location.analytics.length; i++) {
          if(vm.location.analytics[i].id == vm.selectedAnalytic._id) {
              alreadyUsed = true;
          }
        }

        if(vm.percentScore <= 0) {
          toaster.pop('error','Error','Percentage must be above 0');          
        } else {
          if(vm.totalPercentage + vm.percentScore <= 100) {
            if(alreadyUsed) {
              toaster.pop('error','Error','Analytic already included');          
            } else {
              vm.location.analytics.push({
                id: vm.selectedAnalytic._id,
                percent: vm.percentScore,
                mod: vm.findAnalytic(vm.selectedAnalytic._id)
              });

              vm.selectedAnalytic = null;
              vm.percentScore = 0;

              getTotalPercentage();
            }
        } else {
          toaster.pop('error','Error','Total cannot be over 100');        
        }
      }
    } else {
      toaster.pop('error','Error','Must select analytic');
    }
    };

    vm.deleteanalytic = function(analytic) {
      for(var i = 0; i < vm.location.analytics.length; i++) {
        if(vm.location.analytics[i] == analytic) {
          vm.location.analytics.splice(i,1);
          break;
        }
      }

      getTotalPercentage();
    };

    function getTotalPercentage() {
      vm.totalPercentage = 0;
      for(var i = 0; i < vm.location.analytics.length; i++) {
          vm.totalPercentage += vm.location.analytics[i].percent;
      }
    }

    $scope.validateFile = function(file,error) {
      if(file == null)
      {
        toaster.pop('error',"Error","Max file size 500MB and accepted file extensions .png,.jpg,.tif,.bmp");          
      }  
      else {
        vm.location.locationImageURL = file.name;
        locationimage = file;
      }    
    };

    // Remove existing Location
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.location.$remove(function () {
          $state.go('locations.list');
          toaster.pop('success',"Success","Location deleted successfully!");
        });
      }
    }

    // Save Location
    function save(isValid,form) {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.locationForm');
          return false;
        }

        if(vm.totalPercentage == 100) { 
        // Create a new location, or update the current instance
        vm.location.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('locations.list'); // should we send the User to the list or the updated Location's view?
          toaster.pop('success',"Success","Location saved successfully!");
        }

        function errorCallback(res) {
          toaster.pop('error',"Error","Location save error!");
        }
      } else {
        toaster.pop('error','Error',"Total must be 100 percent");
      }
    }
  }
}());

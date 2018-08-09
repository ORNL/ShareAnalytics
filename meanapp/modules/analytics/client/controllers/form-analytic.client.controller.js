(function () {
  'use strict';

  angular
    .module('analytics')
    .controller('AnalyticsFormController', AnalyticsFormController);

  AnalyticsFormController.$inject = ['$scope', '$http', '$state', '$window', 'utilityService', 'Upload', 'analyticResolve', 'Authentication','toaster'];

  function AnalyticsFormController($scope, $http, $state, $window, utilityService, Upload, analytic, Authentication,toaster) {
    var vm = this;

    vm.analytic = analytic;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    //Define available analytic types
    vm.analytictypes = ["bash","python","matlab","executable"];

    var analyticfile = null;
    var analyticfiles = [];

    $scope.validateFile = function(file,error) {
      if(file == null)
      {
        toaster.pop('error',"Error","Max file size 500MB");          
      }  
      else {
        vm.analytic.name = file.name;
        analyticfile = file;
      }    
    }

    $scope.validateSupportingFiles = function(files,error) {
      if(files == null)
      {
        toaster.pop('error',"Error","Max file size 500MB");          
      }  
      else {
        vm.analytic.supportingfiles = "";
        analyticfiles = [];
        angular.forEach(files, function(file) {
          vm.analytic.supportingfiles += file.name + ",";
          analyticfiles.push(file);
        });
      }    
    }

    function uploadFile(file,uuid) {
      $scope.f = file;          
      file.upload = Upload.upload({
        url: '/api/uploadanalytic',
        method: 'POST',
        data: {file: file, uuid: uuid}
      }).then(function (response) {
          $scope.f.progress = 0;
          getAvailableAnalytics();
          toaster.pop('success',"Success",file.name + " uploaded successfully!");              
          return response.data;
      }, function(response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      }, function(evt) {
        file.progress = Math.min(100, parseInt(100.0 *
          evt.loaded / evt.total));
      });
    }

    function getAvailableAnalytics() {
      $http({
        url: 'http://localhost:3000/api/availableanalytics',
        method: "GET"         
      })
      .then(function(response) {
          var values = [];
          var data = JSON.parse(response.data['analytics']);
          for(var i = 0; i < data.length; i++) {
                values.push(data[i]);
          }
          vm.analyticpaths = values;
      }, 
      function(response) { // optional
              // failed
      });
    }

    getAvailableAnalytics();

    // Remove existing Analytic
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.analytic.$remove(function () {
          $state.go('analytics.list');
          toaster.pop('success',"Success","Analytic deleted successfully!");
        });
      }
    }

    // Save Analytic
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.analyticForm');
        toaster.pop('error',"Error","Please fill out all required fields");        
        return false;
      }
      
      var uid = utilityService.getUUID();
      
      if(analyticfiles.length > 0) {
        angular.forEach(analyticfiles, function (file) {
          uploadFile(file,uid);
        });
      } else {
        if(vm.analytic.supportingfiles == null) {
          vm.analytic.supportingfiles = "";
        }
      }

      if(analyticfile != null) {
        uploadFile(analyticfile,uid);
      }

      vm.analytic.name = uid + "/" + vm.analytic.name.split("/").pop();

      // Create a new analytic, or update the current instance
      vm.analytic.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('analytics.list'); // should we send the User to the list or the updated Analytic's view?
        toaster.pop('success',"Success","Analytic saved successfully!");
      }

      function errorCallback(res) {
        toaster.pop('error',"Error","Analytic save error!  All fields must be filled in.");
      }
    }
  }
}());

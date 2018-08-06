(function () {
  'use strict';

  angular
    .module('datasets')
    .controller('DatasetsFormController', DatasetsFormController);

  DatasetsFormController.$inject = ['$scope', '$http', '$state', '$window', '$timeout', 'utilityService', 'Upload', 'datasetResolve', 'Authentication','toaster'];

  function DatasetsFormController($scope, $http, $state, $window, $timeout, utilityService, Upload, dataset, Authentication,toaster) {
    var vm = this;

    vm.dataset = dataset;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.licenses = ["Apache 2.0","BSD 3-Clause","BSD 2-Clause","GNU GPL","GNU Library","MIT","Mozialla Public 2.0","Eclipse Public"];
    vm.extensibleoptions = ["Yes","No","Contact Owner"];
    vm.filesizeunits = ["KB","MB","GB"];
    if(vm.dataset.files != null) {
      vm.datasetfiles = vm.dataset.files.split(",");
    } else {
      vm.datasetfiles = [];
    }
    var datasetfiles = []; //holds actual file objects

    vm.disablefileselect = false; //needed because ng-file-upload nulls out model value temporarily and is unusable after first selection
    vm.dataset.collected = convertToDate(vm.dataset.collected);
    vm.dataset.validthru = convertToDate(vm.dataset.validthru);

    function convertToDate(dateString) {
      return new Date(dateString);
    }

    $scope.validateFiles = function(files,error) {
      vm.disablefileselect = true;
      if(files == null)
      {
        toaster.pop('error',"Error","Max file size 500MB");  
      }  
      else {
        angular.forEach(files, function(file) {
          if(!vm.datasetfiles.includes(file.name)) {
            datasetfiles.push(file);
            vm.datasetfiles.push(file.name);
          } else {
            toaster.pop('error',"Error","File already included");
          }
        });
      } 
      $timeout(function() { vm.disablefileselect = false; }, 2000);        
    };

    $scope.remove = function(filename) {         
      
      var index = vm.datasetfiles.indexOf(filename);
  
      if (index > -1) {
        vm.datasetfiles.splice(index, 1);
      }

      if(vm.dataset._id) {

        $http({
          url: 'http://localhost:3000/api/deletedatasetfile',
          method: "POST",
          data: { 'path' : vm.dataset.path, 'filename' : filename, 'mongoid': vm.dataset._id },
          headers: {'Content-Type': 'application/json'}       
        })
        .then(function(response) {
          toaster.pop('success',"Success","File deleted successfully");        
        }, 
        function(response) { // optional
          toaster.pop('error',"Error","Cannot find the file");        
        }); 

      }

    };

    function uploadFile(file,uuid) {
      $scope.f = file;          
      file.upload = Upload.upload({
        url: '/api/uploaddataset',
        method: 'POST',
        data: {file: file, uuid: uuid}
      }).then(function (response) {
          $scope.f.progress = 0;
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

    function getAvailableDatasets() {
      $http({
        url: 'http://localhost:3000/api/availabledatasets',
        method: "GET"         
      })
      .then(function(response) {
          var values = [];
          var data = JSON.parse(response.data.datasets);
          for(var i = 0; i < data.length; i++) {
                values.push(data[i]);
          }
          vm.datasetpaths = values;
      }, 
      function(response) { // optional
              // failed
      });
    }

    getAvailableDatasets();

    // Remove existing Dataset
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.dataset.$remove(function () {
          $state.go('datasets.list');
          toaster.pop('success',"Success","Dataset deleted successfully!");
        });
      }
    }

    // Save Dataset
    function save(isValid,form) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.datasetForm');
        return false;
      }

      var uid = utilityService.getUUID();
      
      vm.dataset.files = "";
      if(vm.datasetfiles.length > 0) {
        angular.forEach(datasetfiles, function (file) {
          uploadFile(file,uid);
        });
        angular.forEach(vm.datasetfiles, function (file) {
          vm.dataset.files += file + ",";
        });
        vm.dataset.files = vm.dataset.files.slice(0,-1);
      } else {
        if(vm.datasetfiles.length == 0) {
          vm.dataset.files = "";
        }
      }

      vm.dataset.path = uid + "/";        
      
      // Create a new dataset, or update the current instance
      vm.dataset.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        vm.dataset.collected = convertToDate(vm.dataset.collected); //If these two lines aren't here get error in console about Date not being formatted correctly
        vm.dataset.validthru = convertToDate(vm.dataset.validthru);
        $state.go('datasets.list'); // should we send the User to the list or the updated Dataset's view?
        toaster.pop('success',"Success","Dataset saved successfully!");
      }

      function errorCallback(res) {
        toaster.pop('error',"Error","Dataset save error!");
      }
    }
  }
}());

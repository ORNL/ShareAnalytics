(function () {
  'use strict';

  angular
    .module('dashboards')
    .controller('DashboardsFormController', DashboardsFormController);

  DashboardsFormController.$inject = ['$scope', '$http', '$state', '$window', 'utilityService', 'LocationsService', 'Upload', 'dashboardResolve', 'Authentication','toaster'];

  function DashboardsFormController($scope, $http, $state, $window, utilityService, LocationsService, Upload, dashboard, Authentication,toaster) {
    var vm = this;

    vm.dashboard = dashboard;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.locations = LocationsService.query();

    //In the case of New Dashboard empty object is returned and we do not want to / cannot fill in these fields
    if(Object.keys(vm.dashboard).length > 0) {
      vm.dashboard.$promise.then(function(){
        vm.latitude = vm.dashboard.loc.coordinates[1];
        vm.longitude = vm.dashboard.loc.coordinates[0];

        vm.locations.$promise.then(function() {
          for(var i =0; i<vm.locations.length; i++) {
            if(vm.locations[i]._id == vm.dashboard.loctype._id) {
              vm.selectedLocType = vm.locations[i];
            }
          }
        });

      });      
    }

    var dashboardimage = null;
    var mapimage = null;

    $scope.validateFile = function(file,error) {
      if(file == null)
      {
        toaster.pop('error',"Error","Max file size 500MB and accepted file extensions .png,.jpg,.tif,.bmp");          
      }  
      else {
        vm.dashboard.dashboardImageURL = file.name;
        dashboardimage = file;
      }    
    };

    $scope.validateMapFile = function(file,error) {
      if(file == null)
      {
        toaster.pop('error',"Error","Max file size 500MB and accepted file extensions .png,.jpg,.tif,.bmp");          
      }  
      else {
        vm.dashboard.mapImageURL = file.name;
        mapimage = file;
      }    
    };

    function uploadImage(file,uuid) {
      $scope.f = file;     
      file.upload = Upload.upload({
        url: '/api/uploaddashboardimage',
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

    // Remove existing Dashboard
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.dashboard.$remove(function () {
          $state.go('dashboards.list');
          toaster.pop('success',"Success","Dashboard deleted successfully!");
        });
      }
    }

    // Save Dashboard
    function save(isValid,form) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.dashboardForm');
        return false;
      }

      var save = true;

      var uid = utilityService.getUUID();
      if(dashboardimage != null) {
        uploadImage(dashboardimage,uid);
        vm.dashboard.dashboardImageURL = uid + "/" + vm.dashboard.dashboardImageURL.split("/").pop();        
      } else if(vm.dashboard.dashboardImageURL == "" || vm.dashboard.dashboardImageURL == null) {
        toaster.pop('error',"Error","Must add valid dashboard image");  
        save = false;      
      }

      if(mapimage != null && vm.dashboard.usealternatemapimage) {
        uploadImage(mapimage,uid);
        vm.dashboard.mapImageURL = uid + "/" + vm.dashboard.mapImageURL.split("/").pop();        
      } else if (vm.dashboard.usealternatemapimage && (vm.dashboard.mapImageURL == "" || vm.dashboard.mapImageURL == null)) {
        toaster.pop('error',"Error","If using alternative dashboard image, must provide valid image");    
        save = false;    
      }

      vm.dashboard.path = uid + "/";           

      vm.dashboard.loc = { 
        "type": "Point",
        "coordinates": [vm.longitude,vm.latitude]
      };   

      vm.dashboard.loctype = vm.selectedLocType;     
      
      // Create a new dashboard, or update the current instance
      if(save) {
        vm.dashboard.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);
      }

      function successCallback(res) {
        $state.go('dashboards.list');
        toaster.pop('success',"Success","Dashboard saved successfully!");
      }

      function errorCallback(res) {
        toaster.pop('error',"Error","Dashboard save error!");
      }
    }
  }
}());

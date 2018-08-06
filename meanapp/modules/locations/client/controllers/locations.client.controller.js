(function () {
  'use strict';

  angular
    .module('locations')
    .controller('LocationsController', LocationsController);

  LocationsController.$inject = ['$scope', '$window', '$http', 'FileSaver', 'Authentication', 'NgTableParams', 'toaster', 'LocationsService'];

  function LocationsController($scope, $window, $http, FileSaver, Authentication, NgTableParams, toaster, LocationsService) {
    var vm = this;

    //get creds
    vm.authentication = Authentication;
    
    vm.locations = LocationsService.query();

    //Must wait for promise to resolve or else the table will appear empty on initial page load
    vm.locations.$promise.then(function(){
        if(vm.locations.length > 10)
        {
          vm.locationTableParams = new NgTableParams({}, { dataset: vm.locations });      
        } else {
          vm.locationTableParams = new NgTableParams({count: vm.locations.length}, { dataset: vm.locations, counts: [] });                
        }    
    });

    //Handle expanding / collapsing of rows when clicked
    vm.rowclicked = function(rowlocation) {
      if(rowlocation.expanded) {
        vm.collapse(rowlocation);
      } else {
        vm.expand(rowlocation);
      }
    }

    //Expand row and close all other expanded rows
    vm.expand = function(rowlocation) {
        for(var i = 0; i < vm.locationTableParams.data.length; i++)
        {
            if(vm.locationTableParams.data[i].expanded != null) {
              if(vm.locationTableParams.data[i].expanded) {
                vm.locationTableParams.data[i].expanded = false;
              }
            }
        }
        rowlocation.expanded = true;        
      }
  
      //Collapse expanded row
      vm.collapse = function(rowlocation) {
          rowlocation.expanded = false;      
      }

    //Reload table values gracefully
    function reload() {
      vm.locations = LocationsService.query();
      
      //Must wait for promise to resolve or else the table will appear empty on initial page load
      vm.locations.$promise.then(function(){
          if(vm.locations.length > 10)
          {
            vm.locationTableParams = new NgTableParams({}, { dataset: vm.locations });      
          } else {
            vm.locationTableParams = new NgTableParams({count: vm.locations.length}, { dataset: vm.locations, counts: [] });                
          }   
      });
    }

    $scope.remove = function(location) {
      if ($window.confirm('Are you sure you want to delete?')) {
          location.$remove(function () {
          reload();
          toaster.pop('success',"Success","Analytic deleted successfully!");
        });
      }
    }

    function openSaveAsDialog(filename, content, mediaType) {
      var blob = new Blob([content], {
          type: mediaType
      });
      FileSaver.saveAs(blob, filename);
    } 

    $scope.textSearch = function(query) {
      
            $http({
              url: 'http://localhost:3000/api/locations/textsearch',
              method: "POST",
              data: { 'searchval' : query },
              headers: {'Content-Type': 'application/json'}      
            })
            .then(function(response) {
               vm.locations = response.data;
               if(vm.locations.length > 10)
               {
                  vm.locationTableParams = new NgTableParams({}, { location: vm.locations });      
               } else {
                  vm.locationTableParams = new NgTableParams({count: vm.locations.length}, { location: vm.locations, counts: [] });                
               }
            }, 
            function(response) { // optional
                    // failed
            });
    }

  }
}());

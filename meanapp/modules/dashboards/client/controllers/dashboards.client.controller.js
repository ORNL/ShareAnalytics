(function () {
  'use strict';

  angular
    .module('dashboards')
    .controller('DashboardsController', DashboardsController);

  DashboardsController.$inject = ['$scope', '$window', '$http', 'FileSaver', 'Authentication', 'NgTableParams', 'toaster', 'DashboardsService'];

  function DashboardsController($scope, $window, $http, FileSaver, Authentication, NgTableParams, toaster, DashboardsService) {
    var vm = this;

    //get creds
    vm.authentication = Authentication;
    
    vm.dashboards = DashboardsService.query();

    //Must wait for promise to resolve or else the table will appear empty on initial page load
    vm.dashboards.$promise.then(function(){

        //This is necessary because ngTable won't sort on nested vars
        for(var i =0; i < vm.dashboards.length; i++) {
          vm.dashboards[i].locationtype = vm.dashboards[i].loctype.title;
        }

        if(vm.dashboards.length > 10)
        {
          vm.dashboardTableParams = new NgTableParams({}, { dataset: vm.dashboards });      
        } else {
          vm.dashboardTableParams = new NgTableParams({count: vm.dashboards.length}, { dataset: vm.dashboards, counts: [] });                
        }    
    });

    //Handle expanding / collapsing of rows when clicked
    vm.rowclicked = function(rowdashboard) {
      if(rowdashboard.expanded) {
        vm.collapse(rowdashboard);
      } else {
        vm.expand(rowdashboard);
      }
    };

    //Expand row and close all other expanded rows
    vm.expand = function(rowdashboard) {
        for(var i = 0; i < vm.dashboardTableParams.data.length; i++)
        {
            if(vm.dashboardTableParams.data[i].expanded != null) {
              if(vm.dashboardTableParams.data[i].expanded) {
                vm.dashboardTableParams.data[i].expanded = false;
              }
            }
        }
        rowdashboard.expanded = true;        
      };
  
      //Collapse expanded row
      vm.collapse = function(rowdashboard) {
          rowdashboard.expanded = false;      
      };

    //Reload table values gracefully
    function reload() {
      vm.dashboards = DashboardsService.query();
      
      //Must wait for promise to resolve or else the table will appear empty on initial page load
      vm.dashboards.$promise.then(function(){

          //This is necessary because ngTable won't sort on nested vars
          for(var i =0; i < vm.dashboards.length; i++) {
            vm.dashboards[i].locationtype = vm.dashboards[i].loctype.title;
          }

          if(vm.dashboards.length > 10)
          {
            vm.dashboardTableParams = new NgTableParams({}, { dataset: vm.dashboards });      
          } else {
            vm.dashboardTableParams = new NgTableParams({count: vm.dashboards.length}, { dataset: vm.dashboards, counts: [] });                
          }   
      });
    }

    $scope.remove = function(dashboard) {
      if ($window.confirm('Are you sure you want to delete?')) {
          dashboard.$remove(function () {
          reload();
          toaster.pop('success',"Success","Analytic deleted successfully!");
        });
      }
    };

    function openSaveAsDialog(filename, content, mediaType) {
      var blob = new Blob([content], {
          type: mediaType
      });
      FileSaver.saveAs(blob, filename);
    } 

    $scope.textSearch = function(query) {
      
            $http({
              url: 'http://localhost:3000/api/dashboards/textsearch',
              method: "POST",
              data: { 'searchval' : query },
              headers: {'Content-Type': 'application/json'}      
            })
            .then(function(response) {
               vm.dashboards = response.data;
               if(vm.dashboards.length > 10)
               {
                  vm.dashboardTableParams = new NgTableParams({}, { dashboard: vm.dashboards });      
               } else {
                  vm.dashboardTableParams = new NgTableParams({count: vm.dashboards.length}, { dashboard: vm.dashboards, counts: [] });                
               }
            }, 
            function(response) { // optional
                    // failed
            });
    };

  }
}());

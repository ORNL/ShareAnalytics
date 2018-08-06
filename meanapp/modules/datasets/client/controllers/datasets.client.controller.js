(function () {
  'use strict';

  angular
    .module('datasets')
    .controller('DatasetsController', DatasetsController);

  DatasetsController.$inject = ['$scope', '$window', '$http', 'FileSaver', 'Authentication', 'NgTableParams', 'toaster', 'DatasetsService'];

  function DatasetsController($scope, $window, $http, FileSaver, Authentication, NgTableParams, toaster, DatasetsService) {
    var vm = this;

    //get creds
    vm.authentication = Authentication;
    
    vm.datasets = DatasetsService.query();

    //Must wait for promise to resolve or else the table will appear empty on initial page load
    vm.datasets.$promise.then(function(){
        if(vm.datasets.length > 10)
        {
          vm.datasetTableParams = new NgTableParams({}, { dataset: vm.datasets });      
        } else {
          vm.datasetTableParams = new NgTableParams({count: vm.datasets.length}, { dataset: vm.datasets, counts: [] });                
        }    
    });

    vm.convertdatetimetodate = function(datetime) {
      var split = datetime.toString().split("T");
      return split[0];
    }

    //Handle expanding / collapsing of rows when clicked
    vm.rowclicked = function(rowdataset) {
      if(rowdataset.expanded) {
        vm.collapse(rowdataset);
      } else {
        vm.expand(rowdataset);
      }
    };

    //Expand row and close all other expanded rows
    vm.expand = function(rowdataset) {
        for(var i = 0; i < vm.datasetTableParams.data.length; i++)
        {
            if(vm.datasetTableParams.data[i].expanded != null) {
              if(vm.datasetTableParams.data[i].expanded) {
                vm.datasetTableParams.data[i].expanded = false;
              }
            }
        }
        rowdataset.expanded = true;        
      };
  
      //Collapse expanded row
      vm.collapse = function(rowdataset) {
          rowdataset.expanded = false;      
      };

    //Reload table values gracefully
    function reload() {
      vm.datasets = DatasetsService.query();
      
      //Must wait for promise to resolve or else the table will appear empty on initial page load
      vm.datasets.$promise.then(function(){
          if(vm.datasets.length > 10)
          {
            vm.datasetTableParams = new NgTableParams({}, { dataset: vm.datasets });      
          } else {
            vm.datasetTableParams = new NgTableParams({count: vm.datasets.length}, { dataset: vm.datasets, counts: [] });                
          }   
      });
    }

    $scope.remove = function(dataset) {
      if ($window.confirm('Are you sure you want to delete?')) {
          dataset.$remove(function () {
          reload();
          toaster.pop('success',"Success","Dataset deleted successfully!");
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
              url: 'http://localhost:3000/api/datasets/textsearch',
              method: "POST",
              data: { 'searchval' : query },
              headers: {'Content-Type': 'application/json'}      
            })
            .then(function(response) {
               vm.datasets = response.data;
               if(vm.datasets.length > 10)
               {
                  vm.datasetTableParams = new NgTableParams({}, { dataset: vm.datasets });      
               } else {
                  vm.datasetTableParams = new NgTableParams({count: vm.datasets.length}, { dataset: vm.datasets, counts: [] });                
               }
            }, 
            function(response) { // optional
                    // failed
            });
    };

    $scope.download = function(dataset) {      
      $http({
        url: 'http://localhost:3000/api/downloaddatasetaszip',
        method: "POST",
        Accept: 'application/octet-stream',
        responseType: 'arraybuffer',
        data: { 'path' : dataset.path, 'name' : dataset.title, 'files': dataset.files },
        headers: {'Content-Type': 'application/json'}       
      })
      .then(function(response) {
        var filename = dataset.title + ".zip";
        openSaveAsDialog(filename, response.data, 'application/zip');
      }, 
      function(response) { // optional
        toaster.pop('error',"Error","Cannot find the file");        
      }); 

    };

  }
}());

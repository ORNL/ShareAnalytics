(function () {
  'use strict';

  angular
    .module('analytics')
    .controller('AnalyticsController', AnalyticsController);

  AnalyticsController.$inject = ['$scope', '$window', '$http', 'FileSaver', 'NgTableParams', 'Authentication', 'toaster', 'AnalyticsService'];

  /**
   * Controller for the list-analytics view  
   * 
   * @param {*}  
   * @param {*}  
   * @param {*}  
   * @param {*} Authentication need auth to limit which users can edit analytics
   * @param {*} toaster 
   * @param {*} AnalyticsService 
   */
  function AnalyticsController($scope, $window, $http, FileSaver, NgTableParams, Authentication, toaster, AnalyticsService) {
    var vm = this;

    //Fetch available analytics
    vm.analytics = AnalyticsService.query();

    //Must wait for promise to resolve or else the table will appear empty on initial page load
    vm.analytics.$promise.then(function(){
        if(vm.analytics.length > 10)
        {
          vm.analyticTableParams = new NgTableParams({}, { dataset: vm.analytics });      
        } else {
          vm.analyticTableParams = new NgTableParams({count: vm.analytics.length}, { dataset: vm.analytics, counts: [] });                
        }  
    });

    //reload table values gracefully
    function reload() {
      vm.analytics = AnalyticsService.query();
      
      //Must wait for promise to resolve or else the table will appear empty on initial page load
      vm.analytics.$promise.then(function(){
          if(vm.analytics.length > 10)
          {
            vm.analyticTableParams = new NgTableParams({}, { dataset: vm.analytics });      
          } else {
            vm.analyticTableParams = new NgTableParams({count: vm.analytics.length}, { dataset: vm.analytics, counts: [] });                
          }
      });
    }

    //Handle expanding / collapsing of rows when clicked
    vm.rowclicked = function(rowanalytic) {
      if(rowanalytic.expanded) {
        vm.collapse(rowanalytic);
      } else {
        vm.expand(rowanalytic);
      }
    }

    //Expand row and close all other expanded rows
    vm.expand = function(rowanalytic) {
        for(var i = 0; i < vm.analyticTableParams.data.length; i++)
        {
          if(vm.analyticTableParams.data[i].expanded != null) {
            if(vm.analyticTableParams.data[i].expanded) {
              vm.analyticTableParams.data[i].expanded = false;
            }
          }
        }
        rowanalytic.expanded = true;        
    }

    //Collapse expanded row
    vm.collapse = function(rowanalytic) {
        rowanalytic.expanded = false;      
    }

    //Grab authentication information
    vm.authentication = Authentication;

    /**
     * Remove analytic dialog confirmation
     */
    $scope.remove = function(analytic) {
      if ($window.confirm('Are you sure you want to delete?')) {
          analytic.$remove(function () {
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
        url: 'http://localhost:3000/api/analytics/textsearch',
        method: "POST",
        data: { 'searchval' : query },
        headers: {'Content-Type': 'application/json'}      
      })
      .then(function(response) {
         vm.analytics = response.data;
         if(vm.analytics.length > 10)
         {
            vm.analyticTableParams = new NgTableParams({}, { dataset: vm.analytics });      
         } else {
            vm.analyticTableParams = new NgTableParams({count: vm.analytics.length}, { dataset: vm.analytics, counts: [] });                
         }
      }, 
      function(response) { // optional
              // failed
      });
    }

    $scope.download = function(analytic) {      
      $http({
        url: 'http://localhost:3000/api/downloadanalyticaszip',
        method: "POST",
        Accept: 'application/octet-stream',
        responseType: 'arraybuffer',
        data: { 'filename' : analytic.name, 'name' : analytic.title, 'supportingfiles' : analytic.supportingfiles },
        headers: {'Content-Type': 'application/json'}       
      })
      .then(function(response) {
        var filename = analytic.title + ".zip";
        openSaveAsDialog(filename, response.data, 'application/zip');
      },
      function(response) { // optional
        toaster.pop('error',"Error","Cannot find the file");        
      }); 

    }

  }
}());

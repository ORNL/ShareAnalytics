(function () {
    'use strict';
  
    angular
      .module('core')
      .controller('AnalyzeController', AnalyzeController);
  
    AnalyzeController.$inject = ['$scope', '$http', '$state', 'toaster', 'Upload', 'AnalyticsService', 'DatasetsService', 'DashboardsService', 'Authentication'];
  
    function AnalyzeController($scope, $http, $state, toaster, Upload, AnalyticsService, DatasetsService, DashboardsService, Authentication) {
      var vm = this;  
      
      vm.authentication = Authentication;

      /**
       * Grab available analytics
       */
      vm.analytics = AnalyticsService.query();    

      /**
       * Grab available datasets
       */
      vm.datasets = DatasetsService.query();
  
      /**
       * Grab available dashboards
       */
      vm.dashboards = DashboardsService.query();

      /**
       * Each dataset has set of files associated with it
       * Have to update this list once dataset is selected
       */
      vm.datasetfiles = [];

      $scope.updateFiles = function() {
        vm.datasetfiles = $scope.selectedDataset.files.split(',');
      }

      /**
       * Send to slurm to be analyzed
       * datasetpath is the path that the slurm nodes can reach (needs to be configured in slurm module)
       * same with analyticpath
       */
      $scope.sendToSlurm = function(title,description,dataset,file,analytic,dashboard,isValid) {        
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.analyzeForm');
          toaster.pop("error","Error","Please fill in all required fields");
          return false;
        }

        if(title==null || description==null || dataset==null || file==null || analytic==null) {
          toaster.pop("error","Error","Please fill in all required fields");
          return false;
        }

        var dashboardid = null;
        if(dashboard != null && dashboard._id) {
          dashboardid = dashboard._id;
        } else {
          dashboardid = "none";
        }

        $scope.title = "";
        $scope.description = "";
        $scope.selectedDataset = "";
        $scope.selectedAnalytic = "";
        $scope.selectedDashboard = "";    
        $scope.selectedFile = "";    
        //Set back to pristine
        vm.form.analyzeForm.$setPristine();
        //Set back to untouched
        vm.form.analyzeForm.$setUntouched();

        $state.go("results.list");
        toaster.pop('success',"Success","Job submitted successfully!");    

        $http({
            url: 'http://localhost:3000/api/slurm',
            method: "POST",
            data: { 'dataset' : dataset._id, 'analytic' : analytic._id, 'analytictype' : analytic.type, 'dashboard':dashboardid, 'datasetpath' : dataset.path + file, 'analyticpath' : analytic.name, 'title' : title, 'description' : description },
            headers: {'Content-Type': 'application/json'}          
          })
          .then(function(response) {
          }, 
          function(response) { // optional
        });

        return true;
      };
    }
  }());
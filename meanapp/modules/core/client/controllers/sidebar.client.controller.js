(function () {

  'use strict';

  angular
    .module('core')
    .controller('SideBarController', SideBarController);

  SideBarController.$inject = ['$scope','$http','Authentication','AnalyticsService','DatasetsService','Upload','toaster'];

  function SideBarController($scope,$http,Authentication,AnalyticsService,DatasetsService,Upload,toaster) {
    var vm = this;
    
    vm.authentication = Authentication;

    vm.analytics = AnalyticsService.query();    
    vm.datasets = DatasetsService.query();
    
    $scope.oneAtATime = true;

    $scope.isCollapsed = false;

    $scope.groups = [
      {
        title: 'Dynamic Group Header - 1',
        content: 'Dynamic Group Body - 1'
      },
      {
        title: 'Dynamic Group Header - 2',
        content: 'Dynamic Group Body - 2'
      }
    ];
  
    $scope.items = ['Item 1', 'Item 2', 'Item 3'];
  
    $scope.addItem = function() {
      var newItemNo = $scope.items.length + 1;
      $scope.items.push('Item ' + newItemNo);
    };
  
    $scope.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };
  
  };
  
}());


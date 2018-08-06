(function () {
  'use strict';

  angular
    .module('results.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('results', {
        breadcrumb: 'Results',
        abstract: true,
        url: '/results',
        template: '<ui-view/>'
      })
      .state('results.list', {
        url: '',
        templateUrl: '/modules/results/client/views/list-results.client.view.html',
        controller: 'ResultsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        }
      });
  }

  getResult.$inject = ['$stateParams', 'ResultsService'];

  function getResult($stateParams, ResultsService) {
    return ResultsService.get({
      resultId: $stateParams.resultId
    }).$promise;
  }

  newResult.$inject = ['ResultsService'];

  function newResult(ResultsService) {
    return new ResultsService();
  }
}());

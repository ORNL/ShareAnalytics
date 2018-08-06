(function () {
  'use strict';

  angular
    .module('datasets.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('datasets', {
        breadcrumb: 'Datasets',
        abstract: true,
        url: '/datasets',
        template: '<ui-view/>'
      })
      .state('datasets.list', {
        url: '',
        templateUrl: '/modules/datasets/client/views/list-datasets.client.view.html',
        controller: 'DatasetsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        }
      })
      .state('datasets.create', {
        url: '/create',
        templateUrl: '/modules/datasets/client/views/form-dataset.client.view.html',
        controller: 'DatasetsFormController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        },
        resolve: {
          datasetResolve: newDataset
        }
      })
      .state('datasets.edit', {
        url: '/:datasetId/edit',
        templateUrl: '/modules/datasets/client/views/form-dataset.client.view.html',
        controller: 'DatasetsFormController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user'],
          pageTitle: '{{ datasetResolve.title }}'
        },
        resolve: {
          datasetResolve: getDataset
        }
      });
  }

  getDataset.$inject = ['$stateParams', 'DatasetsService'];

  function getDataset($stateParams, DatasetsService) {
    return DatasetsService.get({
      datasetId: $stateParams.datasetId
    }).$promise;
  }

  newDataset.$inject = ['DatasetsService'];

  function newDataset(DatasetsService) {
    return new DatasetsService();
  }
}());

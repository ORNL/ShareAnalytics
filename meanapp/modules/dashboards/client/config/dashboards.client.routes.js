(function () {
  'use strict';

  angular
    .module('dashboards.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('dashboards', {
        breadcrumb: 'Dashboards',
        abstract: true,
        url: '/dashboards',
        template: '<ui-view/>'
      })
      .state('dashboards.list', {
        url: '',
        templateUrl: '/modules/dashboards/client/views/list-dashboards.client.view.html',
        controller: 'DashboardsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        }
      })
      .state('dashboards.create', {
        url: '/create',
        templateUrl: '/modules/dashboards/client/views/form-dashboard.client.view.html',
        controller: 'DashboardsFormController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        },
        resolve: {
          dashboardResolve: newDashboard
        }
      })
      .state('dashboards.view', {
        url: '/:dashboardId/view',
        templateUrl: '/modules/dashboards/client/views/dashboard.client.view.html',
        controller: 'ViewDashboardController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        },
        resolve: {
          dashboardResolve: getDashboard
        }
      })
      .state('dashboards.edit', {
        url: '/:dashboardId/edit',
        templateUrl: '/modules/dashboards/client/views/form-dashboard.client.view.html',
        controller: 'DashboardsFormController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user'],
          pageTitle: '{{ dashboardResolve.title }}'
        },
        resolve: {
          dashboardResolve: getDashboard
        }
      });
  }

  getDashboard.$inject = ['$stateParams', 'DashboardsService'];

  function getDashboard($stateParams, DashboardsService) {
    return DashboardsService.get({
      dashboardId: $stateParams.dashboardId
    }).$promise;
  }

  newDashboard.$inject = ['DashboardsService'];

  function newDashboard(DashboardsService) {
    return new DashboardsService();
  }
}());

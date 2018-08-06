(function () {
  'use strict';

  angular
    .module('analytics.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('analytics', {
        breadcrumb: 'Analytics',
        abstract: true,
        url: '/analytics',
        template: '<ui-view/>'
      })
      .state('analytics.list', {
        url: '',
        templateUrl: '/modules/analytics/client/views/list-analytics.client.view.html',
        controller: 'AnalyticsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        }
      })
      .state('analytics.create', {
        url: '/create',
        templateUrl: '/modules/analytics/client/views/form-analytic.client.view.html',
        controller: 'AnalyticsFormController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        },
        resolve: {
          analyticResolve: newAnalytic
        }
      })
      .state('analytics.edit', {
        url: '/:analyticId/edit',
        templateUrl: '/modules/analytics/client/views/form-analytic.client.view.html',
        controller: 'AnalyticsFormController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user'],
          pageTitle: '{{ analyticResolve.title }}'
        },
        resolve: {
          analyticResolve: getAnalytic
        }
      });
  }

  getAnalytic.$inject = ['$stateParams', 'AnalyticsService'];

  function getAnalytic($stateParams, AnalyticsService) {
    return AnalyticsService.get({
      analyticId: $stateParams.analyticId
    }).$promise;
  }

  newAnalytic.$inject = ['AnalyticsService'];

  function newAnalytic(AnalyticsService) {
    return new AnalyticsService();
  }
}());

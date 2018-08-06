(function () {
  'use strict';

  angular
    .module('core.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        breadcrumb: 'Admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
}());

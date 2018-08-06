(function () {
  'use strict';

  angular
    .module('influxdb.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('influxdb', {
        breadcrumb: 'influxdb',
        abstract: true,
        url: '/influxdb',
        template: '<ui-view/>'
      })
      .state('influxdb.createdataset', {
        url: '',
        templateUrl: '/modules/influxdb/client/views/form-influxdb.client.view.html',
        controller: 'InfluxdbFormController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        }
      });
  }

}());

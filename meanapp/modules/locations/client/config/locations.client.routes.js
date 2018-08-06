(function () {
  'use strict';

  angular
    .module('locations.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('locations', {
        breadcrumb: 'Locations',
        abstract: true,
        url: '/locations',
        template: '<ui-view/>'
      })
      .state('locations.list', {
        url: '',
        templateUrl: '/modules/locations/client/views/list-locations.client.view.html',
        controller: 'LocationsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        }
      })
      .state('locations.create', {
        url: '/create',
        templateUrl: '/modules/locations/client/views/form-location.client.view.html',
        controller: 'LocationsFormController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user']
        },
        resolve: {
          locationResolve: newLocation
        }
      })
      .state('locations.edit', {
        url: '/:locationId/edit',
        templateUrl: '/modules/locations/client/views/form-location.client.view.html',
        controller: 'LocationsFormController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user'],
          pageTitle: '{{ locationResolve.title }}'
        },
        resolve: {
          locationResolve: getLocation
        }
      });
  }

  getLocation.$inject = ['$stateParams', 'LocationsService'];

  function getLocation($stateParams, LocationsService) {
    return LocationsService.get({
      locationId: $stateParams.locationId
    }).$promise;
  }

  newLocation.$inject = ['LocationsService'];

  function newLocation(LocationsService) {
    return new LocationsService();
  }
}());

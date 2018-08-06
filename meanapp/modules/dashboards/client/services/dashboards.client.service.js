(function () {
  'use strict';

  angular
    .module('dashboards.services')
    .factory('DashboardsService', DashboardsService);
    
  DashboardsService.$inject = ['$resource', '$log'];

  function DashboardsService($resource, $log) {
    var Dashboard = $resource('/api/dashboards/:dashboardId', {
      dashboardId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Dashboard.prototype, {
      createOrUpdate: function () {
        var dashboard = this;
        return createOrUpdate(dashboard);
      }
    });

    return Dashboard;

    function createOrUpdate(dashboard) {
      if (dashboard._id) {
        return dashboard.$update(onSuccess, onError);
      } else {
        return dashboard.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(dashboard) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
}());

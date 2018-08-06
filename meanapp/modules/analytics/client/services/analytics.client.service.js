(function () {
  'use strict';

  angular
    .module('analytics.services')
    .factory('AnalyticsService', AnalyticsService);

  AnalyticsService.$inject = ['$resource', '$log'];

  function AnalyticsService($resource, $log) {
    /**
     * Make a call to the server side api using $resource
     */
    var Analytic = $resource('/api/analytics/:analyticId', {
      analyticId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    /**
     * Enable CRUD triggers against the returned object
     */
    angular.extend(Analytic.prototype, {
      createOrUpdate: function () {
        var analytic = this;
        return createOrUpdate(analytic);
      }
    });

    return Analytic;

    function createOrUpdate(analytic) {
      if (analytic._id) {
        return analytic.$update(onSuccess, onError);
      } else {
        return analytic.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(analytic) {
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

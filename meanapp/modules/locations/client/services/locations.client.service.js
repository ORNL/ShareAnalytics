(function () {
  'use strict';

  angular
    .module('locations.services')
    .factory('LocationsService', LocationsService);
    
  LocationsService.$inject = ['$resource', '$log'];

  function LocationsService($resource, $log) {
    var Location = $resource('/api/locations/:locationId', {
      locationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Location.prototype, {
      createOrUpdate: function () {
        var location = this;
        return createOrUpdate(location);
      }
    });

    return Location;

    function createOrUpdate(location) {
      if (location._id) {
        return location.$update(onSuccess, onError);
      } else {
        return location.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(location) {
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

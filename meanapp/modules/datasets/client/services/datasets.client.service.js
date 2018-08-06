(function () {
  'use strict';

  angular
    .module('datasets.services')
    .factory('DatasetsService', DatasetsService);
    
  DatasetsService.$inject = ['$resource', '$log'];

  function DatasetsService($resource, $log) {
    var Dataset = $resource('/api/datasets/:datasetId', {
      datasetId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Dataset.prototype, {
      createOrUpdate: function () {
        var dataset = this;
        return createOrUpdate(dataset);
      }
    });

    return Dataset;

    function createOrUpdate(dataset) {
      if (dataset._id) {
        return dataset.$update(onSuccess, onError);
      } else {
        return dataset.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(dataset) {
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

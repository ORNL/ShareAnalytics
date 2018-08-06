(function () {
  'use strict';

  angular
    .module('results.services')
    .factory('ResultsService', ResultsService);

  ResultsService.$inject = ['$resource', '$log'];

  function ResultsService($resource, $log) {
    var Result = $resource('/api/results/:resultId', {
      resultId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    /**
     * By default, ngresource provides the following methods 
     * 
      { 'get':    {method:'GET'},
        'save':   {method:'POST'},
        'query':  {method:'GET', isArray:true},
        'remove': {method:'DELETE'},
        'delete': {method:'DELETE'} };
    */

    //Adding functionality to the default ngresource functionality
    angular.extend(Result.prototype, {
      createOrUpdate: function () {
        var result = this;
        return createOrUpdate(result);
      }
    });

    return Result;

    function createOrUpdate(result) {
      if (result._id) {
        return result.$update(onSuccess, onError);
      } else {
        return result.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(result) {
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

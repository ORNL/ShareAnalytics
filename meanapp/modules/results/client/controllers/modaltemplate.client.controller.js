(function () {
    'use strict';
  
    angular
      .module('results')
      .controller('ModalCarouselController', ModalCarouselController);
  
    ModalCarouselController.$inject = ['$scope', 'close', '$http', 'Authentication','images','title'];
  
    function ModalCarouselController($scope, close, $http, Authentication,images,title) {
        var vm = this;
        $scope.images = images;
        $scope.title = title;

        $scope.dismissModal = function(result) {
            close(result, 200); // close, but give 200ms for bootstrap to animate
        };
    }

    }());
    
(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', '$window', 'socket', 'Authentication', 'menuService', 'toaster'];

  function HeaderController($scope, $state, $window, socket, Authentication, menuService, toaster) {
    var vm = this;

    //Alert user when a result is ready for viewing
    $scope.$on('socket:resultdone', function(ev,title) {
      toaster.pop('info',"Results Ready","Results of analysis " + title + " ready for viewing. Check it out!");                                                  
    });

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    //vm.menu = menuService.getMenu('topbar'); not currently using this menu

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }

    $scope.openAside = function() {

      var myEl = angular.element( document.querySelector( '#wrapper' ) );
      myEl.toggleClass('active'); 

      var foot = angular.element( document.querySelector( '#thefooter' ) );
      foot.toggleClass('active'); 
      
    }
    
  }

}());





(function () {
  'use strict';

  angular
    .module('users')
    .controller('EditProfileController', EditProfileController);

  EditProfileController.$inject = ['$scope', '$http', '$location', 'UsersService', 'Authentication', 'toaster'];

  function EditProfileController($scope, $http, $location, UsersService, Authentication, toaster) {
    var vm = this;

    vm.user = Authentication.user;
    vm.updateUserProfile = updateUserProfile;

    // Update a user profile
    function updateUserProfile(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = new UsersService(vm.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.userForm');

        toaster.pop('success',"Success","Edit profile successful!");
        Authentication.user = response;
      }, function (response) {
        toaster.pop('error',"Error","Edit profile failed!");
      });
    }
  }
}());

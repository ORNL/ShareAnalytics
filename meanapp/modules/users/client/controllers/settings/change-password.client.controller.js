


(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangePasswordController', ChangePasswordController);

  ChangePasswordController.$inject = ['$scope', '$http', 'Authentication', 'UsersService', 'PasswordValidator', 'toaster'];

  function ChangePasswordController($scope, $http, Authentication, UsersService, PasswordValidator, toaster) {
    var vm = this;

    vm.user = Authentication.user;
    vm.changeUserPassword = changeUserPassword;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;

    // Change user password
    function changeUserPassword(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.passwordForm');

        return false;
      }

      UsersService.changePassword(vm.passwordDetails)
        .then(onChangePasswordSuccess)
        .catch(onChangePasswordError);
    }

    function onChangePasswordSuccess(response) {
      // If successful show success message and clear form
      toaster.pop('success',"Success","Password Changed Successfully");
      vm.passwordDetails = null;
    }

    function onChangePasswordError(response) {
      toaster.pop('error',"Error","Password change failed!");
    }
  }
}());

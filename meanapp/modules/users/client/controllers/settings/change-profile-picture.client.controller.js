



(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangeProfilePictureController', ChangeProfilePictureController);

  ChangeProfilePictureController.$inject = ['$timeout', 'Authentication', 'Upload', 'toaster', 'UsersService'];

  function ChangeProfilePictureController($timeout, Authentication, Upload, toaster, UsersService) {
    var vm = this;
    
    vm.checkboxenabled = true;
    vm.user = Authentication.user;
    vm.progress = 0;

    vm.upload = function (dataUrl) {

      Upload.upload({
        url: '/api/users/picture',
        data: {
          newProfilePicture: dataUrl
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data);
        });
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      }, function (evt) {
        vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      });
    };

    //Function to update the user whenever the setting is altered
    vm.updateUserProfile = function(theuser) {

        vm.checkboxenabled = false;
        var user = new UsersService(theuser);

        user.$update(function (response) {      
          toaster.pop('success',"Success","Updated profile image preferences!");
          Authentication.user = response;
          vm.user = response;
          vm.checkboxenabled = true;
        }, function (response) {
          toaster.pop('error',"Error","Edit profile failed!");
        });
    }

    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(response) {
      // Show success message
      toaster.pop('success',"Success","Successfully changed profile picture");
      // Populate user object
      vm.user = Authentication.user = response;

      // Reset form
      vm.fileSelected = false;
      vm.progress = 0;
    }

    // Called after the user has failed to upload a new picture
    function onErrorItem(response) {
      vm.fileSelected = false;
      vm.progress = 0;

      // Show error message
      toaster.pop('error',"Error","Failed to change profile picture");
    }
  }
}());

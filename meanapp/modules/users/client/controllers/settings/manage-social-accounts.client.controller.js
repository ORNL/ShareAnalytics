(function () {
  'use strict';

  angular
    .module('users')
    .controller('SocialAccountsController', SocialAccountsController);

  SocialAccountsController.$inject = ['$state', '$window', 'UsersService', 'Authentication', 'toaster'];

  function SocialAccountsController($state, $window, UsersService, Authentication, toaster) {
    var vm = this;

    vm.user = Authentication.user;
    vm.hasConnectedAdditionalSocialAccounts = hasConnectedAdditionalSocialAccounts;
    vm.isConnectedSocialAccount = isConnectedSocialAccount;
    vm.removeUserSocialAccount = removeUserSocialAccount;
    vm.callOauthProvider = callOauthProvider;

    // Check if there are additional accounts
    function hasConnectedAdditionalSocialAccounts() {
      return (vm.user.additionalProvidersData && Object.keys(vm.user.additionalProvidersData).length);
    }

    // Check if provider is already in use with current user
    function isConnectedSocialAccount(provider) {
      return vm.user.provider === provider || (vm.user.additionalProvidersData && vm.user.additionalProvidersData[provider]);
    }

    // Remove a user social account
    function removeUserSocialAccount(provider) {

      UsersService.removeSocialAccount(provider)
        .then(onRemoveSocialAccountSuccess)
        .catch(onRemoveSocialAccountError);
    }

    function onRemoveSocialAccountSuccess(response) {
      // If successful show success message and clear form
      toaster.pop('success',"Success","Removed successfully!");
      vm.user = Authentication.user = response;
    }

    function onRemoveSocialAccountError(response) {
      toaster.pop('error',"Error","Remove failed!");
    }

    // OAuth provider request
    function callOauthProvider(url) {
      url += '?redirect_to=' + encodeURIComponent($state.$current.url.prefix);

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }
  }
}());

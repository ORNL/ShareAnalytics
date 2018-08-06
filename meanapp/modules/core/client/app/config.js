(function (window) {
  'use strict';

  var applicationModuleName = 'mean';

  var service = {
    applicationEnvironment: window.env,
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ngBreadCrumb', 'ui.bootstrap', 'ngFileUpload', 'chart.js','ngTable','toaster','ngFileSaver','btford.socket-io','angularModalService','ui.gravatar','ngSanitize','ui.sortable'],
    registerModule: registerModule
  };

  window.ApplicationConfiguration = service;

  // Add a new vertical module
  function registerModule(moduleName, dependencies) {
    
    // Create angular module and create socket service
    angular.module(moduleName, dependencies || []).
    factory('socket', function(socketFactory) {
      //Creating New Socket
      var socket = socketFactory();
      //Need to forward events so that they can be consumed by $scope
      //This avoids double registering listeners
      socket.forward('resultdone');
      return socket;
    });

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  }

}(window));

(function () {
  'use strict';

  // Configuring the Analytics Admin module
  angular
    .module('analytics')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', {
      title: 'Manage Analytics',
      state: 'analytics.list'
    });
  }
}());

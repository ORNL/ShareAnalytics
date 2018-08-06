(function () {
  'use strict';

  // Configuring the Dashboards Admin module
  angular
    .module('dashboards')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', {
      title: 'Manage Dashboards',
      state: 'dashboards.list'
    });
  }
}());

(function () {
  'use strict';

  // Configuring the Locations Admin module
  angular
    .module('locations')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', {
      title: 'Manage Locations',
      state: 'locations.list'
    });
  }
}());

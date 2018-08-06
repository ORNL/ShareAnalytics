(function () {
  'use strict';

  angular
    .module('locations')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Locations',
      state: 'locations',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'locations', {
      title: 'List Locations',
      state: 'locations.list',
      roles: ['*']
    });
  }
}());

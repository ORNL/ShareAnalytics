(function () {
  'use strict';

  angular
    .module('dashboards')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Dashboards',
      state: 'dashboards',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'dashboards', {
      title: 'List Dashboards',
      state: 'dashboards.list',
      roles: ['*']
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('analytics')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Analytics',
      state: 'analytics',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'analytics', {
      title: 'List Analytics',
      state: 'analytics.list',
      roles: ['*']
    });
  }
}());

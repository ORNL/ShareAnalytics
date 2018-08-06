(function () {
  'use strict';

  angular
    .module('datasets')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Datasets',
      state: 'datasets',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'datasets', {
      title: 'List Datasets',
      state: 'datasets.list',
      roles: ['*']
    });
  }
}());

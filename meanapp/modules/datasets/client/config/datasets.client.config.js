(function () {
  'use strict';

  // Configuring the Datasets Admin module
  angular
    .module('datasets')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', {
      title: 'Manage Datasets',
      state: 'datasets.list'
    });
  }
}());

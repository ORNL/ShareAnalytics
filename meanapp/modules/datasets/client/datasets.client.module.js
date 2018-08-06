(function (app) {
  'use strict';

  app.registerModule('datasets', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('datasets.admin', ['core.admin']);
  app.registerModule('datasets.admin.routes', ['core.admin.routes']);
  app.registerModule('datasets.services');
  app.registerModule('datasets.routes', ['ui.router', 'core.routes', 'datasets.services']);
}(ApplicationConfiguration));

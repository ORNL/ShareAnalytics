(function (app) {
  'use strict';

  app.registerModule('dashboards', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('dashboards.admin', ['core.admin']);
  app.registerModule('dashboards.admin.routes', ['core.admin.routes']);
  app.registerModule('dashboards.services');
  app.registerModule('dashboards.routes', ['ui.router', 'core.routes', 'dashboards.services']);
}(ApplicationConfiguration));

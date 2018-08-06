(function (app) {
  'use strict';

  app.registerModule('results', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('results.admin', ['core.admin']);
  app.registerModule('results.admin.routes', ['core.admin.routes']);
  app.registerModule('results.services');
  app.registerModule('results.routes', ['ui.router', 'core.routes', 'results.services']);
}(ApplicationConfiguration));

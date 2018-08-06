(function (app) {
  'use strict';

  app.registerModule('analytics', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('analytics.admin', ['core.admin']);
  app.registerModule('analytics.admin.routes', ['core.admin.routes']);
  app.registerModule('analytics.services');
  app.registerModule('analytics.routes', ['ui.router', 'core.routes', 'analytics.services']);
}(ApplicationConfiguration));

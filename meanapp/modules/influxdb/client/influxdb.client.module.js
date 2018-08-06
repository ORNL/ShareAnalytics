(function (app) {
  'use strict';

  app.registerModule('influxdb', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('influxdb.admin', ['core.admin']);
  app.registerModule('influxdb.admin.routes', ['core.admin.routes']);
  app.registerModule('influxdb.routes', ['ui.router', 'core.routes']);
}(ApplicationConfiguration));

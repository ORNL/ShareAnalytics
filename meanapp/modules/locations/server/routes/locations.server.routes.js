'use strict';

/**
 * Module dependencies
 */
var locationsPolicy = require('../policies/locations.server.policy'),
  locations = require('../controllers/locations.server.controller');

module.exports = function (app) {
  // Locations collection routes
  app.route('/api/locations').all(locationsPolicy.isAllowed)
    .get(locations.list)
    .post(locations.create);

  app.route('/api/locations/textsearch').all(locationsPolicy.isAllowed)
    .post(locations.textsearch);

  // Single location routes
  app.route('/api/locations/:locationId').all(locationsPolicy.isAllowed)
    .get(locations.read)
    .put(locations.update)
    .delete(locations.delete);

  // Finish by binding the location middleware
  app.param('locationId', locations.locationByID);
};

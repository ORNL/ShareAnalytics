'use strict';

/**
 * Module dependencies
 */
var influxdbPolicy = require('../policies/influxdb.server.policy'),
  influxdb = require('../controllers/influxdb.server.controller');

module.exports = function (app) {

  //Upload an analytic
  app.route('/api/influxdb').all(influxdbPolicy.isAllowed)
    .post(influxdb.retrievedata);

};

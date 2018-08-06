'use strict';

/**
 * Module dependencies
 */
var datasetsPolicy = require('../policies/datasets.server.policy'),
  datasets = require('../controllers/datasets.server.controller');

module.exports = function (app) {
  // Datasets collection routes
  app.route('/api/datasets').all(datasetsPolicy.isAllowed)
    .get(datasets.list)
    .post(datasets.create);

  app.route('/api/datasets/textsearch').all(datasetsPolicy.isAllowed)
    .post(datasets.textsearch);

  // Single dataset routes
  app.route('/api/datasets/:datasetId').all(datasetsPolicy.isAllowed)
    .get(datasets.read)
    .put(datasets.update)
    .delete(datasets.delete);

  // Finish by binding the dataset middleware
  app.param('datasetId', datasets.datasetByID);
};

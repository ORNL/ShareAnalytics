'use strict';

/**
 * Module dependencies
 */
var resultsPolicy = require('../policies/results.server.policy'),
  results = require('../controllers/results.server.controller');

module.exports = function (app) {
  // Results collection routes
  app.route('/api/results').all(resultsPolicy.isAllowed)
    .get(results.list) //get with Array:True
    .post(results.create); //save

  app.route('/api/postresult').all(resultsPolicy.isAllowed)
    .post(results.createfromslurm);

  // Single result routes
  app.route('/api/results/:resultId').all(resultsPolicy.isAllowed)
    .get(results.read)
    .put(results.update)
    .delete(results.delete);

  // Finish by binding the result middleware
  app.param('resultId', results.resultByID);
};

'use strict';

/**
 * Module dependencies
 */
var slurmPolicy = require('../policies/slurm.server.policy'),
  slurm = require('../controllers/slurm.server.controller');

module.exports = function (app) {

  //Submit slurm job
  app.route('/api/slurm').all(slurmPolicy.isAllowed)
    .post(slurm.submitjob);

};

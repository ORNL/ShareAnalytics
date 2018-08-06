'use strict';

/*
https://stackoverflow.com/questions/44580668/node-js-backend-calling-a-python-function
*/

/**
 * Module dependencies
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

  var http = require('http');  

/**
 * Send job to swarm with path to the dataset
 */
exports.submitjob = function (req, res) {
  
  var options = {
    hostname: 'head',
    port: 5000,
    path: '/submitjob',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
  };

  var request = http.request(options, function(res) {
    console.log('Status: ' + res.statusCode);
    console.log('Headers: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (body) {
      console.log('Body: ' + body);
    });
  });

  request.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  var data = {
    'title':req.body.title,
    'dataset':req.body.dataset,
    'analytic':req.body.analytic,
    'dashboard':req.body.dashboard,
    'datasetpath':req.body.datasetpath,
    'analyticpath':req.body.analyticpath,
    'user':req.user.id,
    'description':req.body.description,
    'analytictype':req.body.analytictype
  }
  
  // write data to request body
  request.write(JSON.stringify(data));
  request.end();

  res.status(200).send('Analysis sent to slurm');
  
};

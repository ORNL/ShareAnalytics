'use strict';

/**
 * Module dependencies
 */
var filehandlerPolicy = require('../policies/filehandler.server.policy'),
  filehandler = require('../controllers/filehandler.server.controller');

module.exports = function (app) {

  //Upload an analytic
  app.route('/api/uploadanalytic').all(filehandlerPolicy.isAllowed)
    .post(filehandler.uploadanalytic);

  app.route('/api/uploaddataset').all(filehandlerPolicy.isAllowed)
    .post(filehandler.uploaddataset);

  app.route('/api/uploaddashboardimage').all(filehandlerPolicy.isAllowed)
    .post(filehandler.uploaddashboardimage);

  app.route('/api/getimage').all(filehandlerPolicy.isAllowed)
    .post(filehandler.getimage);

  app.route('/api/getdashboardimage').all(filehandlerPolicy.isAllowed)
    .post(filehandler.getdashboardimage);

  app.route('/api/availableanalytics').all(filehandlerPolicy.isAllowed)
    .get(filehandler.availableanalytics);

  app.route('/api/availabledatasets').all(filehandlerPolicy.isAllowed)
    .get(filehandler.availabledatasets);

  app.route('/api/downloadzip').all(filehandlerPolicy.isAllowed)
    .post(filehandler.downloadfilesaszip);

  app.route('/api/downloadfileaszip').all(filehandlerPolicy.isAllowed)
    .post(filehandler.downloadfileaszip);

  app.route('/api/downloadanalyticaszip').all(filehandlerPolicy.isAllowed)
    .post(filehandler.downloadanalyticaszip);
  
  app.route('/api/downloaddatasetaszip').all(filehandlerPolicy.isAllowed)
    .post(filehandler.downloaddatasetaszip);

  app.route('/api/deletedatasetfile').all(filehandlerPolicy.isAllowed)
    .post(filehandler.deletedatasetfile);

};

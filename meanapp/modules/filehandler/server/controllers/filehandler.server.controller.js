'use strict';

/*
https://stackoverflow.com/questions/44580668/node-js-backend-calling-a-python-function
*/

//Using HTTP Error 406 because handler returns page not found with 404
//core.client.routes.js

/**
 * Module dependencies
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var multer = require('multer');
var fs = require('fs');
var archiver = require('archiver');
var mongoose = require('mongoose');
var Dataset = mongoose.model('Dataset');

/**
 * Upload an analytic to the appropriate directory
 */
exports.uploadanalytic = function (req, res) {

  var uploadanltc = multer({dest:req.app.locals.analyticfolderpath}).any(); 

  uploadanltc(req, res, function(err) {
      if (err) throw err;
      
      var analyticDirectory = req.app.locals.analyticfolderpath + req.body.uuid + "/"; 
      var dir = req.app.locals.analyticfolderpath + req.body.uuid;
      
      if (!fs.existsSync(dir)){        
        fs.mkdirSync(dir);   
      }

      //Move file to appropriate folder
      fs.rename(req.app.locals.analyticfolderpath + req.files[0].filename, analyticDirectory + req.files[0].originalname)      
  });

  res.status(200).json(null);

};

/**
 * Upload a dataset to the appropriate directory
 */
exports.uploaddataset = function (req, res) {

    var uploaddatset = multer({dest:req.app.locals.datasetfolderpath}).any();  
  
    uploaddatset(req, res, function(err) {
        if (err) throw err;

        var datasetDirectory = req.app.locals.datasetfolderpath + req.body.uuid + "/"; 
        var dir = req.app.locals.datasetfolderpath + req.body.uuid;
        
        if (!fs.existsSync(dir)){        
          fs.mkdirSync(dir);   
        }

        //Move file to appropriate folder
        fs.rename(req.app.locals.datasetfolderpath + req.files[0].filename, datasetDirectory + req.files[0].originalname)
    });
  
    res.status(200).json(null);
};

/**
 * Upload a dashboard to the appropriate directory
 */
exports.uploaddashboardimage = function (req, res) {
  
      var uploadimage = multer({dest:req.app.locals.dashboardfolderpath}).any();      
    
      uploadimage(req, res, function(err) {
          if (err) throw err;
  
          var imageDirectory = req.app.locals.dashboardfolderpath + req.body.uuid + "/"; 
          var dir = req.app.locals.dashboardfolderpath + req.body.uuid;
          
          if (!fs.existsSync(dir)){ 
            fs.mkdirSync(dir);   
          }
  
          //Move file to appropriate folder
          fs.rename(req.app.locals.dashboardfolderpath + req.files[0].filename, imageDirectory + req.files[0].originalname)
      });
    
      res.status(200).json(null);
};

exports.availableanalytics = function(req,res) {
  
  var analyticDirectory = req.app.locals.analyticfolderpath;     
  fs.readdir(analyticDirectory, (err, files) => {
    res.status(200).json({'analytics' : JSON.stringify(files)});    
  })  

};

exports.availabledatasets = function(req,res) {
  
  var datasetDirectory = req.app.locals.datasetfolderpath;       
  fs.readdir(datasetDirectory, (err, files) => {
    res.status(200).json({'datasets' : JSON.stringify(files)});    
  })  

};

exports.deletedatasetfile = function(req,res) {
  var datasetDirectory = req.app.locals.datasetfolderpath;  
  var filepath = datasetDirectory + req.body.path.split('/')[0] + "/" + req.body.filename;
  fs.unlinkSync(filepath,function(err){
    if(err) res.status(406);
  });

  Dataset.findById(req.body.mongoid, function (err, dataset) { 
      if(err) res.status(406);
      console.log("I  AM  HEREEEEEEEEEE\n");
      var files = dataset.files.split(',');
      dataset.files = "";
      files.forEach(function(filename) {
        if(filename != req.body.filename) {
          dataset.files += filename + ",";
        }
      });
      dataset.files = dataset.files.slice(0,-1);
      console.log(dataset.files + "\n");
      dataset.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          console.log("foo");
          res.json(dataset);
        }
      });
  });
}

exports.getimage = function(req,res) {
  fs.exists(req.body.file, (exists) => {
    if (exists){
      res.download(req.body.file, function(err){
        if(err){
            console.log('error');
        }
      })
    } else {
      res.status(406); //not found
    }
  })
};

exports.getdashboardimage = function(req,res) {

  if(req.body.file != '') {
    req.body.file = req.app.locals.dashboardfolderpath + req.body.file;
    
    fs.exists(req.body.file, (exists) => {
      if (exists){
        res.download(req.body.file, function(err){
          if(err){
              console.log('error loading image');
          }
        });
      } else {
        res.status(406); //not found
      }
    });
  }

};

//Download single file as zip
exports.downloadfileaszip = function(req,res) {
  
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', 'attachment; ' + req.body.name + '.zip');

  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // pipe archive data to the response object
  archive.pipe(res);

  // good practice to catch this error explicitly
  archive.on('error', function(err) {
    //throw err;
    res.status(406).end(); //not found    
  });

  var filename = req.body.filename;

  if(req.body.type == "dataset") {
    var datasetDirectory = req.app.locals.datasetfolderpath;   
    var namearr = filename.split('/');    
    if(!fs.existsSync(datasetDirectory + filename)) {
      res.status(406).end();
    }  
    archive.append(fs.createReadStream(datasetDirectory + filename), { name: namearr[namearr.length - 1] });
  } else {
    if(!fs.existsSync(filename)) {
      res.status(406).end();
    }  
    archive.append(fs.createReadStream(filename), { name: req.body.name });    
  }
  
  archive.finalize();

};

//Download analytic files as zip
//Using HTTP Error 406 because handler returns page not found with 404
exports.downloadanalyticaszip = function(req,res) {
  
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', 'attachment; ' + req.body.name + '.zip');

  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // good practice to catch this error explicitly
  archive.on('error', function(err) {
    //throw err;
    res.status(406).end(); //not found    
  });

  // pipe archive data to the response object
  archive.pipe(res);

  var filename = req.body.filename;

  var analyticDirectory = req.app.locals.analyticfolderpath;   
  var namearr = filename.split('/');
  if(!fs.existsSync(analyticDirectory + filename)) {
    res.status(406).end(); //not found    
  }  
  archive.append(fs.createReadStream(analyticDirectory + filename), { name: namearr[namearr.length - 1] });

  if(req.body.supportingfiles != "") {
    var files = req.body.supportingfiles.split(',');
    
    var foldername = analyticDirectory + req.body.filename.split('/')[0] + "/";

    for (var i = 0, len = files.length; i < len; i++) {
      if(files[i] != "")
      {
        var namearr = files[i].split('/');
        if(!fs.existsSync(foldername + files[i])) {
          res.status(406).end(); //not found    
        } 
        archive.append(fs.createReadStream(foldername + files[i]), { name: namearr[namearr.length - 1] });
      }
    }
  }
  
  archive.finalize();

};

//Download dataset files as zip
//Using HTTP Error 406 because handler returns page not found with 404
exports.downloaddatasetaszip = function(req,res) {
  
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', 'attachment; ' + req.body.name + '.zip');

  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // good practice to catch this error explicitly
  archive.on('error', function(err) {
    //throw err;
    res.status(406).end(); //not found    
  });

  // pipe archive data to the response object
  archive.pipe(res);

  if(req.body.files != "" && req.body.files != null) {
    var datasetDirectory = req.app.locals.datasetfolderpath;   

    var files = req.body.files.split(',');
    
    var foldername = datasetDirectory + req.body.path.split('/')[0] + "/";

    for (var i = 0, len = files.length; i < len; i++) {
      if(files[i] != "")
      {
        var namearr = files[i].split('/');
        if(!fs.existsSync(foldername + files[i])) {
          res.status(406).end(); //not found    
        } 
        archive.append(fs.createReadStream(foldername + files[i]), { name: namearr[namearr.length - 1] });
      }
    }
  }
  
  archive.finalize();

};

exports.downloadfilesaszip = function(req,res) {
  
  //var output = fs.createWriteStream('/tmp/analytics/example.zip');

  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', 'attachment; ' + req.body.name + '.zip');

  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // pipe archive data to the response object
  archive.pipe(res);

  var files = req.body.filepaths.split(',');

  for (var i = 0, len = files.length; i < len; i++) {
    var namearr = files[i].split('/');
    archive.append(fs.createReadStream(files[i]), { name: namearr[namearr.length - 1] });
  }
  
  archive.finalize();

};

'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Dataset = mongoose.model('Dataset'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  utility = require(path.resolve('./modules/core/server/controllers/utility.server.controller')),    
  fs = require('fs');    

/**
 * Create an dataset
 */
exports.create = function (req, res) {
  var dataset = new Dataset(req.body);
  dataset.user = req.user;

  //Sanitizing markdown input
  req.body.samplecode = req.sanitize(req.body.samplecode);

  dataset.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(dataset);
    }
  });
};

/**
 * Show the current dataset
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var dataset = req.dataset ? req.dataset.toJSON() : {};

  // Add a custom field to the Dataset, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Dataset model.
  dataset.isCurrentUserOwner = !!(req.user && dataset.user && dataset.user._id.toString() === req.user._id.toString());

  res.json(dataset);
};

/**
 * Update an dataset
 */
exports.update = function (req, res) {
  var dataset = req.dataset;

  var rootdir = req.app.locals.datasetfolderpath;  
  var srcdir = rootdir + dataset.path.split("/")[0];
  var destdir = rootdir + req.body.path.split("/")[0];

  //create dest directory if not exist
  if (!fs.existsSync(destdir)){        
    fs.mkdirSync(destdir);   
  }

  //If not updated needs to be moved to new folder
  var filearray = req.body.files.split(",");
  for(var i = 0; i<filearray.length; i++) {
    if(filearray[i] != "") {
        if (!fs.existsSync(destdir + "/" + filearray[i])){         
          fs.rename(srcdir + "/" + filearray[i], destdir + "/" + filearray[i]);  
        }   
    }
  }

  //if not updated needs to be moved to new folder
  if (!fs.existsSync(rootdir + req.body.path)){         
    fs.rename(rootdir + dataset.path, rootdir + req.body.path);  
  }  

  //delete old folder - uuid is updated on update
  utility.deleteFolder(srcdir);     

  dataset.title = req.body.title;
  dataset.path = req.body.path;
  dataset.description = req.body.description;
  dataset.allowDownload = req.body.allowDownload;
  dataset.collected = req.body.collected;
  dataset.validthru = req.body.validthru;
  dataset.license = req.body.license;
  dataset.extensible = req.body.extensible;
  dataset.size = req.body.size;
  dataset.numrows = req.body.numrows;
  dataset.sizeunits = req.body.sizeunits;
  dataset.samplecode = req.sanitize(req.body.samplecode);
  dataset.dataformat = req.sanitize(req.body.dataformat);

  dataset.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(dataset);
    }
  });
};

/**
 * Delete an dataset
 */
exports.delete = function (req, res) {
  var dataset = req.dataset;

   //delete folder
   utility.deleteFolder(req.app.locals.datasetfolderpath + dataset.path.split("/")[0]);   

  dataset.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(dataset);
    }
  });
};

function cleanDataset(datasets,req) {
  //Even though it was already a javascript Object, it did not want to play nice, so I forced into JSON format
  //You must convert to string first - you cannot call parse on an object
  var dataset = JSON.parse(JSON.stringify(datasets));
  for(var i = 0; i < dataset.length; i++)
  {
    dataset[i]["isCurrentUserOwner"] = !!(req.user && dataset[i].user && dataset[i].user._id.toString() === req.user._id.toString());        
    if(dataset[i].user == null) {
      dataset[i].displayName = 'Deleted User';
    } else {
      dataset[i].displayName = dataset[i].user.displayName; 
    }
  }

  return dataset;
}

/**
 * List of Datasets
 */
exports.list = function (req, res) {
  Dataset.find().sort('-created').populate('user', 'displayName').exec(function (err, datasets) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(cleanDataset(datasets,req));
    }
  });
};

/**
 * Text Search
 * Indexed fields can be viewed in datasets.server.model.js - all fields indexed as 'text' searched
 */
exports.textsearch = function(req,res) {
  
    //if search value empty or null return all results
    if(req.body.searchval == "" || req.body.searchval == null) {
      Dataset.find().lean().sort('-created').populate('user', 'displayName').exec(function (err, datasets) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(cleanDataset(datasets,req));        
        }
      });
    } else {
  
      //find results relevant to search term
      Dataset.find({$text: {$search: req.body.searchval}},{score:{$meta:"textScore"}})
        .lean()
        .populate('user', 'displayName')
        .sort({score: {$meta:'textScore'}}) //sort by relevance to search term
        .exec(function(err, datasets) { 
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.json(cleanDataset(datasets,req));        
          }
        });
        
    }
  
  };

/**
 * Dataset middleware
 */
exports.datasetByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Dataset is invalid'
    });
  }

  Dataset.findById(id).populate('user', 'displayName').exec(function (err, dataset) {
    if (err) {
      return next(err);
    } else if (!dataset) {
      return res.status(404).send({
        message: 'No dataset with that identifier has been found'
      });
    }
    req.dataset = dataset;
    next();
  });
};

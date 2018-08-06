'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Analytic = mongoose.model('Analytic'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  utility = require(path.resolve('./modules/core/server/controllers/utility.server.controller')),  
  fs = require('fs');

/**
 * Create an analytic
 */
exports.create = function (req, res) {
  var analytic = new Analytic(req.body);
  analytic.user = req.user;
  analytic.description = req.sanitize(analytic.description);

  analytic.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(analytic);
    }
  });
};

/**
 * Show the current analytic
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var analytic = req.analytic ? req.analytic.toJSON() : {};

  // Add a custom field to the Analytic, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Analytic model.
  analytic.isCurrentUserOwner = !!(req.user && analytic.user && analytic.user._id.toString() === req.user._id.toString());

  res.json(analytic);
};

/**
 * Update an analytic
 */
exports.update = function (req, res) {
  var analytic = req.analytic;

  var rootdir = req.app.locals.analyticfolderpath;  
  var srcdir = rootdir + analytic.name.split("/")[0];
  var destdir = rootdir + req.body.name.split("/")[0];

  //create dest directory if not exist
  if (!fs.existsSync(destdir)){        
    fs.mkdirSync(destdir);   
  }

  //If not updated needs to be moved to new folder
  var supfilearray = req.body.supportingfiles.split(",");
  for(var i = 0; i<supfilearray.length; i++) {
    if(supfilearray[i] != "") {
        if (!fs.existsSync(destdir + "/" + supfilearray[i])){         
          fs.rename(srcdir + "/" + supfilearray[i], destdir + "/" + supfilearray[i]);  
        }   
    }
  }

  //if not updated needs to be moved to new folder
  if (!fs.existsSync(rootdir + req.body.name)){         
    fs.rename(rootdir + analytic.name, rootdir + req.body.name);  
  }  

  //delete old folder - uuid is updated on update
  utility.deleteFolder(srcdir);   

  analytic.title = req.body.title;
  analytic.name = req.body.name;
  analytic.description = req.body.description;
  analytic.supportingfiles = req.body.supportingfiles;  
  analytic.allowDownload = req.body.allowDownload;
  analytic.type = req.body.type;
  analytic.samplecode = req.body.samplecode;
  analytic.resultformat = req.body.resultformat;
  analytic.inputformat = req.body.inputformat;

  analytic.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(analytic);
    }
  });
};

/**
 * Delete an analytic
 */
exports.delete = function (req, res) {
  var analytic = req.analytic;

  //delete folder containing analytic files
  utility.deleteFolder(req.app.locals.analyticfolderpath + analytic.name.split("/")[0]);   

  analytic.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(analytic);
    }
  });
};

/**
 * List of Analytics
 */
exports.list = function (req, res) {
  Analytic.find().lean().sort('-created').populate('user', 'displayName').exec(function (err, analytics) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(cleanAnalytic(analytics,req));
    }
  });
};

function cleanAnalytic(analytics,req) {
      //Even though it was already a javascript Object, it did not want to play nice, so I forced into JSON format
      //You must convert to string first - you cannot call parse on an object
      var analytic = JSON.parse(JSON.stringify(analytics));
      for(var i = 0; i < analytic.length; i++)
      {
        analytic[i]["isCurrentUserOwner"] = !!(req.user && analytic[i].user && analytic[i].user._id.toString() === req.user._id.toString());        
        if(analytic[i].user == null) {
          analytic[i].displayName = 'Deleted User';
        } else {
          analytic[i].displayName = analytic[i].user.displayName; 
        }
      }

      return analytic;
}

/**
 * Text Search
 * Indexed fields can be viewed in analytics.server.model.js - all fields indexed as 'text' searched
 */
exports.textsearch = function(req,res) {

  //if search value empty or null return all results
  if(req.body.searchval == "" || req.body.searchval == null) {
    Analytic.find().lean().sort('-created').populate('user', 'displayName').exec(function (err, analytics) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(cleanAnalytic(analytics,req));        
      }
    });
  } else {

    //find results relevant to search term
    Analytic.find({$text: {$search: req.body.searchval}},{score:{$meta:"textScore"}})
      .lean()
      .populate('user', 'displayName')
      .sort({score: {$meta:'textScore'}}) //sort by relevance to search term
      .exec(function(err, analytics) { 
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(cleanAnalytic(analytics,req));        
        }
      });
      
  }

};

/**
 * Analytic middleware
 */
exports.analyticByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Analytic is invalid'
    });
  }

  Analytic.findById(id).populate('user', 'displayName').exec(function (err, analytic) {
    if (err) {
      return next(err);
    } else if (!analytic) {
      return res.status(404).send({
        message: 'No analytic with that identifier has been found'
      });
    }
    req.analytic = analytic;
    next();
  });
};

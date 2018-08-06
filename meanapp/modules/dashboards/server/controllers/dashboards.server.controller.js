'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Result = mongoose.model('Result'), //Need Result model to fetch all relevant results     
  Dashboard = mongoose.model('Dashboard'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  utility = require(path.resolve('./modules/core/server/controllers/utility.server.controller')),    
  fs = require('fs');    

/**
 * Create an dashboard
 */
exports.create = function (req, res) {
  var dashboard = new Dashboard(req.body);
  dashboard.user = req.user;

  dashboard.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(dashboard);
    }
  });
};

/**
 * Show the current dashboard
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var dashboard = req.dashboard ? req.dashboard : {};

  // Add a custom field to the Dashboard, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Dashboard model.
  dashboard.isCurrentUserOwner = !!(req.user && dashboard.user && dashboard.user._id.toString() === req.user._id.toString());

  res.json(dashboard);
};

/**
 * Update an dashboard
 */
exports.update = function (req, res) {
  var dashboard = req.dashboard;  

  var rootdir = req.app.locals.dashboardfolderpath;  
  var srcdir = rootdir + dashboard.path.split("/")[0];
  var destdir = rootdir + req.body.path.split("/")[0];

  //if not updated needs to be moved to new folder
  if (!fs.existsSync(rootdir + req.body.path)){         
    fs.rename(rootdir + dashboard.path, rootdir + req.body.path);  
  }  

  //delete old folder - uuid is updated on update
  utility.deleteFolder(srcdir);     

  var dashImageLength = req.body.dashboardImageURL.split("/").length;
  var mapImageLength = req.body.mapImageURL.split("/").length;

  dashboard.title = req.body.title;
  dashboard.path = req.body.path;
  dashboard.description = req.body.description;
  dashboard.allowDownload = req.body.allowDownload;
  dashboard.usealternatemapimage = req.body.usealternatemapimage;
  dashboard.dashboardImageURL = req.body.path.split("/")[0] + "/" + req.body.dashboardImageURL.split("/")[dashImageLength-1];
  dashboard.mapImageURL = req.body.path.split("/")[0] + "/" + req.body.mapImageURL.split("/")[mapImageLength-1];
  dashboard.loc = req.body.loc;

  dashboard.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(dashboard);
    }
  });
};

/**
 * Delete an dashboard
 */
exports.delete = function (req, res) {
  var dashboard = req.dashboard;

  //delete folder containing dashboard data
  utility.deleteFolder(req.app.locals.dashboardfolderpath + dashboard.path.split("/")[0]);  
  
  dashboard.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(dashboard);
    }
  });
};

function cleanDashboard(dashboards,req) {
  //Even though it was already a javascript Object, it did not want to play nice, so I forced into JSON format
  //You must convert to string first - you cannot call parse on an object
  var dashboard = JSON.parse(JSON.stringify(dashboards));
  for(var i = 0; i < dashboard.length; i++)
  {
    dashboard[i].isCurrentUserOwner = !!(req.user && dashboard[i].user && dashboard[i].user._id.toString() === req.user._id.toString());        
    if(dashboard[i].user == null) {
      dashboard[i].displayName = 'Deleted User';
    } else {
      dashboard[i].displayName = dashboard[i].user.displayName; 
    }
  }

  return dashboard;
}

/**
 * List of Dashboards
 */
exports.list = function (req, res) {
  Dashboard.find().sort('-created').populate('user', 'displayName').populate('loctype').exec(function (err, dashboards) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(cleanDashboard(dashboards,req));
    }
  });
};

/**
 * Text Search
 * Indexed fields can be viewed in dashboards.server.model.js - all fields indexed as 'text' searched
 */
exports.textsearch = function(req,res) {
  
    //if search value empty or null return all results
    if(req.body.searchval == "" || req.body.searchval == null) {
      Dashboard.find().lean().sort('-created').populate('user', 'displayName').populate('loctype').exec(function (err, dashboards) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(cleanDashboard(dashboards,req));        
        }
      });
    } else {
  
      //find results relevant to search term
      Dashboard.find({$text: {$search: req.body.searchval}},{score:{$meta:"textScore"}})
        .lean()
        .populate('user', 'displayName')
        .sort({score: {$meta:'textScore'}}) //sort by relevance to search term
        .exec(function(err, dashboards) { 
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.json(cleanDashboard(dashboards,req));        
          }
        });
        
    }
  
  };

  function includes(array,val) {
    var match = false;
    for(var i = 0; i < array.length; i++) {
      if(array[i].equals(val)) {
        match = true;
        break;
      }
    }

    return match;
  }

/**
 * Dashboard middleware
 */
exports.dashboardByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Dashboard is invalid'
    });
  }

  Dashboard.findById(id).populate('user', 'displayName').populate('loctype').exec(function (err, dashboard) {
    if (err) {
      return next(err);
    } else if (!dashboard) {
      return res.status(404).send({
        message: 'No dashboard with that identifier has been found'
      });
    }

    //This middleware is injected as callback function and run any time dashboard is searched for by ID - app.param(model,callback)
    //Grab all most recent results tagged for dashboard with this id here
    //Find all results linked to this dashboard - then sort by finish time in descending order
    Result.find({ "dashboard":id }).sort('-finish').populate('analytic').exec( 
      function(err,docs) {
        var mostrecentdocs = {};
        docs = JSON.parse(JSON.stringify(docs)); //without this conversion was not persistent new keys on docs object

        //Pick the most recent of each analytic for the purpose of reporting on the dashboard
        for(var i = 0; i < docs.length; i++) {
            if(!(docs[i].analytic in mostrecentdocs)) {
              mostrecentdocs[docs[i].analytic] = docs[i];
              mostrecentdocs[docs[i].analytic].scores = [docs[i].score];
            } else {
              mostrecentdocs[docs[i].analytic].scores.push(docs[i].score);              
            }
        }

        var values = Object.keys(mostrecentdocs).map(function(key){
          return mostrecentdocs[key];
        });

        dashboard.results = values;
        req.dashboard = dashboard; 
        next();
      }
    );
  });
};

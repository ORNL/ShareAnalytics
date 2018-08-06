'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Location = mongoose.model('Location'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  utility = require(path.resolve('./modules/core/server/controllers/utility.server.controller')),    
  fs = require('fs');    

/**
 * Create an location
 */
exports.create = function (req, res) {
  var location = new Location(req.body);
  location.user = req.user;

  location.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(location);
    }
  });
};

/**
 * Show the current location
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var location = req.location ? req.location.toJSON() : {};

  // Add a custom field to the Location, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Location model.
  location.isCurrentUserOwner = !!(req.user && location.user && location.user._id.toString() === req.user._id.toString());

  res.json(location);
};

/**
 * Update a location
 */
exports.update = function (req, res) {
  var location = req.location;  

  location.title = req.body.title;
  location.description = req.body.description;
  location.analytics = req.body.analytics;

  location.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(location);
    }
  });
};

/**
 * Delete an location
 */
exports.delete = function (req, res) {
  var location = req.location;

  location.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(location);
    }
  });
};

function cleanLocation(locations,req) {
  //Even though it was already a javascript Object, it did not want to play nice, so I forced into JSON format
  //You must convert to string first - you cannot call parse on an object
  var location = JSON.parse(JSON.stringify(locations));
  for(var i = 0; i < location.length; i++)
  {
    location[i]["isCurrentUserOwner"] = !!(req.user && location[i].user && location[i].user._id.toString() === req.user._id.toString());        
    if(location[i].user == null) {
      location[i].displayName = 'Deleted User';
    } else {
      location[i].displayName = location[i].user.displayName; 
    }
  }

  return location;
}

/**
 * List of Locations
 */
exports.list = function (req, res) {
  Location.find().sort('-created').populate('user', 'displayName').exec(function (err, locations) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(cleanLocation(locations,req));
    }
  });
};

/**
 * Text Search
 * Indexed fields can be viewed in locations.server.model.js - all fields indexed as 'text' searched
 */
exports.textsearch = function(req,res) {
  
    //if search value empty or null return all results
    if(req.body.searchval == "" || req.body.searchval == null) {
      Location.find().lean().sort('-created').populate('user', 'displayName').exec(function (err, locations) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(cleanLocation(locations,req));        
        }
      });
    } else {
  
      //find results relevant to search term
      Location.find({$text: {$search: req.body.searchval}},{score:{$meta:"textScore"}})
        .lean()
        .populate('user', 'displayName')
        .sort({score: {$meta:'textScore'}}) //sort by relevance to search term
        .exec(function(err, locations) { 
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.json(cleanLocation(locations,req));        
          }
        });
        
    }
  
  };

/**
 * Location middleware
 */
exports.locationByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Location is invalid'
    });
  }

  Location.findById(id).populate('user', 'displayName').exec(function (err, location) {
    if (err) {
      return next(err);
    } else if (!location) {
      return res.status(404).send({
        message: 'No location with that identifier has been found'
      });
    }
    req.location = location;
    next();
  });
};

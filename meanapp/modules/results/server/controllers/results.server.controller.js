'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Result = mongoose.model('Result'),
  Dashboard = mongoose.model('Dashboard'),  
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  utility = require(path.resolve('./modules/core/server/controllers/utility.server.controller')),      
  fs = require('fs');
  

/**
 * Create an result and notify the client that a result is ready
 */
exports.create = function (req, res) {
    var result = new Result(req.body);
    
    result.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
              
      res.json(result);
    }

  });
};

var updateScore = function(dashboardid, results) {
  Dashboard.find({ "_id": dashboardid }).populate('loctype').exec( 
    function(err,docs) {

              var mostrecentdocs = {};

              //Pick the most recent of each analytic for the purpose of reporting on the dashboard
              for(var i = 0; i < results.length; i++) {
                  if(!(results[i].analytic in mostrecentdocs)) {
                    mostrecentdocs[results[i].analytic] = results[i];
                  } 
              }

              var values = Object.keys(mostrecentdocs).map(function(key){
                return mostrecentdocs[key];
              });
      
              var score = 0;
              for(var c = 0; c < values.length; c++) {
                for(var count = 0; count < docs[0].loctype.analytics.length; count++) {
                  if(docs[0].loctype.analytics[count].id == values[c].analytic._id) {
                      score += values[c].score*(docs[0].loctype.analytics[count].percent/100);
                  }
                }
              }
              
              docs[0].currentScore = score;
              //add to list of historical scores
              docs[0].scorehistory.push(score);
              //Update dashboard in the database
              Dashboard.findOneAndUpdate({ "_id": docs[0]._id }, docs[0], {upsert:true}, function(err, doc){
                if (err) console.log('Error updating Dashboard');
                console.log('Dashboard successfully updated');
              });  
            }
          );
}

//Update Dashboard Scores
var updateDashboardScore = function(result) {
  Dashboard.find({ "_id": result.dashboard }).populate('loctype').exec( 
    function(err,docs) {
      for(var i = 0; i < docs.length; i++) {
        //Check to see if this result is relev
        if(docs[i].loctype.analytics.filter(function(e) { return e.id == result.analytic; }).length > 0) {
          //Calculate new dashboard score
          var promise = Result.find({ "dashboard": result.dashboard }).sort('-finish').populate('analytic');
          
          promise.then( function(results) {
            updateScore(result.dashboard,results);
          });  
          
        }
      }        
    });
};

exports.createfromslurm = function (req, res) {
  var result = new Result(req.body);
  var socketio = req.app.get('socketio'); 
  
  if(result.dashboard != undefined) {
    updateDashboardScore(result);
  } else {
    result.dashboard = null;
  }

  result.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

    //Notify connected sockets that result is done and ready for viewing
    socketio.sockets.emit('resultdone', req.body.title);
            
    res.json(result);
  }

});
};

/**
 * Show the current result
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var result = req.result ? req.result.toJSON() : {};

  // Add a custom field to the Result, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Result model.
  result.isCurrentUserOwner = !!(req.user && result.user && result.user._id.toString() === req.user._id.toString());

  res.json(result);
};

/**
 * Update an result
 */
exports.update = function (req, res) {
  var result = req.result;

  result.title = req.body.title;
  result.description = req.body.description;
  result.analytic = req.body.analytic;
  result.dashboard = req.body.dashboard;
  result.dataset = req.body.dataset;
  result.start = req.body.start;
  result.finish = req.body.finish;
  result.uuid = req.body.uuid;
  result.score = req.body.score;

  result.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(result);
    }
  });
};

/**
 * Delete an result
 */
exports.delete = function (req, res) {
  var result = req.result;
  
  //delete folder containing results
  utility.deleteFolder(req.app.locals.resultfolderpath + req.result.uuid);

  result.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(result);
    }
  });
};

/**
 * List of Results belonging only that the user making the request
 */
exports.listforuser = function (req, res) {
  Result.find({'user':req.user.id}).sort('-created').populate('user', 'displayName').populate('analytic').populate('dataset').populate('dashboard').exec(function (err, results) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(results);
    }
  });
};

/**
 * List of Results belonging to all users
 */
exports.list = function (req, res) {
  Result.find().sort('-created').populate('user', 'displayName').populate('analytic').populate('dataset').populate('dashboard').exec(function (err, results) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

       /**
       * Need to add parameter to indicate if the current user owns this result or not
       */

      //Even though it was already a javascript Object, it did not want to play nice, so I forced into JSON format
      //You must convert to string first - you cannot call parse on an object
      var result = JSON.parse(JSON.stringify(results));
      for(var i = 0; i < result.length; i++)
      {
        result[i]["isCurrentUserOwner"] = !!(req.user && result[i].user && result[i].user._id.toString() === req.user._id.toString());        
      }

      res.json(result);
    }
  });
};

/**
 * Result middleware
 */
exports.resultByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Result is invalid'
    });
  }

  Result.findById(id).populate('user', 'displayName').populate('analytic').populate('dataset').populate('dashboard').exec(function (err, result) {
    if (err) {
      return next(err);
    } else if (!result) {
      return res.status(404).send({
        message: 'No result with that identifier has been found'
      });
    }
    req.result = result;
    next();
  });
};

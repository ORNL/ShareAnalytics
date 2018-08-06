'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

/**
 * Dashboard Schema
 */
var DashboardSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank',
    index: true
  },
  description: {
    type: String,
    default: '',
    trim: true,
    required: 'Description cannot be blank',
    index: true
  },
  dashboardImageURL: {
    type: String,
    default: ''
  },
  mapImageURL: {
    type: String,
    default: ''
  },
  usealternatemapimage: {
    type: Boolean,
    default: false
  },
  locname: {
    type: String,
    default: '',
    trim: true,
    required: 'Location name cannot be blank',
    index: true
  },
  path: {
    type: String,
    default: ""
  },
  loc: {
    type: { type: String },
    coordinates: []
  },
  currentScore: {
    type: Number,
    default: 0
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  loctype: {
    type: Schema.ObjectId,
    ref: 'Location'
  },
  results: [],
  scorehistory: []
});

DashboardSchema.statics.seed = seed;

/*
For GeoJSON use longitude,latitude and store as follows
     "loc": { 
         "type": "Point",
         "coordinates": [-73.97, 40.77]
     }
*/

DashboardSchema.index({ 'title': 'text', 'locname' : 'text', 'description': 'text' });
DashboardSchema.index({ 'loc' : '2dsphere' });

mongoose.model('Dashboard', DashboardSchema);

/**
* Seeds the Dashboard collection with document (Dashboard)
* and provided options.
*/
function seed(doc, options) {
  var Dashboard = mongoose.model('Dashboard');

  return new Promise(function (resolve, reject) {

    skipDocument()
      .then(findAdminUser)
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function findAdminUser(skip) {
      var User = mongoose.model('User');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        User
          .findOne({
            roles: { $in: ['admin'] }
          })
          .exec(function (err, admin) {
            if (err) {
              return reject(err);
            }

            doc.user = admin;

            return resolve();
          });
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Dashboard
          .findOne({
            title: doc.title
          })
          .exec(function (err, existing) {
            if (err) {
              return reject(err);
            }

            if (!existing) {
              return resolve(false);
            }

            if (existing && !options.overwrite) {
              return resolve(true);
            }

            // Remove Dashboard (overwrite)
            existing.remove(function (err) {
              if (err) {
                return reject(err);
              }

              return resolve(false);
            });
          });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve({
            message: chalk.yellow('Database Seeding: Dashboard\t' + doc.title + ' skipped')
          });
        }

        var dashboard = new Dashboard(doc);

        dashboard.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Dashboard\t' + dashboard.title + ' added'
          });
        });
      });
    }
  });
}

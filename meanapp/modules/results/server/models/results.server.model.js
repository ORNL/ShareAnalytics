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
 * Result Schema
 */
var ResultSchema = new Schema({
  start: {
    type: Date,
    default: Date.now
  },
  finish: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  uuid: {
    type: String,
    default: '',
    trim: true,
    required: 'UUID cannot be blank'
  },
  description: {
    type: String,
    default: '',
    trim: true,
    required: 'Description cannot be blank'
  },
  filepaths: {
    type: String,
    default: '',
    trim: true,
    required: 'Must provide output file paths comma delimited'
  },
  score: {
    type: Number,
    default: 0,
    required: true
  },
  analytic: {
    type: Schema.ObjectId,
    ref: 'Analytic'
  },
  dataset: {
    type: Schema.ObjectId,
    ref: 'Dataset'
  },
  dashboard: {
    type: Schema.ObjectId,
    ref: 'Dashboard',
    required: false
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

ResultSchema.statics.seed = seed;

mongoose.model('Result', ResultSchema);

/**
* Seeds the User collection with document (Result)
* and provided options.
*/
function seed(doc, options) {
  var Result = mongoose.model('Result');

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
        Result
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

            // Remove Result (overwrite)

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
            message: chalk.yellow('Database Seeding: Result\t' + doc.title + ' skipped')
          });
        }

        var result = new Result(doc);

        result.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Result\t' + result.title + ' added'
          });
        });
      });
    }
  });
}

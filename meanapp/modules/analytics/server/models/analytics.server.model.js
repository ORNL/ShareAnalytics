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
 * Analytic Schema
 */
var AnalyticSchema = new Schema({
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
  type: {
    type: String,
    default: '',
    trim: true,
    required: 'Type cannot be blank',
    index: true
  },
  samplecode: {
    type: String,
    default: '',
    required: 'Sample code cannot be blank',
    trim: true,
    index: true
  },
  resultformat: {
    type: String,
    default: '',
    required: 'Result format cannot be blank',
    trim: true,
    index: true
  },
  inputformat: {
    type: String,
    default: '',
    required: 'Input format cannot be blank',
    trim: true,
    index: true
  },
  allowDownload: {
    type: Boolean,
    default: true
  },
  name: {
    type: String,
    default: '',
    trim: true,
    required: 'Name cannot be blank',
    index: true
  },
  supportingfiles: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

AnalyticSchema.statics.seed = seed;

AnalyticSchema.index({ 'name': 'text', 'description': 'text', 'title': 'text', 'supportingfiles': 'text' });

mongoose.model('Analytic', AnalyticSchema);

/**
* Seeds the Analytic collection with documents where User is admin
*/
function seed(doc, options) {
  var Analytic = mongoose.model('Analytic');

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
        Analytic
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

            // Remove Analytic (overwrite)

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
            message: chalk.yellow('Database Seeding: Analytic\t' + doc.title + ' skipped')
          });
        }

        var analytic = new Analytic(doc);

        analytic.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Analytic\t' + analytic.title + ' added'
          });
        });
      });
    }
  });
}

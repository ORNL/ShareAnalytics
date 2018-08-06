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
 * Dataset Schema
 */
var DatasetSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  collected: {
    type: Date,
    default: Date.now
  },
  validthru: {
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
  license: {
    type: String,
    default: '',
    trim: true,
    required: 'License cannot be blank',
    index: true
  },
  extensible: {
    type: String,
    default: '',
    trim: true,
    required: 'Extensible cannot be blank',
    index: true
  },
  samplecode: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  dataformat: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  size: {
    type: Number,
    default: '',
    required: 'File size cannot be blank',
    trim: true,
    index: true
  },
  files: {
    type: String,
    default: '',
    required: 'Files cannot be blank',
    trim: true,
    index: true
  },
  sizeunits: {
    type: String,
    default: '',
    required: 'Units cannot be blank',
    trim: true,
    index: true
  },
  numrows: {
    type: Number,
    default: '',
    required: 'Number of rows cannot be blank',
    trim: true,
    index: true
  },
  allowDownload: {
    type: Boolean,
    required: 'Allow download cannot be blank',
    default: true
  },
  path: {
    type: String,
    default: '',
    trim: true,
    required: 'Path cannot be blank'
  },
  analyses: {
    type: Array,
    default: []
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

DatasetSchema.statics.seed = seed;

DatasetSchema.index({ 'title': 'text', 'description': 'text' });

mongoose.model('Dataset', DatasetSchema);

/**
* Seeds the User collection with document (Dataset)
* and provided options.
*/
function seed(doc, options) {
  var Dataset = mongoose.model('Dataset');

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
        Dataset
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

            // Remove Dataset (overwrite)

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
            message: chalk.yellow('Database Seeding: Dataset\t' + doc.title + ' skipped')
          });
        }

        var dataset = new Dataset(doc);

        dataset.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Dataset\t' + dataset.title + ' added'
          });
        });
      });
    }
  });
}

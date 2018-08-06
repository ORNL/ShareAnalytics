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
 * Location Schema
 */
var LocationSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Name cannot be blank',
    index: true
  },
  description: {
    type: String,
    default: '',
    trim: true,
    required: 'Description cannot be blank',
    index: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  analytics: [{
    id: String,
    percent: Number
  }]
});

LocationSchema.statics.seed = seed;

LocationSchema.index({ 'title': 'text', 'description': 'text' });

mongoose.model('Location', LocationSchema);

/**
* Seeds the Location collection with document (Location)
* and provided options.
*/
function seed(doc, options) {
  var Location = mongoose.model('Location');

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
        Location
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

            // Remove Location (overwrite)

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
            message: chalk.yellow('Database Seeding: Location\t' + doc.title + ' skipped')
          });
        }

        var location = new Location(doc);

        location.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Location\t' + location.title + ' added'
          });
        });
      });
    }
  });
}

'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Locations Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/locations',
      permissions: '*'
    }, {
      resources: '/api/locations/:locationId',
      permissions: '*'
    }, {
      resources: '/api/locations/textsearch',
      permissions: ['post']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/locations',
      permissions: ['*']
    }, {
      resources: '/api/locations/:locationId',
      permissions: ['*']
    }, {
      resources: '/api/locations/textsearch',
      permissions: ['post']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/locations',
      permissions: ['get']
    }, {
      resources: '/api/locations/:locationId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Locations Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an location is being processed and the current user created it then allow any manipulation
  if (req.location && req.user && req.location.user && req.location.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};

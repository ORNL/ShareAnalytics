'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Filehandler Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/uploadanalytic',
      permissions: ['*']
    },
    {
      resources: '/api/availableanalytics',
      permissions: ['*']
    },
    {
      resources: '/api/availabledatasets',
      permissions: ['*']
    },
    {
      resources: '/api/uploaddataset',
      permissions: ['*']
    },
    {
      resources: '/api/downloadzip',
      permissions: ['*']
    },
    {
      resources: '/api/downloadfileaszip',
      permissions: ['*']
    },
    {
      resources: '/api/downloadanalyticaszip',
      permissions: ['*']
    },
    {
      resources: '/api/downloaddatasetaszip',
      permissions: ['*']
    },
    {
      resources: '/api/getimage',
      permissions: ['*']
    },
    {
      resources: '/api/getdashboardimage',
      permissions: ['*']
    },
    {
      resources: '/api/deletedatasetfile',
      permissions: ['*']
    },
    {
      resources: '/api/uploaddashboardimage',
      permissions: ['*']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/uploadanalytic',
      permissions: ['post']
    },
    {
      resources: '/api/uploaddataset',
      permissions: ['post']
    },
    {
      resources: '/api/uploaddashboardimage',
      permissions: ['post']
    },
    {
      resources: '/api/getdashboardimage',
      permissions: ['post']
    },
    {
      resources: '/api/availableanalytics',
      permissions: ['get']
    },
    {
      resources: '/api/availabledatasets',
      permissions: ['get']
    },
    {
      resources: '/api/deletedatasetfile',
      permissions: ['post']
    },
    {
      resources: '/api/downloadzip',
      permissions: ['post']
    },
    {
      resources: '/api/downloadfileaszip',
      permissions: ['post']
    },
    {
      resources: '/api/downloadanalyticaszip',
      permissions: ['post']
    },
    {
      resources: '/api/downloaddatasetaszip',
      permissions: ['post']
    },
    {
      resources: '/api/getimage',
      permissions: ['post']
    }]
  }]);
};

/**
 * Check If Dashboards Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an dashboard is being processed and the current user created it then allow any manipulation
  if (req.dashboard && req.user && req.dashboard.user && req.dashboard.user.id === req.user.id) {
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

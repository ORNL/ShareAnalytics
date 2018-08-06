'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/bootstrap/dist/css/bootstrap.css',
        //'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/font-awesome/css/font-awesome.min.css',
        'public/lib/angular-aside/dist/css/angular-aside.min.css',
        'public/lib/angular-ui-notification/angular-ui-notification.css',
        'public/packages/ngtable/ng-table.min.css',
        'public/lib/AngularJS-Toaster/toaster.min.css',
        'public/packages/openlayers/ol.css'
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/jquery-ui/jquery-ui.min.js',
        'public/lib/bootstrap/dist/js/bootstrap.min.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-aside/dist/js/angular-aside.min.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/ng-file-upload/ng-file-upload.js',
        'public/lib/angular-file-saver/dist/angular-file-saver.min.js',
        'public/lib/angular-file-saver/dist/angular-file-saver.bundle.min.js',        
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-mocks/angular-mocks.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-ui-notification/dist/angular-ui-notification.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-utils-ui-breadcrumbs/uiBreadcrumbs.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/ngmap/build/scripts/ng-map.min.js',
        'public/packages/chartjs/Chart.min.js',
        'public/lib/angular-chart.js/dist/angular-chart.min.js',
        'public/packages/ngtable/ng-table.min.js',
        'public/lib/AngularJS-Toaster/toaster.min.js',
        'public/lib/socket.io-client/dist/socket.io.js',
        'public/lib/angular-socket-io/socket.js',
        'public/lib/angular-modal-service/dst/angular-modal-service.min.js',
        'public/lib/angular-gravatar/build/angular-gravatar.min.js',
        'public/lib/showdown/dist/showdown.min.js',
        'public/lib/angular-sanitize/angular-sanitize.min.js',
        'public/lib/angular-ui-sortable/sortable.min.js',
        'public/packages/openlayers/ol.js',
        'public/packages/jqueryaddons/sparkline.min.js'
        // endbower
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/{css,less,scss}/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    img: [
      'modules/**/*/img/**/*.jpg',
      'modules/**/*/img/**/*.png',
      'modules/**/*/img/**/*.gif',
      'modules/**/*/img/**/*.svg'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gulpConfig: ['gulpfile.js'],
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: ['modules/*/server/config/*.js'],
    policies: 'modules/*/server/policies/*.js',
    views: ['modules/*/server/views/*.html']
  }
};

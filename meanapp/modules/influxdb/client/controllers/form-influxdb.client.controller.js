(function () {
  'use strict';

  angular
    .module('influxdb')
    .controller('InfluxdbFormController', InfluxdbFormController);

  InfluxdbFormController.$inject = ['$scope', '$http', '$state', '$window', 'Upload', 'Authentication','toaster','FileSaver'];

  function InfluxdbFormController($scope, $http, $state, $window, Upload, Authentication,toaster,FileSaver) {
    var vm = this;

    vm.authentication = Authentication;

    //TimePicker Configuration
    $scope.starttime = new Date();
    $scope.endtime = new Date();    
    
    $scope.hstep = 1;
    $scope.mstep = 15;
    $scope.ismeridian = true; 
    
    //DatePicker Configuration
    $scope.startdate = new Date();
    $scope.enddate = new Date();    

    $scope.format = 'dd-MMMM-yyyy';
    $scope.altInputFormats = ['M!/d!/yyyy'];
    $scope.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22),
      //minDate: new Date(),
      startingDay: 1
    };

    $scope.open1 = function() {
      $scope.popup1.opened = true;
    };

    $scope.popup1 = {
      opened: false
    };

    $scope.open2 = function() {
      $scope.popup2.opened = true;
    };

    $scope.popup2 = {
      opened: false
    };

    //Use FileSaver to save the data
    function openSaveAsDialog(filename, content, mediaType) {
      var blob = new Blob([content], {
          type: mediaType
      });
      FileSaver.saveAs(blob, filename);
      $state.go('datasets.create'); 
      toaster.pop('success',"Success","Check your downloads folder for your data!");    
    } 

    //Call to InfluxDB API
    $scope.prepareInfluxData = function(database,collection,filename)
    {
      //Prepare values for sending to influxdb
      var startdate = new Date($scope.startdate);
      var enddate = new Date($scope.enddate);
      var starttime = new Date($scope.starttime);
      var endtime = new Date($scope.endtime);

      var start = new Date(Date.UTC(startdate.getUTCFullYear(),startdate.getUTCMonth(),startdate.getUTCDate(),starttime.getUTCHours(),starttime.getUTCMinutes(),starttime.getUTCSeconds()));
      var end = new Date(Date.UTC(enddate.getUTCFullYear(),enddate.getUTCMonth(),enddate.getUTCDate(),endtime.getUTCHours(),endtime.getUTCMinutes(),endtime.getUTCSeconds()));

      //verify start date is prior to end date
      if(start >= end)
      {
        toaster.pop('error',"Error","Start date must be prior to end date");                  
      }
      else {
      //need nanoseconds precision on UTC Strings so have to add zeros - otherwise date wrong
      $http({
        url: 'http://localhost:3000/api/influxdb',
        method: "POST",
        Accept: 'application/octet-stream',
        responseType: 'arraybuffer',
        data: { 'database' : database, 'collection' : collection, 'filename' : filename, 'start' : Math.round(start.getTime()/1000).toString() + "s", 'end' : Math.round(end.getTime()/1000).toString() + "s"},
        headers: {'Content-Type': 'application/json'}          
      })
      .then(function(response) {
        var file = filename + ".zip"; //the influx api uses archiver to create a zip named filename.zip
        openSaveAsDialog(file, response.data, 'application/zip');                                
      }, 
      function(response) { // optional
        toaster.pop('error',"Error",response.data);        
      });
    }
  }

  }
}());

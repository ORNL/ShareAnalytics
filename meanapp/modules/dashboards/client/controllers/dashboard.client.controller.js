(function () {
    
      'use strict';
    
      angular
        .module('core')
        .controller('ViewDashboardController', ViewDashboardController);
    
      ViewDashboardController.$inject = ['$scope','$window', '$http', '$state', 'dashboardResolve', 'DashboardsService', 'NgTableParams','$interval','toaster'];
    
      function ViewDashboardController($scope,$window,$http,$state,dashboard,DashboardsService,NgTableParams,$interval,toaster) {
        
        var vm = this;        
        vm.dashboard = dashboard;
        vm.results = []; 
        vm.nonscoreresults = [];  
        vm.dashboardimage = null;
        vm.mapimage =  null;
        getimage(vm.dashboard.dashboardImageURL,true);
        if(vm.dashboard.usealternatemapimage) {
          getimage(vm.dashboard.mapImageURL,false);
        }   

        //data for the map
        vm.oldata = {};

        //default to avoid console error
        vm.oldata.center = {
            lat: 51.5,
            lon: 0.12
        };

        vm.remove = function() {
          if ($window.confirm('Are you sure you want to delete?')) {
            vm.dashboard.$remove(function () {
              $state.go('dashboards.list');
              toaster.pop('success',"Success","Dataset deleted successfully!");
            });
          }
        };

        function checkIfAnalytic(array,val) {
          for(var i =0; i < array.length; i++) {
            if(array[i].id == val) {
              return i;
            }
          }

          return -1;
        }

        vm.calculateColor = function(percent) {
            var r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
            var g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
            return 'rgb('+r+','+g+',0)';
        };

        vm.dashboard.$promise.then(function(){
            vm.long = vm.dashboard.loc.coordinates[0];
            vm.lat = vm.dashboard.loc.coordinates[1];    
            
            //Set center for the map
            vm.oldata.center = {
                  lat: vm.lat,
                  lon: vm.long,
                  label: vm.dashboard.locname
            };

            if(vm.dashboard.results[0] != null && vm.dashboard.results.length > 0) {
              for(var i=0; i < vm.dashboard.results.length; i++) {
                    var index = checkIfAnalytic(vm.dashboard.loctype.analytics,vm.dashboard.results[i].analytic._id);
                    if(index > -1) {
                      vm.results.push(
                        {
                          'title': vm.dashboard.results[i].analytic.title,
                          'score': vm.dashboard.results[i].score,
                          'scores' : vm.dashboard.results[i].scores,
                          'modifiedscore': (vm.dashboard.loctype.analytics[index].percent/100) * vm.dashboard.results[i].score
                        }
                      );
                    } else {
                      vm.nonscoreresults.push(
                        {
                          'title': vm.dashboard.results[i].analytic.title,
                          'score': vm.dashboard.results[i].score,
                          'scores' : vm.dashboard.results[i].scores                          
                        }
                      );
                    }
              }
            }
        });

        vm.sortableOptions = {
          'update': vm.resultsTableUpdate
        };

        function _arrayBufferToBase64(buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
          }

        function getimage(path,ismainimage) {
            $http({
                method: 'POST',
                url: 'http://localhost:3000/api/getdashboardimage',
                responseType: 'arraybuffer',
                data: { 'file' : path },
                headers: {'Content-Type': 'application/json'}  
            }).then(function(response) {
                if(ismainimage) {
                  vm.dashboardimage = _arrayBufferToBase64(response.data);
                } else {
                  vm.mapimage = _arrayBufferToBase64(response.data);
                }
            }, function(response) {
              if(ismainimage) {
                toaster.pop('error',"Error","Error uploading image");                
              } else {
                toaster.pop('error',"Error","Error uploading image - add alternate map image onto campaign if not present");                
              }
            });
        }
      }
      
    }());
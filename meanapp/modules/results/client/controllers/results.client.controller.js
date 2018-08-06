(function () {
  'use strict';

  angular
    .module('results')
    .controller('ResultsController', ResultsController);

  ResultsController.$inject = ['$scope', '$http', '$window', 'socket', 'Authentication', 'toaster', 'ResultsService', 'FileSaver', 'NgTableParams', 'ModalService'];

  function ResultsController($scope, $http, $window, socket, Authentication, toaster, ResultsService, FileSaver, NgTableParams, ModalService) {
    var vm = this;
    var modalImages = [];

    //Update results when ready for viewing
    //For some reason utterly unbenknownst to developer, using vm.theresults here results in the analyze form
    //being submitted repeatedly. So used a new var to store the results instead. 
    $scope.$on('socket:resultdone', function(ev,title) {
      reloadResultTable();
    });

    var validFilesTypes = ["jpg", "png"];

    function CheckIfImageFile(path) 
    {        
     var ext = path.substring(path.lastIndexOf(".") + 1, path.length).toLowerCase();
     var isImage = false;
     for (var i = 0; i < validFilesTypes.length; i++) 
     {
       if (ext == validFilesTypes[i]) 
       {
         isImage = true;
         break;
       }
     }           
    
     return isImage;
    }

    function _arrayBufferToBase64(buffer) {
      var binary = '';
      var bytes = new Uint8Array(buffer);
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }

    $scope.showModal = function(result) {

      modalImages = [];
      var theid = 0;
      var paths = result.filepaths.split(',');
      for(var i = 0; i < paths.length; i++ ) {
        if(CheckIfImageFile(paths[i])) {
          $http({
            method: 'POST',
            url: 'http://localhost:3000/api/getimage',
            responseType: 'arraybuffer',
            data: { 'file' : paths[i] },
            headers: {'Content-Type': 'application/json'}  
          }).then(function(response) {
            modalImages.push({image: _arrayBufferToBase64(response.data),id: theid});
            theid += 1;
          }, function(response) {
            console.error('Error getting image');
          });
        }
      }

      /* Test code to show that carousel works with multiple images
      Delete once an actual example with multiple images exists
      $http({
        method: 'POST',
        url: 'http://localhost:3000/api/getimage',
        responseType: 'arraybuffer',
        data: { 'file' : '/tmp/results/foo.png' },
        headers: {'Content-Type': 'application/json'}  
      }).then(function(response) {
        modalImages.push({image: _arrayBufferToBase64(response.data),id: theid});
        theid += 1;
      }, function(response) {
        console.error('Error getting image');
      }); */

      ModalService.showModal({
        templateUrl: "/modules/results/client/views/modal.client.view.html",
        controller: "ModalCarouselController",
        inputs: {
          images: modalImages,
          title: result.title
        }
      }).then(function(modal) {
        // The modal object has the element built, if this is a bootstrap modal
        // you can call 'modal' to show it, if it's a custom modal just show or hide
        // it as you need to.
        modal.element.modal();
        modal.close.then(function(result) {
          $scope.message = result ? "You said Yes" : "You said No";
        });
      });
    }

    //get creds
    vm.authentication = Authentication;

    //get results from service
    vm.theresults = ResultsService.query();

    //Must wait for promise to resolve or else the table will appear empty on initial page load
    vm.theresults.$promise.then(function(){

      //This is necessary because ngTable won't sort on nested vars
      for(var i =0; i<vm.theresults.length; i++) {
        vm.theresults[i].userdisplayname = vm.theresults[i].user.displayName;
        vm.theresults[i].analytictitle = vm.theresults[i].analytic.title;
        vm.theresults[i].datasettitle = vm.theresults[i].dataset.title;
        if(vm.theresults[i].dashboard != null) {
          vm.theresults[i].dashboardtitle = vm.theresults[i].dashboard.title;   
        } else {
          vm.theresults[i].dashboardtitle = "Not Linked";             
        }     
      }

      vm.resultTableParams = new NgTableParams({}, { dataset: vm.theresults });          
    });

    //reload table values gracefully
    var reloadResultTable = function() {
      vm.theresults = ResultsService.query();

       vm.theresults.$promise.then(function(){

        //This is necessary because ngTable won't sort on nested vars
        for(var i =0; i<vm.theresults.length; i++) {
          vm.theresults[i].userdisplayname = vm.theresults[i].user.displayName;
          vm.theresults[i].analytictitle = vm.theresults[i].analytic.title;
          vm.theresults[i].datasettitle = vm.theresults[i].dataset.title;
          if(vm.theresults[i].dashboard != null) {
            vm.theresults[i].dashboardtitle = vm.theresults[i].dashboard.title;   
          } else {
            vm.theresults[i].dashboardtitle = "Not Linked";             
          }            }
        
        vm.resultTableParams = new NgTableParams({}, { dataset: vm.theresults });          
      });
    }

    $scope.remove = function(result) {
      if ($window.confirm('Are you sure you want to delete?')) {
          result.$remove(function () {
          reloadResultTable();
          toaster.pop('success',"Success","Result deleted successfully!");
        });
      }
    }

    function openSaveAsDialog(filename, content, mediaType) {
      var blob = new Blob([content], {
          type: mediaType
      });
      FileSaver.saveAs(blob, filename);
    } 

    $scope.download = function(result) {      
      $http({
        url: 'http://localhost:3000/api/downloadzip',
        method: "POST",
        Accept: 'application/octet-stream',
        responseType: 'arraybuffer',
        data: { 'filepaths' : result.filepaths, 'name' : result.title },
        headers: {'Content-Type': 'application/json'}       
      })
      .then(function(response) {
        var filename = result.title + ".zip";
        openSaveAsDialog(filename, response.data, 'application/zip');
      }, 
      function(response) { // optional
              // failed
      }); 

    }
  }
}());

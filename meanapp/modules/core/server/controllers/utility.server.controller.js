'use strict';

var fs = require('fs');  

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function deleteFolder(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if(fs.existsSync(curPath)) {
          if (fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            if(fs.existsSync(curPath)) {
              fs.unlinkSync(curPath);
            }
          }
        }
      });

      if(fs.existsSync(path)) {
        fs.rmdirSync(path);
      }
    }  
  }

exports.getUUID = function () {
    return uuid();
}    

exports.deleteFolder = function(path) {
  deleteFolder(path);
}
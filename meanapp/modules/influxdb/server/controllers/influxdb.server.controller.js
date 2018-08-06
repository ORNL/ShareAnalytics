'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  utility = require(path.resolve('./modules/core/server/controllers/utility.server.controller'));

const Influx = require('influx');
var fs = require('fs');
var archiver = require('archiver');

/**
 * Retrieve data from influxdb
 */
exports.retrievedata = function (req, res) {

  var datasetDirectory = req.app.locals.datasetfolderpath;     

  //Configure parameters for the influxdb query
  var influx = new Influx.InfluxDB({
    host: 'influxdb',
    database: req.body.database,
    port: 8086,
    username: 'root',
    password: 'root'
   })

   var querystring = "select * from \"" + req.body.collection + "\" where time > " + req.body.start + " and time < " + req.body.end;

   /**
   * Query InfluxDB
   */
  influx.query(querystring).then(result => { //query influxdb
    if(result.length > 0)
    {
      var filepath = datasetDirectory + utility.getUUID();
      var filname = req.body.filename;

      fs.writeFile(filepath, JSON.stringify(result), (err) => { //write the results of the influxdb query to file
        if (err) res.status(500).send("Error saving the data");  
        
        //If query to influxdb successfuly, write the results as json to file and then send to the client
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', 'attachment; ' + filname + '.zip');
      
        var archive = archiver('zip', {
          zlib: { level: 9 } // Sets the compression level.
        });
      
        // pipe archive data to the response object
        archive.pipe(res);
      
        archive.append(fs.createReadStream(filepath), { name: filname });
        
        archive.finalize();

        fs.unlinkSync(filepath); //delete temp file once results returned to user
      });
    } else {
        res.status(500).send("No data found. Try a different query.");
    }
  }).catch(err => {
    res.status(500).send(err.stack);
  })

};

var http = require('http');
var express = require('express');
var app = express();
var sql = require('mssql')
var path = require('path');
var db = require('./../db_config.js');

var config = db_config;



//Main-Path
var dir = __dirname;
dir = dir.substring(0, dir.length - 7);

//GET-Function declaration
app.get('/', function (req, res) {
   res.sendFile(path.join(dir + 'se-vue/public/index.html'));
});
app.get('/getLessons', getLessons);
app.get('/getDozenten', getDozenten)

//statische Dateien bereitstellen
app.use('/static', express.static(dir +'includes'));

//__________________________________________________________________________________________________________________________________

async function getLessons(req, res) {
    
        //read DozentenID from querystring
        if (req.query.ID) {
            var ID = req.query.ID;
        }
        else {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end();
        }

        //DB-query
        var data = Promise.resolve(SQLgetLessons(ID));
        res.send(await data);
   
}

function SQLgetLessons(ID) {
    return new Promise(function (resolve, reject) {

        var id = ID;

        // connect to your database
        sql.connect(config, function (err) {

            if (err) console.log(err);

            // create Request object
            var request = new sql.Request();

            // query to the database and get the records
            request.input('DozentID', sql.VarChar, id);
            request.query('select DozentID, NutzungsID, OrtsID, Tag, s.Anfang as start,  s.Ende as ende ' +
                'from Unterricht u Left Join Stunde s on s.Stunde = u.Stunde ' +
                'where DozentID = @DozentID',
                function (err, recordset) {

                if (err) {
                    console.log(err);
                    reject(err);
                }

                // send records as a response
                resolve(recordset.recordset);

            });
        });
    });

}

async function getDozenten(req, res) {

    //DB-query
    var data = Promise.resolve(SQLgetDozenten());

    function SQLgetDozenten() {
        return new Promise(function (resolve, reject) {

            sql.connect(config, function (err) {

                if (err) {
                    resolve(err);
                    return 0;
                }

                // create Request object
                var request = new sql.Request();

                // query to the database and get the records
                request.query('select titel, vorname, name, DozentID, FachbereichID FROM dozent order by name, vorname, DozentID', function (err, recordset) {

                    
                    if (recordset == undefined) {
                        
                        return "null";
                    }

                    console.log(recordset);
                    if (recordset == undefined) {

                        resolve(undefined);
                        return;
                    }
                    // send records as a response
                    resolve(recordset.recordset);

                });
            });
        }).catch(() => {
            
        });
    }
    res.send(await data);
}

//__________________________________________________________________________________________________________________________________

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server is running at http://%s:%s   :)", host, port);
})



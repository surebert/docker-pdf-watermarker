const express = require('express');    //Express Web Server
const busboy = require('connect-busboy'); //middleware for form/file upload
const path = require('path');     //used for file path
const fs = require('fs-extra');       //File System - for file manipulation
var uuid = require('node-uuid');
var exec = require('child_process').exec;

const PORT = 8080;

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

var app = express();
app.use(busboy());

app.get('/', function (req, res) {
  res.send('<h1>Instructions</h1><p>In order to watermark a pdf send two PDF files to /upload, one with fieldname watermark and one with fieldname pdf-to-watermark.  The watermark pdf will get stamped on each page of the pdf-to-watermark pdf and the resulting PDF streamed back.</p><pre>curl -i -F "watermark=@watermark.pdf" -F "pdf-to-watermark=@my.pdf" http://localhost:'+PORT+'/watermark > watermarked.pdf</pre>\n');
});

/* ==========================================================
Create a Route (/watermark) to handle the upload
(handle POST requests to /upload)
Express v4  Route definition
============================================================ */
app.route('/watermark')
    .post(function (req, res, next) {

        var fstream;
        var watermark,pdftowatermark;
        req.pipe(req.busboy);
        let tempdir = '/tmp/' + uuid.v4()
        fs.mkdir(tempdir);
    
        req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            file.on('data', function(){
            // got a chunk of file
            });
            let localpath = tempdir+"/"+fieldname+'.pdf';
            fstream = fs.createWriteStream(localpath);
            file.pipe(fstream);

            fstream.on('close', function () {
                console.log('Uploaded File: ' + filename);

                if(fieldname == "pdf-to-watermark"){
                  pdftowatermark = localpath;
                }

                if(fieldname == "watermark"){
                  watermark = localpath;
                }

                if(watermark && pdftowatermark){
                  let output_pdf = tempdir+'/output.pdf';

                  let cmd = "pdftk "+pdftowatermark+" multistamp "+watermark+" output "+output_pdf;
                  console.log('Running Command: ' + filename);
                  res.setHeader('Cmd', cmd);

                  exec(cmd, function (error, stdout, stderr) {
                    if(error){
                      console.error("Error Processing: "+output_pdf);
                      res.status(500);
                      res.send('Could not convert PDF');
                    } else {

                      let stat = fs.statSync(output_pdf);
                      console.error("File Saved and Streaming: "+output_pdf);
                      res.writeHead(200, {
                          'Content-Type': 'application/pdf',
                          'Content-Length': stat.size
                      });

                      var readStream = fs.createReadStream(output_pdf);
                      readStream.pipe(res);

                      exec('rm -rf ' + tempdir, function (err, stdout, stderr) {
                        if(err){
                          console.error("Could not delete "+tempdir);
                        } else {
                          console.log("Deleted "+tempdir);
                        }
                      });
                    }
                  });
                }
            });
        });
    });

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);

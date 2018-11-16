// Load the SDK and UUID
const aws = require('aws-sdk');
const s3 = new aws.S3();
const papa = require('papaparse');

const SPEC_FILE = 'parts.txt'

var params = {
  Bucket: "parts.split4ever.com", 
  //Delimiter: ',',
  MaxKeys: 6
 };

const regex=/^\d+_\d+\.(png|jpg)/i


const getPropertyNames = (o) => {
        var r=[];
        for(var propName in o){
            if(o.hasOwnProperty(propName))
                r.push(propName);
        }
        return r;
    };



const processFile = (file, arr) => {
    console.log('[processFile|in] file:', file);
    
    var params = {
      Bucket: "parts.split4ever.com", 
      Key: file
     };
     s3.getObject(params, function(err, data) {
       if (err) console.log(err, err.stack); // an error occurred
       else     console.log(JSON.stringify(data, null, 6));           // successful response
       /*
       data = {
        AcceptRanges: "bytes", 
        ContentLength: 3191, 
        ContentType: "image/jpeg", 
        ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
        LastModified: <Date Representation>, 
        Metadata: {
        }, 
        TagCount: 2, 
        VersionId: "null"
       }
       */
     });
    
    console.log('[processFile|out]');
}

const processObjects = (contents, cb) => {
    console.log('[processObjects|in]');
    
    try {
        let imageCount = 0;
        let specCount = 0;
        let images = {};
        let parts = {};
        
        for(let i=0; i<contents.length; i++){
            let obj = contents[i];
            if( obj.Key === SPEC_FILE ){
                parts = processSpecFile(obj.Key);
                specCount++;
            }
            else {
                let match = obj.Key.match(regex);
                if( null !== match ){
                    processFile(obj.Key, images);
                    imageCount++;
                }
            } 
        }

        console.log('we have processed images:', imageCount);
        console.log('we have processed spec files:', specCount);

        let ids = getPropertyNames(images);
        for(let i=0; i<ids.length;i++){
            let id = ids[i];
            parts[id][images] = images[id];
        }

        console.log('parts:', parts);
        console.log('[processObjects|out]');
        cb(null, parts);
    }
    catch(err){
        cb(err);
    }
}


/*s3.listObjectsV2(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else {
      processObjects(data.Contents);
  }   
});*/

var parts = {};

const processSpecFile = ((next) => {

    let f = (data) => {
        let config = {delimiter: '\t', newline: '\n'}
        console.log('[processSpecFile.f|in]');
        var buff = Buffer.from(data.Body);
        let lines = buff.toString().split('\n');
        for(let i=0; i<lines.length; i++){
            let line = lines[i].trim();
            if( line.startsWith('#') )
                continue;
            console.log(papa.parse(line, config));
        }
        //next();
    };
    
    return {f:f}
})(parts);

const done = (e) => { console.log(e); };

var params = {
      Bucket: "parts.split4ever.com", 
      Key: SPEC_FILE
     };
var specFilePromise = s3.getObject(params).promise();
specFilePromise.then(processSpecFile.f).catch(done);

console.log('DONE');





// Load the SDK and UUID
const aws = require('aws-sdk');
const papa = require('papaparse');
const uuidv4 = require('uuid/v4');

const SPEC_FILE = 'parts.txt'
const PART_FIELDS_NUM = 6;
const S3_AMAZON_URL = 'https://s3.amazonaws.com'
const PARTS_BUCKET_NAME = 'parts.split4ever.com';
const regex=/^(prod|dev)\/\d+_\d+\.(png|jpg)/i
const imageRegex=/^(prod|dev)\/(\d+)_*/
const REGION='us-east-1';
const PARTS_TABLE = 'parts';
const DEV_STAGE = 'dev';
const DEV_STAGE_SUFFIX = '_DEV';

aws.config.update({region: REGION});

const s3 = new aws.S3();
const db = new aws.DynamoDB();
const doc = new aws.DynamoDB.DocumentClient({'service': db})

const getPropertyNames = (o) => {
        var r=[];
        for(var propName in o){
            if(o.hasOwnProperty(propName))
                r.push(propName);
        }
        return r;
    };

const toPart = (o) => {
    
    if(!Array.isArray(o))
        throw Error("part conveyor is not an array: ", o);
    
    if( PART_FIELDS_NUM != o.length )
        throw Error("part conveyor wrong number of fields: ", o);
    
    let part = {};
    part['id'] = uuidv4();
    part['number'] = parseInt(o[0]);
    part['name'] = o[1];
    part['price'] = parseFloat(o[2]);
    part['category'] = o[3];
    part['subcategory'] = o[4];
    part['notes'] = o[5];
    part['images'] = [];
    
    return part;
}

const toImage = (name, v) => {
    let image = {};
    image['name'] = name;
    image['type'] = v['ContentType'];
    image['href'] = S3_AMAZON_URL + '/' + PARTS_BUCKET_NAME + '/' + name;
    return image;
}


const tableUpdater = (store) => {
    console.log('[tableUpdater|in]');

    var params = { 
        TableName: store.table 
        , AttributesToGet: [ 'id' ]
    };
    doc.scan(params, function(e,data){
        if(e)
            console.log(e, e.stack)
        else{
            let params = {RequestItems:{}};
            let deleteRequests = [];
            for( let i=0; i < data.Items.length; i++ ){
                let item = data.Items[i];
                let deleteRequest = {};
                deleteRequest["DeleteRequest"] = { Key: { "id": item.id } }
                deleteRequests.push(deleteRequest);
            }
            if( 0 <  deleteRequests.length){
                params.RequestItems[store.table] = deleteRequests;
                console.log('[tableUpdater] executing batchwrite with params:', params)
                doc.batchWrite(params, function(err, data) {
                  if (err) console.log(err, err.stack);
                  else {
                      console.log('[tableUpdater] executed batchwrite successfully:', data)
                      storeSaver(store);
                      console.log('[tableUpdater] OUTCOME(store):', JSON.stringify(store))
                  } 
                });
            }
            else {
                storeSaver(store);
                console.log('[tableUpdater] OUTCOME(store):', JSON.stringify(store))
            }
            
        }
    });
    console.log('[tableUpdater|out]');
}

const storeSaver = (store) => {
    console.log('[storeSaver|in]');
    
    let promises = []
    for(var n in store.data){
            if(store.data.hasOwnProperty(n)){
                console.log('[storeSaver] saving item:', store.data[n])
                let params = { Item: store.data[n], ReturnConsumedCapacity: "TOTAL", TableName: store.table };
                promises.push(doc.put(params).promise());    
            }    
        } 
    console.log('[storeSaver] going to save all promises which are:', promises.length); 
    Promise.all(promises).then(function(values) {
        console.log('[storeSaver] saved all promises: ', values);                  
    }).catch((e) => { console.log(e, e.stack); });
    
    console.log('[storeSaver|out]');
}

const storeUpdater = (store,etags) => {
    
    let f = (os) => {
        console.log('[storeUpdater.f|in] store:', store, '\netags:', etags);
        try {
            for(let i=0; i < os.length; i++){
                let o = os[i];
                let filename = etags[o.ETag];
                let match = filename.match(imageRegex);
                console.log('[storeUpdater.f] match:', match);
                if( null !== match && Array.isArray(match) && 1 < match.length ){
                    
                    let number = parseInt(match[2]);
                    if( ! store.data[number] )
                        throw Error('wrong number on image: ', filename )
                    let image = toImage(filename,o);
                    store.data[number]['images'].push(image);
                    store.audit.images++;
                    console.log('[storeUpdater] num of images item has now:', store.data[number]['images'].length);
                }
            }
            let table = PARTS_TABLE;
            if( DEV_STAGE === store.stage )
                table += DEV_STAGE_SUFFIX;
            console.log('[storeSaver] going to update table:', table);
            store["table"] = table;
            tableUpdater(store);           
        } catch (e) {
            console.log(e, e.stack)
        }
        console.log('[storeUpdater.f|out]');
    }
    
    return {f: f};
};

const processImages = (store) => {
    console.log('[processImages|in] store:', store);
         try {
             s3.listObjectsV2({ Bucket: PARTS_BUCKET_NAME, Prefix: store.stage + '/' }, function(err, data) {
              if (err) console.log(err, err.stack); 
              else {
                  console.log(data)
                  let etags = {};
                  let promises = [];
                  for(let i=0; i < data.Contents.length; i++){
                        let obj = data.Contents[i];
                        let match = obj.Key.match(regex);
                        if( null !== match ){
                            etags[obj.ETag] = obj.Key;
                            promises.push(s3.getObject({ Bucket: PARTS_BUCKET_NAME, Key: obj.Key }).promise());
                        }
                    }
                  
                  Promise.all(promises).then(function(values) {
                      storeUpdater(store, etags).f(values);
                    }).catch((e) => { console.log(e, e.stack); });
              }   
            });
        }
        catch(err){
            console.log(err, err.stack);
        }
    console.log('[processImages|out]');
}


const processSpecFile = (stage) => {
        
        let f = (data) => {
            console.log('[processSpecFile|in]');
            try {
                let config = { delimiter: ',', newline: '\n', quoteChar: '"', comments: true, skipEmptyLines: true };
                var buff = Buffer.from(data.Body);
                var content = buff.toString();
                parsed = papa.parse(content, config);
                //set the stage
                let store = {
                    stage: stage
                    , data: {}
                };
                if(parsed.data && Array.isArray(parsed.data)){
                    for(let i = 0; i < parsed.data.length; i++){
                        let obj = parsed.data[i];
                        let part = toPart(obj);
                        store.data[part.number] = part;
                    }
                    console.log("number of objects parsed:", Object.keys(store.data).length)
                    store.audit = { objs: Object.keys(store.data).length , images: 0}
                    processImages(store);
                }
            }
            catch(e){
                console.log("*** something wrong:", e, s.stack);
            }
            console.log('[processSpecFile|out]');
        };
    
    return {f: f};
        
};


var stage = 'prod'
var params = {
      Bucket: PARTS_BUCKET_NAME, 
      Key: stage + '/' + SPEC_FILE
     };
var specFilePromise = s3.getObject(params).promise();

specFilePromise.then(processSpecFile(stage).f).catch((e) => { console.log(e, e.stack); });

console.log('DONE');





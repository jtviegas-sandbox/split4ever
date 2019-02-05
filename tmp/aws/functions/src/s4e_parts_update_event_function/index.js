const aws = require('aws-sdk');
const papa = require('papaparse');
const uuidv4 = require('uuid/v4');

const REGION='eu-west-1';
const SPEC_FILE = 'parts.txt';
const PART_FIELDS_NUM = 7;
//const S3_AMAZON_URL = 'https://s3.amazonaws.com';
const S3_AMAZON_URL = 'https://s3.' + REGION + '.amazonaws.com'

const PARTS_BUCKET_NAME = 'parts.split4ever.com';
const regex=/^(prod|dev)\/\d+_\d+\.(png|jpg)/i;
const imageRegex=/^(prod|dev)\/(\d+)_*/;

const PARTS_TABLE = 'parts';
const DEV_STAGE = 'dev';
const DEV_STAGE_SUFFIX = '_DEV';
const PARTS_BUCKET_ARN = 'arn:aws:s3:::parts.split4ever.com';
const DEV_UPDATE_SIGNAL_FILE = 'update.dev';
const PROD_UPDATE_SIGNAL_FILE = 'update.prod';

aws.config.update({region: REGION});
const s3 = new aws.S3();
const db = new aws.DynamoDB();
const doc = new aws.DynamoDB.DocumentClient({'service': db})

const DATE_PATTERN = /(\d{4})(\d{2})(\d{2})/;

const storeSaver = (store, callback) => {
    console.log('[storeSaver|in]');
    
    try {
        let promises = [];
        for(var n in store.data){
            if(store.data.hasOwnProperty(n)){
                console.log('[storeSaver] saving item:', store.data[n]);
                let params = { Item: store.data[n], ReturnConsumedCapacity: "TOTAL", TableName: store.table };
                promises.push(doc.put(params).promise());    
            }    
        } 
        console.log('[storeSaver] going to save all promises which are:', promises.length); 
        store.audit.tosave = promises.length;
        Promise.all(promises).then(function(values) {
            //console.log('[storeSaver] saved all promises saved number: ', values.length); 
            store.audit.saved = values.length;
            callback(null,store);
        }).catch((e) => { callback(e); });
    } catch (e) {
        callback(e);
    }
    
    console.log('[storeSaver|out]');
};

const tableUpdater = (store, callback) => {
    console.log('[tableUpdater|in]');

    var params = { 
        TableName: store.table 
        , AttributesToGet: [ 'id' ]
    };
    try {
        doc.scan(params, function(e,data){
            if(e)
                callback(e);
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
                    console.log('[tableUpdater] executing batchwrite with params:', params);
                    doc.batchWrite(params, function(err, data) {
                        if (err) callback(err);
                        else {
                            console.log('[tableUpdater] executed batchwrite successfully:', data);
                            storeSaver(store, callback);
                            console.log('[tableUpdater] OUTCOME(store):', JSON.stringify(store));
                        } 
                    });
                }
                else {
                    storeSaver(store, callback);
                    console.log('[tableUpdater] OUTCOME(store):', JSON.stringify(store));
                }

            }
        });
    } catch (e) {
        callback(e);
    }
    console.log('[tableUpdater|out]');
};

const toImage = (name, v) => {
    let image = {};
    image['name'] = name;
    image['type'] = v['ContentType'];
    image['href'] = S3_AMAZON_URL + '/' + PARTS_BUCKET_NAME + '/' + name;
    return image;
};

const storeUpdater = (store,etags, callback) => {
    
    let f = (os) => {
        console.log('[storeUpdater.f|in] store:', store, '\netags:', etags);
        try {
            for(let i=0; i < os.length; i++){
                let o = os[i];
                let filename = etags[o.ETag];
                let match = filename.match(imageRegex);
                //console.log('[storeUpdater.f] match:', match);
                if( null !== match && Array.isArray(match) && 1 < match.length ){
                    
                    let number = parseInt(match[2], 10);
                    if( ! store.data[number] )
                        throw Error('wrong number on image: ', filename );
                    let image = toImage(filename,o);
                    store.data[number]['images'].push(image);
                    store.audit.images++;
                    //console.log('[storeUpdater] num of images item has now:', store.data[number]['images'].length);
                }
            }
            let table = PARTS_TABLE;
            if( DEV_STAGE === store.stage )
                table += DEV_STAGE_SUFFIX;
            console.log('[storeUpdater] going to update table:', table);
            store["table"] = table;
            tableUpdater(store, callback);           
        } catch (e) {
            callback(e);
        }

        console.log('[storeUpdater.f|out]');
    }
    
    return {f: f};
};

const getPartsImages = (store, callback) => {
    console.log('[getPartsImages|in] store:', store);
    
         try {
             s3.listObjectsV2({ Bucket: PARTS_BUCKET_NAME, Prefix: store.stage + '/' }, function(err, data) {
              if (err) callback(err); 
              else {
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
                      storeUpdater(store, etags, callback).f(values);
                    }).catch((e) => { callback(e); });
              }   
            });
        }
        catch(e){
           callback(e); 
        }
        
    console.log('[getPartsImages|out]');
};

const specFileHandling = (stage, callback) => {
        
        let f = (data) => {
            console.log('[specFileHandling|in]');
            try {
                let config = { delimiter: ',', newline: '\n', quoteChar: '"', comments: true, skipEmptyLines: true };
                var buff = Buffer.from(data.Body);
                var content = buff.toString();
                parsed = papa.parse(content, config);
                let store = {
                    stage: stage
                    , data: {}
                };
                if(parsed.data && Array.isArray(parsed.data)){
                    for(let i = 0; i < parsed.data.length; i++){
                        let obj = parsed.data[i];
                        let part = toPart(obj);
                        part['n'] = i;
                        store.data[part.number] = part;
                    }
                    let numParts = Object.keys(store.data).length;
                    store.audit = { objs: numParts , images: 0};
                    if( 0 === numParts ){
                        callback(null, store);
                    }
                    else
                        getPartsImages(store, callback);
                }
            }
            catch(e){
                callback(e);
            }

            console.log('[specFileHandling|out]');
        };
    
    return {f: f};
        
};

const toPart = (o) => {
    
    if(!Array.isArray(o))
        throw Error("part conveyor is not an array: ", o);
    
    if( PART_FIELDS_NUM != o.length )
        throw Error("part conveyor wrong number of fields: ", o);
    
    let part = {};
    part['id'] = uuidv4();
    part['number'] = parseInt(o[0], 10);
    part['name'] = o[1];
    part['price'] = parseFloat(o[2]);
    part['category'] = o[3];
    part['subcategory'] = o[4];
    part['notes'] = o[5];
    part['images'] = [];
    let dateAsString = null;
    try{
        dateAsString = o[6];
        let dt = new Date(dateAsString.replace(DATE_PATTERN,'$1-$2-$3')); 
        part['ts'] = dt.getTime();
    }
    catch(e){
        console.log("[toPart] could not parse the date: ", dateAsString, " err:", e)
        part['ts'] = Date.now();
    }
    
    return part;
};

const processUpdate = (stage, callback) => {
    console.log('[processUpdate|in] stage:', stage);
    
    var params = {
      Bucket: PARTS_BUCKET_NAME, 
      Key: stage + '/' + SPEC_FILE
     };
    var specFileHandlingPromise = s3.getObject(params).promise();
    specFileHandlingPromise.then(specFileHandling(stage, callback).f).catch((e) => { callback(e); });
    
    console.log('[processUpdate|out]');
};


exports.handler = (event, context, callback) => {
    console.log('[handler|in]');
    console.log('[handler] event:', JSON.stringify(event, null, 2));
    console.log('[handler] context:', JSON.stringify(context, null, 2));
    
    
    const done = (err, res) => {
        console.log('[handler.done|in]', '[ err:', err,' | res:', res, ' ]');
        if(err)
            console.log('[handler.done] err.stack:', err.stack);
        
        callback(null, 
                 {
                    statusCode: err ? 400 : 200,
                    body: err ? err.message : JSON.stringify(res)
                });
        console.log('[handler.done|out]');
    };
    
    try {
        
        let stage = null;
        for(let i=0; i<event.Records.length; i++){
            let record = event.Records[i];
            if(record.s3 && record.s3.bucket && record.s3.bucket.name === PARTS_BUCKET_NAME){
                if( record.s3.object.key === DEV_UPDATE_SIGNAL_FILE )
                    stage = 'dev';
                else 
                    if ( record.s3.object.key === PROD_UPDATE_SIGNAL_FILE )
                        stage = 'prod';
            }
        }

        if( null === stage )
            throw Error('no stage defined');
        else 
            processUpdate(stage, done);
        
    }
    catch(error) {
      done(error);
    }
    console.log('[handler|out]');
};

/*
var event = {
    "Records": [
        {
            "eventVersion": "2.0",
            "eventSource": "aws:s3",
            "awsRegion": "eu-west-1",
            "eventTime": "2018-11-21T18:00:22.624Z",
            "eventName": "ObjectCreated:Put",
            "userIdentity": {
                "principalId": "A8HL0WRYU0T0V"
            },
            "requestParameters": {
                "sourceIPAddress": "194.88.4.145"
            },
            "responseElements": {
                "x-amz-request-id": "50A535B76621EAC2",
                "x-amz-id-2": "9eigH2IKYrt+rx5p8lmjtEknR/MHV5cHzqQ9gZFK26RubVHVdUAOS6GOzM9U5Cb9qA9OzLQBj2Q="
            },
            "s3": {
                "s3SchemaVersion": "1.0",
                "configurationId": "s4ePartsDevUpdateEvent",
                "bucket": {
                    "name": "parts.split4ever.com",
                    "ownerIdentity": {
                        "principalId": "A8HL0WRYU0T0V"
                    },
                    "arn": "arn:aws:s3:::parts.split4ever.com"
                },
                "object": {
                    "key": "update.dev",
                    "size": 0,
                    "eTag": "d41d8cd98f00b204e9800998ecf8427e",
                    "sequencer": "005BF59D3688C73978"
                }
            }
        }
    ]
}

exports.handler(event, null, (e,d)=>{console.log('DONE', e,d);})
*/
// Load the SDK and UUID
const aws = require('aws-sdk');
const papa = require('papaparse');

const SPEC_FILE = 'parts.txt'
const PART_FIELDS_NUM = 6;
const PARTS_BUCKET_NAME = "parts.split4ever.com";
const regex=/^\d+_\d+\.(png|jpg)/i
const imageRegex=/^(\d+)_*/
const REGION='us-east-1';
const PARTS_TABLE = 'parts';
const DEV_STAGE = 'dev';
const DEV_STAGE_SUFFIX = '_DEV';


aws.config.update({region: REGION});

const s3 = new aws.S3();
const db = new aws.DynamoDB();


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
    part['number'] = o[0]
    part['name'] = o[1]
    part['price'] = o[2]
    part['category'] = o[3]
    part['subcategory '] = o[4]
    part['notes'] = o[5]
    part['images'] = []
    
    return part;
}

const toImage = (name, v) => {
    let image = {};
    image['name'] = name;
    image['type'] = v['ContentType'];
    let buff = Buffer.from(v.Body);
    image['data'] = buff.toString();
    return image;
}


const tableUpdater = (store) => {
    console.log('[tableUpdater|in]');
    var params = {
        TableName: store.table
    };
    
    db.deleteTable(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
/*
{ AttributeName: "number", KeyType: "RANGE" } 
                         ,
                                  
*/
        console.log('[tableUpdater] deleted table:', store.table);
        var params = {
            AttributeDefinitions: [ { AttributeName: "number", AttributeType: "N" }
                                  , { AttributeName: "name", AttributeType: "S" }
                                  , { AttributeName: "price", AttributeType: "N" }
                                  , { AttributeName: "category", AttributeType: "S" }
                                  , { AttributeName: "subcategory", AttributeType: "S" }
                                  , { AttributeName: "notes", AttributeType: "S" }
                                  , { AttributeName: "images", AttributeType: "B" }]
            , KeySchema: [  { AttributeName: "name", KeyType: "HASH" }
                                  , { AttributeName: "price", KeyType: "RANGE" }
                                  , { AttributeName: "category", KeyType: "RANGE" }
                                  , { AttributeName: "subcategory", KeyType: "RANGE" }
                                  , { AttributeName: "notes", KeyType: "RANGE" }
                                  ]
            , ProvisionedThroughput: {
                ReadCapacityUnits: 5, 
                WriteCapacityUnits: 5
            }
            , TableName: store.table
        };
        db.createTable(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log('[tableUpdater] created table:', store.table);
                storeSaver(store);
            }   
        });

 });
    console.log('[tableUpdater|in]');
}

const storeSaver = (store) => {
    console.log('[storeSaver|in]');
    
    let promises = []
    for(var n in store.data){
            if(store.data.hasOwnProperty(n)){
                let params = { Item: store.data[n], ReturnConsumedCapacity: "TOTAL", TableName: store.table };
                promises.push(db.putItem(params).promise());    
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
        console.log('[storeUpdater.f|in] store:', store);
        try {
            for(let i=0; i < os.length; i++){
                let o = os[i];
                let filename = etags[o.ETag];
                let match = filename.match(imageRegex);
                if( null !== match && Array.isArray(match) && 1 < match.length ){
                    let number = parseInt(match[1]);
                    if( ! store.data[number] )
                        throw Error('wrong number on image: ', filename )
                    let image = toImage(filename,o);
                    console.log('[storeUpdater] image:', image);
                    store.data[number]['images'].push(image);
                    console.log('[storeUpdater] item now:', store.data[number]);
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
             s3.listObjectsV2({ Bucket: PARTS_BUCKET_NAME }, function(err, data) {
              if (err) console.log(err, err.stack); 
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


var stage = 'dev'
var params = {
      Bucket: PARTS_BUCKET_NAME, 
      Key: SPEC_FILE
     };
var specFilePromise = s3.getObject(params).promise();

specFilePromise.then(processSpecFile(stage).f).catch((e) => { console.log(e, e.stack); });

console.log('DONE');





const aws = require('aws-sdk');
const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();
const s3 = new aws.S3();

const PARTS_BUCKET_ARN = 'arn:aws:s3:::parts.split4ever.com';
const DEV_UPDATE_SIGNAL_FILE = 'update.dev';
const PROD_UPDATE_SIGNAL_FILE = 'update.prod';


const processUpdate = (stage, callback) => {
    console.log('[processUpdate|in]');
    
    
    
    console.log('[processUpdate|out]');
};


exports.handler = (event, context, callback) => {
    console.log('[handler|in]');
    console.log('[handler] event:', JSON.stringify(event, null, 2));
    console.log('[handler] context:', JSON.stringify(context, null, 2));
    
    
    const done = (err, res) => {
        console.log('[handler.done|in]', '[ err:', err,' | res:', res, ' ]');
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
            if(record.s3 && record.s3.bucket && record.s3.bucket.name === PARTS_BUCKET_ARN){
                if( record.s3.bucket.key === DEV_UPDATE_SIGNAL_FILE )
                    stage = 'dev'
                else 
                    if ( record.s3.bucket.key === PROD_UPDATE_SIGNAL_FILE )
                        stage = 'prod'
            }
        }

        if( null === stage ){
            done('no stage defined');
        }
        else {
            processUpdate(stage, done);
        }
        
    }
    catch(error) {
      done(error);
    }
};
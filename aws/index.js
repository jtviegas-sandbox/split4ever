const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

exports.partsLoad = (event, context, callback) => {
    console.log('[partsLoad|in] event:', JSON.stringify(event, null, 2));

    const done = (err, res) => {
        console.log('[partsLoad.done|in]', '[ err:', err,' | res:', res, ' ]');
        callback(null, 
                 {
                    statusCode: err ? 400 : 200,
                    body: err ? err.message : JSON.stringify(res)
                });
        console.log('[partsLoad.done|out]');
    };
    
    try {
        
        
    }
    catch(error) {
      done(error);
    }
    console.log('[partsLoad|out]');
};
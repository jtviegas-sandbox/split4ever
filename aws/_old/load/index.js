const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

exports.handler = (event, context, callback) => {
    console.log('[handler|in] event:', JSON.stringify(event, null, 2));

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
        
        
    }
    catch(error) {
      done(error);
    }
    console.log('[handler|out]');
};
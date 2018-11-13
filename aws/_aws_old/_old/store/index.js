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
        if( ! (event.pathParameters && event.pathParameters.storeId) )
            throw new Error('no storeId path parameter');
        
        let params = {
            TableName: event.pathParameters.storeId
        };
        
        if ( event.pathParameters.id )
            params.Key = { id: event.pathParameters.id };
        
        if(event.body)
            params.body = JSON.parse(event.body);
        
        console.log('[handler] going to invoke', event.httpMethod, 'on db with params:', JSON.stringify(params));
        
        switch (event.httpMethod) {
            case 'DELETE':
                dynamo.deleteItem(params, done);
                break;
            case 'GET':
                if( params.Key )
                    dynamo.getItem(params, done); 
                else 
                    dynamo.scan(params, done);
                break;
            case 'POST':
                dynamo.putItem(params, done);
                break;
            case 'PUT':
                dynamo.updateItem(params, done);
                break;  
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
        
    }
    catch(error) {
      done(error);
    }
    console.log('[handler|out]');
};
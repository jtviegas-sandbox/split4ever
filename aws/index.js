const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

exports.handler = (event, context, callback) => {
    console.log('[handler|in] event:', JSON.stringify(event, null, 2));

    const done = (err, res) => {
        console.log('[handler.done|in]', err, res);
        callback(null, 
                 {
                    statusCode: err ? '400' : '200',
                    body: err ? err.message : JSON.stringify(res),
                    headers: {
                    'Content-Type': 'application/json',
                    },
                });
        console.log('[handler.done|out]');
    };
    
    let params = {
        TableName: event.table
    };

    if(event.body){
        let input = JSON.parse(event.body);
        
        if( input.id )
            params.Key = { id: input.id };
    }
    
    console.log('[handler] going to invoke', event.httpMethod, 'on db with params:', JSON.stringify(params));

    switch (event.httpMethod) {
        case 'DELETE':
            dynamo.deleteItem(input, done);
            break;
        case 'GET':
            if( params.Key )
                dynamo.getItem(params, done); 
            else 
                dynamo.scan(params, done);
            break;
        case 'POST':
            dynamo.putItem(input, done);
            break;
        case 'PUT':
            dynamo.updateItem(input, done);
            break;  
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
    console.log('[handler|out]');
};
'use strict';
const AWS = require("aws-sdk");
const util = require('util');
const config = require("./config");

const db = new AWS.DynamoDB(config);
const doc = new AWS.DynamoDB.DocumentClient(config);

const datalayer_module = function(){
    
    var findTable = (table, callback) => {
 
        var params = {"Limit": 100};
        db.listTables(params, function(err, data) {
          if (err) 
            callback(err);
          else
            callback(null, data.TableNames && 0 < data.TableNames.length && -1 < data.TableNames.indexOf(table));
        });
    }

    var createTable = (table, callback) => {
 
        var params = {
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S'
            },
            {
              AttributeName: 'num',
              AttributeType: 'N'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'num',
              KeyType: 'RANGE'
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          },
          TableName: table,
          StreamSpecification: {
            StreamEnabled: false
          }
        };

        db.createTable(params, function(err, data) {
          if (err) 
            callback(err);
          else
            callback(null, data);
        });
    }
    
    var putObj = (table, obj, callback) => {
        
         var params = {
          TableName: table,
          Item: obj
        };

        doc.put(params, function(err, data) {
          if (err) 
            callback(err);
          else 
            callback(null, data);
          
        });
    }
    
    var dropTable = (table, callback) => {
        
        var params = {
          TableName: table
        };
        db.deleteTable(params, function(err, data) {
            if (err){
                if (err.code === 'ResourceNotFoundException')
                    callback(null, 'no table there');
                else
                    callback(err);
            }
            else
                 callback(null);
        });
    }
    
    var getPagedObjs = (table, n, offsetPointer, callback) => {
       console.log("[getPagedObjs|in] table:", table, " n:", n," offsetPointer:", offsetPointer);
       
        let params = {TableName: table, Limit: n};
        if(offsetPointer)
            params['ExclusiveStartKey'] = offsetPointer;

        doc.scan(params, callback);
        console.log("[getPagedObjs|out]"); 
    }
    
    var toKey = (record) => {
        console.log("[toKey|in] record:", record);
        let result = {
            id: record.id
            , num: record.num
        }
        console.log("[toKey|out]=>", result); 
        return result;
    }
    
    var getObj = (table, key, callback) => {
        console.log("[getObj|in] table:", table, " key:", key);

        let params = {
          ExpressionAttributeValues: {
            ':id': key.id
            , ':num': key.num
           },
         KeyConditionExpression: 'id = :id and num= :num',
         TableName: table
        };
        doc.query(params, (e,d) => {
            
            if(e)
                callback(e);
            else{
                let out = null;
                if( Array.isArray(d.Items) && 0 < d.Items.length )
                    out = d.Items[0]
                callback(null, out);
            }
 
        });
        console.log("[getObj|out]");
    }
    
    var delObj = (table, key, callback) => {
        console.log("[delObj|in] table:", table, "key:", key);
        var params = {
          Key: key,
          TableName: table
        };

        doc.delete(params, function(err, data) {
          if (err) 
            callback(err);
          else 
            callback(null);
        });
        console.log("[delObj|out]");
    }
    
    var getObjsCount = (table, callback) => {
       console.log("[getObjsCount|in] table:", table);
       
        let params = {TableName: table};
        doc.scan(params, (e,d) => {
            if(e)
                callback(e);
            else {
                callback(null, d.Items.length);
            }
        });

        console.log("[getObjsCount|out]"); 
    }
    
    var getObjs = (table, callback) => {
       console.log("[getObjs|in] table:", table);
       
        let params = {TableName: table};
        doc.scan(params, (e,d) => {
            if(e)
                callback(e);
            else {
                console.log("[getObjs] got", d.Items.length, "items");
                callback(null, d.Items);
            }
        });

        console.log("[getObjs|out]"); 
    }
    
    return {
        createTable: createTable
        , findTable: findTable
        , putObj: putObj
        , dropTable: dropTable
        , getPagedObjs: getPagedObjs
        , getObj: getObj
        , delObj: delObj   
        , getObjsCount: getObjsCount
        , getObjs: getObjs
        , toKey: toKey
    };
    
}();


module.exports = datalayer_module;

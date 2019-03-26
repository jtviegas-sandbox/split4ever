'use strict';
const AWS = require("aws-sdk");
const util = require('util');
const config = require("./config");

const db = new AWS.DynamoDB(config);
const doc = new AWS.DynamoDB.DocumentClient(config);

const datalayer_module = function () {

    const findTable = (table, callback) => {

        let params = {"Limit": 100};
        db.listTables(params, function (err, data) {
            if (err)
                callback(err);
            else
                callback(null, data.TableNames && 0 < data.TableNames.length && -1 < data.TableNames.indexOf(table));
        });
    }

    const createTable = (table, callback) => {

        let params = {
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'number',
                    AttributeType: 'N'
                }
            ],
            KeySchema: [
                {
                    AttributeName: 'id',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'number',
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

        db.createTable(params, function (err, data) {
            if (err)
                callback(err);
            else
                callback(null, data);
        });
    }

    const putObj = (table, obj, callback) => {

        let params = {
            TableName: table,
            Item: obj
        };

        doc.put(params, function (err, data) {
            if (err)
                callback(err);
            else
                callback(null, data);

        });
    }

    const dropTable = (table, callback) => {

        let params = {
            TableName: table
        };
        db.deleteTable(params, function (err) {
            if (err) {
                if (err.code === 'ResourceNotFoundException')
                    callback(null, 'no table there');
                else
                    callback(err);
            } else
                callback(null);
        });
    }


    const getPagedObjs = (table, pageSize, offsetPointer, callback) => {
        console.log("[getPagedObjs|in] table:", table, " pageSize:", pageSize, " offsetPointer:", offsetPointer);

        doc.scan({TableName: table}, function (err, data) {
            if (err) {
                callback(err);
            } else {

                try {

                    let r = {
                        data: []
                        , first: null
                        , previous: null
                        , next: null
                        , last: null
                        , idx: {
                            current: 0
                            , first: 0
                            , previous: null
                            , next: null
                            , last: null
                        }
                    };

                    if (0 < data.Items.length) {
                        r.idx.last = data.Items.length - 1;
                        console.log('[getPagedObjs] last index:', r.idx.last);

                        if (offsetPointer) {
                            r.idx.current = data.Items.findIndex(o => o.id === offsetPointer);
                            if (-1 === r.idx.current)
                                throw new Error("could not find data by lastKey");
                            r.idx.current++;
                        }

                        let n = data.Items.length;
                        let pages = Math.ceil(n / pageSize);
                        let page = Math.floor(r.idx.current / pageSize)

                        if (1 < page)
                            r.idx.previous = (page - 1) * pageSize;
                        if (page < (pages - 2))
                            r.idx.next = (page + 1) * pageSize;

                        r.idx.last = (pages - 1) * pageSize;

                        if (r.idx.next) {
                            console.log('[getPagedObjs] slicing', r.idx.current, r.idx.next);
                            r.data = data.Items.slice(r.idx.current, r.idx.next);
                        } else {
                            if (page < (pages - 1)) {
                                console.log('[getPagedObjs] slicing', r.idx.current, r.idx.current + pageSize);
                                r.data = data.Items.slice(r.idx.current, r.idx.current + pageSize);
                            } else {
                                console.log('[getPagedObjs] slicing', r.idx.current);
                                r.data = data.Items.slice(r.idx.current);
                            }
                        }

                        r.previous = (null === r.idx.previous) ? null : data.Items[r.idx.previous - 1].id;
                        r.next = (null === r.idx.next) ? null : data.Items[r.idx.next - 1].id;
                        r.last = (0 < r.idx.last) ? data.Items[r.idx.last - 1].id : null;

                        console.log('[getPagedObjs] pointers', r.idx.first, r.idx.previous, r.idx.current, r.idx.next, r.idx.last);
                    }
                    callback(null, r);
                } catch (error) {
                    callback(error);
                }

            }
        });

        console.log("[getPagedObjs|out]");
    }

    const toKey = (record) => {
        console.log("[toKey|in] record:", record);
        let result = {
            id: record.id
            , number: record.number
        }
        console.log("[toKey|out]=>", result);
        return result;
    }

    const getObj = (table, key, callback) => {
        console.log("[getObj|in] table:", table, " key:", key);

        let params = {
            ExpressionAttributeValues: {
                ':id': key
                //, ':number': key.number
            },
            ExpressionAttributeNames: {
                '#id': 'id'
                //, '#number': 'number'
            },
            KeyConditionExpression: '#id = :id', //and #number = :number',
            TableName: table
        };
        doc.query(params, (e, d) => {
            console.log('[getObj|doc.query|cb] e:', e);
            if (e)
                callback(e);
            else {
                let out = null;
                if (Array.isArray(d.Items) && 0 < d.Items.length)
                    out = d.Items[0]
                callback(null, out);
            }

        });
        console.log("[getObj|out]");
    };

    const delObj = (table, key, callback) => {
        console.log("[delObj|in] table:", table, "key:", key);
        var params = {
            Key: key,
            TableName: table
        };

        doc.delete(params, function (err, data) {
            if (err)
                callback(err);
            else
                callback(null);
        });
        console.log("[delObj|out]");
    }

    const getObjsCount = (table, callback) => {
        console.log("[getObjsCount|in] table:", table);

        let params = {TableName: table};
        doc.scan(params, (e, d) => {
            if (e)
                callback(e);
            else {
                callback(null, d.Items.length);
            }
        });

        console.log("[getObjsCount|out]");
    }

    const getObjs = (table, callback) => {
        console.log("[getObjs|in] table:", table);

        let params = {TableName: table};
        doc.scan(params, (e, d) => {
            if (e)
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

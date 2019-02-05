'use strict';
process.env['RUN_ENV'] = 'local';
const ITERATIONS = 6;
const chai = require('chai');
const should = chai.should;
const expect = chai.expect;
const util = require('util');
const datalayer = require("../datalayer");
const index = require("../index");
const config = require("../config");
const common = require("../common");
const TABLE = config.table_dev;

describe('index tests', function() {
    
    before(function(done) {
        
        var load = (callback) => {
            
            let i = 0;
            let item = {'id': "xpto"+i,'num':i,"description":"xpt"+i,"category":"a"+i};
            while(i<(ITERATIONS-1)){
                console.log("putting object:", i)
                datalayer.putObj(TABLE, item, (e,d)=>{ 
                    if(e)
                        console.log('failed putObj');
                    else
                        console.log('done putObj')
                });
                i++;
                item = {'id': "xpto"+i,'num':i,"description":"xpt"+i,"category":"a"+i};
            }
            datalayer.putObj(TABLE, item, callback);

        };
        
        var create = (table, callback)=> {
            console.log('going to create table:', table);
            datalayer.createTable(TABLE, (e,d) => {
                if(e)
                    callback(e);
                else{
                    console.log('created table')
                    load(callback);
                }
            });
        }
        
        datalayer.findTable(TABLE, (e,d) => {
            if(e || d)
                done();
            else
                create(TABLE, done);
        });
        
    });

    after(function(done) {

        datalayer.dropTable(TABLE, (e,d) => {
            if(e)
                done(e);
            else{
                console.log('dropped table');
                done();
            }
        }); 

    });
    
    describe('...pagination', function(done) {
        it('should get first 2 objects, and then another two', function(done) {
            
            new Promise(function (resolve, reject) {
                
                let event = {
                    httpMethod: 'GET'
                    , queryStringParameters: {
                        pagesize: 2
                        , lastkey: null
                        , dev: 'true'
                    }
                };
                index.handler(event, context, (e,d)=>{
                    if(e)
                        reject(e); 
                    else {
                        let out = JSON.parse(d.body);
                        expect(out.Items.length).to.equal(2);
                        resolve(out);
                    }
                });
 
            })
            .then((result)=>{
                    new Promise(function (resolve, reject) {
                        let event = {
                            httpMethod: 'GET'
                            , queryStringParameters: {
                                pagesize: 2
                                , lastkey: common.encodeKey(result.LastEvaluatedKey)
                                , dev: 'true'
                            }
                        };
                        index.handler(event, context, (e,d)=>{
                            if(e)
                                reject(e); 
                            else {
                                
                                let out = JSON.parse(d.body);
                                expect(out.Items.length).to.equal(2);
                                for(let i=0;i<2;i++)
                                   expect(out.Items[i].id).to.not.equal(result.LastEvaluatedKey.id); 
                                
                                expect(out.LastEvaluatedKey.id).to.equal(out.Items[1].id);
                                resolve(out);
                            }
                        });
                    })
                    .then(r => {
                        done(null);
                    })
                    .catch((e)=>{
                        done(e);
                    });
                })
            .catch((e)=>{
                done(e);
            });
        });    

    });
    
     describe('...obj getter', function(done) {
        it('should get a specific item', function(done) {
            
            new Promise(function (resolve, reject) {
                
                let event = {
                    httpMethod: 'GET'
                    , queryStringParameters: {
                        pagesize: 1
                        , lastkey: null
                        , dev: 'true'
                    }
                };
                index.handler(event, context, (e,d)=>{
                    if(e)
                        reject(e); 
                    else {
                        let out = JSON.parse(d.body);
                        expect(out.Items.length).to.equal(1);
                        resolve(out.Items[0]);
                    }
                });
 
            })
            .then((result)=>{
                    new Promise(function (resolve, reject) {
                        let event = {
                            httpMethod: 'GET'
                            , queryStringParameters: {
                                pagesize: 2
                                , dev: 'true'
                            }
                            , pathParameters: {
                                key: common.encodeKey({ id: result.id, num: result.num })
                            }
                        };
                        index.handler(event, context, (e,d)=>{
                            if(e)
                                reject(e); 
                            else {
                                let out = JSON.parse(d.body);
                                expect(out).to.deep.equal(result);
                                resolve(out);
                            }
                        });
                    })
                    .then(r => {
                        done(null);
                    })
                    .catch((e)=>{
                        done(e);
                    });
                })
            .catch((e)=>{
                done(e);
            });
        });    

    });
    
    
});

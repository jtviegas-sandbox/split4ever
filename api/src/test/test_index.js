'use strict';
process.env['RUN_ENV'] = 'local';
const ITERATIONS = 6;
const chai = require('chai');
const should = chai.should;
const expect = chai.expect;
const util = require('util');
const datalayer = require("../datalayer");
const index = require("..");
const config = require("../config");
const common = require("../common");
const TABLE = config.table_dev;

describe('index tests', function() {

    before(function(done) {

        this.timeout(12000);

        const load = (callback) => {

            let cb = function(limit, callback){
                let count = 0;

                let f = function(e,o){
                    if(e)
                        callback(e);
                    else{
                        count++;
                        if(count === limit){
                            console.log("enough objects:", count)
                            callback(null, o);
                        }
                    }
                };
                return{f:f}
            }(ITERATIONS, callback);

            let i = 0;

            while (i < (ITERATIONS)) {
                let item = {'id': 'xpto' + i, 'number': i, 'description': 'xpto' + i, 'category': 'a' + i};
                console.log("putting object:", item)
                datalayer.putObj(TABLE, item, cb.f);
                i++;
            }

        };

        const create = (table, callback) => {
            console.log('going to create table:', table);
            datalayer.createTable(TABLE, (e, d) => {
                if (e)
                    callback(e);
                else {
                    console.log('created table')
                    load(callback);
                }
            });
        };

        datalayer.findTable(TABLE, (e,d) => {
            console.log('[before|datalayer.findTable|cb] e:',e,'d:',d);
            if(e || d)
                done();
            else
                create(TABLE, done);
        });

    });

    after(function(done) {
        console.log('[after] going to drop table:', TABLE);
        datalayer.dropTable(TABLE, (e,d) => {
            if(e)
                done(e);
            else{
                console.log('[after|cb] dropped table');
                done(null);
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
                        expect(out.data.length).to.equal(2);
                        console.log("* out", out)
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
                                , lastkey: result.data[1].id
                                , dev: 'true'
                            }
                        };
                        index.handler(event, context, (e,d)=>{
                            if(e)
                                reject(e); 
                            else {
                                let out = JSON.parse(d.body);

                                expect(out.data.length).to.equal(2);
                                for(let i=0;i<2;i++)
                                   expect(out.data[i].id).to.not.equal(result.data[1].id);

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
                        expect(out.data.length).to.equal(1);
                        resolve(out.data[0]);
                    }
                });
 
            })
            .then((result)=>{
                    new Promise(function (resolve, reject) {
                        let event = {
                            httpMethod: 'GET'
                            , queryStringParameters: {
                                dev: 'true'
                            }
                            , pathParameters: {
                                key: result.id
                            }
                        };
                        index.handler(event, context, (e,d)=>{
                            if(e)
                                reject(e); 
                            else {
                                console.log("* d",d);
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

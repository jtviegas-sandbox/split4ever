'use strict';
process.env['RUN_ENV'] = 'local';
const datalayer = require("../datalayer");
const TABLE = 'apitest';
const ITERATIONS = 6;
const chai = require('chai');
const should = chai.should;
const expect = chai.expect;
const util = require('util');

describe('datalayer tests', function() {
    
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
                datalayer.getPagedObjs(TABLE, 2, null, (e,d)=>{
                    if(e)
                        reject(e);
                    else{
                        console.log(util.inspect(d,  { compact: true, depth: 5 }));
                        expect(d.Count).to.equal(2);
                        expect(d.Items).to.be.an('array');
                        expect(d.Items.length).to.equal(2);
                        expect(d.LastEvaluatedKey).not.to.be.a('null');
                        console.log('getting first two')
                        resolve(d.LastEvaluatedKey);
                    }
                        
                });  
            })
            .then((result)=>{
                new Promise(function (resolve, reject) {
                    datalayer.getPagedObjs(TABLE, 2, result, (e,d)=>{
                        if(e)
                            reject(e);
                        else{
                            console.log(util.inspect(d,  { compact: true, depth: 5 }));
                            expect(d.Count).to.equal(2);
                            expect(d.Items).to.be.an('array');
                            expect(d.Items.length).to.equal(2);
                            for(let i=0;i<d.Items.length;i++){
                                expect(d.Items[i].id).to.not.deep.equal(result.id);
                                console.log('item id:', d.Items[i].id, 'lastKey.id:', result.id);
                            }
                            resolve(d);
                        }
                    });  
                })
                .then((result)=>{
                    done();
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
    
    describe('...getters', function(done) {

        it('should first scan objects to get them after', function(done) {
            new Promise(function (resolve, reject) {
                datalayer.getPagedObjs(TABLE, 2, null, (e,d)=>{
                    console.log(util.inspect(d,  { compact: true, depth: 5 }));
                    if(e)
                        reject(e);
                    else{
                        expect(d.Count).to.equal(2);
                        expect(d.Items).to.be.an('array');
                        expect(d.Items.length).to.equal(2);
                        let objs=[];
                        objs.push(d.Items[0]);
                        objs.push(d.Items[1]);
                        resolve(objs);   
                    }
                        
                });  
            })
            .then((result)=>{
                new Promise(function (resolve, reject) {
                    datalayer.getObj(TABLE, datalayer.toKey(result[0]), (e,d)=>{
                        if(e)
                            reject(e);
                        else{
                            console.log(util.inspect(d,  { compact: true, depth: 5 }));
                            resolve(d);
                        }
                    });  
                })
                .then((result)=>{
                    done();
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
    
    describe('... get, del and check', function(done) {
        it('should have less one item in the end', function(done) {
            new Promise(function (resolve, reject) {
                        datalayer.getObjs(TABLE,(e,d)=>{
                            if(e)
                                reject(e);
                            else{
                                console.log(util.inspect(d,  { compact: true, depth: 5 }));
                                expect(d.length).to.be.above(1);
                                resolve(d);
                            }
                        });  
                    }
            )
            .then((result)=>{
                    let items = result;
                    new Promise(function (resolve, reject) {
                        datalayer.delObj(TABLE, datalayer.toKey(items[0]), (e,d)=>{
                            if(e)
                                reject(e);
                            else{
                                console.log(util.inspect(d,  { compact: true, depth: 5 }));
                                resolve(items);
                            }
                        });  
                    }).then((result)=>{
                        let items = result;
                        datalayer.getObjsCount(TABLE,(e,d)=>{
                            if(e)
                                done(e);
                            else{
                                console.log(util.inspect(d,  { compact: true, depth: 5 }));
                                expect(d).to.be.below(items.length);
                                done(d.Items);
                            }
                        });
                    }).catch((e)=>{ done(e); });
                }).catch((e)=>{ done(e); });
        });
    });
    
});

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
                datalayer.getPagedObjs(TABLE, 2, null, (e,d)=>{
                    if(e)
                        reject(e);
                    else{
                        console.log(util.inspect(d,  { compact: true, depth: 5 }));
                        expect(d.data.length).to.equal(2);
                        expect(d.data).to.be.an('array');
                        console.log('d.next', d.next);
                        resolve(d.next);
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
                            expect(d.data.length).to.equal(2);
                            expect(d.data).to.be.an('array');
                            for(let i=0;i<d.data.length;i++){
                                expect(d.data[i].id).to.not.deep.equal(result.id);
                                console.log('item id:', d.data[i].id, 'lastKey.id:', result.id);
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
                        expect(d.data.length).to.equal(2);
                        expect(d.data).to.be.an('array');
                        let objs=[];
                        objs.push(d.data[0]);
                        objs.push(d.data[1]);
                        resolve(objs);   
                    }
                        
                });  
            })
            .then((result)=>{
                new Promise(function (resolve, reject) {
                    datalayer.getObj(TABLE, result[0].id, (e,d)=>{
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
                        datalayer.delObj(TABLE, items[0].id, (e,d)=>{
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

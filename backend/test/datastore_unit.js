/**
 * Created by joaovieg on 08/11/16.
 */
"use strict";
process.env.MODE = 'TEST';
process.env.STORE = 'MOCK';

var expect = require('chai').expect;
var assert = require('chai').assert;

const storeFactory = require(__dirname + '/../src/services/store/dataStoreFactory');
var customutils = require('../src/services/common/customutils');

describe('running datastore unit tests on mock:', function() {

    var store = null;

    before(function(done) {
        store = storeFactory.get();
        done();
    });

    describe('store operations' , function() {


        it('1* should have 7 objects there', function(done) {
            let objs = store.getObjs(function(err,o){
                expect(err).to.be.null;
                expect(o.length).to.equal(7);
                done();
            });
            
         });

         it('2* should have 8 objects there after adding one', function(done) {
            let o = customutils.createRandomObj();
            store.setObj(o, function(e,o){
                expect(e).to.be.null;
            });
            let objs = store.getObjs(function(e,o){
                expect(e).to.be.null;
                expect(o.length).to.equal(8);
                done();
            });
            
         });

         it('3* should have 7 objects there after removing one', function(done) {
            store.getObjs(function(e,os){
                expect(e).to.be.null;
                let o = os[0];
                store.removeObj(o.id, function(e,o){
                    expect(e).to.be.null;
                    store.getObjs(function(e,os){
                        expect(e).to.be.null;
                        expect(os.length).to.equal(7);
                        done();
                    });
                });
            });
         });

         it('4* check for update', function(done) {
            store.getObjs(function(e,os){
                expect(e).to.be.null;
                let o = os[0];
                o.category = "badanas";
                store.setObj(o, function(e,o){
                    expect(e).to.be.null;
                    store.getObj(o.id, function(e,o){
                        expect(e).to.be.null;
                        expect(o.category).to.equal("badanas");
                         done();
                    });
                });

            });

         });

         it('5* should have nothing after clear', function(done) {
            let parts = null;
             store.getObjs(function(e,os){
                    expect(e).to.be.null;
                    parts = os;
                    store.clear(function(e,os){
                        expect(e).to.be.null;
                        store.getObjs(function(e,os){
                            expect(e).to.be.null;
                            expect(os.length).to.equal(0);
                            store.setObjs(parts, function(e,os){
                                expect(e).to.be.null;
                                expect(os.length).to.equal(parts.length);
                                done();
                            });
                        });

                    });
                });

         });

        
    });
});


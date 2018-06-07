/**
 * Created by joaovieg on 08/11/16.
 */
"use strict";
process.env.MODE = 'TEST';
process.env.STORE = 'MOCK';

var expect = require('chai').expect;
var assert = require('chai').assert;

var service = require('../src/services/data/dataService');
var customutils = require('../src/common/customutils');

describe('running data service unit tests on mock:', function() {

    describe('data service operations' , function() {

        it('1* should have 7 objects there', function(done) {
            let objs = service.getParts(function(err,o){
                expect(err).to.be.null;
                expect(o.length).to.equal(7);
                done();
            });
            
         });

         it('2* should have 8 objects there after adding one', function(done) {
            let o = customutils.createRandomObj();
            service.setPart(o, function(e,o){
                expect(e).to.be.null;
            });
            let objs = service.getParts(function(e,o){
                expect(e).to.be.null;
                expect(o.length).to.equal(8);
                done();
            });
            
         });

         it('3* should have 7 objects there after removing one', function(done) {
            service.getParts(function(e,os){
                expect(e).to.be.null;
                let o = os[0];
                service.removePart(o.id, function(e,o){
                    expect(e).to.be.null;
                    service.getParts(function(e,os){
                        expect(e).to.be.null;
                        expect(os.length).to.equal(7);
                        done();
                    });
                });
            });
         });

         it('4* check for update', function(done) {
            service.getParts(function(e,os){
                expect(e).to.be.null;
                let o = os[0];
                o.category = "badanas";
                service.setPart(o, function(e,o){
                    expect(e).to.be.null;
                    service.getPart(o.id, function(e,o){
                        expect(e).to.be.null;
                        expect(o.category).to.equal("badanas");
                         done();
                    });
                });

            });

         });

         it('5* should have nothing after clear', function(done) {
            service.clearParts(function(e,os){
                expect(e).to.be.null;
                service.getParts(function(e,os){
                    expect(e).to.be.null;
                    expect(os.length).to.equal(0);
                    done();
                });

            });

         });


    });
});


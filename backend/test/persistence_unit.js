/**
 * Created by joaovieg on 08/11/16.
 */
"use strict";
process.env.MODE = 'TEST';

var expect = require('chai').expect;
var assert = require('chai').assert;

var persistence = require('../src/persistence/persistence');
var logger = require('../src/common/apputils').logger;
var testutils = require('../src/common/testutils');

describe('running persistence unit tests', function() {

    var parts = [];
    parts.push(testutils.createParts(1, true));
    parts.push(testutils.createParts(1, false));

    before(function(done) {
        this.timeout(20000);
        persistence.delAllParts(function(err){
            if( err && (0 > err.message.indexOf("Database does not exist.")) )
                done(err);
            else
                done();
        });
    });

    after(function(done) {
        this.timeout(20000);

        persistence.dropPartsDb(function(err){
            if(err)
                done(err);
            else
                done();
        });
    });

    describe('parts operations' , function() {

        it('1* insert a spotlight part', function(done) {
            this.timeout(5000);
            persistence.setPart(parts[0],
                function(err, o){
                    if(err)
                        done(err)
                    else {
                        expect(o._id).to.not.be.null;
                        expect(o._rev).to.not.be.null;
                        parts[0]._id = o._id;
                        parts[0]._rev = o._rev;
                        done();
                    }

                });
        });

        it('2* should have one model', function(done) {
            persistence.getModels(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o.length, 1);
                        done();
                    }
                });
        });

        it('3* should have one category', function(done) {
            persistence.getCategories(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o.length, 1);
                        done();
                    }
                });
        });

        it('4* insert a part', function(done) {
            this.timeout(5000);
            persistence.setPart(parts[1],
                function(err, o){
                    if(err)
                        done(err)
                    else {
                        expect(o._id).to.not.be.null;
                        expect(o._rev).to.not.be.null;
                        parts[1]._id = o._id;
                        parts[1]._rev = o._rev;
                        done();
                    }

                });
        });

        it('5* should have 2 models', function(done) {
            persistence.getModels(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o.length, 2);
                        done();
                    }
                });
        });

        it('6.0* should have 2 categories', function(done) {
            persistence.getCategories(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o.length, 2);
                        done();
                    }
                });
        });

        it('6.1* should get 1 part with id >0 and a category', function(done) {
            var params = {
                "id": 0
                , "n": 2
                , "category": parts[0].category
                , "subCategory": parts[0].subCategory
            };
            persistence.getNPartsFromId(params,
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o.length, 1);
                        done();
                    }
                });
        });

        it('7* check the inserted spotlight part', function(done) {
            this.timeout(5000);
            persistence.getSpotlightParts(function(err, o){
                if (err) {
                    logger.error('[1*] error: %j', err);
                    return done(err);
                }
                var dummy = o[0];
                expect(dummy._id).to.not.be.null;
                expect(dummy._rev).to.not.be.null;
                assert.equal(1, o.length);
                assert.equal(parts[0]._id, dummy._id);
                assert.equal(parts[0]._rev, dummy._rev);
                done();
            });
        });

        it('8* update spotlight and get new rev', function(done) {
            this.timeout(5000);
            parts[0].name = parts[0].name + 'x';
            var rev2Check = parts[0]._rev;
            persistence.setPart(parts[0],
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.notEqual(rev2Check, o._rev);
                        parts[0]._rev = o._rev;
                        done();
                    }
                });
        });

        it('9* should have two parts', function(done) {
            persistence.numOfParts(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o, 2);
                        done();
                    }
                });
        });

        it('10* delete spotlight', function(done) {
            persistence.delPart(parts[0],
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(1, o);
                        done();
                    }
                });
        });

        it('11* should have one part', function(done) {
            persistence.numOfParts(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o, 1);
                        done();
                    }
                });
        });

        it('12* should have 1 models', function(done) {
            persistence.getModels(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o.length, 1);
                        done();
                    }
                });
        });

        it('13* should have 1 categories', function(done) {
            persistence.getCategories(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o.length, 1);
                        done();
                    }
                });
        });

        it('14* delete part', function(done) {
            persistence.delPart(parts[1],
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(1, o);
                        done();
                    }
                });
        });

        it('15* should have no part', function(done) {
            persistence.numOfParts(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o, 0);
                        done();
                    }
                });
        });

        it('16* should have no models', function(done) {
            persistence.getModels(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o.length, 0);
                        done();
                    }
                });
        });

        it('17* should have no categories', function(done) {
            persistence.getCategories(
                function(err, o){
                    if(err)
                        done(err);
                    else {
                        assert.equal(o.length, 0);
                        done();
                    }
                });
        });

    });
});


/**
 * Created by joaovieg on 19/10/16.
 */
"use strict";
process.env.MODE = 'TEST';
var baseFolder = '../src';

var request = require('supertest');
var assert = require('chai').assert;
var uuid = require('uuid');

var auth = require(baseFolder + '/auth/authentication.js');
var persistence = require(baseFolder + '/persistence/persistence');
var testutils = require(baseFolder + '/common/testutils');

describe('collections endpoints tests', function() {

    var app;
    var ENDPOINT = '/api/collections';
    var parts = [];
    parts.push(testutils.createParts(1, true));
    parts.push(testutils.createParts(1, false));

    before(function(done) {
        this.timeout(20000);
        persistence.delAllParts(function(err){
            if( err && (0 > err.message.indexOf("Database does not exist.")) )
                done(err);
            else{
                app = require(baseFolder + '/index.js');
                done();
            }

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

    it('should create 1 object, with spotlight', function(done) {
        this.timeout(10000);
        request(app).post(ENDPOINT + '/part')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(parts[0])
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }

                var o = res.body.result;
                assert.isTrue(null != o._id);
                assert.isTrue(null != o._rev);
                parts[0]._id = o._id;
                parts[0]._rev = o._rev;
                done();
            });
    });

    it('should have 1 object in db', function(done) {
        this.timeout(10000);
        request(app).get(ENDPOINT + '/part/n')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal(res.body.result, 1);
                done();
            });
    });

    it('should create another object, no spotlight', function(done) {
        this.timeout(10000);
        request(app).post(ENDPOINT + '/part')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(parts[1])
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }

                var o = res.body.result;
                assert.isTrue(null != o._id);
                assert.isTrue(null != o._rev);
                parts[1]._id = o._id;
                parts[1]._rev = o._rev;
                done();
            });
    });

    it('should have 2 objects in db', function(done) {
        this.timeout(10000);
        request(app).get(ENDPOINT + '/part/n')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result, 2);
                done();
            });
    });

    it('should have 1 spotlight part in db', function(done) {
        this.timeout(10000);
        request(app).get(ENDPOINT + '/part/spotlights')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result.length, 1);
                done();
            });
    });

    it('5* should have 4 models', function(done) {
        request(app).get(ENDPOINT + '/part/models')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result.length, 4);
                done();
            });
    });

    it('6.0* should have 4 categories', function(done) {
        request(app).get(ENDPOINT + '/part/categories')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result.length, 4);
                done();
            });
    });

    it('6.1* should get 1 part with id >0 and a category', function(done) {
        var params = { "id": 0 , "n": 2 };
        request(app).get(ENDPOINT + '/part/' + params.id + '/' + params.n)
            .query({"category": parts[0].category , "subCategory": parts[0].subCategory})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result.length, 1);
                done();
            });
    });

    it('8* update spotlight and get new rev', function(done) {
        this.timeout(5000);
        parts[0].name = parts[0].name + 'x';
        var rev2Check = parts[0]._rev;

        request(app).post(ENDPOINT + '/part')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(parts[0])
            .expect(200)
            .end(function(err, o) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.notEqual(rev2Check, o.body.result._rev);
                parts[0]._rev = o.body.result._rev;
                done();
            });
    });

    it('10* delete spotlight', function(done) {
        request(app).del(ENDPOINT + '/part/' + parts[0]._id + '/' + parts[0]._rev)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result, 1);
                done();
            });
    });

    it('should have 1 objects in db', function(done) {
        this.timeout(10000);
        request(app).get(ENDPOINT + '/part/n')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result, 1);
                done();
            });
    });

    it('5* should have 2 models', function(done) {
        request(app).get(ENDPOINT + '/part/models')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result.length, 2);
                done();
            });
    });

    it('6.0* should have 2 categories', function(done) {
        request(app).get(ENDPOINT + '/part/categories')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result.length, 2);
                done();
            });
    });

    it('10* delete other part', function(done) {
        request(app).del(ENDPOINT + '/part/' + parts[1]._id + '/' + parts[1]._rev)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result, 1);
                done();
            });
    });

    it('should have no objects in db', function(done) {
        this.timeout(10000);
        request(app).get(ENDPOINT + '/part/n')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result, 0);
                done();
            });
    });

    it('5* should have no model', function(done) {
        request(app).get(ENDPOINT + '/part/models')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result.length, 0);
                done();
            });
    });

    it('6.0* should have no category', function(done) {
        request(app).get(ENDPOINT + '/part/categories')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal( res.body.result.length, 0);
                done();
            });
    });


});

"use strict";
process.env.MODE = 'TEST';
process.env.STORE = 'MOCK';

var request = require('supertest');
var assert = require('chai').assert;
var expect = require('chai').expect;


var baseFolder = '../src';
var app = require(baseFolder + '/index.js');

describe('parts endpoint tests', function() {

    var app;
    var ENDPOINT = '/api/parts';

    before(function(done) {
        app = require(baseFolder + '/index.js');
        done();
    });

    it('should require basic authentication', function(done) {

        request(app).get(ENDPOINT)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res.status).to.be.equal(401)
                done();
            });
    });

    it('should get all objects', function(done) {

        request(app).get(ENDPOINT)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', 'Basic ' + new Buffer('user:passw0rd').toString('base64'))
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                //console.log("result:", res.body);
                var o = res.body;

                assert.isTrue(0 < o.length);
                done();
            });
    });

    

});
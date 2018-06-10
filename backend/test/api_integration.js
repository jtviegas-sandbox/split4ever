
"use strict";
process.env.MODE = 'TEST';
process.env.STORE = 'MOCK';

var request = require('supertest');
var assert = require('chai').assert;

var baseFolder = '../src';
var app = require(baseFolder + '/index.js');

describe('parts endpoint tests', function() {

    var app;
    var ENDPOINT = '/api/parts';

    before(function(done) {
        app = require(baseFolder + '/index.js');
        done();
    });

    it('should get all objects', function(done) {

        request(app).get(ENDPOINT)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                console.log("result:", res.body);
                var o = res.body;

                assert.isTrue(0 < o.length);
                done();
            });
    });

    

});
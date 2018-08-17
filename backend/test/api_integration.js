
"use strict";
process.env.MODE = 'TEST';
process.env.STORE = 'MOCK';

var request = require('supertest');
var assert = require('chai').assert;
var expect = require('chai').expect;

var baseFolder = __dirname + '/../src';
var app = require(baseFolder + '/index.js');
const utils = require(baseFolder + '/services/common/customutils')
const Part = require(baseFolder + '/representations/part')

describe('parts endpoint tests', function() {

    var app;
    var ENDPOINT = '/api/parts';

    var obj = null;
    var n = 0;

    before(function(done) {
        app = require(baseFolder + '/index.js');
        done();
    });

    

    it('should get all objects', function(done) {

        request(app).get(ENDPOINT)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200)
                var o = res.body;
                assert.isTrue(0 <= o.length);
                n = o.length;
                done();
            });
    });

    it('should require basic authentication to post object', function(done) {

        obj = new Part(utils.createNewRandomObj());
        request(app).post(ENDPOINT)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(obj)
            .end(function(err, res) {
                expect(res.status).to.be.equal(401)
                done();
            });
    });

    it('post object', function(done) {

        request(app).post(ENDPOINT)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', 'Basic ' + new Buffer('user:passw0rd').toString('base64'))
            .send(obj)
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(201)
                var o = res.body;
                assert.equal(obj.name, o.name);
                obj = o;
                done();
            });
    });

    it('retrieve object', function(done) {

        let path = ENDPOINT + '/' + obj.id
        request(app).get(path)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res.status).to.be.equal(200)
                expect(err).to.be.null;
                var o = res.body;
                assert.equal(obj.id, o.id);
                done();
            });
    });

    it('try to retrieve not existent object', function(done) {

        let path = ENDPOINT + '/' + obj.id + '6789'
        request(app).get(path)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(err, res) {
                 expect(err).to.be.null;
                expect(res.status).to.be.equal(404)
                done();
            });
    });

    it('should require basic authentication to put obj', function(done) {

        let path = ENDPOINT + '/' + obj.id
        obj.name = utils.randomString(16);
        request(app).put(path)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(obj)
            .end(function(err, res) {
                expect(res.status).to.be.equal(401)
                done();
            });
    });

    it('put/change the object', function(done) {

        let path = ENDPOINT + '/' + obj.id
        request(app).put(path)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', 'Basic ' + new Buffer('user:passw0rd').toString('base64'))
            .send(obj)
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200)
                var o = res.body;
                assert.equal(obj.name, o.name);
                done();
            });
    });

    it('check number of objects ', function(done) {

        request(app).get(ENDPOINT)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200)
                var o = res.body;
                assert.equal(n+1, o.length);
                done();
            });
    });

    it('should require basic authentication to delete obj', function(done) {

        let path = ENDPOINT + '/' + obj.id
        request(app).delete(path)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res.status).to.be.equal(401)
                done();
            });
    });

    it('delete object', function(done) {

        let path = ENDPOINT + '/' + obj.id
        request(app).delete(path)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', 'Basic ' + new Buffer('user:passw0rd').toString('base64'))
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(204)
                done();
            });
    });

    it('try to delete unexistent object', function(done) {

        let path = ENDPOINT + '/' + obj.id + '-6789'
        request(app).delete(path)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', 'Basic ' + new Buffer('user:passw0rd').toString('base64'))
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(404)
                done();
            });
    });

    it('check number of objects', function(done) {

        request(app).get(ENDPOINT)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200)
                var o = res.body;
                assert.equal(n, o.length);
                done();
            });
    });

});
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });

const tester = require('lambda-tester');
const expect = require('chai').expect;
const handler = require('../src/index').handler;

describe('store tests', function(){
    context('parts test', function(){
        it('GET count', function(){
            
            var _event = {
                table: 'parts'
                , httpMethod: 'GET'
            };
            
            return tester(handler).event(_event).expectResult(function(r){ 
                expect(r.body.Count).to.be.above(0); 
            });
        });
    });
});
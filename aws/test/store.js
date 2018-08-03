const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.AWS_REGION });

const tester = require('lambda-tester');
const expect = require('chai').expect;
const handler = require('../store/index').handler;

describe('store tests', function(){
    context('parts test', function(){
        it('GET count', function(){
            
            var _event = {
                pathParameters:{
                    storeId: 'parts'
                } 
                , httpMethod: 'GET'
            };
            
            return tester(handler).event(_event).expectResult(function(r){ 
                let o = JSON.parse(r.body);
                expect(o.Count).to.be.above(0); 
            });
        });
    });
});
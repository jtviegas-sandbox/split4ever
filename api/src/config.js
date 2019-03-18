'use strict';

const config_module = function(){
    
    const DEFAULT_PAGESIZE = 12;
    const LOCAL_DB_ENDPOINT = "http://localhost:8000";
    const DEFAULT_REGION = 'eu-west-1';
    const API_VERSION = '2012-08-10';
    const PROD_TABLE = 'parts';
    const DEV_TABLE = 'parts_DEV';
    const DEFAULT_KEY_SEPARATOR = '_';
    
    
    let config = {
        apiVersion: API_VERSION
        , region: DEFAULT_REGION
        , table_prod: PROD_TABLE
        , table_dev: DEV_TABLE
        , default_key_separator: DEFAULT_KEY_SEPARATOR
    };
    
    if ( process.env.RUN_ENV === 'local' ){
        console.log('running locally')
        config['endpoint'] = LOCAL_DB_ENDPOINT;
    }
    
    if ( process.env.PAGE_SIZE )
        config['pagesize'] = process.env.PAGE_SIZE;
    else 
        config['pagesize'] = DEFAULT_PAGESIZE;

    
    return config;
    
}();

module.exports = config_module;

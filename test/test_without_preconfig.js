/* global require console process describe it */

const tap = require('tap')

const path    = require('path')
const rootdir = path.normalize(__dirname)

const config_file = rootdir+'/../test.config.json'
const config_okay = require('config_okay')
const viewer = require('../.')
const superagent = require('superagent')
const  _ = require('lodash')

const utils = require('./utils.js')

// tap.plan(6)
const views = ['_design/imputedchecks/_view/missing_wim_neighbors'
               ,'_design/vdsml/_view/mainline'
               ,'_design/properties/_view/segment_length_ml']

/**
 * fixme, I should really create a test db, and populate it with data
 * and with a view
 *
 * Instead, because I want to get some real work done, this test is
 * going to just use an exsiting db that I have with existing views
 *
 * If your name is not James E. Marca, you should change this
 *
 */


config_okay(config_file)
    // .then(async (config)=>{
    //     //await utils.create_tempdb(config)
    //     return config
    // })
    .then( async (config) => {
        await tap.test('should get all missing wim neighbors in district 10, reducing all'
                       , t => {
                           utils.promise_wrapper(viewer,
                                                 {'view':views[0]
                                                  ,'startkey':[2007, 10]
                                                  ,'endkey':[2007,10,{}]
                                                  ,'config_file': config_file
                                                 })
                               .then( docs =>{
                                   console.log(docs)
                                   t.same(docs,{"rows":[
                                       {"key":null,"value":80}
                                   ]})
                                   return t.end()
                               })
                               .catch( e => {
                                   console.log('error',e)
                                   t.fail()
                               })
                       })
       })

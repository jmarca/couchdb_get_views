/* global require console process describe it */

const fs     = require('fs')

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


config_okay(config_file)
    // .then(async (config)=>{
    //     //await utils.create_tempdb(config)
    //     return config
    // })
    .then( async (config) => {
        await tap.test('should get all missing wim neighbors in district 10, reducing all'
                       , t =>{
                           utils.promise_wrapper(viewer,
                                                 _.assign({}
                                                          ,config.couchdb
                                                          ,{'view':views[0]
                                                            ,'startkey':[2007, 10]
                                                            ,'endkey':[2007,10,{}]
                                                           }))
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
        await tap.test('should get all missing wim neighbors in district 10, no reduce'
                       , t =>{
                           utils.promise_wrapper(viewer
                                                 ,_.assign({}
                                                           ,config.couchdb
                                                           ,{'view':views[0]
                                                             ,'startkey':[2007, 10,5]
                                                             ,'endkey':[2007,10,5,{}]
                                                             ,'reduce':false
                                                            }))
                               .then( docs =>{
                                   t.ok(docs.rows)
                                   t.equals(docs.rows.length,17)

                                   _.each(docs.rows,function(doc){
                                       t.same(doc.key,[2007,10,5])
                                   })
                                   return t.end()
                               })
                               .catch( e => {
                                   console.log('error',e)
                                   t.fail()
                               })
                       })
        await tap.test('should get all missing wim neighbors in district 10, no reduce, using key'
                       , t =>{
                           utils.promise_wrapper(viewer
                                                 ,_.assign({}
                                                           ,config.couchdb
                                                           ,{'view':views[0]
                                                             ,'key':[2007, 10,5]
                                                             ,'reduce':false
                                                            }))
                               .then( docs =>{
                                   t.ok(docs.rows)
                                   t.equals(docs.rows.length,17)
                                   _.each(docs.rows,function(doc){
                                       t.same(doc.key,[2007,10,5])
                                   });
                                   return t.end()
                               })
                               .catch( e => {
                                   console.log('error',e)
                                   t.fail()
                               })

                       })

        await tap.test('should get all missing wim neighbors in district 3, no reduce, using keys'
                       , t =>{
                           utils.promise_wrapper(viewer
                                                 ,_.assign({}
                                                           ,config.couchdb
                                                           ,{'doc':'doc1'
                                                             ,'view':views[0]
                                                             ,'keys':[[2007, 10,5],[2008,10,5]]
                                                             ,'reduce':false
                                                            }))
                               .then( docs =>{
                                   t.ok(docs.rows)
                                   t.equals(docs.rows.length,33)
                                   _.each(docs.rows,function(doc){
                                       t.match(doc.key[0],/200(7|8)/)
                                       t.equal(doc.key[1],10)
                                       t.equal(doc.key[2],5)
                                   })
                                   return t.end()
                               })
                               .catch( e => {
                                   console.log('error',e)
                                   t.fail()
                               })
                       })

        await tap.test('should get 10 missing wim neighbors in district 3, no reduce, using keys'
                       , t =>{
                           utils.promise_wrapper(viewer
                                                 ,_.assign({}
                                                           ,config.couchdb
                                                           ,{'doc':'doc1'
                                                             ,'view':views[0]
                                                             ,'keys':[[2007, 10,5],[2008,10,5]]
                                                             ,'limit':10
                                                             ,'reduce':false
                                                            }))
                               .then( docs =>{
                                   t.ok(docs.rows)
                                   t.equals(docs.rows.length,10)
                                   _.each(docs.rows,function(doc){
                                       t.match(doc.key[0],/200(7|8)/)
                                       t.equal(doc.key[1],10)
                                       t.equal(doc.key[2],5)
                                   })
                                   return t.end()
                               })
                               .catch( e => {
                                   console.log('error',e)
                                   t.fail()
                               })
                       })
        await tap.test('should get 1 missing wim neighbors in district 3, no reduce, using keys, descending'
                       , t =>{
                           utils.promise_wrapper(viewer
                                                 ,_.assign({}
                                                           ,config.couchdb
                                                           ,{'doc':'doc1'
                                                             ,'view':views[0]
                                                             ,'startkey':[2007,10,{}] // year, district, freeway
                                                             ,'limit':1
                                                             ,'descending':true
                                                             ,'reduce':false
                                                            }))
                               .then( docs =>{
                                   t.ok(docs.rows)
                                   t.equals(docs.rows.length,1)
                                   _.each(docs.rows,function(doc){
                                       t.match(doc.key[0],/2007/)
                                       t.equal(doc.key[1],10)
                                       t.equal(doc.key[2],152) // the last freeway in my testdb
                                   });
                                   return t.end()
                               })
                               .catch( e => {
                                   console.log('error',e)
                                   t.fail()
                               })
                       })
        await tap.test('should get 1 missing wim neighbors in district 3, no reduce, using keys, descending false'
                       , t =>{
                           utils.promise_wrapper(viewer
                                                 ,_.assign({}
                                                           ,config.couchdb
                                                           ,{'doc':'doc1'
                                                             ,'view':views[0]
                                                             ,'startkey':[2007,10,{}] // year, district, freeway
                                                             ,'limit':1
                                                             ,'descending':false
                                                             ,'reduce':false
                                                            }))
                               .then( docs =>{
                                   t.ok(docs.rows)
                                   t.equals(docs.rows.length,1)
                                   _.each(docs.rows,function(doc){
                                       t.match(doc.key[0],/2007|8/)
                                       t.equal(doc.key[1],10)
                                       t.equal(doc.key[2],4)
                                   });
                                   return t.end()
                               })
                               .catch( e => {
                                   console.log('error',e)
                                   t.fail()
                               })
                       })
        await tap.test('should get docs with include doc'
                       , t =>{
                           utils.promise_wrapper(viewer
                                                 ,_.assign({}
                                                           ,config.couchdb
                                                           ,{'view':views[0]
                                                             ,'key':[2007,10,5]
                                                             ,'reduce':false
                                                             ,'include_docs':true
                                                            }))
                               .then( docs =>{
                                   t.ok(docs.rows)
                                   t.equals(docs.rows.length,17)
                                   _.each(docs.rows,function(doc){
                                       t.same(doc.key,[2007,10,5])
                                       const docdoc = doc.doc
                                       t.ok(docdoc['2007'])
                                       t.ok(docdoc[2007]['properties'])
                                       t.ok(docdoc[2007]['properties'][0]['geojson'])
                                   });
                                   return t.end()
                               })
                               .catch( e => {
                                   console.log('error',e)
                                   t.fail()
                               })
                       })
    })

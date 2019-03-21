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
    })

    // it('should get all missing wim neighbors in district 3, no reduce, using keys'
    //   ,function(done){
    //        viewer(_.assign({}
    //                       ,config.couchdb
    //                       ,{'doc':'doc1'
    //                        ,'view':views[0]
    //                        ,'keys':[[2007, 3,5],[2008,3,5]]
    //                        ,'reduce':false
    //                        })
    //              ,function(err,docs){
    //                   should.not.exist(err)
    //                   docs.rows.should.have.property('length',82)
    //                   _.each(docs.rows,function(doc){
    //                       doc.key[0].should.match(/200(7|8)/)
    //                       doc.key[1].should.eql(3)
    //                       doc.key[2].should.eql(5)
    //                   });
    //                   return done()
    //               })
    //    })
    // it('should get 10 missing wim neighbors in district 3, no reduce, using keys'
    //   ,function(done){
    //        viewer(_.assign({}
    //                       ,config.couchdb
    //                       ,{'doc':'doc1'
    //                        ,'view':views[0]
    //                        ,'keys':[[2007, 3,5],[2008,3,5]]
    //                        ,'limit':10
    //                        ,'reduce':false
    //                        })
    //              ,function(err,docs){
    //                   should.not.exist(err)
    //                   docs.rows.should.have.property('length',10)
    //                   _.each(docs.rows,function(doc){
    //                       doc.key[0].should.match(/200(7|8)/)
    //                       doc.key[1].should.eql(3)
    //                       doc.key[2].should.eql(5)
    //                   });
    //                   return done()
    //               })
    //    })
    // it('should get 1 missing wim neighbors in district 3, no reduce, using keys, descending'
    //   ,function(done){
    //        viewer(_.assign({}
    //                       ,config.couchdb
    //                       ,{'doc':'doc1'
    //                        ,'view':views[0]
    //                        ,'startkey':[2007,3,{}] // year, district, freeway
    //                        ,'limit':1
    //                        ,'descending':true
    //                        ,'reduce':false
    //                        })
    //              ,function(err,docs){
    //                   should.not.exist(err)
    //                   docs.rows.should.have.property('length',1)
    //                   _.each(docs.rows,function(doc){
    //                       doc.key[0].should.match(/2007/)
    //                       doc.key[1].should.eql(3)
    //                       doc.key[2].should.eql(275) // the last freeway in my testdb
    //                   });
    //                   return done()
    //               })
    //    })
    // it('should get 1 missing wim neighbors in district 3, no reduce, using keys, descending false'
    //   ,function(done){
    //        viewer(_.assign({}
    //                       ,config.couchdb
    //                       ,{'doc':'doc1'
    //                        ,'view':views[0]
    //                        ,'startkey':[2007,3,{}] // year, district, freeway
    //                        ,'limit':1
    //                        ,'descending':false
    //                        ,'reduce':false
    //                        })
    //              ,function(err,docs){
    //                   should.not.exist(err)
    //                   docs.rows.should.have.property('length',1)
    //                   _.each(docs.rows,function(doc){
    //                       doc.key[0].should.match(/2007/)
    //                       doc.key[1].should.eql(4) // next one after 3 in my testdb
    //                       doc.key[2].should.eql(1) // the first freeway in d4 in my testdb
    //                   });
    //                   return done()
    //               })
    //    })
    // it('should get docs with include doc'
    //   ,function(done){
    //        viewer(_.assign({}
    //                       ,config.couchdb
    //                       ,{'view':views[0]
    //                        ,'key':[2007,3,5]
    //                        ,'reduce':false
    //                        ,'include_docs':true
    //                        })
    //              ,function(err,docs){
    //                   should.not.exist(err)
    //                   docs.rows.should.have.property('length',42)
    //                   _.each(docs.rows,function(doc){
    //                       doc.key.should.eql([2007,3,5])
    //                       var docdoc = doc.doc
    //                       docdoc.should.have.property('2007')
    //                       docdoc[2007].should.have.property('properties')
    //                       docdoc[2007]['properties'][0].should.have.property('geojson')
    //                   });
    //                   return done()
    //               })
    //    })

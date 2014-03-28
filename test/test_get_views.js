/* global require console process describe it */

var should = require('should')
var viewer = require('../.')
var path    = require('path')
var rootdir = path.normalize(__dirname)

var _ = require('lodash')
var superagent = require('superagent')
var config_okay = require('config_okay')

var views = ['_design/imputedchecks/_view/missing_wim_neighbors'
            ,'_design/vdsml/_view/mainline'
            ,'_design/properties/_view/segment_length_ml']


var config={}

function create_tempdb(cb){
    var date = new Date()
    // var test_db_unique = [config.couchdb.db,
    //                       date.getHours(),
    //                       date.getMinutes(),
    //                       date.getSeconds(),
    //                       date.getMilliseconds()].join('-')
    // config.couchdb.db = test_db_unique
    var cdb =
        [config.couchdb.url+':'+config.couchdb.port
        ,config.couchdb.db].join('/')

    superagent.put(cdb)
    .type('json')
    .auth(config.couchdb.auth.username
         ,config.couchdb.auth.password)
    .end(function(err,result){
        if(result.error){
            // do not delete if we didn't create
            config.delete_db=false
        }else{
            config.delete_db=true
        }
        cb()
    })
    return null
}



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



describe('query view 1',function(){


before(function(done){
    var config_file = rootdir+'/../test.config.json'

    config_okay(config_file,function(err,c){
        if(!c.couchdb.db){ throw new Error('need valid db defined in test.config.json')}
        config = c
        create_tempdb(done)
        return null
    })
    return null
})

after(function(done){

    var cdb =
        config.couchdb.url+':'+config.couchdb.port
             + '/'+ config.couchdb.db
    if(config.delete_db){
        superagent.del(cdb)
        .type('json')
        .auth(config.couchdb.auth.username
             ,config.couchdb.auth.password)
        .end(function(e,r){
            return done()
        })
        return null
    }else{
        console.log("not deleting what I didn't create:" + cdb)
        return done()
    }
})
    it('should get all missing wim neighbors in district 3, reducing all'
      ,function(done){
           viewer(_.assign({}
                          ,config.couchdb
                          ,{'view':views[0]
                           ,'startkey':[2007, 3]
                           ,'endkey':[2007,3,{}]
                           })
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.should.eql({"rows":[
                          {"key":null,"value":294}
                      ]})
                      return done()
                  })
       })
    it('should get all missing wim neighbors in district 3, no reduce'
      ,function(done){
           viewer(_.assign({}
                          ,config.couchdb
                          ,{'view':views[0]
                           ,'startkey':[2007, 3,5]
                           ,'endkey':[2007,3,5,{}]
                           ,'reduce':false
                           })
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.rows.should.have.property('length',42)
                      _.each(docs.rows,function(doc){
                          doc.key.should.eql([2007,3,5])
                      });
                      return done()
                  })
       })
    it('should get all missing wim neighbors in district 3, no reduce, using key'
      ,function(done){
           viewer(_.assign({}
                          ,config.couchdb
                          ,{'view':views[0]
                           ,'key':[2007, 3,5]
                           ,'reduce':false
                           })
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.rows.should.have.property('length',42)
                      _.each(docs.rows,function(doc){
                          doc.key.should.eql([2007,3,5])
                      });
                      return done()
                  })
       })
    it('should get all missing wim neighbors in district 3, no reduce, using keys'
      ,function(done){
           viewer(_.assign({}
                          ,config.couchdb
                          ,{'doc':'doc1'
                           ,'view':views[0]
                           ,'keys':[[2007, 3,5],[2008,3,5]]
                           ,'reduce':false
                           })
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.rows.should.have.property('length',82)
                      _.each(docs.rows,function(doc){
                          doc.key[0].should.match(/200(7|8)/)
                          doc.key[1].should.eql(3)
                          doc.key[2].should.eql(5)
                      });
                      return done()
                  })
       })
    it('should get 10 missing wim neighbors in district 3, no reduce, using keys'
      ,function(done){
           viewer(_.assign({}
                          ,config.couchdb
                          ,{'doc':'doc1'
                           ,'view':views[0]
                           ,'keys':[[2007, 3,5],[2008,3,5]]
                           ,'limit':10
                           ,'reduce':false
                           })
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.rows.should.have.property('length',10)
                      _.each(docs.rows,function(doc){
                          doc.key[0].should.match(/200(7|8)/)
                          doc.key[1].should.eql(3)
                          doc.key[2].should.eql(5)
                      });
                      return done()
                  })
       })
    it('should get 1 missing wim neighbors in district 3, no reduce, using keys, descending'
      ,function(done){
           viewer(_.assign({}
                          ,config.couchdb
                          ,{'doc':'doc1'
                           ,'view':views[0]
                           ,'startkey':[2007,3,{}] // year, district, freeway
                           ,'limit':1
                           ,'descending':true
                           ,'reduce':false
                           })
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.rows.should.have.property('length',1)
                      _.each(docs.rows,function(doc){
                          doc.key[0].should.match(/2007/)
                          doc.key[1].should.eql(3)
                          doc.key[2].should.eql(275) // the last freeway in my testdb
                      });
                      return done()
                  })
       })
    it('should get 1 missing wim neighbors in district 3, no reduce, using keys, descending false'
      ,function(done){
           viewer(_.assign({}
                          ,config.couchdb
                          ,{'doc':'doc1'
                           ,'view':views[0]
                           ,'startkey':[2007,3,{}] // year, district, freeway
                           ,'limit':1
                           ,'descending':false
                           ,'reduce':false
                           })
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.rows.should.have.property('length',1)
                      _.each(docs.rows,function(doc){
                          doc.key[0].should.match(/2007/)
                          doc.key[1].should.eql(4) // next one after 3 in my testdb
                          doc.key[2].should.eql(1) // the first freeway in d4 in my testdb
                      });
                      return done()
                  })
       })
    it('should get docs with include doc'
      ,function(done){
           viewer(_.assign({}
                          ,config.couchdb
                          ,{'view':views[0]
                           ,'key':[2007,3,5]
                           ,'reduce':false
                           ,'include_docs':true
                           })
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.rows.should.have.property('length',42)
                      _.each(docs.rows,function(doc){
                          doc.key.should.eql([2007,3,5])
                          var docdoc = doc.doc
                          docdoc.should.have.property('2007')
                          docdoc[2007].should.have.property('properties')
                          docdoc[2007]['properties'][0].should.have.property('geojson')
                      });
                      return done()
                  })
       })
})

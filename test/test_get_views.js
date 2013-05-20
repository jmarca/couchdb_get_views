/* global require console process describe it */

var should = require('should')
var viewer = require('../.')

var _ = require('lodash')
var superagent = require('superagent')

var env = process.env;
var cuser = env.COUCHDB_USER ;
var cpass = env.COUCHDB_PASS ;
var chost = env.COUCHDB_HOST || 'localhost';
var cport = env.COUCHDB_PORT || 5984;

var test_db = env.COUCHDB_TESTDB
if(!test_db){ throw new Error('need valide db defined in environment variable COUCHDB_TESTDB')}
var couch = 'http://'+chost+':'+cport+'/'+test_db
console.log('testing couchdb='+couch)

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


var views = ['_design/imputedchecks/_view/missing_wim_neighbors'
            ,'_design/vdsml/_view/mainline'
            ,'_design/properties/_view/segment_length_ml']

describe('query view 1',function(){

    it('should get all missing wim neighbors in district 3, reducing all'
      ,function(done){
           viewer({'db':test_db
                  ,'view':views[0]
                  ,'startkey':[2007, 3]
                  ,'endkey':[2007,3,{}]
                  }
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
           viewer({'db':test_db
                  ,'view':views[0]
                  ,'startkey':[2007, 3,5]
                  ,'endkey':[2007,3,5,{}]
                  ,'reduce':false
                  }
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
           viewer({'db':test_db
                  ,'view':views[0]
                  ,'key':[2007, 3,5]
                  ,'reduce':false
                  }
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
           viewer({'db':test_db
                  ,'doc':'doc1'
                  ,'view':views[0]
                  ,'keys':[[2007, 3,5],[2008,3,5]]
                  ,'reduce':false
                  }
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
           viewer({'db':test_db
                  ,'doc':'doc1'
                  ,'view':views[0]
                  ,'keys':[[2007, 3,5],[2008,3,5]]
                  ,'limit':10
                  ,'reduce':false
                  }
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
           viewer({'db':test_db
                  ,'doc':'doc1'
                  ,'view':views[0]
                  ,'startkey':[2007,3,{}] // year, district, freeway
                  ,'limit':1
                  ,'descending':true
                  ,'reduce':false
                  }
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
           viewer({'db':test_db
                  ,'doc':'doc1'
                  ,'view':views[0]
                  ,'startkey':[2007,3,{}] // year, district, freeway
                  ,'limit':1
                  ,'descending':false
                  ,'reduce':false
                  }
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
           viewer({'db':test_db
                  ,'view':views[0]
                  ,'key':[2007,3,5]
                  ,'reduce':false
                  ,'include_docs':true
                  }
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.rows.should.have.property('length',42)
                      _.each(docs.rows,function(doc){
                          doc.key.should.eql([2007,3,5])
                          doc.should.have.property('doc')
                          var docdoc = doc.doc
                          docdoc.should.have.property(2007)
                          docdoc[2007].should.have.property('properties')
                          docdoc[2007]['properties'][0].should.have.property('geojson')
                      });
                      return done()
                  })
       })
})

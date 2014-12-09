/* global require console process describe it */

var should = require('should')
var viewer = require('../.')
var path    = require('path')
var rootdir = path.normalize(__dirname)

//var _ = require('lodash')
var superagent = require('superagent')
var config_okay = require('config_okay')

var views = ['_design/imputedchecks/_view/missing_wim_neighbors'
            ,'_design/vdsml/_view/mainline'
            ,'_design/properties/_view/segment_length_ml']

var config_file = rootdir+'/../test.config.json'
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

        config_okay(config_file,function(err,c){
            if(!c.couchdb.db){ throw new Error('need valid db defined in test.config.json')}
            config = c
            //create_tempdb(done)
            //return null
            return done()
        })
        return null
    })

    after(function(done){

        var cdb =
            config.couchdb.url+':'+config.couchdb.port
                 + '/'+ config.couchdb.db
        // if(config.delete_db){
        //     superagent.del(cdb)
        //     .type('json')
        //     .auth(config.couchdb.auth.username
        //          ,config.couchdb.auth.password)
        //     .end(function(e,r){
        //         return done()
        //     })
        //     return null
        // }else{
            console.log("not deleting what I didn't create:" + cdb)
            return done()
        //        }
    })
    it('should get all missing wim neighbors in district 3, reducing all'
      ,function(done){
           viewer({'view':views[0]
                  ,'startkey':[2007, 3]
                  ,'endkey':[2007,3,{}]
                  ,'config_file': config_file

                  }
                 ,function(err,docs){
                      should.not.exist(err)
                      docs.should.eql({"rows":[
                          {"key":null,"value":294}
                      ]})
                      return done()
                  })

       })
})

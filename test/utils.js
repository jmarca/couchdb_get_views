const superagent = require('superagent')
async function create_tempdb(config){

    const date = new Date()
    const test_db_unique = [config.couchdb.db,
                          date.getHours(),
                          date.getMinutes(),
                          date.getSeconds(),
                          date.getMilliseconds()].join('-')
    config.couchdb.db = test_db_unique
    const cdb =
          [config.couchdb.host+':'+config.couchdb.port
           ,config.couchdb.db].join('/')


    const res = await superagent.put(cdb)
          .type('json')
          .auth(config.couchdb.auth.username
                ,config.couchdb.auth.password)
    return res
}


function delete_tempdb(config){

    var cdb =
        config.couchdb.url+':'+config.couchdb.port
             + '/'+ config.couchdb.db
    return superagent.del(cdb)
        .type('json')
        .auth(config.couchdb.auth.username
              ,config.couchdb.auth.password)
}

function promise_wrapper(fn,arg){
    return new Promise((resolve, reject)=>{
        fn(arg,function(e,r){
            if(e){
                console.log(e)
                return reject(e)
            }else{
                return resolve(r)
            }
        })
    })
}
exports.create_tempdb = create_tempdb
exports.delete_tempdb = delete_tempdb
exports.promise_wrapper = promise_wrapper

var superagent = require('superagent')
var config={}
var config_okay = require('config_okay')
var toQuery = require('couchdb_toQuery')

function couchdb_get_view(opts,cb){
    if(config.couchdb === undefined && opts.config_file !== undefined){
        return config_okay(opts.config_file,function(e,c){
            config.couchdb = c.couchdb
            return _couchdb_get_view(opts,cb)
        })
    }
    // otherwise, hopefully everything is defined in the opts file!
    return _couchdb_get_view(opts,cb)
}

/**
 * I'm not going to protect you from being an idiot.
 */
function _couchdb_get_view(opts,cb){
    var db = opts.db
    var view = opts.view || '_all_docs'
    var key = opts.key
    var keys = opts.keys
    var startkey = opts.startkey
    var endkey = opts.endkey
    var reduce = opts.reduce
    var group = opts.group
    var group_level = opts.group_level
    var include_docs = opts.include_docs
    var limit = opts.limit
    var descending = opts.descending

    var cdb = opts.couchdb || '127.0.0.1'
    var cport = opts.port  || 5984
    cdb = cdb+':'+cport
    if(! /http/.test(cdb)){
        cdb = 'http://'+cdb
    }
    var query = {}
    if(startkey !== undefined) query.startkey = startkey
    if(endkey !== undefined) query.endkey = endkey
    if(key !== undefined) query.key = key
    if(keys !== undefined) query.keys = keys
    if(reduce !== undefined) query.reduce = reduce
    if(group !== undefined) query.group = group
    if(group_level !== undefined) query.group_level = group_level
    if(include_docs !== undefined) query.include_docs=include_docs
    if(limit !== undefined) query.limit=limit
    if(descending !== undefined) query.descending=descending
    var qstring = toQuery(query)
    var uri = cdb +'/' + db + '/' + view + '?' + qstring
    console.log(uri)
    superagent
    .get(uri)
    .set('accept','application/json')
    .set('followRedirect',true)
    .end(function(err,res){
        if(err) return cb(err)
        return cb(null, res.body)
    })
}
module.exports=couchdb_get_view

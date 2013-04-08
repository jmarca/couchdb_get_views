var superagent = require('superagent')
var server = process.env.COUCHDB_HOST || 'localhost'
var port = process.env.COUCHDB_PORT || 5984
var couchdb = 'http://'+server+':'+port

var toQuery = require('couchdb_toQuery')

/**
 * I'm not going to protect you from being an idiot.
 */
function couchdb_get_view(opts,cb){
    var db = opts.db
    var view = opts.view || '_all_docs'
    var key = opts.key
    var keys = opts.keys
    var startkey = opts.startkey
    var endkey = opts.endkey
    var reduce = opts.reduce
    var include_docs = opts.include_docs
    var query = {}
    if(startkey !== undefined) query.startkey = startkey
    if(endkey !== undefined) query.endkey = endkey
    if(key !== undefined) query.key = key
    if(keys !== undefined) query.keys = keys
    if(reduce !== undefined) query.reduce = reduce
    if(include_docs !== undefined) query.include_docs=include_docs
    var qstring = toQuery(query)
    var uri = couchdb + '/' + view + '?' + qstring
    //console.log(uri)
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

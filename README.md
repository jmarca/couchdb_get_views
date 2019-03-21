[![Build Status](https://travis-ci.org/jmarca/couchdb_get_views.svg?branch=master)](https://travis-ci.org/jmarca/couchdb_get_views)

# Get views from CouchDB

This is a module to simplify getting view output from CouchDB.  Pass
in your view and query parameters, and it will return the response.
If you are an idiot and do something stupid, this module will not
care, and will pass on your request to CouchDB more or less as is.  So
don't go asking for keys and key and startkey and endkey all at once.

If you don't pass in a view in the options object, then the default
"view" is '_all_docs'.

# testing

in order to test this, you need to create a file called
`test.config.json` that contains

``` json
{
    "couchdb": {
        "url": "http://127.0.0.1",
        "port":5984,
        "auth":{"username":"user",
                "password":"your password here"
               },
        "db":"a_test_db"
    }
}
```

Where the variables are adjusted to reflect your local CouchDB
install.

You also need to change the permissions on test.config.json to be
`0600`.  On linux you just type `chmod 0600 test.config.json`

When running the test, a test db will be created using the name stored
in `couchdb.db`, and will have a semi-random string appended to it to
make sure that it is a unique db name, so nothing gets clobbered
accidentally while running tests.

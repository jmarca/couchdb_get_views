# Get views from CouchDB

This is a module to simplify getting view output from CouchDB.  Pass
in your view and query parameters, and it will return the response.
If you are an idiot and do something stupid, this module will not
care, and will pass on your request to CouchDB more or less as is.  So
don't go asking for keys and key and startkey and endkey all at once.

If you don't pass in a view in the options object, then the default
"view" is '_all_docs'.

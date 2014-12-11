require('./builder.js').build({
    "baseUrl": "../src/",
    "main": "dat/Controllers",
    "out": "../build/dat.min.js",
    "minify": false,
    "shortcut": "dat.Controllers",
    "paths": {}
});
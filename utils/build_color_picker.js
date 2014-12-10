require('./builder.js').build({
    "baseUrl": "../src/",
    "main": "dat/controllers/ColorController",
    "out": "../build/dat.color.picker.min.js",
    "minify": false,
    "shortcut": "dat.ColorPicker",
    "paths": {}
});
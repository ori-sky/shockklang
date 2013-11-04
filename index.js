var parser = require('./parser')
var fs = require('fs')

fs.readFile('test.shk', function(err, data)
{
    if(err) throw err
    console.log(parser.parse(data.toString()))
})

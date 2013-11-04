var parser = require('./parser')
var fs = require('fs')
var util = require('util')

var evaluate = function(o)
{
    return o;
}

fs.readFile('test.shk', function(err, data)
{
    if(err) throw err
    var parsed = parser.parse(data.toString())

    parsed.forEach(function(v, k, a)
    {
        console.log(evaluate(v))
    })
})

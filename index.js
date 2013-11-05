var parser = require('./parser')
var fs = require('fs')
var util = require('util')

var evaluate = function(o)
{
    if(typeof o !== 'object') return ' ' + o.toString()

    var s = '\n' + o[0]

    for(var i=1; i<o.length; ++i)
    {
        s += evaluate(o[i]).replace(/^/gm, '  ')
    }

    return s
}

var filename = process.argv[2] !== undefined ? process.argv[2] : 'test.shk'
fs.readFile(filename, function(err, data)
{
    if(err) throw err

    try
    {
        var parsed = parser.parse(data.toString())
    }
    catch(e)
    {
        console.log(e)
        return
    }

    parsed.forEach(function(v, k, a)
    {
        console.log(evaluate(v))
    })
})

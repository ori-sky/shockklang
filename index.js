var parser = require('./parser')
var fs = require('fs')
var util = require('util')

var state =
{
    vars: {}
}

var evaluate = function(obj)
{
    if(typeof obj !== 'object') return ' ' + obj.toString()

    switch(obj.type)
    {
        case '=':
            return (state.vars[obj.left.data] = evaluate(obj.right))
        case '+':
            return evaluate(obj.left) + evaluate(obj.right)
        case '-':
            return evaluate(obj.left) - evaluate(obj.right)
        case '*':
            return evaluate(obj.left) * evaluate(obj.right)
        case 'number':
        case 'string':
            return obj.data
        case 'identifier':
            return state.vars[obj.data]
        case 'function':
            return {type:'function', ins:obj.ins, outs:obj.outs, code:obj.code}
        case 'call':
            return 'call TODO'
        case 'infix':
            return 'infix TODO'
        default:
            if(obj.type !== undefined) console.log('type unhandled: ' + obj.type)
            else                       console.log('type missing: ' + obj[0])
            break
    }
}

var filename = process.argv[2] !== undefined ? process.argv[2] : 'test.shk'
fs.readFile(filename, function(err, data)
{
    if(err) throw err
    try
    {
        parser.parse(data.toString()).forEach(function(v, k, a)
        {
            console.log(evaluate(v))
        })
        console.log(state)
    }
    catch(e) { return console.log(e) }
})

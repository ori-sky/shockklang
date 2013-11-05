var parser = require('./parser')
var fs = require('fs')
var util = require('util')

var state =
{
    scope: [{}],
    top: function() { return this.scope[this.scope.length - 1] }
}

var evaluate = function(obj)
{
    if(typeof obj !== 'object') return ' ' + obj.toString()

    switch(obj.type)
    {
        case '=':
            return (state.top[obj.left.data] = evaluate(obj.right))
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
            return state.top[obj.data]
        case 'function':
            return {type:'function', ins:obj.ins, outs:obj.outs, code:obj.code}
        case 'call':
            if(state.top[obj.identifier] === undefined)
                throw new Error('identifier `' + obj.identifier + '` is undefined')

            if(state.top[obj.identifier].type !== 'function')
                throw new Error('identifier `' + obj.identifier + '` is not a function')

            if(obj.params.length < state.top[obj.identifier].ins.length)
                throw new Error('not enough params')

            if(obj.params.length > state.top[obj.identifier].ins.length)
                console.log('[warning] too many params, truncating')

            console.log('params: ' + util.inspect(obj.params))
            var params = 1
            return 'TODO: call `' + obj.identifier + '`'
        case 'infix':
            return 'TODO: infix'
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

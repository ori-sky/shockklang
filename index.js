var parser = require('./parser')
var fs = require('fs')
var util = require('util')

var state =
{
    scope: [{}],
    top: function() { return this.scope[this.scope.length - 1] }
}

var call = function(fn, paramlist)
{
    if(paramlist.length < fn.ins.length)
        throw new Error('not enough params')

    if(paramlist.length > fn.ins.length)
        console.log('\x1B[1m\x1B[33m-> warning <-\x1B[0m too many params, truncating')

    // evaluate each param in the param list
    var params = paramlist.map(function(v, k, a)
    {
        return evaluate(v)
    }).slice(0, fn.ins.length)

    var scope = {}

    // put inputs into function scope
    var i = 0
    for(var k in fn.ins)
    {
        scope[fn.ins[k].data] = params[i++]
    }

    // set initial values of outputs
    for(var k in fn.outs)
    {
        scope[fn.outs[k].identifier.data] = evaluate(fn.outs[k].initial)
    }

    state.scope.push(scope)

    // evaluate each statement in function code
    fn.code.forEach(function(v, k, a)
    {
        evaluate(v)
    })

    // get outputs from function scope
    var outputs = fn.outs.map(function(v, k, a)
    {
        return state.top()[v.identifier.data]
    })

    state.scope.pop()

    switch(outputs.length)
    {
        case 0: return undefined
        case 1: return outputs[0]
        default: return outputs
    }
}

var evaluate = function(obj)
{
    if(typeof obj !== 'object') return ' ' + obj.toString()

    switch(obj.type)
    {
        case '=':
            return (state.top()[obj.left.data] = evaluate(obj.right))
        case '+':
            return evaluate(obj.left) + evaluate(obj.right)
        case '-':
            return evaluate(obj.left) - evaluate(obj.right)
        case '*':
            return evaluate(obj.left) * evaluate(obj.right)
        case '&':
            return evaluate(obj.left) & evaluate(obj.right)
        case '|':
            return evaluate(obj.left) | evaluate(obj.right)
        case '<<':
            return evaluate(obj.left) << evaluate(obj.right)
        case '>>':
            return evaluate(obj.left) >> evaluate(obj.right)
        case 'number':
        case 'string':
            return obj.data
        case 'identifier':
            return state.top()[obj.data]
        case 'function':
            return {type:'function', ins:obj.ins, outs:obj.outs, code:obj.code}
        case 'call':
            var fn = state.top()[obj.identifier.data]

            if(fn === undefined)
                throw new Error('identifier `' + obj.identifier.data + '` is undefined')

            if(fn.type !== 'function')
                throw new Error('identifier `' + obj.identifier.data + '` is not a function')

            var result
            obj.paramlists.forEach(function(v, k, a)
            {
                result = call(fn, v)
            })
            return result
        // TODO: implement scope for blocks too
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
            console.log('' + evaluate(v))
        })
    }
    catch(e)
    {
        console.log(e)
        return
    }
})

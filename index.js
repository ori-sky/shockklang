var fs = require('fs')
var util = require('util')
var parser = require('./parser')

var Fn = function(ins, outs, code)
{
    this.type = 'function'
    this.ins = ins
    this.outs = outs
    this.code = code
    this.toString = function() { return '[shockklang Fn]' }
}

var BindingFn = function(fn)
{
    this.type = 'function'
    this.fn = fn
    this.is_binding = true
    this.toString = function() { return '[shockklang Fn]' }
}

var state =
{
    scope: [{}],
    top: function() { return this.scope[this.scope.length - 1] }
    // this should not be necessary...
}

var bind_function = function(fn, name)
{
    state.scope[0][name] = new BindingFn(fn)
}

var binding_call = function(fn, paramlist)
{
    if(paramlist.length < fn.length)
        throw new Error('not enough params')

    if(paramlist.length > fn.length)
        console.log('\x1B[1m\x1B[33m-> warning <-\x1B[0m too many params, truncating')

    // evaluate each param in the param list
    var params = paramlist.map(function(v, k, a)
    {
        return evaluate(v)
    }).slice(0, fn.length)

    var result = fn.apply(state.top(), params)
    return result !== undefined ? result : '[shockklang Undefined]'
}

var call = function(fn, paramlist)
{
    if(fn.is_binding) return binding_call(fn.fn, paramlist)

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
        fn.last_outputs === undefined
        ? scope[fn.outs[k].identifier.data] = evaluate(fn.outs[k].initial)
        : scope[fn.outs[k].identifier.data] = fn.last_outputs[fn.outs[k].identifier.data]
    }

    state.scope.push(scope)

    // evaluate each statement in function code
    fn.code.forEach(function(v, k, a)
    {
        evaluate(v)
    })

    // get outputs from function scope
    fn.last_outputs = {}
    var outputs = fn.outs.map(function(v, k, a)
    {
        fn.last_outputs[v.identifier.data] = state.top()[v.identifier.data]
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
    switch(typeof obj)
    {
        case 'object': break
        case 'undefined': return '[shockklang Undefined]'
        default: return obj.toString()
    }

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
            return new Fn(obj.ins, obj.outs, obj.code)
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
            fn.last_outputs = undefined
            delete fn.last_outputs

            return result !== undefined ? result : '[shockklang Undefined]'
        // TODO: implement scope for blocks too
        case 'infix':
            throw new Error('infix not implemented')
        default:
            if(obj.type !== undefined) console.log('type unhandled: ' + obj.type)
            else                       console.log('type missing: ' + obj[0])
            break
    }
}

// load and bind all function bindings
var bindings = require('./bindings')
for(var k in bindings) bind_function(bindings[k], k)

var filename = process.argv[2]
fs.readFile(filename, function(err, data)
{
    if(err) throw err
    try
    {
        parser.parse(data.toString()).forEach(function(v, k, a)
        {
            evaluate(v)
        })
    }
    catch(e)
    {
        console.log(e)
        return
    }
})

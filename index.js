/*
 *  Copyright 2013 David Farrell
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
}

state.top = function()
{
    return this.scope[this.scope.length - 1]
}

state.get = function(name)
{
    for(var i=this.scope.length-1; i>0; --i)
    {
        if(this.scope[i][name] !== undefined) return this.scope[i][name]
    }
    return this.scope[0][name]
}

state.find = function(name)
{
    for(var i=this.scope.length-1; i>0; --i)
    {
        if(this.scope[i][name] !== undefined) return this.scope[i]
    }
    return this.top()
}

state.bind_function = function(fn, name)
{
    state.scope[0][name] = new BindingFn(fn)
}

state.binding_call = function(fn, paramlist)
{
    if(paramlist === undefined) paramlist = []

    if(paramlist.length < fn.length - 1)
        throw new Error('not enough params')

    if(paramlist.length > fn.length - 1)
        console.log('\x1B[1m\x1B[33m-> warning <-\x1B[0m too many params, truncating')

    // evaluate each param in the param list
    var params = paramlist.map(function(v, k, a)
    {
        return state.evaluate(v)
    }).slice(0, fn.length - 1)

    var result = fn.apply(state.top(), [state].concat(params))
    return result !== undefined ? result : '[shockklang undefined]'
}

state.call = function(fn, paramlist)
{
    if(fn.is_binding) return state.binding_call(fn.fn, paramlist)

    if(paramlist === undefined) paramlist = []

    if(paramlist.length < fn.ins.length)
        throw new Error('not enough params')

    if(paramlist.length > fn.ins.length)
        console.log('\x1B[1m\x1B[33m-> warning <-\x1B[0m too many params, truncating')

    // evaluate each param in the param list
    var params = paramlist.map(function(v, k, a)
    {
        return state.evaluate(v)
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
        ? scope[fn.outs[k].identifier.data] = state.evaluate(fn.outs[k].initial)
        : scope[fn.outs[k].identifier.data] = fn.last_outputs[fn.outs[k].identifier.data]
    }

    state.scope.push(scope)

    // evaluate each statement in function code
    for(var i=0; i<fn.code.length; ++i)
    {
        state.evaluate(fn.code[i])

        if(state.function_ahead === true)
        {
            state.function_ahead = false
            break
        }
    }

    // get outputs from function scope
    fn.last_outputs = {}
    var outputs = fn.outs.map(function(v, k, a)
    {
        fn.last_outputs[v.identifier.data] = state.get(v.identifier.data)
        return state.get(v.identifier.data)
    })

    state.scope.pop()

    switch(outputs.length)
    {
        case 0: return undefined
        case 1: return outputs[0]
        default: return outputs
    }
}

state.set = function(name, value)
{
    if(name === undefined) return '[shockklang undefined]'

    switch(name.type)
    {
        case 'identifier':
            return (state.find()[name.data] = value)
        case 'PropertyAccess':
            var arr = state.evaluate(name.base)
            var index = state.evaluate(name.name)

            if(index === '') arr.data.push(value)
            else arr.data[index] = value

            return value
        default: console.log('assignable type unhandled: ' + name.type)
    }
}

state.evaluate = function(obj)
{
    switch(typeof obj)
    {
        case 'object': break
        case 'undefined': return '[shockklang undefined]'
        default: return obj.toString()
    }

    switch(obj.type)
    {
        case '=':
            return state.set(obj.left, state.evaluate(obj.right))
        case '+':
            return state.evaluate(obj.left) + state.evaluate(obj.right)
        case '-':
            return state.evaluate(obj.left) - state.evaluate(obj.right)
        case '*':
            return state.evaluate(obj.left) * state.evaluate(obj.right)
        case '&':
            return state.evaluate(obj.left) & state.evaluate(obj.right)
        case '|':
            return state.evaluate(obj.left) | state.evaluate(obj.right)
        case '<<':
            return state.evaluate(obj.left) << state.evaluate(obj.right)
        case '>>':
            return state.evaluate(obj.left) >> state.evaluate(obj.right)
        case '==':
            return state.evaluate(obj.left) == state.evaluate(obj.right)
        case 'number':
        case 'string':
            return obj.data
        case 'identifier':
            return state.get(obj.data)
        case 'array':
            return {type: 'array', data: obj.data.map(state.evaluate),
                    toString: function() { return '[' + this.data.join(', ') + ']' }
            }
        case 'PropertyAccess':
            var arr = state.evaluate(obj.base)
            var index = state.evaluate(obj.name)

            if(index === '') return arr.data[arr.data.length - 1]
            else return arr.data[index]
        case 'conditional':
            for(var i=0; i<obj.data.length; ++i)
            {
                var condition = obj.data[i].condition === undefined
                              ? true
                              : state.evaluate(obj.data[i].condition)

                if(condition !== undefined && condition !== null && condition !== 0 && condition !== false)
                {
                    var result
                    obj.data[i].code.forEach(function(v, k, a)
                    {
                        result = state.evaluate(v)
                    })
                    return result
                }
            }
            return undefined
        case 'function':
            return new Fn(obj.ins, obj.outs, obj.code)
        case 'call':
        case 'anoncall':
            if(obj.type === 'call') var fn = state.get(obj.identifier.data)
            else var fn = obj.fn

            if(fn === undefined)
                throw new Error('identifier `' + obj.identifier.data + '` is undefined')

            if(fn.type !== 'function')
                throw new Error('identifier `' + obj.identifier.data + '` is not a function')

            var result
            obj.paramlists.forEach(function(v, k, a)
            {
                result = state.call(fn, v)
            })
            fn.last_outputs = undefined
            delete fn.last_outputs

            return result !== undefined ? result : '[shockklang undefined]'
        case 'function_ahead':
            state.function_ahead = true
            return
        case 'infix':
            throw new Error('infix not implemented')
        default:
            if(obj.type !== undefined) console.log('type unhandled: ' + obj.type)
            else                       console.log('type missing: ' + util.inspect(obj[0]))
            break
        // TODO: implement scope for blocks too
    }
}

// load and bind all function bindings
var bindings = require('./bindings')
for(var k in bindings) state.bind_function(bindings[k], k)

var filename = process.argv[2]
fs.readFile(filename, function(err, data)
{
    if(err) throw err
    try
    {
        parser.parse(data.toString()).forEach(function(v, k, a)
        {
            state.evaluate(v)
        })
    }
    catch(e)
    {
        if(e.name === 'SyntaxError')
        {
            console.log(e.line + ':' + e.column + ' syntax error at `' + e.found + '`')
        }
        else throw e
    }
})

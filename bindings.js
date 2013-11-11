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

var util = require('util')
var net = require('net')

module.exports = {}
module.exports.Types = {}

module.exports.Types.SLUndefined = function()
{
    this.type = 'SLUndefined'
    this.toString = function() { return '[shockklang Undefined]' }

    this.binaryOp = function(obj, cb)
    {
        var result = cb(this.type, obj.type)
        if(typeof result === 'number') return new module.exports.Types.SLNumber(result)
        else return this
    }
}

module.exports.Types.SLString = function(data)
{
    this.type = 'SLString'
    this.data = data

    this.toString = function() { return this.data.toString() }

    this.binaryOp = function(obj, cb)
    {
        var result = cb(this.data, obj.toString())

        switch(typeof result)
        {
            case 'number':
                return new module.exports.Types.SLNumber(result)
            default:
                return new module.exports.Types.SLString(result)
        }
    }

    this.members = {}
    this.members.length = this.data.length
    this.members.split = function($, delimiter)
    {
        var mapped = this.toString().split(delimiter).map(function(v)
        {
            return new module.exports.Types.SLString(v)
        })
        return new module.exports.Types.SLArray(mapped)
    }.bind(this)
}

module.exports.Types.SLNumber = function(data)
{
    this.type = 'SLNumber'
    this.data = data

    this.toString = function() { return this.data.toString() }
    this.toNumber = function() { return this.data }

    this.binaryOp = function(obj, cb)
    {
        if(typeof obj.toNumber === 'function')
        {
            return new module.exports.Types.SLNumber(cb(this.data, obj.toNumber()))
        }
        else return new module.exports.Types.SLString(cb(this.toString(), obj.toString()))
    }

    this.members = {}
}

module.exports.Types.SLArray = function(data)
{
    this.type = 'SLArray'

    this.toString = function()
    {
        var mapped = []
        for(var i=0; i<this.members.length; ++i)
        {
            mapped.push(this.members[i].toString())
        }
        return '[' + mapped.join(', ') + ']'
    }

    this.push = function(obj)
    {
        this.members[this.members.length++] = obj
    }

    this.members = {}
    this.members.length = data.length

    for(var i=0; i<data.length; ++i) this.members[i] = data[i]
}

module.exports.print = function($, obj)
{
    console.log(obj.toString())
}

module.exports.Types.SLSocket = function(socket)
{
    this.type = 'SLSocket'
    this.socket = socket

    this.toString = function() { return '[shockklang SLSocket]' }

    this.binaryOp = function(obj, cb)
    {
        var result = cb(this.data, obj.toString())

        switch(typeof result)
        {
            case 'number':
                return new module.exports.Types.SLNumber(result)
            default:
                return new module.exports.Types.SLString(result)
        }
    }

    this.members = {}
    this.members.send = function($, data)
    {
        this.socket.write(data.toString())
    }.bind(this)
    this.members.onData = function($, cb)
    {
        this.socket.on('data', function(data)
        {
            $.call(cb, [new module.exports.Types.SLString(data.toString())])
        })
    }.bind(this)
}

module.exports.socket_connect = function($, port, host, cb)
{
    var socket = new net.Socket()
    socket.setNoDelay()
    socket.connect(port.toNumber(), host.toString(), function()
    {
        $.call(cb)
    })

    return new module.exports.Types.SLSocket(socket)
}

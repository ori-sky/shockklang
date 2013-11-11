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

module.exports = {
    Types: {
        SLUndefined: function() {
            this.type = 'SLUndefined'
            this.toString = function() { return '[shockklang Undefined]' }
        },
        SLString: function(data) {
            this.type = 'SLString'
            this.data = data

            this.toString = function() { return this.data }

            this.add = function(obj)
            {
                return new module.exports.Types.SLString(this.data + obj.toString())
            }

            this.equals = function(obj)
            {
                return new module.exports.Types.SLNumber(this.data === obj.toString())
            }

            this.members = {
                length: this.data.length
            }
        },
        SLNumber: function(data) {
            this.type = 'SLNumber'
            this.data = data

            this.toString = function() { return this.data.toString() }
            this.toNumber = function() { return this.data }

            this.add = function(obj)
            {
                if(typeof obj.toNumber === 'function')
                {
                    return new module.exports.Types.SLNumber(this.data + obj.toNumber())
                }
                else return new module.exports.Types.SLString(this.toString() + obj.toString())
            }

            this.equals = function(obj)
            {
                if(typeof obj.toNumber === 'function')
                {
                    var result = this.data === obj.toNumber() ? 1 : 0
                    return new module.exports.Types.SLNumber(result)
                }
                else
                {
                    var result = this.toString() === obj.toString()
                    return new module.exports.Types.SLNumber(result)
                }
            }

            this.members = {}
        },
        SLArray: function(data) {
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

            this.members = {
                length: data.length
            }
            for(var i=0; i<data.length; ++i) this.members[i] = data[i]
        }
    }
}

module.exports.print = function($, obj)
{
    console.log(obj.toString())
}

module.exports.string_get_word = function($, str, i)
{
    if(typeof str !== 'string') throw new Error('string_split(1): expected string')
    if(typeof i !== 'number') throw new Error('string_split(2): expected number')

    var words = str.split(' ')
    return words[i]
}

var SLSocket = function(socket)
{
    this.type = 'object'
    this.objtype = 'SLSocket'
    this.socket = socket
    this.toString = function() { return '[shockklang SLSocket]' }
}

module.exports.socket_connect = function($, port, host, callback)
{
    var socket = new net.Socket()
    socket.setNoDelay()
    socket.connect(port.toNumber(), host.toString(), function()
    {
        $.call(callback)
    })

    return new SLSocket(socket)
}

module.exports.socket_send = function($, socket, data)
{
    if(socket === undefined || socket.objtype !== 'SLSocket') throw new Error('socket_on_data: expected SLSocket')

    socket.socket.write(data.toString())
}

module.exports.socket_on_data = function($, socket, callback)
{
    if(socket === undefined || socket.objtype !== 'SLSocket') throw new Error('socket_on_data: expected SLSocket')

    socket.socket.on('data', function(data)
    {
        $.call(callback, [data.toString()])
    })
}

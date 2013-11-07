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

module.exports = {}

var net = require('net')

module.exports.print = function($, obj)
{
    console.log(obj.toString())
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
    socket.connect(port, host, function()
    {
        $.call(callback)
    })

    return new SLSocket(socket)
}

module.exports.socket_send = function($, socket, data)
{
    if(socket === undefined || socket.objtype !== 'SLSocket') throw new Error('socket_on_data: expected SLSocket')

    socket.socket.write(data)
}

module.exports.socket_on_data = function($, socket, callback)
{
    if(socket === undefined || socket.objtype !== 'SLSocket') throw new Error('socket_on_data: expected SLSocket')

    socket.socket.on('data', function(data)
    {
        $.call(callback, [data.toString()])
    })
}

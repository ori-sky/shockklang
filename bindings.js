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

module.exports.socket_on_data = function($, socket, callback)
{
    if(socket === undefined || socket.objtype !== 'SLSocket') throw new Error('socket_on_data: expected SLSocket')

    socket.socket.on('data', function(data)
    {
        $.call(callback, [data.toString()])
    })
}

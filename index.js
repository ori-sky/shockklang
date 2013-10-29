var util = require('util')
var lexxy = require('lexxy')
var lexer = new lexxy.Lexer()

lexer.type('comment',           /^``[^]*?``/)
lexer.type('bracket open',      /^\(/)
lexer.type('bracket close',     /^\)/)
lexer.type('square open',       /^\[/)
lexer.type('square close',      /^\]/)
lexer.type('brace open',        /^{/)
lexer.type('brace close',       /^}/)
lexer.type('in out',            /^=>/)
lexer.type('always',            /^\?\?/)
lexer.type('else',              /^\?!/)
lexer.type('if',                /^\?/)
lexer.type('jump behind',       /^<-/)
lexer.type('jump ahead',        /^->/)
lexer.type('call',              /^!/)
lexer.type('identifier',        /^([%^@#]?)([A-Za-z_]+)/)
lexer.type('operator',          /^([=+\-*\/])/)
lexer.type('comma',             /^,/)
lexer.type('number',            /^(\d+(\.\d+)?)/)
lexer.type('whitespace',        /^\s+/)
lexer.type('unknown',           /^([^])/)

var input = 'sum = (a => o=0) { %o += %a }\n'
input += '%result = 5 sum! 2 sum! 3\n'
input += '%result = sum(5, 2, 3)\n'

var tokens = lexer.lex(input)

tokens.forEach(function(token, i, a)
{
    switch(token.type.name)
    {
        case 'identifier':
            console.log(token.type.name + ': ' +
                        util.inspect(token.data[1]) + ' ' + util.inspect(token.data[2]))
            break
        case 'operator':
        case 'number':
        case 'unknown':
            console.log(token.type.name + ': ' +
                        util.inspect(token.data[1]))
            break
        default:
            console.log(token.type.name)
            break
    }
})

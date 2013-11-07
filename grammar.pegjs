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

{
    Op2 = function(type, left, right)
    {
        this.type = type
        this.left = left
        this.right = right
    }

    Data = function(type, data)
    {
        this.type = type
        this.data = data
    }

    Output = function(identifier, initial)
    {
        this.type = 'output'
        this.identifier = identifier
        this.initial = initial
    }

    Func = function(ins, outs, code)
    {
        this.type = 'function'
        this.ins = ins
        this.outs = outs
        this.code = code
    }

    If = function(condition, code)
    {
        this.type = 'if'
        this.condition = condition
        this.code = code
    }

    Call = function(identifier, paramlists)
    {
        this.type = 'call'
        this.identifier = identifier
        this.paramlists = paramlists
    }

    AnonCall = function(fn, paramlists)
    {
        this.type = 'anoncall'
        this.fn = fn
        this.paramlists = paramlists
    }

    Infix = function(infix, left, right)
    {
        this.type = 'infix'
        this.infix = infix
        this.left = left
        this.right = right
    }
}

start
    = statement*

statement
    = conditional
    / assignment
    / block

conditional
    = i:if elseifs:elseif* { return new Data('conditional', [i].concat(elseifs)) }

if
    = condition:assignment "?" code:block { return new If(condition, code.data) }
    / condition:assignment "?" code:statement { return new If(condition, [code]) }
    / ws* "??" code:block { return new If(undefined, code.data) }
    / ws* "??" code:statement { return new If(undefined, [code]) }

elseif
    = condition:assignment? "?!" code:block { return new If(condition, code.data) }
    / condition:assignment? "?!" code:statement { return new If(condition, [code]) }

block
    = ws* "{" ws* statements:statement* ws* "}" ws* { return new Data('block', statements) }

assignment
    = left:identifier "=" !"=" right:logical { return new Op2('=', left, right) }
    / left:identifier "+" ws* "=" right:logical { return new Op2('=', left, new Op2('+', left, right)) }
    / left:identifier "-" ws* "=" right:logical { return new Op2('=', left, new Op2('-', left, right)) }
    / left:identifier "*" ws* "=" right:logical { return new Op2('=', left, new Op2('*', left, right)) }
    / left:identifier "/" ws* "=" right:logical { return new Op2('=', left, new Op2('/', left, right)) }
    / left:identifier "%" ws* "=" right:logical { return new Op2('=', left, new Op2('%', left, right)) }
    / left:identifier "<<" ws* "=" right:logical { return new Op2('=', left, new Op2('<<', left, right)) }
    / left:identifier ">>" ws* "=" right:logical { return new Op2('=', left, new Op2('>>', left, right)) }
    / left:identifier "&" ws* "=" right:logical { return new Op2('=', left, new Op2('&', left, right)) }
    / left:identifier "^" ws* "=" right:logical { return new Op2('=', left, new Op2('^', left, right)) }
    / left:identifier "|" ws* "=" right:logical { return new Op2('=', left, new Op2('|', left, right)) }
    / logical

logical
    = left:bitwise "||" right:logical { return new Op2('||', left, right) }
    / left:bitwise "&&" right:logical { return new Op2('&&', left, right) }
    / bitwise

bitwise
    = left:equalitive "|" right:bitwise { return new Op2('|', left, right) }
    / left:equalitive "^" right:bitwise { return new Op2('^', left, right) }
    / left:equalitive "&" right:bitwise { return new Op2('&', left, right) }
    / equalitive

equalitive
    = left:comparative "==" right:equalitive { return new Op2('==', left, right) }
    / left:comparative "!=" right:equalitive { return new Op2('!=', left, right) }
    / comparative

comparative
    = left:shiftive "<=" right:comparative { return new Op2('<=', left, right) }
    / left:shiftive ">=" right:comparative { return new Op2('>=', left, right) }
    / left:shiftive "<" right:comparative { return new Op2('<', left, right) }
    / left:shiftive ">" right:comparative { return new Op2('>', left, right) }
    / shiftive

shiftive
    = left:additive "<<" right:shiftive { return new Op2('<<', left, right) }
    / left:additive ">>" right:shiftive { return new Op2('>>', left, right) }
    / additive

additive
    = left:multiplicative "+" right:additive { return new Op2('+', left, right) }
    / left:multiplicative "-" right:additive { return new Op2('-', left, right) }
    / multiplicative

multiplicative
    = left:infix "*" right:multiplicative { return new Op2('*', left, right) }
    / left:infix "/" right:multiplicative { return new Op2('/', left, right) }
    / left:infix "%" right:multiplicative { return new Op2('%', left, right) }
    / infix

infix
    = left:primary infix:identifier "!" right:infix { return new Infix(infix, left, right) }
    / primary

primary
    = call
    / function
    / identifier
    / string
    / number
    / ws* "(" assignment:assignment ")" ws* { return assignment }

call
    = identifier:identifier "(" paramlists:paramlists ")" ws* { return new Call(identifier, paramlists) }
    / fn:function "(" paramlists:paramlists ")" ws* { return new AnonCall(fn, paramlists) }

function
    = ws* "(" i:paramlist "=>" o:outputs ")" code:block { return new Func(i, o, code.data) }
    / ws* "(" i:paramlist "=>" o:outputs ")" code:statement { return new Func(i, o, [code]) }

paramlists
    = first:paramlist ";" rest:paramlists { return [first].concat(rest) }
    / first:paramlist { return [first] }

paramlist
    = first:assignment "," rest:paramlist { return [first].concat(rest) }
    / first:assignment { return [first] }
    / ws* { return [] }

outputs
    = first:output "," rest:outputs { return [first].concat(rest) }
    / first:output { return [first] }
    / ws* { return [] }

output
    = identifier:identifier ws* ":" ws* initial:assignment { return new Output(identifier, initial) }
    / identifier:identifier ws* { return new Output(identifier) }

identifier
    = ws* first:[A-Za-z_] rest:[A-Za-z_0-9]* ws* { return new Data('identifier', first + rest.join('')) }

string "string"
    = ws* "\"" chars:string_character* "\"" ws* { return new Data('string', chars.join('')) }

string_character
    = "\\b" { return '\b' }
    / "\\f" { return '\f' }
    / "\\n" { return '\n' }
    / "\\r" { return '\r' }
    / "\\t" { return '\t' }
    / "\\" char:. { return char }
    / !("\"") char:. { return char }

number
    = ws* "0b" digits:[01]+ ws*              { return new Data('number', parseInt(digits.join(''), 2)) }
    / ws* "0x" digits:[0-9A-F]+ ws*          { return new Data('number', parseInt(digits.join(''), 16)) }
    / ws* digits:[0-9A-F]+ "h" ws*           { return new Data('number', parseInt(digits.join(''), 16)) }
    / ws* before:[0-9]+ "." after:[0-9]+ ws* { return new Data('number', parseFloat(before.join('') + '.' + after.join(''))) }
    / ws* digits:[0-9]+ ws*                  { return new Data('number', parseInt(digits.join(''), 10)) }

ws
    = [ \t\r\n]
    / "``" (!"``" .)* "``"

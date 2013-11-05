start
    = statement*

statement
    = assignment
    / ws* "{" ws* statements:statement* ws* "}" ws* { return ['block'].concat(statements) }

assignment
    = left:identifier "=" right:additive { return ['=', left, right] }
    / additive

additive
    = left:multiplicative "+" right:additive { return ['+', left, right] }
    / left:multiplicative "-" right:additive { return ['-', left, right] }
    / multiplicative

multiplicative
    = left:comparative "*" right:multiplicative { return ['*', left, right] }
    / left:comparative "/" right:multiplicative { return ['/', left, right] }
    / comparative

comparative
    = left:infix "==" right:comparative { return ['==', left, right] }
    / left:infix "!=" right:comparative { return ['!=', left, right] }
    / infix

infix
    = left:primary infix:identifier "!" right:infix { return ['infix', left, infix, right] }
    / primary

primary
    = call
    / function
    / identifier
    / string
    / number
    / ws* "(" assignment:assignment ")" ws* { return assignment }

call
    = identifier:identifier "(" params:params ")" ws* { return ['call', identifier].concat(params) }

function
    = ws* "(" i:params "=>" o:outputs ")" s:statement { return ['function', ['inputs'].concat(i), ['outputs'].concat(o), s] }

params
    = first:assignment "," rest:params { return [first].concat(rest) }
    / first:assignment { return [first] }

outputs
    = first:output "," rest:outputs { return [first].concat(rest) }
    / first:output { return [first] }

output
    = identifier:identifier ws* ":" ws* initial:assignment { return ['output', identifier, initial] }

identifier
    = ws* first:[A-Za-z_] rest:[A-Za-z_0-9]* ws* { return ['identifier', first + rest.join('')] }

string
    = ws* "\"" chars:(!"\"" .)* "\"" ws* { return ['string', chars.map(function(v,k,a) { return v[1] }).join('')] }

number
    = ws* "0b" digits:[01]+ ws*              { return ['number', parseInt(digits.join(''), 2)] }
    / ws* "0x" digits:[0-9A-F]+ ws*          { return ['number', parseInt(digits.join(''), 16)] }
    / ws* digits:[0-9A-F]+ "h" ws*           { return ['number', parseInt(digits.join(''), 16)] }
    / ws* before:[0-9]+ "." after:[0-9]+ ws* { return ['number', parseFloat(before.join('') + '.' + after.join(''))] }
    / ws* digits:[0-9]+ ws*                  { return ['number', parseInt(digits.join(''), 10)] }

ws
    = [ \t\r\n]
    / "``" (!"``" .)* "``"

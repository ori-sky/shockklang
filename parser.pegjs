start
    = assignment*

assignment
    = left:identifier "=" right:additive { return ['=', left, right] }
    / additive

additive
    = left:multiplicative "+" right:additive { return ['+', left, right] }
    / left:multiplicative "-" right:additive { return ['-', left, right] }
    / multiplicative

multiplicative
    = left:primary "*" right:multiplicative { return ['*', left, right] }
    / primary

primary
    = identifier:identifier { return identifier }
    / integer:integer { return integer }
    / ws* "(" assignment:assignment ")" ws* { return assignment }

identifier
    = ws* first:[A-Za-z_] rest:[A-Za-z_0-9]* ws* { return ['identifier', first + rest.join('')] }

integer "integer"
    = ws* "0b" digits:[01]+ ws*     { return parseInt(digits.join(''), 2) }
    / ws* "0x" digits:[0-9A-F]+ ws* { return parseInt(digits.join(''), 16) }
    / ws* digits:[0-9A-F]+ "h" ws*  { return parseInt(digits.join(''), 16) }
    / ws* digits:[0-9]+ ws*         { return parseInt(digits.join(''), 10) }

ws
    = [ \t\r\n]
    / "``" (!"``" .)* "``"
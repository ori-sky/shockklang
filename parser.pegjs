/*
* Classic example grammar, which recognizes simple arithmetic expressions like
* "2*(3+4)". The parser generated from this grammar then computes their value.
*/

start
    = additive+

additive
    = left:multiplicative "+" right:additive { return left + right; }
    / multiplicative

multiplicative
    = left:primary "*" right:multiplicative { return left * right; }
    / primary

primary
    = ws* integer:integer ws* { return integer; }
    / ws* "(" additive:additive ")" ws* { return additive; }

integer "integer"
    = "0b" digits:[01]+ { return parseInt(digits.join(""), 2); }
    / "0x" digits:[0-9A-F]+ { return parseInt(digits.join(""), 16); }
    / digits:[0-9A-F]+ "h" { return parseInt(digits.join(""), 16); }
    / digits:[0-9]+ { return parseInt(digits.join(""), 10); }

ws
    = [ \t\r\n]
    / "``" (!"``" .)* "``"

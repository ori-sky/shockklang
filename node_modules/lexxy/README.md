# lexxy

lexxy is a simple lexer for Node.js.

## Usage

### Installation

```
$ npm install lexxy
```

### Example

##### index.js
```javascript
var lexxy = require('lexxy');
var lexer = new lexxy.Lexer();

// patterns for XML-style tags
lexer.type('OPENTAG', /<([^\/]+?)>/);
lexer.type('CLOSETAG', /<\/([^\/]+?)>/);

// pattern for assignments
lexer.type('ASSIGN', /(\w+?)\s+?=\s+(\w+?)/m);

// lex example string
var tokens = lexer.lex('<test>  number \n  =5</test>');

tokens.forEach(function(token, index, arr)
{
	console.log(token.type.name);

	switch(token.type.name)
	{
		case 'OPENTAG':
		case 'CLOSETAG':
			console.log('tag name: ' + token.data[1]);
			break;
		case 'ASSIGN':
			console.log('variable name: ' + token.data[1]);
			console.log('value: ' + token.data[2]);
			break;
	}
});
```

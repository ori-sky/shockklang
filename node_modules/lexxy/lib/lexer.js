module.exports = function()
{
	this.types = [];

	this.type = function(name, exp)
	{
		var type = new module.exports.TokenType(name, exp);
		this.types.push(type);
		return type;
	}
	
	this.lex = function(input)
	{
		var tokens = [];

		// loop from start of input to end of input
		for(var offset=0; offset<input.length;)
		{
			// pass remaining input to this.match
			var token = this.match(input.substr(offset));

			// if match found
			if(token)
			{
				// set token offset
				token.offset = offset;

				// add token to end of tokens array
				tokens.push(token);

				// increment offset by token length
				offset += token.data[0].length;
			}
			// else increment offset by one
			else ++offset;
		}

		// return tokens array
		return tokens;
	}

	this.match = function(input)
	{
		// loop for each token type
		for(var type in this.types)
		{
			// attempt to match input with the current pattern
			var match = input.match(this.types[type].exp);

			// if match found and at least one capture found
			if(match && match[1])
			{
				// return Token instance
				return new module.exports.Token(this.types[type], match);
			}
		}
	}
}

module.exports.TokenType = function(name, exp)
{
	this.name = name;
	this.exp = exp;
}

module.exports.Token = function(type, data)
{
	this.type = type;
	this.data = data;

	this.toString = function()
	{
		return this.type + ' ' + this.data;
	}
}

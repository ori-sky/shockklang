module.exports = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "assignment": parse_assignment,
        "additive": parse_additive,
        "multiplicative": parse_multiplicative,
        "primary": parse_primary,
        "identifier": parse_identifier,
        "integer": parse_integer,
        "ws": parse_ws
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = { offset: 0, line: 1, column: 1, seenCR: false };
      var reportFailures = 0;
      var rightmostFailuresPos = { offset: 0, line: 1, column: 1, seenCR: false };
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function clone(object) {
        var result = {};
        for (var key in object) {
          result[key] = object[key];
        }
        return result;
      }
      
      function advance(pos, n) {
        var endOffset = pos.offset + n;
        
        for (var offset = pos.offset; offset < endOffset; offset++) {
          var ch = input.charAt(offset);
          if (ch === "\n") {
            if (!pos.seenCR) { pos.line++; }
            pos.column = 1;
            pos.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            pos.line++;
            pos.column = 1;
            pos.seenCR = true;
          } else {
            pos.column++;
            pos.seenCR = false;
          }
        }
        
        pos.offset += n;
      }
      
      function matchFailed(failure) {
        if (pos.offset < rightmostFailuresPos.offset) {
          return;
        }
        
        if (pos.offset > rightmostFailuresPos.offset) {
          rightmostFailuresPos = clone(pos);
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var result0, result1;
        
        result0 = [];
        result1 = parse_assignment();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_assignment();
        }
        return result0;
      }
      
      function parse_assignment() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_identifier();
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 61) {
            result1 = "=";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"=\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_additive();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, left, right) { return v[left] = right })(pos0.offset, pos0.line, pos0.column, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          result0 = parse_additive();
        }
        return result0;
      }
      
      function parse_additive() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_multiplicative();
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 43) {
            result1 = "+";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"+\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_additive();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, left, right) { return parseInt(left) + right })(pos0.offset, pos0.line, pos0.column, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          pos0 = clone(pos);
          pos1 = clone(pos);
          result0 = parse_multiplicative();
          if (result0 !== null) {
            if (input.charCodeAt(pos.offset) === 45) {
              result1 = "-";
              advance(pos, 1);
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"-\"");
              }
            }
            if (result1 !== null) {
              result2 = parse_additive();
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
          if (result0 !== null) {
            result0 = (function(offset, line, column, left, right) { return left - right })(pos0.offset, pos0.line, pos0.column, result0[0], result0[2]);
          }
          if (result0 === null) {
            pos = clone(pos0);
          }
          if (result0 === null) {
            result0 = parse_multiplicative();
          }
        }
        return result0;
      }
      
      function parse_multiplicative() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_primary();
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 42) {
            result1 = "*";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"*\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_multiplicative();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, left, right) { return left * right })(pos0.offset, pos0.line, pos0.column, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          result0 = parse_primary();
        }
        return result0;
      }
      
      function parse_primary() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        pos0 = clone(pos);
        result0 = parse_identifier();
        if (result0 !== null) {
          result0 = (function(offset, line, column, identifier) { return v[identifier] })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          pos0 = clone(pos);
          result0 = parse_integer();
          if (result0 !== null) {
            result0 = (function(offset, line, column, integer) { return integer })(pos0.offset, pos0.line, pos0.column, result0);
          }
          if (result0 === null) {
            pos = clone(pos0);
          }
          if (result0 === null) {
            pos0 = clone(pos);
            pos1 = clone(pos);
            result0 = [];
            result1 = parse_ws();
            while (result1 !== null) {
              result0.push(result1);
              result1 = parse_ws();
            }
            if (result0 !== null) {
              if (input.charCodeAt(pos.offset) === 40) {
                result1 = "(";
                advance(pos, 1);
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\"(\"");
                }
              }
              if (result1 !== null) {
                result2 = parse_assignment();
                if (result2 !== null) {
                  if (input.charCodeAt(pos.offset) === 41) {
                    result3 = ")";
                    advance(pos, 1);
                  } else {
                    result3 = null;
                    if (reportFailures === 0) {
                      matchFailed("\")\"");
                    }
                  }
                  if (result3 !== null) {
                    result4 = [];
                    result5 = parse_ws();
                    while (result5 !== null) {
                      result4.push(result5);
                      result5 = parse_ws();
                    }
                    if (result4 !== null) {
                      result0 = [result0, result1, result2, result3, result4];
                    } else {
                      result0 = null;
                      pos = clone(pos1);
                    }
                  } else {
                    result0 = null;
                    pos = clone(pos1);
                  }
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
            if (result0 !== null) {
              result0 = (function(offset, line, column, assignment) { return assignment })(pos0.offset, pos0.line, pos0.column, result0[2]);
            }
            if (result0 === null) {
              pos = clone(pos0);
            }
          }
        }
        return result0;
      }
      
      function parse_identifier() {
        var result0, result1, result2, result3, result4;
        var pos0;
        
        pos0 = clone(pos);
        result0 = [];
        result1 = parse_ws();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_ws();
        }
        if (result0 !== null) {
          if (/^[A-Za-z_]/.test(input.charAt(pos.offset))) {
            result1 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[A-Za-z_]");
            }
          }
          if (result1 !== null) {
            result2 = [];
            if (/^[A-Za-z_0-9]/.test(input.charAt(pos.offset))) {
              result3 = input.charAt(pos.offset);
              advance(pos, 1);
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[A-Za-z_0-9]");
              }
            }
            while (result3 !== null) {
              result2.push(result3);
              if (/^[A-Za-z_0-9]/.test(input.charAt(pos.offset))) {
                result3 = input.charAt(pos.offset);
                advance(pos, 1);
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[A-Za-z_0-9]");
                }
              }
            }
            if (result2 !== null) {
              result3 = [];
              result4 = parse_ws();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse_ws();
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = clone(pos0);
              }
            } else {
              result0 = null;
              pos = clone(pos0);
            }
          } else {
            result0 = null;
            pos = clone(pos0);
          }
        } else {
          result0 = null;
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_integer() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = [];
        result1 = parse_ws();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_ws();
        }
        if (result0 !== null) {
          if (input.substr(pos.offset, 2) === "0b") {
            result1 = "0b";
            advance(pos, 2);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"0b\"");
            }
          }
          if (result1 !== null) {
            if (/^[01]/.test(input.charAt(pos.offset))) {
              result3 = input.charAt(pos.offset);
              advance(pos, 1);
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[01]");
              }
            }
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                if (/^[01]/.test(input.charAt(pos.offset))) {
                  result3 = input.charAt(pos.offset);
                  advance(pos, 1);
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("[01]");
                  }
                }
              }
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              result3 = [];
              result4 = parse_ws();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse_ws();
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, digits) { return parseInt(digits.join(""), 2) })(pos0.offset, pos0.line, pos0.column, result0[2]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        if (result0 === null) {
          pos0 = clone(pos);
          pos1 = clone(pos);
          result0 = [];
          result1 = parse_ws();
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_ws();
          }
          if (result0 !== null) {
            if (input.substr(pos.offset, 2) === "0x") {
              result1 = "0x";
              advance(pos, 2);
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"0x\"");
              }
            }
            if (result1 !== null) {
              if (/^[0-9A-F]/.test(input.charAt(pos.offset))) {
                result3 = input.charAt(pos.offset);
                advance(pos, 1);
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9A-F]");
                }
              }
              if (result3 !== null) {
                result2 = [];
                while (result3 !== null) {
                  result2.push(result3);
                  if (/^[0-9A-F]/.test(input.charAt(pos.offset))) {
                    result3 = input.charAt(pos.offset);
                    advance(pos, 1);
                  } else {
                    result3 = null;
                    if (reportFailures === 0) {
                      matchFailed("[0-9A-F]");
                    }
                  }
                }
              } else {
                result2 = null;
              }
              if (result2 !== null) {
                result3 = [];
                result4 = parse_ws();
                while (result4 !== null) {
                  result3.push(result4);
                  result4 = parse_ws();
                }
                if (result3 !== null) {
                  result0 = [result0, result1, result2, result3];
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
          if (result0 !== null) {
            result0 = (function(offset, line, column, digits) { return parseInt(digits.join(""), 16) })(pos0.offset, pos0.line, pos0.column, result0[2]);
          }
          if (result0 === null) {
            pos = clone(pos0);
          }
          if (result0 === null) {
            pos0 = clone(pos);
            pos1 = clone(pos);
            result0 = [];
            result1 = parse_ws();
            while (result1 !== null) {
              result0.push(result1);
              result1 = parse_ws();
            }
            if (result0 !== null) {
              if (/^[0-9A-F]/.test(input.charAt(pos.offset))) {
                result2 = input.charAt(pos.offset);
                advance(pos, 1);
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9A-F]");
                }
              }
              if (result2 !== null) {
                result1 = [];
                while (result2 !== null) {
                  result1.push(result2);
                  if (/^[0-9A-F]/.test(input.charAt(pos.offset))) {
                    result2 = input.charAt(pos.offset);
                    advance(pos, 1);
                  } else {
                    result2 = null;
                    if (reportFailures === 0) {
                      matchFailed("[0-9A-F]");
                    }
                  }
                }
              } else {
                result1 = null;
              }
              if (result1 !== null) {
                if (input.charCodeAt(pos.offset) === 104) {
                  result2 = "h";
                  advance(pos, 1);
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"h\"");
                  }
                }
                if (result2 !== null) {
                  result3 = [];
                  result4 = parse_ws();
                  while (result4 !== null) {
                    result3.push(result4);
                    result4 = parse_ws();
                  }
                  if (result3 !== null) {
                    result0 = [result0, result1, result2, result3];
                  } else {
                    result0 = null;
                    pos = clone(pos1);
                  }
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
            if (result0 !== null) {
              result0 = (function(offset, line, column, digits) { return parseInt(digits.join(""), 16) })(pos0.offset, pos0.line, pos0.column, result0[1]);
            }
            if (result0 === null) {
              pos = clone(pos0);
            }
            if (result0 === null) {
              pos0 = clone(pos);
              pos1 = clone(pos);
              result0 = [];
              result1 = parse_ws();
              while (result1 !== null) {
                result0.push(result1);
                result1 = parse_ws();
              }
              if (result0 !== null) {
                if (/^[0-9]/.test(input.charAt(pos.offset))) {
                  result2 = input.charAt(pos.offset);
                  advance(pos, 1);
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("[0-9]");
                  }
                }
                if (result2 !== null) {
                  result1 = [];
                  while (result2 !== null) {
                    result1.push(result2);
                    if (/^[0-9]/.test(input.charAt(pos.offset))) {
                      result2 = input.charAt(pos.offset);
                      advance(pos, 1);
                    } else {
                      result2 = null;
                      if (reportFailures === 0) {
                        matchFailed("[0-9]");
                      }
                    }
                  }
                } else {
                  result1 = null;
                }
                if (result1 !== null) {
                  result2 = [];
                  result3 = parse_ws();
                  while (result3 !== null) {
                    result2.push(result3);
                    result3 = parse_ws();
                  }
                  if (result2 !== null) {
                    result0 = [result0, result1, result2];
                  } else {
                    result0 = null;
                    pos = clone(pos1);
                  }
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
              if (result0 !== null) {
                result0 = (function(offset, line, column, digits) { return parseInt(digits.join(""), 10) })(pos0.offset, pos0.line, pos0.column, result0[1]);
              }
              if (result0 === null) {
                pos = clone(pos0);
              }
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("integer");
        }
        return result0;
      }
      
      function parse_ws() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        if (/^[ \t\r\n]/.test(input.charAt(pos.offset))) {
          result0 = input.charAt(pos.offset);
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t\\r\\n]");
          }
        }
        if (result0 === null) {
          pos0 = clone(pos);
          if (input.substr(pos.offset, 2) === "``") {
            result0 = "``";
            advance(pos, 2);
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"``\"");
            }
          }
          if (result0 !== null) {
            result1 = [];
            pos1 = clone(pos);
            pos2 = clone(pos);
            reportFailures++;
            if (input.substr(pos.offset, 2) === "``") {
              result2 = "``";
              advance(pos, 2);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"``\"");
              }
            }
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = clone(pos2);
            }
            if (result2 !== null) {
              if (input.length > pos.offset) {
                result3 = input.charAt(pos.offset);
                advance(pos, 1);
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("any character");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = clone(pos1);
              }
            } else {
              result2 = null;
              pos = clone(pos1);
            }
            while (result2 !== null) {
              result1.push(result2);
              pos1 = clone(pos);
              pos2 = clone(pos);
              reportFailures++;
              if (input.substr(pos.offset, 2) === "``") {
                result2 = "``";
                advance(pos, 2);
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"``\"");
                }
              }
              reportFailures--;
              if (result2 === null) {
                result2 = "";
              } else {
                result2 = null;
                pos = clone(pos2);
              }
              if (result2 !== null) {
                if (input.length > pos.offset) {
                  result3 = input.charAt(pos.offset);
                  advance(pos, 1);
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("any character");
                  }
                }
                if (result3 !== null) {
                  result2 = [result2, result3];
                } else {
                  result2 = null;
                  pos = clone(pos1);
                }
              } else {
                result2 = null;
                pos = clone(pos1);
              }
            }
            if (result1 !== null) {
              if (input.substr(pos.offset, 2) === "``") {
                result2 = "``";
                advance(pos, 2);
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"``\"");
                }
              }
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = clone(pos0);
              }
            } else {
              result0 = null;
              pos = clone(pos0);
            }
          } else {
            result0 = null;
            pos = clone(pos0);
          }
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      
      
          v = {}
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos.offset === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos.offset < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos.offset === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos.offset !== input.length) {
        var offset = Math.max(pos.offset, rightmostFailuresPos.offset);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = pos.offset > rightmostFailuresPos.offset ? pos : rightmostFailuresPos;
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();

/* 
  KITMAN Template Engine
  V1.0 - 2011-08-20
  Copyright (c) 2011 Uli Preuss
  
  based on the KITE
  Copyright (c) 2011 Andrew Fedoniouk
  http://code.google.com/p/kite/
  
  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software withoutput_buffer restriction, including
  withoutput_buffer limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 

  Usage / Examples
    
  JS/Json Data object:
  *   var data = {
  *     "header": "Article List",
  *     "articles": [ 
  *       { "num" : "76", "desc" : "Football Shirt" },
  *       { "num" : "20", "desc" : "Football Shorts" }
  *     ]
  *   };
  *

  Load and execute the template:
  * 
  *   kitman.run("#preview", data, true);
  *
  * or
  *   var newText = kitman.run("#preview", data); 
  *   document.getElementById('preview').innerHTML = newText;
  *

  *   kitman.currencyRegion = 'de';
  * 
  
  Simple String:
  * <h2>{{header}}</h2>
  * 
  
  Dynamic list generation: 
  * <ul>
  *   {{#articles}}
  *     <li>
  *       <span class="num">{{num}}</span>
  *       <span class="desc">{{desc}}</span>
  *      </li>
  *   {{/articles}}
  * </ul>
  *
  
  Multiplication: 
  * <p>{{price|*0.19}}</p>
  *
  
  Currency formatting: 
  * <p>{{price|EURO}}</p>
  *
  
  Multiplication and currency formatting: 
  * <p>{{price|*1.19|EURO}}<p> 
  * 
  
  Numeric date formatting (now timestamp):
  * {{.|DATE|dd.MM.yyyy}}          -> 20.08.2011
  * {{.|DATE|dd.MM.yy}}            -> 20.08.11
  * {{.|DATE|yyyy-MM-dd}}          -> 2011-08-20
  * {{.|DATE|yyyy-MM-dd HH:mm}}    -> 2011-08-20 11:23
  * {{.|DATE|yyyy-MM-dd HH:mm:ss}} -> 2011-08-20 11:29:22
  * {{.|DATE|MM/dd/yyyy hh:mm t}}  -> 08/20/2011 11:16 am
  * {{.|DATE|MM-yyyy hh:mmt}}      -> 08-2011 11:22am
  *
  
*/

/*jslint browser: true, sloppy: true, white: true, indent: 2 */

var kitman = {

	currencyRegion: 'usa',
	cache: {
	  originalTemplate: null,
	  compiledTemplate: null
	},
	templateElement: null,
	templateID: null,
	replace: null,

	run: function(template, data, replace) {

		var output_buffer = "",
			parts = [],
			context = null,
			context_index = 0,
			formatters = kitman.formatters || {};

		kitman.replace = replace || false;
		if (template.charAt(0) === "#") {
			kitman.templateElement = document.getElementById(template.substr(1));
			kitman.templateID = template.substr(1);
			
			if (!kitman.templateElement) {
				throw "Template element #" + kitman.templateElement + " not found";
			}
			template = kitman.templateElement.innerHTML;
			if (kitman.cache.originalTemplate === null) {
				kitman.cache.originalTemplate = template;
			}
		}

		function exec_range(from_index, to_index) {
			var i, el;
			for (i = from_index + 1; i < to_index;) {
				el = parts[i];
				if (typeof el === "function") {
					i += el();
				} else {
					output_buffer += el;
					++i;
				}
			}
		}

		function exec_block(data, from_index, to_index) {
			var saved_context = context,
				saved_index = context_index,
				nm;

			if (data instanceof Array) {
				nm = data.length;
				for (context_index = 0; context_index < nm; ++context_index) {
					context = data[context_index];
					exec_range(from_index, to_index);
				}
			} else {
				context = data;
				context_index = undefined;
				exec_range(from_index, to_index);
			}
			context = saved_context;
			context_index = saved_index;
		}

		// instantiate the template
		function exec(data) {
			output_buffer = "";
			exec_block(data instanceof Array ? ({
				"": data
			}) : data, -1, parts.length);
			return output_buffer;
		}

		// check if 'v' is either non-empty array or !!v === true
		function has_something(v) {
			if (!v) {
				return false;
			}
			if ((v instanceof Array) && v.length === 0) {
				return false;
			}
			return true;
		}

		function decl_block(name, from_index, to_index, done_index) {
			// returns block processing function
			return function() {
				var data = context[name];
				if (has_something(data)) {
					exec_block(data, from_index, to_index);
					return (done_index || to_index) - from_index;
				}
				return to_index - from_index;
			};
		}

		function decl_terminal(name) {
			var sec, frmf, frmfname, fmti = name.indexOf("|");
			if (fmti >= 0) {
				frmf = name.substr(fmti + 1);
				name = name.substr(0, fmti);
				if (frmf.substr(0, 1) === '*') {
					sec = frmf.substr(1);
					frmfname = 'SUM';
					frmf = frmfname;
				} else if (frmf.substr(0, 4) === 'DATE') {
					sec = frmf.substr(5);
					frmfname = 'DATE';
					frmf = frmfname;
				}
				frmf = formatters[frmf];
			}
			if (name === ".") {
				if (frmfname === 'DATE') {
					return function() {
						output_buffer += frmf(sec);
						return 1;
					};
				} else if (frmf) {
					return function() {
						output_buffer += frmf(context, context);
						return 1;
					};
				} else {
					return function() {
						if (context !== undefined) {
							output_buffer += context;
						}
						return 1;
					};
				}
			} else {
				if (frmfname === 'SUM') {
					return function() {
						output_buffer += frmf(context[name], sec);
						return 1;
					};
				} else if (frmf) {
					return function() {
						var v = context[name];
						output_buffer += frmf(v, context);
						return 1;
					};
				} else {
					return function() {
						var v = context[name];
						if (v !== undefined) {
							output_buffer += v;
						}
						return 1;
					};
				}
			}
		}

		function decl_range(from_index, to_index) {
			return function() {
				exec_range(from_index, to_index);
				return to_index - from_index + 1;
			};
		}

		function decl_condition(text, from_index, to_index, done_index) {
			// condition expression, compile into the function:
			var tfun = new Function("_", "at", "with(_) {return (" + text + ");}");
			return function() {
				if (tfun(context, context_index)) {
					exec_range(from_index, to_index); // <- if condition is true then execute code behind it: 
					return done_index - from_index;
				} // and jump to past else part.
				return to_index - from_index;
			}; // <- otherwise go to next instruction.
		}

		// build an array of [literal, directive, literal, directive, ...] 
		// where even elements are directive - stuff inside '{' '}'
		// and odd elements are literals that shall go to output_bufferput as they are
		function tokenize() {
			var pos, i, ic;
			for (pos = 0; pos < template.length;) {
				i = template.indexOf("{{", pos);
				if (i < 0) {
					break;
				}
				ic = template.indexOf("}}", i + 2);
				if (ic < 0) {
					break;
				}
				parts.push(template.substring(pos, i));
				parts.push(template.substring(i + 2, ic));
				pos = ic + 2;
			}
			parts.push(template.substr(pos));
		}

		function compile() {
			
			tokenize();
			
			// Replace all directives by correspondent compiled functions 
			// ("parametrised" closures in fact).
			var total_parts = parts.length; // total parts
			function scan_tail(start, et) { // scan {^} "else" directive, 'et' - expected tail  
				var pn, part;
				for (pn = start + 2; pn < total_parts; pn += 2) {
					part = parts[pn];
					switch (part.charAt(0)) {
					case "#":
						pn = scan_block(pn, part.substr(1));
						continue;
					case "?":
						pn = scan_condition(pn, part.substr(1));
						if (parts[pn] === "/?") {
							parts[pn] = "";
						} else {
							pn -= 2;
						}
						continue;
					case "/":
						parts[start] = decl_range(start, pn);
						if (part.substr(1) === et) {
							parts[pn] = "";
						}
						return pn;
					case "^":
						parts[start] = decl_range(start, pn);
						return pn;
					default:
						parts[pn] = decl_terminal(part);
						continue;
					}
				}
				return pn;
			}

			function scan_block(start, name) {
				for (var pn = start + 2; pn < total_parts; pn += 2) {
					var part = parts[pn];
					switch (part.charAt(0)) {
					case "#":
						pn = scan_block(pn, part.substr(1));
						continue;
					case "?":
						pn = scan_condition(pn, part.substr(1));
						if (parts[pn] === "/?") {
							parts[pn] = "";
						} else {
							pn -= 2;
						}
						continue;
					case "^":
						if (part.substr(1) === name) {
							var pos = pn;
							pn = scan_tail(pn, name);
							parts[start] = decl_block(name, start, pos, pn);
							return pn;
						}
						parts[start] = decl_block(name, start, pn, pn);
						return pn - 2;
					case "/":
						parts[start] = decl_block(name, start, pn);
						if (part.substr(1) != name) {
							return pn - 2;
						}
						parts[pn] = "";
						return pn;
					default:
						parts[pn] = decl_terminal(part);
						continue;
					}
				}
				return pn;
			}

			function scan_condition(start, expr) { // scan {?expr} directive 
				// jump over all directives
				for (var pn = start + 2; pn < total_parts; pn += 2) {
					var pos, part = parts[pn];
					switch (part.charAt(0)) {
					case "#":
						pn = scan_block(pn, part.substr(1));
						continue;
					case "?":
						pos = pn;
						pn = scan_condition(pn, part.substr(1)); // note: recursive call to handle chain of '?'s
						parts[start] = decl_condition(expr, start, pos, pn);
						return pn;
					case "^":
						if (part.substr(1) === "?") {
							pos = pn;
							pn = scan_tail(pn, "?");
							parts[start] = decl_condition(expr, start, pos, pn);
							return pn;
						}
						parts[start] = decl_condition(expr, start, pn, pn);
						return pn - 2;
					case "/":
						parts[start] = decl_condition(expr, start, pn, pn);
						if (part.substr(1) != "?") {
							return pn - 2;
						}
						parts[pn] = "";
						return pn;
					default:
						parts[pn] = decl_terminal(part);
						continue;
					}
				}
				return pn;
			}
			scan_block(-1, ""); // scan the sequence 
		}
		compile();

		// if no data provided just return compiled version for later use.
		if (data === undefined) {
			return function(data) {
				return exec(data);
			};
		}
		
		kitman.cache.compiledTemplate = exec(data);

		// execute the block
		if (replace === true) {
			kitman.templateElement.innerHTML = kitman.cache.compiledTemplate;
		} else {
			return kitman.cache.compiledTemplate;
		}

	},

	restore: function() {
		kitman.templateElement.innerHTML = kitman.cache.originalTemplate;
	},

	rerun: function() {
	  kitman.restore();
	  kitman.run('#' + kitman.templateID, data, kitman.replace);
		// kitman.templateElement.innerHTML = kitman.cache.compiledTemplate;
	},
	
	update: function(newData) {
	  data = newData || data;
	  kitman.restore();
	  kitman.run('#' + kitman.templateID, data, kitman.replace);
		// kitman.templateElement.innerHTML = kitman.cache.compiledTemplate;
	},

	formatters: {

		"DATE": function(format) {
			return kitman.tools.formatDate(format);
		},

		"EURO": function(value) {
			return kitman.tools.euroFormat(value);
		},

		"SUM": function(figure, factor) {
			var factor_parts = factor.split('|'),
				factor1 = factor_parts[0],
				figure1 = kitman.tools.currencyFormat(figure),
				factor2 = kitman.tools.currencyFormat(factor1),
				sum = figure1 * factor2;
			if (factor_parts[1] === 'EURO') {
				sum = kitman.tools.euroFormat(sum);
			} else if (factor_parts[1].length > 0) {
				sum = sum.toFixed(parseInt(factor_parts[1], 10));
			}
			return sum;
		}

	},

	tools: {

		"formatDate": function(format) {

			var date = new Date(),
				year = date.getFullYear(),
				month = date.getMonth() + 1,
				hours = date.getHours();

			if (!format) {
				format = "MM/dd/yyyy";
			}

			if (format.indexOf("yyyy") > -1) {
				format = format.replace("yyyy", year.toString());
			} else if (format.indexOf("yy") > -1) {
				format = format.replace("yy", year.toString().substr(2, 2));
			}
			format = format.replace("MM", kitman.tools.pad2(month.toString()));
			format = format.replace("dd", kitman.tools.pad2(date.getDate().toString()));
			if (format.indexOf("HH") > -1) {
				format = format.replace("HH", kitman.tools.pad2(hours.toString()));
			}
			if (format.indexOf("hh") > -1) {
				if (hours > 12) {
					hours -= 12;
				}
				if (hours === 0) {
					hours = 12;
				}
				format = format.replace("hh", kitman.tools.pad2(hours.toString()));
			}
			if (format.indexOf("mm") > -1) {
				format = format.replace("mm", kitman.tools.pad2(date.getMinutes().toString()));
			}
			if (format.indexOf("ss") > -1) {
				format = format.replace("ss", kitman.tools.pad2(date.getSeconds().toString()));
			}
			if (format.indexOf("t") > -1) {
				if (hours > 11) {
					format = format.replace("t", "pm");
				} else {
					format = format.replace("t", "am");
				}
			}
			return format;
		},

		"pad2": function(number) {
			return (number < 10 ? '0' : '') + number;
		},

		"euroFormat": function(amount) {
			amount = kitman.tools.currencyFormat(amount);
			amount = kitman.tools.commaFormat(amount);
			return amount + ' €';
		},

		"currencyFormat": function(amount) {
			var separator = ".",
				minus = '',
				i = parseFloat(amount);
			if (isNaN(i)) {
				i = 0.00;
			}
			if (i < 0) {
				minus = '-';
			}
			i = Math.abs(i);
			i = parseInt((i + 0.005) * 100, 10);
			i = i / 100;
			s = new String(i);
			if (s.indexOf(separator) < 0) {
				s += '.00';
			}
			if (s.indexOf(separator) === (s.length - 2)) {
				s += '0';
			}
			s = minus + s;

			return s;
		},

		"commaFormat": function(amount) {
			var minus = '',
				a = amount.split('.', 2),
				d = a[1],
				i = parseInt(a[0], 10),
				delimiter = ",",
				separator = ".",
				n, nn;

			if (kitman.currencyRegion !== 'usa') {
				delimiter = ".";
				separator = ",";
			}
			if (isNaN(i)) {
				return '';
			}
			if (i < 0) {
				minus = '-';
			}
			i = Math.abs(i);
			n = new String(i);
			a = [];
			while (n.length > 3) {
				nn = n.substr(n.length - 3);
				a.unshift(nn);
				n = n.substr(0, n.length - 3);
			}
			if (n.length > 0) {
				a.unshift(n);
			}
			n = a.join(delimiter);
			if (d.length < 1) {
				amount = n;
			} else {
				amount = n + separator + d;
			}
			amount = minus + amount;

			return amount;
		}

	}

};

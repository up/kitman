kitman.js
=======

Javascript Template Engine.


usage
------

HTML Example:

	<h2>{{header}}</h2>
	<p>Date: {{.|DATE|dd.MM.yyyy}}</p>
	<ul>
	  <li class="head">
	    <span class="num">In Stock</span>
	    <span class="desc">Description</span>
	    <span class="price">Price</span>
	    <span class="vat">VAT (19%)</span>
	    <span class="gross">Price (incl. VAT)</span>
	  </li>
	  {{#articles}}
	    <li>
	      <span class="num">{{num}}</span>
	      <span class="desc">{{desc}}</span>
	      <span class="price">{{price|EURO}}</span>
	      <span class="vat">{{price|*0.19|EURO}}</span>
	      <span class="gross">{{price|*1.19|EURO}}</span>
	    </li>
	  {{/articles}}
	</ul>
		
JS/Json Data object:

	var data1 = {
	  "header": "Article List 1",
	  "articles": [ 
	    { "num" : "76", "desc" : "Football Shirt", "price" : "42.01 €" },
	    { "num" : "20", "desc" : "Football Shorts", "price" : "16.80 €" },
	    { "num" : "4", "desc" : "Football Shoes", "price" : "84.02 €" },
	    { "num" : "1", "desc" : "Lionel Messi Football Kit 'Gold'", "price" : "840.34 €" }
	  ]
	};

	var data2 = {
	 "header": "Article List 2",
	 "articles": [ 
	    { "num" : "1", "desc" : "Football Shirt", "price" : "42.01 €" },
	    { "num" : "0", "desc" : "Football Shorts", "price" : "16.80 €" }
	 ]
	};
	
Load and execute the template:

	kitman.run("#preview", data, true);

or

	var newText = kitman.run("#preview", data); 
	document.getElementById('preview').innerHTML = newText;

Restore, Rerun and Update:

	kitman.restore();
	kitman.rerun();
	kitman.update(data1);
	kitman.update(data2);

National Language Support

Numbers, including currency, can have different representations. For example, the decimal separator, or radix character, is a dot (.) in some regions and a comma (,) in others, while the thousands separator can be a dot, comma, or even a space. 

Kitman supports two formats:

* 1,234.56 (US-Format - default)
* 1.234,56 (EU-Format - de, fr, ..)

	kitman.currencyRegion = 'de';

Simple String Replacement:

	<h2>{{header}}</h2>

Dynamic list generation:

	<ul>
	  {{#articles}}
	    <li>
	      <span class="num">{{num}}</span>
	      <span class="desc">{{desc}}</span>
	    </li>
	  {{/articles}}
	</ul>
	
Multiplication:

	<p>{{price|*0.19}}</p>

Currency formatting: 

	<p>{{price|EURO}}</p>

Multiplication and currency formatting: 

	<p>{{price|*1.19|EURO}}</p>

Numeric date formatting (now timestamp):

	{{.|DATE|dd.MM.yyyy}}          -> 20.08.2011
	{{.|DATE|dd.MM.yy}}            -> 20.08.11
	{{.|DATE|yyyy-MM-dd}}          -> 2011-08-20
	{{.|DATE|yyyy-MM-dd HH:mm}}    -> 2011-08-20 11:23
	{{.|DATE|yyyy-MM-dd HH:mm:ss}} -> 2011-08-20 11:23:22
	{{.|DATE|MM/dd/yyyy hh:mm t}}  -> 08/20/2011 11:23 am
	{{.|DATE|MM-yyyy hh:mmt}}      -> 08-2011 11:23am

	



> Copyright &copy; 2011 Uli Preuss

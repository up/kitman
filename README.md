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
	



> Copyright &copy; 2011 Uli Preuss

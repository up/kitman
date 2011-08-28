kitman.js
=======

Javascript Template Engine.


usage
------


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
		



> Copyright 2011 Uli Preuss

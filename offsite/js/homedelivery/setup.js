// Loads library properties. Called up after library js codes are initialized
/* 
	decimal_sep: character used as deciaml separtor, it defaults to '.' when omitted
	thousands_sep: char used as thousands separator, it defaults to ',' when omitted
	*/
	Number.prototype.toMoney = function(decimals, decimal_sep, thousands_sep)
	{ 
	   var n = this,
	   c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
	   d = decimal_sep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

	   /*
	   according to [http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
	   the fastest way to check for not defined parameter is to use typeof value === 'undefined' 
	   rather than doing value === undefined.
	   */   
	   t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, //if you don't want to use a thousands separator you can pass empty string as thousands_sep value

	   sign = (n < 0) ? '-' : '',

	   //extracting the absolute value of the integer part of the number and converting to string
	   i = parseInt(n = Math.abs(n).toFixed(c)) + '', 

	   j = ((j = i.length) > 3) ? j % 3 : 0; 
	   return "Rp. " + sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ''); 
	};
	
	Number.prototype.toThousands = function(decimals, decimal_sep, thousands_sep)
	{ 
	   var n = this,
	   c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
	   d = decimal_sep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

	   /*
	   according to [http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
	   the fastest way to check for not defined parameter is to use typeof value === 'undefined' 
	   rather than doing value === undefined.
	   */   
	   t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, //if you don't want to use a thousands separator you can pass empty string as thousands_sep value

	   sign = (n < 0) ? '-' : '',

	   //extracting the absolute value of the integer part of the number and converting to string
	   i = parseInt(n = Math.abs(n).toFixed(c)) + '', 

	   j = ((j = i.length) > 3) ? j % 3 : 0; 
	   return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ''); 
	};
	
	Date.daysBetween = function( date1, date2 ) {
	  //Get 1 day in milliseconds
	  var one_day=1000*60*60*24;

	  // Convert both dates to milliseconds
	  var date1_ms = date1.getTime();
	  var date2_ms = date2.getTime();

	  // Calculate the difference in milliseconds
	  var difference_ms = date2_ms - date1_ms;
	    
	  // Convert back to days and return
	  return Math.round(difference_ms/one_day); 
	};
	
	
	Handlebars.registerHelper('toMoney', function (value, options) {
	    if(value <= 1) return (1).toMoney();
	    else return value.toMoney();
	});
	
	Handlebars.registerHelper('toThousands', function (value, options) {
		return value.toThousands(0, '.', ',');
	});
	
	Handlebars.registerHelper('ordThousandsMoneyFmt', function (value, options) {
	    return value.toThousands(0, '.', ',');
	});
	
	Handlebars.registerHelper('deliveryType', function (value, options) {
	    return value > 1 ? 'Paid Delivery' : 'Free delivery'; 
	});
	
	Handlebars.registerHelper('getQty', function (deliveryItems, options) {
		return _.reduce(deliveryItems, function(memory, element){
		    return memory + element.quantity;
		}, 0);
	});
	
	Handlebars.registerHelper('toTimeString', function(value, options){
		if(!!value){
			return homedelivery.parseDate(value).toString();
		}
		return '';
	});
	
	Handlebars.registerHelper('toDateStringFormat', function (value, options) {
		retDate = homedelivery.parseDate(value);
		var monthVal = retDate.getMonth() + 1;
		monthVal = monthVal < 10 ?  '0'+monthVal : monthVal; //Pad '0' in the beginning
		var day = retDate.getDate();
		day = day < 10 ? '0'+day : day;  //Pad '0' in the beginning
		return retDate.getFullYear()+"-"+monthVal+"-"+day;
	});
	
	Handlebars.registerHelper('toTimeStringFormat', function (value, options) {
		retDate = homedelivery.parseDate(value);
		var minutesVal = retDate.getMinutes() < 10 ? '0'+ retDate.getMinutes() : retDate.getMinutes();
		var hoursVal = retDate.getHours() < 10 ? '0'+ retDate.getHours() : retDate.getHours();
		return hoursVal+":"+minutesVal;
	});
	
	Handlebars.registerHelper('toTimeStringFormat', function (value, options) {
		retDate = homedelivery.parseDate(value);
		var minutesVal = retDate.getMinutes() < 10 ? '0'+ retDate.getMinutes() : retDate.getMinutes();
		var hoursVal = retDate.getHours() < 10 ? '0'+ retDate.getHours() : retDate.getHours();
		return hoursVal+":"+minutesVal;
	});
	
	Handlebars.registerHelper('toDateTimeStringFormat', function (value, options) {
		retDate = homedelivery.parseDate(value);
		
		var monthVal = retDate.getMonth() + 1;
		monthVal = monthVal < 10 ?  '0'+monthVal : monthVal; //Pad '0' in the beginning
		var day = retDate.getDate();
		day = day < 10 ? '0'+day : day;  //Pad '0' in the beginning
		
		var minutesVal = retDate.getMinutes() < 10 ? '0'+ retDate.getMinutes() : retDate.getMinutes();
		var hoursVal = retDate.getHours() < 10 ? '0'+ retDate.getHours() : retDate.getHours();
		return retDate.getFullYear()+"-"+monthVal+"-"+day+ " " +hoursVal+":"+minutesVal;
	});
	
	Handlebars.registerHelper('separateWithWhiteSpace', function (value, options) {
		var retStr = '';
		for (var i=0; i < value.length; i++){
			retStr = retStr + value[i] + ', ';
		}
		
		//Remove the last two characters... (comma and whitespace)
		retStr = retStr.substring(0, retStr.length - 2);
		return retStr;
	});
	
	Handlebars.registerHelper('getTaxableAmount', function (value, options) {
		return (value / 1.1).toMoney(); //Return Same value as delivery fee
	});

	Handlebars.registerHelper('getTax', function (value, options) {
		if(typeof value === 'string'){
			return value + '%';
		}
		return '10%'; //Return constant value for Tax Percentage
	});

	Handlebars.registerHelper('getTaxAmount', function (value, options) {
		return (value * 0.1 / 1.1).toMoney();
	});
	
	Handlebars.registerHelper('loggedInUsername', function (value, options) {
		return loggedInUsername;
	});
	
	Handlebars.registerHelper('getCurrentDateAndTime', function (value, options) {
		retDate = new Date();
		var minutesVal = retDate.getMinutes() < 10 ? '0'+ retDate.getMinutes() : retDate.getMinutes();
		var hoursVal = retDate.getHours() < 10 ? '0'+ retDate.getHours() : retDate.getHours();
		
		return 'Time: ' + hoursVal+":"+minutesVal + ' Date: ' + retDate.dateFormat('d/m/Y');
	});
	
	Handlebars.registerHelper('paymentReceiptGetQuantityAndPrice', function (value, options) {
		return value.totalQuantity + 'X ' + value.orderItems[0].priceUnit;
	});
	
	Handlebars.registerHelper('checkCashPayment', function(value, options){
		if(typeof value === 'string' && value === 'Cash'){
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});
	
	Handlebars.registerHelper('checkDebitPayment', function(value, options){
		if(typeof value === 'string' && value === 'Debit'){
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});
	
	Handlebars.registerHelper('checkCreditPayment', function(value, options){
		if(typeof value === 'string' && value === 'Credit'){
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});
	
	Handlebars.registerHelper('checkIfValueIsSetAndIsString', function(value, options){
		if(!!value && typeof value === 'string'){
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});	

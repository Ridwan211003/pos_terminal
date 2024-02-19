Homedelivery.SearchTransaction = Backbone.Epoxy.Model.extend({
	
	initialize : function(){
	},
	
	defaults : {
		transactionNumber : '',
		transactionDate : ''
	},

	computeds : {
		validTransactionNumber : {
			deps : ['transactionNumber'],
			get : function(transactionNumber){
				return this.validateTransactionNumber(transactionNumber);
			}
		}
	},
	
	validateTransactionNumber : function(transactionNum){
		return !!transactionNum && transactionNum.length > 11;		
	}
	
});
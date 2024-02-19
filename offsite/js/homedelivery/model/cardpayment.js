Homedelivery.CardPayment = Backbone.Epoxy.Model.extend({
	initialize : function(){
	},
	
	defaults : {
		transactionAmount : 1.0,
		cardNum : '',
	},
	
	computeds : {
		
		cardNumLength : {
			deps : ['cardNum'],
			get : function(cardNum) {
				return !cardNum || cardNum.length == HDConstants.CARD_NUM_LENGTH;
			}
		},
		
		
		cardNumValid : {
			deps : ['cardNum'],
			get : function(cardNum){
				return !cardNum || /^\d+$/.test(cardNum);
			}
		},
		
		formComplete : {
			deps : ['transactionAmount', 'cardNum', 'cardNumLength', 'cardNumValid'],
			get : function(transactionAmount, approvalCode, bankId, cardNum, approvalCodeValid, bankIdValid, cardNumValid){
				return this.validateTransactionAmount() && this.validateCardNum()
			}
		},
	},
	
	validateTransactionAmount : function(){
		return !!this.get('transactionAmount');
	},
	
	validateCardNum : function(){
		return !!this.get('cardNum') && this.get('cardNumLength') && this.get('cardNumValid');
	},
	
	toParams : function(){
		return $.extend({}, this.toJSON(), {
			cardNum : this.get('cardNum').substring(0, 6) + 'xxxxxx' + this.get('cardNum').substring(11, 15)
		});
	}
});
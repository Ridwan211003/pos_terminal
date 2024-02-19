Homedelivery.Page3CardPaymentDialogView = Backbone.Epoxy.View.extend({
	tagName : 'div',
	className : 'cardPayment',
	templ : '#CardPaymentDialogTemplate',
	
	bindings : {
		'.approvalCode' : 'value:approvalCode, events:["keyup", "onchange"]',
		'.cardNum' : 'value:cardNum, events:["keyup", "onchange"]',
		
		'span.invalid.approvalCodeLength' : 'toggle:not(approvalCodeLength)',
		'span.invalid.cardNumLength' : 'toggle:not(cardNumLength)',
		
		'span.invalid.approvalCode.valid' : 'toggle:not(approvalCodeValid)',
		'span.invalid.cardNum.valid' : 'toggle:not(cardNumValid)',
	},
	
	initialize : function(options){
		_(this).bindAll('openDialog');
		this.deliveryFee = options.deliveryFee;
		this.model = new Homedelivery.CardPayment({transactionAmount : options.paymentAmount});
		
		var source = $(this.templ).html();
		var template = Handlebars.compile(source);
		this.$el.append(template({ paymentAmount : options.paymentAmount.toMoney() }));
		this.$el.dialog(this.settings);
		
		this.model.on('change:formComplete', this.formComplete, this);
	},
	
});

Homedelivery.Page3DebitPaymentDialogView = Homedelivery.Page3CardPaymentDialogView.extend({
	settings : hdSettings.debitPaymentDialog,
	openDialog : function(parentView){
		this.deliveryFee.paymentType = 'HD_DEBIT';
		this.deliveryFee.eftData = null;
		this.deliveryFee.cardNumber = '';
		$('.ui-dialog-buttonpane button:contains("Confirm Debit Payment")').button({ disabled : true });
		this.$el.data('view', this).data('parent', parentView).dialog('open');
	},
	
	confirmDebitPayment : function(parentView){
		this.deliveryFee.cardNumber = this.model.get('cardNum');
		parentView.createHdTransaction();
	},
	
	formComplete : function(model){
		$('.ui-dialog-buttonpane button:contains("Confirm Debit Payment")').button({ disabled : !model.get('formComplete') });
	}
});

Homedelivery.Page3EftPaymentDialogView = Homedelivery.Page3CardPaymentDialogView.extend({
	settings : hdSettings.eftPaymentDialog,
	render : function(paymentAmount){
		return this.$el;
	},
	
	openDialog : function(parentView){
		this.deliveryFee.paymentType = 'HD_CREDIT';
		this.deliveryFee.eftData = this.model;
		this.deliveryFee.cardNumber = '';
		$('.ui-dialog-buttonpane button:contains("Confirm EFT Payment")').button({ disabled : true });
		this.$el.data('view', this).data('parent', parentView).dialog('open');
		
	},
	
	confirmEftPayment : function(){
		this.deliveryFee.cardNumber = this.model.get('cardNum');
		parent.createHdTransaction();
	},
	
	formComplete : function(model){
		$('.ui-dialog-buttonpane button:contains("Confirm EFT Payment")').button({ disabled : !model.get('formComplete') });
	}
});
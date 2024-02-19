Homedelivery.Page3DeliveryFeeView = Backbone.View.extend({
	el : '#deliveryFeeContainer',
	
	initialize : function(){
		_(this).bindAll('render', 'createHdTransaction', 'completeForm', 'updatePostalCode', 'displayDeliveryFee', 
				'resetPostalCode', 'cashPayment', 'eftPayment', 'debitPayment', 'saveHdTransaction', 'resetToCash',
				'updateDeliveryType', 'resetDeliveryType');
		this.model = new Homedelivery.HdDeliveryFee();
		
		this.on('complete:form', this.completeForm, this);
		this.on('update:postalCode', this.updatePostalCode, this);
		this.on('reset:postalCode', this.resetPostalCode, this);
		
		this.on('update:deliveryType', this.updateDeliveryType, this);
		this.on('reset:deliveryType', this.resetDeliveryType, this);
		
		this.transactionAmount = 0.0;
		this.itemCodeProducts = [];
	},

	events : {
		'click #saveButton' : 'saveHdTransaction',
		'click #cashPaymentButton' : 'cashPayment',
		'click #eftPaymentButton' : 'eftPayment',
		'click #debitPaymentButton' : 'debitPayment'
	},
	
	render : function(){
		this.$('.transactionAmount').text(this.transactionAmount);
		this.$('#saveButton').hide();
		this.$('#paymentButtonsContainer').hide();
		this.$el.show();
	},
	
	updateTransactionAmount: function(transactionAmount){
		this.transactionAmount = transactionAmount;
		this.$('.transactionAmount').text(transactionAmount.toMoney());
	},
	
	createHdTransaction : function(cardNumber){
		this.trigger('createHdTransaction');		
	},
	
	resetToCash : function(){
		this.model.paymentType = 'HD_CASH';
		this.model.eftData = null;
		this.model.cardNumber = '';
	},
	
	saveHdTransaction : function(){
		this.resetToCash();
		this.createHdTransaction();
	},
	
	eftPayment : function(){
		eftPaymentDialog = new Homedelivery.Page3EftPaymentDialogView({
			paymentAmount : this.model.getPaymentAmount(),
			deliveryFee : this.model
		});
		eftPaymentDialog.openDialog(this);
	},
	
	cashPayment : function(){
		this.resetToCash();
		cashPaymentDialog = new Homedelivery.Page3CashPaymentDialogView({ model : this.model });
		cashPaymentDialog.openDialog(this);
	},
	
	debitPayment : function(){
		debitPaymentDialog = new Homedelivery.Page3DebitPaymentDialogView({
			paymentAmount : this.model.getPaymentAmount(),
			deliveryFee : this.model
		});
		debitPaymentDialog.openDialog(this);
	},
	
//  ----------------------------------------------------
// | @author cyra tanglay								|
// | if the user filled up all the necessary			|
// | information in the installation/delivery form      |
// | if the delivery type is ac installation 			|
// | only cash payment button is visible                |
// | else if the delivery type is normal delivery       |
// | cash payment, eft payment & debit payment buttons  |
// | are visible                                        |
//  ----------------------------------------------------
	completeForm : function(isComplete, deliveryType){
		this.$('#saveButton').hide();
		this.$('#paymentButtonsContainer').hide();
		this.$('#cashPaymentButton').hide();
		this.$('#eftPaymentButton').hide();
		this.$('#debitPaymentButton').hide(); 
		if(this.model.getPriceUnit() == 1.0){
			this.$('#saveButton').toggle(!!isComplete);	
		} else {
			var acInstallation = (deliveryType == "AC_INSTALLATION"); 
			this.$('#paymentButtonsContainer').toggle(!!isComplete);
			this.$('#cashPaymentButton').toggle(!acInstallation);
			this.$('#eftPaymentButton').toggle(!acInstallation);
			this.$('#debitPaymentButton').toggle(!acInstallation);
			
			if(acInstallation) {
				this.$('#saveButton').toggle(!!isComplete);
			}
		}
	},
	
	resetPostalCode : function(){
		this.itemCodeProduct = null;
		this.$('#deliveryFeeComputed').text('');
		this.complete = false;
		this.trigger('complete:deliveryFee', this.complete);
	},
	
	updatePostalCode : function(transactionAmount, model, deliveryType){
		this.transactionAmount = transactionAmount;
		view = this;
		ajax.getPostalCodeAndProduct({
			province : model.get('province'),
			city : model.get('city'),
			area : model.get('area'),
			subArea : model.get('subArea')
		}, function(data){
			view.itemCodeProducts = data;
			view.displayDeliveryFee(transactionAmount, model, deliveryType);
		});
	},
	
	updateDeliveryType : function(deliveryType) {
		if (model.get('deliveryType')) {
			if(deliveryType == "AC Installation") {
				this.$('#paymentButtonsContainer').show();
				this.$('#cashPaymentButton').show();
				this.$('#eftPaymentButton').hide();
				this.$('#debitPaymentButton').hide();
				this.updatePostalCode(1, model, deliveryType);
			} else {
				this.$('#paymentButtonsContainer').toggle(!!isComplete);
				this.$('#cashPaymentButton').show();
				this.$('#eftPaymentButton').show();
				this.$('#debitPaymentButton').show();
				this.updatePostalCode(1, model, deliveryType);
			}
		}
	}, 
	
	resetDeliveryType : function() {
		this.complete = false;
		this.trigger('complete:deliveryFee', this.complete);
	},
	
	displayDeliveryFee : function(transactionAmount, model, deliveryType){
		this.$('.transactionAmount').text(transactionAmount.toMoney());
		this.itemCodeProduct = homedelivery.getDistanceItemCodeCheckByTransactionAmount(this.itemCodeProducts, this.transactionAmount);
		this.model.set(this.itemCodeProduct);
		if(!!this.itemCodeProduct){
			this.$('#deliveryFeeComputed').text(homedelivery.getDeliveryFeeDisplay(this.itemCodeProduct, deliveryType));
			this.complete = true;
			this.trigger('complete:deliveryFee', this.complete);
		} else {
			this.$('#deliveryFeeComputed').text('CAN NOT FIND PRICE FOR THIS LOCATION ' + 
				model.get('province') + ' ' + model.get('city') + ' ' + model.get('area') + ' ' + model.get('subArea'));
			this.complete = false;
			this.trigger('complete:deliveryFee', this.complete);
		}
	}
});
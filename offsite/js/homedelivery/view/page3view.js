Homedelivery.Page3View = Backbone.View.extend({
	el: '#page3Container',
	events : {
		'click #page3BackBtn' : 'page3Back',
	},
	initialize : function(){
		_(this).bindAll('page3Back', 'createHdTransaction', 'render', 
				'setDeliveryItemsView', 'completeForm', 'clear', 'updateHomePostalCode', 
				'updatePostalCode', 'updateDeliveryType', 'showUp');
		this.deliveryTypeView = new Homedelivery.Page3DeliveryTypeInformationView({el : '#deliveryTypeContainer'});
		this.customerView = new Homedelivery.Page3ProfileAddressView({el : '#customerProfileAddressContainer'});
		this.receiverView = new Homedelivery.Page3ProfileAddressView({el : '#receiverProfileAddressContainer'});
		this.deliveryDateView = new Homedelivery.DeliveryDateView({ el : '#deliveryDateContainer' } );
		
		this.sameDeliveryAddressView = new Homedelivery.Page3SameDeliveryView();
		this.sameDeliveryAddressView.on('toggle:sameDeliveryAddress', this.toggleDeliveryAddress, this);

		this.deliveryFeeView = new Homedelivery.Page3DeliveryFeeView();
		this.deliveryFeeView.on('complete:deliveryFee', this.completeForm, this);		
		this.deliveryFeeView.on('createHdTransaction', this.createHdTransaction, this);
		
		this.deliveryDateView.on('complete:deliveryDate', this.completeForm, this);
		
		this.deliveryTypeView.on('complete:deliveryTypeInfo', this.completeForm, this);
		this.deliveryTypeView.on('update:deliveryType', this.updateDeliveryType, this);
		
		this.customerView.on('update:postalCode', this.updateHomePostalCode, this);
		this.customerView.on('complete:profileAddress', this.completeForm, this);

		this.receiverView.on('update:postalCode', this.updatePostalCode, this);
		this.receiverView.on('complete:profileAddress', this.completeForm, this);		
		
		this.sameDeliveryAdd = true;
		this.$el.hide();
	},
	
	page3Back : function(){
		mediator.trigger('page3:back', this.$el);
	},
	
	createHdTransaction : function(){
		receiverViewParam = !!this.sameDeliveryAdd ? this.customerView : this.receiverView; 
		page3eventmediator.trigger('page3:save', this, this.deliveryDateView.model.get('deliveryDate'),
				this.customerView, receiverViewParam, this.deliveryItemsView, this.deliveryFeeView, this.deliveryTypeView.model.get('deliveryType'));
	},
	setTransactionAmount : function(amount){
		this.transactionAmount = amount;
		this.deliveryFeeView.updateTransactionAmount(amount);
		this.receiverView.addressView.changePostalCode();
	},
	
	setDeliveryItemsView : function(deliveryItemsView){
		this.deliveryItemsView = deliveryItemsView;
	},
	
	render : function(){
		this.deliveryTypeView.render();
		this.customerView.render();
		this.receiverView.render();
		this.receiverView.$el.hide();
		this.sameDeliveryAddressView.render();
		this.deliveryFeeView.render();
		this.deliveryDateView.render(this.deliveryTypeView.model.get('deliveryType'));
		this.$el.hide();
	},
	
	completeForm : function(){
		deliveryType = this.deliveryTypeView.model.get('deliveryType');
		completed = !!this.customerView.completed && !!this.deliveryDateView.complete && !!this.deliveryFeeView.complete
		            && !!this.deliveryTypeView.completed; 
		if(!this.sameDeliveryAdd){
			completed = completed && !!this.receiverView.completed;
		}
		this.deliveryDateView.render(this.deliveryTypeView.model.get('deliveryType'));
		this.deliveryFeeView.trigger('complete:form', completed, deliveryType);
	},
	
	toggleDeliveryAddress : function(isSameDeliveryAdd){
		this.sameDeliveryAdd = isSameDeliveryAdd;
		this.completeForm();
		this.showUp();
		this.receiverView.$el.toggle(!isSameDeliveryAdd);
	},
	
	clear : function(){
		this.deliveryTypeView.clear();
		this.customerView.clear();
		this.receiverView.clear();
		this.deliveryDateView.clear();
		if(this.deliveryItemsView){
			this.deliveryItemsView.clear();
		}
	},
	
	updateHomePostalCode : function(model){
		if(this.sameDeliveryAdd){
			this.updatePostalCode(model);
		}
	},
	
	updatePostalCode : function(model){
		if(!!model.get('postalCode')){
			this.deliveryFeeView.trigger('update:postalCode', this.transactionAmount, model, this.deliveryTypeView.model.get('deliveryType'));			
		}
		else {
			this.deliveryFeeView.trigger('reset:postalCode');
		}
	},
	
	updateDeliveryType : function(model) {
		deliveryType = this.deliveryTypeView.model.get('deliveryType');
		if(!!deliveryType) {
			this.deliveryFeeView.trigger('update:deliveryType', deliveryType);
		} else {
			this.deliveryFeeView.trigger('reset:deliveryType');
		}
	},
	
	showUp : function(addedIds){
		if(this.sameDeliveryAdd){
			this.customerView.addressView.changePostalCode();
		} else {
			this.receiverView.addressView.changePostalCode();
		}
		this.deliveryDateView.render(this.deliveryTypeView.model.get('deliveryType'));
		this.customerView
		this.renderCustomerData(addedIds);
		this.$el.show();
	},
	
	renderCustomerData : function(addedIds){
//		this.deliveryTypeView.render();
		
		if (typeof addedIds != "undefined") {
			if(addedIds.length == 1) {
			var that = this;
				ajax.getCustomerInfo(addedIds[0], function(data){
					that.customerView.profileView.renderCustomerInfo(data);
					that.customerView.addressView.renderCustomerAddress(data);
					that.receiverView.profileView.renderReceiverInfo(data);
					that.receiverView.addressView.renderDeliveryAddress(data);
//					that.sameDeliveryAddressView.render(data);
				});
			}
		}
//		this.receiverView.render();
//		this.sameDeliveryAddressView.render();
//		this.deliveryFeeView.render();
	}
});
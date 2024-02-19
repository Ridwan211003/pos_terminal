Homedelivery.Page3ProfileAddressView = Backbone.View.extend({
	// el to be set on initialization
	initialize : function(){
		_(this).bindAll('deliveryAddressToggle', 'formComplete', 'clear', 'updatePostalCode');
		this.profileView = new Homedelivery.Page3CustomerProfileView();
		this.addressView = new Homedelivery.Page3HdAddressView();
		
		this.profileView.on('complete', this.formComplete);
		this.addressView.on('complete', this.formComplete);
		
		this.addressView.on('update:postalCode', this.updatePostalCode, this);
	},
	
	render : function(){
		this.$('.profile').html(this.profileView.render());
		this.$('.address').html(this.addressView.render());
		this.$el;
	},
	
	deliveryAddressToggle : function(e){
		this.isDeliveryAddressSame = this.$('#deliveryAddressSame').attr('checked');
		this.receiverProfileView.$el.toggle(this.isDeliveryAddressSame);
		this.deliveryAddressView.$el.toggle(this.isDeliveryAddressSame);
	},

	formComplete : function(){
		curr = this.completed; 
		this.completed = this.profileView.model.get('complete') && this.addressView.model.get('complete');
		if(curr != this.completed){
			this.trigger('complete:profileAddress', this.completed);
		}
	},
	
	updatePostalCode : function(model){
		this.trigger('update:postalCode', model);
	},
	
	clear : function(){
		this.profileView.clear();
		this.addressView.clear();
	}
});
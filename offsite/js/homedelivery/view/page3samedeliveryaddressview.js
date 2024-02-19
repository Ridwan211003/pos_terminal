Homedelivery.Page3SameDeliveryView = Backbone.Epoxy.View.extend({
	el : '#deliveryAddressSame',
	initialize : function(){
		_(this).bindAll('render', 'toggleSameDeliveryAddress');
		this.model = new Homedelivery.HdSameDeliveryAddress();
		this.model.on('change:sameDeliveryAddress', this.toggleSameDeliveryAddress, this);
	},
	
	bindings : {
		'#deliveryAddressSame' : 'checked:sameDeliveryAddress'
	},
	
	render: function(){
		return this.$el;
	},
	
	toggleSameDeliveryAddress : function(model, value){
		this.trigger('toggle:sameDeliveryAddress', value);
	}
});

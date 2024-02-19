Homedelivery.Page3DeliveryTypeInformationView = Backbone.Epoxy.View.extend({
	
	initialize : function() {
		_(this).bindAll('changeDeliveryType', 'render', 'renderDeliveryType', 'addOptions');
		var source = $("#DeliveryTypeTemplate").html();
		var template = Handlebars.compile(source);
		this.$el.append(template({}));
		this.model = new Homedelivery.HdDeliveryTypeInfo();
		this.model.view = this;
		this.model.on('change:deliveryType', this.changeDeliveryType, this);
	},
	
	bindings: {
		"select.deliveryType" : "value:deliveryType, events:['onchange']",
		
		"span.invalid.delivery_type" : 'toggle:not(deliveryType)',
	},
	
	render : function() {
		this.renderDeliveryType();
		this.$el.show();
	},
	
	changeDeliveryType : function(model){
		curr = this.completed; 
		this.completed = this.model.get('complete');
		deliveryTypeInfo = model.get('deliveryType');
//		if(curr != this.completed){
			this.trigger('complete:deliveryTypeInfo', this.completed);
//		}
	},
	
	renderDeliveryType : function() {
		ajax.getDeliveryType(".deliveryType", this.addOptions);
	},
	
	addOptions : function(container, data){
		var view = this;
		dropdownContainer = 'select' + container;
		view.$(dropdownContainer).find('option').remove().end().append('<option value="">---</option>');
		$.each(data, function (i, item) {
		    view.$(dropdownContainer ).append($('<option>', { 
		        value: i,
		        text : item
		    }));
		});
		this.$(dropdownContainer).prop('disabled', false);
	},
	
	clear : function(){
		this.model.set(Homedelivery.HdDeliveryTypeInfo.prototype.defaults);
	}
});
Homedelivery.Page5SearchOrderView = Backbone.View.extend({
	tagName : 'li',
	className : '',

	events : {
		"click .completeSearchOrder" : "complete",
		"click .cancelSearchOrder" : "cancel",
		"click .printSearchOrder" : "print",
		"click .rescheduleSearchOrder" : "reschedule"
	},
	
	initialize : function(){
		_(this).bindAll('changeStatus', 'complete', 'cancel', 'reschedule', 'changeDeliveryDate', 'changeRescheduleDeliveryDate');
		this.model.on('change:status', this.changeStatus, this);
		this.model.on('change:deliveryDate', this.changeDeliveryDate, this);
		this.model.on('change:rescheduleDeliveryDate', this.changeRescheduleDeliveryDate, this);
		this.model.view = this;
	},
	
	render : function(){
		var source = $('#SearchOrderTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template(this.model.toJSON()));
		this.$('.status').html(this.model.get('status'));
		this.$('tr.rescheduleDeliveryDateWrapper').toggle(!!this.model.get('rescheduleDeliveryDate'));
		this.changeStatus();
		return this.$el;
	},
	
	complete : function(){
		if(!this.completeDialog){
			this.completeDialog = new Homedelivery.Page5CompleteDialogView({ model : this.model });
		} 
		this.completeDialog.openDialog(this.model);
	},
	
	cancel : function(){
		if(!this.cancelDialog){
			this.cancelDialog = new Homedelivery.Page5CancelDialogView({ model : this.model });
		} 
		this.cancelDialog.openDialog(this.model);
	},
	
	print : function(){
		page5eventmediator.trigger('print', this.model);
	},
	
	reschedule : function(){
		if(!this.rescheduleDialog){
			this.rescheduleDialog = new Homedelivery.Page5RescheduleDialogView({ model : this.model });
		}
		this.rescheduleDialog.openDialog(this);
	},
	
	changeStatus : function(){
		this.$('.inShipmentActionButtonsContainer').hide();
		this.$('.printSearchOrder').show();
		
		switch(this.model.get('status')){
			case 'IN_SHIPMENT' :
				this.$('.inShipmentActionButtonsContainer').show();
				break;
			case 'COMPLETED' :
			case 'CANCELLED' :
				break;
			default : 
				break;
		};
		this.$('.status').html(this.model.get('status'));
	},
	
	changeDeliveryDate : function(model, value){
		this.$('.searchOrderDeliveryDate').html(homedelivery.parseDate(value).toString());
	},
	
	changeRescheduleDeliveryDate : function(model, value){
		// Toggle reschedule delivery date row display
		this.$('tr.rescheduleDeliveryDateWrapper').toggle(!!value);
		// Toggle reschedule button
		this.$('span.rescheduleSearchOrder').toggle(!(!!value));
		// Print formatted reschedule delivery date
		this.$('.searchOrderRescheduleDeliveryDate').html(homedelivery.parseDate(value).toString());
	}
});
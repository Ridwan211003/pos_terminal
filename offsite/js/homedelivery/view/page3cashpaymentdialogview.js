Homedelivery.Page3CashPaymentDialogView = Backbone.View.extend({
	tagName : 'div',
	className : 'cashPaymentDialog',
	
	initialize : function(){
		_(this).bindAll('render', 'openDialog');
		
		var source = $('#CashPaymentDialogTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template({ paymentAmount : this.model.getPaymentAmount().toMoney()}));
		this.$el.dialog(hdSettings.cashPaymentDialog);
	},
	
	render : function(){
		return this.$el;
	},
	
	openDialog : function(parentView){
		this.model.eftData = null;
		this.$el.data('view', this).data('parent', parentView).dialog('open');
	}
});
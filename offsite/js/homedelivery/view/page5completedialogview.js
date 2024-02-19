Homedelivery.Page5CompleteDialogView = Backbone.View.extend({
	tagName : 'div',
	className : 'completeDialog',
	
	initialize : function(){
		_(this).bindAll('render', 'openDialog', 'complete', 'completed');
		var source = $('#CompleteDialogTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template(this.model.toJSON()));
		this.$el.dialog(hdSettings.completeDialog);
	},
	
	render : function(){
		return this.$el;
	},
	
	openDialog : function(){
		this.$('.completeResult').hide();
		$('.ui-dialog-buttonpane button:contains("Complete Delivery")').button().show();
		this.$el.data('model', this.model).data('view', this).dialog('option', 'title', 'Complete Order# ' + this.model.get('hdTransactionId')).dialog('open');
	},
	
	complete : function(){
		ajax.updateOrderStatusComplete({
			hdTransactionId : this.model.get('hdTransactionId')
		}, this.completed);
	},
	
	completed : function(result){
		this.$('.completeResult').hide();
		switch(result.status){
			case 'COMPLETED' : 
				this.$('.completeSuccess').show();
				$('.ui-dialog-buttonpane button:contains("Complete Delivery")').button().hide();
				this.$('.authResult').text('Order is now completed.');
				this.model.set('status', result.status);
				break;
			case 'COULD_NOT_COMPLETE' :
				this.$('.couldNotComplete').show();
				break;
			default : 
				uilog('DBUG','default complete' + result);
				break;
		}
	}
});
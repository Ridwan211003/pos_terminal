Homedelivery.Page5RescheduleDialogView = Backbone.View.extend({
	tagName : 'div',
	className : 'rescheduleDialog',
	
	initialize : function(){
		_(this).bindAll('render', 'openDialog', 'logIn', 'logInOk', 'logInFail', 'reschedule', 'rescheduled', 'completeRescheduleDate', 'createRescheduleDateView');
		
		var source = $('#RescheduleDialogTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template(this.model.toJSON()));
		this.$el.dialog(hdSettings.rescheduleDialog);
		this.createRescheduleDateView();
	},
		
	render : function(){
		return this.$el;
	},
	
	createRescheduleDateView : function(){
		var adjustment=Date.daysBetween(new Date(), homedelivery.parseDate(this.model.get('deliveryDate'))) + 8;
		adjustment = adjustment < 10 ? '0' + adjustment : adjustment ; 
		this.rescheduleDateView = new Homedelivery.DeliveryDateView({ el : '.rescheduleContainer', datetimepickersettings : { maxDate : '+1970/01/' + adjustment }});
		this.rescheduleDateView.on('complete:deliveryDate', this.completeRescheduleDate);		
	},
	
	completeRescheduleDate : function(isComplete){
		$('.ui-dialog-buttonpane button:contains("Reschedule")').button().toggle(isComplete);
	},
	
	openDialog : function(parentView){
		this.$('.authResult').hide();
		this.$('.rescheduleResult').hide();
		this.$('.authResultContainer').hide();
		this.$('.rescheduleContainer').hide();
		this.$('.newDeliveryDateContainer').hide();
		this.$('.authUser').val('');
		this.$('.authUser').removeAttr('readonly');
		this.rescheduleDateView.reset();
		this.rescheduleDateView.model.set('originalDeliveryDate', homedelivery.parseDate(this.model.get('deliveryDate')));
		$('.ui-dialog-buttonpane button:contains("Reschedule")').button().hide();
		$('.ui-dialog-buttonpane button:contains("Log-in")').button().show();
		this.$el.data('model', this.model).data('view', this).data('parent', parentView).dialog('open');
	},
	
	logIn : function(){
		username = this.$('.dialogUsername').val();
		password = this.$('.dialogPassword').val();
		if(username == '' || password == ''){
			this.$('.authResult').text('Username and password required').show();
		} else {
			this.$('.authResult').text('').show();
			var view = this;
			ajax.authUser({
				username : this.$('.dialogUsername').val(),
				empCode : this.$('.dialogPassword').val(),
				authType : 'pin',
				roles : ['ROLE_HD_SUPERVISOR']
			}, this.logInOk , this.logInFail);
		}
	},
	
	logInOk : function(data){
		this.$('.authResult').addClass('invalid');
		this.$('.authResult').text(data.msg);
		if(data.msg == 'OK'){
			this.$el.dialog('option', 'title', 'Reschedule Delivery Order# ' + this.model.get('hdTransactionId'));
			this.$('.authUser').attr('readonly', 'readonly');
			this.$('.authResult').removeClass('invalid');
			this.$('.authResult').text('Login sukses. Anda bisa menjadwal ulang pengiriman sekarang.');
			this.$('.rescheduleContainer').show();

			$('.ui-dialog-buttonpane button:contains("Reschedule")').button().hide();
			$('.ui-dialog-buttonpane button:contains("Log-in")').button().hide();
		}
	},
	
	logInFail : function(errorData){
		this.$('.authResult').addClass('invalid');
		this.$('.authResult').text(errorData.error).show();
	},
	
	reschedule : function(){
		ajax.rescheduleDelivery(this.model.get('hdTransactionId'), 
			this.rescheduleDateView.model.get('deliveryDate'), 
			this.rescheduled);
	},
	
	rescheduled : function(result, rescheduleDate){
		this.$('.authResult').hide();
		this.$('.rescheduleResult').hide();
		switch(result.status){
			case 'OK' :
				var rescheduleDateObj = new Date(Date.parseDate(rescheduleDate, 'd/m/Y H:i'));
				this.$('.rescheduleComplete').show();
				this.$('.newDeliveryDateContainer').show();
				this.$('.newDeliveryDate').text(rescheduleDateObj.toString()).show();
				this.$('.authResult').text('Order is rescheduled.');
				this.$('.rescheduleSearchOrder').toggle(false);
				this.rescheduleDateView.remove();
				this.model.set('rescheduleDeliveryDate', rescheduleDateObj.toISOString());
				$('.ui-dialog-buttonpane button:contains("Reschedule")').button().hide();
				break;
			case 'RESCHEDULE_NOT_COMPLETED':
				this.$('.rescheduleNotComplete').show();
				break;
			default :
				this.$('.unexpectedError').show();
				break;
		}
	}

});
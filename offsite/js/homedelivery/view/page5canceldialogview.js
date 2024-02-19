Homedelivery.Page5CancelDialogView = Backbone.View.extend({
	tagName : 'div',
	className : 'cancelDialog',
	
	initialize : function() {
		_(this).bindAll('render', 'openDialog', 'logIn', 'logInOk', 'logInFail', 'cancel', 'cancelled');
		var source = $('#CancelDialogTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template(this.model.toJSON()));
		this.$el.dialog(hdSettings.cancelDialog);
	},
	
	render : function() {
		return this.$el;
	},
	
	openDialog : function(){
		deliveryDate = homedelivery.parseDate(this.model.get('deliveryDate'));
		deliveryDatePlus1 = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate() + 2);
		if(new Date() > deliveryDatePlus1){
			this.$('.cancelResult').hide();
			this.$('.authResult').hide();
			this.$('.authResultContainer').hide();
			this.$('.errorPastDelDate').show();
			$('.ui-dialog-buttonpane button:contains("Cancel Delivery")').button().hide();
			$('.ui-dialog-buttonpane button:contains("Log-in")').button().hide();
			this.$el.data('model', this.model).data('view', this).dialog('option', 'title', 'Cant cancel order').dialog('open');
		} else {
			this.$('.cancelResult').hide();
			this.$('.authResult').hide();
			this.$('.authResultContainer').show();
			this.$('.authUser').val('');
			this.$('.authUser').removeAttr('readonly');
			this.$('.errorPastDelDate').hide();
			$('.ui-dialog-buttonpane button:contains("Cancel Delivery")').button().hide();
			$('.ui-dialog-buttonpane button:contains("Log-in")').button().show();
			this.$el.data('model', this.model).data('view', this).dialog('option', 'title', 'Supervisor Log-in').dialog('open');
		}

	},
	
	cancel : function(){
		ajax.updateOrderStatusCancel({
			hdTransactionId : this.model.get('hdTransactionId')
		}, this.cancelled );
	},
	
	cancelled : function(result){
		this.$('.authResult').hide();
		this.$('.cancelResult').hide();
		switch(result.status){
			case 'CANCELLED' :
				this.$('.cancelComplete').show();
				$('.ui-dialog-buttonpane button:contains("Cancel Delivery")').button().hide();
				this.$('.authResult').text('Order is now cancelled.');
				this.model.set('status', result.status);
				break;
			case 'CANCEL_NOT_COMPLETED':
				this.$('.cancelNotComplete').show();
				break;
			default : 
				uilog('DBUG','default cancel ' + result);
				break;
		}
		
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
			this.$el.dialog('option', 'title', 'Cancel Delivery Order# ' + this.model.get('hdTransactionId'));
			this.$('.authUser').attr('readonly', 'readonly');
			this.$('.authResult').removeClass('invalid');
			this.$('.authResult').text('Login successful. You may cancel the delivery order now.');
			
			$('.ui-dialog-buttonpane button:contains("Cancel Delivery")').button().show();
			$('.ui-dialog-buttonpane button:contains("Log-in")').button().hide();
		}
	},
	
	logInFail : function(errorData){
		this.$('.authResult').addClass('invalid');
		this.$('.authResult').text(errorData.error).show();
	}
});
$.extend(hdSettings, { 
	completeDialog : {
		resizable: false,
		autoOpen: false,
		width: 450,
		modal : true,
		appendTo: "#page5Container",
		buttons : {
			"Complete Delivery" : function(){
				var model = $(this).data('model');
				var view = $(this).data('view');
				view.complete();
			},
			"Close": function() {
				var view = $(this).data('view');
				$(this).dialog('close');
			}
		}
	},
	
	cancelDialog : {
		resizable: false,
		autoOpen: false,
		width: 450,
		closeOnEscape: false,
		modal : true,
		title : 'Cancel Order',
		buttons : {
			"Log-in" : function(){
				var view = $(this).data('view');
				view.logIn();
			},
			"Confirm Cancel Delivery" : function(){
				var view = $(this).data('view');
				view.cancel();
			},
			"Close": function() {
				/*var view = $(this).data('view');
				uilog('DBUG','Close Cancel Dialog');
				view.remove();*/
				$(this).dialog('close');
			}
		}
	},
	
	rescheduleDialog : {
		resizable: false,
		autoOpen: false,
		width: 700,
		closeOnEscape: true,
		modal : true,
		title : 'Reschedule Order',
		buttons : {
			"Reschedule" : function(){
				var view = $(this).data('view');
				view.reschedule();
			},
			"Log-in" : function(){
				var view = $(this).data('view');
				view.logIn();
			},
			"Close" : function(){
				var view = $(this).data('view');
				var parent = $(this).data('parent');
				parent.rescheduleDialog = null;
				$(this).dialog('close');
				view.remove();
			} 
		}
	}
});
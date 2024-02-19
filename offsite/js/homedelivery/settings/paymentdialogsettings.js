$.extend(hdSettings,{
	cashPaymentDialog : {
		resizable: false,
		autoOpen: false,
		width: 450,
		closeOnEscape: false,
		modal : true,
		title : 'Cash Payment',
		buttons : {
			"Confirm Cash Payment" : function(){
				view = $(this).data('view');
				parent =  $(this).data('parent');
				view.remove();
				parent.createHdTransaction();
			},
			"Close": function() {
				var view = $(this).data('view');
				view.cashPaymentDialog = null;
				view.remove();
			}
		}
	},
	
	eftPaymentDialog : {
		resizable: false,
		autoOpen: false,
		closeOnEscape: false,
		width: 450,
		title : 'EFT Payment',
		modal : true,
		buttons : {
			"Confirm EFT Payment" : function(){
				view = $(this).data('view');
				parent = $(this).data('parent');
				view.confirmEftPayment(parent);
				view.remove();
			},
			"Close" : function(){
				view = $(this).data('view');
				view.remove();
			}
		}
	},
	
	debitPaymentDialog : {
		resizable: false,
		autoOpen: false,
		width: 450,
		closeOnEscape: false,
		title : 'Debit Payment',
		modal : true,
		
		buttons : {
			"Confirm Debit Payment" : function(){
				view = $(this).data('view');
				parent = $(this).data('parent');
				view.confirmDebitPayment(parent);
				view.remove();
			},
			"Close" : function(){
				view = $(this).data('view');
				view.remove();
			}
		}
	}
});
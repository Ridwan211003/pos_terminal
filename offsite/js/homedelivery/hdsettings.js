defaults =  {
	bPaginate : false,
	bSort : false,
};
hdSettings = {
	transactionListTable : {
		id : '#transactionListTable',
		dataTableParams: $.extend({
			aoColumns : [
			   {"sDefaultContent": "", "mData" : "transactionId",
				"mRender": function (data, type, full) {
					return "<input type='checkbox' class='search_transaction_cb' value='" + data + "' />";
				},
				"fnCreatedCell" : function(renderedObject, mData, fullData, iRow, iCol){
					if(iRow === 0){
						// TODO: set checked if first row
						$(renderedObject).prop('checked', true);
					}
				}
			   },
			   {"mData" : "transactionId"},
			   {"mData" : "transactionDate"},
			   {"mData" : "status"},
			   {"mData" : "totalAmountPaid" , 
				"mRender" : function(data, type, full){
					return data.toMoney();
				}   
			   }
			   
			],
			bAutoWidth: true,
			aaData : []
		}, defaults)
	},
	addedTransactionTable : {
		id: "#addedTransactionsListTable",
		dataTableParams : {
			aoColumns : [
			   {"mData" : "transactionId"},
			   {"mData" : "totalAmountPaid"},
			   {"mData" : "transactionId",
				"sDefaultContent" : "", "mData" : "transactionId",
				"mRender" : function(data, type, full){
					return "<span style='color: #005CA6; cursor: pointer' class='remove_from_added_btn' value='" + data +"'>Remove</span>";
				},
				"fnCreatedCell" : function(renderedObject, mData, fullData, iRow, iCol){
					$(renderedObject).click(function(){
						 homedelivery.removeAddedTransaction(fullData.transactionId, iRow);												
					});
				}
			   }
			],
			bAutoWidth: true,
			bPaginate : false,
			aaData : []
		}
	},
	
	transactionItemsTableParams : {
		id: "#transactionItemsListTable",
		dataTableSettings : {
			aoColumns : [
				{"sDefaultContent": "", "mData" : "transactionId",
					"mRender": function (data, type, full) {
						if(full && full.hdDeliveryItemType === 'OK'){
							return "<input type='checkbox' class='select_pos_tx_item_cb' value='" + full.id + "' >" + full.id + "</input>";
						}
						else if(full && full.hdDeliveryItemType === 'ALREADY_FOR_DELIVERY'){
							return "<div>ALREADY_FOR_DELIVERY</div>";
						} else if (full && full.hdDeliveryItemType === 'FRESH_GOOD'){
							return "<div>FRESH_GOOD</div>";
						} else {
							return "<div>" + full.hdDeliveryItemType + "</div>";
						}
					}
				},			    
			    {"mData" : "itemCode"},
				{"mData" : "quantity" },
				{"mData" : "productName"},
				{"mData" : "hdDeliveryItemType"},
			],
			bAutoWidth: true,
			bPaginate : false,
			aaData : []
		}
	},

	deliveryDatePicker : {
		minDate : '0',
		onChangeDateTime: function( currentDateTime ){
			this.setOptions({
				minTime:'9:00'
			});
		},
		onShow: function( currentDateTime ){
			this.setOptions({
				minTime:'9:00'
			});
		}
	},
	
	transactionDatePicker : {
		timepicker:false,
		format:'d/m/Y',
		minDate:'-1970/01/06',
		maxDate:'0',
		mask:true
	},
	
	searchOrderDatePicker : {
		dateFormat: 'dd/mm/yy'
	},
	
	printDeliveryNoteSettings : {
		mode:"iframe", //,"popup",  //printable window is either iframe or browser popup
		popHt: 500,   // popup window height
		popWd: 1000,  // popup window width
		popX: 0,   // popup window screen X position
		popY: 0,  //popup window screen Y position
		popTitle: 'Delivery order',// popup window title element
		popClose: true,  // popup window close after printing
		retain : ["id","class","style"],
		standard : "strict",
	},
	
	printSearchOrderSettings : {
		mode:"popup", //,"popup",  //printable window is either iframe or browser popup
		popHt: 1000,   // popup window height
		popWd: 1000,  // popup window width
		popX: 0,   // popup window screen X position
		popY: 0,  //popup window screen Y position
		popTitle: 'Delivery order',// popup window title element
		popClose: true,  // popup window close after printing
		retain : ["id","class","style"],
		standard : "strict",
	},
	
	verifyDialog : {
		resizable: false,
		autoOpen: false,
		modal: true,
		width: 450,
		appendTo: "#page5Container",
		buttons : {
			"Save" : function(){
				var dialog = $(this);
				var view = $(this).data('view');
				var model = $(this).data('model');
				
				if($("#paymentReceiptNumber").val().length == 0){
					$(".paymentIdEmpty").show();
				}
				else {
					ajax.updateOrderStatusVerify({
						hdTransactionId : $(this).data('model').get('hdTransactionId'),
						posPaymentId : $("#paymentReceiptNumber").val()
						}, function(result){
							if(result){
								view.verified(result.status, model);
							} else {
								$(dialog).dialog("close");
							}
						}, function(){
							$('.verifyUnexpectedError').show();
						}
					);
				}
			},
			"Close": function() {
				$(this).dialog("close");
			}
		},
	},
	
	completeDialog : {
		resizable: false,
		autoOpen: false,
		width: 450,
		appendTo: "#page5Container",
		buttons : {
			"Complete Delivery" : function(){
				var model = $(this).data('model');
				var view = $(this).data('view');
				uilog("DBUG","Complete Dialog complete");
				ajax.updateOrderStatusComplete({
					hdTransactionId : model.get('hdTransactionId')
				}, function(result){
					view.completed(result, model);
				});
			},
			"Close": function() {
				$(this).dialog("close");
			}
		}
	},
	
	cancelDialog : {
		resizable: false,
		autoOpen: false,
		width: 450,
		appendTo: "#page5Container",
		buttons : {
			"Cancel Delivery" : function(){
				var model = $(this).data('model');
				var view = $(this).data('view');
				uilog("DBUG","Cancel Dialog complete");
				ajax.updateOrderStatusCancel({
					hdTransactionId : model.get('hdTransactionId')
				}, function(result){
					view.cancelled(result, model);
				});
			},
			"Close": function() {
				$(this).dialog("close");
			}
		}
	}
};
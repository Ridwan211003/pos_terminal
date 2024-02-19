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
				"sClass" : 'tdCenter',
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
			   {"mData" : "transactionDate",
				"mRender" : function(data, type, full){
					return homedelivery.parseDate(data).dateFormat('Ymd H:i');
				}
			   },
			   {"mData" : "status"},
			   {"mData" : "totalAmountPaid" ,
				"sClass" : "tdAmount",
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
			   {"mData" : "totalAmountPaid",
				"sClass" : "tdAmount",
			    "mRender" : function(data, type, full){
			    	return data.toMoney();
				} 
			   },
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
				 "sClass" : "tdCenter",
					"mRender": function (data, type, full) {
						if(full && (full.hdDeliveryItemType === 'OK' || full.hdDeliveryItemType === 'ALREADY_FOR_DELIVERY')){
							return "<input type='checkbox' class='select_pos_tx_item_cb' value='" + full.id + "' />";
						} else {
							return "<input type='checkbox' class='select_pos_tx_item_cb' value='" + full.id + "' disabled='true' />";
						}
					}
				},			    
			    {"mData" : "itemCode",
				 "sClass" : "tdCenter",
			    },
			    {"mData" : "productName",
			     "sClass" : "tdCenter",},
			    {"mData" : "quantity" ,
			     "sClass" : "tdCenter", },
			    {"mData" : "hdDeliveryItemType",
			      "mRender" : function(data, type, full) {
			    	 switch(data) {
			    	 	case 'ALREADY_FOR_DELIVERY':
			    	 		return "<span><i>Siap Dikirim</i></span>";
			    	 	case 'OK':
			    	 		return "<span>Ok</span>";
			    	 	case 'FRESH_GOOD':
			    	 		return "<span>Fresh Good</span>";
			    	 	default : 
			    	 		return "<span>"+data+"</span>";
			    	 }
			       }
			     },
			],
			bAutoWidth: true,
			bPaginate : false,
			aaData : []
		}
	},

	deliveryDatePicker : {
		minDate : '0',
		maxDate:'+1970/01/14',
		format:'d/m/Y H:i',
		yearStart : '2014',
		yearEnd : '2018',
		step : 30,
		inline : true,
		onSelectTime : function(currentDateTime, elem){
			// trigger event to check right away for form completion.
			// without manual trigger user has to click outside the text box before completion check happen
			elem.trigger('change');
		},
		onSelectDate: function(currentDateTime){
			var now = new Date();
			if(now.getDate() == currentDateTime.getDate()){
				this.setOptions({
					minTime: now.getHours() + (now.getMinutes() < 10 ? (':0' +now.getMinutes()) : (':' + now.getMinutes()))
				});
			} else {
				this.setOptions({ minTime: '0:00' });
			}
			elem.trigger('change');
		},
		onShow: function(currentDateTime, elem){
			var now = new Date();
			if(now.getDate() == currentDateTime.getDate()){
				this.setOptions({
					minTime: now.getHours() + (now.getMinutes() < 10 ? (':0' +now.getMinutes()) : (':' + now.getMinutes()))
				});
			} else {
				this.setOptions({ minTime: '0:00' });
			}
			elem.val('');
			elem.trigger('change');
		},
	},
	
	transactionDatePicker : {
		timepicker:false,
		format:'d/m/Y',
		minDate:'-1970/01/06',
		maxDate:'0',
		mask:true
	},
	
	searchOrderDatePicker : {
		timepicker:false,
		format:'d/m/Y',
		mask:true
	},
	
	defaultDialogSettings : {
		resizable: false,
		autoOpen: false,
		width: 450,
		closeOnEscape: false,
		modal : true,
	},
	
	printDeliveryNoteSettings : {
		mode:"iframe", //,"popup",  //printable window is either iframe or browser popup
		popHt: 500,   // popup window height
		popWd: 1000,  // popup window width
		popX: 0,   // popup window screen X position
		popY: 0,  //popup window screen Y position
		popTitle: 'Delivery order',// popup window title element
		//popClose: true,  // popup window close after printing
		retain : ["id","class","style"],
		standard : "strict",
	},
	
	printSearchOrderSettings : {
		mode:"iframe", //,"popup",  //printable window is either iframe or browser popup
		popHt: 1000,   // popup window height
		popWd: 1000,  // popup window width
		popX: 0,   // popup window screen X position
		popY: 0,  //popup window screen Y position
		popTitle: 'Delivery order',// popup window title element
		//popClose: true,  // popup window close after printing
		retain : ["id","class","style"],
		standard : "strict",
	},
	
	printPreviewHDODReportSettings : {
		mode:"iframe", //,"popup",  //printable window is either iframe or browser popup
		popHt: 700,   // popup window height
		popWd: 932,  // popup window width
		popX: 0,   // popup window screen X position
		popY: 0,  //popup window screen Y position
		popTitle: 'Operational Delivery Report',// popup window title element
		//popClose: true,  // popup window close after printing
		retain : ["id","class","style"],
		standard : "strict",
	},
	
	// Operational Delivery Report Dialog window settings
	odrDialogSettings : {
		resizable: false,
		autoOpen: false,
		width: 550,
		closeOnEscape: true,
		modal : true,
		title : 'Operational Delivery Report',
		buttons : {
			"Print Report" : function(){
				var view = $(this).data('view');
				var parent = $(this).data('parent');
				view.previewPrint();
				parent.operationalDeliveryReportDialog = null;
				$(this).dialog('destroy').remove();
			},
			"Cancel" : function(){
				//Clear inputted data
				var view = $(this).data('view');
				var parent = $(this).data('parent');
				$('.operatorId').val('');
				$('.dlgDelivDateFrom').val('');
				$('.dlgDelivDateTo').val('');
				parent.operationalDeliveryReportDialog = null;
				$(this).dialog('destroy').remove();
			}
		}
	},
	
	ordParamsDelivDatePicker : {
		timepicker:true,
		format:'d/m/Y H:i',
		maxDate:'0',
		inline : true,
		className: 'operationalDelivDialog',
		onSelectTime : function(currentDateTime, elem){
			elem.trigger('change');
		},
		onSelectDate : function(currentDateTime, elem){
			elem.trigger('change');
		},
		onShow:function( currentDateTime, elem ){
			$('div.xdsoft_current').removeClass('xdsoft_current');
			$('td.xdsoft_current').removeClass('xdsoft_current');
			xd = $(this).data('xdsoft_datetime');
			xd.currentTime.setHours(0);
			xd.currentTime.setMinutes(0);
			$(this).data('xdsoft_datetime', xd);
			elem.val('');
			elem.trigger('change');
		}
	}
};
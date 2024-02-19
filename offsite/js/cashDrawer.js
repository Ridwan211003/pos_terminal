var DrawerModule = DrawerModule || {};

DrawerModule.isConnected = true;
DrawerModule.isOpened = false;

/**
 * Closes drawer upon logout.
 * @returns
 */
DrawerModule.openDrawerOnLogout = function(){
	var url = proxyUrl + "/openDrawer";

	function success(data){
		uilog("DBUG","Open drawer success.");
		window.location.replace(posWebContextPath + "/resources/j_spring_security_logout");
	}

	function error(err){
		uilog("DBUG","Unable to open drawer.");
		window.location.replace(posWebContextPath + "/resources/j_spring_security_logout");
	}

	return DrawerModule.ajax.requestGET({
		url		: url,
		async 	: false,
		success	: success,
		error	: error
	});
};

/**
 * Calls open drawer
 * @param showWarning
 *   - if true it shows a pop-up dialog
 * @returns
 */
DrawerModule.openDrawer = function(options){
	var url = proxyUrl + "/openDrawer";

	function success(data){
		if(data && data.isExecuted){
			DrawerModule.isConnected = true;
			DrawerModule.isOpened = true;
			setTimeout(function(){
				var pollInstance = DrawerModule.statusPoll.getInstance();
				if(pollInstance.getStatusPoll()){
					pollInstance.clearStatusPoll();
				}
				DrawerModule.statusPoll.getInstance()
				.startStatusPoll(
						setInterval(function() {
							DrawerModule.checkStatus(options);
						}, 1000)
				);
			}, 500);
		}
	};

	function error(err){
		uilog("DBUG", + err.error);
		DrawerModule.isConnected = false;
		DrawerModule.statusPoll.getInstance().clearStatusPoll();
		promptSysMsg(getMsgValue("prompt_msg_drawer_disconnected"));
	};

	return DrawerModule.ajax.requestGET({
		url		: url,
		async 	: false,
		success	: success,
		error	: error
	});
};

DrawerModule.checkStatus = function(options){
	var url = proxyUrl + "/checkDrawerStatus";

	function success(data){
		if(data){
			DrawerModule.isConnected = true;
			DrawerModule.isOpened = !data.isClose;
			DrawerModule.showMessageAfterStatusCheck(data.isClose, options);
		}
	}

	function error(err){
		DrawerModule.isConnected = false;
		DrawerModule.stopStatusPoll();
		promptSysMsg(getMsgValue("prompt_msg_drawer_disconnected"));
		showMsgDialog(
				getMsgValue('pos_error_msg_cashier_drawer_status'),
				"error");
		if ($("#order-message").dialog("isOpen")) {
			if ((saleTx.type == CONSTANTS.TX_TYPES.SALE.name && isFeedbackGiven) ||
				(saleTx.type != CONSTANTS.TX_TYPES.SALE.name)) {
				showOkButtonOnOrderMessage();
			}
		}
	}

	return DrawerModule.ajax.requestGET({
		url		: url,
		async 	: false,
		/*Cuts the call to check drawer status if it did not respond*/
		timeout : 750,
		success	: success,
		error	: error
	});
};

DrawerModule.showMessageAfterStatusCheck = function(isDrawerClose, options){
	/*Login*/if(options && options.afterLogin){
		DrawerModule.showMessageAfterLogin(isDrawerClose);
	}
	/*OnTransaction*/
	else if(options && options.afterTransaction){
		DrawerModule.showMessageAfterTransaction(isDrawerClose);
	}
};

DrawerModule.showMessageAfterLogin = function(isDrawerClose){
	if(isDrawerClose){
		var pollInstance = DrawerModule.statusPoll.getInstance();
		if(pollInstance.getStatusPoll()){
			pollInstance.clearStatusPoll();
		}
		if ($("#cash-drawer-dialog").dialog("isOpen")) {
			$("#cash-drawer-dialog").dialog("close");
		} else {
			clearOrder();
			createOrder();
		}

	} else {
		$("#cash-drawer-dialog").dialog("open");
	}
};

DrawerModule.showMessageAfterTransaction = function(isDrawerClose){
	if(isDrawerClose){
		//if drawer is already close.
		//this makes sure it stops the interval checking.
		var pollInstance = DrawerModule.statusPoll.getInstance();
		if(pollInstance.getStatusPoll()){
			pollInstance.clearStatusPoll();
		}

		if (isFeedbackGiven) {
			var payments = saleTx.payments;
			var lastPayment = saleTx.payments.last;
			//opens drawer if payment has cash or last payment is edc payment
			if(hasCashPayment(payments)
					|| (lastPayment && CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_PAYMENT.name == lastPayment.paymentMediaType)){
				$("#order-message").dialog("close");
			} else {
				showOkButtonOnOrderMessage();
			}
		}else if(saleTx.type == CONSTANTS.TX_TYPES.RETURN.name
				|| saleTx.type == CONSTANTS.TX_TYPES.REFUND.name
				|| saleTx.type == CONSTANTS.TX_TYPES.PICKUP.name || saleTx.type == CONSTANTS.TX_TYPES.SALE.name){
			$("#order-message").dialog("close");
		}
		$("#cash-drawer-dialog").dialog("close");
	}
        else if(!$("#order-message").dialog("isOpen") && !$("#cash-drawer-dialog").dialog("isOpen") && !$("#customer-data").dialog("isOpen") && DrawerModule.isOpened)
        {
                $("#cash-drawer-dialog").dialog("open");
        }
};

/**
 * Stops poll on cash drawer status. Clears order and creates new transaction
 */
DrawerModule.stopStatusPoll = function(){
	DrawerModule.statusPoll.getInstance().clearStatusPoll();
	if (!DrawerModule.isDrawerConnected && !customerFeedback) {
		clearOrder();
		createOrder();
	}
};

DrawerModule.validateTxnToOpenDrawer = function(){
	var payments = saleTx.payments;
	var lastPayment = payments.last;
	var toOpen = false;

	if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name || saleTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name || saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name) {
		if(hasCashPayment(payments)
				|| (lastPayment && CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_PAYMENT.name == lastPayment.paymentMediaType)){
			//calls open drawer
			toOpen = true;
		}
	} else if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name
		   || saleTx.type == CONSTANTS.TX_TYPES.REFUND.name
		   || saleTx.type == CONSTANTS.TX_TYPES.PICKUP.name) {
			toOpen = true;
	}
	//calls open drawer
	if(toOpen){
		DrawerModule.openDrawer({afterTransaction: true});
	}
};

DrawerModule.statusPoll = (function(){
	var instance = null;

	function init(){
		var statusPoll = null;

		return{
			startStatusPoll : function(intervalObj){
				statusPoll = intervalObj;
			},
			getStatusPoll : function(){
				return statusPoll;
			},
			clearStatusPoll : function(){
				if(statusPoll){
					clearInterval(statusPoll);
				}
			},
			getStatusPollCount : function(){
				return count;
			}
		};
	}

	return{
		getInstance : function(){
			if(!instance)
				instance = init();
			return instance;
		},
		destroyInstance: function(){
			instance = null;
		}
	};
})();

DrawerModule.ajax = new POSS.Ajax();

var FLASHIZ = FLASHIZ || {};

var FlashizPayment = function(merchantInfo) {
	var merchantInfoArr = merchantInfo.split(";");
	this.bankId = merchantInfoArr[0];
	this.bankName = merchantInfoArr[1];
	this.invoiceId = merchantInfoArr[2];
	this.bankReferenceId =  merchantInfoArr[3];
	this.loyaltyName = merchantInfoArr[4];
	this.discountAmount = merchantInfoArr[5];
};

FLASHIZ.payWithFlashiz = function(amount) {
	$("#loading-dialog").dialog("open");
	
	var invoice = FLASHIZ.createFlashizInvoice(amount);
	
	if (invoice.id && FLASHIZ.generateFlashizQRCode(invoice.id, invoice.tagStart)) {
		FLASHIZ.checkFlashizPayment(invoice.id, amount);
	}
	if ($("#loading-dialog").dialog("isOpen")) {
		$("#loading-dialog").dialog("close");
	}
};

/**
 * Check if current POS terminal is configured to use FLASHiZ
 */
FLASHIZ.isFlashizConfigured = function() {
	var isConfigured = false;
	$.ajax({
		url : posWebContextPath + "/cashier/flashiz/isConfigured",
		type : "GET",
		async : false,
		success : function(response) {
			isConfigured = response;
		}
	});
	return isConfigured;
};

FLASHIZ.createFlashizInvoice = function(amount) {
	var invoice = {};
	$.ajax({
		url : posWebContextPath + "/cashier/flashiz/createInvoice",
		type : "GET",
		async : false,
		data : {amount : amount},
		timeout: 5000,
		success : function(response) {
			invoice.id = response.invoiceId;
			invoice.tagStart = response.invoiceTagStart;
		},
		error : function(jqXHR, status, error) {
			$("#loading-dialog").dialog("close");
			uilog("DBUG", error);
			showMsgDialog(getMsgValue("flashiz_err_create_invoice"), "error");
		}
	});
	return invoice;
};

FLASHIZ.generateFlashizQRCode = function(invoiceId, invoiceTagStart) {
	var qrGenerated = false;
	//Set as Default QR-Gen URL
	invoiceTagStart = getConfigValue('FLASHIZ_QR_GENERATION_URL');
	
	$.ajax({
		url : posWebContextPath + "/cashier/flashiz/generateQRCode/" + invoiceId,
		type : "GET",
		async : false,
		data : {invoiceTagStart : invoiceTagStart},
		success : function(image) {
			CustomerPopupScreen.cus_openFlashizQRCodeDialog(image);
			qrGenerated = true;
		},
		error : function(jqXHR, status, error) {
			qrGenerated = false;
			$("#loading-dialog").dialog("close");
			uilog("DBUG", error.message);
			showMsgDialog(getMsgValue("flashiz_err_generate_qr"), "error");
		}
	});
	return qrGenerated;
};

FLASHIZ.checkFlashizPayment = function(invoiceId, amount) {
	var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.FLASHIZ.name;
	var msgContainer = $("#flashizCheckPaymentDialogMsg");
	var subTotalAmtContainer = $("#flashizCheckPaymentDialogMsgSubtotalAmt");
	
	$("#flashizCheckPayment-dialog").dialog('option', 'buttons', {
		"Check Payment" : function() {
			var checkPaymentResp = FLASHIZ.getFlashizPaymentStatus(invoiceId);
			switch(checkPaymentResp.content.status) {
				case CONSTANTS.FLASHIZ_PAYMENT_STATUS.NEW:
					msgContainer.html(getMsgValue("flashiz_msg_invoice_unpaid"));
					break;
				case CONSTANTS.FLASHIZ_PAYMENT_STATUS.EXE:
					var flashizMerchInfo = new FlashizPayment(checkPaymentResp.content.merchantInformation);
					CASHIER.executePaymentMedia(saleTx, mediaType, amount, {flashizPayment : flashizMerchInfo});
					$(this).dialog("close");
					clearInputDisplay();
					break;
				case CONSTANTS.FLASHIZ_PAYMENT_STATUS.OUT:
					$(this).dialog("close");
					showMsgDialog(getMsgValue("flashiz_err_invoice_outdated"), "error");
					break;
				default:
					$(this).dialog("close");
					break;
			}
		},
		Cancel : function() {
			var checkPaymentResp = FLASHIZ.getFlashizPaymentStatus(invoiceId);
			if (checkPaymentResp && CONSTANTS.FLASHIZ_PAYMENT_STATUS.EXE == checkPaymentResp.content.status) {
				showMsgDialog(
						getMsgValue("flashiz_warning_xcancel_invoice"),
						"warning",
						function() {
							var flashizMerchInfo = new FlashizPayment(checkPaymentResp.content.merchantInformation);
							CASHIER.executePaymentMedia(saleTx, mediaType, amount, {flashizPayment : flashizMerchInfo});
							clearInputDisplay();
						});
			} else {
				$.ajax({
					url : posWebContextPath + "/cashier/flashiz/cancelInvoice/" + invoiceId,
					type : "GET",
					async : true
				});
			}
			$(this).dialog("close");
		}
	});
	subTotalAmtContainer.html("Subtotal: " + numberWithCommas(amount));
	$("#flashizCheckPayment-dialog").dialog("open");
};

FLASHIZ.getFlashizPaymentStatus = function(invoiceId) {
	var msgContainer = $("#flashizCheckPaymentDialogMsg");
	msgContainer.html("<em>Please wait...</em>");
	var checkPaymentResp = null;
	$.ajax({
		url : posWebContextPath + "/cashier/flashiz/checkPayment/" + invoiceId,
		type : "GET",
		async : false,
		timeout: 5000,
		success : function(response) {
			checkPaymentResp = response;
		},
		error : function(jqXHR, status, error) {
			msgContainer.html("Internal server error. Please try again.");
		}
	});
	return checkPaymentResp;
};

var ALTOWC = ALTOWC|| {};

var ALTOWCPayment = function(d) {
	// this.acntNo = maskCardNoMLC(mlcInfo.CardNo);
	this.acntNo = d.trade_no;
	this.amount = d.amount;
	this.approvalCode = d.trade_no;
	this.rc = d.paytype;
	this.rcDesc = d.paytype;
	this.customerName = d.out_trade_no;
	this.reffNo = d.out_trade_no;
};

ALTOWC.payWithALTOWC = function(amount) {
	$("#loading-dialog").dialog("open");
	
	var altoWCObj = ALTOWC.createALTOWCObj(amount);
	if(altoWCObj == null) return false;
	
	if(ALTOWC.generateALTOWCQRCode(altoWCObj))
		ALTOWC.checkALTOWCPayment(altoWCObj, amount);
	
	if ($("#loading-dialog").dialog("isOpen")) {
		$("#loading-dialog").dialog("close");
	}
};

ALTOWC.payWithALTOWC2 = function(amount) {
	
	var altoWCObj = ALTOWC.createALTOWCObj(amount);
	if(altoWCObj == null) return false;
	
	ALTOWC.generateALTOWCQRCode2(altoWCObj, amount);
};

/**
 * Check if current POS terminal is configured to use MLC
 */
ALTOWC.isALTOWCConfigured = function() {
	var isConfigured = false;
	/*$.ajax({
		url : posWebContextPath + "/cashier/MLC/isConfigured",
		type : "GET",
		async : false,
		success : function(response) {
			isConfigured = response;
		}
	});*/
	isConfigured = true;
	return isConfigured;
};

ALTOWC.createALTOWCObj = function(amount) {
	var altoWCObj = {};
	altoWCObj.amount = parseInt(amount);
	uilog('DBUG', 'ALTOWC ATTEMPT: ' + saleTx.altoWCSeq);
	if(typeof saleTx.altoWCSeq == 'undefined') saleTx.altoWCSeq = 0;
	else if(parseInt(saleTx.altoWCSeq) > 99)
	{
		showMsgDialog(getMsgValue("Percobaan Pembayaran WECHAT melebihi batas maksimum", "error"));	
		return null;
	}

	if (saleTx.altoWCSeq === undefined || saleTx.altoWCSeq === 0) {
		altoWCObj.out_trade_no = saleTx.transactionId.toString();
	} else if (saleTx.altoWCSeq > 0) {
		altoWCObj.out_trade_no = saleTx.transactionId.toString() + "-" + saleTx.altoWCSeq;
	}
  altoWCObj.subject = getConfigValue("ALTO_WECHAT_SUBJECT") + saleTx.transactionId;
	// altoWCObj.amount = 1000;
	altoWCObj.mch_id = getConfigValue("ALTO_WECHAT_MCH_ID");
  altoWCObj.currency = getConfigValue("ALTO_WECHAT_CURRENCY");
  altoWCObj.operator_id = saleTx.userId;
	altoWCObj.notify_url = getConfigValue("ALTO_WECHAT_NOTIFY_URL");
	altoWCObj.h_url = getConfigValue("ALTO_WECHAT_H_URL");
	altoWCObj.r_url = getConfigValue("ALTO_WECHAT_R_URL");
	altoWCObj.trade_type = "QR_CODE";
	
	console.log("altoWCObj");
	console.log(altoWCObj);
	return altoWCObj ;
};

ALTOWC.generateALTOWCQRCode = function(altoWCObj) {
	var qrGenerated = false;

	saleTx.altoWCSeq++;
	saveTxn();	

	saleTx.altoWCQRCode = '';
	if(typeof saleTx.altoWCQRCode != 'undefined' && saleTx.altoWCQRCode != '')
	{
		CustomerPopupScreen.cus_openAltoWeChatQRCodeDialog(saleTx.altoWCQRCode);
                qrGenerated = true; 
                altoWCObj.reffNo = saleTx.altoWCReffNo;
	}
	else
	{
		$.ajax({
			url : posWebContextPath + "/cashier/altoWC/createOrder",
			type : "POST",
			async : false,
			contentType : "application/json",
			data : JSON.stringify(altoWCObj),
			success : function(data) {
				if (data["code"].toString().trim() == "0") {
					console.log(data);
					var y = JSON.parse(data["data"]);
					saleTx.altoWCQRCode = y["uri"];
					saleTx.altoWCReffNo = y["trade_no"];
					saveTxn();
					CustomerPopupScreen.cus_openAltoWeChatQRCodeDialog(y["uri"]);
					qrGenerated = true;
					altoWCObj.reffNo = y["trade_no"];
				} else if (data["code"].toString().trim() == "5515" || data["code"].toString().trim() == "1000") {
					uilog("DBUG", JSON.toString(data));
					showMsgDialog("ERROR 5515 or 1000, Please Try Again to Make ALTO Payment", "error");
					return false;
				} else if (data["code"].toString().trim() != "0") {
					uilog("DBUG", JSON.toString(data));
					showMsgDialog("Gagal dalam membuat ALTO QR Code", "error");
					return false;
				}
			},
			error : function(jqXHR, status, error) {
				qrGenerated = false;
				$("#loading-dialog").dialog("close");
				uilog("DBUG", error.message);
				showMsgDialog("Gagal dalam membuat ALTO QR Code", "error");
			}
		});
	}
	
	return qrGenerated;
};


ALTOWC.generateALTOWCQRCode2 = function(altoWCObj, amount) {
	var altoWCObj2 = {
		amount: altoWCObj.amount,
		out_trade_no: altoWCObj.out_trade_no,
		subject: altoWCObj.subject,
		mch_id: altoWCObj.mch_id,
		currency: altoWCObj.currency,
		operator_id: altoWCObj.operator_id,
		notify_url: altoWCObj.notify_url,
		trade_type: altoWCObj.trade_type
	}
	var qrGenerated = false;

	saleTx.altoWCSeq++;
	saveTxn();	

	saleTx.altoWCQRCode = '';
	if(typeof saleTx.altoWCQRCode != 'undefined' && saleTx.altoWCQRCode != '')
	{
		CustomerPopupScreen.cus_openAltoWeChatQRCodeDialog(saleTx.altoWCQRCode);
                qrGenerated = true; 
                altoWCObj.reffNo = saleTx.altoWCReffNo;
	}
	else
	{
		$("#ALTOWCScanCustQR-dialog").dialog(
			
			{ open: function(event, ui) {
					$("#ALTOWCScanCustQRDialogQRInput").val("");
					$("#ALTOWCScanCustQRDialogQRInput").prop("style", "max-width:96%;display:block;");
					$("#ALTOWCScanCustQRDialogQRMessage").prop("style", "max-width:96%;display:none;");
					$("#ALTOWCScanCustQRDialogQRInput").prop("disabled", false);
					$("#ALTOWCScanCustQRDialogQRInput").prop("placeholder", "ASK CUST TO SCAN TO BOX...");
					$("#ALTOWCScanCustQRDialogQRInput").change(function(e) {
						if (e.target.value.trim() !== "") {
							$("#ALTOWCScanCustQRDialogQRInput").prop("placeholder", "PLEASE CLICK OK NOW...");
							$("#ALTOWCScanCustQRDialogQRInput").prop("disabled", true);
							$("#ALTOWCScanCustQRDialogQRInput").prop("style", "display:none");
							$("#ALTOWCScanCustQRDialogQRMessage").prop("style", "max-width:96%;display:block;");
						}
					});
				},
				close: function() {},
				buttons: {
									"OK" : function() {
										altoWCObj2.auth_code = $("#ALTOWCScanCustQRDialogQRInput").val();
										$.ajax({
											url : posWebContextPath + "/cashier/altoWC/createOrder2",
											type : "POST",
											async : false,
											context: $(this),
											contentType : "application/json",
											data : JSON.stringify(altoWCObj2),
											success : function(data) {
												if (data["code"].toString().trim() == "0") {
													console.log(data);
													var y = JSON.parse(data["data"]);
													saleTx.altoWCQRCode = y["trade_no"];
													saleTx.altoWCReffNo = y["trade_no"];
													saveTxn();
													// CustomerPopupScreen.cus_openAltoWeChatQRCodeDialog(y["trade_no"]);
													qrGenerated = true;
													altoWCObj2.reffNo = y["trade_no"];
													$(this).dialog("close");
													ALTOWC.checkALTOWCPayment2(altoWCObj2, amount)
													// return qrGenerated;
												} else if (data["code"].toString().trim() == "5515" || data["code"].toString().trim() == "1000") {
													uilog("DBUG", JSON.toString(data));
													showMsgDialog("ERROR 5515 or 1000, Please Try Again to Make ALTO Payment", "error");
													$(this).dialog("close");
													// return qrGenerated;
												} else if (data["code"].toString().trim() != "0") {
													uilog("DBUG", JSON.toString(data));
													showMsgDialog("Gagal dalam membuat ALTO QR Code", "error");
													$(this).dialog("close");
													// return qrGenerated;
												}
											},
											error : function(jqXHR, status, error) {
												qrGenerated = false;
												$("#loading-dialog").dialog("close");
												uilog("DBUG", error.message);
												showMsgDialog("Gagal dalam membuat ALTO QR Code", "error");
											}
										});
									},
									"Cancel" : function() {
										
										saleTx.mlcQRCode = '';
																			saleTx.mlcReffNo = '';
							
										$(this).dialog("close");
									}
				}
		});
	}
	
	// return qrGenerated;
};

ALTOWC.checkALTOWCPayment = function(altoWCObj, amount) {
	var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.ALTOWECHAT.name;
	var msgContainer = $("#ALTOWCCheckPaymentDialogMsg");
	var subTotalAmtContainer = $("#ALTOWCCheckPaymentDialogMsgSubtotalAmt");
	
	$("#ALTOWCCheckPayment-dialog").dialog('option', 'buttons', {
		"Check Payment" : function() {
			var checkPaymentResp = ALTOWC.getALTOWCPaymentStatus(altoWCObj);
			// var xx = checkPaymentResp["data"];
			if (JSON.parse(checkPaymentResp["data"])["trade_status"].toString().trim() == '1') {
				var ALTOWCMerchInfo = new ALTOWCPayment({
					out_trade_no: JSON.parse(checkPaymentResp["data"])["out_trade_no"],
					trade_no: JSON.parse(checkPaymentResp["data"])["trade_no"],
					amount: JSON.parse(checkPaymentResp["data"])["amount"],
					operator_id: JSON.parse(checkPaymentResp["data"])["operator_id"],
					trade_status: JSON.parse(checkPaymentResp["data"])["trade_status"],
					paytype : JSON.parse(checkPaymentResp["data"])["paytype"]
				});
				ALTOWCMerchInfo.amount = amount;
				CASHIER.executePaymentMedia(saleTx, mediaType, amount, {ALTOWECHAT : ALTOWCMerchInfo});
				$(this).dialog("close");
				clearInputDisplay();
			} else if (JSON.parse(checkPaymentResp["data"])["trade_status"].toString().trim() == '0') {
				showMsgDialog("Payment is not finished yet", "error");
			} else {
				showMsgDialog("Error When Checking ALTO Payment Status", "error");
			}
		},
		Cancel : function() {
			/*var checkPaymentResp = MLC.getMLCPaymentStatus(altoWCObj);
			if (checkPaymentResp && CONSTANTS.MLC_PAYMENT_STATUS.EXE == checkPaymentResp.content.status) {
				showMsgDialog(
						getMsgValue("MLC_warning_xcancel_invoice"),
						"warning",
						function() {
							var MLCMerchInfo = new MLCPayment(checkPaymentResp.content.merchantInformation);
							CASHIER.executePaymentMedia(saleTx, mediaType, amount, {MLCPayment : MLCMerchInfo});
							clearInputDisplay();
						});
			} else {
				$.ajax({
					url : posWebContextPath + "/cashier/MLC/cancelInvoice/" + invoiceId,
					type : "GET",
					async : true
				});ALTOWCCheckPaymentDialogMsgSubtotalAmt
			}*/
			saleTx.mlcQRCode = '';
                        saleTx.mlcReffNo = '';

			$(this).dialog("close");
		}
	});
	subTotalAmtContainer.html("Subtotal: " + numberWithCommas(amount));
	$("#ALTOWCCheckPayment-dialog").dialog("open");
};


ALTOWC.checkALTOWCPayment2 = function(altoWCObj, amount) {
	var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.ALTOWECHAT.name;
	var msgContainer = $("#ALTOWCCheckPaymentDialogMsg");
	var subTotalAmtContainer = $("#ALTOWCCheckPaymentDialogMsgSubtotalAmt");
	
	$("#ALTOWCCheckPayment-dialog").dialog('option', 'buttons', {
		"Check Payment" : function() {
			var checkPaymentResp = ALTOWC.getALTOWCPaymentStatus(altoWCObj);
			// var xx = checkPaymentResp["data"];
			if (JSON.parse(checkPaymentResp["data"])["trade_status"].toString().trim() == '1') {
				var ALTOWCMerchInfo = new ALTOWCPayment({
					out_trade_no: JSON.parse(checkPaymentResp["data"])["out_trade_no"],
					trade_no: JSON.parse(checkPaymentResp["data"])["trade_no"],
					amount: JSON.parse(checkPaymentResp["data"])["amount"],
					operator_id: JSON.parse(checkPaymentResp["data"])["operator_id"],
					trade_status: JSON.parse(checkPaymentResp["data"])["trade_status"],
					paytype : JSON.parse(checkPaymentResp["data"])["paytype"]
				});
				ALTOWCMerchInfo.amount = amount;
				CASHIER.executePaymentMedia(saleTx, mediaType, amount, {ALTOWECHAT : ALTOWCMerchInfo});
				$(this).dialog("close");
				clearInputDisplay();
			} else if (JSON.parse(checkPaymentResp["data"])["trade_status"].toString().trim() == '0') {
				showMsgDialog("Payment is not finished yet", "error");
			} else {
				showMsgDialog("Error When Checking ALTO Payment Status", "error");
			}
		},
		// Cancel : function() {
		// 	/*var checkPaymentResp = MLC.getMLCPaymentStatus(altoWCObj);
		// 	if (checkPaymentResp && CONSTANTS.MLC_PAYMENT_STATUS.EXE == checkPaymentResp.content.status) {
		// 		showMsgDialog(
		// 				getMsgValue("MLC_warning_xcancel_invoice"),
		// 				"warning",
		// 				function() {
		// 					var MLCMerchInfo = new MLCPayment(checkPaymentResp.content.merchantInformation);
		// 					CASHIER.executePaymentMedia(saleTx, mediaType, amount, {MLCPayment : MLCMerchInfo});
		// 					clearInputDisplay();
		// 				});
		// 	} else {
		// 		$.ajax({
		// 			url : posWebContextPath + "/cashier/MLC/cancelInvoice/" + invoiceId,
		// 			type : "GET",
		// 			async : true
		// 		});ALTOWCCheckPaymentDialogMsgSubtotalAmt
		// 	}*/
		// 	saleTx.mlcQRCode = '';
    //                     saleTx.mlcReffNo = '';

		// 	$(this).dialog("close");
		// }
	});
	subTotalAmtContainer.html("Subtotal: " + numberWithCommas(amount));
	$("#ALTOWCCheckPayment-dialog").dialog("open");
};

ALTOWC.getALTOWCPaymentStatus = function(altoWCObj) {
	var msgContainer = $("#ALTOWCCheckPaymentDialogMsgALTOWCCheckPaymentDialogMsgSubtotalAmt");
	msgContainer.html("<em>Please wait...</em>");
	var checkPaymentResp = null;
	// {"data":{"out_trade_no":"TRXNATHAN1566444126886","trade_no":"32031908221127381263","mch_id":"102544"}}
	var ob = {
		out_trade_no: altoWCObj["out_trade_no"],
		trade_no: altoWCObj["reffNo"],
		mch_id: altoWCObj["mch_id"]
	};
	$.ajax({
		url : posWebContextPath + "/cashier/altoWC/checkPaymentStatus",
		type : "POST",
		async : false,
		contentType : "application/json",
		data : JSON.stringify(ob),
		success : function(response) {
			checkPaymentResp = response;
		},
		error : function(jqXHR, status, error) {
			msgContainer.html("Internal Server Error. Please Try Again.");
		}
	});
	return checkPaymentResp;
};
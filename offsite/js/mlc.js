var MLC = MLC|| {};

var MLCPayment = function(mlcInfo) {
	// this.acntNo = maskCardNoMLC(mlcInfo.CardNo);
	this.acntNo = mlcInfo.PaymentSource;
	this.amount = mlcInfo.amount;
	this.approvalCode = mlcInfo.ApprovalCode;
	this.rc = mlcInfo.RC;
	this.rcDesc = mlcInfo.RCDesc;
	this.customerName = mlcInfo.CustName;
	this.reffNo = mlcInfo.ReffNo;
	this.sourceId = mlcInfo.source_id;
};

MLC.payWithMLC = function(amount) {
	$("#loading-dialog").dialog("open");
	
	var mlcObj = MLC.createMLCObj(amount);
	if(mlcObj == null) return false;
	
	if(MLC.generateMLCQRCode(mlcObj))
		MLC.checkMLCPayment(mlcObj.reffNo, amount);
	
	if ($("#loading-dialog").dialog("isOpen")) {
		$("#loading-dialog").dialog("close");
	}
};

/**
 * Check if current POS terminal is configured to use MLC
 */
MLC.isMLCConfigured = function() {
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

MLC.createMLCObj = function(amount) {
	var mlcObj = {};
	mlcObj.amount = amount;
	uilog('DBUG', 'MLC ATTEMPT: ' + saleTx.mlcSeq);
	if(typeof saleTx.mlcSeq == 'undefined') saleTx.mlcSeq = 0;
	else if(parseInt(saleTx.mlcSeq) > 99)
	{
		showMsgDialog(getMsgValue("Pembayaran melebihi batas maksimum", "error"));	
		return null;
	}

	mlcObj.transactionId = saleTx.transactionId.substr(saleTx.transactionId.length - 4) + ("0" + saleTx.mlcSeq).slice(-2);
	mlcObj.tid = configuration.mlctid;
	mlcObj.mid = configuration.properties['MLC_MID'];
	var codeBank = "0000";
	var sourceType = "00";

	if (saleTx.coBrandNumberWithoutMask == "489087" || saleTx.coBrandNumberWithoutMask == "60171556"){
		codeBank = "0426";
		sourceType = "30";
	} else if (saleTx.coBrandNumberWithoutMask == "421408"){
		codeBank = "0426";
		sourceType = "10";
	}

	mlcObj.paymentType = codeBank + sourceType;
	uilog('DBUG', 'mlcObj.paymentType: ' + mlcObj.paymentType);
	console.log("mlcObj");
	console.log(mlcObj);
	return mlcObj ;
};

MLC.generateMLCQRCode = function(mlcObj) {
	var qrGenerated = false;

	saleTx.mlcSeq++;
	saveTxn();	

	if(typeof saleTx.mlcQRCode != 'undefined' && saleTx.mlcQRCode != '')
	{
		CustomerPopupScreen.cus_openMLCQRCodeDialog(saleTx.mlcQRCode);
                qrGenerated = true; 
                mlcObj.reffNo = saleTx.mlcReffNo;
	}
	else
	{
		$.ajax({
			url : posWebContextPath + "/cashier/mlc/generateQRCode",
			type : "POST",
			async : false,
			contentType : "application/json",
			data : JSON.stringify(mlcObj),
			success : function(data) {
				//only for development test
				// var data = {
				// 	"RC": "00",
				// 	"RCDesc": "SUCCESS",
				// 	"QRCode": "02|10000|2sacawe12325|1|1|0002|p1MJpA9UFoJg48QpyujrD9WPMrn/7+KH9Aai5HlsuIU=",
				// 	"ReffNo": "1234567890123456"
				// }
				if(data.RC != '00')
				{
					showMsgDialog('Gagal dalam membuat QR Code: ' + data.RCDesc + '(' + data.RC + ')', "error");
					return false;
				}
				saleTx.mlcQRCode = data.QRCode;
				saleTx.mlcReffNo = data.ReffNo;
				saveTxn();
				
				CustomerPopupScreen.cus_openMLCQRCodeDialog(data);
				qrGenerated = true;
				mlcObj.reffNo = data.ReffNo;
			},
			error : function(jqXHR, status, error) {
				qrGenerated = false;
				$("#loading-dialog").dialog("close");
				uilog("DBUG", error.message);
				showMsgDialog("Gagal dalam membuat QR Code", "error");
			}
		});
	}
	
	return qrGenerated;
};

MLC.checkMLCPayment = function(reffNo, amount) {
	var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name;
	var msgContainer = $("#MLCCheckPaymentDialogMsg");
	var subTotalAmtContainer = $("#MLCCheckPaymentDialogMsgSubtotalAmt");
	
	$("#MLCCheckPayment-dialog").dialog('option', 'buttons', {
		"Check Payment" : function() {
			var checkPaymentResp = MLC.getMLCPaymentStatus(reffNo);
			switch(checkPaymentResp.RC) {
				case '00':
					var MLCMerchInfo = new MLCPayment(checkPaymentResp);
					MLCMerchInfo.amount = amount;
					//get payment source
					var paymentSource = MLCMerchInfo.acntNo.substring(0,8);
					//allo payment
					if(paymentSource == CONSTANTS.QRIS_PAYMENT_SOURCE.ALLO){
						mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.ALLO_PAYMENT.name;
					}
					CASHIER.executePaymentMedia(saleTx, mediaType, amount, {MLCPayment : MLCMerchInfo});
					$(this).dialog("close");
					clearInputDisplay();
					break;
				default:
					showMsgDialog(checkPaymentResp.RC + '-' + checkPaymentResp.RCDesc, "error");
					//$(this).dialog("close");
					break;
			}
		},
		Cancel : function() {
			/*var checkPaymentResp = MLC.getMLCPaymentStatus(reffNo);
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
				});
			}*/
			saleTx.mlcQRCode = '';
                        saleTx.mlcReffNo = '';

			$(this).dialog("close");
		}
	});
	subTotalAmtContainer.html("Subtotal: " + numberWithCommas(amount));
	$("#MLCCheckPayment-dialog").dialog("open");
};

MLC.getMLCPaymentStatus = function(reffNo) {
	var msgContainer = $("#MLCCheckPaymentDialogMsg");
	msgContainer.html("<em>Please wait...</em>");
	var checkPaymentResp = null;
	$.ajax({
		url : posWebContextPath + "/cashier/mlc/checkPayment/" + configuration.mlctid + "/" + configuration.properties['MLC_MID'] + "/" + reffNo,
		type : "GET",
		async : false,
		timeout: 5000,
		success : function(response) {
			//only for development test
			// var response = {
			// 	"RC": "00",
			// 	"RCDesc": "SUCCESS",
			// 	"CustName": "test",
			// 	"PaymentSource": "************1234",
			// 	"ApprovalCode": "123456",
			// 	"ReffNo": "1234567890123456",
			// 	"source_id": "08123456789"
			// }

			checkPaymentResp = response;
		},
		error : function(jqXHR, status, error) {
			msgContainer.html("Internal server error. Please try again.");
		}
	});
	return checkPaymentResp;
};

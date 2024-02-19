var OVO = OVO || {};

var OVOPayment = function (ovoInfo) {
	this.amount = ovoInfo.amount,
	this.refNo = ovoInfo.refNo,
	this.gracePeriod = ovoInfo.gracePeriod,
	this.traceNo = ovoInfo.traceNo,
	this.tid = ovoInfo.tid,
	this.mid = ovoInfo.mid,
	this.merchantName = ovoInfo.merchantName,
	this.userName = ovoInfo.userName,
	this.phoneNumber = ovoInfo.phoneNumber,
	this.mpan = ovoInfo.mpan,
	this.cpan = ovoInfo.cpan,
	this.address = ovoInfo.address,
	this.retrievalReferenceNumber = ovoInfo.retrievalReferenceNumber,
	this.inquiryCount = ovoInfo.inquiryCount,
	this.transactionSummary = ovoInfo.transactionSummary,
	this.issuerName = ovoInfo.issuerName,
	this.transactionId = ovoInfo.transactionId

};

OVO.payWithOVO = function (amount) {
	$("#loading-dialog").dialog("open");

	var ovoObj = OVO.createOVOObj(amount);
	if (ovoObj == null) return false;

	if (OVO.generateOVOQRCode(ovoObj)) OVO.checkOVOPayment(ovoObj.refNo, amount);

	if ($("#loading-dialog").dialog("isOpen")) {
		$("#loading-dialog").dialog("close");
	}
};

/**
 * Check if current POS terminal is configured to use OVO
 */
OVO.isOVOConfigured = function () {
	var isConfigured = false;
	isConfigured = true;
	return isConfigured;
};

OVO.createOVOObj = function (amount) {
	var ovoObj = {};

	if (typeof saleTx.ovoSeq == "undefined") saleTx.ovoSeq = 0;
	else if (parseInt(saleTx.ovoSeq) > 99) {
		showMsgDialog(getMsgValue("Pembayaran melebihi batas maksimum", "error"));
		return null;
	}

	ovoObj.traceNo = saleTx.transactionId.substr(5) + ("0" + saleTx.ovoSeq).slice(-2);
	ovoObj.tid = configuration.ovotid;
	ovoObj.mid = configuration.properties['OVO_MID'];
	ovoObj.amount = amount;
	return ovoObj;
};

OVO.generateOVOQRCode = function (ovoObj) {
	var qrGenerated = false;

	saleTx.ovoSeq++;
	saveTxn();

	if (typeof saleTx.ovoQRCode != "undefined" && saleTx.ovoQRCode != "") {
		CustomerPopupScreen.cus_openOVOQRCodeDialog(saleTx.ovoQRCode);
		qrGenerated = true;
		ovoObj.refNo = saleTx.ovorefNo;
	} else {
		$.ajax({
			url: posWebContextPath + "/cashier/ovo/generate",
			type: "POST",
			async: false,
			contentType: "application/json",
			data: JSON.stringify(ovoObj),
			success: function (res) {
				// var res = {
				// 	responseData: {
				// 		qrStr:
				// 			"00020101021126580006id.ovo01189360001201234567890215wf2jvhBsNnZyxfR0303UMI51360006id.ovo0215wf2jvhBsNnZyxfR0303UMI5204581253033605802ID5909TOKO RIKI6015Jakarta Selatan61051292062630309TOKORIKI52460006id.ovo0132c3195f77c7cb420fb2c8e4b26cceb6ee63040364",
				// 		tid: "13000004",
				// 		mid: "DBCFJKTLPKN001",
				// 		amount: 14550,
				// 		traceNo: "234567",
				// 		transactionDate: "210419",
				// 		createdAt: "2002-10-02T15:00:00.05Z+07:00",
				// 		refNo: "3434fadg343343",
				// 		expiry: 75,
				// 	},
				// 	responseCode: "00",
				// 	message: "Response Message",
				// 	expiresAt: "2020-10-10 00:00:00Z",
				// };

				var data = res.responseData;
				var responseCode = res.responseCode;
				var message = res.message;
				var expiresAt = res.expiresAt;

				if (responseCode != "00") {
					showMsgDialog(
						"Gagal dalam membuat QR Code: " +
						message +
						"(" +
						responseCode +
						")",
						"error"
					);
					return false;
				}
				saleTx.ovoQRCode = data.qrStr;
				saleTx.ovorefNo = data.refNo;
				saleTx.traceNo = data.traceNo;
				saveTxn();

				CustomerPopupScreen.cus_openOVOQRCodeDialog(data);
				qrGenerated = true;
				ovoObj.refNo = data.refNo;
			},
			error: function (jqXHR, status, error) {
				qrGenerated = false;
				$("#loading-dialog").dialog("close");
				uilog("DBUG", error.message);
				showMsgDialog("Gagal dalam membuat QR Code", "error");
			},
		});
	}

	return qrGenerated;
};

OVO.checkOVOPayment = function (refNo, amount) {
	var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.OVO_PAYMENT.name;
	var msgContainer = $("#OVOCheckPaymentDialogMsg");
	var subTotalAmtContainer = $("#OVOCheckPaymentDialogMsgSubtotalAmt");

	$("#OVOCheckPayment-dialog").dialog("option", "buttons", {
		"Check Payment": function () {
			var checkPaymentResp = OVO.getOVOPaymentStatus(refNo);
			//checkPaymentResp.responseCode = "01";
			switch (checkPaymentResp.responseCode) {
				case "00":
					var OVOMerchInfo = new OVOPayment(checkPaymentResp.responseData);
					OVOMerchInfo.amount = amount;
			
					CASHIER.executePaymentMedia(saleTx, mediaType, amount, {
						OVOPayment: OVOMerchInfo,
					});
					$(this).dialog("close");
					clearInputDisplay();
					break;
				default:
					showMsgDialog(
						checkPaymentResp.responseCode + "-" + checkPaymentResp.message,
						"error"
					);
					//$(this).dialog("close");
					break;
			}
		},
		Cancel: function () {
			saleTx.ovoQRCode = "";
			saleTx.ovorefNo = "";

			$(this).dialog("close");
		},
	});
	subTotalAmtContainer.html("Subtotal: " + numberWithCommas(amount));
	$("#OVOCheckPayment-dialog").dialog("open");
};

OVO.getOVOPaymentStatus = function (refNo) {
	var msgContainer = $("#OVOCheckPaymentDialogMsg");
	msgContainer.html("<em>Please wait...</em>");
	var checkPaymentResp = null;

	var ovoObj = {};
	ovoObj.tid = configuration.ovotid;
	ovoObj.mid = configuration.properties['OVO_MID'];
	ovoObj.traceNo = saleTx.transactionId.substr(5);
	ovoObj.refNo = refNo;

	$.ajax({
		url: posWebContextPath + "/cashier/ovo/inquiry",
		type: "POST",
		async: false,
		contentType: "application/json",
		data: JSON.stringify(ovoObj),
		success: function (res) {
			//only for development test
			// var res = {
			// 	responseData: {
			// 		amount: 14550,
			// 		refNo: "123434fadg343343",
			// 		gracePeriod: "30",
			// 		traceNo: "31212",
			// 		tid: "13000004",
			// 		mid: "DBCFJKTLPKN0001",
			// 		merchantName: "Delicio LK",
			// 		userName: "te********",
			// 		phoneNumber: "89********",
			// 		mpan: "9630570000051061610 ",
			// 		cpan: "9360091800051061610",
			// 		address: "test address",
			// 		retrievalReferenceNumber: "010210002",
			// 		inquiryCount: 10,
			// 		transactionSummary: {
			// 			points: "0",
			// 			cash: "20000",
			// 			paylater: "0",
			// 		},
			// 		issuerName: "OVO",
			// 		transactionId: "1231221",
			// 	},
			// 	responseCode: "00",
			// 	message: "Response Message",
			// 	expiresAt: "2020-10-10 00:00:00Z",
			// };

			checkPaymentResp = res;
		},
		error: function (jqXHR, status, error) {
			msgContainer.html("Internal server error. Please try again.");
		},
	});
	return checkPaymentResp;
};

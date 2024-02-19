var GIFTCARD_MMS = {};
var isGcMmsActivation = false;
var isGcMmsRedemption = false;
var isGcMmsInquiry = false;
var isGcMmsPreActivate = false;
var preRedeemedItems = [];
var gcMMSStatus = "";
var giftcardTemp = [];

$(document).ready(function() {
	
});

GIFTCARD_MMS.isGiftCardMMS = function(){
    return getConfigValue("MMSGC_FLAG");
}

GIFTCARD_MMS.requestUrl = function(type){
    uilog('DBUG', "Request URL MMS : " + type);
	return getConfigValue("MMS_CRM_WEB")+"giftcard/"+type.toLowerCase();
	//return getConfigValue("MMS_CRM_WEB");
	//return 0;
}

/***********************************************
 * GC MMS Request Param Start
 ***********************************************/
// for pre-activation/pre-redemption/gc inquiry request
var GiftCardMMSRequestParam = function (cardNumber, payment) {
	
	this.merchantId	  = "";
	this.terminalId	  = "";
	this.cashierId	  = "";
	this.cardNo		  = "";   
	this.validationKey = "";
	this.requestType   = "";
	this.url           = "";
	
	this.merchantId			= configuration.storeCode;
	this.terminalId			= configuration.terminalCode;
	this.cashierId			= loggedInUsername;
   
	this.cardNo				= cardNumber;   
	this.validationKey 		= $.md5(configuration.storeCode+configuration.terminalCode+loggedInUsername+cardNumber+getConfigValue("CRM_MMS_SECRET_KEY"));
	
    var req = ""; 
	if (isGcMmsRedemption && !inquiryOnRedeem) {
		this.redemptionAmount = payment;
		this.transactionNo		= cutTransactionId(saleTx.transactionId);
		var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
		var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
		this.transactionDate	= localISOTime;//(new Date()).toISOString().slice(0, -1);
		console.log("transactionDate : " + new Date());
		console.log("transactionDate : " + this.transactionDate);
        req = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.REDEEM.name;
	} else if(isGcMmsInquiry && inquiryOnRedeem){
        req = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.INQUIRE.name;
    } else {
        req = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.PRE_ACTIVATE.name;
	}
    this.requestType = req.toLowerCase();
    this.url = GIFTCARD_MMS.requestUrl(this.requestType);
}

var cutTransactionId = function (transactionId){
	var firstDigit = transactionId.substring(1,0);
	var secondDigit = transactionId.substring(2,8);
	var thirdDigit = transactionId.substring(9,17);
	var transactionNumber = firstDigit+secondDigit+thirdDigit;
	return transactionNumber;
}

// for activation request
var GiftCardMMSConfirmActivationRequestParam = function (cardNumber) {
	this.merchantId			= configuration.storeCode;
	this.terminalId			= configuration.terminalCode;
	this.cashierId			= loggedInUsername;
	this.validationKey 		= $.md5(configuration.storeCode+configuration.terminalCode+loggedInUsername+cutTransactionId(saleTx.transactionId)+getConfigValue("CRM_MMS_SECRET_KEY"));
	this.transactionNo		= cutTransactionId(saleTx.transactionId);
	var tzoffset			 = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
	var localISOTime		 = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
	this.transactionDate	= localISOTime;
	//this.transactionDate	= (new Date()).toISOString().slice(0, -1);
	this.items 				= cardNumber;
    this.requestType = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.ACTIVATE.name;
    this.url = GIFTCARD_MMS.requestUrl(this.requestType);
}

// for redemption request
var GiftCardMMSConfirmRedemptionRequestParam = function (gcItems) {
	this.merchantId			= configuration.storeCode;
	this.terminalId			= configuration.terminalCode;
	this.cashierId			= loggedInUsername;
	this.validationKey 		= $.md5(configuration.storeCode+configuration.terminalCode+loggedInUsername+cutTransactionId(saleTx.transactionId)+getConfigValue("CRM_MMS_SECRET_KEY"));
	this.transactionNo		= cutTransactionId(saleTx.transactionId);
	this.transactionDate	= new Date();
	this.items 				= gcItems;
}

// for voiding request
var GiftCardMMSVoidRequestParam = function (refTxnNo) {
	this.merchantId			= configuration.storeCode;
	this.terminalId			= configuration.terminalCode;
	this.cashierId			= loggedInUsername;
	this.validationKey 		= $.md5(configuration.storeCode+configuration.terminalCode+loggedInUsername+cutTransactionId(saleTx.transactionId)+refTxnNo.substring(2,17)+getConfigValue("CRM_MMS_SECRET_KEY"));
	this.transactionNo		= cutTransactionId(saleTx.transactionId);
	this.transactionDate	= new Date();
	this.refTransactionNo   = refTxnNo.substring(2,17);
	this.requestType		= "REDEEM/VOID";
	this.url = GIFTCARD_MMS.requestUrl(this.requestType);
}

/***********************************************
 * GC MMS Request Param End
 ***********************************************/

/***********************************************
 * GC MMS Object Definition Start
 ***********************************************/
var GCMMSCardNoRef = [];
var GIFTCARDMMSObject = null;

var GiftCardMmsItem = function(giftCardTransaction, giftCardInfo) {
	this.gcTx	= giftCardTransaction;
	this.gcInfo = giftCardInfo;
}

/**
 * GiftCard MMS Payment
 */
var GiftCardMMSPayment = function(gcNumber, cardType, gcTransaction, gcAmountPaid) {
	this.cardNumber     		= maskValueWithX(gcNumber, 9, 'LAST');
	this.cardType 				= cardType;
	this.giftCardTransactionDTO = gcTransaction;
	this.amount  				= gcAmountPaid;
}

/**
 * Initializes GiftCard MMS Object
 */
function initGiftCardMMSdObj() {
	GIFTCARDMMSObject = {
		giftCardMMSTxnArray			 	: [],
		currGiftCardTxnItem         	: null,
		currProductScanned		 		: null
	};
}

function createGiftCardMmsItem(data) {
	var gcTx = "";
	if(!isEVoucherGiftCard){
		gcTx = {
			giftCardTransactionId	: null,
			transactionId			: saleTx.transactionId,
			merchantId				: configuration.storeCode,
			cashierId				: loggedInUsername,
			terminalId				: configuration.terminalNum,
			transactionOrderIndex	: -1,
			amount					: ((data.previousAvailableBalance - data.currentBalance) < 0) ? 0 : (data.previousAvailableBalance - data.currentBalance),
			balance					: data.currentBalance,
			previousBalance			: data.previousAvailableBalance,
			transactionDate			: null,
			cardNumber				: data.cardNumber,
			expireDate				: removeAllDash(data.expireDate),
			note					: data.note,
			cardType				: data.profile.description,
			requestType				: null,
			status					: null,
			gcServerType			: "MMS"
	};
	} else {
		gcTx = {
			giftCardTransactionId	: null,
			transactionId			: saleTx.transactionId,
			merchantId				: configuration.storeCode,
			cashierId				: loggedInUsername,
			terminalId				: configuration.terminalNum,
			transactionOrderIndex	: -1,
			amount					: ((data.previousAvailableBalance - data.currentBalance) < 0) ? 0 : (data.previousAvailableBalance - data.currentBalance),
			balance					: data.currentBalance,
			previousBalance			: data.previousAvailableBalance,
			transactionDate			: null,
			cardNumber				: data.cardNumber,
			expireDate				: removeAllDash(data.expireDate),
			note					: data.note,
			cardType				: data.profile.description,
			requestType				: null,
			status					: null,
			gcServerType			: "E-MMS"
		};
	}
	
	var gcInfo = {};
	gcInfo = getGcInfo(data.cardNumber);
	if(jQuery.isEmptyObject(gcInfo)){
		gcInfo = {
			cardNumber				: data.cardNumber,
			track2Data				: data.profile.code+data.cardNumber,
			cardType				: data.profile.description,
			itemCode				: data.profile.code,
			amount					: data.faceValue
	}
	}
	
	return new GiftCardMmsItem(gcTx,gcInfo);
}
/***********************************************
 * GC MMS Object Definition End
 ***********************************************/

GIFTCARD_MMS.processGiftCardMmsTransaction = function(data) {
	if (!jQuery.isEmptyObject(data) && data['prodObj']) {
		GIFTCARDMMSObject.currProductScanned = data['prodObj'];
	}
	
	// return/refund not allowed for gift card
	if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name || saleTx.type == CONSTANTS.TX_TYPES.REFUND.name) {
		GIFTCARD_MMS.clearGiftCardMMSTransaction();
        clearInputDisplay();
        showMsgDialog(getMsgValue("giftcard_msg_return_refund_not_allowed"), "warning");
    } else if (toggleGCMMSRedemptionVoid) {
    	var voidType = data.voidType;
    	var refTxnNo = data.refTxnNo;
    	
    	if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.REDEMPTION.name === voidType) {
    		callGcMmsVoidRedemptionRequest(refTxnNo);
    	} else if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.ACTIVATION.name === voidType) {
    		callGcMmsVoidActivationRequest(refTxnNo);
    	}
    } else {
        if(connectionOnline){
        	$("#giftcard-input-dialog").dialog("open");
        	promptSysMsg();
        } else {
        	GIFTCARD_MMS.clearGiftCardMMSTransaction();
            showMsgDialog(getMsgValue("giftcard_msg_offline"), "warning");
        }
    }
}

GIFTCARD_MMS.processGiftCardMMSCardNumber = function(giftCardNumber) {
	//if(!GIFTCARDMMSObject){
		console.log("masuk ke if");
		initGiftCardMMSdObj();
	//}
	
	if (giftCardNumber == "") {
		showMsgDialog(getMsgValue("giftcard_msg_invalid_card_number"), "warning");
	} else if (isGcMmsRedemption && !inquiryOnRedeem) {
        uilog("DBUG", "isGcMmsRedemption: "+isGcMmsRedemption);
		processGiftCardMMSPayment(giftCardNumber);
	} else if (isGcMmsInquiry && inquiryOnRedeem) {
        uilog("DBUG", "isGcMmsInquiry: "+isGcMmsInquiry);
		callGcMmsInquiryRequest(giftCardNumber);
	} else {
        uilog("DBUG", "GC-MMS Pre-Activation");
		if (isCardAlreadyPreActivated(giftCardNumber)) {
            uilog("DBUG", "GC-MMS Is already activated");
			if ($("#giftcard-input-dialog").dialog("isOpen")) {
				$("#giftcardStatus").html("Error Requesting Gift Card" 
						+ "<br/>Error Message: Cannot pre-activate Card"
						+ "<br/>Detail: Card already pre-activated");
			}else if ($("#evoucher-input-dialog").dialog("isOpen")) {
				$("#giftcardStatus1").html("Error Requesting Gift Card" 
						+ "<br/>Error Message: Cannot pre-activate Card"
						+ "<br/>Detail: Card already pre-activated");
			}
		} else {
            uilog("DBUG", "GC-MMS callGcMmsPre-ActivationRequest");
            uilog("DBUG", "GC-MMS callGcMmsPre-ActivationRequest gcNumber: "+giftCardNumber);
            isGcMmsActivation = true;
			callGcMmsActivationRequest(giftCardNumber);
            //activationRequest(giftCardNumber);
		}
	} 
}

function activationRequest(giftCardNumber){
    var data = JSON.stringify(new GiftCardMMSRequestParam(giftCardNumber));
	var response = "";
	$.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard-mms/process',
		dataType : 'json',
		async: false,
		contentType : "application/json",
		data : data,
		timeout: 30000,
		success : function(responsed) {
			response = responsed;
			uilog('DBUG', "response Gift Card pre-Activate");
			uilog('DBUG', responsed);
		},
		error : function() {
			if ($("#giftcard-input-dialog").dialog("isOpen")) {
				$("#giftcardStatus").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
			}else{
				$("#giftcardStatus1").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
				
			}
			clearInputDisplay();
		}
	});
	return response;
}

GIFTCARD_MMS.hasGCMMSRedemption = function(payments) {
	var hasGCRedemption = false;
	for (var ctr = 0; ctr < payments.length; ctr++) {
		if(CONSTANTS.PAYMENT_MEDIA_TYPES.GC_MMS.name === payments[ctr].paymentMediaType) {
			hasGCRedemption = true;
			break;
		}
	}
	return hasGCRedemption;
}

GIFTCARD_MMS.hasGCMMSActivation = function(orderItems) {
	var hasGCActivation = false;
	for (var ctr = 0; ctr < orderItems.length; ctr++) {
		if("gift card" === orderItems[ctr].categoryId.toLowerCase()) {
			hasGCActivation = true;
			break;
		}
	}
	return hasGCActivation;
}

GIFTCARD_MMS.endGCMMSTransaction = function() {
	// set to default value 
	if (isGcMmsActivation)
		isGcMmsActivation = false;
	else if (isGcMmsRedemption)
		isGcMmsRedemption = false;
	else if (isGcMmsInquiry)
		isGcMmsInquiry = false;
}

GIFTCARD_MMS.clearGiftCardMMSTransaction = function() {
	isGcMmsActivation = false;
	isGcMmsRedemption = false;
	isGcMmsInquiry = false;
	inquiryOnRedeem = false;
	isOnGcMmsRedemptionMode = false;
	GCMMSCardNoRef = [];
	GIFTCARDMMSObject = null;
	gcPaymentAmount = 0;
	toggleGCMMSRedemptionVoid = false;
	preRedeemedItems = [];
	giftcardTemp = [];
}

/**
 * Gift Card MMS pre-activation request
 * @param giftCardNumber
 */
function callGcMmsActivationRequest(giftCardNumber) {
	var isSuccessful = false;
    var data = JSON.stringify(new GiftCardMMSRequestParam(giftCardNumber));
	$.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard-mms/process',
		dataType : 'json',
		async: false,
		contentType : "application/json",
		data : data,
		timeout: 5000,
		success : function(response) {
			if (response.successful) {
				var giftCardItem = findItem(lastBarcodeScanned);
				uilog('DBUG', "GiftCardItem Pre-Activation : " + JSON.stringify(giftCardItem));
				if (giftCardItem.currentPrice == response.cardInfos[0].faceValue) {
					GIFTCARDMMSObject.currGiftCardTxnItem = createGiftCardMmsItem(response.cardInfos[0]);
					GCMMSCardNoRef.push({cardNo:response.cardInfos[0].cardNumber,amount:response.cardInfos[0].amount});
					GIFTCARDMMSObject.currProductScanned = giftCardItem;
					addGiftCardItem(GIFTCARDMMSObject.currProductScanned);
					if(!jQuery.isEmptyObject(GIFTCARDMMSObject.currGiftCardTxnItem.gcInfo)){
						saveGiftCardInfo(GIFTCARDMMSObject.currGiftCardTxnItem.gcInfo);
					}
					giftcardTemp.push(GIFTCARDMMSObject);
					saleTx.giftcard = giftcardTemp;
					saveTxn();
					
					$("#giftcard-input-dialog").dialog("close");
					//showMsgDialog("Current Balance: " + response.cardInfos[0].faceValue + " Rp", "info");
					isSuccessful = true;
					uilog("DBUG","Sucessful GiftCard MMS Pre-Activation...");
				} else {
					showMsgDialog("Invalid Gift Card barcode", "warning");
				}
			}/* else if(response.errorCode == "2001") {
				uilog('DBUG', "Change from MMS to OGLOBA");
				processGiftCardRequest(giftCardNumber);
			}*/ else {
				if ($("#giftcard-input-dialog").dialog("isOpen")) {
					$("#giftcardStatus").html("Error Requesting Gift Card" 
							+ "<br/>Error Message: " + response.errorMessage
							+ "<br/>Detail: " + response.detailMessage);
				}else{
							$("#giftcardStatus1").html("Error Requesting Gift Card" 
							+ "<br/>Error Message: " + response.errorMessage
							+ "<br/>Detail: " + response.detailMessage);

				}
				clearInputDisplay();
			}
		},
		error : function() {
			if ($("#giftcard-input-dialog").dialog("isOpen")) {
				$("#giftcardStatus").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
			}else{
				$("#giftcardStatus1").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
				
			}
			clearInputDisplay();
		}
	});
	return isSuccessful;
}

/**
 * Gift Card MMS activation request
 */
function callGcMmsConfirmActivationRequest() {
	var isSuccessful = false;
	if (GCMMSCardNoRef.length) {
		var cardNos = [];
		GCMMSCardNoRef.forEach(function(data) {
			cardNos.push(data.cardNo);
		});
		
		$.ajax({
			type : 'POST',
			url : posWebContextPath + '/giftcard-mms/process',
			dataType : 'json',
			async: false,
			contentType : "application/json",
			data :  JSON.stringify(new GiftCardMMSConfirmActivationRequestParam(cardNos)),
			timeout: 30000,
			success : function(response) {
				if (response.successful) {
					response.cardInfos.forEach(function(data) {
						var giftCardItem = createGiftCardMmsItem(data);
						giftCardItem.gcTx.giftCardTransactionId = getGCMMSTxnIdNextValue();
						giftCardItem.gcTx.requestType = 'A';
						giftCardItem.gcTx.status = 'Y';
						giftCardItem.gcTx.transactionDate = response.processedDateTime;
						giftCardItem.gcTx.trxId = giftCardItem.gcInfo.gcId;
						giftCardItem.gcTx.amount = giftCardItem.gcInfo.amount;
						GIFTCARDMMSObject.giftCardMMSTxnArray.push(giftCardItem);
					});
					// saving gc mms transactions by batch
					if (saveGiftCardMMSTransactions(GIFTCARDMMSObject.giftCardMMSTxnArray)) {
						isSuccessful = true;
						uilog("DBUG","Sucessful GiftCard MMS Activation...");
					}
				} else {
					showMsgDialog("Error Requesting Gift Card" 
							+ "<br/>Error Message: " + response.errorMessage
							+ "<br/>Detail: " + response.detailMessage, "error");
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error Requesting Gift Card" + "<br/>Status: " + status + " - " + error, "error");
			}
		});
	}
	return isSuccessful;
}

/**
 * Gift Card MMS pre-redeem request
 * @param giftCardNumber
 */
function callGcMmsRedemptionRequest(giftCardNumber,payment) {
	var isSuccessful = false;
	$.ajax({
		type : 'POST',
            url : posWebContextPath + '/giftcard-mms/process',
		dataType : 'json',
		async: false,
		contentType : "application/json",
		data :  JSON.stringify(new GiftCardMMSRequestParam(giftCardNumber,payment)),
		timeout: 30000,
		success : function(response) {
			if (response.successful) {
                    uilog("DBUG", "GC MMS redemption isSuccessful: "+isSuccessful);
				GIFTCARDMMSObject.currGiftCardTxnItem = createGiftCardMmsItem(response.cardInfos[0]);
                    GIFTCARDMMSObject.currGiftCardTxnItem.gcTx.giftCardTransactionId = getGCMMSTxnIdNextValue();
				GCMMSCardNoRef.push({cardNo:response.cardInfos[0].cardNumber,amount:gcPaymentAmount});
				
				giftcardTemp.push(GIFTCARDMMSObject);
				saleTx.giftcard = giftcardTemp;
				saveTxn();
				
				isSuccessful = true;
				preRedeemedItems.push(response);
					if(isEVoucherGiftCard){
					$("#evoucher-input-dialog").dialog("close");	
					} else {
                    $("#giftcard-input-dialog").dialog("close");
					}
                    //uilog("DBUG","Sucessful GiftCard MMS Pre-Redeem...");
			}/* else if(response.errorCode == "2001") {
				uilog('DBUG', "Change from MMS to OGLOBA");
				processGiftCardRequest(giftCardNumber);
			}*/ else {
				if ($("#giftcard-input-dialog").dialog("isOpen")) {
					$("#giftcardStatus").html("Error Requesting Gift Card" 
							+ "<br/>Error Message: " + response.errorMessage
							+ "<br/>Detail: " + response.detailMessage);
				}else{
							$("#giftcardStatus1").html("Error Requesting Gift Card" 
							+ "<br/>Error Message: " + response.errorMessage
							+ "<br/>Detail: " + response.detailMessage);
					
				}
			}
		},
		error : function() {
			if ($("#giftcard-input-dialog").dialog("isOpen")) {
				$("#giftcardStatus").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
			}else{
				$("#giftcardStatus1").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
				
			}
		}
	});
	
	return isSuccessful;
}

function isBarcodeAlreadyPreRedeemed(giftCardNumber) {
	var isBarcodeAlreadyPreRedeemed = false;
	preRedeemedItems.forEach(function(preRedeemedItem) {
		if (preRedeemedItem.barcode == giftCardNumber) {
			isBarcodeAlreadyPreRedeemed = true;
		}
	});
	return isBarcodeAlreadyPreRedeemed;
}

/**
 * Gift Card MMS redemption request
 */
function callGcMmsConfirmRedemptionRequest() {
	var isSuccessful = false;
	if (GCMMSCardNoRef.length) {
		preRedeemedItems.forEach(function(data) {
			var giftCardItem = createGiftCardMmsItem(data.cardInfos[0]);
			giftCardItem.gcTx.requestType = 'P';
			giftCardItem.gcTx.status = 'Y';
			giftCardItem.gcTx.transactionDate = data.processedDateTime;
			// generate gc id in client side for gc payment purposes (for gc mms confirm redemption only)
			giftCardItem.gcTx.giftCardTransactionId = getGCMMSTxnIdNextValue();
			GIFTCARDMMSObject.currGiftCardTxnItem = giftCardItem;
			GIFTCARDMMSObject.giftCardMMSTxnArray.push(giftCardItem);
		});
		// get the only object in the array, save it separately to avoid duplicate object in the server
		var tempGCTxnArr = GIFTCARDMMSObject.giftCardMMSTxnArray.slice(0, 1);
		// saving gc mms transaction by single object
		//if (saveGiftCardMMSTransactions(tempGCTxnArr)) {
			isSuccessful = true;
			uilog("DBUG","Sucessful GiftCard MMS Redemption...");
		//}
	}
	
	// remove the pre-redeem cardnumber in the GCMMSCardNoRef array, there is only 1 cardnumber
	// existing so just initialize it to default
	GCMMSCardNoRef = [];
	
	return isSuccessful;
}

function trimGCMMSCardNoRef(GCMMSCardNoRef) {
	var index = 0;
	var trimmedIndex = 0;
	var isPushed = false;
	var trimmedGCMMSCardNoRef = [];
	GCMMSCardNoRef.forEach(function(data) {
		if (trimmedGCMMSCardNoRef.length > 0) {
			trimmedGCMMSCardNoRef.forEach(function(trimmedData) {
				if (data.cardNo == trimmedData.cardNo) {
					trimmedGCMMSCardNoRef[trimmedIndex].amount = (parseInt(trimmedGCMMSCardNoRef[trimmedIndex].amount) + parseInt(data.amount)).toString();
					isPushed = true;
				}
				trimmedIndex++;
			});
			trimmedIndex = 0;
			if (!isPushed) {
				trimmedGCMMSCardNoRef.push(data);
			}
			index++;
		} else {
			trimmedGCMMSCardNoRef.push(data);
		}
	});
	return trimmedGCMMSCardNoRef;
}

function callGcMmsVoidRedemptionRequest(refTxnNo) {
	var isSuccessful = false;
	$.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard-mms/process',
		dataType : 'json',
		async: false,
		contentType : "application/json",
		data :  JSON.stringify(new GiftCardMMSVoidRequestParam(refTxnNo)),
		timeout: 30000,
		success : function(response) {
			if (response.successful) {
				response.cardInfos.forEach(function(data) {
					var giftCardItem = createGiftCardMmsItem(data);
					giftCardItem.gcTx.giftCardTransactionId = getGCMMSTxnIdNextValue();
					giftCardItem.gcTx.requestType = 'V';
					giftCardItem.gcTx.status = 'Y';
					giftCardItem.gcTx.transactionDate = response.processedDateTime;
					GIFTCARDMMSObject.giftCardMMSTxnArray.push(giftCardItem);
				});
				GIFTCARDMMSObject.giftCardMMSTxnArray.gcTx.trxId = GIFTCARDMMSObject.giftCardMMSTxnArray.gcInfo.gcId;
				// saving gc mms transactions by batch
				if (saveGiftCardMMSTransactions(GIFTCARDMMSObject.giftCardMMSTxnArray)) {
					isSuccessful = true;
					uilog("DBUG","Sucessful GiftCard MMS Void Redemption...");
				}
			} else {
				showMsgDialog("Error Requesting Gift Card" 
						+ "<br/>Error Message: " + response.errorMessage
						+ "<br/>Detail: " + response.detailMessage, "error");
			}
		},
		error : function(jqXHR, status, error) {
			showMsgDialog("Error Requesting Gift Card" + "<br/>Status: " + status + " - " + error, "error");
		}
	});
	return isSuccessful;
}

function callGcMmsVoidActivationRequest(refTxnNo) {
	var isSuccessful = false;
	$.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard-mms/process',
		dataType : 'json',
		async: false,
		contentType : "application/json",
		data :  JSON.stringify(new GiftCardMMSVoidRequestParam(refTxnNo)),
		timeout: 30000,
		success : function(response) {
			if (response.successful) {
				response.cardInfos.forEach(function(data) {
					var giftCardItem = createGiftCardMmsItem(data);
					giftCardItem.gcTx.requestType = 'V';
					giftCardItem.gcTx.status = 'Y';
					giftCardItem.gcTx.transactionDate = response.processedDateTime;
					GIFTCARDMMSObject.giftCardMMSTxnArray.push(giftCardItem);
				});
				// saving gc mms transactions by batch
				if (saveGiftCardMMSTransactions(GIFTCARDMMSObject.giftCardMMSTxnArray)) {
					isSuccessful = true;
					uilog("DBUG","Sucessful GiftCard MMS Void Activation...");
				}
			} else {
				showMsgDialog("Error Requesting Gift Card" 
						+ "<br/>Error Message: " + response.errorMessage
						+ "<br/>Detail: " + response.detailMessage, "error");
			}
		},
		error : function(jqXHR, status, error) {
			showMsgDialog("Error Requesting Gift Card" + "<br/>Status: " + status + " - " + error, "error");
		}
	});
	
	return isSuccessful;
}

/**
 * Gift Card MMS inquiry request
 * @param giftCardNumber
 */
function callGcMmsInquiryRequest(giftCardNumber) {
	var isSuccessful = false;
    var data = JSON.stringify(new GiftCardMMSRequestParam(giftCardNumber));
    uilog("DBUG", "GC-MMS data: "+data);
	$.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard-mms/process',
		dataType : 'json',
		async: false,
		contentType : "application/json",
		data : data,
		timeout: 5000,
		success : function(response) {
			if (response.successful) {
				GIFTCARDMMSObject.currGiftCardTxnItem = createGiftCardMmsItem(response.cardInfos[0]);
                $.each(response.cardInfos, function(index, data){
                    uilog("DBUG", "GC Info item: ");
                    uilog("DBUG", data);
					var giftCardItem = createGiftCardMmsItem(data);
					giftCardItem.gcTx.requestType = 'B';
					giftCardItem.gcTx.transactionDate = response.processedDateTime;
					GIFTCARDMMSObject.giftCardMMSTxnArray.push(giftCardItem);
                    
				});
                gcMMSStatus = response.status;
                
				// get the only object in the array, save it separately to avoid duplicate object in the server
				var tempGCTxnArr = GIFTCARDMMSObject.giftCardMMSTxnArray.slice(0, 1);
				var inquiry = response.cardInfos[0];
				//Check Allow Partial Redeem
				if(inquiry.profile.allowPartialRedeem == false && inquiry.currentBalance < inquiry.faceValue && inquiry.status == "ACTIVATED"){
					var result = "<em> Card Already Used </em>";
					$("#inquiryGcResult").html(result);
					$("#inquiryEvoucResult").html(result);
				} else {
					var result = "<em> Card Balance: " + numberWithCommas(inquiry.currentBalance) + "</em>";
					$("#inquiryGcResult").html(result);
					$("#inquiryEvoucResult").html(result);
				}
                
				// saving gc mms transaction by single object
				if (saveGiftCardMMSTransactions(tempGCTxnArr)) {
					$("#giftcard-input-dialog").dialog("close");
					renderGiftCardMMSBalance(giftCardNumber, GIFTCARDMMSObject.giftCardMMSTxnArray[GIFTCARDMMSObject.giftCardMMSTxnArray.length - 1]);
					isSuccessful = true;
					uilog("DBUG","Sucessful GiftCard MMS Inquiry...");
				} else {
                    uilog("DBUG","Gagal simpan");
				}
				GIFTCARDMMSObject.giftCardMMSTxnArray.pop();
			}/* else if(response.errorCode == "2001") {
				uilog('DBUG', "Change from MMS to OGLOBA");
				processGiftCardRequest(giftCardNumber);
			}*/ else {
				if ($("#giftcard-input-dialog").dialog("isOpen")) {
					$("#giftcardStatus").html("Error Requesting Gift Card" 
							+ "<br/>Error Message: " + response.errorMessage);
				}else{
							$("#giftcardStatus1").html("Error Requesting Gift Card" 
							+ "<br/>Error Message: " + response.errorMessage);
					
				}
			}
		},
		error : function() {
			if ($("#giftcard-input-dialog").dialog("isOpen")) {
				$("#giftcardStatus").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
			}else{
				$("#giftcardStatus1").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
				
			}
		}
	});
	
	if (isOnGcMmsRedemptionMode) {
		isGcMmsRedemption = true;
	}
	return isSuccessful;
}

/**
 * Get next giftcard transaction id.
 * Max length is 10 characters.
 * @returns {Number}
 */
function getGCMMSTxnIdNextValue() {
    uilog("DBUG", "GC MMS Getting TRX ID");
	var nextVal = -1;
	$.ajax({
		type : 'GET',
		url : posWebContextPath + '/giftcard-mms/getnextvalue',
        contentType : "text/html",
        dataType : 'text',
		async : false,
		success : function(response) {
            if(response != null){
                uilog("DBUG", "GC MMS Getting TRX ID response: "+response);
                nextVal = response;
            }
		},
		error : function(jqXHR, status, error) {
			showMsgDialog(getMsgValue("giftcard_msg_next_tx_id_err"), "error");
            uilog("DBUG", "GC MMS Getting TRX ID error: "+error);
		}
	});
    uilog("DBUG", "GC MMS TRX ID: "+nextVal);
	return nextVal;
}

/**
 * Save GC MMS items
 * @param giftCardTransaction
 * @returns
 */
function saveGiftCardMMSTransactions(gcItemsArr){
    var isSaved = false;
    var data = JSON.stringify(gcItemsArr);
    uilog("DBUG", "GC Data to save: "+data);
    $.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard-mms/save_trx',
		dataType : 'json',
		contentType : "application/json",
		data : data,
		async : false,
        timeout: 5000,
		success : function(response) {
			uilog("DBUG","Save Response");
            uilog("DBUG",response);
            isSaved = response.status;
		},
		error : function(jqXHR, status, error) {
			//showMsgDialog(getMsgValue("giftcard_msg_saving_giftcard_tx_err") + error, "error");
            uilog("DBUG", "Error: "+error);
		}
	});
    
    return isSaved;
}
/**
 * Save GC MMS items
 * @param giftCardTransaction
 * @returns
 */
function saveGiftCardMMSPayment(gcItemsArr){
    var isSaved = false;
    var data = JSON.stringify(gcItemsArr);
    uilog("DBUG", "GC Data to save: "+data);
    $.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard-mms/save_payment',
		dataType : 'json',
		contentType : "application/json",
		data : data,
		async : false,
        timeout: 5000,
		success : function(response) {
			uilog("DBUG","Save Response");
            uilog("DBUG",response);
            isSaved = response.status;
		},
		error : function(jqXHR, status, error) {
			//showMsgDialog(getMsgValue("giftcard_msg_saving_giftcard_tx_err") + error, "error");
            uilog("DBUG", "Error: "+error);
		}
	});
    
    return isSaved;
}

function processGiftCardMMSPayment(giftCardNumber) {
	var success = callGcMmsRedemptionRequest(giftCardNumber, gcPaymentAmount);
	// if success is equal to true then confirm the redemption transaction right away
	if (success) {
		// if true then execute payment media process
//		if(callGcMmsConfirmRedemptionRequest()) {
	
			var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.GC_MMS.name;
			var giftCardTxnObj = GIFTCARDMMSObject.currGiftCardTxnItem.gcTx;
			var giftCardInfoObj = GIFTCARDMMSObject.currGiftCardTxnItem.gcInfo;
			gcPaymentAmount = giftCardTxnObj.amount;
			giftCardTxnObj.requestType = 'P';
			giftCardTxnObj.status = 'Y';
			giftCardTxnObj.trxId = giftCardInfoObj.gcId;
			saveGiftCardMMSPayment(giftCardTxnObj);
			
			CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, gcPaymentAmount, {giftCardPayment : new GiftCardMMSPayment(giftCardNumber, giftCardInfoObj.cardType, giftCardTxnObj, gcPaymentAmount)});
//		}
	}
}

function isCardAlreadyPreActivated(cardNumber) {
	var isCardPreActivated = false;
	for (var ctr = 0; ctr < GCMMSCardNoRef.length; ctr++) {
		if(cardNumber === GCMMSCardNoRef[ctr].cardNo) {
			isCardPreActivated = true;
			break;
		}
	}
	return isCardPreActivated;
}

/**
 * Display GC MMS balance inquiry in both cashier and customer view
 */
function renderGiftCardMMSBalance(cardNumber, responseData) {
	var clonedObj = cloneObject(responseData);
	
	if(isEVoucherGiftCard){
		$("#evoucher-balance-dialog").data("gcBalanceDetails", {
			gcNumber : cardNumber,
			gcInfo   : clonedObj.gcInfo,
			gcTx	 : clonedObj.gcTx,
		}).dialog("open");
	} else {
	$("#giftcard-balance-dialog").data("gcBalanceDetails", {
		gcNumber : cardNumber,
		gcInfo   : clonedObj.gcInfo,
		gcTx	 : clonedObj.gcTx,
	}).dialog("open");
	}
	
	var itemData = {
		cardNumber : cardNumber,
		balance : numberWithCommas(clonedObj.gcTx.balance),
		currency : clonedObj.gcTx.currency,
		expireDate : clonedObj.gcTx.expireDate
	};
	CustomerPopupScreen.cus_renderGiftCardBalance(itemData);
}
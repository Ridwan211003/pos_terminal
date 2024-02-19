/************************************************
 * Gift Card Functions
 * Created by: Exist Global Inc. - mperez@exit.com
 */

/*Global Variables*/
var GIFTCARDObject = null;


/***********************************************
 * GiftCard Objects
 ***********************************************/
/**
 * GiftCardTransaction
 * Create Gift Card Transaction and initialize value
 */
var GiftCardTransaction = function (){
	this.giftCardTransactionId = null;
	this.transactionId         = saleTx.transactionId;
	this.merchantId 		   = saleTx.storeCd;
	this.cashierId 			   = loggedInUsername;
	this.terminalId 		   = configuration.terminalNum;
	this.transactionOrderIndex = -1;
	this.amount				   = 0;
	this.balance 			   = 0;
	this.previousBalance       = 0;
	this.transactionDate       = null;
	this.cardNumber 		   = null;
	this.referenceNumber 	   = null;
	this.expireDate 		   = null;
	this.pinCode 			   = null;
	this.requestType		   = null;
	this.note				   = null;
    this.mobileNumber		   = null;
    this.gcServerType		   = "OGLOBA";
    this.initialBalance        = 0;
};

/**
 * Updates GiftCardTransaction after pre-activation request is successful to Ogloba
 */
GiftCardTransaction.prototype.updateGiftCardTransactionAfterActivation = function(gcRequest, gcResponse, reqType){
	this.giftCardTransactionId  = gcRequest.transactionNumber;
	this.transactionOrderIndex  = scannedItemOrder;//order item tracking
	this.cardNumber 			= gcResponse.cardNumber;
	this.referenceNumber 		= gcResponse.referenceNumber;
	this.expireDate 			= gcResponse.expireDate;
	this.amount					= gcResponse.amount;
	this.balance 				= gcResponse.balance;
	this.previousBalance        = gcResponse.previousBalance;
	this.requestType			= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].code;
};

/**
 * Updates GiftCardTransaction after confirmed request is successful to Ogloba
 */
GiftCardTransaction.prototype.updateGiftCardTransactionAfterConfirmed = function(gcResponse, requestType){
	this.giftCardTransactionId  = findGiftCardTransactionIdNextValue();
	this.referenceNumber 		= gcResponse.referenceNumber;
	this.balance 				= gcResponse.balance;
	this.pinCode				= gcResponse.pinCode;
	this.requestType 			= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[requestType].code;
};

/**
 * Updates GiftCardTransaction after balance inquiry request is successful to Ogloba
 */
GiftCardTransaction.prototype.updateGiftCardTransactionAfterInquiry = function(giftCardNumber, gcRequest, gcResponse, requestType){
	this.giftCardTransactionId  = gcRequest.transactionNumber;
	this.cardNumber				= giftCardNumber;
	this.referenceNumber 		= gcResponse.referenceNumber;
	this.balance 				= gcResponse.balance;
	this.pinCode				= gcResponse.pinCode;
	this.previousBalance		= gcResponse.previousBalance;
	this.expireDate				= gcResponse.expireDate;
	this.note					= gcResponse.note;
	this.amount					= gcResponse.amount;
	this.requestType 			= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[requestType].code;
};

/**
 * Updates GiftCardTransaction after redemption request is successful to Ogloba
 */
GiftCardTransaction.prototype.updateGiftCardTransactionAfterRedemption = function(giftCardNumber, gcRequest, gcResponse, reqType){
	this.giftCardTransactionId  = gcRequest.transactionNumber;
	this.cardNumber				= giftCardNumber;
	this.referenceNumber 		= gcResponse.referenceNumber;
	this.expireDate 			= gcResponse.expireDate;
	this.amount					= gcResponse.amount;
	this.balance 				= gcResponse.balance;
	this.previousBalance        = gcResponse.previousBalance;
	this.requestType			= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].code;
    this.initialBalance         = gcResponse.initialBalance;
};

/**
 * Updates GiftCardTransaction after cancel request is successful to Ogloba
 */
GiftCardTransaction.prototype.updateGiftCardTransactionAfterCancel = function(gcResponse, reqType){
	this.giftCardTransactionId  = findGiftCardTransactionIdNextValue();
	this.note 					= gcResponse.note;
	this.requestType			= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].code;
};

/**
 * GiftCard Info
 * Get Gift Card Info and initialize value
 */
var GiftCardInfo = function(findBy){
	return findBy;
};

/**
 * Initialize GiftCard info by product searched.
 */
var ByProduct = function(giftCardNumber, gcProduct){
	this.cardNumber 	= giftCardNumber;
	this.track2Data 	= gcProduct.ean13Code + giftCardNumber;
	this.cardType 		= gcProduct.shortDesc;
	this.itemCode 		= gcProduct.ean13Code;
	this.amount 		= gcProduct.currentPrice;
}

/**
 * Initialize GiftCard info by GiftCardInfo searched.
 */
var ByGiftCardInfo = function (gcInfo){
	this.cardNumber 	= gcInfo.cardNumber;
	this.track2Data 	= gcInfo.track2Data;
	this.cardType 		= gcInfo.cardType;
	this.itemCode 		= gcInfo.itemCode;
	this.amount 		= gcInfo.amount;
}

/**
 * GiftCard Item
 * Create GiftCard Item consisting of GiftCard Transaction and GiftCardInfo
 */
var GiftCardItem = function(giftCardInfo, giftCardTransaction, baseRequestType){
	this.gcInfo         	= giftCardInfo;
	this.gcTx				= giftCardTransaction;
	this.baseRequestType	= baseRequestType;
}

/**
 * GiftCard Payment
 */
var GiftCardPayment = function(gcNumber, cardType, gcTransaction, gcAmountPaid){
	this.cardNumber     		= maskValueWithX(gcNumber, 11, 'LAST');
	this.cardType 				= cardType;
	this.giftCardTransactionDTO = gcTransaction;
	this.amount  				= gcAmountPaid;
}
/***********************************************
 * GiftCardTransaction Obj End
 ***********************************************/

/***********************************************
 * GiftCard Request Parameters start
 ***********************************************/
//GiftCard Request Object
var GiftCardRequest = function(requestTypeObj){

	this.terminalId 			= configuration.terminalCode.toLowerCase();
	this.merchantId 			= configuration.storeCode.toLowerCase();
	this.cashierId 				= loggedInUsername;
//	this.terminalId 			= "001";//configuration.terminalCode.toLowerCase();//posNumber
//	this.merchantId 			= "9999";//configuration.storeCode.toLowerCase();//storeCode
//	this.cashierId 				= "01";//saleTx.userId;
	this.passphrase 			= getConfigValue('GIFT_CARD_PASSPHRASE');

	for (var prop in requestTypeObj){
		this[prop] = requestTypeObj[prop];
	}
}

//GiftCard Activation Request
var ActivationRequest = function(giftCardNumber, gcProduct, reqType){
	this.transactionNumber 	= findGiftCardTransactionIdNextValue();
	this.cardNumber 		= giftCardNumber;
	this.gencode			= gcProduct.ean13Code;
	this.amount				= gcProduct.currentPrice;
	this.msgType 			= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].code;
	this.note 				= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].note;
};

//GiftCard Confirmation Request
var ConfirmationRequest = function(referenceNumber, reqType){
	this.referenceNumber	= referenceNumber;
	this.note  				= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].note;
};

//GiftCard Inquiry Request
var InquiryRequest = function(giftCardNumber, gcInfo, reqType){
	this.transactionNumber  = findGiftCardTransactionIdNextValue();
	this.cardNumber 		= giftCardNumber;
	this.amount				= 0;//gcInfo.amount;
	this.msgType 			= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].code;
	this.note 				= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].note;
};

//GiftCard Redemption Request
var RedemptionRequest = function(giftCardNumber, gcInfo, payment, reqType){
	this.transactionNumber  = findGiftCardTransactionIdNextValue();
	this.amount				= payment;
	this.cardNumber 		= giftCardNumber;
	this.msgType 			= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].code;
};

//GiftCard Cancel Request
var CancelRequest = function(gcTx, reqType){
	this.referenceNumber 	= gcTx.referenceNumber;
	this.note 				= CONSTANTS.GIFTCARD.GC_REQUEST_TYPE[reqType].note;
};

/*******************************************************************************
 * Gift Card Functions Start
 ******************************************************************************/
/**
 * Initializes GiftCard Object
 */
function initGiftCardObj(){
	if(!GIFTCARDObject){
		//creates GIFTCARDObject
		GIFTCARDObject = {
			giftCardItemArray			 	: [],
			currGiftCardInfo         		: null,
			currGiftCardTransaction  		: null,
			currProductScanned		 		: null
		};
	}
}

/**
 * Creates GiftCardInfo and GiftCardTransaction Object;
 * GiftCardItem = GiftCardInfo & GiftCardTransaction;
 * @param giftCardNumber
 */
function initGiftCardItem(giftCardNumber){
	var giftCardInfo = null;
	uilog('DBUG', "initGiftCardItem isGcMmsActivation : " + isGcMmsActivation);
	if(isGcMmsActivation){
		GIFTCARDObject.currProductScanned = findItem(lastBarcodeScanned);
		uilog('DBUG', "currProductScanned : " + JSON.stringify(GIFTCARDObject.currProductScanned));
	}
	var gcProduct = null || GIFTCARDObject.currProductScanned;

	giftCardInfo = getGcInfo(giftCardNumber);
	if(jQuery.isEmptyObject(giftCardInfo) && gcProduct){
		giftCardInfo = new GiftCardInfo(new ByProduct(giftCardNumber, gcProduct));
	} else {
		giftCardInfo = new GiftCardInfo(new ByGiftCardInfo(giftCardInfo));
	}

	GIFTCARDObject.currGiftCardInfo = giftCardInfo;
	GIFTCARDObject.currGiftCardTransaction = new GiftCardTransaction();
}

/**
 * Clear-up for GiftCard Object
 */
function clearGiftCardTransaction(){
	uilog("DBUG","clearGiftCardTransaction method call...");

	//clears GIFTCARDObject if saleTx.orderItems is empty;
	//For GC Balance/Inquiry; returns the current state of the transaction if already on payment mode
//	if(!saleTx.orderItems.length){
	if(isGiftCardBalanceInquiry && !isGCActivation){
		GIFTCARDObject = null;
		enablePaymentMedia = Boolean(isEnablePaymentMedia);
	}

//	enablePaymentMedia = isGCPaymentMedia;
	isInputGiftCardNumber = false;
	isGiftCardBalanceInquiry = false;
	isEnablePaymentMedia = false;
	isGCPaymentMedia = false;
	isGcMmsActivation = false;
	gcPaymentAmount = 0;

	//clears GIFTCARDObject properties after each request
	if(GIFTCARDObject){
		GIFTCARDObject.currGiftCardTransaction = null;
		GIFTCARDObject.currProductScanned = null;
		GIFTCARDObject.giftCardInfo = null;
	}

	//clears GIFTCARDObject if saleTx.orderItems is empty;
	if(!saleTx.orderItems.length){
		GIFTCARDObject = null;
	}
}

/**
 * Process giftcard number after scan/input
 * @param giftCardNumber
 */
function processGiftCardRequest(giftCardNumber){

	//initilialize/create giftcard transaction,info objects
	uilog('DBUG', "giftCardNumber :" + giftCardNumber);
	initGiftCardItem(giftCardNumber);
	
	if (giftCardNumber == "") {
		showMsgDialog(getMsgValue("giftcard_msg_invalid_card_number"), "warning");
	} else if (isGiftCardBalanceInquiry) {/*GC Balance*/
		uilog('DBUG', "Inquiry " + isGiftCardBalanceInquiry);
		callGcBalanceInquiry(giftCardNumber);
	} else if (isGCPaymentMedia) {/*GC Payment*/
		processGCPayment(giftCardNumber);
	} else if(toggleVoid){/*GC Cancellation*/
		processGCCancellation(giftCardNumber);
	}else {/*GC Activation puchase*/
		uilog('DBUG', "callGcRequest :" + giftCardNumber);
		callGcRequest(giftCardNumber);
	}
}

/**
 * Process GiftCard payment in the transaction.
 */
function processGCPayment(giftCardNumber){
        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "===START===");
	var requestType = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.REDEMPTION.name;
	var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name;
        
	var redemResponse = callGcRedemption(giftCardNumber, gcPaymentAmount, requestType);
        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "$redemResponse" + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + JSON.stringify(redemResponse));
        
	if (redemResponse) {
            uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "$redemResponse is true");
            //Confirm the redemption request
            if(callConfirmGcRequest()){
                    uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "if(callConfirmGcRequest())=true");
                    //puts tempGiftCardItemArray to giftcardItemArray
                    GIFTCARDObject.giftCardItemArray = cloneObject(GIFTCARDObject.tempGiftCardItemArray);
                    uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "$GIFTCARDObject.giftCardItemArray" + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + JSON.stringify(GIFTCARDObject.giftCardItemArray));

                    //clears tempGiftCardItemArray;
                    GIFTCARDObject.tempGiftCardItemArray = null;

                    CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, gcPaymentAmount, {giftCardPayment : new GiftCardPayment(giftCardNumber, GIFTCARDObject.currGiftCardInfo.cardType, GIFTCARDObject.currGiftCardTransaction, gcPaymentAmount)});
                    if ($("#giftcard-input-dialog").dialog("isOpen")) {
                            $("#giftcard-input-dialog").dialog("close");
                    }
					if ($("#evoucher-input-dialog").dialog("isOpen")) {
                            $("#evoucher-input-dialog").dialog("close");
                    }
            }
	}
        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "===FINISH===");
}

/**
 *Process GiftCard Cancellation in the transaction.
 * @param cancelResponse
 */
function processGCCancellation(giftCardNumber){
	var gcItems = GIFTCARDObject.giftCardItemArray;
	var cancelResponse = callCancelGcRequest({isToCancelAll: false, giftCardNumber : giftCardNumber});

	if(cancelResponse && gcItems && gcItems.length){
		for(var ctr = 0; ctr < gcItems.length; ctr++){
			if(giftCardNumber == gcItems[ctr].gcInfo.cardNumber){
				cancelledGCItem = gcItems.splice(ctr,1)[0];
				processVoidItemScan(cancelledGCItem.gcInfo.itemCode);
				if ($("#giftcard-input-dialog").dialog("isOpen")) {
					$("#giftcard-input-dialog").dialog("close");
				}
				break;
			}
		}
	}
}

/**
 * Display GC balance inquiry in both cashier and customer view
 */
function renderGiftCardBalance(cardNumber, responseData) {
	var expiryDate = responseData.expireDate;
	var year = expiryDate.substring(0, 4);
	var month = expiryDate.substring(4, 6);
	var day = expiryDate.substring(6, 8);
	var formattedDate = month + '/' + day + '/' + year;
	var itemData = {
		cardNumber : cardNumber,
		balance : numberWithCommas(responseData.balance),
		currency : responseData.currency,
		expireDate : expiryDate
	};
//	displayGiftCardBalance(itemData);
	CustomerPopupScreen.cus_renderGiftCardBalance(itemData);
}

/**
* Get Gift Cards to Cancel
*/
function getGiftCardItemToCancel(giftCardNumber){
	var gcItem = null;
	var gcItems = GIFTCARDObject.giftCardItemArray;
	for(var ctr = 0 ; ctr < gcItems.length; ctr ++){
		if(giftCardNumber == gcItems[ctr].gcInfo.cardNumber){
			gcItem = gcItems[ctr];
			break;
		}
	}
	return gcItem;
}

/**
 * get all giftCard items scanned/pre-activated
 */
function getGiftCardItems(){
	var gcItemArray = null;
	
	if(GIFTCARDObject && GIFTCARDObject.giftCardItemArray.length){
		gcItemArray = GIFTCARDObject.giftCardItemArray;
	} else if (GIFTCARDMMSObject && GIFTCARDMMSObject.giftCardMMSTxnArray.length) {
		gcItemArray = GIFTCARDMMSObject.giftCardMMSTxnArray;
		for (var i = 0; i < gcItemArray.length; i++) {
			if (gcItemArray[i].gcTx.requestType == 'A') {
				gcItemArray[i].baseRequestType = 'ACTIVATION';
			} else if (gcItemArray[i].gcTx.requestType == 'P') {
				gcItemArray[i].baseRequestType = 'REDEMPTION';
			}
		}
	}
	
	return gcItemArray;
}

/**
 * Create GiftCard next transaction id.
 * @param nextVal
 * @returns
 */
function getGiftCardTransactionId(nextVal){
	var posNumber = configuration.terminalNum;

	//pos number + 7 digit id; Warning max is 10 string
	return ('000'.substr(0,3 - posNumber.toString().length) + posNumber)
	+ ('0000000'.substr(0, 7 - nextVal.toString().length) + nextVal);
}

/**
 * Get GiftCard items to cancel.
 * @param giftCardCancelObj
 * @returns {Array}
 */
function getGiftCardItemsToCancel(giftCardCancelObj){
	var gcItemArray = [];
	var giftCardNumber = "";
	if(giftCardCancelObj && giftCardCancelObj.giftCardNumber){
		giftCardNumber = giftCardCancelObj.giftCardNumber;
	}

	if(giftCardCancelObj && giftCardCancelObj.isToCancelAll){
		gcItemArray = GIFTCARDObject.giftCardItemArray;
	} else {
		gcItemArray.push(getGiftCardItemToCancel(giftCardNumber));
	}

	return gcItemArray;
}
/*******************************************************************************
 * Functions for gift card ends here
 ******************************************************************************/

/*******************************************************************************
 * Gift Card Ajax Calls
 ******************************************************************************/
/**
 * Call GC request web service (for activation)
 */
function callGcRequest(giftCardNumber) {
	var requestType = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.ACTIVATION.name;
	var gcProduct = GIFTCARDObject.currProductScanned;
	var gcTx = GIFTCARDObject.currGiftCardTransaction;
	var gcInfo = GIFTCARDObject.currGiftCardInfo;
	var gcItemArray = GIFTCARDObject.giftCardItemArray;

	var gcActivation = new GiftCardRequest(new ActivationRequest(giftCardNumber, gcProduct, requestType));

	return $.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard/giftCardRequest/',
		dataType : 'json',
		async: false,
		contentType : "application/json",
		data :  JSON.stringify(gcActivation),
		beforeSend: function() {
			$("#loading-dialog").dialog("open");
		},
		complete: function() {
			$("#loading-dialog").dialog("close");
			$("#loadingDialogMessage").html("");
		},
		timeout : 5000,
		success : function(data) {
			var response = data.response;
			if (response.isSuccessful) {
				uilog("DBUG","Sucessful GiftCard Activation...");
				isGCActivation = true;
				gcTx.updateGiftCardTransactionAfterActivation(gcActivation, response, requestType);
				gcTx.transactionDate = data.transactionDate;
				gcItemArray.push(new GiftCardItem(gcInfo, gcTx, requestType));
				if(!jQuery.isEmptyObject(gcInfo)){
					saveGiftCardInfo(gcInfo);
				}
				saveGiftCardTransaction(gcTx);
				addGiftCardItem(gcProduct);
				GIFTCARDObject.isGiftCardItemOrder = true;
				if ($("#giftcard-input-dialog").dialog("isOpen")) {
					$("#giftcard-input-dialog").dialog("close");
				}
				showMsgDialog("Ref #: " + response.referenceNumber
						+ "<br />Prev Balance: " + response.previousBalance
						+ " " + response.currency + "<br />Current Balance: "
						+ response.balance + " " + response.currency, "info");
				$("#giftcard-input-dialog").dialog("close");
			} else {
				var error = data.error;
				if ($("#giftcard-input-dialog").dialog("isOpen")) {
					$("#giftcardStatus").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
				}else{
					$("#giftcardStatus1").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
					
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
	}).responseText;
}

/**
 * Call GC confirm request web service
 */
function callConfirmGcRequest() {
        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "===START===");
	var gcRequest = null, isSuccess = false;
	var requestType = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.CONFIRMATION.name;

	if(GIFTCARDObject && GIFTCARDObject.giftCardItemArray && GIFTCARDObject.giftCardItemArray.length){
                uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "PRECHECK GCCONFIRM IS OK");
		$.each(GIFTCARDObject.giftCardItemArray, function(index, gcItem) {
                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "LOOPING GIFTCARDObject.giftCardItemArray");
			if(gcItem.gcTx.requestType != CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.CONFIRMATION.code){
                                uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "$gcItem.gcTx.requestType" + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + gcItem.gcTx.requestType);
				var retryCtr = 1;
				gcRequest = new GiftCardRequest(new ConfirmationRequest(gcItem.gcTx.referenceNumber,requestType));
				//giftcard item confirmation is done thrice
				while(retryCtr > 0){
                                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "$retryCtr" + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + retryCtr);
                                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/confirmGiftCardRequest/ PREPARE REQUEST");
					$.ajax({
						type : 'POST',
						url : posWebContextPath + '/giftcard/confirmGiftCardRequest/',
						dataType : 'json',
						contentType : "application/json",
						data : JSON.stringify(gcRequest),
						async : false,
						beforeSend: function() {
							$("#loading-dialog").dialog("open");
						},
						complete: function() {
                                                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/confirmGiftCardRequest/ COMPLETE REQUEST");
							$("#loading-dialog").dialog("close");
							$("#loadingDialogMessage").html("");
						},
						timeout : 5000,
						success : function(data) {
							var response = data.response;
                                                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/confirmGiftCardRequest/ SUCCESS REQUEST WITH $response"  + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + response);
							if (response.isSuccessful) {
								uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "Sucessful GiftCard Reconcilliation...");
								gcItem.gcTx.updateGiftCardTransactionAfterConfirmed(response, requestType);
								gcItem.gcTx.transactionDate = data.transactionDate;
								saveGiftCardTransaction(gcItem.gcTx);
							} else {
								//TODO: Retry process function / by Nathan
                                                                uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "Failed GiftCard Reconcilliation...");
								var error = data.error;
								if ($("#giftcard-input-dialog").dialog("isOpen")) {
									$("#giftcardStatus").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
								}else{
									$("#giftcardStatus1").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
									
								}
							}
							retryCtr = 0;
							isSuccess = true;
						},
						error : function() {
                                                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/confirmGiftCardRequest/ ERROR REQUEST");
							//TODO: Retry process function / by Nathan
							retryCtr++;
							if ($("#giftcard-input-dialog").dialog("isOpen")) {
								$("#giftcardStatus").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
							}else{
								$("#giftcardStatus1").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
								
							}
							if(retryCtr = 3){
								showMsgDialog("Unable to process giftcard item", "error");
								retryCtr = 0;
							}
							isSuccess = false;
						}
					});
				}
			}
		});
	}
        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "===START===");
	return isSuccess;
}

/**
 * Call GC cancel request web service
 */
function callCancelGcRequest(giftCardCancelObj) {
	var isCancelled = false;
	var requestType = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.CANCELLATION.name;
	var gcItems = getGiftCardItemsToCancel(giftCardCancelObj);

	if(gcItems && gcItems.length){
		$.each(gcItems, function(index, gcItem) {
			var gcCancellation = new GiftCardRequest(new CancelRequest(gcItem.gcTx, requestType));
			$.ajax({
				type : 'POST',
				url : posWebContextPath + '/giftcard/cancelGiftCardRequest/',
				dataType : 'json',
				contentType : "application/json",
				data : JSON.stringify(gcCancellation),
				async : false,
				beforeSend: function() {
					$("#loading-dialog").dialog("open");
				},
				complete: function() {
					$("#loading-dialog").dialog("close");
					$("#loadingDialogMessage").html("");
				},
				timeout : 5000,
				success : function(data) {
					var response = data.response;
					if (response.isSuccessful) {
						uilog("DBUG","Sucessful GiftCard Cancellation...");
						gcItem.gcTx.updateGiftCardTransactionAfterCancel(response, requestType);
						gcItem.gcTx.transactionDate = data.transactionDate;
						saveGiftCardTransaction(gcItem.gcTx);
						isCancelled = true;
					} else {
						var error = data.error;
						if ($("#giftcard-input-dialog").dialog("isOpen")) {
							$("#giftcardStatus").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
						}else{
							$("#giftcardStatus1").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
							
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
		});
	} else {
		if ($("#giftcard-input-dialog").dialog("isOpen")) {
			$("#giftcardStatus").html(getMsgValue("giftcard_msg_no_item_to_void"));
		}else{
			$("#giftcardStatus1").html(getMsgValue("giftcard_msg_no_item_to_void"));
			
		}
	}
	return isCancelled;
}

/**
 * Call GC request web service (for redemption)
 */
function callGcRedemption(giftCardNumber, payment, requestType) {
        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "===START===");
	var redemptionResponse = false;
	var gcTx = GIFTCARDObject.currGiftCardTransaction;
	var gcInfo = GIFTCARDObject.currGiftCardInfo;

	var gcRequest = new GiftCardRequest(new RedemptionRequest(giftCardNumber, gcInfo, payment, requestType));
	//put giftcardItemArray in temp variable;
	GIFTCARDObject.tempGiftCardItemArray = cloneObject(GIFTCARDObject.giftCardItemArray);
	//empties giftcardArray for gc redemption only
	GIFTCARDObject.giftCardItemArray.length = 0;
        
        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/giftCardRequest/ PREPARE REQUEST");

	$.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard/giftCardRequest/',
		dataType : 'json',
		contentType : "application/json",
		data : JSON.stringify(gcRequest),
		async : false,
		beforeSend: function() {
			$("#loading-dialog").dialog("open");
		},
		complete: function() {
			$("#loading-dialog").dialog("close");
			$("#loadingDialogMessage").html("");
                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/giftCardRequest/ COMPLETE REQUEST");
		},
		timeout : 5000,
		success : function(data) {
                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/giftCardRequest/ SUCCESS REQUEST");
			var response = data.response;
			if (response.isSuccessful) {
                                uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/giftCardRequest/ RETURN RESPONSE = TRUE");
				gcTx.updateGiftCardTransactionAfterRedemption(giftCardNumber, gcRequest, response, requestType);
				gcTx.transactionDate = data.transactionDate;

                                if(gcInfo.cardNumber == null && gcTx.initialBalance != null){
                                    gcInfo.cardNumber = gcTx.cardNumber;
                                    gcInfo.amount = gcTx.initialBalance;
                                    saveNonExistingGiftCardInfo(gcInfo);
                                    gcInfo = GIFTCARDObject.currGiftCardInfo;
                                }

				saveGiftCardTransaction(gcTx);
				var giftCardItem = new GiftCardItem(gcInfo, gcTx, requestType);
				GIFTCARDObject.giftCardItemArray.push(giftCardItem);
				GIFTCARDObject.tempGiftCardItemArray.push(giftCardItem);
				hasGiftCardRedemption = true;
				redemptionResponse = true;
			} else {
                                uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/giftCardRequest/ RETURN RESPONSE = FALSE");
                                GIFTCARDObject.giftCardItemArray = cloneObject(GIFTCARDObject.tempGiftCardItemArray);
				var error = data.error;
				if ($("#giftcard-input-dialog").dialog("isOpen")) {
					$("#giftcardStatus").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
				}else{
					$("#giftcardStatus1").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
					
				}
			}
		},
		error : function() {
                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/giftCardRequest/ ERROR REQUEST");
			if ($("#giftcard-input-dialog").dialog("isOpen")) {
				$("#giftcardStatus").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
			}else{
				$("#giftcardStatus1").html(getMsgValue("giftcard_msg_request_activation_timeout_err"));
				
			}
		}
	});
        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "===FINISH===");
	return redemptionResponse;
}

/**
 * Call GC request web service (for balance inquiry)
 */
function callGcBalanceInquiry(giftCardNumber) {
	var requestType = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.BALANCE.name;
	var gcInfo = GIFTCARDObject.currGiftCardInfo;
	var gcTx = GIFTCARDObject.currGiftCardTransaction;
	var gcRequest = new GiftCardRequest(new InquiryRequest(giftCardNumber, gcInfo, requestType));

	$.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard/giftCardRequest/',
		dataType : 'json',
		contentType : "application/json",
		data : JSON.stringify(gcRequest),
		async : false,
		beforeSend: function() {
			$("#loading-dialog").dialog("open");
		},
		complete: function() {
			$("#loading-dialog").dialog("close");
			$("#loadingDialogMessage").html("");
		},
		timeout : 5000,
		success : function(data) {
			response = data.response;
			uilog('DBUG', "Response OGBLOBA");
			uilog('DBUG', data);
			if (response.isSuccessful) {
				gcTx.updateGiftCardTransactionAfterInquiry(giftCardNumber, gcRequest, response, requestType);
				gcTx.transactionDate = data.transactionDate;
				saveGiftCardTransaction(gcTx);
//				changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
				renderGiftCardBalance(giftCardNumber, response);
				if ($("#giftcard-input-dialog").dialog("isOpen")) {
					$("#giftcard-input-dialog").dialog("close");
					$("#giftcard-balance-dialog").data("gcBalanceDetails", {
					gcNumber : giftCardNumber,
					gcInfo   : gcInfo,
					gcTx	 : gcTx,
				}).dialog("open");
				}
				var result = "<em> Card Balance: " + numberWithCommas(response.balance) + "</em>";
				$("#inquiryGcResult").html(result);
				$("#inquiryEvoucResult").html(result);
				if ($("#evoucher-input-dialog").dialog("isOpen")) {
					$("#evoucher-input-dialog").dialog("close");
					$("#evoucher-balance-dialog").data("gcBalanceDetails", {
					gcNumber : giftCardNumber,
					gcInfo   : gcInfo,
					gcTx	 : gcTx,
				}).dialog("open");
				}
				
			} else {
				var error = data.error;
				if ($("#giftcard-input-dialog").dialog("isOpen")) {
					$("#giftcardStatus").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
				}else{
					$("#giftcardStatus1").html("Error Requesting Gift Card" + "<br/>Error code: " + error.errorCode + " - " + error.errorMessage);
					
				}
				clearGiftCardTransaction();
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
}

/**
 * Save giftcard items
 * @param giftCardTransaction
 * @returns
 */
function saveGiftCardTransaction(giftCardTransaction){
	return $.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard/saveGiftCardTransaction',
		dataType : 'json',
		contentType : "application/json",
		data : JSON.stringify(giftCardTransaction),
		async : false,
		success : function(data) {
			uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/saveGiftCardTransaction SAVE SUCCESS");
		},
		error : function(jqXHR, status, error) {
                        uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /giftcard/saveGiftCardTransaction SAVE ERROR");
			showMsgDialog(getMsgValue("giftcard_msg_saving_giftcard_tx_err") + error, "error");
		}
	}).responseText;
}

/**
 * Function to get giftcardinformation
 * @param giftCardNumber
 * @returns
 */
function getGiftCardTransactionByCardNumber(giftCardNumber){
	return $.ajax({
		type : 'GET',
		url : posWebContextPath + '/giftcard/getGiftCardInfo/' + giftCardNumber,
		dataType : 'json',
		contentType : "application/json",
		async : false,
		success : function(data) {
			uilog("DBUG","data:" + data);
			nextVal = data;
		},
		error : function() {
			showMsgDialog(getMsgValue("giftcard_msg_get_gc_info_err"), "error");
		}
	}).responseText;
}

/**
 * Function to get giftcardinformation
 * @param giftCardNumber
 * @returns
 */
function saveGiftCardInfo(giftCardInfo){
	return $.ajax({
		type : 'POST',
		url : posWebContextPath + '/giftcard/saveGiftCardInfo',
		dataType : 'json',
		contentType : "application/json",
		data : JSON.stringify(giftCardInfo),
		async : false,
		success : function(data) {
			uilog("DBUG","GiftCard information saved.", "error");
			nextVal = data;
		},
		error : function() {
			uilog("DBUG", getMsgValue("giftcard_msg_save_gc_info_err"), "error");
		}
	}).responseText;
}

/**
 * Saves a new Gift Card Info for Gift Cards activated from a different Store
 *
 */
function saveNonExistingGiftCardInfo(giftCardInfo){
    return $.ajax({
        type : 'POST',
        url : posWebContextPath + '/giftcard/saveNewGiftCardInfo',
        dataType : 'json',
        contentType : "application/json",
        data : JSON.stringify(giftCardInfo),
        async : false,
        success : function(data) {
            GIFTCARDObject.currGiftCardInfo = data;
        },
        error : function() {
            uilog("DBUG", getMsgValue("giftcard_msg_save_gc_info_err"), "error");
        }
    }).responseText;
}
/**
 * Get GC info from db
 */
function getGcInfo(cardNumber) {
	var gcInfo = {};
	$.ajax({
		type : 'GET',
		url : posWebContextPath + '/giftcard/getGiftCardInfo/' + cardNumber,
		dataType : 'json',
		contentType : "application/json",
		async : false,
		success : function(response) {
			if(jQuery.isEmptyObject(response))
				uilog("DBUG","GiftCard is un-available");
			else{
				uilog("DBUG","GiftCard is searchable.");
				gcInfo = response;
			}
		},
		error : function() {
			showMsgDialog(getMsgValue("giftcard_msg_get_gc_info_err"), "error");
		}
	});
	return gcInfo;
}

/**
 * Get next giftcard transaction id.
 * Max length is 10 characters.
 * @returns {Number}
 */
function findGiftCardTransactionIdNextValue(){
	var nextVal = -1;
	$.ajax({
		type : 'GET',
		url : posWebContextPath + '/giftcard/getNextValue',
		async : false,
		success : function(data) {
			nextVal = data;
		},
		error : function() {
			showMsgDialog(getMsgValue("giftcard_msg_next_tx_id_err"), "error");
		}
	});
	return nextVal;
}

/*******************************************************************************
 * Gift Card Ajax Calls End
 ******************************************************************************/

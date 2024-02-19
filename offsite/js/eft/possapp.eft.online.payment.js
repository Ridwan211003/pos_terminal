/**
 * EFT Payment Transaction Obj
 */
var EFTPaymentTransaction = function(params){
	for(var prop in params){
		this[prop] =  params[prop];
	}
};

/**
 * Creates request message by vendor specification.
 * @returns
 */
EFTPaymentTransaction.prototype.createRequestMessageToEdc = function(){
	uilog("DBUG","createRequestMessageToEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.REQUEST;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;

	var requestMessageStrBuffer = "";

	var requestParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);
	var requestValues = getEftRequestValuesByTransactionType(this);

	var requestMessageArrMap = mapRequestValuesToEftRequestMessageParam(requestParams, requestValues, eftDataObj);

	if(this.vendor.toLowerCase() === CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()){
		requestMessageStrBuffer = stringifyRequestMessageFromWirecard(requestMessageArrMap);
	} else if (this.vendor.toLowerCase() === CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//TODO: kartuku and other vendor functions can start here to create req message.
		requestValues['transactionType'] = transactionType;
                requestMessageStrBuffer = requestValues;

	}

	return requestMessageStrBuffer;
};

/**
 * Creates response message to be sent by.
 * Wraps all response functions into this method.
 * @returns
 */
EFTPaymentTransaction.prototype.parseResponseMessageFromEdc = function(rawMsg){
	uilog("DBUG","parseResponseMessageFromEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var eftMessageParam = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType, true);

	if(this.vendor.toLowerCase() === CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()) {
		var responseMsgObj = buildResponseMessageFromWirecard(rawMsg);
		uilog("DBUG", "eftMessageParam: " + eftMessageParam);
		uilog("DBUG", "transactionType: " + transactionType);
		uilog("DBUG", "responseMsgObj: " + responseMsgObj);
		var returnCode = isResponseMessageReturnCodeOnly(responseMsgObj);
		if(returnCode){
			processReturnCodeFromWirecard(returnCode);
			
			//Recalculate total amount; Applicable for Hypercash EFT Transaction only
			if(isHcEnabled && profCust &&  profCust.customerNumber) 
				EFT.reCalculateMdrSurcharge();
		} else {
			processEftResponseMessage(eftMessageParam, responseMsgObj);
		}
	} else if (this.vendor.toLowerCase() === CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//TODO: Kartuku and other banks functions can start here to create response message
		uilog('DBUG', 'RESP FROM ECRLINK:');
                uilog('DBUG', responseMsgObj);
                uilog('DBUG', rawMsg);
                // MAP RESPONSE TO EFTDATAOBJ

                for(var key in rawMsg)
                        eftDataObj[key] = rawMsg[key];

                console.log('EFTTRATYP: ' + eftTransactionType);

                if(eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name)
                        voidEft();
                else
                        saveEftPayment();
	}
};


/**
 * Process response message from Wirecard.
 * @param responseParams - parameters of response of edc transaction
 * @param responseMessages - response messages from edc
 * @returns
 */
function processEftResponseMessage(responseParams, responseMessages){
	uilog("DBUG","processEftResponseMessage() -- execute");
	if/*Eft payment process*/(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name
		|| eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE_INQ.name
		|| eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_POINT.name
		|| eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.name
		|| eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY) != -1
		|| eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) != -1){
		mapResponseMessageToObjectModel(responseParams, responseMessages, eftDataObj);
		verifyReturnCodeFromResponseMessage(saveEftPayment);
	} /*Void*/
		else if(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name){
		mapResponseMessageToObjectModel(responseParams, responseMessages, eftDataObj);
		verifyReturnCodeFromResponseMessage(voidEft);
	}
}

/**
 * Processess return code from the eft response message.
 */
var verifyReturnCodeFromResponseMessage = function verifyReturnCodeFromResponseMessage(persistEftTransaction){
	uilog("DBUG","verifyReturnCodeFromResponseMessage() -- exucuted");
	// if return code is 00 save data
	if(eftDataObj && eftDataObj.returnCode == CONSTANTS.EFT.RETURN_CODE.APPROVED.code){
		clearTimeout(eftProcessingDialogTimeout);
		uilog("DBUG","verifyReturnCodeFromResponseMessage; eftDataObj: "
			+ JSON.stringify(eftDataObj));
		if (eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE_INQ.name){
			uilog("DBUG","SEND PAYMENT AFTER INQ WC");
			// uilog("DBUG","paymentAmtEFTWC: " + paymentAmtEFTWC);
			// uilog("DBUG","pymtMediaTypeName: " + pymtMediaTypeName);
			var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name;
			var cardNumber = eftDataObj.cardNum;
			var firstSixOfCard = eftDataObj.cardNum.substring(0,6);
			var reversedItems = PROMOTIONS.getReversedCmcItems(memberPromos, cardNumber);
			var isCardCoBrand = (saleTx.promotionsMap && isTrxCobrand(firstSixOfCard, saleTx.promotionsMap));
			// uilog("DBUG","isCardCoBrand: " + isCardCoBrand);
			eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name;
			if (isCardCoBrand && !isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard))
				processCoBrandEftOnlinePayment(paymentAmtEFTWC, pymtMediaTypeName);
			else						
				processNonCmcPayment(function()
									 {
										processCoBrandEftOnlinePayment(paymentAmtEFTWC, pymtMediaTypeName);
									 }, pymtMediaTypeName);
		} else {			
		persistEftTransaction();
		}
	} else if(eftDataObj && eftDataObj.returnCode == CONSTANTS.EFT.RETURN_CODE.DECLINED.code){
		showMsgDialog(getMsgValue('eft_msg_err_bank_approval_declined'), "warning");
		clearEFT();
	} else {
		showMsgDialog(getMsgValue('eft_msg_err_processing_eft_txn'), "warning");
		clearEFT();
	}
};

/*************************
 * Void Start
 *************************/
/**
 * Voids eft.
 * @param eftDataObj - eft details.
 */
var voidEft = function voidEft(){
	if(eftOnlineObj && eftOnlineObj.hasVoidedTxn){
		processVoidEftWithVoidedTransaction();
	} else {
		processVoidEftWithoutVoidedTransaction();
	}
};

var processVoidEftWithoutVoidedTransaction = function processVoidEftWithoutVoidedTransaction(){
	formatEftForPaymentMedia();

	$.ajax({
		url : posWebContextPath + "/cashier/saveVoidEft",
		type : "POST",
		async : false,
		dataType : "json",
		contentType : "application/json",
		data : JSON.stringify(eftDataObj),
		success: function(response){
			if(response){
				//print eft receipt
				printReceipt({
					footer 	: setReceiptEftRetrieveTransaction(),
					eftOnline 	: setReceiptEftRetrieveTransaction(true),
                    isQueued : true
				});
				$("#bank-mega-input-trace-number-dialog").dialog("close");
				showMsgDialog(getMsgValue("eft_msg_success_void_txn"),"info");
				clearEFT(true);
			}
		},
		error : function(jqXHR, status, error) {
			showMsgDialog(getMsgValue("eft_msg_err_void_txn_failed"), "error");
		}
	});
};

var processVoidEftWithVoidedTransaction = function processVoidEftWithVoidedTransaction(){
    voidEftData = updateEftDataFromPosTransaction();
    $.ajax({
        url : posWebContextPath + "/cashier/voidEft",
        type : "POST",
        async : false,
        dataType : "json",
        contentType : "application/json",
        data : JSON.stringify(voidEftData),
        success: function(response){
            if(response){
                saleTx = eftOnlineObj.posTxn;
                //Fix 104126
                printReceipt({
                    footer 	: setReceiptVoidEftOnline(eftOnlineObj.posTxn),
                    eftOnline 	: setReceiptVoidEftOnline(eftOnlineObj.posTxn, true),
                    isQueued : true
                });
                /*printReceipt({
                 footer 	: setReceiptEftOnline(eftOnlineObj.posTxn),
                 eftOnline 	: setReceiptEftOnline(eftOnlineObj.posTxn, true),
                 isQueued : true
                 });*/
                $("#bank-mega-input-trace-number-dialog").dialog("close");
                showMsgDialog(getMsgValue("eft_msg_success_void_txn"),"info");
                clearEFT(true);
		createOrder();
            }
        },
        error : function(jqXHR, status, error) {
            showMsgDialog(getMsgValue("eft_msg_err_void_txn_failed"), "error");
        }
    });
};

/**
 * Updates the eft data from old pos transaction.
 */
var updateEftDataFromPosTransaction = function updateEftDataFromPosTransaction(){
	uilog("DBUG","updateEftDataFromPosTransaction()--execute ");
	var eft = null;
	var posTxn = eftOnlineObj.posTxn;
	var traceNumber = eftOnlineObj.traceNumber;

	formatEftForPaymentMedia();

	if(posTxn && traceNumber){
		for(var ctr = 0; ctr < posTxn.payments.length; ctr++){
			if(posTxn.payments[ctr].paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name
				&& (posTxn.payments[ctr].eftData && posTxn.payments[ctr].eftData.traceNum == traceNumber)){
				posTxn.payments[ctr].eftData.transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.desc + ' ' + posTxn.payments[ctr].eftData.transactionType;
				eft = posTxn.payments[ctr].eftData;
				break;
			}
		}
	}
	return eft;
};

/**
 * Get eft data from pos transaction payments.
 */
EFT.getEftDataFromPosTransaction = function getEftDataFromPosTransaction(posTxnPayments, traceNumberInput){
	try{
		var eftData = null;
		$.each(posTxnPayments, function(index, payment){
			if(payment.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name){
				if(payment.eftData && payment.eftData.traceNum == traceNumberInput){
					eftData = payment.eftData;
				}
			}
		});
		return eftData;
	} catch (err){
		uilog("DBUG","Error: "+err.message);
	}
};

EFT.voidEftTxnWithVoidTxn = function(traceNumber, voidedTxn){
	var errorMessage = "";
	var eftData = EFT.getEftDataFromPosTransaction(voidedTxn.payments, traceNumber);
	if (eftData){
		var eftParams = {
			bank			: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
			onlineFlag		: CONSTANTS.EFT.STATUS.ONLINE,
			traceNumber 	: traceNumber,
			transactionType : eftTransactionType,
			vendor			: eftVendor,
			oldEftData  	: eftData,
			posTxn 	   		: voidedTxn,
			hasVoidedTxn	: true
		};
		EFT.processEFTOnlineTransaction(eftParams);
	} else {
		errorMessage = getMsgValue("pos_warning_msg_eft_online_payment_not_found");
		$("#eftTraceNumberErrorSpan").empty();
		$("#eftTraceNumberErrorSpan").html(errorMessage);
	}
};

EFT.voidEftTxnWithoutVoidTxn = function(traceNumber){
	var eftParams = {
		bank			: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
		onlineFlag		: CONSTANTS.EFT.STATUS.ONLINE,
		traceNumber 	: traceNumber,
		transactionType : eftTransactionType,
		vendor			: eftVendor
	};
	EFT.processEFTOnlineTransaction(eftParams);
};

/*************************
 * Void End
 *************************/

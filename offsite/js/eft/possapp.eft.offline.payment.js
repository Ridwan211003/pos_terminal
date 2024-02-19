function eftOfflinePayment(paymentMediaType){
	var payment = $("#inputDisplay").val();
	var trxType = "";	
	// LUCKY - CALCULATE ZEPRO PAYMENT
        if(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && typeof saleTx.zeproPaid == 'undefined' && !saleTx.zeproPaid)
        {
	        $("#inputDisplay").val('');
                payment = calculateZeproAmount(saleTx);
		trxType = CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO;
        }

	var bank = configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name];
//	eftDataObj = new ElectronicFundTransferModel(saleTx, bank, payment);
	eftDataObj = new ElectronicFundTransferModel().initEftOfflineModel(saleTx, bank, payment, trxType);
	$("#tenderNewAmount-dialog").data("payment", payment);
	$("#eftOfflineCardNoInput").val("");
	$("#eftOfflineCardNoInput6dig").val("");
	$("#eftOfflineCardNoInput4dig").val("");
	$("#eftOfflineApprovalCodeInput").val("");
	$("#eftOfflineCardNoCode-dialog").data("mediaType",(paymentMediaType)? paymentMediaType: "");
	$("#eftOfflineCardNoCode-dialog").dialog("open");
}

function eftOfflinePaymentAlloPaylater(paymentMediaType){
	var payment = $("#inputDisplay").val();
	var trxType = "";	

	// LUCKY - CALCULATE ZEPRO PAYMENT
	if(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && typeof saleTx.zeproPaid == 'undefined' && !saleTx.zeproPaid)
	{
		$("#inputDisplay").val('');
		payment = calculateZeproAmount(saleTx);
		trxType = CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO;
	}

	var bank = configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name];
	eftDataObj = new ElectronicFundTransferModel().initEftOfflineModel(saleTx, bank, payment, trxType);
	$("#tenderNewAmount-dialog").data("payment", payment);
	$("#eftOfflineCardNoInput").val("");
	$("#eftOfflineCardNoInput6dig").val("");
	$("#eftOfflineCardNoInput4dig").val("");
	$("#alloPaylaterApprovalCodeInput").val("");
	$("#eftOfflineCardNoCode-dialog").data("mediaType",(paymentMediaType)? paymentMediaType: "");
	// $("#eftOfflineCardNoCode-dialog").dialog("open");
	$("#alloPaylaterApprovalCode-dialog").dialog("open");
}


function pppPayment(paymentMediaType) {
	// Calling PPPItem Database and Consolidating Scanned Item with Database
	var type = "consolidatePPP";
	var scannedBarcode = [];
	// var scannedItemsSummary = [];
	var simplifiedItems = [];
	saleTx.orderItems.forEach(function(el, index) {
		simplifiedItems.push({
			ean13Code: el.ean13Code,
			quantity: el.quantity,
			pricePerUnit: el.priceUnit
		})
	});
	var j = simplifiedItems.reduce(function(acc, curr, index) {
		if (index === 0) {
			acc.push(curr);
			return acc;
		} else if (index !== 0) {
			for (var x = 0; x < acc.length; x++) {
				var needBreak = false;
				if (acc[x].ean13Code === curr.ean13Code) {
					acc[x].quantity += curr.quantity;
					needBreak = true;
					console.log("Sudah Ada");
				} else if ((acc[x].ean13Code !== curr.ean13Code) && (x === acc.length - 1)) {
					acc.push(curr);
					needBreak = true;
					console.log("Sudah Ada");
				}
				if (needBreak) {
					break;
				}
			}
			return acc;
		}
	}, []);
	console.log(j);

	j.forEach(function(el) {
		scannedBarcode.push(el.ean13Code);
	});

	var data = {
		type : type,
		scannedBarcode: scannedBarcode,
		currentStore: configuration.storeCode
	};
	data = JSON.stringify(data);
	console.log("Test data : " + data);
	$.ajax({
		type : 'POST',
		url : posWebContextPath + '/cashier/loyalty/process',
		async : false,
		contentType : "application/json",
		data : data,
		timeout: 30000,
		success : function(response) {
			if (response.rspCode == "404") {
				console.log("No Scanned Items Included in PPP Program");
				// Open Dialog and Notifying User That Items Not Included
				$("#noPPP-dialog").dialog("open");
			} else if (response.rspCode == "200") {
				console.log("There is Some Items Included in PPP Program");
				// Open Dialog and Notifying User That Items Not Included
				var x = {};
				response.items.forEach(function (val, index) {
					if (!(val[0] in x)) {
						console.log("Create New Object", val[0]);
						x[val[0]] = {
							ean13Code: val[0],
							shortName: val[2],
							itemDetails: [
								{
									pspByPoint: val[3],
									pointRequired: val[4],
									eligibleForEarnPoint: val[5],
									ppppWithCobrand: val[6],
									max_qty: val[7]
								}
							]
							
						};						
					} else if (val[0] in x) {
						console.log("Nambah Existing Object Value",  val[0]);
						x[val[0]]["itemDetails"].push({
							pspByPoint: val[3],
							pointRequired: val[4],
							eligibleForEarnPoint: val[5],
							ppppWithCobrand: val[6],
							max_qty: val[7]
						});
					};
					console.log(val);
					console.log(index);
				});
				console.log(x);
				$("#pppItemSelection-dialog").data("items", x).dialog("open");
			}
		},
		error : function() {
			uilog('DBUG','call pppPayment');
		}
	});

	//
	// Displaying Consolidated Item to Pop up

	
	// var payment = $("#inputDisplay").val();
	// var trxType = "";
	// // LUCKY - CALCULATE ZEPRO PAYMENT
	// if (
	//   saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
	//   typeof saleTx.zeproPaid == "undefined" &&
	//   !saleTx.zeproPaid
	// ) {
	//   $("#inputDisplay").val("");
	//   payment = calculateZeproAmount(saleTx);
	//   trxType = CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO;
	// }

	// var bank = configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name];
	// //	eftDataObj = new ElectronicFundTransferModel(saleTx, bank, payment);
	// eftDataObj = new ElectronicFundTransferModel().initEftOfflineModel(saleTx, bank, payment, trxType);
	// $("#tenderNewAmount-dialog").data("payment", payment);
	// $("#eftOfflineCardNoInput").val("");
	// $("#eftOfflineCardNoInput6dig").val("");
	// $("#eftOfflineCardNoInput4dig").val("");
	// $("#eftOfflineApprovalCodeInput").val("");
	// $("#pppItemSelection-dialog").data("mediaType", paymentMediaType ? paymentMediaType : "");
	// $("#pppItemSelection-dialog").dialog("open");
};

/**
 * returns int values
 * 1 - input manually
 * 2 - automatic success (includes auto-conditional)
 * 3 - automatic failed
 */
function processBankIdInput(){
	var bankIdInputType = getConfigValue("OFFLINE_BANK_ID_INPUT");
	if(bankIdInputType == CONSTANTS.EFT.BANK_ID_INPUT.MANUAL){
		return CONSTANTS.EFT.BANK_ID_INPUT_STATUS.MANUAL;
	}else if(bankIdInputType == CONSTANTS.EFT.BANK_ID_INPUT.AUTO ||
			bankIdInputType == CONSTANTS.EFT.BANK_ID_INPUT.AUTO_CONDITIONAL){
		populateOfflineBankIdMapGlobal();
		var sixCardNo = eftDataObj.cardNum.substring(0,6);
		var bankId = offlineBankIdMap[sixCardNo];
		if(bankId == null){
			if(bankIdInputType == CONSTANTS.EFT.BANK_ID_INPUT.AUTO){
				return CONSTANTS.EFT.BANK_ID_INPUT_STATUS.AUTO_FAILED;
			}else{
				return CONSTANTS.EFT.BANK_ID_INPUT_STATUS.MANUAL;
			}
		}else{
			eftDataObj.bankId = bankId;
			return CONSTANTS.EFT.BANK_ID_INPUT_STATUS.AUTO_SUCCESS;
		}
	}
}

/**
 * Populates Bank Desciption based on bank id.
 */
function populateOfflineBankIdMapGlobal() {
	var bankIdEnum = getConfigCodeEnumeration("BANK_ID_LOOKUP");
	var bankIdMap = {};
	for ( var i in bankIdEnum) {
		bankIdMap[bankIdEnum[i].code] = bankIdEnum[i].description;
	}
	offlineBankIdMap = bankIdMap;
}

/**
 * Cancel offline function.
 */
function eftOfflineCancel(dialogObj){
	$(dialogObj).dialog("close");
	eftDataObj = null;
	if (saleTx.coBrandNumber && saleTx.memberDiscReversal) {
		var previousAmount = $("#tenderNewAmount-dialog").data("payment");
		$("#inputDisplay").val(previousAmount);
		reverseMemberDiscount(false);
	}
	removeAdditionalDicount();
}

//comment out this when "configurable bank id" is implemented
function resetSelectedBank(){
	var bankIdList = $("div.bankIdBanks");
	for(var i in bankIdList){
		if(bankIdList[i].nodeName && bankIdList[i].nodeName == "DIV" && bankIdList[i].id){
			var element = $("#"+bankIdList[i].id);
			$(element).removeClass("bankIdBanksSelected");
		}
	}
}
function nextAfterCardNumInput(){
	//console.log('eftType :' + eftType);
	if(eftType == CONSTANTS.EFT.TYPE.EDC_BCA){
		$("#eftOfflineApprovalCodeInput").val(eftDataObj.approvalCode);
		$("#eftOfflineApprovalCode-dialog").dialog("open");
	}else if(eftType == CONSTANTS.EFT.TYPE.DEBIT ||
			eftType == CONSTANTS.EFT.TYPE.EDC_PAYMENT){
		saveEftPayment();
	}else{
		$("#eftOfflineBankId-dialog").dialog("open");
	}
}
function cardNumInputNextProcess(){
	//var cardNo = $("#eftOfflineCardNoInput").val();
	var inputCard6dig = $("#eftOfflineCardNoInput6dig").val();
	var inputCard4dig = $("#eftOfflineCardNoInput4dig").val();
	var cardNo = inputCard6dig + "-xxxxxx-" + inputCard4dig;
	var errorMessage = "";
	var isInfoValid = true;

	// var lstCbrnMdngtSls = ["420191","420192","457508","458785","464933","478487","483545","489087","420194","426211","431226","464934","471439","524261"];
	
	// if((typeof(saleTx.employeeDiscountToggled) != 'undefined' && saleTx.employeeDiscountToggled == true) && !isCbrndVlidForMidnghtSls){
	if((typeof(saleTx.employeeDiscountToggled) != 'undefined' && saleTx.employeeDiscountToggled == true)){
		var lstCbrnMdngtSls = getConfigValue("EMP_LIST_COBRAND").split(";");
		// var lstCbrnMdngtSls = getCobrandAllowedMidnightsales(removeAllDash(cardNo).substr(0, 8));
		var isCbrndVlidForMidnghtSls = lstCbrnMdngtSls.indexOf(removeAllDash(cardNo).substr(0, 8))!==-1;
		
		if(!isCbrndVlidForMidnghtSls){
			errorMessage += "THIS CARD IS NOT ELIGIBLE<br/>";
			isInfoValid = false;
		}
	}

	if(!(cardNo.length == 19)){
		errorMessage += "Card Number must contain first 8 digits and last 2 digits<br/>";
		isInfoValid = false;
	}

	if(isInfoValid){
		// LUCKY - CURE FOR BUGS Ticket #822297
		eftDataObj.cardNum = removeAllDash(cardNo);
		var firstSixOfCard = removeAllDash(cardNo.substring(0,7));
		//var isCardCoBrand = (saleTx.coBrandNumber && firstSixOfCard == saleTx.coBrandNumber.substring(0,6));
		var isCardCoBrand = (saleTx.promotionsMap && isTrxCobrand(firstSixOfCard, saleTx.promotionsMap));
		//console.log('firstSixOfCard' + firstSixOfCard);
		//console.log('isCardCoBrand' + isCardCoBrand);
		var isEdcBca = (eftType == CONSTANTS.EFT.TYPE.EDC_BCA);
		var isDebitBca = (eftType == CONSTANTS.EFT.TYPE.DEBIT);
		var isEdcPayment = (eftType == CONSTANTS.EFT.TYPE.EDC_PAYMENT);
		var memDisc = calculateTotalMemberDiscount();
		var pymtMediaTypeName = $("#eftOfflineCardNoCode-dialog").data("mediaType");
		// CR ADD DISCOUNT
		/*if(saleTx.payments.length == 0)
		{
			$("#tenderNewAmount-dialog").data('firstSixOfCard', firstSixOfCard);
			var isAddDiscPaymentLevel = processLayerThreePromotions(pymtMediaTypeName, false);
			$("#tenderNewAmount-dialog").data('isAddDiscPaymentLevel', isAddDiscPaymentLevel);
			$("#tenderNewAmount-dialog").data('mediaType', pymtMediaTypeName);
		}*/
		$("#tenderNewAmount-dialog").data("cardNumber", removeAllDash(cardNo));
		// remove CMC for add Discount filter
		//processNonCmcPayment(function(){
			var payment = parseInt($("#inputDisplay").val());
			if(pymtMediaTypeName == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name)
			{
				uilog("DBUG","processEftOnlinePayment");
				processEftOnlinePayment(payment, pymtMediaTypeName);
			}
			else if(saleTx.coBrandNumber){
				if(isCardCoBrand){
					// LUCKY - CURE FOR BUGS Ticket #822297
					var balanceDue = CASHIER.getFinalSubtotalTxAmount(saleTx) - saleTx.totalAmountPaid;
					$("#eftOfflineCardNoCode-dialog").dialog("close");
	
					if(eftType == CONSTANTS.EFT.TYPE.OFFLINE_PAYMENT){
						eftType = CONSTANTS.EFT.TYPE.CMC_OFFLINE_PAYMENT;
					}
	
					if(memDisc > 0 && payment != balanceDue && (isEdcBca ||
							eftType == CONSTANTS.EFT.TYPE.CMC_OFFLINE_PAYMENT)
							&& !isDebitBca && !isEdcPayment){
						eftOfflineCancel(null);
						showMsgDialog(getMsgValue('eft_msg_err_co_brand_amount_payment_not_exact'), "warning");
						/*processNonCmcPayment(function(){
							nextAfterCardNumInput();
						},pymtMediaTypeName);*/
					}else if(isEdcBca){
						if (isCardCoBrand && !isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard))
							$("#eftOfflineApprovalCode-dialog").dialog("open");
						else
							processNonCmcPayment(function(){
								$("#eftOfflineApprovalCode-dialog").dialog("open");
							}, pymtMediaTypeName);
					}else if(isDebitBca || isEdcPayment){
						// CR ADD DISCOUNT
						if(isDebitBca && isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard))
							processNonCmcPayment(saveEftPayment, pymtMediaTypeName);
						else saveEftPayment();
						// CR ADD DISCOUNT
					}else{
						if (isCardCoBrand && !isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard))
							$("#eftOfflineBankId-dialog").dialog("open");
						else
							processNonCmcPayment(nextAfterCardNumInput, pymtMediaTypeName);
					}
	
				}else{
					if(memDisc > 0){
						if(isDebitBca || isEdcPayment){
							// CR ADD DISCOUNT
							//if(isDebitBca && isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard)) 
							processNonCmcPayment(saveEftPayment, pymtMediaTypeName);
							//else saveEftPayment();
							// CR ADD DISCOUNT
						}else{
							processNonCmcPayment(nextAfterCardNumInput,pymtMediaTypeName);
						}
					}else{
						if(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && typeof saleTx.zeproCardDone == 'undefined' && !saleTx.zeproCardDone)
						{
							showConfirmDialog("Maaf kartu anda tidak bisa digunakan untuk transaksi Zepro", "warning",
								function()
								{
									saleTx.eftTransactionType = "";
									saleTx.zeproPaid = false;
								},
								function()
								{
									$("#eftOfflineCardNoCode-dialog").dialog("open");
								}
							);
						}
						else{
							if (isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard))
								processNonCmcPayment(nextAfterCardNumInput, pymtMediaTypeName);
							else	
								nextAfterCardNumInput();
						}
					}
				}
			} else {
				if (isHcEnabled && profCust && profCust.customerNumber) {
					isHypercashTx = true;
	
					//if (connectionOnline) {
						mdrConfig = getMdrConfig(firstSixOfCard);
					//}				
				}
				// CR ADD DISCOUNT
				processNonCmcPayment(nextAfterCardNumInput, pymtMediaTypeName);
				// CR ADD DISCOUNT
				//nextAfterCardNumInput();
			}
			$("#eftOfflineCardNoCode-dialog").dialog("close");
		//},pymtMediaTypeName);
		// CR ADD DISCOUNT
	}else{
		$("#eftOfflineCardNoErrorSpan").empty();
		$("#eftOfflineCardNoErrorSpan").append(errorMessage);
	}
}
function trkPointPayment(paymentMediaType){
	console.log("trkPointPayment ");
	var payment = CASHIER.getFinalSubtotalTxAmount(saleTx, {payments:saleTx.payments});
	var trxType = "";
	var bank = configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name];
	trkDataObj = new ElectronicFundTransferModel().initEftOfflineModel(saleTx, bank, payment, trxType);
	//$("#tenderNewAmount-dialog").data("payment", payment);
	$("#trkPoint").val("");
	$("#trkPoint-dialog").data("mediaType",(paymentMediaType)? paymentMediaType: "");
	$("#trkPoint-dialog").dialog("open");
}
function trkSalesPayment(paymentMediaType){
	var payment = CASHIER.getFinalSubtotalTxAmount(saleTx, {payments:saleTx.payments});
	var trxType = "";
	var bank = configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name];
	trkDataObj = new ElectronicFundTransferModel().initEftOfflineModel(saleTx, bank, payment, trxType);
	//$("#tenderNewAmount-dialog").data("payment", payment);
	$("#trkSales").val("");
	$("#trkSales-dialog").data("mediaType",(paymentMediaType)? paymentMediaType: "");
	$("#trkSales-dialog").dialog("open");
}
var paymentTrk = 0;
function trkNextProcess(pymtMediaTypeName){
	
	var isTrkPoint = (pymtMediaTypeName == CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_POINT.name);
	var isTrkSales = (pymtMediaTypeName == CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_SALES.name);
	var errorMessage = "";
	var inputRef;
	if(isTrkPoint){
		inputRef = $("#trkPoint").val();
	}else{
		inputRef = $("#trkSales").val();
	}
	console.log("inputRef");
	console.log(inputRef);
	var cardNo = inputRef;
	//eftDataObj.cardNum = cardNo;
	var memDisc = calculateTotalMemberDiscount();
	var tmp = getConfigValue("EFT_OFFLINE_BANK_LIST").split(";");
	bankId = tmp[0].split("|");
	//eftDataObj.bankId = bankId[0];
	// var trkDataObj = function() {
		// this.acntNo = cardNo;
		// this.amount = paymentTrk;
	// };
	var trkDataObj = {
		acntNo : cardNo,
		amount : paymentTrk
	};

	if(isTrkPoint){
		trkDataObj.pointRedeemed = paymentTrk;
		trkDataObj.amount = saleTx.totalTrk;		
	}else{
		trkDataObj.pointRedeemed = 0;
	}
		console.log("masuk trkNextProcess");
		console.log("pymtMediaTypeName :" + pymtMediaTypeName);
		console.log("paymentTrk :"+paymentTrk);
		if(pymtMediaTypeName == CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_POINT.name){
			//var pymtMediaTypeName = $("#trkPoint-dialog").data("mediaType");
			//processTrkPayment(saveEftPayment, pymtMediaTypeName);
			CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, paymentTrk, {trk : trkDataObj});
		}else{
			//var pymtMediaTypeName = $("#trkSales-dialog").data("mediaType");
			//processTrkPayment(saveEftPayment, pymtMediaTypeName);
			CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, paymentTrk, {trk : trkDataObj});
		}
}

function getCobrandAllowedMidnightsales(cobrand){

    var cobrandListAllowed = [];

    $.ajax({
        url: posWebContextPath + "/cashier/thr/getCobrandAllowed/",
        type: "POST",
        async: false,
        dataType: "json",
        data : JSON.stringify({
            "cobrand": cobrand
        }),
        success: function(response) {
            if (!response.error) {
                cobrandListAllowed = response['result'];
            }
        }
    });
    return cobrandListAllowed;
}
/*******************************************************************************
 * START : PAYMENT MEDIA
 ******************************************************************************/

var PAYMENT_MEDIA = PAYMENT_MEDIA || {};

/**
 * Returns to null, if the previous validated paymentMediaType(isValidForTriggering() = TRUE)
 * has already been processed(processPaymentDetailsToOrder() = TRUE)
 */
PAYMENT_MEDIA.latestPendingValidatedPaymentMedia = null;
/**==========================================================================**
 * START : JavaScript Object Models, and CONSTANTS
 **==========================================================================**/


/**
 * An object used to persist the saleTx's multiple payment media entries
 * => saleTx.payments;
 */
PAYMENT_MEDIA.PaymentMediaItem = function PaymentMediaItem(paymentMediaType,
    amountPaid) {

    /* see constants.js => CONSTANTS.PAYMENT_MEDIA_TYPES
     * default is CASH
     */
    this.paymentMediaType = (paymentMediaType) ? paymentMediaType :
        CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name;
    this.amountPaid = (amountPaid) ? amountPaid : null;

    // TODO: Add additional relevant fields here.

    /*
     * Initialising the additional data(addtionalData) of PAYMENT_MEDIA.PaymentMediaItem,
     * stated in PAYMENT_MEDIA.ADDITIONAL_CONFIG[<payment_media>].additionalDataKeyId.
     * The additional validation can be seen in processPaymentDetailsToOrder() and addPaymentDetailsToOrder().
     */
    for (var member in PAYMENT_MEDIA.ADDITIONAL_CONFIG) {
        var additionalDataKeyId = null;
        if (PAYMENT_MEDIA.ADDITIONAL_CONFIG.hasOwnProperty(member) &&
            (additionalDataKeyId = PAYMENT_MEDIA.ADDITIONAL_CONFIG[member].additionalDataKeyId)
            // Checks if already a member.
            &&
            !this.hasOwnProperty(additionalDataKeyId)) { // Checks if already a member.
            this[additionalDataKeyId] = null;
        }
    }
};

/**
 * Replace the rawConfigKeyPlaceholder's placeholder to the currently passed paymentMediaType,
 * then returns the searched config value if any.
 * @param paymentMediaType
 * @param rawConfigKeyPlaceholder
 * @returns {*}
 */
PAYMENT_MEDIA.getConfigMsgValue = function(paymentMediaType, rawConfigKeyPlaceholder) {

    var configVal = null;
    var configKey = null;
    if (paymentMediaType) {
        configKey = CONSTANTS.PAYMENT_MEDIA_TYPES.formatKeyByTxTypeArguments( // The type to search
            paymentMediaType,
            // The unformatted Configuration key placeholder
            rawConfigKeyPlaceholder,
            // to lower
            true,
            // use the 1st argument of searched TX_TYPE
            true);
        configVal = getConfigValue(configKey);
    }
    return configVal;
};

/**
 * Configuration container validation to execute for a particular
 * payment media.
 *
 * isSinglePaymentInTx, meaning if the intended payment media is triggered,
 * allow it if and only if its the first and last payment media to be entered.
 *   - currently, it only allow amount that match or exceeds the total amount of goods [10/29/2013]
 *
 */
PAYMENT_MEDIA.ADDITIONAL_CONFIG = PAYMENT_MEDIA.ADDITIONAL_CONFIG || {};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name] = {
    additionalDataKeyId: null,
    isMergeableAmount: false,
    isValidForCashChange: true,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
// INHOUSE VOUCHER 2017-04-13
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.VOUCHER.name] = {
    additionalDataKeyId: 'voucherData',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
// INHOUSE VOUCHER 2017-04-13
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.FLAZZ.name] = {
    additionalDataKeyId: null,
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON.name] = {
    additionalDataKeyId: null,
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name] = {
    additionalDataKeyId: 'couponReturn',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.SODEXO.name] = {
    additionalDataKeyId: null,
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name] = {
    additionalDataKeyId: 'giftCardPayment',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.GC_MMS.name] = {
    additionalDataKeyId: 'giftCardPayment',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name] = {
    additionalDataKeyId: 'eftData',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name] = {
    additionalDataKeyId: 'eftData',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: true
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name] = {
    additionalDataKeyId: 'eftData',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: true
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name] = {
    additionalDataKeyId: 'eftData',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name] = {
    additionalDataKeyId: 'eftData',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name] = {
    additionalDataKeyId: 'eftData',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_PAYMENT.name] = {
    additionalDataKeyId: 'eftData',
    isMergeableAmount: false,
    isValidForCashChange: true,
    isValidAsLastPayment: true,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name] = {
    additionalDataKeyId: 'installmentPayment',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.CRM_POINTS.name] = {
    additionalDataKeyId: null,
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.FLASHIZ.name] = {
    additionalDataKeyId: 'flashizPayment',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name] = {
    additionalDataKeyId: 'MLCPayment',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.ALLO_PAYMENT.name] = {
    additionalDataKeyId: 'MLCPayment',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.OVO_PAYMENT.name] = {
    additionalDataKeyId: 'OVOPayment',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: true
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.ALTOWECHAT.name] = {
    additionalDataKeyId: 'ALTOWECHAT',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: true
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_POINT.name] = {
    additionalDataKeyId: 'trk',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_SALES.name] = {
    additionalDataKeyId: 'trk',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
PAYMENT_MEDIA.ADDITIONAL_CONFIG[CONSTANTS.PAYMENT_MEDIA_TYPES.POWER_POINT_PURCHASE.name] = {
    additionalDataKeyId: 'PPP',
    isMergeableAmount: false,
    isValidForCashChange: false,
    isValidAsLastPayment: false,
    isSinglePaymentInTx: false
};
// TODO: add another payment media with additional persist-able data here, i.e. EFT, or maybe Gift Card(GC)


/**==========================================================================**
 * END : JavaScript Object Models, and CONSTANTS
 **==========================================================================**/

/**==========================================================================**
 * START : Background process; computations, manipulations, CRUDs.
 **==========================================================================**/

/**
 * Gets the last instance(type and amount) of the searched paymentMediaType.
 * If isToMergeMultipleInstance is true, merged the amounts of the searched mediaType if any,
 * otherwise, gets the latest instance of the searched mediaType.
 * @param saleTx
 * @param paymentMediaType
 * @param isToMergeMultipleInstance
 * @returns {{isFound: boolean, returnValue: PAYMENT_MEDIA.PaymentMediaItem}}
 */
PAYMENT_MEDIA.findExistingSaleTxPaymentMedia = function(saleTx,
    paymentMediaType,
    isToMergeMultipleInstance) {

    var paymentMediaArrLocal = null;
    var keyPaymentMediaType = 'paymentMediaType';
    var isFound = false;

    var paymentMediaReturn = new PAYMENT_MEDIA.PaymentMediaItem(paymentMediaType, null);

    if (saleTx &&
        (paymentMediaArrLocal = saleTx.payments) &&
        paymentMediaType) {

        // Search from last to first
        for (var countDown = (paymentMediaArrLocal.length - 1); countDown >= 0; countDown--) {

            var currPaymentMediaItem = paymentMediaArrLocal[countDown];
            var isEqualType = (currPaymentMediaItem[keyPaymentMediaType] == paymentMediaType);
            isFound = isFound || isEqualType;
            paymentMediaReturn = (isEqualType &&
                    !isToMergeMultipleInstance) ?
                currPaymentMediaItem
                // if merge multiple instance, do not use reference
                :
                paymentMediaReturn;
            // if same payment media type value
            if (isEqualType &&
                isToMergeMultipleInstance) {
                paymentMediaReturn.amountPaid = paymentMediaReturn.amountPaid || 0;
                paymentMediaReturn.amountPaid += currPaymentMediaItem.amountPaid;
            } else if (isEqualType &&
                !isToMergeMultipleInstance) {
                break;
            }
        }
    }
    // Logging only
    if (!isFound) {
        uilog("DBUG", "Exising payment media of type '%s' not found!",
            (paymentMediaType) ? paymentMediaType : "null");
    }
    return {
        'isFound': isFound,
        'returnValue': paymentMediaReturn
    };

};

/**
 * Add payment to saleTx's payment array.
 *
 * @param saleTx
 * @param paymentMediaType
 * @param payment
 * @param additionalData
 */
PAYMENT_MEDIA.addPaymentDetailsToOrder = function(saleTx,
    paymentMediaType,
    payment,
    additionalData) {

    // The default value
    var paymentMediaArrLocal = [];
    var paymentMediaIns = {};

    if (saleTx &&
        paymentMediaType &&
        payment) {

        // Check if the current payment media to save is already existing.
        var isExistingMediaReturnObj = null;
        var isExisting = null;

        var additionalPaymentMediaConfig = PAYMENT_MEDIA.ADDITIONAL_CONFIG[paymentMediaType];
        // Merge-able amounts condition
        if (additionalPaymentMediaConfig &&
            additionalPaymentMediaConfig.isMergeableAmount) {

            isExistingMediaReturnObj = PAYMENT_MEDIA.findExistingSaleTxPaymentMedia(saleTx, paymentMediaType, false);
            isExisting = isExistingMediaReturnObj.isFound;
            paymentMediaIns = isExistingMediaReturnObj.returnValue;

        } else {
            isExisting = false;
            paymentMediaIns = new PAYMENT_MEDIA.PaymentMediaItem(paymentMediaType, null);
        }
        // Additional Data condition
        if (additionalData) {
            // MLC 2017-04-21
            if ((additionalPaymentMediaConfig.additionalDataKeyId == 'MLCPayment') && (additionalData['MLCPayment'] != null)) {
                var eftData = new ElectronicFundTransferModel();
                eftData.approvalCode = additionalData['MLCPayment'].approvalCode;
                eftData.referenceCode = additionalData['MLCPayment'].reffNo;
                eftData.transactionAmount = additionalData['MLCPayment'].amount;
                eftData.cardNum = additionalData['MLCPayment'].acntNo;
                eftData.cardHolder = additionalData['MLCPayment'].customerName;
                eftData.transactionId = saleTx.transactionId;
                paymentMediaIns['eftData'] = eftData;
            } else if ((additionalPaymentMediaConfig.additionalDataKeyId == 'OVOPayment') && (additionalData['OVOPayment'] != null)) {
                var eftData = new ElectronicFundTransferModel();
                eftData.approvalCode = additionalData['OVOPayment'].retrievalReferenceNumber;
                eftData.referenceCode = additionalData['OVOPayment'].refNo;
                eftData.transactionAmount = additionalData['OVOPayment'].amount;
                eftData.cardNum = additionalData['OVOPayment'].phoneNumber;
                eftData.cardHolder = additionalData['OVOPayment'].userName;
                eftData.bankName = additionalData['OVOPayment'].issuerName;
                eftData.bankId = additionalData['OVOPayment'].issuerName;
                eftData.transactionCode = additionalData['OVOPayment'].refNo;
                eftData.transactionType = additionalData['OVOPayment'].issuerName;
                eftData.cardType = additionalData['OVOPayment'].issuerName;
                eftData.traceNum = additionalData['OVOPayment'].traceNo;
                eftData.merchantId = additionalData['OVOPayment'].mid;
                eftData.stan = additionalData['OVOPayment'].tid;
                eftData.catalogCode = "OVO";
                eftData.storeCode = saleTx.storeCd;
                eftData.terminalId = saleTx.posTerminalId;
                eftData.transactionId = saleTx.transactionId;
                eftData.cashierId = saleTx.userName;
                eftData.posId = saleTx.posSession.posSessionId;
                paymentMediaIns['eftData'] = eftData;
            } else if ((additionalPaymentMediaConfig.additionalDataKeyId == 'ALTOWECHAT') && (additionalData['ALTOWECHAT'] != null)) {
                var eftData = new ElectronicFundTransferModel();
                eftData.approvalCode = additionalData['ALTOWECHAT'].approvalCode;
                eftData.referenceCode = additionalData['ALTOWECHAT'].reffNo;
                eftData.transactionAmount = additionalData['ALTOWECHAT'].amount;
                eftData.cardNum = additionalData['ALTOWECHAT'].acntNo;
                eftData.cardHolder = additionalData['ALTOWECHAT'].customerName;
                eftData.transactionId = saleTx.transactionId;
                paymentMediaIns['eftData'] = eftData;
            } else if ((additionalPaymentMediaConfig.additionalDataKeyId == 'trk') && (additionalData['trk'] != null)) {
                var eftData = new ElectronicFundTransferModel();
                eftData.cardNum = additionalData['trk'].acntNo;
                eftData.transactionAmount = additionalData['trk'].amount;
                eftData.pointRedeemed = additionalData['trk'].pointRedeemed;
                eftData.transactionId = saleTx.transactionId;
                paymentMediaIns['eftData'] = eftData;
            } else if ((additionalPaymentMediaConfig.additionalDataKeyId == 'PPP') && (additionalData['PPP'] != null)) {
                var eftData = new ElectronicFundTransferModel();
                eftData.memberID = additionalData['PPP'].memberID;
                eftData.memberName = additionalData['PPP'].memberName;
                eftData.prevPoints = additionalData['PPP'].prevPoints;
                eftData.pppUsedPoints = additionalData['PPP'].pppUsedPoints;
                paymentMediaIns['eftData'] = eftData;
            }
            // MLC 2017-04-21
            paymentMediaIns[additionalPaymentMediaConfig.additionalDataKeyId] = additionalData[additionalPaymentMediaConfig.additionalDataKeyId];
        }

        // If null, setting the default Empty ARRAY value for payments
        saleTx.payments = saleTx.payments || paymentMediaArrLocal;
        // setting the reference to the local variable
        paymentMediaArrLocal = saleTx.payments;
        // Updating the amountPaid
        paymentMediaIns.amountPaid = (paymentMediaIns.amountPaid) ? (paymentMediaIns.amountPaid + payment) :
            payment;
        if (!isExisting) { // if not existing, push the data
            // Pushing the data to saleTx's array of payment media
            paymentMediaArrLocal.push(paymentMediaIns);
        }

    }
};

/**
 * Processes the payment arguments and add them to saleTx payments array.
 *
 * @param saleTx
 * @param paymentMediaType
 * @param payment
 * @param additionalData
 * @param overriddenPaymentConfig
 * @returns {boolean}
 */
PAYMENT_MEDIA.processPaymentDetailsToOrder = function(saleTx,
    paymentMediaType,
    payment,
    additionalData,
    overriddenPaymentConfig) {

    var isValidForAnotherPayment = true;

    console.log("~~~~~~~~~~~~~~~~~~~");

    console.log("PROCESS PAYMENT DETAILS TO ORDER");

    console.log("Payment media type : " + paymentMediaType);
    console.log("Payment : " + payment);
    console.log("Additional data : ")
    console.log(additionalData);
    console.log("Overriden : ")
    console.log(overriddenPaymentConfig);
    console.log("Sale tx : " + saleTx);

    if (saleTx &&
        paymentMediaType &&
        payment &&
        payment > 0) {

        var isPaymentExceedsFinalAmount = false;

        // The final amount, deducted with discounts, etc.
        var finalAmountLocal = CASHIER.getFinalSaleTxAmount(saleTx);

        console.log("Final sale : " + finalAmountLocal);
        console.log("Total amount paid : " + saleTx.totalAmountPaid);
        // if(saleTx.coBrandNumber && SALE_RETURN_COUPON.isUseCouponReturn()){
        // 	if(SALE_RETURN_COUPON.isCouponReturnCmc()){
        // 		// var totalSecondLayer = 0, totalSecondLayerWithoutMember = 0, saleTotalDiscount = 0;

        // 		// // for(var i in saleTx.orderItems)
        // 		// // {
        // 		// // 	if(!saleTx.orderItems[i].isVoided && saleTx.orderItems[i].secondLayerDiscountAmount > 0 && saleTx.orderItems[i].secondLayerDiscountAmountWithoutMember)
        // 		// // 	{
        // 		// // 			totalSecondLayer += saleTx.orderItems[i].secondLayerDiscountAmount;
        // 		// // 			totalSecondLayerWithoutMember += saleTx.orderItems[i].secondLayerDiscountAmountWithoutMember;
        // 		// // 	}
        // 		// // }

        // 		// // saleTotalDiscount += (totalSecondLayerWithoutMember - totalSecondLayer);

        // 		// finalAmountLocal -= saleTx.totalAmountPaid;
        // 		// console.log("Final sale after reduce coupon : " + finalAmountLocal);
        // 		// finalAmountLocal -= saleTotalDiscount;
        // 		// console.log("Final sale after reduce discount : " + saleTotalDiscount);
        // 		// finalAmountLocal -= SALE_RETURN_COUPON.calculateTotalMemberDiscount(finalAmountLocal); 
        // 		// console.log("Final sale after reduce mega discount : " + finalAmountLocal);
        // 	}
        // 	// finalAmountLocal += saleTx.totalAmountPaid;
        // }

        console.log("Final amount local : " + finalAmountLocal);

        var paymentConfig = PAYMENT_MEDIA.getPaymentConfigWithOverrides(paymentMediaType,
            overriddenPaymentConfig);
        console.log("Payment config : ");
        console.log(paymentConfig);
        var additionalDataKeyId;
        var hasConfigAdditionalDataKeyId = paymentConfig &&
            (additionalDataKeyId = paymentConfig.additionalDataKeyId);
        console.log("Has config additional data key id : ")
        console.log(hasConfigAdditionalDataKeyId);

        var hasValidAdditionalData = !hasConfigAdditionalDataKeyId // Valid if has NO config additionalDataKeyId
            ||
            hasConfigAdditionalDataKeyId // If it has, check the additionalData argument
            &&
            additionalData &&
            additionalData[additionalDataKeyId];
        console.log("Has valid additional data : ")
        console.log(hasValidAdditionalData);

        // START

        // var checkCoBrand = function(obj){
        // 	if(paymentMediaType.length > 3 && paymentMediaType.substring(0,3) === 'CMC'){
        // 		return true;
        // 	}
        // 	return false;
        // }

        // console.log("is coupon cmc : " + saleTx.isCouponCmc);
        // console.log("cobrand number : " + saleTx.coBrandNumber);
        // console.log("is card cobrand : " + saleTx.isCardCoBrand);
        // console.log("is card cobrand 2 : " + checkCoBrand(saleTx));

        // console.log(saleTx);

        // if(saleTx.isCouponCmc && saleTx.coBrandNumber && !checkCoBrand(saleTx) && paymentMediaType != 'COUPON' && paymentMediaType != 'COUPON_RETURN'){
        // 	finalAmountLocal += saleTx.cmcTotalDiscount;
        // 	finalAmountLocal += calculateTotalMemberDiscount();


        // 	for(var i = 0; i < saleTx.payments.length; i++){
        // 		if(saleTx.payments[i].paymentMediaType == 'COUPON_RETURN' || saleTx.payments[i].paymentMediaType == 'COUPON'){
        // 			saleTx.totalAmountPaid -= saleTx.payments[i].amountPaid;
        // 		}
        // 	}

        // 	if(paymentMediaType == 'CASH'){
        // 		saleTx.totalAmountPaid += calculateTotalMemberDiscount();
        // 	}else{
        // 		saleTx.totalAmountPaid -= calculateTotalMemberDiscount();
        // 		saleTx.totalAmountPaid += 2*saleTx.cmcTotalDiscount;
        // 	}

        // }else if(saleTx.isCouponCmc && saleTx.coBrandNumber && checkCoBrand(saleTx)){
        // 	saleTx.totalAmountPaid += saleTx.cmcTotalDiscount;
        // 	saleTx.totalAmountPaid -= calculateTotalMemberDiscount();
        // }

        console.log("Total amount paid before payment : " + saleTx.totalAmountPaid);

        // END

        if (!hasValidAdditionalData) {
            // If has invalid additional data argument/s, return Error
            throw new Error(">> Has invalid additionalData argument!");
        } else if (saleTx.totalAmountPaid < finalAmountLocal) {

            /* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
             * TODO: Process additionalData argument here.
             * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
             */

            // Increase the total amount paid by the current payment.
            saleTx.totalAmountPaid += parseInt(payment);
            // Compute for the total change.

            console.log("Total amount paid after payment: " + saleTx.totalAmountPaid);
            saleTx.totalChange = (saleTx.totalAmountPaid - finalAmountLocal);

            console.log("Total change : " + saleTx.totalChange);

            /* Checks if valid for another payment media entry, that is if the
             * total paid amount is still less than the final amount of all the Goods
             */
            isValidForAnotherPayment = saleTx.totalChange < 0;
            isPaymentExceedsFinalAmount = saleTx.totalChange > 0;

            console.log("Is valid for another payment : " + isValidForAnotherPayment);
            console.log("Is payment exceeds final amount : " + isPaymentExceedsFinalAmount);

            // Clearing the input display
            clearInputDisplay();
            // Adding the payment to saleTx
            PAYMENT_MEDIA.addPaymentDetailsToOrder(saleTx, paymentMediaType, payment, additionalData);
            // Cancels out the previously validated paymentMediaType(isValidForTriggering() = TRUE)
            if (PAYMENT_MEDIA.latestPendingValidatedPaymentMedia &&
                paymentMediaType == PAYMENT_MEDIA.latestPendingValidatedPaymentMedia.name) {
                PAYMENT_MEDIA.latestPendingValidatedPaymentMedia = null;
            }

            if (isValidForAnotherPayment) {
                // Display payment view
                PAYMENT_MEDIA.displayPaymentViewAsSystemMessage(saleTx);
            } else {
                // Clear system message div
                promptSysMsg();
            }


        } else {
            if (ELEBOX.isEleboxTransaction()) {
                showMsgDialog(getMsgValue('bp_label_error_mcash_failed'),
                    "warning");
            } else {
                showMsgDialog(getMsgValue('pos_warning_msg_pymt_could_not_add_another_payment_media'),
                    "warning");
            }
        }

    }
    console.log("~~~~~~~~~~~~~~~~~~~");
    return isValidForAnotherPayment;
};

/**
 * Replace the rawConfigKeyPlaceholder's placeholder to the currently passed paymentMediaType,
 * then returns the searched message.property value if any.
 * @param paymentMediaType
 * @returns {*}
 */
PAYMENT_MEDIA.getPropertyLabelValue = function(paymentMediaType) {
    console.log("Get property label value : " + paymentMediaType);
    var propVal = null;
    var propKey = null;
    if (paymentMediaType) {
        propKey = CONSTANTS.PAYMENT_MEDIA_TYPES.formatKeyByTxTypeArguments( // The type to search
            paymentMediaType,
            // The unformatted messages.properties key
            CONSTANTS.PAYMENT_MEDIA_TYPES.KEY_MESSAGES_PROP_FORMAT,
            // to lower
            false,
            // use the 1st argument of searched TX_TYPE
            false);
        console.log("Prop key : " + propKey);
        propVal = getMsgValue(propKey);
        console.log("Prop val : " + propVal);

        if (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name) {
            propVal = getConfigValue('RECEIPT_CMC_EFT_ONLINE');
        } else if (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name) {
            /*if(saleTx.eftTransactionType == 'ZEPRO')
            	propVal = 'MEGA ZEPRO OFFLINE';
            else*/
            propVal = getConfigValue('RECEIPT_CMC_EFT_OFFLINE');
        } else if (isCmcTransaction() && paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name) {
            propVal = getConfigValue('RECEIPT_CMC_EDC_BCA');
        }
        // MLC 2017-04-21
        else if (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name) {
            propVal = 'MEGA SMARTPAY:'; //getConfigValue('RECEIPT_CMC_EDC_BCA');
        }
        //Allo payment 2021-07-15
        else if (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.ALLO_PAYMENT.name) {
            propVal = 'ALLO SMARTPAY:'; //getConfigValue('RECEIPT_CMC_EDC_BCA');
        }
        //Allo payment 2021-07-15
        else if (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.OVO_PAYMENT.name) {
            propVal = 'OVO PAYMENT:'; //getConfigValue('RECEIPT_CMC_EDC_BCA');
        }
        // ALTO WECHAT
        else if (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.ALTOWECHAT.name) {
            propVal = 'ALTO QR PAY:'; //getConfigValue('RECEIPT_CMC_EDC_BCA');
        }
        // PPP
        else if (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.POWER_POINT_PURCHASE.name) {
            propVal = 'PPP:'; //getConfigValue('RECEIPT_CMC_EDC_BCA');
        }
        // Coupon Return
        else if (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name) {
            propVal = 'Coupon Return:'; //getConfigValue('RECEIPT_CMC_EDC_BCA');
        }
    }
    return propVal;

};

/**
 * Checks if the transaction already has the specific payment media
 */
PAYMENT_MEDIA.isTransactionHasMedia = function(tx, paymentMediaType) {
    var hasMedia = false;
    if (tx.payments) {
        for (var i in tx.payments) {
            if (tx.payments[i].paymentMediaType &&
                tx.payments[i].paymentMediaType == paymentMediaType) {
                hasMedia = true;
                break;
            }
        }
    }
    return hasMedia;
};

/**
 * Validation if the triggered payment media is valid for processing
 */
PAYMENT_MEDIA.isValidForTriggering = function(saleTx,
    paymentMediaType,
    payment,
    enablePaymentMedia,
    overriddenPaymentConfig) {
    var isValid = true;
    uilog("DBUG", "Final subtotal tx amount : " + CASHIER.getFinalSubtotalTxAmount(saleTx));
    if (payment && !isNaN(payment) && payment > parseInt(getConfigValue('PAYMENT_MAXIMUM_AMOUNT'))) {
        uilog("DBUG", "Reached maximum payment length");
        console.log("if else 1 payment media");
        showMsgDialog(getMsgValue('pos_warning_msg_pymt_max_amount_reached'), 'warning');
        isValid = false;
    } else if (!enablePaymentMedia ||
        CASHIER.getFinalSubtotalTxAmount(saleTx) <= 0) {
        // Execution not allowed
        showKeyNotAllowedMsg();
        console.log("if else 2 payment media");
        console.log(enablePaymentMedia);
        console.log(CASHIER.getFinalSubtotalTxAmount(saleTx));
        console.log("====");
        isValid = false;
    } else if (isInstallmentTransaction && $.isEmptyObject(installmentPaymentDetails)) {
        showKeyNotAllowedMsg();
        console.log("if else 3 payment media");
        isValid = false;
        payment = installmentPayent;
    } else if (isNaN(payment) || payment === "") {
        // Prompts "invalid amount"
        console.log("if else 4 payment media");
        showMsgDialog(getMsgValue('pos_warning_msg_invalid_amount'), "warning");
        isValid = false;
    }else if (paymentMediaType != "CASH" && saleTx.qrtts) {
        showMsgDialog('ALLO TOPUP CASH ONLY', "warning");
        isValid = false;
    // }else if ((typeof(saleTx.employeeDiscountToggled) != 'undefined' && saleTx.employeeDiscountToggled == true) && (paymentMediaType == "CASH" || paymentMediaType == "EDC_BCA" || paymentMediaType == "DEBIT"
    // || paymentMediaType == "INSTALLMENT"|| paymentMediaType == "GC" || paymentMediaType == "OVO_PAYMENT" || paymentMediaType == "FLAZZ"
    // || paymentMediaType == "SODEXO")) {
    }else if ((typeof(saleTx.employeeDiscountToggled) != 'undefined' && saleTx.employeeDiscountToggled == true) && PAYMENT_MEDIA.empPaymentAllowed(paymentMediaType)) {
        showMsgDialog('PAYMENT NOT ALLOWED.', "warning");
        isValid = false;
    } else if (saleTx &&
        paymentMediaType &&
        payment != null // Accepting ZEROES, preventing nulls
    ) {
        console.log("if else 5 payment media");
        if (paymentMediaType != "TRK_SALES" && saleTx.type == "RETURN" && saleGameItemTrk) {
            isValid = false;
            var defualtPymtMsg = getMsgValue('pos_warning_msg_pymt_invalid_media_placeholder')
                .format(getConfigValue("INVALID_PYMT_TRIGGERED_MSG"),
                    "RETURN TRK SALES");
            // : getMsgValue('pos_error_msg_key_not_allowed');
            showMsgDialog(FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS.strArrayNotInFlowMsgBuilder(defualtPymtMsg, null),
                "warning");
            console.log("if else 6 payment media");
        } else if (paymentMediaType == "TRK_SALES" && saleTx.type == "RETURN" && !saleGameItemTrk) {
            isValid = false;
            var defualtPymtMsg = getMsgValue('pos_warning_msg_pymt_invalid_media_placeholder')
                .format(getConfigValue("INVALID_PYMT_TRIGGERED_MSG"),
                    "RETURN");
            // : getMsgValue('pos_error_msg_key_not_allowed');
            showMsgDialog(FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS.strArrayNotInFlowMsgBuilder(defualtPymtMsg, null),
                "warning");
            console.log("if else 7 payment media");
        }

        // Initialiser flag
        var hasNoPayment = !!saleTx.payments &&
            saleTx.payments.length == 0;
        // The final amount, deducted with discounts, etc.
        var finalAmountLocal = CASHIER.getFinalSaleTxAmount(saleTx);

        // If null, set the default ZERO amount
        saleTx.totalAmountPaid = saleTx.totalAmountPaid || 0;
        if (hasNoPayment) {
            console.log("if else 8 payment media");
            saleTx.totalChange = (saleTx.totalAmountPaid - finalAmountLocal);
        }

        // START 

        // uilog("DBUG","Total amount paid : " + saleTx.totalAmountPaid);
        // uilog("DBUG","is coupon cmc : " + saleTx.isCouponCmc);
        // uilog("DBUG","cobrand number : " + saleTx.coBrandNumber);
        // uilog("DBUG","is card cobrand : " + saleTx.isCardCoBrand);
        // uilog("DBUG","member discount : " + calculateTotalMemberDiscount());

        // if(saleTx.isCouponCmc && saleTx.coBrandNumber && !saleTx.isCardCoBrand && paymentMediaType != 'COUPON' && paymentMediaType != 'COUPON_RETURN'){
        // 	uilog("DBUG","Increase total amount paid");
        // 	uilog("DBUG","cmc total discount : " + saleTx.cmcTotalDiscount);
        // 	finalAmountLocal += saleTx.cmcTotalDiscount;
        // 	finalAmountLocal += calculateTotalMemberDiscount();

        // 	for(var i = 0; i < saleTx.payments.length; i++){
        // 		if(saleTx.payments[i].paymentMediaType == 'COUPON_RETURN' || saleTx.payments[i].paymentMediaType == 'COUPON'){
        // 			saleTx.totalAmountPaid -= saleTx.payments[i].amountPaid;
        // 		}
        // 	}
        // }

        // uilog("DBUG","Total amount paid : " + saleTx.totalAmountPaid);
        // uilog("DBUG","Final amount local : " + finalAmountLocal);

        // uilog("DBUG","Cmc discount : " + saleTx.cmcTotalDiscount);
        // uilog("DBUG","Final amount local : " + finalAmountLocal);

        // END

        if (saleTx.totalAmountPaid < finalAmountLocal) {
            console.log("if else 9 payment media");
            /* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
             * TODO: Process additional conditions here
             * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
             */

            var paymentConfig = PAYMENT_MEDIA.getPaymentConfigWithOverrides(paymentMediaType,
                overriddenPaymentConfig);

            isValid = isValid
                // Check the limits first
                &&
                PAYMENT_MEDIA.hasValidMinMaxAmountLimit(saleTx, paymentMediaType, payment, paymentConfig) &&
                PAYMENT_MEDIA.isValidForCashChange(saleTx, paymentMediaType, payment, paymentConfig) &&
                PAYMENT_MEDIA.isValidAsLastPayment(saleTx, paymentMediaType, payment, paymentConfig) &&
                PAYMENT_MEDIA.isValidSinglePaymentInTx(saleTx, paymentMediaType, payment, paymentConfig);

            // START

            // uilog("DBUG","After validate");
            // uilog("DBUG","Member discount : " + calculateTotalMemberDiscount());
            // uilog("DBUG","Mega discount : " + saleTx.cmcTotalDiscount);
            // uilog("DBUG","Before total amount paid : " + saleTx.totalAmountPaid);
            // if(saleTx.isCouponCmc && saleTx.coBrandNumber && !saleTx.isCardCoBrand && paymentMediaType != 'COUPON' && paymentMediaType != 'COUPON_RETURN'){
            // 	if(paymentMediaType != 'CASH'){
            // 		saleTx.totalAmountPaid += calculateTotalMemberDiscount();
            // 		saleTx.totalAmountPaid -= saleTx.cmcTotalDiscount;	
            // 	}

            // 	for(var i = 0; i < saleTx.payments.length; i++){
            // 		if(saleTx.payments[i].paymentMediaType == 'COUPON_RETURN' || saleTx.payments[i].paymentMediaType == 'COUPON'){
            // 			saleTx.totalAmountPaid += saleTx.payments[i].amountPaid;
            // 		}
            // 	}
            // }else if(saleTx.isCouponCmc && saleTx.coBrandNumber && saleTx.isCardCoBrand){
            // }
            // uilog("DBUG","After total amount paid : " + saleTx.totalAmountPaid);

            // END

            PAYMENT_MEDIA.latestPendingValidatedPaymentMedia = CONSTANTS.PAYMENT_MEDIA_TYPES.findTxTypeByName(paymentMediaType);

        } else {
            console.log("if else 10 payment media");
            isValid = false;
            if (ELEBOX.isEleboxTransaction()) {
                showMsgDialog(getMsgValue('bp_label_error_mcash_failed'),
                    "warning");
            } else {
                showMsgDialog(getMsgValue('pos_warning_msg_pymt_could_not_add_another_payment_media'),
                    "warning");
            }
        }
    } else {
        console.log("if else 11 payment media");
        isValid = false;
    }
    uilog("DBUG", "Is valid : " + isValid);
    return isValid;
};

/**
 * Checks if has valid min max amount. Prompts an
 * error message if invalid.
 * @param saleTx
 * @param paymentMediaType
 * @param payment
 * @param paymentConfig
 * @returns {boolean}
 */
PAYMENT_MEDIA.hasValidMinMaxAmountLimit = function(saleTx,
    paymentMediaType,
    payment,
    paymentConfig) {
    var isValid = true;
    /*================================================
     * START:  Minimum/Maximum limit verification
     *================================================*/
    var acceptedMinAmt = parseInt(paymentConfig.minValue);
    var acceptedMaxAmt = parseInt(paymentConfig.maxValue);

    // Used for checking if maximum limit is reached!.
    var isExistingMediaReturnObj = (acceptedMaxAmt) ? PAYMENT_MEDIA.findExistingSaleTxPaymentMedia(saleTx, paymentMediaType, true) :
        null;
    var searchedPaymentMedia = null;
    var totalAmountPaidByType = (isExistingMediaReturnObj &&
            isExistingMediaReturnObj.isFound &&
            (searchedPaymentMedia = isExistingMediaReturnObj.returnValue)) ? searchedPaymentMedia.amountPaid :
        0;
    // valid if has configuration value, but the current payment is greater than or equal the min amount
    var isValidMin = payment >= acceptedMinAmt;
    // Valid if max is ZERO(No limit)
    var isValidMax = acceptedMaxAmt == 0
        // valid if has configuration value, but the current payment is greater than or equal the max amount
        ||
        (totalAmountPaidByType + payment) <= acceptedMaxAmt;
    isValid = isValidMin &&
        isValidMax;

    if (!isValid) {
        var minValueMsg = numberWithCommas(acceptedMinAmt) || 1;
        var maxValueMsg = (acceptedMaxAmt) ? numberWithCommas(acceptedMaxAmt) : getMsgValue('pos_label_no_limit');

        var msgPropKey = null;
        var firstArgument = null;
        var rangeSymbol = null;
        var acceptableAmountLimitLbl = null;
        if (acceptedMaxAmt &&
            !isValidMax &&
            (acceptedMaxAmt == totalAmountPaidByType)) {
            // If max limit reached
            /*
             * Maximum amount reached.
             */
            msgPropKey = 'pos_warning_msg_pymt_max_amount_reached';
        } else if (acceptedMinAmt == acceptedMaxAmt &&
            acceptedMaxAmt != 0) {
            // If min/max limit are both equals
            /*
             * Media amount should be equal to {0}.
             */
            msgPropKey = 'pos_warning_msg_pymt_media_amount_not_equal';
            firstArgument = minValueMsg;
        } else if (!isValidMax &&
            isValidMin) {
            // Is minimum amount valid, AND maximum amount invalid
            /*
             * Over amount.
             * <br/>
             * <br/>Payment Media: {1}
             * <br/>Min Amount: {2}
             * <br/>Max Amount: {3}
             * <br/>Acceptable amount: {4} {5}
             */
            msgPropKey = 'pos_warning_msg_pymt_invalid_prerequisite_amount';
            firstArgument = getMsgValue('pos_warning_msg_pymt_over_amount');
            rangeSymbol = '<=';
            acceptableAmountLimitLbl = numberWithCommas(acceptedMaxAmt - totalAmountPaidByType);
        } else {
            // is minimum amount invalid
            /*
             * Below minimum amount.
             * <br/>
             * <br/>Payment Media: {1}
             * <br/>Min Amount: {2}
             * <br/>Max Amount: {3}
             * <br/>Acceptable amount: {4} {5}
             */
            msgPropKey = 'pos_warning_msg_pymt_invalid_prerequisite_amount';
            firstArgument = getMsgValue('pos_warning_msg_pymt_below_amount');
            rangeSymbol = '>=';
            acceptableAmountLimitLbl = minValueMsg;
        }
        // Prompts the constructed message.
        showMsgDialog(getMsgValue(msgPropKey)
            .format(firstArgument,
                CONSTANTS.PAYMENT_MEDIA_TYPES.findTxTypeByName(paymentMediaType).getDisplayName(),
                minValueMsg,
                maxValueMsg,
                rangeSymbol,
                acceptableAmountLimitLbl),
            "warning");
    }

    /*================================================
     * END:  Minimum/Maximum limit verification
     *================================================*/

    return isValid;
};

/**
 * Checks if valid for giving a cash-change. There are
 * other payment media that doesn't accept chaging cash to customers.
 * Prompts an error message if invalid.
 * @param saleTx
 * @param paymentMediaType
 * @param payment
 * @param paymentConfig
 * @returns {boolean}
 */
PAYMENT_MEDIA.isValidForCashChange = function(saleTx,
    paymentMediaType,
    payment,
    paymentConfig) {
    var isValid = true;
    // Negative, meaning amount-paid is less than the final amount; balance-due
    console.log(CASHIER.getFinalSubtotalTxAmount(saleTx));
    console.log(saleTx.totalAmountPaid);

    var balanceDue = CASHIER.getFinalSubtotalTxAmount(saleTx) - saleTx.totalAmountPaid;

    var amountPaid = saleTx.totalDiscount - saleTx.memberDiscReversal;

    // if(SALE_RETURN_COUPON.isCouponReturnNotCmc(saleTx)){
    // 	balanceDue += amountPaid;
    // }

    // if(saleTx.isCouponCmc && saleTx.coBrandNumber){
    // 	console.log("cmc coupon return");
    // 	balanceDue += calculateTotalMemberDiscount();
    // }

    console.log("Balance due : " + balanceDue);
    var changeAmount = (payment - balanceDue);
    console.log("Change amount : " + changeAmount);
    var localChangeMinValue = 0,
        localChangeMaxValue = 0;

    var isLessThanChangeMinValue = false;
    var isMoreThanChangeMaxValue = false;
    /*
     * Conditions for checking:
     *	1.) Check if has balance due.
     *	2.) Check if invalid-for-cash-change payment media is acceptable. see computation below:
     *  3.) Check if the changeAmount is within bounds of changeMinValue AND changeMaxValue
     *	  invalid-for-cash-change payment <= BALANCE DUE
     */
    var isConfigValidForCashChange = paymentConfig &&
        paymentConfig.isValidForCashChange;
    /* If condition for minimum/max change/withdrawal condition 
     */
    console.log("is config valid for cash change : " + isConfigValidForCashChange);
    var isValidForCashChange = (isConfigValidForCashChange &&
            changeAmount < 0) ||
        isConfigValidForCashChange
        // If has change-due
        &&
        changeAmount >= 0 &&
        !(isLessThanChangeMinValue = !(changeAmount >= (localChangeMinValue = parseInt(paymentConfig.changeMinValue))))
        // Intended single ampersand (&)
        &
        !(isMoreThanChangeMaxValue = !((localChangeMaxValue = parseInt(paymentConfig.changeMaxValue)) == 0 ||
            (changeAmount <= localChangeMaxValue)));
    /* If the payment media is not valid for cash change configuration
     * check if its amount is less than the balance due, to be considered as valid.
     */
    console.log("is valid for cash change : " + isValidForCashChange);

    var isValidForNonCashChangeMedia = balanceDue &&
        !isConfigValidForCashChange &&
        payment <= balanceDue;

    console.log("is valid for non cash change media : " + isValidForNonCashChangeMedia);

    isValid = isValidForCashChange ||
        isValidForNonCashChangeMedia;


    if (!isValid) {

        var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.findTxTypeByName(paymentMediaType).getDisplayName();

        var msgPropKey;
        var acceptableAmount;
        if (isLessThanChangeMinValue) {
            acceptableAmount = localChangeMinValue + balanceDue;
            /*Less than valid withdrawable amount.
             *<br/>
             *<br/>Payment Media: {0}
             *<br/>Acceptable amount: {1} {2}
             *<br/>Min Withdraw:{3} {4}
             *<br/>Max Withdraw:{5} {6}
             *<br/>Current Change: {7}
             */
            msgPropKey = 'pos_warning_msg_pymt_less_than_min_change_amount';
        } else if (isMoreThanChangeMaxValue) {
            acceptableAmount = localChangeMaxValue + balanceDue;
            /*More than valid withdrawable amount.
             *<br/>
             *<br/>Payment Media: {0}
             *<br/>Acceptable amount: {1} {2}
             *<br/>Min Withdraw:{3} {4}
             *<br/>Max Withdraw:{5} {6}
             *<br/>Current Change: {7}
             */
            msgPropKey = 'pos_warning_msg_pymt_more_than_max_change_amount';
        } else {
            acceptableAmount = balanceDue;
            /*More than balance due amount.
             *<br/>
             *<br/>Payment Media: {0}
             *<br/>Acceptable amount: {1} {2}
             */
            msgPropKey = 'pos_warning_msg_pymt_invalid_for_change_amount';
        }
        var isSingleAmount = localChangeMaxValue == localChangeMinValue &&
            localChangeMaxValue != 0;
        showMsgDialog(getMsgValue(msgPropKey)
            .format(mediaType,
                (isSingleAmount) ? "=" : (isLessThanChangeMinValue) ? ">=" : "<=",
                numberWithCommas(acceptableAmount),
                " >=",
                ((localChangeMinValue) ? numberWithCommas(localChangeMinValue) : 0),
                (localChangeMaxValue) ? " <=" : "",
                ((localChangeMaxValue) ? numberWithCommas(localChangeMaxValue) : getMsgValue('pos_label_no_limit')),
                numberWithCommas(changeAmount)),
            "warning");
    }

    console.log("Is valid ? " + isValid);
    return isValid;
};

/**
 * Check if a payment is valid only as last payment.
 * Prompts an error message if invalid.
 * @param saleTx
 * @param paymentMediaType
 * @param payment
 * @param paymentConfig
 * @returns {boolean}
 */
PAYMENT_MEDIA.isValidAsLastPayment = function(saleTx,
    paymentMediaType,
    payment,
    paymentConfig) {

    var isValid = true;

    var hasSaleTxPayments = !!saleTx.payments &&
        saleTx.payments.length > 0;
    var isConfigValidAsLastPayment = paymentConfig &&
        (paymentConfig.isValidAsLastPayment);

    var allowAsLastPayment = isConfigValidAsLastPayment
        // Check if the payment match or exceeds the balance due.
        &&
        PAYMENT_MEDIA.isValidAsLastPaymentWithoutConfig(saleTx, payment);

    isValid = !isConfigValidAsLastPayment ||
        allowAsLastPayment;

    if (!isValid) {
        showMsgDialog(getMsgValue((hasSaleTxPayments) ? 'pos_warning_msg_pymt_not_valid_for_last_payment' :
                'pos_warning_msg_pymt_invalid_single_media_in_tx')
            .format(getMsgValue('pos_warning_msg_pymt_less_than_media_amount')),
            "warning");
    }

    return isValid;
};

/**
 * Check if a payment is valid only as last payment.
 * The raw condition checking, disregarding the fetched or overriden configuration.
 * @param saleTx
 * @param payment
 * @returns {*|boolean}
 */
PAYMENT_MEDIA.isValidAsLastPaymentWithoutConfig = function(saleTx, payment) {

    return (saleTx &&
        payment &&
        (saleTx.totalAmountPaid + payment) >= (saleTx.totalAmountPaid - saleTx.totalChange));
};

/**
 * Check if a payment media is only valid as sole payment.
 * Prompts an error message if invalid.
 * @param saleTx
 * @param paymentMediaType
 * @param payment
 * @param paymentConfig
 * @returns {boolean}
 */
PAYMENT_MEDIA.isValidSinglePaymentInTx = function(saleTx,
    paymentMediaType,
    payment,
    paymentConfig) {

    var isValid = true;

    var hasSaleTxPayments = !!saleTx.payments &&
        saleTx.payments.length > 0;
    var isConfigSinglePaymentInTx = paymentConfig &&
        (paymentConfig.isSinglePaymentInTx);
    var allowSinglePaymentInTx = isConfigSinglePaymentInTx &&
        !hasSaleTxPayments &&
        (saleTx.totalAmountPaid + payment) >= (saleTx.totalAmountPaid - saleTx.totalChange);
    isValid = !isConfigSinglePaymentInTx ||
        allowSinglePaymentInTx;

    if (!isValid) {

        showMsgDialog(getMsgValue('pos_warning_msg_pymt_invalid_single_media_in_tx')
            .format(getMsgValue((hasSaleTxPayments) ? 'pos_warning_msg_pymt_other_already_exist' :
                'pos_warning_msg_pymt_less_than_media_amount')),
            "warning");
    }
    return isValid;
};

/**
 * Gets the DB min/max and changeMin/changeMax values for
 * a particular payment media type. Also overrides the values
 * if overridenPyamentConfig is not empty.
 * @param paymentMediaType
 * @param overriddenPaymentConfig
 * @returns {*|{}}
 */
PAYMENT_MEDIA.getPaymentConfigWithOverrides = function(paymentMediaType,
    overriddenPaymentConfig) {
    var defaultZero = 0;
    var defaultOne = 1;
    var keyMinValue = "minValue";
    var keyMaxValue = "maxValue";
    var keyChangeMinValue = "changeMinValue";
    var keyChangeMaxValue = "changeMaxValue";
    var returnConfig = PAYMENT_MEDIA.ADDITIONAL_CONFIG[paymentMediaType] || {};
    returnConfig[keyMinValue] = PAYMENT_MEDIA.getConfigMsgValue(paymentMediaType,
        CONSTANTS.PAYMENT_MEDIA_TYPES.KEY_CONFIG_AMOUNT_MIN);
    returnConfig[keyMaxValue] = PAYMENT_MEDIA.getConfigMsgValue(paymentMediaType,
        CONSTANTS.PAYMENT_MEDIA_TYPES.KEY_CONFIG_AMOUNT_MAX);
    returnConfig[keyChangeMinValue] = PAYMENT_MEDIA.getConfigMsgValue(paymentMediaType,
        CONSTANTS.PAYMENT_MEDIA_TYPES.KEY_CONFIG_AMOUNT_CHANGE_MIN);
    returnConfig[keyChangeMaxValue] = PAYMENT_MEDIA.getConfigMsgValue(paymentMediaType,
        CONSTANTS.PAYMENT_MEDIA_TYPES.KEY_CONFIG_AMOUNT_CHANGE_MAX);
    if (returnConfig &&
        overriddenPaymentConfig) {
        // Override the configuration.
        returnConfig = $.extend({}, returnConfig, overriddenPaymentConfig);
    }
    var biggestConfigPaymentValue = Math.max((returnConfig.minValue = (returnConfig.minValue || defaultOne /*For payment default is 1*/ )),
        (returnConfig.maxValue = (returnConfig.maxValue || defaultZero)));
    // If MIN_VALUE is bigger than max value
    // And max value not equal to ZERO(no limit), change the min value to default(ZERO)
    if (returnConfig.maxValue != biggestConfigPaymentValue &&
        returnConfig.maxValue != 0) {
        // For normal payment default is 1
        returnConfig[keyMinValue] = defaultOne;
    }
    var biggestConfigChangePaymentValue = Math.max((returnConfig.changeMinValue = (returnConfig.changeMinValue || defaultZero)),
        (returnConfig.changeMaxValue = (returnConfig.changeMaxValue || defaultZero)));
    // If CHANGE_MIN_VALUE is bigger than max value 
    // And max value not equal to ZERO(no limit), change the min value to default(ZERO)
    if (returnConfig.changeMaxValue != biggestConfigChangePaymentValue &&
        returnConfig.changeMaxValue != 0) {
        // For change/withdrawal, default is ZERO
        returnConfig[keyChangeMinValue] = defaultZero;
    }
    return returnConfig;
};

/**
 * Finalise last payment, for saving the actual amount paid for the
 * rendered last payment media item.
 */
PAYMENT_MEDIA.finalizeSaleTxLastPaymentAmount = function(saleTx) {

    var saleTxPaymentsLength;
    var lastPaymentMediaItem;
    var additionalPaymentMediaConfig;
    var clonedSaleTx;
    if (saleTx
        // Deep cloning, $.extend doesn't clone instantiated objects.
        &&
        (clonedSaleTx = JSON.parse(JSON.stringify(saleTx)))
        // && (clonedSaleTx = saleTx)
        &&
        clonedSaleTx.payments &&
        (saleTxPaymentsLength = clonedSaleTx.payments.length) > 0
        // get the last payment media item by final index.
        &&
        (lastPaymentMediaItem = clonedSaleTx.payments[saleTxPaymentsLength - 1]) != null &&
        (additionalPaymentMediaConfig = PAYMENT_MEDIA.ADDITIONAL_CONFIG[lastPaymentMediaItem.paymentMediaType]) &&
        additionalPaymentMediaConfig.isValidForCashChange) {

        var lastPaymentAmount = lastPaymentMediaItem.amountPaid;

        lastPaymentAmount -= CASHIER.getTotalPostGoodsPaymentAmount(clonedSaleTx);
        lastPaymentAmount -= (clonedSaleTx.totalChange &&
                clonedSaleTx.totalChange > 0) ? clonedSaleTx.totalChange :
            0;
        lastPaymentMediaItem.amountPaid = lastPaymentAmount;
    }
    return clonedSaleTx;
};

/**
 * The inverse of PAYMENT_MEDIA.finalizeSaleTxLastPaymentAmount()
 */
PAYMENT_MEDIA.toRawSaleTxLastPaymentAmount = function(saleTx) {

    var saleTxPaymentsLength;
    var lastPaymentMediaItem;
    var additionalPaymentMediaConfig;
    if (saleTx &&
        saleTx.payments &&
        (saleTxPaymentsLength = saleTx.payments.length) > 0
        // get the last payment media item by final index.
        &&
        (lastPaymentMediaItem = saleTx.payments[saleTxPaymentsLength - 1]) != null &&
        (additionalPaymentMediaConfig = PAYMENT_MEDIA.ADDITIONAL_CONFIG[lastPaymentMediaItem.paymentMediaType]) &&
        additionalPaymentMediaConfig.isValidForCashChange) {

        var lastPaymentAmount = lastPaymentMediaItem.amountPaid;
        lastPaymentAmount += CASHIER.getTotalPostGoodsPaymentAmount(saleTx);
        lastPaymentAmount += (saleTx.totalChange &&
                saleTx.totalChange > 0) ? saleTx.totalChange :
            0;
        lastPaymentMediaItem.amountPaid = lastPaymentAmount;
    }
    return saleTx;
};

/**==========================================================================**
 * END : Background process; computations, manipulations, CRUDs.
 **==========================================================================**/

/**==========================================================================**
 * START : Page display related functions
 **==========================================================================**/

/**
 * PAYMENT VIEW display.
 */
PAYMENT_MEDIA.displayPaymentViewAsSystemMessage = function(saleTx) {

    // CR ADD DISCOUNT
    if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
        saleTx.zeproCardDone) {
        var orderItems = getSummarizeSaleItems(saleTx);
        for (var indexItem in orderItems) {
            var prodData = findItem(orderItems[indexItem].ean13Code);
            if (!isItemContainCMCPromo(orderItems[indexItem].ean13Code, prodData.promotions) &&
                typeof(orderItems[indexItem].additionalDiscount) != 'undefined') {
                saleTx.totalDiscount -= orderItems[indexItem].additionalDiscount;
                saleTx.totalAdditionalDiscount -= orderItems[indexItem].additionalDiscount;

                saleTx.promotionItems.splice(indexItem, 1);

                for (var indexOrderItem in saleTx.orderItems) {
                    if (orderItems[indexItem].productId == saleTx.orderItems[indexOrderItem].productId &&
                        orderItems[indexItem].additionalDiscount &&
                        orderItems[indexItem].additionalDiscount != 0)

                        saleTx.orderItems[indexOrderItem].additionalDiscount = 0;
                }
            }
        }
        saleTx.totalChange = saleTx.totalAmountPaid - CASHIER.getFinalSubtotalTxAmount(saleTx);
        $("div#numPad div#keyTotal").click();
    } else if (saleTx.payments[0] && saleTx.payments[0].paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name) {
        if ($("#tenderNewAmount-dialog").data('additionalDiscountItemLevel') &&
            saleTx.payments.length != 0 &&
            saleTx.totalDiscount > 0) {
            saleTx.totalDiscount -= $("#tenderNewAmount-dialog").data('additionalDiscountItemLevel');
            saleTx.totalAdditionalDiscount -= $("#tenderNewAmount-dialog").data('additionalDiscountItemLevel');
            //processLayerThreePromotions(false, false);
            $("div#numPad div#keyTotal").click();
            saleTx.totalChange = saleTx.totalAmountPaid - CASHIER.getFinalSubtotalTxAmount(saleTx);
            $("#tenderNewAmount-dialog").removeData('additionalDiscountItemLevel');
        }

        if ($("#tenderNewAmount-dialog").data('additionalDiscountPaymentLevel') &&
            saleTx.payments.length != 0 &&
            saleTx.totalDiscount > 0) {
            saleTx.totalDiscount -= $("#tenderNewAmount-dialog").data('additionalDiscountPaymentLevel');
            saleTx.totalAdditionalDiscount -= $("#tenderNewAmount-dialog").data('additionalDiscountPaymentLevel');
            $("div#numPad div#keyTotal").click();
            saleTx.totalChange = saleTx.totalAmountPaid - CASHIER.getFinalSubtotalTxAmount(saleTx);
            $("#tenderNewAmount-dialog").removeData('additionalDiscountPaymentLevel');
        }

        for (var promoIndex in saleTx.promotionItems) {
            if (saleTx.promotionItems[promoIndex].type == CONSTANTS.PROMOTION_TYPES.ADDITIONAL_DISCOUNT.type) {
                saleTx.promotionItems.splice(promoIndex, 1);
            }
        }

        for (var itemIndex in saleTx.orderItems) {
            if (saleTx.orderItems[itemIndex].additionalDiscount && saleTx.orderItems[itemIndex].additionalDiscount != 0) saleTx.orderItems[itemIndex].additionalDiscount = 0
        }
    }

    // CR ADD DISCOUNT
    var paymentMediaArrLocal = null;
    //console.log('saleTx multi payment');]

    // console.log(saleTx.payments);

    if (saleTx &&
        (paymentMediaArrLocal = saleTx.payments) &&
        saleTx.totalChange &&
        saleTx.totalChange < 0) {
        // Displaying of payment view
        /*
          Payment View

          Sub-total 	: 102.000
          Cash	        : 100.000
          Balance due	: 2000
          EFT ONLINE	: 2000
        */
        // console.log("if - 1");
        var paymentMediaDetails = [];
        var subTotalLbl = getMsgValue('pos_label_payment_view_subtotal');
        var subTotalValue = saleTx.totalAmountPaid - saleTx.totalChange;
        //console.log('totalAmountPaid : ' + saleTx.totalAmountPaid);
        var balanceDueLbl = getMsgValue('pos_label_payment_view_balance_due');
        // var balanceDueValue  = Math.abs(saleTx.totalChange);
        var currBalanceDueValue = CASHIER.getFinalSubtotalTxAmount(saleTx);
        // Added for negativeSign in display for RETURN multiple payments.
        var negativeSign = isNegativeSign(saleTx) ? "-" : "";

        // START

        // console.log("Current balance due : " + currBalanceDueValue);

        // console.log("System view");
        // console.log(saleTx);

        // var checkCoBrand = function(obj){
        // 	return obj.payments.some(function(p){
        // 		return p.paymentMediaType.indexOf('CMC') !== -1;
        // 	})
        // }

        // console.log("Is card cobrand");
        // console.log(checkCoBrand(saleTx));
        // if(checkCoBrand(saleTx) && saleTx.isCouponCmc){
        // 	subTotalValue = subTotalValue - 2*calculateTotalMemberDiscount();
        // 	subTotalValue -= saleTx.cmcTotalDiscount;
        // 	currBalanceDueValue -= calculateTotalMemberDiscount();			
        // }

        // END

        paymentMediaDetails.push(PAYMENT_MEDIA.generatePaymentMediaViewDetail(
            subTotalLbl,
            numberWithCommas(subTotalValue) + negativeSign
        ));

        var counter = 0;
        var currPayment = null;

        while (currPayment = paymentMediaArrLocal[counter++]) {
            try {
                // console.log(counter);
                var currPaymentTypeLbl = currPayment.paymentMediaType;
                var currPaymentAmt = currPayment.amountPaid;

                // console.log(currPaymentTypeLbl);
                // console.log(currPaymentAmt);

                // console.log(currBalanceDueValue);

                var propMsg = PAYMENT_MEDIA.getPropertyLabelValue(currPaymentTypeLbl);

                // START

                // console.log(propMsg);

                // if(propMsg == 'COUPON' || propMsg == 'COUPON RETURN'){
                // 	isCoupon = true;
                // }

                // if(saleTx.isCouponCmc && !isCoupon && !saleTx.isCardCoBrand){
                // 	var cmcTotalDiscount = cmcCouponDiscount(currBalanceDueValue, saleTx.coBrandNumber);
                // 	saleTx.cmcTotalDiscount = cmcTotalDiscount;

                // 	currBalanceDueValue -= cmcTotalDiscount;

                // 	paymentMediaDetails.push(PAYMENT_MEDIA.generatePaymentMediaViewDetail('MEGA DISCOUNT', numberWithCommas(cmcTotalDiscount)));
                // 	paymentMediaDetails.push(PAYMENT_MEDIA.generatePaymentMediaViewDetail(balanceDueLbl,
                // 																	  numberWithCommas(currBalanceDueValue) + negativeSign,
                // 																	  'payment-view-item-highlight'));
                // }

                // END

                currBalanceDueValue -= currPaymentAmt;
                // console.log(currBalanceDueValue);

                if (currPayment.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name) {
                    propMsg = (currPayment.installmentPayment &&
                            currPayment.installmentPayment.installmentPaymentDTO) ?
                        currPayment.installmentPayment.installmentPaymentDTO.companyLabel :
                        getMsgValue('pos_label_installment_amount');
                }

                //hotfix 2-12-2014
                if (currPayment.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name ||
                    currPayment.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.GC_MMS.name) {
                    propMsg = getMsgValue("pos_receipt_gift_card_label");
                }

                // INHOUSE VOUCHER 2017-04-13
                if (currPayment.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.VOUCHER.name)
                    currPaymentAmt = currPayment.voucherData.voucherAmount;
                // INHOUSE VOUCHER 2017-04-13

                // console.log("Is coupon cmc : " + saleTx.isCouponCmc);
                // console.log("Not coupon : " + !isCoupon);

                // Removing the colon
                propMsg = propMsg.replace(/:/g, '');
                paymentMediaDetails.push(PAYMENT_MEDIA.generatePaymentMediaViewDetail(propMsg, numberWithCommas(currPaymentAmt) + negativeSign));
                paymentMediaDetails.push(PAYMENT_MEDIA.generatePaymentMediaViewDetail(balanceDueLbl,
                    numberWithCommas(currBalanceDueValue) + negativeSign,
                    'payment-view-item-highlight'));

                // START

                // console.log(counter + " " + saleTx.couponCmcIdx);

                // if(saleTx.isCouponCmc && counter == saleTx.couponCmcIdx+1){
                // 	currBalanceDueValue += calculateTotalMemberDiscount();
                // 	saleTx.memberDiscReversal = calculateTotalMemberDiscount();
                // 	paymentMediaDetails.push(PAYMENT_MEDIA.generatePaymentMediaViewDetail('Cancel CMC', numberWithCommas(calculateTotalMemberDiscount())));
                // 	paymentMediaDetails.push(PAYMENT_MEDIA.generatePaymentMediaViewDetail(balanceDueLbl,
                // 																	  numberWithCommas(currBalanceDueValue) + negativeSign,
                // 																	  'payment-view-item-highlight'));
                // }

                // var cmcTotalDiscountPerPayment = cmcCouponDiscount(currBalanceDueValue, saleTx.coBrandNumber);

                // console.log("CMC TOTAL DISCOUNT PER PAYMENT : " + cmcTotalDiscountPerPayment);
                // currBalanceDueValuePerPayment = currBalanceDueValue - cmcTotalDiscountPerPayment;

                // console.log("Curr balance due value : " + currBalanceDueValue);
                // console.log("Curr balance due value per payment : " + currBalanceDueValuePerPayment);

                // if(saleTx.isCouponCmc && isCoupon && paymentMediaArrLocal.length == counter && !saleTx.isCardCoBrand){
                // 	saleTx.totalBeforeCmcCouponDiscount = currBalanceDueValue;
                // 	var cmcTotalDiscount = cmcCouponDiscount(currBalanceDueValue, saleTx.coBrandNumber);
                // 	saleTx.cmcTotalDiscount = cmcTotalDiscount;
                // 	saleTx.totalAmountPaid += cmcTotalDiscount;		
                // 	currBalanceDueValue -= cmcTotalDiscount;

                // 	paymentMediaDetails.push(PAYMENT_MEDIA.generatePaymentMediaViewDetail('MEGA DISCOUNT', numberWithCommas(cmcTotalDiscount)));
                // 	paymentMediaDetails.push(PAYMENT_MEDIA.generatePaymentMediaViewDetail(balanceDueLbl,
                // 																	  numberWithCommas(currBalanceDueValue) + negativeSign,
                // 																	  'payment-view-item-highlight'));
                // }

                // var nextCounter = counter+1;

                // END
            } catch (err) {
                console.log("Error : ");
                console.log(err);
            }
        }

        // START

        // saleTx.latestBalanceDue = currBalanceDueValue;
        // console.log("Latest balance due : " + saleTx.latestBalanceDue);

        // END

        if (currBalanceDueValue > 0) {
            enablePaymentMedia = true;
        }

        displayPaymentMediaDetails(paymentMediaDetails);
        CustomerPopupScreen.cus_renderPaymentDetails(paymentMediaDetails);
    }
};

/**
 * Display item unit for PAYMENT_VIEW display.
 * @param label
 * @param value
 * @param cssClassName
 * @returns {{label: *, value: *, cssClassName: *}}
 */
PAYMENT_MEDIA.generatePaymentMediaViewDetail = function(label, value, cssClassName) {

    var paymentMediaDetail = {
        label: label,
        value: value,
        cssClassName: cssClassName
    };

    return paymentMediaDetail;
};

/**==========================================================================**
 * END : Page display related functions
 **==========================================================================**/

/**==========================================================================**
 * START : Receipt Printing related functions
 **==========================================================================**/

/**
 * Receipt map item display unit.
 * @param label
 * @param value
 * @param checkSign
 * @constructor
 */
PAYMENT_MEDIA.ReceiptMapEntry = function(label, value, checkSign, font) {
    this.label = label;
    this.value = value;
    this.checkSign = checkSign;
    this.font = font;
};

/**
 * Generates and returns a amp containing the items for receipt printing.
 * @param saleTx
 * @returns {Array}
 */
PAYMENT_MEDIA.generatePaymentSummaryReceiptMap = function(saleTx) {
    var receiptMap = [];
    var paymentMediaArrLocal = saleTx.payments;
    var currBalanceDue = CASHIER.getFinalSubtotalTxAmount(saleTx);

    // if(saleTx.coBrandNumber && SALE_RETURN_COUPON.isCouponReturnNotCmc()){
    // 	currBalanceDue = currBalanceDue - getTotalDiscount(saleTx) + SALE_RETURN_COUPON.calculateCouponReturn();
    // }else if(!saleTx.coBrandNumber && SALE_RETURN_COUPON.isUseCouponReturn()){
    // 	currBalanceDue -= getTotalDiscount(saleTx);
    // }

    var balanceDueLabel = RECEIPT_DBL_SPACE.concat(getMsgValue('pos_receipt_balance_due_label'));

    console.log("Print currbalance due before : " + currBalanceDue);
    console.log("Print Is card cobrand : " + SALE_RETURN_COUPON.isCardCoBrand(saleTx));
    console.log("Print Is coupon return cmc : " + SALE_RETURN_COUPON.isCouponReturnCmc(saleTx));
    console.log("Print Is coupon return not cmc : " + SALE_RETURN_COUPON.isCouponReturnNotCmc(saleTx));
    console.log("Print Is coupon return : " + SALE_RETURN_COUPON.isUseCouponReturn(saleTx));
    console.log("Print Total discount : " + saleTx.totalDiscount);
    console.log("Print member discount reversal : " + saleTx.memberDiscReversal);
    console.log("Print member discount : " + calculateTotalMemberDiscount());
    console.log("Print total amount : " + saleTx.totalAmountPaid);

    var amountPaid = saleTx.totalDiscount - saleTx.memberDiscReversal;

    // if(SALE_RETURN_COUPON.isCouponReturnNotCmc()){
    // 	currBalanceDue += amountPaid;
    // }

    console.log("Current balance due : " + currBalanceDue);
    var fontCss = {
        bold: true,
        large: false
    };

    console.log("Generate payment summary");
    if (saleTx && paymentMediaArrLocal) {
        var sbMsg = new StringBuilder("");
        // Search from last to first
        for (var countUp = 0; countUp < paymentMediaArrLocal.length; countUp++) {
            console.log("Count up : " + countUp);
            var currPaymentMediaItem = paymentMediaArrLocal[countUp];
            console.log(currPaymentMediaItem);
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name) {
                sbMsg.append(getMsgValue('pos_receipt_account_number_label'));
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    sbMsg.toString(),
                    currPaymentMediaItem.eftData.cardNum
                ));
                sbMsg.clear();
            }

            // MLC 2017-04-21
            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name) {

                sbMsg.append(getMsgValue('pos_receipt_account_number_label'));
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    sbMsg.toString(),
                    currPaymentMediaItem.MLCPayment.acntNo
                ));
                sbMsg.clear();
            }
            // MLC 2017-04-21

            //Allo Payment 2021-07-15
            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.ALLO_PAYMENT.name) {
        
                sbMsg.append(getMsgValue('pos_receipt_account_number_label'));
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    sbMsg.toString(),
                    currPaymentMediaItem.MLCPayment.acntNo
                ));
                sbMsg.clear();
            }

            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.OVO_PAYMENT.name) {
        
                sbMsg.append(getMsgValue('pos_receipt_account_number_label'));
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    sbMsg.toString(),
                    currPaymentMediaItem.OVOPayment.refNo
                ));
                sbMsg.clear();
            }
            //Allo Payment 2021-07-15

            // MLC 2017-04-21
            // else if (   currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.ALTOWECHAT.name) {

            // 	sbMsg.append(getMsgValue('pos_receipt_account_number_label'));
            // 	receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry( 
            // 						"sbMsg.toString()", 
            // 						"currPaymentMediaItem.ALTOWECHAT.acntNo"
            // 	));
            // 	sbMsg.clear();
            // }

            // DEBUG RETURN MLC
            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_OFFLINE.name) {

                sbMsg.append(getMsgValue('pos_receipt_account_number_label'));
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    'MEGA SMARTPAY:',
                    //sbMsg.toString(), 
                    numberWithCommas(currPaymentMediaItem.amountPaid),
                    displayNegativeSign(currPaymentMediaItem.amountPaid, true)
                ));
                //sbMsg.clear();
            }
            // DEBUG RETURN MLC
            // INHOUSE VOUCHER 2017-04-13
            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.VOUCHER.name) {
                sbMsg.append(getMsgValue('pos_receipt_voucher_number_label'));
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    sbMsg.toString(),
                    currPaymentMediaItem.voucherData.voucherNum
                ));
                sbMsg.clear();
            }

            // INHOUSE VOUCHER 2017-04-13
            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_POINT.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_SALES.name) {
                console.log("masuk sini");
                if (currPaymentMediaItem.trk.acntNo) {
                    sbMsg.append('REF NO.');
                    receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                        sbMsg.toString(),
                        currPaymentMediaItem.trk.acntNo
                    ));
                }
                sbMsg.clear();
            }
            var propMsg = null;

            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name) {
                propMsg = (currPaymentMediaItem.installmentPayment &&
                        currPaymentMediaItem.installmentPayment.installmentPaymentDTO) ?
                    currPaymentMediaItem.installmentPayment.installmentPaymentDTO.companyLabel :
                    getMsgValue('pos_label_installment_amount');
            } else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.GC_MMS.name) {
                propMsg = currPaymentMediaItem.giftCardPayment.cardType;
            } else {
                if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name && saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                    propMsg = getMsgValue('pos_receipt_coupon_label');
                } else {
                    propMsg = PAYMENT_MEDIA.getPropertyLabelValue(currPaymentMediaItem.paymentMediaType);
                }
                console.log(propMsg);
            }

            // INHOUSE VOUCHER 2017-04-13
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.VOUCHER.name)
                amtPaid = currPaymentMediaItem.voucherData.voucherAmount;
            // INHOUSE VOUCHER 2017-04-13

            var isCmcPayment = isCmcTransaction(saleTx);

            if (currPaymentMediaItem.paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_OFFLINE.name) {
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    propMsg,
                    numberWithCommas(currPaymentMediaItem.amountPaid),
                    true, /*check for sign*/
                    isCmcPayment ? fontCss : null
                ));
            }
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name) {
                if (currPaymentMediaItem.paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name &&
                    currPaymentMediaItem.eftData &&
                    currPaymentMediaItem.eftData.bankId) {
                    sbMsg.append(getMsgValue('pos_receipt_bank_id_label'));
                    receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                        sbMsg.toString(),
                        currPaymentMediaItem.eftData.bankId
                    ));
                    sbMsg.clear();
                }
                if (currPaymentMediaItem.eftData &&
                    currPaymentMediaItem.eftData.approvalCode) {
                    sbMsg.append(getMsgValue('pos_receipt_approval_code_label'));
                    receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                        sbMsg.toString(),
                        currPaymentMediaItem.eftData.approvalCode
                    ));
                    sbMsg.clear();
                }
            }

            // MLC 2017-04-21
            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name) {
                if (currPaymentMediaItem.MLCPayment.approvalCode) {
                    sbMsg.append(getMsgValue('pos_receipt_approval_code_label'));
                    receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                        sbMsg.toString(),
                        currPaymentMediaItem.MLCPayment.approvalCode
                    ));
                    sbMsg.clear();
                }
            }
            // MLC 2017-04-21

            // Allo 2021-07-15
            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.ALLO_PAYMENT.name) {
                if (currPaymentMediaItem.MLCPayment.approvalCode) {
                    sbMsg.append(getMsgValue('pos_receipt_approval_code_label'));
                    receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                        sbMsg.toString(),
                        currPaymentMediaItem.MLCPayment.approvalCode
                    ));
                    sbMsg.clear();
                }
            }

            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.OVO_PAYMENT.name) {
                if (currPaymentMediaItem.OVOPayment.retrievalReferenceNumber) {
                    sbMsg.append(getMsgValue('pos_receipt_approval_code_label'));
                    receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                        sbMsg.toString(),
                        currPaymentMediaItem.OVOPayment.retrievalReferenceNumber
                    ));
                    sbMsg.clear();
                }
            }
            // Allo 2021-07-15

            // PPP
            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.POWER_POINT_PURCHASE.name) {
                // if(   currPaymentMediaItem.PPP.memberName) {
                // 	sbMsg.append(getMsgValue('pos_receipt_ppp_member_name_label'));
                // 	receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry( 
                // 						sbMsg.toString(), 
                // 						currPaymentMediaItem.PPP.memberName
                // 	));
                // 	sbMsg.clear();
                // }
                // if(   currPaymentMediaItem.PPP.prevPoints) {
                // 	sbMsg.append(getMsgValue('pos_receipt_ppp_prev_points_label'));
                // 	receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry( 
                // 						sbMsg.toString(), 
                // 						currPaymentMediaItem.PPP.prevPoints
                // 	));
                // 	sbMsg.clear();
                // }
                if (currPaymentMediaItem.PPP.pItemDetails) {
                    for (var item in currPaymentMediaItem.PPP.pItemDetails) {
                        if (parseFloat(currPaymentMediaItem.PPP.pItemDetails[item]["qtySel"]) !== 0 && currPaymentMediaItem.PPP.pItemDetails[item]["qtySel"] !== null && currPaymentMediaItem.PPP.pItemDetails[item]["qtySel"] !== undefined && parseFloat(currPaymentMediaItem.PPP.pItemDetails[item]["pointSel"]) !== 0 && currPaymentMediaItem.PPP.pItemDetails[item]["pointSel"] !== null && currPaymentMediaItem.PPP.pItemDetails[item]["pointSel"] !== undefined) {
                            var shortName;
                            getSummarizeSaleItems(saleTx).forEach(function(el) {
                                if (el.ean13Code === item) {
                                    shortName = el.shortDesc;
                                }
                            });
                            sbMsg.append(shortName);
                            receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                                sbMsg.toString(),
                                parseFloat(currPaymentMediaItem.PPP.pItemDetails[item]["qtySel"]) + " x " + parseFloat(currPaymentMediaItem.PPP.pItemDetails[item]["pointSel"]) + " PTS"
                            ));
                            sbMsg.clear();
                        }
                    }

                }
                if (currPaymentMediaItem.PPP.pppUsedPoints) {
                    sbMsg.append(getMsgValue('pos_receipt_ppp_used_points_label'));
                    receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                        sbMsg.toString(),
                        currPaymentMediaItem.PPP.pppUsedPoints
                    ));
                    sbMsg.clear();
                }
            }
            // PPP

            // MLC 2017-04-21
            else if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.ALTOWECHAT.name) {
                // if(   currPaymentMediaItem.MLCPayment.approvalCode) {
                sbMsg.append(getMsgValue('pos_receipt_approval_code_label'));
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    sbMsg.toString(),
                    currPaymentMediaItem.ALTOWECHAT.approvalCode
                ));
                sbMsg.clear();
                // }
            }
            // MLC 2017-04-21

            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name &&
                currPaymentMediaItem.installmentPayment &&
                currPaymentMediaItem.installmentPayment.applicationNumber) {
                var installmentObj = currPaymentMediaItem.installmentPayment;

                sbMsg.append(getMsgValue('pos_receipt_installment_app_number_label'));
                sbMsg.append(" ");
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    sbMsg.toString(),
                    installmentObj.applicationNumber
                ));
                sbMsg.clear();
            }

            //Flashiz
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.FLASHIZ.name) {
                var flashizObj = currPaymentMediaItem.flashizPayment;

                if (flashizObj != null) {
                    if (flashizObj.bankId != null) {
                        sbMsg.append(getMsgValue('pos_receipt_flashiz_bank_id_label'));
                        sbMsg.append(" ");
                        receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                            sbMsg.toString(),
                            flashizObj.bankId
                        ));
                        sbMsg.clear();
                    }

                    if (flashizObj.bankName != null) {
                        sbMsg.append(getMsgValue('pos_receipt_flashiz_bank_name_label'));
                        sbMsg.append(" ");
                        receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                            sbMsg.toString(),
                            flashizObj.bankName
                        ));
                        sbMsg.clear();
                    }

                    if (flashizObj.bankReferenceId != null) {
                        sbMsg.append(getMsgValue('pos_receipt_flashiz_bank_reference_code_label'));
                        sbMsg.append(" ");
                        receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                            sbMsg.toString(),
                            flashizObj.bankReferenceId
                        ));
                        sbMsg.clear();
                    }

                    if (flashizObj.invoiceId != null) {
                        sbMsg.append(getMsgValue('pos_receipt_flashiz_invoice_id_label'));
                        sbMsg.append(" ");
                        receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                            sbMsg.toString(),
                            flashizObj.invoiceId
                        ));
                        sbMsg.clear();
                    }
                }
            }

            // MLC 2017-04-21
            /*if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name)
            {
            	var mlcObj = currPaymentMediaItem.MLCPayment;
            	
            	if(mlcObj != null){
            		if(mlcObj.cardNo != null){
            			sbMsg.append('ACNT NO.');
            			sbMsg.append(" ");
            			receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry( 
            					sbMsg.toString(), 
            					mlcObj.cardNo
            			));
            			sbMsg.clear();
            		}
            		
            		if(mlcObj.amount != null){
            			sbMsg.append('MEGA LINE:');
            			sbMsg.append(" ");
            			receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry( 
            					sbMsg.toString(), 
            					mlcObj.amount
            			));
            			sbMsg.clear();
            		}
            		
            		if(mlcObj.approvalCode != null){
            			sbMsg.append('APPROVAL CODE:');
            			sbMsg.append(" ");
            			receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry( 
            					sbMsg.toString(), 
            					mlcObj.approvalCode
            			));
            			sbMsg.clear();
            		}
            	}
            }*/
            // MLC 2017-04-21

            //GiftCard
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.GC_MMS.name) {
                var giftCardObj = currPaymentMediaItem.giftCardPayment;
                sbMsg.append(getMsgValue('pos_receipt_giftcard_number_label'));
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    sbMsg.toString(),
                    giftCardObj.cardNumber
                ));
                sbMsg.clear();
            }

            if (countUp < (paymentMediaArrLocal.length - 1)) {
                currBalanceDue -= currPaymentMediaItem.amountPaid;
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    "",
                    lineSeparator1
                ));
                receiptMap.push(new PAYMENT_MEDIA.ReceiptMapEntry(
                    balanceDueLabel,
                    numberWithCommas(currBalanceDue),
                    true /*check for sign*/
                ));
            }
        }
    }
    //console.log(receiptMap);
    return receiptMap;
};

/**==========================================================================**
 * END : Receipt Printing related functions
 **==========================================================================**/

/**
 * Generates and returns a map containing the order summary.
 * @param saleTx
 * @returns {Array}
 */
PAYMENT_MEDIA.generatePaymentOrderSummaryMap = function(saleTx) {
    var orderSummaryArr = [];
    var paymentMediaArrLocal = saleTx.payments;
    if (saleTx && paymentMediaArrLocal) {
        var sbMsg = new StringBuilder("");
        // Search from last to first
        for (var countUp = 0; countUp < paymentMediaArrLocal.length; countUp++) {
            var currPaymentMediaItem = paymentMediaArrLocal[countUp];

            sbMsg.append(currPaymentMediaItem.paymentMediaType);
            orderSummaryArr.push(sbMsg.toString());
            sbMsg.clear();
            //EFT
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name) {

                if (currPaymentMediaItem.eftData &&
                    currPaymentMediaItem.eftData.bankId &&
                    (currPaymentMediaItem.paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name &&
                        currPaymentMediaItem.paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name)) {
                    sbMsg.append(getMsgValue('pos_receipt_bank_id_label'));
                    sbMsg.append(" ");
                    sbMsg.append(currPaymentMediaItem.eftData.bankId);
                    orderSummaryArr.push(sbMsg.toString());
                    sbMsg.clear();
                }

                if (currPaymentMediaItem.eftData &&
                    currPaymentMediaItem.eftData.cardNum) {
                    sbMsg.append(getMsgValue('pos_receipt_account_number_label'));
                    sbMsg.append(" ");
                    sbMsg.append(currPaymentMediaItem.eftData.cardNum);
                    orderSummaryArr.push(sbMsg.toString());
                    sbMsg.clear();
                }

                if (currPaymentMediaItem.eftData &&
                    currPaymentMediaItem.eftData.approvalCode) {
                    sbMsg.append(getMsgValue('pos_receipt_approval_code_label'));
                    sbMsg.append(" ");
                    sbMsg.append(currPaymentMediaItem.eftData.approvalCode);
                    orderSummaryArr.push(sbMsg.toString());
                    sbMsg.clear();
                }
            }

            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_POINT.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_SALES.name
            ) {
                if (currPaymentMediaItem.trk && currPaymentMediaItem.trk.acntNo) {
                    sbMsg.append('REF NO.');
                    sbMsg.append(" ");
                    sbMsg.append(currPaymentMediaItem.trk.acntNo);
                    orderSummaryArr.push(sbMsg.toString());
                    sbMsg.clear();
                }
            }


            //Flashiz
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.FLASHIZ.name) {
                var flashizObj = currPaymentMediaItem.flashizPayment;

                if (flashizObj != null) {
                    if (flashizObj.bankId != null) {
                        sbMsg.append(getMsgValue('pos_receipt_flashiz_bank_id_label'));
                        sbMsg.append(" ");
                        sbMsg.append(flashizObj.bankId);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (flashizObj.bankName != null) {
                        sbMsg.append(getMsgValue('pos_receipt_flashiz_bank_name_label'));
                        sbMsg.append(" ");
                        sbMsg.append(flashizObj.bankName);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (flashizObj.bankReferenceId != null) {
                        sbMsg.append(getMsgValue('pos_receipt_flashiz_bank_reference_code_label'));
                        sbMsg.append(" ");
                        sbMsg.append(flashizObj.bankReferenceId);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (flashizObj.invoiceId != null) {
                        sbMsg.append(getMsgValue('pos_receipt_flashiz_invoice_id_label'));
                        sbMsg.append(" ");
                        sbMsg.append(flashizObj.invoiceId);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }
                }
            }

            // MLC 2017-04-21
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name) {
                var mlcObj = currPaymentMediaItem.mlcPayment;

                if (mlcObj != null) {
                    if (mlcObj.cardNo != null) {
                        sbMsg.append('ACNT NO.');
                        sbMsg.append(" ");
                        sbMsg.append(mlcObj.cardNo);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (mlcObj.amount != null) {
                        sbMsg.append('MEGA SMARTPAY:');
                        sbMsg.append(" ");
                        sbMsg.append(mlcObj.amount);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (mlcObj.approvalCode != null) {
                        sbMsg.append('APPROVAL CODE:');
                        sbMsg.append(" ");
                        sbMsg.append(mlcObj.approvalCode);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }
                }
            }

            // Allo payment 2021-07-15
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.ALLO_PAYMENT.name) {
                var mlcObj = currPaymentMediaItem.mlcPayment;

                if (mlcObj != null) {
                    if (mlcObj.cardNo != null) {
                        sbMsg.append('ACNT NO.');
                        sbMsg.append(" ");
                        sbMsg.append(mlcObj.cardNo);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (mlcObj.amount != null) {
                        sbMsg.append('ALLO PAYMENT:');
                        sbMsg.append(" ");
                        sbMsg.append(mlcObj.amount);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (mlcObj.approvalCode != null) {
                        sbMsg.append('APPROVAL CODE:');
                        sbMsg.append(" ");
                        sbMsg.append(mlcObj.approvalCode);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }
                }
            }

            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.OVO_PAYMENT.name) {
                var ovoObj = currPaymentMediaItem.ovoPayment;

                if (ovoObj != null) {
                    if (ovoObj.refNo != null) {
                        sbMsg.append('ACNT NO.');
                        sbMsg.append(" ");
                        sbMsg.append(ovoObj.refNo);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (ovoObj.amount != null) {
                        sbMsg.append('OVO PAYMENT:');
                        sbMsg.append(" ");
                        sbMsg.append(ovoObj.amount);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (ovoObj.retrievalReferenceNumber != null) {
                        sbMsg.append('APPROVAL CODE:');
                        sbMsg.append(" ");
                        sbMsg.append(ovoObj.retrievalReferenceNumber);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }
                }
            }

            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.ALTOWECHAT.name) {
                var altoWCObj = currPaymentMediaItem.ALTOWECHAT;

                if (altoWCObj != null) {
                    // if(mlcObj.cardNo != null){
                    // 	sbMsg.append('ACNT NO.');
                    // 	sbMsg.append(" ");
                    // 	sbMsg.append(mlcObj.cardNo);
                    // 	orderSummaryArr.push(sbMsg.toString());
                    // 	sbMsg.clear();
                    // }

                    if (altoWCObj.amount != null) {
                        sbMsg.append('ALTO QR PAY:');
                        sbMsg.append(" ");
                        sbMsg.append(altoWCObj.amount);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (altoWCObj.approvalCode != null) {
                        sbMsg.append('APPROVAL CODE:');
                        sbMsg.append(" ");
                        sbMsg.append(altoWCObj.approvalCode);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }
                }
            }

            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.POWER_POINT_PURCHASE.name) {
                var pppObj = currPaymentMediaItem.PPP;

                if (pppObj != null) {
                    // if(mlcObj.cardNo != null){
                    // 	sbMsg.append('ACNT NO.');
                    // 	sbMsg.append(" ");
                    // 	sbMsg.append(mlcObj.cardNo);
                    // 	orderSummaryArr.push(sbMsg.toString());
                    // 	sbMsg.clear();
                    // }

                    if (pppObj.trAmt != null) {
                        sbMsg.append('PPP:');
                        sbMsg.append(" ");
                        sbMsg.append(pppObj.trAmt);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }

                    if (pppObj.pppUsedPoints != null) {
                        sbMsg.append('Used PTS:');
                        sbMsg.append(" ");
                        sbMsg.append(pppObj.pppUsedPoints);
                        orderSummaryArr.push(sbMsg.toString());
                        sbMsg.clear();
                    }
                }
            }

            //Gift Card
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name ||
                currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.GC_MMS.name) {
                sbMsg.append(getMsgValue('pos_receipt_giftcard_number_label'));
                sbMsg.append(currPaymentMediaItem.giftCardPayment.cardNumber);
                orderSummaryArr.push(sbMsg.toString());
                sbMsg.clear();
            }
            //Installment
            if (currPaymentMediaItem.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name &&
                currPaymentMediaItem.installmentPayment &&
                currPaymentMediaItem.installmentPayment.applicationNumber) {
                var installmentObj = currPaymentMediaItem.installmentPayment;

                sbMsg.append(getMsgValue('pos_receipt_installment_app_number_label'));
                sbMsg.append(" ");
                sbMsg.append(installmentObj.applicationNumber);
                orderSummaryArr.push(sbMsg.toString());
                sbMsg.clear();
            }
            sbMsg.append(getMsgValue('pos_label_amount_rendered')
                .format(COMMON_DISPLAY.getTxTypesMsgPropValue(
                    saleTx.type,
                    CONSTANTS.TX_TYPES.KEY_MESSAGES_PROP_AMOUNT_RENDERED_PARAM
                )));
            if (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name || saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                sbMsg.append(numberWithCommas(currPaymentMediaItem.amountPaid * -1));
            } else {
                sbMsg.append(numberWithCommas(currPaymentMediaItem.amountPaid));
            }
            orderSummaryArr.push(sbMsg.toString());
            sbMsg.clear();

            orderSummaryArr.push("\n");
        }
    }
    return orderSummaryArr;
};

PAYMENT_MEDIA.empPaymentAllowed = function(paymentMediaType) {

    var lsPymnt = getConfigValue("EMP_PAYMENT_EXCLUDE").split(";");
	var isPaymentExclude = lsPymnt.indexOf(paymentMediaType)!==-1;

	if(isPaymentExclude){
		return true;
	}
	return false;
};
/*******************************************************************************
 * END : PAYMENT MEDIA
 ******************************************************************************/
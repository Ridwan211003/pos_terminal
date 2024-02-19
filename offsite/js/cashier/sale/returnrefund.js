/**
 * Created by mdelrosario on 1/8/15.
 */

var RETURN_REFUND = RETURN_REFUND || {};


/****************************************************************************
 * START: RETURN/REFUND objects
 ****************************************************************************/

/**
 * Variable holder of current return's original transaction lookup
 */
RETURN_REFUND.baseTransactionDetails;

RETURN_REFUND.dto = RETURN_REFUND.dto || {};

/**
 * Object containing the return's original transaction lookup
 *
 * @param isOnlineQtyInfo
 * @param baseTransactionId
 * @param qtyInfo
 */
RETURN_REFUND.dto.baseTransactionDetails = function(isOnlineQtyInfo, baseTransactionId, qtyInfo) {
    this.isOnlineQtyInfo = isOnlineQtyInfo;
    // 1st to have a value, see setBaseTransactionDetails() function
    this.baseTransactionId = baseTransactionId;
    // 2nd to have a value, see setBaseTransactionDetails() function
    this.qtyInfo = qtyInfo;
    // Last to have a value(3rd), see validateReturnItemScan() function
    // Value corresponds to the last item scanned
    this.currEan13Code = null;
    this.weight = null;

    // INHOUSE VOUCHER ADDITIONAL 2017-04-26
    uilog('DBUG', 'QTYINFO');
    uilog('DBUG', qtyInfo);
    if (qtyInfo) {
        this.mvData = qtyInfo.mvoucherData;
        this.mvRedeem = qtyInfo.mvoucherRedeem;
    }
    // INHOUSE VOUCHER ADDITIONAL 2017-04-26
};

/**
 * Object containing the Return current status, and its accompanied error message.
 * @param category
 * @param errorMsgCode
 */
RETURN_REFUND.dto.status = function(category, errorMsgCode) {
    this.category = category;
    this.errorMsg = (errorMsgCode) ? getMsgValue(errorMsgCode) : null;
};

/**
 * Object containing the left and right display values of
 * return related transaction.
 * @param qty
 * @param desc
 */
RETURN_REFUND.dto.returnItemDisplayData = function(qty, desc) {
    this.qty = qty;
    this.desc = desc;
};

/****************************************************************************
 * END: RETURN/REFUND objects
 ****************************************************************************/

/****************************************************************************
 * START: RETURN/REFUND Constants
 ****************************************************************************/

RETURN_REFUND.return = RETURN_REFUND.return || {};

/*=================*
 * RETURN Constants
 *=================*/
/**
 * Return status constants
 */
RETURN_REFUND.return.constants = {
    TXN_ID_INPUT_REQUIRED: "TXN_ID_INPUT_REQUIRED",
    INVALID_TXN_ID: "INVALID_TXN_ID",
    HAS_OVER_RETURNED_ITEMS: "HAS_OVER_RETURNED_ITEMS",
    OVERALL_SCANNING_LIMIT_REACHED: "OVERALL_SCANNING_LIMIT_REACHED",
    ITEM_SCANNING_LIMIT_REACHED: "ITEM_SCANNING_LIMIT_REACHED",
    INVALID_RETURN_ITEM_SCAN: "INVALID_RETURN_ITEM_SCAN",
    VALID_RETURN_ITEM_SCAN: "VALID_RETURN_ITEM_SCAN",
    TXN_ID_NOT_FOUND: "TXN_ID_NOT_FOUND",
    RETURN_OFFLINE: "RETURN_OFFLINE"
};

/*=================*
 * REFUND Constants
 *=================*/
// NONE yet
/****************************************************************************
 * END: RETURN/REFUND objects
 ****************************************************************************/

/****************************************************************************
 * START: GENERIC Functions
 ****************************************************************************/

RETURN_REFUND.generic_functions = RETURN_REFUND.generic_functions || {};

/**
 * Sub-total payment function builder, used for non-card payments.
 * Can be single payment or multiple payment.
 * @param paymentMediaTypeName
 *  - the type of payment media
 * @param additionalPaymentConfig
 *  - overrides the default payment configuration
 * @param isOneTimePayment
 *  - If the payment only allows single payment, false to allow partial payment(for multiple payments)
 * @returns {Function}
 */
RETURN_REFUND.generic_functions.defaultSimplePaymentProcessFunction = function(paymentMediaTypeName,
    additionalPaymentConfig,
    isOneTimePayment) {
    // Returns a function with no argument
    return function() {
        // INHOUSE VOUCHER 2017-04-26
        if (RETURN_REFUND.baseTransactionDetails &&
            RETURN_REFUND.baseTransactionDetails.mvData &&
            RETURN_REFUND.baseTransactionDetails.mvData.length > 0) {
            var eligibleReturn = { 'amount': 0 };
            var mvData = RETURN_REFUND.baseTransactionDetails.mvData;
            var voucherToBeVoided = RETURN_REFUND.baseTransactionDetails.mvData.length - calculateVoucherReturn(mvData[0].gentrxeligible, mvData[0].gentrxposgroup, eligibleReturn);
            console.log(RETURN_REFUND.baseTransactionDetails.mvData.length + ' ' + voucherToBeVoided);
            if (!saleTx.voucherVoided || saleTx.voucherVoided < 1) {
                saleTx.voucherToBeVoided = (voucherToBeVoided > RETURN_REFUND.baseTransactionDetails.mvData.length) ?
                    RETURN_REFUND.baseTransactionDetails.mvData.length : voucherToBeVoided;
            }

            console.log(saleTx.voucherToBeVoided);
            if (saleTx.voucherToBeVoided > 0) {
                $("#depstore-voucher-dialog").data({ 'mode': 'void', 'voidAmt': eligibleReturn.amount }).dialog('open');
                return false;
            }
        }
        // INHOUSE VOUCHER 2017-04-26

        var paymentConfig = {};
        if (isOneTimePayment) {
            var finalSubtotalTxAmount = CASHIER.getFinalSubtotalTxAmount(saleTx, { payments: saleTx.payments });
            paymentConfig = {
                minValue: finalSubtotalTxAmount,
                maxValue: finalSubtotalTxAmount
            };
        }
        if (additionalPaymentConfig) {
            $.extend(paymentConfig, additionalPaymentConfig)
        }
        CASHIER.PAYMENTS.processSimplePayment(
            saleTx,
            paymentMediaTypeName,
            paymentConfig
        );
    };
};

/**
 * Sub-total payment function builder, used for
 * card number entry related offline payments.
 * Can be single payment or multiple payment
 * @param paymentMediaTypeName
 * @param isOneTimePayment
 * @returns {Function}
 */
RETURN_REFUND.generic_functions.defaultEFTOfflinePaymentFunction = function(paymentMediaTypeName,
    isOneTimePayment) {
    // Returns a function with no argument
    return function() {
        var payment = parseInt($("#inputDisplay").val());
        // [Code Below] Not used in RETURN_REFUND, only used in saveEftPayment()
        // eftType = CONSTANTS.EFT.TYPE.OFFLINE_PAYMENT;
        var paymentConfig = {};
        if (isOneTimePayment) {
            var finalSubtotalTxAmount = CASHIER.getFinalSubtotalTxAmount(saleTx, { payments: saleTx.payments });
            paymentConfig = {
                minValue: finalSubtotalTxAmount,
                maxValue: finalSubtotalTxAmount
            };
        }

        if (PAYMENT_MEDIA.isValidForTriggering(
                saleTx,
                paymentMediaTypeName,
                payment,
                enablePaymentMedia,
                paymentConfig) &&
            isNoneGiftCardItemInTransaction()) {

            var payment = $("#inputDisplay").val();
            var bank = configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name];
            eftData = new ElectronicFundTransferObj(saleTx, bank, payment);
            // START: cloning block
            var original = $('#eftOfflineCardNoCode-dialog')[0];
            var clone = $(original).clone().attr('id', 'eftOfflineCardNoCode-dialogClone');
            var saveHtml = $(original).html();
            $(original).html('');
            $(clone).dialog({
                // Initialising the dialog
                width: 400,
                height: 260,
                open: function(event, ui) {
                    $(this).find("#eftOfflineCardNoInput6dig").val("");
                    $(this).find("#eftOfflineCardNoInput4dig").val("");
                    $(this).find("#eftOfflineCardNoErrorSpan").empty();
                    // Enabling cardNo input keyboard
                    POS_DIALOGS.enableCardNoKeyboardLength($(this).find("#eftOfflineCardNoInput6dig"), 7);
                    POS_DIALOGS.enableCardNoKeyboardLength($(this).find("#eftOfflineCardNoInput4dig"), 4);
                },
                // return to original dialog implementation
                close: function() {
                    $(clone).remove();
                    $(original).html(saveHtml);
                },
                buttons: {
                    "Finish": function() {
                        // Save the return/refund EFT off-line
                        //var cardNo = $(this).find("#eftOfflineCardNoInput").val();
                        var inputCard6dig = $(this).find("#eftOfflineCardNoInput6dig").val();
                        var inputCard4dig = $(this).find("#eftOfflineCardNoInput4dig").val();
                        var cardNo = inputCard6dig + "xx-xxxx-" + inputCard4dig;
                        var errorMessage = "";
                        var isInfoValid = true;
                        if (!(cardNo.length == 19)) {
                            errorMessage += "Card Number must contain first 6 digits and last 4 digits<br/>";
                            isInfoValid = false;
                        } else {
                            cardNo = removeAllDash(cardNo);
                            // masking card number
                            cardNo = maskCardNo(cardNo);
                        }
                        if (isInfoValid) {
                            eftData.cardNum = cardNo;
                            $(this).dialog("close");
                            // save the transaction
                            CASHIER.executePaymentMedia(saleTx,
                                paymentMediaTypeName,
                                payment, { "eftData": eftData });
                        } else {
                            $(this).find("#eftOfflineCardNoErrorSpan").empty();
                            $(this).find("#eftOfflineCardNoErrorSpan").append(errorMessage);
                        }
                    },
                    "Cancel": function() { eftOfflineCancel(this); }
                }
            });
            // END: cloning block
            $(clone).dialog('open');
        }
    }
};

/****************************************************************************
 * END: GENERIC Functions
 ****************************************************************************/

/****************************************************************************
 * START: RETURN Functions
 ****************************************************************************/

RETURN_REFUND.return.service = RETURN_REFUND.return.service || {};

/**
 * Checks if the current Transaction is RETURN type.
 * @returns {saleTx|*|boolean}
 */
RETURN_REFUND.return.service.isReturnTransaction = function() {
    return (saleTx && saleTx.type == CONSTANTS.TX_TYPES.RETURN.name);
};
/**
 * Checks if the current Transaction is RETURN OR REFUND type.
 * @returns {saleTx|*|boolean}
 */
RETURN_REFUND.return.service.isReturnOrRefundTxn = function() {
    return (saleTx && (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name || saleTx.type == CONSTANTS.TX_TYPES.REFUND.name));
};
/**
 * Clears the lookup data for RETURN transaction type
 */
RETURN_REFUND.return.service.clearBaseTransactionDetails = function() {
    RETURN_REFUND.baseTransactionDetails = null;
    if (saleTx) {
        saleTx.baseTransactionId = null;
    }
};

/**
 * Return RETURN_REFUND.baseTransactionDetails.baseTransactionId if present,
 * null otherwise.
 * @returns {*}
 */
RETURN_REFUND.return.service.getBaseTransactionId = function() {
    var baseTransactionId;
    if (RETURN_REFUND.baseTransactionDetails) {
        baseTransactionId = RETURN_REFUND.baseTransactionDetails.baseTransactionId;
    }
    return baseTransactionId;
};

/**
 * Return RETURN_REFUND.baseTransactionDetails.qtyInfo if present,
 * null otherwise.
 * @returns {*}
 */
RETURN_REFUND.return.service.getQtyInfo = function() {
    var qtyInfo;
    if (RETURN_REFUND.baseTransactionDetails) {
        qtyInfo = RETURN_REFUND.baseTransactionDetails.qtyInfo;
    }
    return qtyInfo;
};

/**
 * Gets the RETURN related error messages by response value.
 * @param msgCode
 * @param defaultMsg
 * @returns {*}
 */
RETURN_REFUND.return.service.getErrorMsgByResponse = function(response, defaultMsg) {

    var errorMsg = null;
    var FUNCTIONS = RETURN_REFUND.return.service;
    switch (response.error) {
        case "RET_ERR_HAS_RETURN_TRANSACTION":
            {
                errorMsg = getMsgValue("return_sale_void_has_existing_return");
                break;
            }
        case "RET_ERR_HAS_OVER_RETURNED_ITEMS":
            {
                // Display error message containing a list over-returned items.
                errorMsg = FUNCTIONS.buildAvailableReturnItemsListDisplay(
                    getMsgValue("return_save_txn_has_over_returned_items"),
                    FUNCTIONS.getOverReturnedItemsForDisplay(response.quantityInformation)
                ).append("<br/>");
                break;
            }
        case "RET_ERR_INVALID_BASE_TRANSACTION_ID":
            {
                errorMsg = FUNCTIONS.buildAvailableReturnItemsListDisplay(
                    getMsgValue("return_save_txn_invalid_base_transaction_id"),
                    FUNCTIONS.getTransactionDetailsForDisplay(response.baseTransaction)
                ).append("<br/>");
                break;
            }
        case "RET_ERR_CANNOT_FIND_BASE_TRANSACTION_ID":
            {
                errorMsg = getMsgValue("return_save_txn_cannot_find_base_transaction_id")
                .format(response.baseTransaction.transactionId);
                break;
            }
        case "RET_ERR_EMPTY_BASE_TRANSACTION_ID":
            {
                errorMsg = getMsgValue("return_save_txn_empty_base_transaction_id");
                break;
            }
        default:
            {
                errorMsg = defaultMsg;
            }
    }
    return errorMsg;
};


/**
 * Used for setting the baseTransactionDetails lookup, for verifying what items are available for returns.
 * @param baseTransactionId
 */
RETURN_REFUND.return.service.setBaseTransactionDetails = function(baseTransactionId) {

    var qtyInfo = RETURN_REFUND.return.ajax.getQuantityInformationByTxnId(baseTransactionId);

    //set to invalid transaction
    var storedTxn = STORE_RECALL.findStoreTxn(padTxnId(baseTransactionId));
    if (storedTxn) {
        qtyInfo = null;
    }

    var isServerOnline = (qtyInfo != 'SERVER_OFFLINE');
    RETURN_REFUND.baseTransactionDetails = new RETURN_REFUND.dto.baseTransactionDetails(
        isServerOnline,
        baseTransactionId,
        (isServerOnline) ? qtyInfo : null
    );
};

/**
 * Checks if has over-returned items.
 * @returns {boolean}
 */
RETURN_REFUND.return.service.hasOverReturnedItems = function() {

    var hasOverReturnedItems = false;
    var baseTransactionDetails = RETURN_REFUND.baseTransactionDetails;

    jQuery.each(baseTransactionDetails.qtyInfo, function(ean13Code, qtyInfoItem) {
        if (!jQuery.isEmptyObject(qtyInfoItem) &&
            qtyInfoItem.netQty < 0) {
            // break the loop, if at least one item(ean13Code) is less than ZERO
            return !(hasOverReturnedItems = true);
        }
    });
    return hasOverReturnedItems;
};

/**
 * Checks if there is no item available for return.
 * @returns {boolean}
 */
RETURN_REFUND.return.service.isReturnItemsOverallScanLimitReached = function() {

    var isOverallReached = true;
    var baseTransactionDetails = RETURN_REFUND.baseTransactionDetails;

    jQuery.each(baseTransactionDetails.qtyInfo, function(ean13Code, qtyInfoItem) {
        var currTxnItemQty = Hypercash.util.getTotalValidQuantityByBarcode(saleTx.orderItems, ean13Code);
        if (!jQuery.isEmptyObject(qtyInfoItem) &&
            qtyInfoItem.netQty != currTxnItemQty) {
            // break the loop, if at least one item(ean13Code) is not synced with qtyInfo
            // Meaning there are still items that can be returned.
            return (isOverallReached = false);
        }
    });
    return isOverallReached;
};

/**
 * Checks if a particular ean13Code has reached its return limit.
 * @param ean13Code
 * @param quantity
 * @returns {boolean}
 */
RETURN_REFUND.return.service.isReturnItemScanLimitReached = function(ean13Code, quantity) {

    var isItemLimitReached = false;

    var returnsCount = RETURN_REFUND.return.service.getAvailableReturnsCountByEan13Code(ean13Code);
    var currTxnItemCount = Hypercash.util.getTotalValidQuantityByBarcode(saleTx.orderItems, ean13Code);

    var resultTest = currTxnItemCount + quantity;

    if (returnsCount &&
        returnsCount < (currTxnItemCount + quantity)) {
        uilog('DBUG', "result :" + returnsCount + "<" + resultTest);
        isItemLimitReached = true;
    }
    return isItemLimitReached;
};

/**
 * Checks if a particular ean13Code is valid by checking if its
 * in the available return items, and not reached its quantity return limit.
 * @param ean13Code
 * @param quantity
 * @returns {boolean}
 */
RETURN_REFUND.return.service.isValidReturnItemScan = function(ean13Code, quantity) {
    var isValid = false;
    var returnsCount = RETURN_REFUND.return.service.getAvailableReturnsCountByEan13Code(ean13Code);
    uilog("DBUG", ean13Code + " count: " + returnsCount);
    var currTxnItemCount = Hypercash.util.getTotalValidQuantityByBarcode(saleTx.orderItems, ean13Code);

    if (returnsCount &&
        returnsCount >= (currTxnItemCount + quantity)) {
        isValid = true;
    }
    return isValid;
};

/**
 * Gets the persisted available return count(w/o the currently scanned items: orderItems)
 * @param ean13Code
 * @returns {*}
 */
RETURN_REFUND.return.service.getAvailableReturnsCountByEan13Code = function(ean13Code) {

    var returnsCount;
    var baseTransactionDetails = RETURN_REFUND.baseTransactionDetails;

    var freshGoodsScanMode = (configuration.properties['FRESH_GOODS_SCAN_MODE']) ?
        configuration.properties['FRESH_GOODS_SCAN_MODE'] :
        "1";
    var freshGoodsScanWeight = (freshGoodsScanMode == "2");

    if (freshGoodsScanWeight && startsWithFreshGoodsBarcode(ean13Code)) {
        ean13Code = ean13Code.substring(0, 12).concat("0");
    }

    if (baseTransactionDetails &&
        baseTransactionDetails.qtyInfo &&
        baseTransactionDetails.qtyInfo[ean13Code]) {
        returnsCount = baseTransactionDetails.qtyInfo[ean13Code].netQty;
    }
    return returnsCount;
};

/**
 * Product Scan Entry point
 * @param ean13Code
 * @returns {boolean}
 */
RETURN_REFUND.return.service.validateReturnItemScan = function(ean13Code) {
    var baseTransactionDetails = RETURN_REFUND.baseTransactionDetails;
    var freshGoodsScanMode = (configuration.properties['FRESH_GOODS_SCAN_MODE']) ?
        configuration.properties['FRESH_GOODS_SCAN_MODE'] :
        "1";
    var freshGoodsScanWeight = (freshGoodsScanMode == "2");

    // Sets the ean13Code to
    if (baseTransactionDetails) {
        baseTransactionDetails.currEan13Code = ean13Code;
        if (startsWithFreshGoodsBarcode(ean13Code) && freshGoodsScanWeight) {
            baseTransactionDetails.weight = parseFloat(ean13Code.substring(6, 12)) / 1000;
        } else {
            baseTransactionDetails.weight = null;
        }
    }
    var isValid = false;
    var rCONSTANTS = RETURN_REFUND.return.constants;
    var FUNCTIONS = RETURN_REFUND.return.service;
    // get New Status
    var status = FUNCTIONS.getCurrentStatus();
    var errorMsg = status.errorMsg;

    uilog("DBUG", status);
    if (status.category == rCONSTANTS.VALID_RETURN_ITEM_SCAN ||
        status.category == rCONSTANTS.RETURN_OFFLINE) {
        isValid = true;
    } else {
        // If not a valid return item scan
        if (status.category == rCONSTANTS.ITEM_SCANNING_LIMIT_REACHED ||
            status.category == rCONSTANTS.INVALID_RETURN_ITEM_SCAN) {
            errorMsg = FUNCTIONS.buildAvailableReturnItemsListDisplay(
                status.errorMsg,
                FUNCTIONS.getValidReturnItemsForDisplay(baseTransactionDetails.qtyInfo)
            );
        }
        showMsgDialog(errorMsg, "warning");
    }
    return isValid;
};

/**
 * Checks/Returns the current input data eligibility
 * status and their corresponding error messages(if invalid data status).
 * See list below:
 *   TXN_ID_INPUT_REQUIRED
 *      = no txn id input yet
 *   INVALID_TXN_ID
 *      = searched transaction id, has no DB entry.
 *   HAS_OVER_RETURNED_ITEMS
 *      = has over-returned items, meaning there are items that are
 *      over quantity or items not existing in the original transaction.
 *   OVERALL_SCANNING_LIMIT_REACHED
 *      = all returnables items available at the current session was already scanned.
 *   ITEM_SCANNING_LIMIT_REACHED
 *      = a particular return item scanning quantity limit reached.
 *   INVALID_RETURN_ITEM_SCAN
 *      = non-matching product input to available returns.
 *   VALID_RETURN_ITEM_SCAN
 *      = matching product input to available returns.
 */
RETURN_REFUND.return.service.getCurrentStatus = function() {

    // Variables Containers
    var baseTransactionDetails = RETURN_REFUND.baseTransactionDetails;
    var currEan13Code;
    var stat;
    // Conditions
    var isValidItem;
    var FUNCTIONS = RETURN_REFUND.return.service;
    //console.log(baseTransactionDetails);
    if (FUNCTIONS.isReturnTransaction()) {

        var Status = RETURN_REFUND.dto.status;
        var rCONSTANTS = RETURN_REFUND.return.constants;
        var isOnlineQtyInfo = (baseTransactionDetails && baseTransactionDetails.isOnlineQtyInfo);
        if (baseTransactionDetails != null) console.log(baseTransactionDetails.qtyInfo);
        if (baseTransactionDetails == null ||
            (baseTransactionDetails && !baseTransactionDetails.baseTransactionId)) {

            stat = new Status(rCONSTANTS.TXN_ID_INPUT_REQUIRED, "return_transaction_id_required");

        } else if (isOnlineQtyInfo && baseTransactionDetails.qtyInfo &&
            baseTransactionDetails.qtyInfo == rCONSTANTS.TXN_ID_NOT_FOUND) {

            stat = new Status(rCONSTANTS.TXN_ID_NOT_FOUND, "return_transaction_id_invalid");

        } else if (isOnlineQtyInfo && !baseTransactionDetails.qtyInfo) {

            stat = new Status(rCONSTANTS.INVALID_TXN_ID, "return_transaction_id_invalid");

        } else if (isOnlineQtyInfo && FUNCTIONS.hasOverReturnedItems()) {
            //console.log('masuk over return');
            stat = new Status(rCONSTANTS.HAS_OVER_RETURNED_ITEMS, "return_has_over_returned_items");

        } else if (isOnlineQtyInfo && FUNCTIONS.isReturnItemsOverallScanLimitReached()) {
            //console.log('masuk no available for return');
            stat = new Status(rCONSTANTS.OVERALL_SCANNING_LIMIT_REACHED, "return_no_items_for_return");

        } else if (isOnlineQtyInfo &&
            (currEan13Code = baseTransactionDetails.currEan13Code) &&
            (FUNCTIONS.isReturnItemScanLimitReached(currEan13Code, (baseTransactionDetails.weight) ? baseTransactionDetails.weight : itemQty /*GLOB_VAR*/ ))) {

            uilog("DBUG", baseTransactionDetails);

            stat = new Status(rCONSTANTS.ITEM_SCANNING_LIMIT_REACHED, "return_item_scan_limit_reached");

        } else if (isOnlineQtyInfo &&
            !(isValidItem = FUNCTIONS.isValidReturnItemScan(currEan13Code, (baseTransactionDetails.weight) ? baseTransactionDetails.weight : itemQty /*GLOB_VAR*/ ))) {

            stat = new Status(rCONSTANTS.INVALID_RETURN_ITEM_SCAN, "return_invalid_item_scan");

        } else if (!isOnlineQtyInfo ||
            (isOnlineQtyInfo && isValidItem)) {

            // Allow as return_valid_item_scan if no qtyInfo(due to offline reasons), the validation
            // will be handled in server-side.
            stat = new Status(rCONSTANTS.RETURN_OFFLINE);
        }

        uilog('DBUG', stat);
    }
    return stat || new Status(null, "return_unhandled_condition");
};

/**
 * Format the transaction to returnItems list containing the
 * transaction details for display.
 * @param txn
 * @returns {Array}
 */
RETURN_REFUND.return.service.getTransactionDetailsForDisplay = function(txn) {
    var returnItems = [];
    if (txn) {

        var responseDate = new Date(txn.transactionDate);
        var displayDate = $.datepicker.formatDate('M dd yy ', responseDate);
        var displayTime = formatTime(responseDate);

        returnItems.push(new RETURN_REFUND.dto.returnItemDisplayData(
            "ORIG TR:",
            txn.transactionId
        ));
        returnItems.push(new RETURN_REFUND.dto.returnItemDisplayData(
            "TYPE:",
            txn.type
        ));
        returnItems.push(new RETURN_REFUND.dto.returnItemDisplayData(
            "STATUS:",
            txn.status
        ));
        returnItems.push(new RETURN_REFUND.dto.returnItemDisplayData(
            "DATE:",
            displayDate + displayTime
        ));

    }
    return (returnItems.length > 0) ? returnItems :
        null;
};

/**
 * Formats the qtyInfo's(quantityInformation: contain items available for return)
 * over-returned items to returnItems list for display.
 * @param qtyInfo
 * @returns {Array}
 */
RETURN_REFUND.return.service.getOverReturnedItemsForDisplay = function(qtyInfo) {

    var returnItems = [];
    if (qtyInfo) {
        jQuery.each(qtyInfo, function(ean13Code, qtyInfoItem) {

            var currTxnNetQty;
            if (!jQuery.isEmptyObject(qtyInfoItem) &&
                (currTxnNetQty = qtyInfoItem.netQty) < 0) {
                /*   returnItem[0] = {
                 *     qty  : -2x:
                 *     desc : NCAFE
                 *   };
                 *   returnItem[1] = {
                 *     qty  : null
                 *     desc : 4902505088827
                 *   }
                 */

                returnItems.push(new RETURN_REFUND.dto.returnItemDisplayData(
                    currTxnNetQty + "x:",
                    qtyInfoItem.shortDesc
                ));
                returnItems.push(new RETURN_REFUND.dto.returnItemDisplayData(
                    null,
                    ean13Code
                ));
            }
        });

    }
    return (returnItems.length > 0) ? returnItems :
        null;
};

/**
 * Formats the qtyInfo's(quantityInformation: contain items available for return)
 * available return-items to returnItems list for display.
 * @returns {Array}
 */
RETURN_REFUND.return.service.getValidReturnItemsForDisplay = function(qtyInfo) {
    var returnItems = [];
    if (qtyInfo) {
        jQuery.each(qtyInfo, function(ean13Code, qtyInfoItem) {

            var currTxnItemCount = Hypercash.util.getTotalValidQuantityByBarcode(saleTx.orderItems, ean13Code);
            var currTxnNetQty;
            if (!jQuery.isEmptyObject(qtyInfoItem) &&
                (currTxnNetQty = (qtyInfoItem.netQty - currTxnItemCount)) > 0) {
                /*   returnItem[0] = {
                 *     qty  : 2x:
                 *     desc : NCAFE
                 *   };
                 *   returnItem[1] = {
                 *     qty  : null
                 *     desc : 4902505088827
                 *   }
                 */
                returnItems.push(new RETURN_REFUND.dto.returnItemDisplayData(
                    currTxnNetQty + "x:",
                    qtyInfoItem.shortDesc
                ));
                returnItems.push(new RETURN_REFUND.dto.returnItemDisplayData(
                    null,
                    ean13Code
                ));
            }
        });
    }
    return (returnItems.length > 0) ? returnItems :
        null;
}

/**
 * Gets the DOM representation of available items for return. For
 * display purposes.
 * @param msgTitle
 * @param returnItems
 * @returns {*|jQuery}
 */
RETURN_REFUND.return.service.buildAvailableReturnItemsListDisplay = function(
    msgTitle,
    returnItems) {
    var returnItemsMainViewDiv = $("<div></div>").attr("id", "returnItemsView");
    var returnItemsSubViewDiv = $("<div></div>").attr("id", "returnItemsList").addClass("return-items-list");
    var returnItem;

    returnItemsMainViewDiv.append(msgTitle);
    for (var i in returnItems) {
        returnItem = returnItems[i];
        var descBlkText = returnItem.desc;
        if (descBlkText.length > 22) {
            // If descBlk text is too long, break it, and add ellipsis.
            descBlkText = descBlkText.substring(0, 21) + "...";
        }
        /*  DISPLAY FORMAT:
         *  2x:     ITEM_NO_1
         *      4902505088827
         *  3x:     ITEM_NO_2
         *      4902505083277
         */
        var ul = $("<ul></ul>").addClass('return-item-view');
        var qtyBlk = $("<li></li>").addClass('return-item-qty-label').html(returnItem.qty);
        var descBlk = $("<li></li>").addClass('return-item-desc-label').html(descBlkText);

        ul.append(qtyBlk);
        ul.append(descBlk);
        returnItemsSubViewDiv.append(ul);
    }
    returnItemsMainViewDiv.append(returnItemsSubViewDiv);
    // Apply pagination
    if (returnItems.length > 6) {
        returnItemsMainViewDiv.find("#returnItemsList").removeClass().addClass("return-items-list-fixed");
        returnItemsMainViewDiv.find("#returnItemsList ul").quickpaginate({ perpage: 6 });
        returnItemsMainViewDiv.append(returnItemsMainViewDiv.find("#returnItemsList .qc_pager"));
    }

    return returnItemsMainViewDiv;
};

/**
 * Removes all over-returned items
 */
RETURN_REFUND.return.service.removeOverReturnedItemsFromLookup = function() {
    var baseTransactionDetails = RETURN_REFUND.baseTransactionDetails;
    var cleanedQtyInfo = {};
    jQuery.each(baseTransactionDetails.qtyInfo, function(ean13Code, qtyInfoItem) {
        if (!jQuery.isEmptyObject(qtyInfoItem) &&
            qtyInfoItem.netQty >= 0) {
            var newQtyInfoItem = {};
            newQtyInfoItem[ean13Code] = qtyInfoItem;
            $.extend(cleanedQtyInfo, newQtyInfoItem);
        }
    });
    RETURN_REFUND.baseTransactionDetails.qtyInfo = null;
    RETURN_REFUND.baseTransactionDetails.qtyInfo = cleanedQtyInfo;
};

/**
 * Shows the Enter Transaction Id dialog
 */
RETURN_REFUND.return.service.processOriginalTransactionIdInput = function() {
    var proceedToShowTxnIdDialogDefer = $.Deferred();
    //Conditions
    var returnConstants = RETURN_REFUND.return.constants;
    // Get initial status
    var status = RETURN_REFUND.return.service.getCurrentStatus();
    var statCategory = status.category;
    var hasValidTxnIdInput = (
        statCategory != returnConstants.TXN_ID_INPUT_REQUIRED &&
        statCategory != returnConstants.INVALID_TXN_ID &&
        statCategory != returnConstants.HAS_OVER_RETURNED_ITEMS &&
        statCategory != returnConstants.OVERALL_SCANNING_LIMIT_REACHED
    );

    var hasOrderItems = (
        saleTx &&
        saleTx.orderItems &&
        saleTx.orderItems.length > 0
    );

    if (hasValidTxnIdInput && !hasOrderItems) {
        var currTxnId = RETURN_REFUND.baseTransactionDetails.baseTransactionId;
        //ask a confirmation if to get another transaction
        showConfirmDialog(
            getMsgValue("return_existing_transaction_confirmation").format(currTxnId),
            getMsgValue("confirm_lbl_action_confirmation"),
            // [OK] button callback
            function() {
                clearInputDisplay();
                //proceed to txn_id input dialog
                proceedToShowTxnIdDialogDefer.resolve(true);
            }
        );
    } else if (hasValidTxnIdInput && hasOrderItems) {
        // Cannot input a transaction id, once it has order items.
        showMsgDialog("pos_error_msg_key_not_allowed");
    } else {
        //proceed to txn_id input dialog
        proceedToShowTxnIdDialogDefer.resolve(true);
    }
    proceedToShowTxnIdDialogDefer.pipe(RETURN_REFUND.return.service.showOriginalTransactionInputDialog);
};

/**
 * The actual input transaction id dialog
 */
RETURN_REFUND.return.service.showOriginalTransactionInputDialog = function(isSearchForQtyInfo, defaultOrigTxnId) {
    var rCONSTANTS = RETURN_REFUND.return.constants;
    var FUNCTIONS = RETURN_REFUND.return.service;

    var status = FUNCTIONS.getCurrentStatus();
    var statCategory = status.category;

    showTxnIdConfirmationDialog(
        getMsgValue("return_sale_title"),
        getMsgValue("pos_label_enter_transaction_no"),
        defaultOrigTxnId, // No default transaction Id
        // [OK] callback function
        function(inputValue,
            $txnIdConfirmDialog,
            $txnIdDialogConfirmInput,
            $txnIdDialogConfirmErrorMsg) {
            //Variable
            var isValid = true;
            var errorMsg;
            //Conditions
            if (!inputValue) {
                errorMsg = getMsgValue("return_transaction_id_required");
                isValid = false;
            }


            if (isValid) {
                if (isSearchForQtyInfo) {
                    // Fetch returnableItems' details
                    FUNCTIONS.setBaseTransactionDetails(inputValue);
                }

                // Get new status
                status = FUNCTIONS.getCurrentStatus();
                statCategory = status.category;

                if (statCategory == rCONSTANTS.HAS_OVER_RETURNED_ITEMS) {
                    var $okBtn = $txnIdConfirmDialog.dialog("widget").find("#OkId");
                    //Changing the [OK] to [Proceed] button label
                    $okBtn.button('option', { label: "Proceed" });
                    $okBtn.removeClass("ui-state-focus");
                    //Hide the "Enter Transaction #" and Input text-box
                    $txnIdConfirmDialog.dialog("widget").find("#txnIdDialogConfirmMsg").hide();
                    $txnIdConfirmDialog.dialog("widget").find("#txnIdDialogConfirmInput").hide();
                    //Replacing the click event function, clicking the [PROCEED] button
                    $okBtn.off('click').click(function() {
                        // Clean over-returned items
                        FUNCTIONS.removeOverReturnedItemsFromLookup();
                        saleTx.baseTransactionId = inputValue;
                        $txnIdConfirmDialog.dialog("close");
                        // If after removing over-returned items, and no available item to scan.
                        if (FUNCTIONS.getCurrentStatus().category == rCONSTANTS.OVERALL_SCANNING_LIMIT_REACHED) {
                            // Show the dialog again, if limit already reached(to show the error message).
                            FUNCTIONS.showOriginalTransactionInputDialog(
                                false,
                                FUNCTIONS.getBaseTransactionId()
                            );
                            $("#txnIdConfirmDialog").dialog("widget").find("#OkId").trigger('click');
                        }
                    });
                    // Display error message containing a list over-returned items.
                    errorMsg = FUNCTIONS.buildAvailableReturnItemsListDisplay(
                        status.errorMsg,
                        FUNCTIONS.getOverReturnedItemsForDisplay(FUNCTIONS.getQtyInfo())
                    ).append("<br/>");
                } else if (statCategory == rCONSTANTS.TXN_ID_INPUT_REQUIRED ||
                    statCategory == rCONSTANTS.OVERALL_SCANNING_LIMIT_REACHED ||
                    statCategory == rCONSTANTS.INVALID_TXN_ID
                ) {
                    errorMsg = status.errorMsg;
                } else if (statCategory == rCONSTANTS.TXN_ID_NOT_FOUND ||
                    statCategory == rCONSTANTS.RETURN_OFFLINE) {
                    var deferred = $.Deferred();
                    // CR RETURN
                    //SUPERVISOR AUTHENTICATION
                    isPreAuthenticated = false;
                    $("#authentication-form").removeData(AUTH_DATA_KEYS)
                        .data('roles', ['ROLE_SUPERVISOR'])
                        .data('defer', deferred)
                        .data('interventionType', CONSTANTS.TX_TYPES.RETURN.name)
                        .dialog("open");

                    $("#fnReturnTx").data("isAuthenticated", true);
                    // CR RETURN
                    deferred.then(function() {
                        saleTx.baseTransactionId = inputValue;
                        if (RETURN_REFUND.baseTransactionDetails) {
                            RETURN_REFUND.baseTransactionDetails.isOnlineQtyInfo = false;
                        }
                    });

                } else {
                    if (connectionOnline && profCust && profCust.customerNumber) {
                        Hypercash.ajax.getReturnNote(
                            inputValue,
                            profCust.customerNumber,
                            function(returnNote) {
                                if (!jQuery.isEmptyObject(returnNote) && !returnNote.error) {
                                    profCust.returnNote = returnNote;
                                    saleTx.returnNoteNo = returnNote.returnNoteNumber;
                                } else {
                                    errorMsg = returnNote.error;

                                    isValid = false;
                                }
                            });
                    }

                    if (isValid) {
                        // PROCEED
                        saleTx.baseTransactionId = inputValue;
                        $txnIdConfirmDialog.dialog("close");
                    }
                }
            }

            if (errorMsg) {
                // Displays error message
                $txnIdDialogConfirmErrorMsg.html(
                    errorMsg
                );
            }

            //If errorMsg is not null, do not close the dialog
            return !errorMsg;
        },
        // [CANCEL] callback function
        function() {
            //If has no valid txn_id input
            if (statCategory == rCONSTANTS.TXN_ID_INPUT_REQUIRED ||
                statCategory == rCONSTANTS.INVALID_TXN_ID ||
                statCategory == rCONSTANTS.HAS_OVER_RETURNED_ITEMS ||
                statCategory == rCONSTANTS.OVERALL_SCANNING_LIMIT_REACHED
            ) {

                clearInputDisplay();
                saleTx.type = CONSTANTS.TX_TYPES.SALE.name;
                displayTransactionType('');
            }
        }
    );
};

RETURN_REFUND.return.service.calculateTotalReturn = function() {
    var total = CASHIER.getFinalSaleTxAmount(saleTx);
    var payments = saleTx.payments;
    for (var i = 0; i < payments.length; i++) {
        if (payments[i].paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name) {
            total -= payments[i].amountPaid;
        }
    }
    return total;
}

RETURN_REFUND.return.service.saveCouponReturnData = function() {
    console.log(saleTx.payments);
    console.log(saleTx);
    if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
        console.log("Generate coupon return in database");
        console.log("Final subtotal " + CASHIER.getFinalSubtotalTxAmount(saleTx));
        console.log("Final sale : " + CASHIER.getFinalSaleTxAmount(saleTx));
        console.log(saleTx);

        var couponReturn = {
            id: saleTx.transactionId,
            amount: RETURN_REFUND.return.service.calculateTotalReturn(),
            storeId: saleTx.storeCd,
            isTrkItem: saleTx.isReturnTrkSales
        }
        saleTx.couponReturnData = couponReturn;
    }
};

/****************************************************************************
 * END: RETURN Functions
 ****************************************************************************/

/****************************************************************************
 * START: Service functions, Server/Ajax api calls
 ****************************************************************************/

RETURN_REFUND.return.ajax = RETURN_REFUND.return.ajax || {};

RETURN_REFUND.return.ajax.saveCouponReturn = function(returnCouponData) {
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/couponReturn/saveCouponReturnPayment',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(returnCouponData),
        async: false,
        success: function(data) {
            uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /couponReturn/saveCouponReturnPayment SAVE SUCCESS");
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /couponReturn/saveCouponReturnPayment SAVE ERROR");
        }
    });
}

RETURN_REFUND.return.ajax.updateCouponReturn = function(returnCouponData) {
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/couponReturn/updateCouponReturnPayment',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(returnCouponData),
        async: false,
        success: function(data) {
            uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /couponReturn/updateCouponReturnPayment UPDATE SUCCESS");
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /couponReturn/updateCouponReturnPayment UPDATE ERROR");
            showMsgDialog("Error update Coupon Return : " + error, "error");
        }
    });
}

RETURN_REFUND.return.ajax.getCouponReturn = function(returnTransactionId) {
    var isHTTPStatusOK = false;
    var responseData = $.ajax({
        type: 'GET',
        url: posWebContextPath + '/cashier/couponReturn/getCouponReturnPayment/' + returnTransactionId,
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 20000,
        beforeSend: function() {
            $("#loadingDialogMessage").html("Get Coupon Return Data");
            $("#loading-dialog").dialog("open");
        },
        success: function(data) {
            uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /couponReturn/getCouponReturnPayment GET SUCCESS");
            if (!jQuery.isEmptyObject(data) && !data.error) {
                isHTTPStatusOK = true;
            }
            return;
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", getMyFuncName() + CONSTANTS.LOG_CONFIG.LOG_DELIMITER + "AJAX /couponReturn/getCouponReturnPayment GET ERROR");
            jqXHR.responseText = error;
            return;
        },
        complete: function(jqXHR, status) {
            $("#loading-dialog").dialog("close");
        }
    }).responseText;
    return responseData;
}

/**
 * Used for fetching returnable items count by EAN13CODE, SHORT_DESC and ORIG_QTY,
 * RETURNED_QTY and NET_QTY
 * @param baseTransactionId
 */
RETURN_REFUND.return.ajax.getQuantityInformationByTxnId = function(baseTransactionId) {

    var isHTTPStatusOK = false;
    var responseData = $.ajax({
        url: posWebContextPath + "/cashier/getQuantityInformationByTxnId/" + baseTransactionId,
        type: "GET",
        async: false,
        success: function(data) {
            if (!jQuery.isEmptyObject(data) && !data.error) {
                isHTTPStatusOK = true;
            }
        },
        error: function(jqXHR, status, error) {
            uilog('DBUG', 'Error: ' + error + "\nError Response: " + jqXHR.responseText);

            if (error && error == 'SERVER_OFFLINE') {
                jqXHR.responseText = error;
            } else {
                jqXHR.responseText = null;
                showMsgDialog("Search Error", "warning");
            }
            return;
        }
    }).responseText;
    // CR RETURN
    // Returns the quantityInformation only
    //console.log("responseData");
    //console.log(responseData);
    var trkFound = (responseData == "SERVER_OFFLINE") ? "" : JSON.parse(responseData).trkMsg;
    if (trkFound) {
        console.log("masuk TrkFound");
        //$txnIdDialogConfirmErrorMsg.html('TRK FOUND');
        showMsgDialog('Transaksi ini tidak dapat di-RETURN', 'warning');
        //result = "Transaksi ini tidak dapat di-RETURN";
        return;
    }
    var result = (isHTTPStatusOK) ? JSON.parse(responseData).quantityInformation : responseData;
    var otherStore = (isHTTPStatusOK) ? JSON.parse(responseData).otherStore : responseData;

    //uilog('DBUG', 'RESPOND FROM trkFound ' + trkFound);
    //uilog('DBUG', 'RESPOND FROM otherStore ' + otherStore);
    uilog("DBUG", 'RESPOND FROM "getQuantityInformationByTxnId"' + JSON.stringify(result));
    if (otherStore) {
        isAuthenticated = false;
        var deferred = $.Deferred();
        $("#authentication-form").removeData(AUTH_DATA_KEYS)
            .data('roles', ['ROLE_SUPERVISOR'])
            .data('defer', deferred)
            .data('interventionType', CONSTANTS.TX_TYPES.RETURN.name)
            .dialog("open");
    }
    // CR RETURN

    // INHOUSE VOUCHER 2017-04-26
    result.mvoucherData = (isHTTPStatusOK) ? JSON.parse(responseData).mvoucherData : responseData;
    result.mvoucherRedeem = (isHTTPStatusOK) ? JSON.parse(responseData).mvoucherRedeem : responseData;
    result.media = (isHTTPStatusOK) ? JSON.parse(responseData).media : responseData;
    // INHOUSE VOUCHER 2017-04-26

    var rCONSTANTS = RETURN_REFUND.return.constants;

    if (responseData && responseData != "SERVER_OFFLINE" &&
        JSON.parse(responseData).error && JSON.parse(responseData).error == rCONSTANTS.TXN_ID_NOT_FOUND) {
        result = JSON.parse(responseData).error;
    }

    // INHOUSE VOUCHER 2017-04-26
    if (result.mvoucherRedeem && result.mvoucherRedeem.length > 0) {
        showMsgDialog('Transaksi ini tidak dapat di-RETURN karena memiliki Voucher yang sudah di-Redeem', 'warning');
        return null;
    }
    if (result.media == "TRK_SALES") {
        promptSysMsg(" ", "TRK SALE GAME ITEM");
        saleTx.isReturnTrkSales = true;
        saleGameItemTrk = true;
        console.log(saleGameItemTrk);
    }
    // INHOUSE VOUCHER 2017-04-26

    return result;
};

/****************************************************************************
 * END: Service functions, Server api calls
 ****************************************************************************/

/*=================*
 *  RETURN
 *=================*/

/**
 * Namespace containing
 * overridden return payment functions.
 */
RETURN_REFUND.return.payment_fn = {

    /* PAYMENTS */
    /**
     * CASH multiple payment
     */
    ovrCashReturnFn: RETURN_REFUND.generic_functions.defaultSimplePaymentProcessFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name,
        // Cash payment should not exceed the balanceDue.
        { isValidForCashChange: false }
    ),
    // MLC 2017-04-25
    ovrMLCReturnFn: RETURN_REFUND.generic_functions.defaultSimplePaymentProcessFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_OFFLINE.name,
        // Cash payment should not exceed the balanceDue.
        { isValidForCashChange: false }
    ),
    // MLC 2017-04-25
    ovrTrkSalesReturnFn: RETURN_REFUND.generic_functions.defaultSimplePaymentProcessFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_SALES.name,
        // Cash payment should not exceed the balanceDue.
        { isValidForCashChange: false }
    ),
    /**
     * Installment multiple payment
     */
    ovrInstallmentReturnFn: RETURN_REFUND.generic_functions.defaultSimplePaymentProcessFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name,
        // Preventing paymentMedia.js for asking any additional installment details.
        { additionalDataKeyId: null }
    ),
    /**
     * EFT Offline multiple payment
     */
    ovrEFTOfflineReturnFn: RETURN_REFUND.generic_functions.defaultEFTOfflinePaymentFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name
    ),
    /**
     * Coupon multiple payment
     */
    ovrCouponReturnFn: RETURN_REFUND.generic_functions.defaultSimplePaymentProcessFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON.name
    ),

    /**
     * Return Coupon multiple payment
     */
    ovrReturnCouponReturnFn: RETURN_REFUND.generic_functions.defaultSimplePaymentProcessFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name
    ),
    /**
     * EDC BCA multiple payment
     */
    ovrEdcBcaReturnFn: RETURN_REFUND.generic_functions.defaultEFTOfflinePaymentFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name
    )
};

/*=================*
 *  REFUND
 *=================*/
RETURN_REFUND.refund = RETURN_REFUND.refund || {};

/**
 * Namespace containing
 * overridden refund payment functions.
 */
RETURN_REFUND.refund.payment_fn = {

    /**
     * [SINGLE PAYMENT]
     * Cash Button function to execute if
     * the transaction-type is REFUND
     */
    ovrCashRefundFn: RETURN_REFUND.generic_functions.defaultSimplePaymentProcessFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name,
        null,
        true // one-time payment
    ),
    /**
     * [SINGLE PAYMENT]
     * Same as cash, NO INPUT for the ff
     *  1.) for installment company number AND
     *  2.) for application number
     */
    ovrInstallmentRefundFn: RETURN_REFUND.generic_functions.defaultSimplePaymentProcessFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name,
        // Preventing paymentMedia.js for asking any additional installment details.
        { additionalDataKeyId: null },
        true // one-time payment
    ),
    /**
     * [SINGLE PAYMENT]
     * Eft offline only for return/refund
     * only asks for the card number.
     */
    ovrEFTOfflineRefundFn: RETURN_REFUND.generic_functions.defaultEFTOfflinePaymentFunction(
        CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name,
        true
    )
};
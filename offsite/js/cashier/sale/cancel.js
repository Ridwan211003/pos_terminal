/*
 * Sale cancellations will be called from this module 
 * */
var CANCEL = CANCEL || {};

CANCEL.cancelSaleTransaction = function() {
    uilog('DBUG', 'Test cancel sale transaction call');
    if (saleTx.orderItems[0].categoryId != 'ALLO_TOPUP' && isSaleStarted &&
        hasScannedItem(saleTx) &&
        !saleTx.roundingAmount &&
        !saleTx.qrtts &&
        !toggleVoid) { /*Fixes #83451*/

        /**
         * Deffered object will be passed to the authentication-form dialog as data
         * authenticationDeferred will then be 'resolved' when authentication process
         * finished
         */
        var authenticationDeferred = $.Deferred();
        $("#authentication-form").removeData([AUTH_DATA_KEYS])
            .data('roles', ['ROLE_CASHIER_CANCELLATION'])
            .data('defer', authenticationDeferred)
            .data('interventionType', CONSTANTS.TX_TYPES.CANCEL_SALE.name)
            .dialog("open");

        /**
         * Series of callbacks to be called when deferred object is resolved
         * 1. Set toggleCancelSale = true
         * 2. Cancel GC Requests if applicable
         * 3. Cancel the transaction and save as 'CANCELLED'
         * 4. Terminal function flow
         */
        authenticationDeferred.done(CANCEL.toggleCancel);
        authenticationDeferred.done(CANCEL.cancelGcRequests);
        authenticationDeferred.done(CANCEL.cancelTransaction);
        authenticationDeferred.done(FUNCTION_FLOW.FLOW_HANDLER.terminateFlow);
    } else {
        showKeyNotAllowedMsg();
    }
};

/**
 * Sets toggleCancelSale variable to true
 */
CANCEL.toggleCancel = function() {
    toggleCancelSale = true;
};

/**
 * Cancel Gc Requests if applicable
 */
CANCEL.cancelGcRequests = function() {
    if (GIFTCARDObject) {
        callCancelGcRequest({ isToCancelAll: true });
    }
};

/**
 * Function to save the saleTx object as cancelled transaction
 * When saving is completed and successful:
 * 1. Render Screen Receipt Summary
 * 2. Print receipt
 *  a. If hypercash terminal, print whole receipt
 *  b. Else, print remaining receipt portion
 * 3. Open summaryDialog
 * 
 * If saving failed,
 * 1. Display system message as 'Order cancel failed.'
 */
CANCEL.cancelTransaction = function() {
    var msgValue = getMsgValue("pos_tx_order_summary_cancel_msg");
    //previousTxType = saleTx.type;
    //saleTx.type = CONSTANTS.TX_TYPES.CANCEL_SALE.name;
    var txType = saleTx.type;

    saleTx.totalAmount = saleTx.totalAmount * -1;
    renderTotal();


    if (!jQuery.isEmptyObject(saleTx.billPaymentItem)) {
        saleTx.billPaymentItem.status = CONSTANTS.STATUS.CANCELLED;
        txType = CONSTANTS.TX_TYPES.BILL_PAYMENT.typeLabel;
    }

    saveOrder(CONSTANTS.STATUS.CANCELLED, function(data) {
        if (data && data.error) {
            promptSysMsg('Transaction failed.' + JSON.stringify(data.error),
                saleTx.type);
        } else {
            renderScreenReceiptSummary();
            var cancelPrintDetails = {
                summary: setReceiptSummary(saleTx),
                footerSummary: setReceiptFooterSummary(saleTx),
                footer: setReceiptFooter(saleTx),
                mktInfo: setReceiptMarketingPromoInfo(saleTx),
                isQueued: true
            };
            if (isHcEnabled) {
                Hypercash.printer.printTransactionWithHeaderAndBody(cancelPrintDetails);
            } else {
                printReceipt(cancelPrintDetails);
            }
            openOrderSummaryDialog(txType + msgValue, getMsgValue('prompt_msg_transaction_complete_new_order'));
        }
    }, function(error) {
        uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
        promptSysMsg('Order Cancel failed.' + JSON.stringify(error), saleTx.type);
    });
};
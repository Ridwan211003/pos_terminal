var STORE_RECALL = STORE_RECALL || {};

STORE_RECALL.storeTxn = function() {
    saleTx.transactionDate = saleTx.transactionDate || new Date();

    // check if there is topup tx and encapsulate it to SaleTx, remove it upon recall.
    if (topUpObj &&
        topUpObj.topUpTxItems &&
        topUpObj.topUpTxItems.length) {
        saleTx.topUpObj = topUpObj;
    }

    // check if there is alterra tx and encapsulate it to SaleTx, remove it upon recall.
    if (alterraObj &&
        alterraObj.alterraTxItems &&
        alterraObj.alterraTxItems.length) {
        saleTx.alterraObj = alterraObj;
    }

    // check if there is mcash tx and encapsulate it to SaleTx, remove it upon recall.
    if (mCashObj &&
        mCashObj.mCashTxItems &&
        mCashObj.mCashTxItems.length) {
        saleTx.mCashObj = mCashObj;
    }

    // check if there is indosmart tx and encapsulate it to SaleTx, remove it upon recall.
    if (indosmartObj &&
        indosmartObj.indosmartTxItems &&
        indosmartObj.indosmartTxItems.length) {
        saleTx.indosmartObj = indosmartObj;
    }

    // encapsulate scannedItemOrder to SaleTx, remove it upon recall.
    saleTx.scannedItemOrder = scannedItemOrder;

    //fix for Bug #80579
    if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name && calculatePromotion) {
        processLayerTwoPromotions();

        if (!saleTx.totalDiscount) {
            saleTx.totalDiscount = 0;
        }
        saleTx.totalDiscount += promoDiscount;
        calculatePromotion = false;
        saleTx.promotionItems = promotionItems;
    }

    //fix for Bug #86442
    saleTx.promotionsMap = promotionsMap;
    saleTx.promoDiscount = promoDiscount; //layer 2 discount

    if (toggleTVS) {
        saleTx["toggleTVS"] = toggleTVS;
        saleTx["tVSTxApproverUserId"] = tVSTxApproverUserId;
    }

    if (saleTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) {
        saleTx.billPaymentVar = BILL_PAYMENT.variables;
    }

    var deferred = $.ajax({
        url: proxyUrl + "/storeTxn",
        type: "POST",
        async: false,
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(saleTx)
    });

    deferred.done(function(response) {
        if (!jQuery.isEmptyObject(response) && !response.error) {
            uilog("DBUG", "SUCCESS: " + response);
            saleTx.transactionId = response;
            saveSupervisorInterventionData(response);
            printStoreTxnReceipt();
            promptSysMsg('Transaction stored with TR# ' +
                removeLeadingZeroes(response), 'STORE SALE');
        } else {
            promptSysMsg('Failed to store transaction.', 'STORE SALE');
        }
    });
    deferred.fail(function(jqXHR, status, error) {
        uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
        promptSysMsg('Failed to store transaction.', 'STORE SALE');
    });
}

function saveSupervisorInterventionData(response) {
    SUPERVISOR_INTERVENTION.saveInterventionData(
        saleTx.transactionId,
        // returns the last item of supervisorInterventions array
        saleTx.supervisorInterventions.slice(-1)[0],
        CASHIER.getFinalSubtotalTxAmount(saleTx)
    );
}

function printStoreTxnReceipt() {
    if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name) {
        var storeTxnPrintDetails = {
            summary: setStoreTxnReceiptSummary(saleTx),
            //txDetail : setReceiptTxDetails(saleTx),
            //footerSummary: setReceiptFooterSummary(saleTx),
            footer: setReceiptFooter(saleTx),
            mktInfo: setReceiptMarketingPromoInfo(saleTx),
            isQueued: true
        };
    } else {
        var storeTxnPrintDetails = {
            summary: setStoreTxnReceiptSummary(saleTx),
            //txDetail : setReceiptTxDetails(saleTx),
            footerSummary: setReceiptFooterSummary(saleTx),
            footer: setReceiptFooter(saleTx),
            mktInfo: setReceiptMarketingPromoInfo(saleTx),
            isQueued: true
        };
    }
    if (isHcEnabled) {
        Hypercash.printer.printTransactionWithHeaderAndBody(storeTxnPrintDetails);
    } else {
        printReceipt(storeTxnPrintDetails);
    }
}

STORE_RECALL.findStoreTxn = function(txnId) {
    var storedTxn = null;

    $.ajax({
        url: proxyUrl + "/recallTxn",
        type: "GET",
        async: false,
        data: {
            txnId: txnId,
            mode: isTrainingModeOn ? "trial" : '',
            method: "FIND"
        },
        success: function(response) {
            if (!jQuery.isEmptyObject(response) && !response.error) {
                storedTxn = JSON.parse(JSON.stringify(response));
            }
        },
        error: function(response) {}
    });

    return storedTxn;
};
var SALEVOID = SALEVOID || {};

/**
 * Used to void past sale transaction. 
 */
SALEVOID.voidSale = function() {
    if (hasScannedItem(saleTx)) {
        showMsgDialog(CONSTANTS.TX_TYPES.SALE_VOID.getTypeLabel() + getMsgValue("prompt_msg_sale_ongoing"), "warning");
    } else {
        togglePostVoid = true;
        toggleGCMMSRedemptionVoid = true;
        var authenticationDeffered = $.Deferred();
        $("#authentication-form").removeData(AUTH_DATA_KEYS)
            .data('roles', ['ROLE_MANAGER_CANCELLATION'])
            .data('interventionType',
                CONSTANTS.TX_TYPES.SALE_VOID.name)
            .data('defer', authenticationDeffered)
            .dialog("open");
        /*
         * JQuery Deffered, used for chaining callbacks
         * @author http://api.jquery.com/jQuery.Deferred/
         */

        authenticationDeffered.done(SALEVOID.saveSupervisorInterventionTempData);
        authenticationDeffered.done(SALEVOID.displayTxnTypeLabel);
        authenticationDeffered.done(SALEVOID.changeCustomerScreen);
        authenticationDeffered.done(SALEVOID.executeFlow);
    }
}

SALEVOID.saveSupervisorInterventionTempData = function(supervisorInterventionData) {
    SUPERVISOR_INTERVENTION.saveTempData(supervisorInterventionData);
}

SALEVOID.displayTxnTypeLabel = function() {
    promptSysMsg(getMsgValue('prompt_msg_enter_txn_to_post_void'), CONSTANTS.TX_TYPES.SALE_VOID.getTypeLabel());
}

SALEVOID.changeCustomerScreen = function() {
    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
}

SALEVOID.executeFlow = function() {
    FUNCTION_FLOW_CONFIG.POST_VOID.executePostVoidFlow();
}

/*
 * @param txnId full transaction ID, including leading 0's
 */
SALEVOID.voidTxn = function(txnId) {

    // Transaction types valid for POST SALE VOID
    var txTypeValidForPostVoid = [
        //CONSTANTS.TX_TYPES.SALE_VOID.name,
        CONSTANTS.TX_TYPES.SALE.name,
        CONSTANTS.TX_TYPES.RETURN.name,
        CONSTANTS.TX_TYPES.REFUND.name
    ];

    $.ajax({
        url: posWebContextPath + "/cashier/getTxn/" + txnId + '?salesDateAgo=' + 1,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(response) {
            if (!jQuery.isEmptyObject(response) && !response.error) {
                var baseTx = JSON.parse(JSON.stringify(response));
                if (baseTx &&
                    baseTx.trialMode === isTrainingModeOn
                    // If the target transaction's type is valid for POST SALE VOID
                    &&
                    ($.inArray(baseTx.type, txTypeValidForPostVoid) > -1) &&
                    baseTx.status === CONSTANTS.STATUS.COMPLETED) {
                    var containsTopUpItem = false;
                    var containsIndosmartItem = false;
                    var containsMCashItem = false;
                    var containsAlterraItem = false;
                    var containsGiftCardItem = false;
                    var isGiftCardAlreadyUsed = false;
                    var containsAlloTopUpItem = false;

                    // INHOUSE VOUCHER 2017-04-13
                    // CHECK IF THERE IS REDEEMED VOUCHER
                    if (baseTx.redeemVoucherList && baseTx.redeemVoucherList.length > 0) {
                        showMsgDialog("Post Sale Void tidak diperbolehkan pada pembayaran dengan Marketing Voucher.", "warning");
                        return false;
                    }

                    // CHECK IF THERE IS GENERATED VOUCHER
                    if (baseTx.marketingVoucher && baseTx.marketingVoucher.marketingVoucherObj && baseTx.marketingVoucher.marketingVoucherObj.voucherList.length > 0 && !connectionOnline) {
                        showMsgDialog("Post Sale Void yang mempunyai Voucher tidak dapat dilakukan pada kondisi Offline.", "warning");
                        return false;
                    }
                    // INHOUSE VOUCHER 2017-04-13

                    if (baseTx.qrtts) {
                        showMsgDialog(getMsgValue('pos_warning_msg_sale_wth_topup_cannot_be_voided'), "warning");
                        containsAlloTopUpItem = true;
                        return false;
                    }

                    for (var i = 0; i < baseTx.orderItems.length; i++) {
                        if (TOPUP.isTopUpItem(baseTx.orderItems[i])) {
                            containsTopUpItem = true;
                            break;
                        }
                    }

                    for (var i = 0; i < baseTx.orderItems.length; i++) {
                        if (INDOSMART.isIndosmartItem(baseTx.orderItems[i])) {
                            containsIndosmartItem = true;
                            break;
                        }
                    }

                    for (var i = 0; i < baseTx.orderItems.length; i++) {
                        if (MCASH.isMCashItem(baseTx.orderItems[i])) {
                            containsMCashItem = true;
                            break;
                        }
                    }

                    for (var i = 0; i < baseTx.orderItems.length; i++) {
                        if (ALTERRA.isAlterraItem(baseTx.orderItems[i])) {
                            containsAlterraItem = true;
                            break;
                        }
                    }

                    for (var i = 0; i < baseTx.orderItems.length; i++) {
                        if (isGiftCardItem(baseTx.orderItems[i])) {
                            if (hasGCMMSActivationItem(baseTx.transactionId)) {
                                containsGiftCardItem = false;
                                if (!callGcMmsVoidActivationRequest(baseTx.transactionId)) {
                                    isGiftCardAlreadyUsed = true;
                                }
                            } else {
                                containsGiftCardItem = true;
                            }
                            break;
                        }
                    }

                    // CHECK IF TRX CONTAINS GC PAYMENT
                    // CHECK IF TRX CONTAINS MLC ONLINE PAYMENT
                    var isGCPayment = false;
                    var isMLCPayment = false;
                    var isEFTOnlinePayment = false; // CR KARTUKU
                    var eftOnlineArray = []; // CR KARTUKU
                    for (var g = 0; g < baseTx.payments.length; g++) {
                        var payment = baseTx.payments[g];
                        if (payment.paymentMediaType == 'GC') {
                            isGCPayment = true;
                            break;
                        } else if (payment.paymentMediaType == 'MLC_ONLINE') {
                            isMLCPayment = true;
                            break;
                        }
                        // CR KARTUKU
                        /*else if(payment.paymentMediaType == 'EFT_ONLINE')
                        {
                                isEFTOnlinePayment = true;
                                eftOnlineArray.push(payment);
                                break;
                        }*/

                    }

                    if (containsTopUpItem) {
                        showMsgDialog(getMsgValue('pos_warning_msg_sale_wth_topup_cannot_be_voided'), "warning");
                        clearInputDisplay();
                    } else if (containsMCashItem) {
                        showMsgDialog(getMsgValue('pos_warning_msg_sale_wth_mcash_cannot_be_voided'), "warning");
                        clearInputDisplay();
                    } else if (containsIndosmartItem) {
                        showMsgDialog(getMsgValue('pos_warning_msg_sale_wth_indosmart_cannot_be_voided'), "warning");
                        clearInputDisplay();
                    } else if (containsAlterraItem) {
                        showMsgDialog(getMsgValue('pos_warning_msg_sale_wth_alterra_cannot_be_voided'), "warning");
                        clearInputDisplay();
                    } else if (containsGiftCardItem) {
                        showMsgDialog(getMsgValue('giftcard_msg_post_sale_void_not_allowed'), "warning");
                        clearInputDisplay();
                    } else if (isGiftCardAlreadyUsed) {
                        clearInputDisplay();
                    } else if (isGCPayment) {
                        showMsgDialog("Post Sale Void tidak diperbolehkan pada pembayaran dengan Gift Card.", "warning");
                        clearInputDisplay();
                    } else if (isMLCPayment) {
                        showMsgDialog("Post Sale Void tidak diperbolehkan pada pembayaran dengan Mega Smartpay.", "warning");
                        clearInputDisplay();
                    } else if (containsAlloTopUpItem) {
                        showMsgDialog("Post Sale Void tidak diperbolehkan pada Transaksi Allo Topup.", "warning");
                        clearInputDisplay();
                    } else {
                        // CR KARTUKU
                        /*if(isEFTOnlinePayment)
                        {
                                for(var i in eftOnlineArray)
                                {
                                        var voidObj = {
                                                transactionId   : baseTx.transactionId,
                                                posId           : configuration.terminalNum,
                                                traceNumber     : eftOnlineArray[i].eftData.traceNum,
                                                transactionType : 'VOID'
                                        };
                                        sendEFT(voidObj);
                                }
                        }*/

                        $.ajax({
                            url: proxyUrl + "/txnData",
                            type: "GET",
                            async: false,
                            dataType: "json",
                            contentType: 'application/json',
                            success: function(response) {
                                if (!jQuery.isEmptyObject(response) && !response.error) {
                                    var txnData = JSON.parse(JSON.stringify(response));
                                    var voidTx = {
                                        transactionId: txnData.txnId,
                                        baseTransactionId: baseTx.transactionId,
                                        type: CONSTANTS.TX_TYPES.SALE_VOID.name,
                                        trialMode: isTrainingModeOn,
                                        posTerminalId: txnData.tid,
                                        storeCd: txnData.stcd,
                                        posSession: { posSessionId: txnData.sid, userId: txnData.uid },
                                        userId: txnData.uid,
                                        // commented due to #79948
                                        // transactionDate: txnData.txnDate,
                                        status: 'COMPLETED',
                                        totalQuantity: baseTx.totalQuantity,
                                        totalAmount: baseTx.totalAmount * -1,
                                        roundingAmount: baseTx.roundingAmount * -1,
                                        cpnIntAmount: baseTx.cpnIntAmount * -1,
                                        customerId: baseTx.customerId,
                                        version: baseTx.version,
                                        orderItems: cloneObject(baseTx.orderItems),
                                        promotionItems: cloneObject(baseTx.promotionItems),
                                        totalDiscount: baseTx.totalDiscount - baseTx.memberDiscReversal,
                                        voidedDiscount: baseTx.voidedDiscount,
                                        donationAmount: baseTx.donationAmount * -1,
                                        memberDiscReversal: baseTx.memberDiscReversal * -1,
                                        totalNonMemberMarkup: baseTx.totalNonMemberMarkup * -1,
                                        indentSlip: baseTx.indentSlip,
                                        indentExpectedDeliveryDate: baseTx.indentExpectedDeliveryDate
                                    };

                                    // INHOUSE VOUCHER 2017-04-13
                                    // INVALIDATE MARKETING VOUCHER
                                    if (connectionOnline && baseTx.marketingVoucher && baseTx.marketingVoucher.marketingVoucherObj && baseTx.marketingVoucher.marketingVoucherObj.voucherList.length > 0) {
                                        var voucherList = baseTx.marketingVoucher.marketingVoucherObj.voucherList;

                                        for (var i in voucherList) {
                                            console.log('Invalidating Voucher: ' + voucherList[i]);
                                            agentResponse = callAgent('void', { 'trxId': baseTx.transactionId, 'voucherId': voucherList[i], 'voidAmt': 0 });
                                            console.log(agentResponse);
                                            if (agentResponse.rspCode == 147) {
                                                showMsgDialog('CANNOT PSV TRANSACTION WITH REDEEMED VOUCHER', 'warning');
                                                return false;
                                            }
                                        }
                                    }
                                    // INHOUSE VOUCHER 2017-04-13

                                    /*
                                     * TODO: Remove salesType PosTxItem variable, should
                                     * use PosTxItem isVoided instead.
                                     */
                                    for (var i = 0; i < voidTx.orderItems.length; i++) {

                                        voidTx.orderItems[i].salesType = CONSTANTS.TX_TYPES.SALE_VOID.name;
                                    }

                                    // Merge the SupervisorIntervention Data to voidTx
                                    voidTx = SUPERVISOR_INTERVENTION.mergeTempDataToSaleTx(voidTx,
                                        CONSTANTS.TX_TYPES.SALE_VOID.name,
                                        voidTx.totalAmount);
                                    // Finalising the value of supervisor-intervention data
                                    SUPERVISOR_INTERVENTION.setTotalAmountBySaleTxType(voidTx);
                                    $.ajax({
                                        url: posWebContextPath + "/cashier/voidOrder",
                                        type: "POST",
                                        async: false,
                                        dataType: "json",
                                        contentType: 'application/json',
                                        data: JSON.stringify(voidTx),
                                        success: function(response) {
                                            // INDENT 2017-05-18
                                            //INDENT FOLLOW VOID WHEN TRANSACTION IS VOIDED
                                            uilog('DBUG', '--VOID INDENT--');
                                            var __returnRequest = voidIndent(txnId);
                                            if (__returnRequest == null) {
                                                uilog('DBUG', 'VOID INDENT FAILED NO RESPONSE FROM SERVER');
                                            } else if (__returnRequest['result'] > 0) {
                                                uilog('DBUG', 'VOID INDENT OK|' + JSON.stringify(__returnRequest));
                                            } else {
                                                uilog('DBUG', 'VOID INDENT FAILED|' + JSON.stringify(__returnRequest));
                                            }
                                            clearIndentSales('inquiry');
                                            //INDENT FOLLOW VOID WHEN TRANSACTION IS VOIDED
                                            // INDENT 2017-05-18

                                            if (!jQuery.isEmptyObject(response) && !response.error) {
                                                // Adding the type of the original transaction
                                                $.extend(voidTx, {
                                                    baseTransactionType: baseTx.type
                                                });
                                                // Reflecting the void transaction values to saleTx.
                                                $.extend(saleTx, voidTx);
                                                renderVoidTxn(baseTx, voidTx);
                                                if (isHcEnabled) {
                                                    suppressPrinting = false;
                                                }

                                                uilog("DBUG", voidTx);
                                                uilog("DBUG", baseTx);
                                                var currencyVoid;
                                                if (voidTx.orderItems[0].categoryId == "RDM") {
                                                    currencyVoid = "Points";
                                                } else {
                                                    currencyVoid = "Rp";
                                                }
                                                printReceipt({
                                                    header: setReceiptHeader(voidTx),
                                                    txDetail: setReceiptTxDetails(voidTx),
                                                    body: setReceiptItems(voidTx,
                                                        voidTx.orderItems, { currency: currencyVoid }
                                                    ),
                                                    summary: setReceiptVoidTxSummary(baseTx, voidTx),
                                                    footerSummary: setReceiptFooterSummary(voidTx),
                                                    footer: setReceiptFooter(voidTx),
                                                    mktInfo: setReceiptMarketingPromoInfo(voidTx),
                                                    isHypercashPrint: isHcEnabled,
                                                    isQueued: true
                                                });
                                                promptSysMsg("Transaction # " + removeLeadingZeroes(txnId) + " voided.",
                                                    CONSTANTS.TX_TYPES.SALE_VOID.getTypeLabel());
                                                toggleFNButton("fnPostVoid", false);
                                                isAuthenticated = false;
                                                isPreAuthenticated = false;
                                                clearInputDisplay();

                                                if (connectionOnline) {
                                                    if (transactionHasCustomerId(baseTx.transactionId) == true) {
                                                        voidCRMPoints(voidTx.baseTransactionId);
                                                    }

                                                    // void GC MMS Redemption
                                                    if (GIFTCARD_MMS.hasGCMMSRedemption(baseTx.payments)) {
                                                        var param = {
                                                            voidType: CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.REDEMPTION.name,
                                                            refTxnNo: baseTx.transactionId
                                                        };
                                                        GIFTCARD_MMS.processGiftCardMmsTransaction(param);
                                                    } else if (hasGCMMSActivationItem(baseTx.transactionId)) {
                                                        var param = {
                                                            voidType: CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.ACTIVATION.name,
                                                            refTxnNo: baseTx.transactionId
                                                        };
                                                        GIFTCARD_MMS.processGiftCardMmsTransaction(param);
                                                    }
                                                }

                                                if (baseTx.taxInvoice) {
                                                    showMsgDialog(getMsgValue('void_txn_with_invoice_warning').format(baseTx.taxInvoice.invoiceNumber), 'warning',
                                                        function() {
                                                            showTransactionCompletedDialog('POST VOID COMPLETED', null,
                                                                getMsgValue('prompt_msg_transaction_complete_new_order'),
                                                                function() {
                                                                    if (isHcEnabled) {
                                                                        endProfCustTxn();
                                                                    }
                                                                });
                                                        }
                                                    );
                                                } else {
                                                    showTransactionCompletedDialog('POST VOID COMPLETED',
                                                        null,
                                                        getMsgValue('prompt_msg_transaction_complete_new_order'));
                                                }
                                            } else {
                                                showMsgDialog("Failed to void transaction.\n" + response.error, "warning");
                                            }
                                        },
                                        error: function(jqXHR, status, error) {
                                            showMsgDialog("Failed to void transaction.", "warning");
                                        }
                                    });
                                } else {
                                    showMsgDialog("Failed to void transaction.", "warning");
                                }
                            },
                            error: function(jqXHR, status, error) {
                                showMsgDialog(getMsgValue("pos_warning_trans_not_in_file"), "warning");
                            }
                        });
                    }
                } else {
                    if (baseTx && (baseTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name || baseTx.type == CONSTANTS.TX_TYPES.BPJS.name || baseTx.type == CONSTANTS.TX_TYPES.ELEBOX.name)) {
                        showKeyNotAllowedMsg();
                    } else {
                        showMsgDialog(getMsgValue("pos_warning_trans_not_in_file"), "warning");
                    }
                }
            } else {
                var errorMsg = getMsgValue("pos_warning_trans_not_in_file"); // default
                errorMsg = RETURN_REFUND.return.service.getErrorMsgByResponse(response, errorMsg);
                showMsgDialog(errorMsg, "warning");
            }
        },
        error: function(jqXHR, status, error) {
            //fix for #75977
            showMsgDialog(getMsgValue("pos_warning_trans_not_in_file"), "warning");
        }
    });
}

function hasGCMMSActivationItem(txnId) {
    var hasGCMMSTxn = false
    $.ajax({
        type: 'GET',
        url: posWebContextPath + '/giftcard-mms/getGcTxn/' + txnId,
        dataType: 'json',
        async: false,
        contentType: "application/json",
        timeout: 30000,
        success: function(response) {
            if (response == true) {
                hasGCMMSTxn = true;
            }
        },
        error: function() {
            //showMsgDialog("Error getting Gift Card transaction", "warning");
        }
    });

    return hasGCMMSTxn;
}

function transactionHasCustomerId(txnId) {
    var hasCustomerId = false
    $.ajax({
        type: 'GET',
        url: posWebContextPath + '/cashier/transactionHasCustomerId/' + txnId,
        dataType: 'json',
        async: false,
        contentType: "application/json",
        timeout: 30000,
        success: function(response) {
            if (response == true) {
                hasCustomerId = true;
            }
        },
        error: function() {
            showMsgDialog("Error", "warning");
        }
    });

    return hasCustomerId;
}
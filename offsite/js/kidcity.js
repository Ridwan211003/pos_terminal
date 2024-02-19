var KIDCITY = KIDCITY || {};

KIDCITY.saveTransaction = function (saleTx) {

    var responsed = false;

    for (var idx = 0; idx < saleTx.orderItems.length; idx++) {

        var trxId = saleTx.transactionId;
        var sku = saleTx.orderItems[idx].sku; 
        var skuCut = sku.substr(2, 9);
        var trxIdAndSku = trxId + skuCut;
        
        var data = {
            "branch_id": saleTx.storeCd,
            "sales_date": saleTx.transactionDate,
            "item_id": saleTx.orderItems[idx].sku,
            "item_name": saleTx.orderItems[idx].name,
            "quantity": saleTx.orderItems[idx].quantity,
            "amount": saleTx.orderItems[idx].priceSubtotal,
            "qr_code": trxIdAndSku,
            "approval_code": trxId,
            "payment_type": saleTx.payments[0].paymentMediaType,
            "reff_no": trxId,
            "username": saleTx.userName,
        };

        $.ajax({
            url: posWebContextPath + "/cashier/kidcity/saveTicket",
            type: "POST",
            async: false,
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                if(response.status){
                    responsed = true;
                }else{
                    responsed = false;
                }
                
            },
            error: function (jqXHR, status, error) {
                responsed = false;
            }
        });
        
    }
    
    return responsed;
}

KIDCITY.printTransaction = function (saleTx, paymentMediaType){

    saveOrder(CONSTANTS.STATUS.COMPLETED, function(data) {

        if (data && data.error) {
            promptSysMsg('Order failed.' +
                JSON.stringify(data.error), 'SALE');
        } else {
            if (isGcMmsRedemption) {
                callGcMmsConfirmRedemptionRequest();
            }
            lockKeyboard = false;
            promptSysMsg('Order completed with TR# ' +
            removeLeadingZeroes(data), 'SALE');
            renderScreenReceiptSummary();
            DrawerModule.validateTxnToOpenDrawer();
            renderOrderSummaryDialog();
            var detailsToPrint = {
                summary: setReceiptSummary(saleTx),
                footerSummary: setReceiptFooterSummary(saleTx, { eftOnline: setReceiptEftOnline(saleTx) }),
                footer: setReceiptFooter(saleTx),
                mktInfo: setReceiptMarketingPromoInfo(saleTx),
                balloonGame: setReceiptBalloonGame(saleTx),
                freeParking: setReceiptFreeParking(saleTx),
                kidcity: (kidcityEnable) ? saleTx.kidcityObj : false,
                qrtts: setReceiptQrtts(saleTx),
                mlc: setReceiptMLC(saleTx),
                altoWC: setReceiptAltoWC(saleTx),
                ppp: setReceiptPPP(saleTx),
                eftOnline: setReceiptEftOnline(saleTx, true),
                isInstallmentTransaction: isInstallmentTransaction,
                isQueued: true,
                voucherData: (saleTx.type != 'SALE') ? {} : saleTx.marketingVoucher, // INHOUSE VOUCHER 2017-04-13
                couponData: (saleTx.type != 'RETURN') ? {} : setCouponSummary(saleTx),
                copyTrk: (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_POINT.name) ? setReceiptCopyTrk(saleTx) : {}
            };

            if(kidcityEnable){
                kidcityEnable = false;
                kidcityEnableStatus = null;
            }

            if (isHcEnabled && saleTx) {
                Hypercash.printer.printTransactionBasedOnMediaPaymentType(saleTx.payments, detailsToPrint);
            } else {
                printReceipt(detailsToPrint);
            }

            processTVS(saleTx);
        }
    }, function(error) {
        uilog('DBUG', 'FAIL: ' + error);
    });
}
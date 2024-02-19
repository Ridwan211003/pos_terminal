var MCASH = MCASH || {};

MCASH.getStatusMessage = {
    '0': 'DALAM PROSES',
    '1': 'INVALID PHONE',
    '2': 'GENERAL ERROR',
    '4': 'SUKSES',
    '8': 'NO TRX TIDAK ADA',
    '9': 'GENERAL H2H ERR',
    '10': 'SIGNATURE ERR',
    '12': 'COMMAND ERR',
    '13': 'ITEM TDK ADA',
    '14': 'DATETIME ERR',
    '15': 'SQL SAVE ERR',
    '17': 'LAKUKAN RETURN',
    '19': 'NETWORK DOWN',
    '20': 'NO COMMAND',
    '21': 'WRONG FORMAT',
    '22': 'CUTOFF TIME',
    '25': 'UNMATCH PARAM',
    '26': 'TDK ADA TRX LAMA',
    '27': 'STORE TDK ADA',
    '28': 'CHANNEL DITOLAK',
    '29': 'TRX TDK VALID',
    '30': 'WRONG MAPPING',
    '31': 'ITEM TDK SESUAI',
    '32': 'LIMIT HABIS',
    '33': 'STOK KOSONG',
    '34': 'ITEM GANGGUAN',
    '35': 'DITOLAK SDH SUKSES',
    '36': 'DITOLAK SDG TOP UP',
    '37': 'DITOLAK SDH REFUND',
    '38': 'LEWAT TENGGANG WAKTU',
    '39': 'ORDER EXPIRED',
    '40': 'ORDER TDK ADA',
    '102': 'UNKNOWN ERROR'
}

MCASH.saveMCashTransaction = function(data) {
    return $.ajax({
        url: posWebContextPath + "/cashier/saveMCashTransaction/" + saleTx.transactionId,
        type: "POST",
        async: false,
        dataType: "json",
        contentType: "application/json",
        // data : JSON.stringify(data), --calculate the change
        data: JSON.stringify(PAYMENT_MEDIA.finalizeSaleTxLastPaymentAmount(data)),
        success: function(response) {
            uilog("DBUG", "MCash saved.");
        },
        error: function(jqXHR, status, error) {
            showMsgDialog("Saving of MCash Tx failed: " + error, "error");
        }
    });
}

MCASH.createMCashTransactionObj = function() {
    var obj = new Object();
    obj.totalAmt = 0;
    obj.mCashTxItems = [];
    return obj;
}


MCASH.initMCashStandardSale = function(prodObj) {
    console.log("init mcash");
    var mCashUrl = getConfigValue("MCASH_MAIN_URL");
    console.log("init mcash");
    var response = checkServerStatus(mCashUrl, 10000);
    console.log(response);
    if (response) {
        $("#mCash-phoneNum-dialog").data("prodObj", prodObj).dialog("open");
    } else {
        showMsgDialog("MCASH SERVER ERR! ITEM NOT ALLOWED!", "warning", function() {
            clearInputDisplay();
        });
    }

    return response;
}

MCASH.paymentType = function(currentPrice) {
    return currentPrice == '1' ? 'POSTPAID' : 'PREPAID';
}

MCASH.isMCashItem = function(item) {
    if (item.categoryId == CONSTANTS.TX_TYPES.MCASH.name || item.categoryId == 'G') {
        return true;
    } else {
        return false;
    }
}

MCASH.findMCashItemByBarcode = function(barcode) {
    var item = findItem(barcode);
    var returnedItem = {};

    if (item) {
        if (MCASH.isMCashItem(item)) {
            item.currentPrice = 10000;
            // item.sku = "TEST10K";
            returnedItem.type = MCASH.paymentType(item.currentPrice);
            returnedItem.name = item.shortDesc;
            returnedItem.object = item;
            returnedItem.tempPrice = item.currentPrice;
            returnedItem.vtype = item.sku;
            // returnedItem.vtype = item.sku.substring(0, item.sku.length - 3);
            console.log("Returned item");
            console.log(returnedItem);
            return returnedItem;
        } else {
            showMsgDialog("Invalid MCash Item.", "error");
            return false;
        }
    } else {
        return false;
    }
}

MCASH.formatMCashTxDateTime = function(date) {
    var dateStr = $.datepicker.formatDate("yymmdd", date);
    var hours = (date.getHours() < 10 ? "0" : "") + date.getHours();
    var minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    var seconds = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
    return dateStr + hours + minutes + seconds;
}

MCASH.saveMCashItem = function(item) {
    console.log("SAVE MCASH ITEM :");
    console.log(item);

    var renderProduct = {
        description: item.description,
        name: item.shortDesc,
        shortDesc: item.shortDesc,
        currentPrice: item.tempPrice
    };
    ++scannedItemOrder;

    // scan transactions start here
    if (!(saleTx.startDate))
        saleTx.startDate = new Date();
    addScannedItem(renderProduct);
    renderProductDetails(renderProduct);
    // Item has been added cannot do CLEAR already.
    disableClrFn = true;


    var mCashItem = {
        transactionId: saleTx.transactionId,
        transactionType: "topup",
        refTxItemOrder: scannedItemOrder,
        customerId: item.id,
        vType: item.vtype,
        name: item.name
    };

    console.log(mCashObj);
    mCashObj.mCashTxItems.push(mCashItem);
    renderScannedItem(saleTx.orderItems.last);
    renderTotal();
    refreshPromotion(false);
    enableCoBrand = false;
    clearInputDisplay();
    printScannedItem();

    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
}

/*
 * Searches matching vType in mCashObj, then deletes that index.
 * @param sku the sku column in Product object
 * @return boolean true if successful; otherwise, false.
 */
MCASH.voidMCashItem = function(sku) {
    if (mCashObj && mCashObj.mCashTxItems) {
        for (var i = mCashObj.mCashTxItems.length - 1; i >= 0; i--) {
            var item = mCashObj.mCashTxItems[i];

            if (item.vType == sku) {
                mCashObj.mCashTxItems.splice(i, 1);
                return true;
            }
        }
    }

    return false;
}

MCASH.isTopUpMCash = function(item) {
    return true;
}

MCASH.getOrderCommand = function(item) {
    if (item) {
        if (MCASH.isTopUpMCash(item)) {
            return 'topup';
        } else {
            return 'bill';
        }
    } else {
        return false;
    }
}

MCASH.sendMCashRequest = function(data) {
    console.log("send mcash request");
    console.log(data.seqMCashNum);
    var url = getConfigValue("MCASH_MAIN_URL");
    var drcUrl = getConfigValue("MCASH_DRC_URL");
    var isDrcServerUrlUsed = false;
    var response = null;
    var retries = 0;
    var cashierId = loggedInUsername; //hotfix - remove test data
    var storeCode = '2'; //configuration.storeCode.toLowerCase();
    var posTerminalCode = '2'; //configuration.terminalCode.toLowerCase();
    var dateNow = MCASH.formatMCashTxDateTime(new Date());
    var partnerTxId = saleTx.transactionId +
        (data.seqMCashNum !== "" && data.seqMCashNum !== null ? data.seqMCashNum + 1 : ""); // add 1 because seqTopUpNum starts at 0.
    var serverTxId = "";

    if (data.serverTxId) {
        partnerTxId = data.serverTxId;
        serverTxId = data.storeId + data.posId + data.serverTxId;
    }

    console.log("Server tx id :", serverTxId);
    console.log("Partner tx id :", partnerTxId);

    var params = {
        channelid: getConfigValue("MCASH_CHANNEL_ID"),
        posid: posTerminalCode,
        password: $.md5(
            $.md5(getConfigValue("MCASH_PIN") +
                getConfigValue("MCASH_SERVER_SECRET_KEY") +
                serverTxId +
                (!isNaN(data.seqMCashNum) ? partnerTxId : "")
            ) +
            $.md5(getConfigValue("MCASH_CHANNEL_ID") + storeCode + posTerminalCode + dateNow)
        ),
        cmd: data.cmd,
        trxtime: dateNow,
        storeid: storeCode,
        cashierid: cashierId,
        url: url,
        timeout: getConfigValue("MCASH_TIME_OUT") * 1000
    };

    // add more param required for a specific request
    if (data.cmd == "topup") {
        params.hp = data.hp;
        params.vtype = data.vType;
        params.partner_trxid = partnerTxId;
    } else if (data.cmd == "inquiry") {
        params.server_trxid = serverTxId;
        params.partner_trxid = partnerTxId;
    } else if (data.cmd == "bill") {
        params.customerid = data.customerId;
        params.vtype = data.vType;
    } else if (data.cmd == "pay") {
        params.customerid = data.customerId;
        params.vtype = data.vType;
        params.partner_trxid = partnerTxId;
        params.server_trxid = data.serverTxId;
        params.amount = data.amount;
    } else if (data.cmd == "check_product") {
        params.vtype = data.vType;
    } else if (data.cmd == "retur") {
        params.server_trxid = serverTxId;
        params.partner_trxid = partnerTxId;
    }

    var reqErrCode = null;
    var reqStatus = null;
    var reqErrMsg = null;

    console.log(params);

    // request must be from proxy server, cant make ajax request to a remote
    // domain.
    var stop = false;
    while (!stop) {
        $.ajax({
            type: 'POST',
            url: posWebContextPath + '/cashier/mCash/executeProxy',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: "application/json",
            async: false,
            timeout: getConfigValue("MCASH_TIME_OUT") * 1000,
            beforeSend: function() {
                $("#loadingDialogMessage").html("Request MCASH");
                $("#loading-dialog").dialog("open");
            },
            success: function(res) {
                uilog("DBUG", "MCASH response: " + JSON.stringify(res));
                if (res && typeof res == 'object') {
                    if (res.errmsg) {
                        ++retries;
                    } else if (res.result && typeof res.result == 'object') {
                        stop = true;
                        res.result.storeid = storeCode;
                        res.result.cashierid = cashierId;
                        res.result.posid = posTerminalCode;
                        res.result.partner_trxid = res.result.partner_trxid ? res.result.partner_trxid : partnerTxId;
                        res.result.server_trxid = res.result.server_trxid ? res.result.server_trxid : partnerTxId;
                        response = res;
                    } else {
                        ++retries;
                    }
                } else {
                    ++retries;
                }
            },
            error: function(jqXHR, status, error) {
                response = error;
                ++retries;
                uilog("DBUG", "MCASH error: " + error);
            },
            complete: function(jqXHR, status) {
                $("#loading-dialog").dialog("close");
            }
        });


        if (retries == Number(getConfigValue("MCASH_MAX_CON_RETRY"))) {
            if (isDrcServerUrlUsed) {
                reqErrMsg = "Server connection failed.";
                break;
            }
            isDrcServerUrlUsed = true;
            url = drcUrl;
            retries = 0;
        }
    }
    if (reqErrMsg) {
        response = {
            error: reqErrMsg,
            serverTrxId: partnerTxId,
            storeId: storeCode,
            cashierId: cashierId,
            posId: posTerminalCode
        };
    }

    console.log(response);

    return response;
}

MCASH.processMCashTransaction = function() {
    uilog("DBUG", "MCASH TRANSACTION");
    console.log(processMCashStdSleCntr, mCashObj.mCashTxItems.length);
    if (mCashObj &&
        mCashObj.mCashTxItems &&
        processMCashStdSleCntr == mCashObj.mCashTxItems.length) {

        if (isHcEnabled) {
            Hypercash.queuedMCashToPrint.push(setReceiptMCashInfo(null, false, false, false, true, true));
        } else {
            printReceipt({ mCashInfo: setReceiptMCashInfo(null, false, false, false, true, true) });
        }

        renderMCashInfo(null, false, false, false, true, false);

        var type = null;
        try {
            if (saleTx.type == 'RETURN') {
                RETURN_REFUND.return.service.saveCouponReturnData();
            }
            type = mCashTxItem.transactionType ? mCashTxItem.transactionType.toUpperCase() : null;
            if (type == 'REFUND') {
                RETURN_REFUND.return.service.saveCouponReturnData();
            }
        } catch (err) {
            console.log("Save coupon return data error");
            console.log(err);
        }

        saveOrder(CONSTANTS.STATUS.COMPLETED,
            function(data) {
                if (data && data.error) {
                    promptSysMsg(getMsgValue('prompt_msg_order_failed') + JSON.stringify(data.error), 'SALE');
                } else {
                    uilog("DBUG", "SUCCESS: " + data);
                    promptSysMsg(getMsgValue('prompt_msg_order_completed') + removeLeadingZeroes(data), 'SALE');
                    renderCustomerFeedbackDialog();
                    DrawerModule.validateTxnToOpenDrawer();
                    renderOrderSummaryDialog();

                    var detailsToPrint = {
                        footerSummary: setReceiptFooterSummary(saleTx, { eftOnline: setReceiptEftOnline(saleTx) }),
                        footer: setReceiptFooter(saleTx),
                        mktInfo: setReceiptMarketingPromoInfo(saleTx),
                        freeParking: setReceiptFreeParking(saleTx),
                        mlc: setReceiptMLC(saleTx),
                        altoWC: setReceiptAltoWC(saleTx),
                        ppp: setReceiptPPP(saleTx),
                        balloonGame: setReceiptBalloonGame(saleTx),
                        eftOnline: setReceiptEftOnline(saleTx, true),
                        isInstallmentTransaction: isInstallmentTransaction,
                        isQueued: true,
                        voucherData: (saleTx.type != 'SALE') ? {} : saleTx.marketingVoucher, // INHOUSE VOUCHER 2017-04-13
                        couponData: (type == 'REFUND' || saleTx.type == 'RETURN') ? setCouponSummary(saleTx) : {}
                    }

                    if (isHcEnabled) {
                        Hypercash.printer.printTransactionBasedOnMediaPaymentType(saleTx.payments, detailsToPrint);
                    } else {
                        printReceipt(detailsToPrint);
                    }

                    console.log("MCASH OBJ");
                    console.log(mCashObj);
                    if (mCashObj &&
                        mCashObj.mCashTxItems &&
                        mCashObj.mCashTxItems.length != 0) {
                        saleTx.mCashObj = mCashObj.mCashTxItems;
                        MCASH.saveMCashTransaction(saleTx);
                    }

                    mCashTempObj = null;
                }
            },
            function(error) {
                uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
                promptSysMsg(getMsgValue('prompt_msg_order_failed') + JSON.stringify(error), 'SALE');
            }
        );
    } else {
        mCashTxItem = mCashObj.mCashTxItems[processMCashStdSleCntr];
        mCashTxItem.transactionDate = new Date();
        ++processMCashStdSleCntr;

        console.log("mcash tx item");
        console.log(mCashTxItem);

        if (mCashTxItem.transactionType.toUpperCase() == "TOPUP") {
            var data = {
                cmd: "topup",
                seqMCashNum: mCashTxItem.refTxItemOrder,
                customerId: mCashTxItem.customerId,
                vType: mCashTxItem.vType,
                hp: mCashTxItem.hp
            };
            var response = MCASH.sendMCashRequest(data);
            console.log("MCASH REQUEST");
            console.log(response);
            if (response) {
                if (response.error) {
                    mCashTxItem.scrMessage = response.error;
                    mCashTxItem.resMessage = response.error;
                    mCashTxItem.serverTrxId = response.serverTrxId;
                    mCashTxItem.partnerTrxId = response.serverTrxId;
                    mCashTxItem.storeId = response.storeId;
                    mCashTxItem.posId = response.posId;
                    mCashTxItem.cashierId = response.cashierId;
                } else {
                    var mCashItem = response.result;
                    mCashTxItem.resCode = mCashItem.rescode;
                    mCashTxItem.customerId = mCashItem.hp;
                    if (typeof mCashItem.vtype != 'object') {
                        mCashTxItem.vType = mCashItem.vtype;
                    }
                    mCashTxItem.serverTrxId = mCashItem.server_trxid;
                    mCashTxItem.partnerTrxId = mCashItem.partner_trxid;
                    mCashTxItem.scrMessage = mCashItem.scrmessage;
                    mCashTxItem.resMessage = mCashItem.resmessage;
                    mCashTxItem.storeId = mCashItem.storeid;
                    mCashTxItem.posId = mCashItem.posid;
                    mCashTxItem.cashierId = mCashItem.cashierid;
                    mCashTxItem.serialNumber = mCashItem.sn;
                    mCashTxItem.trxTime = mCashItem.trxtime;
                    var msg = mCashItem == null ? "Parse error on topup response." : mCashItem.scrMessage;
                }
                var mCashRes = {
                    mCashItem: cloneObject(mCashTxItem),
                    refTxItem: cloneObject(saleTx.orderItems[mCashTxItem.refTxItemOrder])
                };

                mCashTempObj.mCashItem = cloneObject(mCashTxItem);
                mCashTempObj.refTxItem = cloneObject(saleTx.orderItems[mCashTxItem.refTxItemOrder]);

                if (isHcEnabled) {
                    Hypercash.queuedMCashToPrint.push(setReceiptMCashInfo(mCashRes, false, false, true, false, false));
                } else {
                    printReceipt({
                        mCashInfo: setReceiptMCashInfo(mCashRes, false, false, true, false, false)
                    });
                }

                renderMCashInfo(mCashRes, false, false, true, false, false);
            }
            MCASH.processMCashTransaction();
        } else if (mCashTxItem.transactionType.toUpperCase() == "RETUR") {
            var data = {
                cmd: "retur",
                seqMCashNum: mCashTxItem.refTxItemOrder,
                serverTxId: mCashTxItem.serverTxId,
                storeId: mCashTxItem.storeId,
                posId: mCashTxItem.posId
            };
            console.log("RETUR DATA");
            console.log(mCashTxItem);
            response = MCASH.sendMCashRequest(data);
            console.log(response);
            if (response) {
                var mCashMsg = "";
                if (response.errmsg) {
                    mCashTxItem.scrMessage = response.error;
                    mCashTxItem.resMessage = response.error;
                    mCashTxItem.serverTrxId = response.serverTrxId;
                    mCashTxItem.partnerTrxId = response.serverTrxId;
                    mCashTxItem.storeId = response.storeid;
                    mCashTxItem.posId = response.posid;
                    mCashTxItem.cashierId = response.cashierid;
                } else {
                    var mCashItem = response.result;
                    mCashTxItem.transactionType = data.cmd.toUpperCase();
                    mCashTxItem.resCode = mCashItem.rescode;
                    mCashTxItem.customerId = mCashItem.hp;
                    if (typeof mCashItem.vtype != 'object') {
                        mCashTxItem.vType = mCashItem.vtype;
                    }
                    mCashTxItem.serverTrxId = mCashItem.server_trxid;
                    mCashTxItem.partnerTrxId = mCashItem.partner_trxid;
                    mCashTxItem.scrMessage = mCashItem.scrmessage;
                    mCashTxItem.resMessage = mCashItem.resmessage;
                    mCashTxItem.storeId = mCashItem.storeid;
                    mCashTxItem.posId = mCashItem.posid;
                    mCashTxItem.cashierId = mCashItem.cashierid;
                    mCashTxItem.serialNumber = mCashItem.sn;
                    mCashTxItem.trxTime = mCashItem.trxtime;
                    var msg = mCashItem == null ? "Parse error on topup response." : mCashItem.scrMessage;
                }
                var mCashRes = {
                    mCashItem: cloneObject(mCashTxItem),
                    refTxItem: cloneObject(saleTx.orderItems[mCashTxItem.refTxItemOrder])
                };

                if (isHcEnabled) {
                    Hypercash.queuedMCashToPrint.push(setReceiptMCashInfo(mCashRes, false, false, true, false, false));
                } else {
                    printReceipt({
                        mCashInfo: setReceiptMCashInfo(mCashRes, false, false, true, false, false)
                    });
                }

                renderMCashInfo(mCashRes, false, false, true, false, false);
            }
            MCASH.processMCashTransaction();
        } else {
            MCASH.processMCashTransaction();
        }
    }
}

MCASH.getMCashData = function(mCashId) {
    var mCash = null;
    $.ajax({
        url: posWebContextPath + "/cashier/mCash/getMCashData/" + mCashId,
        type: "GET",
        async: false,
        dataType: "json",
        contentType: "application/json",
        success: function(response) {
            console.log(response);
            if (jQuery.isEmptyObject(response))
                uilog("DBUG", "MCash Transaction Data is un-available");
            else {
                uilog("DBUG", "MCash Transaction Data is searchable.");
                mCash = response;
            }
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", "MCash Transaction Data Not Found");
        }
    });
    return mCash;
}

MCASH.findMCashTransaction = function(txnId, mCashId) {
    var mCash = null;
    $.ajax({
        url: posWebContextPath + "/cashier/mCash/getMCashTxn/" + txnId + "/" + mCashId,
        type: "GET",
        async: false,
        dataType: "json",
        contentType: "application/json",
        success: function(response) {
            console.log(response);
            if (jQuery.isEmptyObject(response))
                uilog("DBUG", "MCash Transaction is un-available");
            else {
                uilog("DBUG", "MCash Transaction is searchable.");
                mCash = response;
            }
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", "MCash Transaction Not Found");
        }
    });
    return mCash;
}
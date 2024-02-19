var ALTERRA = ALTERRA || {};

ALTERRA.createAlterraTransactionObj = function() {
    var obj = new Object();
    obj.totalAmt = 0;
    obj.alterraTxItems = [];
    return obj;
}

ALTERRA.isAlterraItem = function(item) {
    if (item.categoryId == CONSTANTS.TX_TYPES.ALTERRA.name) {
        return true;
    } else {
        return false;
    }
}

ALTERRA.initAlterraStandardSale = function(prodObj) {
    console.log("init alterra");
    var alterraUrl = getConfigValue("ALTERRA_MAIN_URL");
    console.log("init alterra");
    var response = checkServerStatus(alterraUrl, 10000);
    console.log(response);
    if (response) {
        $("#alterra-phoneNum-dialog").data("prodObj", prodObj).dialog("open");
    } else {
        showMsgDialog("ALTERRA SERVER ERR! ITEM NOT ALLOWED!", "warning", function() {
            clearInputDisplay();
        });
    }

    return response;
}

ALTERRA.sendAlterraRequest = function(data) {
    console.log("send alterra request");
    console.log(data.seqAlterraNum);
    var url = getConfigValue("ALTERRA_MAIN_URL");
    var drcUrl = getConfigValue("ALTERRA_DRC_URL");
    var isDrcServerUrlUsed = false;
    var response = null;
    var retries = 0;
    var orderId = saleTx.transactionId +
        (data.seqAlterraNum !== "" && data.seqAlterraNum !== null ? data.seqAlterraNum + 1 : ""); // add 1 because seqTopUpNum starts at 0.

    var username = getConfigValue('ALTERRA_USERNAME');
    var password = getConfigValue('ALTERRA_PASSWORD');

    var username_password = username + ":" + password;
    var authorization = btoa(username_password);

    console.log(username_password);
    console.log(authorization);

    var params = {
        url: url,
        authorization: authorization,
        timeout: getConfigValue("ALTERRA_TIME_OUT") * 1000,
        cmd: data.cmd
    };

    // add more param required for a specific request
    if (data.cmd == "topup") {
        params.customer_number = data.customerNumber;
        params.product_id = data.productId;
        params.order_id = orderId;
        params.path = 'transaction/mobile.json';
        params.method = 'POST';
    } else if (data.cmd == "inquiry") {
        params.transactionId = data.transactionId;
        params.path = 'transaction/mobile/' + data.transactionId + '.json';
        params.method = 'GET';
    } else if (data.cmd == "check_deposit") {
        params.path = 'getBalance';
        params.method = 'GET';
    }

    var reqErrCode = null;
    var reqStatus = null;
    var reqErrMsg = null;

    console.log(params);

    // request must be from proxy server, cant make ajax request to a remote
    // domain.
    var stop = false;
    $("#loadingDialogMessage").html("Request ALTERRA");
    $("#loading-dialog").dialog("open");
    while (!stop) {
        $.ajax({
            type: 'POST',
            url: posWebContextPath + '/cashier/alterra/execute',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: "application/json",
            async: false,
            timeout: getConfigValue("ALTERRA_TIME_OUT") * 1000,
            success: function(res) {
                uilog("DBUG", "Alterra response: " + JSON.stringify(res));
                if (res && typeof res == 'object') {
                    if (res.errmsg) {
                        ++retries;
                    } else if (res.result && typeof res.result == 'object') {
                        stop = true;
                        res.result.partner_trxid = res.result.order_id ? res.result.order_id : orderId;
                        res.result.server_trxid = res.result.transaction_id ? res.result.transaction_id : orderId;
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
                uilog("DBUG", "Alterra error: " + error);
            }
        });


        if (retries == Number(getConfigValue("ALTERRA_MAX_CON_RETRY"))) {
            if (isDrcServerUrlUsed) {
                reqErrMsg = "Server connection failed.";
                break;
            }
            isDrcServerUrlUsed = true;
            url = drcUrl;
            retries = 0;
        }
    }
    $("#loading-dialog").dialog("close");

    if (reqErrMsg) {
        response = {
            error: reqErrMsg,
            serverTrxId: orderId,
            resCode: 99
        };
    }

    console.log(response);

    return response;
}

ALTERRA.processAlterraTransaction = function() {
    uilog("DBUG", "ALTERRA TRANSACTION");
    console.log(processAlterraStdSleCntr, alterraObj.alterraTxItems.length);
    if (alterraObj &&
        alterraObj.alterraTxItems &&
        processAlterraStdSleCntr == alterraObj.alterraTxItems.length) {

        if (isHcEnabled) {
            Hypercash.queuedAlterraToPrint.push(setReceiptAlterraInfo(null, false, false, false, true, true));
        } else {
            printReceipt({ alterraInfo: setReceiptAlterraInfo(null, false, false, false, true, true) });
        }

        renderAlterraInfo(null, false, false, false, true, false);

        var type = null;
        try {
            if (saleTx.type == 'RETURN') {
                RETURN_REFUND.return.service.saveCouponReturnData();
            }
            type = alterraTxItem.transactionType ? alterraTxItem.transactionType.toUpperCase() : null;
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

                    console.log("ALTERRA OBJ");
                    console.log(alterraObj);
                    if (alterraObj &&
                        alterraObj.alterraTxItems &&
                        alterraObj.alterraTxItems.length != 0) {
                        saleTx.alterraObj = alterraObj.alterraTxItems;
                        ALTERRA.saveAlterraTransaction(saleTx);
                    }

                    alterraTempObj = null;
                }
            },
            function(error) {
                uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
                promptSysMsg(getMsgValue('prompt_msg_order_failed') + JSON.stringify(error), 'SALE');
            }
        );
    } else {
        alterraTxItem = alterraObj.alterraTxItems[processAlterraStdSleCntr];
        alterraTxItem.transactionDate = new Date();
        ++processAlterraStdSleCntr;

        console.log("alterra tx item");
        console.log(alterraTxItem);

        if (alterraTxItem.transactionType.toUpperCase() == "TOPUP") {
            var alterraProduct = ALTERRA.getAlterraProduct(alterraTxItem.name);
            var data = {
                cmd: "topup",
                seqAlterraNum: alterraTxItem.refTxItemOrder,
                name: alterraTxItem.name,
                customerNumber: alterraTxItem.phoneNum,
                productId: alterraProduct.result.product_id
                    // productId: 9
            };
            var response = ALTERRA.sendAlterraRequest(data);
            console.log("ALTERRA REQUEST");
            console.log(response);
            if (response) {
                if (response.error) {
                    alterraTxItem.scrMessage = response.error;
                    alterraTxItem.resMessage = response.error;
                    alterraTxItem.serverTrxId = response.serverTrxId;
                    alterraTxItem.partnerTrxId = response.serverTrxId;
                    alterraTxItem.resCode = response.resCode;
                } else {
                    var alterraItem = response.result;
                    alterraTxItem.resCode = alterraItem.rescode;
                    alterraTxItem.customerId = alterraItem.hp;
                    alterraTxItem.productId = data.productId;
                    alterraTxItem.serverTrxId = alterraItem.server_trxid;
                    alterraTxItem.partnerTrxId = alterraItem.partner_trxid;
                    alterraTxItem.scrMessage = alterraItem.scrmessage;
                    alterraTxItem.resMessage = alterraItem.resmessage;
                    alterraTxItem.serialNumber = alterraItem.serial_number;
                    alterraTxItem.trxTime = alterraItem.created;
                    var msg = alterraItem == null ? "Parse error on topup response." : alterraItem.scrMessage;
                }
                var alterraRes = {
                    alterraItem: cloneObject(alterraTxItem),
                    refTxItem: cloneObject(saleTx.orderItems[alterraTxItem.refTxItemOrder])
                };

                alterraTempObj.alterraItem = cloneObject(alterraTxItem);
                alterraTempObj.refTxItem = cloneObject(saleTx.orderItems[alterraTxItem.refTxItemOrder]);

                if (isHcEnabled) {
                    Hypercash.queuedAlterraToPrint.push(setReceiptAlterraInfo(alterraRes, false, false, true, false, false));
                } else {
                    printReceipt({
                        alterraInfo: setReceiptAlterraInfo(alterraRes, false, false, true, false, false)
                    });
                }

                renderAlterraInfo(alterraRes, false, false, true, false, false);
            }
            ALTERRA.processAlterraTransaction();
        } else if (alterraTxItem.transactionType.toUpperCase() == "RETUR") {
            var data = {
                cmd: "retur",
                seqAlterraNum: alterraTxItem.refTxItemOrder,
                serverTxId: alterraTxItem.serverTxId,
                storeId: alterraTxItem.storeId,
                posId: alterraTxItem.posId
            };
            console.log("RETUR DATA");
            console.log(alterraTxItem);
            response = ALTERRA.sendAlterraRequest(data);
            console.log(response);
            if (response) {
                var alterraMsg = "";
                if (response.errmsg) {
                    alterraTxItem.scrMessage = response.error;
                    alterraTxItem.resMessage = response.error;
                    alterraTxItem.serverTrxId = response.serverTrxId;
                    alterraTxItem.partnerTrxId = response.serverTrxId;
                    alterraTxItem.resCode = response.resCode;
                } else {
                    var alterraItem = response.result;
                    alterraTxItem.transactionType = data.cmd.toUpperCase();
                    alterraTxItem.resCode = alterraItem.rescode;
                    alterraTxItem.customerId = alterraItem.hp;
                    if (typeof alterraItem.vtype != 'object') {
                        alterraTxItem.vType = alterraItem.vtype;
                    }
                    alterraTxItem.serverTrxId = alterraItem.server_trxid;
                    alterraTxItem.partnerTrxId = alterraItem.partner_trxid;
                    alterraTxItem.scrMessage = alterraItem.scrmessage;
                    alterraTxItem.resMessage = alterraItem.resmessage;
                    alterraTxItem.serialNumber = alterraItem.sn;
                    alterraTxItem.trxTime = alterraItem.trxtime;
                    var msg = alterraItem == null ? "Parse error on topup response." : alterraItem.scrMessage;
                }
                var alterraRes = {
                    alterraItem: cloneObject(alterraTxItem),
                    refTxItem: cloneObject(saleTx.orderItems[alterraTxItem.refTxItemOrder])
                };

                if (isHcEnabled) {
                    Hypercash.queuedAlterraToPrint.push(setReceiptAlterraInfo(alterraRes, false, false, true, false, false));
                } else {
                    printReceipt({
                        alterraInfo: setReceiptAlterraInfo(alterraRes, false, false, true, false, false)
                    });
                }

                renderAlterraInfo(alterraRes, false, false, true, false, false);
            }
            ALTERRA.processAlterraTransaction();
        } else {
            ALTERRA.processAlterraTransaction();
        }
    }
}

ALTERRA.getAlterraValue = function(name) {
    if (name.indexOf('10K') !== -1 || name.indexOf('10 RIBU') !== -1 || name.indexOf('10 RB') !== -1) {
        return 10000;
    } else if (name.indexOf('15K') !== -1 || name.indexOf('15 RIBU') !== -1 || name.indexOf('15 RB') !== -1) {
        return 15000;
    } else if (name.indexOf('20K') !== -1 || name.indexOf('20 RIBU') !== -1 || name.indexOf('20 RB') !== -1) {
        return 20000;
    } else if (name.indexOf('25K') !== -1 || name.indexOf('25 RIBU') !== -1 || name.indexOf('25 RB') !== -1) {
        return 25000;
    } else if (name.indexOf('50K') !== -1 || name.indexOf('50 RIBU') !== -1 || name.indexOf('50 RB') !== -1) {
        return 50000;
    } else if (name.indexOf('100K') !== -1 || name.indexOf('100 RIBU') !== -1 || name.indexOf('100 RB') !== -1) {
        return 100000;
    } else if (name.indexOf('150K') !== -1 || name.indexOf('150 RIBU') !== -1 || name.indexOf('150 RB') !== -1) {
        return 150000;
    } else if (name.indexOf('200K') !== -1 || name.indexOf('200 RIBU') !== -1 || name.indexOf('200 RB') !== -1) {
        return 200000;
    } else if (name.indexOf('250K') !== -1 || name.indexOf('250 RIBU') !== -1 || name.indexOf('250 RB') !== -1) {
        return 250000;
    } else if (name.indexOf('500K') !== -1 || name.indexOf('500 RIBU') !== -1 || name.indexOf('500 RB') !== -1) {
        return 500000;
    } else if (name.indexOf('1000K') !== -1 || name.indexOf('1 JUTA') !== -1 || name.indexOf('1 M') !== -1 || name.indexOf('1 JT') !== -1) {
        return 1000000;
    } else {
        return null;
    }
}

ALTERRA.getAlterraProduct = function(name) {
    var amount = ALTERRA.getAlterraValue(name);

    var data = {
        name: name,
        amount: amount
    };

    console.log(data);

    var result = null;
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/alterra/product',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 10000,
        beforeSend: function() {
            $("#loadingDialogMessage").html("Get Alterra Product");
            $("#loading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "Response: " + JSON.stringify(response));
            result = response;
        },
        error: function(jqXHR, status, error) {
            result = error;
            uilog("DBUG", "Error: " + error);
        },
        complete: function(jqXHR, status) {
            $("#loading-dialog").dialog("close");
        }
    });

    return result;
}

ALTERRA.saveAlterraTransaction = function(data) {
    return $.ajax({
        url: posWebContextPath + "/cashier/saveAlterraTransaction/" + saleTx.transactionId,
        type: "POST",
        async: false,
        dataType: "json",
        contentType: "application/json",
        // data : JSON.stringify(data), --calculate the change
        data: JSON.stringify(PAYMENT_MEDIA.finalizeSaleTxLastPaymentAmount(data)),
        success: function(response) {
            uilog("DBUG", "Alterra saved.");
        },
        error: function(jqXHR, status, error) {
            showMsgDialog("Saving of Alterra Tx failed: " + error, "error");
        }
    });
}

ALTERRA.findAlterraTransaction = function(txnId, alterraId) {
    var alterra = null;
    $.ajax({
        url: posWebContextPath + "/cashier/alterra/getAlterraTxn/" + txnId + "/" + alterraId,
        type: "GET",
        async: false,
        dataType: "json",
        contentType: "application/json",
        success: function(response) {
            console.log(response);
            if (jQuery.isEmptyObject(response))
                uilog("DBUG", "Alterra Transaction is un-available");
            else {
                uilog("DBUG", "Alterra Transaction is searchable.");
                alterra = response;
            }
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", "Alterra Transaction Not Found");
        }
    });
    return alterra;
}
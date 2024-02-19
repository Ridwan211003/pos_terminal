//BPJS Procedures defines here
//Jangan lupa item typenya diisi BPJS_KS_P yaa!!!
var BPJS = BPJS || {};

BPJS.CONSTANTS = {};

BPJS.CONFIG = function() {
    var bpjsUid = getConfigValue('BPJS_KS_MID');
    var bpjsPin = getConfigValue('BPJS_KS_PIN');
    var bpjsUrl = getConfigValue('BPJS_KS_URL');
    var bpjsType = getConfigValue('BPJS_KS_ITEM_TYPE');
    var config = {
        UID: bpjsUid,
        PIN: bpjsPin,
        URL: bpjsUrl,
        ITEM_TYPE: bpjsType,
        SHORT_DESC: "BPJS KS"
    }
    return config;
}

BPJS.REQUEST_TYPE = {
    LOGIN: "do_login",
    AVL_PROD: "get_available_product",
    INQUIRY: "do_inquiry",
    PAYMENT: "do_payment",
    ADVICE: "do_advice"
};

var GenerateBPJSRequestParam = function(reqType) {
    this.uid = BPJS.CONSTANTS.UID;
    this.salt = getUuid();
    this.hash = $.md5(this.salt + BPJS.CONSTANTS.PIN);
    for (var prop in reqType) {
        this[prop] = reqType[prop];
    }
}

var LoginBPJSParam = function() {
    this.url = BPJS.CONSTANTS.URL + BPJS.REQUEST_TYPE.LOGIN;
    this.requestType = BPJS.REQUEST_TYPE.LOGIN;
}

var AvailProdBPJSParam = function() {
    this.url = BPJS.CONSTANTS.URL + BPJS.REQUEST_TYPE.AVL_PROD;
    this.requestType = BPJS.REQUEST_TYPE.AVL_PROD;
}

var InquiryBPJSParam = function(accountnumber, periode, mobilephone = null) {
    this.url = BPJS.CONSTANTS.URL + BPJS.REQUEST_TYPE.INQUIRY;
    this.requestType = BPJS.REQUEST_TYPE.INQUIRY;
    this.item_type = BPJS.CONSTANTS.ITEM_TYPE;
    this.accountnumber = accountnumber;
    if (mobilephone != null) {
        this.mobilephone = mobilephone;
    }
    if (periode != null) {
        this.periode = periode;
    }
}

var PaymentBPJSParam = function(sessionid, totalamount) {
    this.url = BPJS.CONSTANTS.URL + BPJS.REQUEST_TYPE.PAYMENT;
    this.requestType = BPJS.REQUEST_TYPE.PAYMENT;
    this.sessionid = sessionid;
    this.totalamount = totalamount;
}

var AdviceBPJSParam = function(sessionid) {
    this.url = BPJS.CONSTANTS.URL + BPJS.REQUEST_TYPE.ADVICE;
    this.requestType = BPJS.REQUEST_TYPE.ADVICE;
    this.sessionid = sessionid;
}

BPJS.canDoTransaction = function(amount) {
    var balance = getBalance();
    if (amount <= balance) {
        return true;
    } else {
        return false;
    }
}

function getBalance() {
    var response = BPJS.login();
    var balance = 0;
    if (response.return.balance != null) {
        balance = parseInt(response.return.balance);
    }
    return balance;
}

BPJS.isBpjsTransaction = function() {
    if (!jQuery.isEmptyObject(saleTx.bpjs) && saleTx.shortDesc == BPJS.CONSTANTS.SHORT_DESC) {
        return true;
    }
    return false;
};

BPJS.login = function() {
    var data = JSON.stringify(new GenerateBPJSRequestParam(new LoginBPJSParam()));

    var result = null;
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/bpjs/process',
        data: data,
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 5000,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_bpjs"));
            $("#bpLoading-dialog").dialog("open");
        },
        //timeout: ??, //30sec
        success: function(response) {
            uilog("DBUG", "BPJS login response: " + JSON.stringify(response));
            $("#bpLoading-dialog").dialog("close");
            result = response;
            var responseLoginStatus = response.return;

        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", "BPJS login error: " + error);
            //Error here
            $("#bpLoading-dialog").dialog("close");
        }
    });
    return result;
}

BPJS.getAvailableProducts = function() {
    var data = JSON.stringify(new GenerateBPJSRequestParam(new AvailProdBPJSParam()));
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/bpjs/process',
        data: data,
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 5000,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_bpjs"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "BPJS getAvailableProducts response: " + JSON.stringify(response));
            var itemType = BPJS.item_type;
            var responseAvailableProduct = response.return.itemType;
            response = responseAvailableProduct;
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", "BPJS getAvailableProducts error: " + error);
            response = ex;
            console.log("ERROR: ");
            console.log(ex);
            uilog('DBUG', "Error: " + ex);
            $("#bpLoading-dialog").dialog("close");
        }
    });
    return response;
}

BPJS.inquiry = function(accountnumber, periode) {
    var sessionid = "";
    var data = JSON.stringify(new GenerateBPJSRequestParam(new InquiryBPJSParam(accountnumber, periode)));
    uilog('DBUG', "data inquiry");
    uilog('DBUG', data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/bpjs/process',
        data: data,
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 30000,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_bpjs"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "BPJS inquiry response: " + JSON.stringify(response));
            var resp = response.return.responsecode;
            if (resp == "0000" || resp == "00" || resp == "0") {
                if (response.return.sessionid != null) {
                    sessionid = response.return.sessionid;
                }
                $("#bpjs-info-dialog").data("bpjsInfo", response).dialog("open");
                $("#bpLoading-dialog").dialog("close");
                displayBpjsInfo(response);
                CustomerPopupScreen.cus_showBPJS(response);
                CustomerPopupScreen.cus_showBPJSDialog(response);
                return response;
            } else {
                $("#bpLoading-dialog").dialog("close");
                $("#bpjs-payment-dialog").data("bpjsFail", response).dialog("open");
            }

        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", "BPJS inquiry error: " + error);
            //Error here
            $("#bpLoading-dialog").dialog("close");
            $("#eleboxTimeout-dialog").dialog("open");
        }
    });
    return sessionid;
}

BPJS.payment = function(sessionId, totalamount) {
    var responsed = null;
    BPJS.CONSTANTS = BPJS.CONFIG();
    var data = JSON.stringify(new GenerateBPJSRequestParam(new PaymentBPJSParam(sessionId, totalamount)));
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/bpjs/process',
        data: data,
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 30000,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_bpjs"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            $("#bpLoading-dialog").dialog("close");
            uilog('DBUG', "Response Payment : " + JSON.stringify(response));
            var getStatAdvice = null;

            if (response.return.responsecode == "0000") {
                responsed = response;
            } else if (response.return == "timeout") {
                getStatAdvice = BPJS.getAdvice(sessionId);
                uilog('DBUG', "getStatAdvice 1 : " + JSON.stringify(getStatAdvice));
                if (getStatAdvice.return.responsecode == "0000" && getStatAdvice.return.biller_status == "SUCCESS") {
                    responsed = getStatAdvice;
                } else if (getStatAdvice.return == "timeout" || getStatAdvice.return.biller_status == "FAILED") {
                    getStatAdvice = BPJS.getAdvice(sessionId);
                    uilog('DBUG', "getStatAdvice 2 : " + JSON.stringify(getStatAdvice));
                    if (getStatAdvice.return.responsecode == "0000" && getStatAdvice.return.biller_status == "SUCCESS") {
                        responsed = getStatAdvice;
                    } else if (getStatAdvice.return == "timeout" || getStatAdvice.return.biller_status == "FAILED") {
                        getStatAdvice = BPJS.getAdvice(sessionId);
                        uilog('DBUG', "getStatAdvice 3 : " + JSON.stringify(getStatAdvice));
                        if (getStatAdvice.return.responsecode == "0000" && getStatAdvice.return.biller_status == "SUCCESS") {
                            responsed = getStatAdvice;
                        } else {
                            $("#bpjs-payment-dialog").data("bpjsFail", getStatAdvice).dialog("open");
                        }
                    } else {
                        $("#bpjs-payment-dialog").data("bpjsFail", getStatAdvice).dialog("open");
                    }
                } else {
                    $("#bpjs-payment-dialog").data("bpjsFail", getStatAdvice).dialog("open");
                }
            } else {
                $("#bpjs-payment-dialog").data("bpjsFail", response).dialog("open");
            }
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", "BPJS payment error: " + error);
            $("#bpLoading-dialog").dialog("close");
        }
    });
    return responsed;
}

BPJS.getAdvice = function(sessionId) {
    //var sessionid = inquiry(accountnumber, periode, mobilephone);
    var data = JSON.stringify(new GenerateBPJSRequestParam(new AdviceBPJSParam(sessionId)));
    var responsed = null;
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/bpjs/process',
        data: data,
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 30000,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_bpjs"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "BPJS getAdvice response: " + JSON.stringify(response));
            //Success response here
            responsed = response;
            //$("#bpjs-advice-dialog").data("adviceInfo", response).dialog("open");
            $("#bpLoading-dialog").dialog("close");
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", "BPJS getAdvice error: " + error);
            //Error here
        }
    });

    return responsed;
}

function getUuid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

function parseName(strName) {
    var arrName = strName.split(",");
    console.log(arrName);
    if (arrName.length > 1) {
        var nName = "";
        for (var i = 0; i < arrName.length - 1; i++) {
            var siName = arrName[i];
            var tiName = siName.trim();
            nName += tiName;
            if (i < arrName.length - 1) {
                nName += ";";
            }
        }
        console.log(nName);
        return nName;
    } else {
        return strName;
        console.log(strName);
    }
}

BPJS.getItemInfo = function(bpjsInfo) {
    var bpjsItemInfo = [];

    if (bpjsInfo) {
        var bpjs = $("#bpjs-info-dialog").data("bpjsInfo");
        if (typeof bpjs == 'undefined' && typeof bpjsInfo.bpjs != 'undefined') {
            uilog("DBUG", "Recal txn BPJS");
            bpjs = bpjsInfo.bpjs;
        }
        var sessionid = bpjs.return.sessionid;
        var priceUnit = bpjs.return.totalamount;
        var accountnumber = bpjs.return.accountnumber;
        var chart_table = bpjs.return.chart_table;
        var denominasi = bpjs.return.chart_table;
        var totalamount = denominasi.split("\n");
        var admin = totalamount[6].split(":");
        var adminFee = admin[1].replace(" ", "");
        var replaces = chart_table.replace(/[<]/gi, " <").replace(/[>]/gi, "> ").replace("bulan", "Bulan");
        var after = replaces.replace(" <b>  ", "").replace(/[</b>]/g, "");
        replaces = after.split("\n");
        var itemInfo = {
            transactionId: saleTx.transactionId,
            type: CONSTANTS.TX_TYPES.BPJS.name,
            posTerminalId: BPJS.posTerminal,
            storeCd: saleTx.storeCd,
            store: "",
            posSession: {
                posSessionId: BPJS.sessionId,
                userId: BPJS.userId,
            },
            userId: BPJS.userId,
            userName: BPJS.userName,
            totalQuantity: 1,
            priceUnit: priceUnit,
            quantity: 1,
            priceSubtotal: priceUnit,
            orderItems: BPJS.CONSTANTS.SHORT_DESC,
            orderId: accountnumber,
            qty: 1,
            info: chart_table,
            shortDesc: BPJS.CONSTANTS.SHORT_DESC,
            id: accountnumber,
            trialMode: false,
            memberDiscReversal: 0,
            supervisorInterventions: [],
            baseTransactionId: "",
            promotionItems: [],
            customerSatisfaction: 0,
            coBrandNumber: "",
            returnNoteNo: "",
            totalMdrSurcharge: 0,
            mlcSeq: 0,
            mlcReffNo: "",
            mlcQRCode: "",
            billPaymentItem: {
                transactionDate: saleTx.transactionDate,
                type: saleTx.shortDesc,
                transactionAgentId: sessionid,
                customerId: saleTx.id,
                paymentPeriod: replaces[4],
                netAmount: priceUnit,
                penaltyFee: 0,
                totalAmount: priceUnit,
                adminFee: adminFee,
                responseCode: "00",
                responseDescription: saleTx.status,
                referenceCode: saleTx.orderId,
                additionalInfo: replaces[4] + replaces[5] + replaces[6],
                customerName: parseName(replaces[2]),
                customerInfo: replaces[0] + replaces[1] + parseName(replaces[2]) + replaces[3],
                deadlineTime: "",
                itemType: "",
                policyNumber: "",
                status: "SUCCESS",
            }
        }

        if (typeof bpjs != 'undefined') {
            itemInfo.bpjs = bpjs;
        }

    }

    uilog("DBUG", "getItemInfo itemInfo: " + JSON.stringify(itemInfo));
    bpjsItemInfo.push(itemInfo);
    return bpjsItemInfo;
}

BPJS.processBpjsTransaction = function(param) {
    var bpjs = param.bpjs; //$("#bpjs-info-dialog").data("bpjsInfo");
    uilog("DBUG", "processBpjsTransaction param: " + JSON.stringify(param));
    uilog("DBUG", "processBpjsTransaction bpjs data: " + JSON.stringify(bpjs));
    var sessionId = bpjs.return.sessionid;
    var denominasi = bpjs.return.chart_table;
    var totalamount = denominasi.split("\n");
    var admin = totalamount[6].split(":");
    var adminFee = admin[1].replace(" ", "");

    var requestResponse = this.payment(sessionId, saleTx.priceUnit);

    uilog('DBUG', requestResponse);
    if (requestResponse) {
        if (requestResponse.return.responsecode == "0000") {
            saleTx.type = CONSTANTS.TX_TYPES.BILL_PAYMENT.name;
            saleTx.status = 'SUCCESS';
            var info = saleTx.info;
            var replaces = info.replace(/[<]/gi, " <").replace(/[>]/gi, "> ").replace("bulan", "Bulan");
            var after = replaces.replace(" <b>  ", "").replace(/[</b>]/g, "");
            replaces = after.split("\n");
            var periode = replaces[4].split(":");
            var nama = parseName(replaces[2].replace("Nama : ", ""));
            nama = nama.split(":");
            var chunk = replaces[0] + replaces[1] + parseName(replaces[2]) + replaces[3] + replaces[4] + replaces[5] + replaces[6];
            chunk = chunkString(chunk.replace("'", "''").replace(";", "|"), 254);
            if (chunk.length == 1) {
                chunk[1] = "";
            }
            var trxIdBpjs = requestResponse.return.trxid;
            saleTx.billPaymentItem = {
                transactionDate: saleTx.transactionDate,
                type: saleTx.shortDesc,
                transactionAgentId: sessionId,
                customerId: saleTx.id,
                paymentPeriod: periode[1].replace("Bulan", ""),
                netAmount: parseInt(saleTx.totalAmount) - parseInt(adminFee),
                penaltyFee: 0,
                totalAmount: saleTx.totalAmount,
                adminFee: adminFee,
                responseCode: requestResponse.return.responsecode,
                responseDescription: saleTx.status,
                referenceCode: saleTx.orderId + ", " + trxIdBpjs,
                additionalInfo: chunk[1],
                customerName: nama[1],
                customerInfo: chunk[0],
                deadlineTime: "",
                itemType: "",
                policyNumber: "",
                status: "SUCCESS",
            }

            console.log("processBpjsTransaction cek disini: " + JSON.stringify(saleTx));

            try {
                RETURN_REFUND.return.service.saveCouponReturnData();
            } catch (err) {
                console.log("Save coupon return data error");
                console.log(err);
            }

            saveOrder(CONSTANTS.STATUS.COMPLETED, function(data) {
                if (data && data.error) {
                    promptSysMsg('Order failed.' + JSON.stringify(data.error), 'SALE');
                } else {
                    uilog('DBUG', "Masuk setelah save order");
                    saleTx.type = CONSTANTS.TX_TYPES.BPJS.name;
                    renderScreenReceiptSummary();
                    renderCustomerFeedbackDialog();
                    DrawerModule.validateTxnToOpenDrawer();
                    renderOrderSummaryDialog();
                    var detailsToPrint = {
                        summary: setReceiptSummary(saleTx),
                        footerSummary: setReceiptFooterSummary(saleTx),
                        footer: setReceiptFooter(saleTx),
                        mktInfo: setReceiptMarketingPromoInfo(saleTx),
                        balloonGame: setReceiptBalloonGame(saleTx),
                        freeParking: setReceiptFreeParking(saleTx),
                        isInstallmentTransaction: isInstallmentTransaction,
                        couponData: (saleTx.type != 'RETURN') ? {} : setCouponSummary(saleTx)
                    };
                    // Print header and body first before printing summary if hypercash enabled
                    if (isHcEnabled) {
                        Hypercash.printer.printTransactionWithHeaderAndBody(detailsToPrint);
                    } else {
                        printReceipt(detailsToPrint);
                    }
                    $("#bpjsAdvice-dialog").dialog('close');
                }
            }, function(error) {
                uilog('DBUG', 'FAIL: ' + error);
            });

        } else {
            //TODO: process error here
            saleTx.bpjs.status = 'FAILED';
            if (response.responseCode && response.responseDescription) {
                showMsgDialog(getMsgValue("bp_error_response").format(response.responseCode, response.responseDescription), "error");
            }

            saleTx.payments = [];
            saleTx.totalAmountPaid = 0;
        }
    } else {
        saleTx.bpjs.status = 'FAILED';
        saleTx.payments = [];
        saleTx.totalAmountPaid = 0;
    }
}
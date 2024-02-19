var SIMPATINDO = SIMPATINDO || {};

SIMPATINDO.CONFIG = function() {
    var config = {
        channelId: getConfigValue('TOPUP_CHANNEL_ID'),
        storeId: saleTx.storeCd.toLowerCase(),
        posId: saleTx.posSession.posSessionId.toLowerCase(),
        serverSecretKey: getConfigValue('TOPUP_SERVER_SECRET_KEY'),
        pin: getConfigValue('TOPUP_PIN'),
        partnerTrxId: saleTx.transactionId.toLowerCase(),
        cashierId: saleTx.userName.toLowerCase(),
        url: getConfigValue('TOPUP_MAIN_URL'),
        serverTrxId: '',
        trxtime: SIMPATINDO.formatSimpatindoTxDateTime(new Date())
    }
    return config;
}

// SIMPATINDO.CONFIG = function() {
//     var config = {
//         channelId: 'acrs',
//         storeId: '099',
//         posId: '1',
//         serverSecretKey: '123456',
//         pin: '7789',
//         partnerTrxId: saleTx.transactionId.toLowerCase(),
//         cashierId: saleTx.userName.toLowerCase(),
//         url: 'http://117.102.102.50:7123/h2h.php',
//         serverTrxId: '',
//         trxtime: SIMPATINDO.formatSimpatindoTxDateTime(new Date())
//     }
//     return config;
// }

SIMPATINDO.LIST_PREPAID_DEV = {
    PLN: '332211',
    GOPAY: 'gopay'
}

SIMPATINDO.LIST_POSTPAID_DEV = {
    PLN: '112233',
    PDAM: 'pdam',
    BPJS: 'cmsbpjs'
}

SIMPATINDO.getVTypeDev = function(name, type) {
    console.log("Nama : " + name);
    var nameType = SIMPATINDO.getVTypeNameDev(name);
    console.log("Name : " + nameType);

    if (type == 'POSTPAID') {
        return SIMPATINDO.LIST_POSTPAID_DEV[nameType];
    } else {
        if (nameType == 'PLN') {
            return SIMPATINDO.LIST_PREPAID_DEV['PLN'];
        } else {
            return SIMPATINDO.LIST_PREPAID_DEV[nameType] + SIMPATINDO.getVTypeValue(name);
        }
    }
}

SIMPATINDO.getVTypeName = function(name) {
    var nameLower = name.toLowerCase();
    console.log("Name lower case : " + nameLower);
    if (nameLower.indexOf('bpjs') !== -1) {
        return 'BPJS';
    } else if (nameLower.indexOf('e-money') !== -1) {
        return 'E-MONEY';
    } else if (nameLower.indexOf('gopay') !== -1) {
        return 'GOPAY';
    } else if (nameLower.indexOf('hallo') !== -1) {
        return 'HALLO';
    } else if (nameLower.indexOf('indovision') !== -1) {
        return 'INDOVISION';
    } else if (nameLower.indexOf('ok vision') !== -1) {
        return 'OK VISION';
    } else if (nameLower.indexOf('ovo') !== -1) {
        return 'OVO';
    } else if (nameLower.indexOf('pdam') !== -1) {
        return 'PDAM';
    } else if (nameLower.indexOf('pln') !== -1) {
        return 'PLN';
    } else if (nameLower.indexOf('tap cash bni') !== -1) {
        return 'TAP CASH BNI';
    } else if (nameLower.indexOf('top tv') !== -1) {
        return 'TOP TV';
    } else if (nameLower.indexOf('transvision') !== -1) {
        return 'TRANSVISION';
    } else if (nameLower.indexOf('wom finance') !== -1) {
        return 'WOM';
    } else if (nameLower.indexOf('xplor') !== -1) {
        return 'XPLOR';
    } else {
        return false;
    }
}

SIMPATINDO.getVTypeValueDev = function(name) {
    var name = name.toLowerCase();
    if (name.indexOf('10K')) {
        return '10';
    } else if (name.indexOf('20K')) {
        return '20';
    } else if (name.indexOf('25K')) {
        return '25';
    } else if (name.indexOf('50K')) {
        return '50';
    } else if (name.indexOf('100K')) {
        return '100';
    } else if (name.indexOf('150K')) {
        return '150';
    } else if (name.indexOf('200K')) {
        return '200';
    } else if (name.indexOf('250K')) {
        return '250';
    } else {
        return false;
    }
}

SIMPATINDO.getVType = function(item) {
    return item.item_code;
}

SIMPATINDO.paymentType = function(currentPrice) {
    return currentPrice == '1' ? 'POSTPAID' : 'PREPAID';
}

SIMPATINDO.isSimpatindoItem = function(item) {
    if (item.categoryId == CONSTANTS.TX_TYPES.SIMPATINDO.name || item.categoryId == '8') {
        return true;
    } else {
        return false;
    }
}

SIMPATINDO.findSimpatindoItemByBarcode = function(barcode) {
    var item = findItem(barcode);
    var returnedItem = {};

    if (item) {
        if (SIMPATINDO.isSimpatindoItem(item)) {
            returnedItem.type = SIMPATINDO.paymentType(item.currentPrice);
            returnedItem.name = item.shortDesc;
            returnedItem.object = item;
            returnedItem.tempPrice = item.currentPrice;
            returnedItem.vtype = item.sku;
            // returnedItem.vtype = item.sku.substring(0, item.sku.length - 3);
            console.log("Returned item");
            console.log(returnedItem);
            return returnedItem;
        } else {
            showMsgDialog("Invalid Simpatindo Item.", "error");
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Function that will format datetime used by topup param.
 * @returns String representation of the formatted datetime.
 */
SIMPATINDO.formatSimpatindoTxDateTime = function(date) {
    var dateStr = $.datepicker.formatDate("yymmdd", date);
    var hours = (date.getHours() < 10 ? "0" : "") + date.getHours();
    var minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    var seconds = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
    return dateStr + hours + minutes + seconds;
}

SIMPATINDO.ajax = {}

SIMPATINDO.ajax.genericBody = function(tx, data) {
    var config = SIMPATINDO.CONFIG();
    // config.partnerTrxId = tx.transactionId.toLowerCase();
    // config.cashierId = tx.userName.toLowerCase();
    // config.storeId = tx.storeCd.toLowerCase();
    // config.posId = tx.posSession.posSessionId.toLowerCase();

    console.log("Item data : ");
    console.log(data);

    if (data != undefined) {
        if (typeof data == 'object') {
            config.customerId = data.id || data.subscriber_id || data.customer_id;
            config.customerNo = data.no || data.hp || data.customer_no;
            config.vType = data.vtype || data.vType;

            if (data.type == 'POSTPAID') {
                config.additional = data.period;
            }
        } else {
            config.partnerTrxId = data;
        }
    }


    return config;
}

SIMPATINDO.ajax.returnGeneral = function(result) {
    if (result && typeof result == 'object') {
        return SIMPATINDO.xmlToJson(result);

    } else {
        return result;
    }
}

SIMPATINDO.ajax.saveGeneral = function(data, command) {
    var result = null;
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/simpatindo/' + command,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 10000,
        success: function(response) {
            uilog("DBUG", "Simpatindo save " + command + " response: " + JSON.stringify(response));
            result = response;
        },
        error: function(jqXHR, status, error) {
            result = error;
            uilog("DBUG", "Simpatindo save " + command + " error: " + error);
        }
    });
    return result;
}

SIMPATINDO.ajax.getSimpatindoTransaction = function(data) {
    var result = null;
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/simpatindo/getSimpatindoTransaction',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 10000,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_simpatindo_inquiry"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "Simpatindo inquiry response: " + JSON.stringify(response));
            result = response;
        },
        error: function(jqXHR, status, error) {
            result = error;
            uilog("DBUG", "Simpatindo inquiry error: " + error);
        },
        complete: function(jqXHR, status) {
            $("#bpLoading-dialog").dialog("close");
        }
    });
    return result;
}

SIMPATINDO.ajax.genericParameter = function(data) {
    var command = data['cmd'];
    var serverTxId = "";

    if (command == 'inquiry') {
        serverTxId = data['storeId'] + data['posId'] + data['partnerTrxId'];
    }

    var params = {
        channelid: getConfigValue("TOPUP_CHANNEL_ID"),
        posid: data['posId'],
        password: $.md5($.md5(getConfigValue("TOPUP_PIN") +
                getConfigValue("TOPUP_SERVER_SECRET_KEY") + serverTxId + data['partnerTrxId']) +
            $.md5(getConfigValue("TOPUP_CHANNEL_ID") + data['storeId'] +
                data['posId'] + data['trxtime'])),
        cmd: data['cmd'],
        trxtime: data['trxtime'],
        storeid: data['storeId'],
        cashierid: data['cashierId'],
        hp: data['customerNo'],
        vtype: data['vType'],
        partner_trxid: data['partnerTrxId'],
        subscriber_id: data['customerId'],
        server_trxid: serverTxId
    };

    if (command == 'confirm') {
        params.order_trxid = data['orderTrxId'];
    }

    return params;
}

SIMPATINDO.ajax.order = function(data) {
    var url = data['url'];

    var params = SIMPATINDO.ajax.genericParameter(data);

    console.log(params);

    var result = null;

    $.ajax({
        url: proxyUrl + "/simpatindoRequest",
        type: "GET",
        data: {
            topupUrl: url,
            params: params,
            timeout: Number(getConfigValue("SIMPATINDO_TIME_OUT"))
        },
        async: false,

        // url: posWebContextPath + '/cashier/simpatindoDev/order',
        // type: 'POST',
        // async: false,
        // dataType: 'json',
        // contentType: "application/json",
        // data: JSON.stringify(params),

        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_simpatindo_order"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "Simpatindo order response: " + JSON.stringify(response));
            result = response;
        },
        error: function(jqXHR, status, error) {
            result = error;
            uilog("DBUG", "Simpatindo order error: " + error);
        },
        complete: function(jqXHR, status) {
            $("#bpLoading-dialog").dialog("close");
        },

    });
    console.log(result);

    return SIMPATINDO.ajax.returnGeneral(result);
    // return result;
}

SIMPATINDO.ajax.confirm = function(data) {
    var url = data['url'];

    var params = SIMPATINDO.ajax.genericParameter(data);

    console.log(params);

    var result = "TIMEOUT";

    console.log("Send confirm ");
    console.log(params);

    $.ajax({
        url: proxyUrl + "/simpatindoRequest",
        type: "GET",
        async: false,
        data: {
            topupUrl: url,
            params: params,
            timeout: Number(getConfigValue("SIMPATINDO_TIME_OUT"))
        },

        // url: posWebContextPath + '/cashier/simpatindoDev/confirm',
        // type: 'POST',
        // async: false,
        // dataType: 'json',
        // contentType: "application/json",
        // data: JSON.stringify(params),

        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_simpatindo_confirm"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "Simpatindo confirm response: " + JSON.stringify(response));
            result = response;
        },
        error: function(jqXHR, status, error) {
            result = error;
            uilog("DBUG", "Simpatindo confirm error: " + error);
        },
        complete: function(jqXHR, status) {
            $("#bpLoading-dialog").dialog("close");
        },

    });
    console.log(result);

    return SIMPATINDO.ajax.returnGeneral(result);
    // return result;
}

SIMPATINDO.ajax.inquiry = function(data) {
    var url = data['url'];

    var params = SIMPATINDO.ajax.genericParameter(data);

    console.log(params);

    var result = null;

    $.ajax({
        url: proxyUrl + "/simpatindoRequest",
        type: "GET",
        async: false,
        data: {
            topupUrl: url,
            params: params,
            timeout: Number(getConfigValue("SIMPATINDO_TIME_OUT"))
        },
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_simpatindo_inquiry"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "Simpatindo inquiry response: " + JSON.stringify(response));
            result = response;
        },
        error: function(jqXHR, status, error) {
            result = error;
            uilog("DBUG", "Simpatindo inquiry error: " + error);
        },
        complete: function(jqXHR, status) {
            $("#bpLoading-dialog").dialog("close");
        },

    });
    console.log(result);
    return SIMPATINDO.ajax.returnGeneral(result);
}

SIMPATINDO.ajax.telcoPingTest = function(data) {
    var url = data['url'];

    var params = SIMPATINDO.ajax.genericParameter(data);

    console.log(params);

    var result = null;

    $.ajax({
        url: proxyUrl + "/simpatindoRequest",
        type: "GET",
        async: false,
        data: {
            topupUrl: url,
            params: params,
            timeout: Number(getConfigValue("SIMPATINDO_TIME_OUT"))
        },
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_simpatindo_status"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "Simpatindo telco ping response: " + JSON.stringify(response));
            result = response;
        },
        error: function(jqXHR, status, error) {
            result = error;
            uilog("DBUG", "Simpatindo telco ping error: " + error);
        },
        complete: function(jqXHR, status) {
            $("#bpLoading-dialog").dialog("close");
        },

    });
    console.log(result);
    return SIMPATINDO.ajax.returnGeneral(result);
}

SIMPATINDO.ajax.isValidForReturn = function(data) {
    var result = null;
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/simpatindo/isValidForReturn',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 10000,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html("Checking valid for return");
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "Simpatindo is valid for return response: " + JSON.stringify(response));
            result = response;
        },
        error: function(jqXHR, status, error) {
            result = error;
            uilog("DBUG", "Simpatindo is valid for return error: " + error);
        },
        complete: function(jqXHR, status) {
            $("#bpLoading-dialog").dialog("close");
        }
    });
    return result;
}

SIMPATINDO.order = function(tx, data) {
    var body = SIMPATINDO.ajax.genericBody(tx, data);
    body.cmd = 'order';
    console.log("Body : ");
    console.log(body);

    // // dev
    // var req = SIMPATINDO.ajax.order(body);
    // return req.result;

    //prod
    var req = SIMPATINDO.ajax.order(body);
    console.log(req);

    if (typeof req != 'object') {
        if (req == 'TIMEOUT') {
            return true;
        } else {
            showMsgDialog(req, "warning");
            return false;
        }
    } else {
        SIMPATINDO.parseParsedToJsonRecursively(req.response);
        var parsed = req.response;
        console.log("Parsed : ");
        console.log(parsed);
        var data = {
            body: body,
            response: parsed
        }
        console.log("Data ~ :");
        console.log(data);
        var reqSaved = SIMPATINDO.ajax.saveGeneral(data, "order");
        console.log("Req Saved");
        console.log(reqSaved);

        if (reqSaved && reqSaved.result) {
            return reqSaved.result;
        } else {
            if (reqSaved.errmsg) {
                showMsgDialog(reqSaved.errmsg, "warning");
            } else {
                showMsgDialog(reqSaved, "warning");
            }
            return false;
        }
    }
}

SIMPATINDO.confirm = function(tx, data) {
    console.log("Confirm data");
    console.log(data);

    var body = SIMPATINDO.ajax.genericBody(tx, data);
    body.cmd = 'confirm';
    body.id = data.id;
    body.orderTrxId = data.response.server_trxid;
    body.customerId = data.body.customerId;
    body.customerNo = data.body.customerNo;
    body.vType = data.body.vType;

    console.log("Data before send");
    console.log(body);

    // // dev
    // return {
    //     response: {
    //         rescode: 13,
    //         resmessage: 'ERROR',
    //         scrmessage: 'ERROR'
    //     },
    // };

    // prod
    var req = SIMPATINDO.ajax.confirm(body);
    console.log(req);
    if (typeof req != 'object') {
        if (req == 'TIMEOUT') {
            return true;
        } else {
            showMsgDialog(req, "warning");
            return false;
        }
    } else {
        SIMPATINDO.parseParsedToJsonRecursively(req.response);
        var parsed = req.response;
        console.log("Parsed : ");
        console.log(parsed);
        var data = {
            body: body,
            response: parsed,
            id: data.id
        }
        console.log("Data ~ :");
        console.log(data);
        var reqSaved = SIMPATINDO.ajax.saveGeneral(data, "confirm");
        console.log("Req Saved");
        console.log(reqSaved);

        if (reqSaved && reqSaved.result) {
            return reqSaved.result;
        } else {
            if (reqSaved.errmsg) {
                showMsgDialog(reqSaved.errmsg, "warning");
            } else {
                showMsgDialog(reqSaved, "warning");
            }
            return false;
        }
    }
}

SIMPATINDO.manualInquiry = function(tx, txId) {
    var req = SIMPATINDO.ajax.getSimpatindoTransaction({
        'partnerTrxId': txId
    });

    console.log("Result ");
    console.log(req);

    if (req && req.result) {
        var data = req.result[0];
        var body = SIMPATINDO.ajax.genericBody(tx, data);
        body.partnerTrxId = txId;
        body.cmd = 'inquiry';
        body.serverTrxId = data.order_trx_id;
        body.posId = data.pos_id;
        body.storeId = data.store_id;
        body.cashierId = data.cashier_id;
        console.log(body);
        var req = SIMPATINDO.ajax.inquiry(body);
        SIMPATINDO.parseParsedToJsonRecursively(req.response);
        var parsed = req.response;
        console.log(parsed);
        var data = {
            body: body,
            response: parsed,
            id: data.id
        }
        console.log("Data ~ :");
        console.log(data);
        var reqSaved = SIMPATINDO.ajax.saveGeneral(data, "inquiry");
        console.log("Req Saved");
        console.log(reqSaved);

        if (reqSaved && reqSaved.result) {
            return reqSaved.result;
        } else {
            if (reqSaved.errmsg) {
                showMsgDialog(reqSaved.errmsg, "warning");
            } else {
                showMsgDialog(reqSaved, "warning");
            }
            return false;
        }
    } else {
        showMsgDialog(req.errmsg, "warning");
        return false;
    }
}

SIMPATINDO.inquiry = function(tx, data) {
    console.log("Inquiry data ");
    console.log(data);
    var body = SIMPATINDO.ajax.genericBody(tx, data.body);
    body.orderTrxId = data.response.server_trxid;
    body.id = data.id;
    body.cmd = 'inquiry';
    body.hp = data.body.customerNo;
    body.subscriber_id = data.body.customerId;
    body.customerId = data.body.customerId;
    body.customerNo = data.body.customerNo;
    console.log(body);
    var req = SIMPATINDO.ajax.inquiry(body);
    if (req && typeof req == 'object') {
        SIMPATINDO.parseParsedToJsonRecursively(req.response);
        var parsed = req.response;
        console.log(parsed);
        return parsed;
    } else {
        if (req == 'TIMEOUT') {
            return true;
        } else {
            return false;
        }
    }
}

SIMPATINDO.telcoPingTest = function(tx) {
    var body = SIMPATINDO.ajax.genericBody(tx);
    body.cmd = 'pingtel';
    var req = SIMPATINDO.ajax.telcoPingTest(body);
    console.log(req);

    if (typeof req != 'object') {
        if (req == 'TIMEOUT') {
            return true;
        }
        showMsgDialog(req, "warning");
        return false;
    } else {
        console.log()
        SIMPATINDO.parseParsedToJsonRecursively(req.response);
        var parsed = req.response;
        console.log("Parsed : ");
        console.log(parsed);
        return parsed;
    }
}

SIMPATINDO.isValidForReturn = function(tx) {
    console.log("Inquiry data ");
    var body = {
        baseTransactionId: tx.baseTransactionId,
        categoryId: CONSTANTS.TX_TYPES.SIMPATINDO.name
    };
    console.log(body);
    var req = SIMPATINDO.ajax.isValidForReturn(body);
    console.log(req);
    if (req && req.result) {
        return req.result;
    } else {
        if (req.errmsg) {
            showMsgDialog(req.errmsg, "warning");
        } else {
            showMsgDialog(req, "warning");
        }
        return false;
    }
}

SIMPATINDO.getItemInfo = function(simpatindoInfo) {
    console.log("GET ITEM INFO");
    uilog("DBUG", "TEST");
    uilog("DBUG", simpatindoInfo);
    console.log(simpatindoInfo);
    console.log(saleTx);
    var simpatindoItemInfo = [];

    if (simpatindoInfo) {
        var simpatindo = $("#simpatindoOrder-dialog").data("orderResponse");
        if (typeof simpatindo == 'undefined' && typeof simpatindoInfo.simpatindo != 'undefined') {
            uilog("DBUG", "Recal txn SIMPATINDO");
            simpatindo = simpatindoInfo.simpatindo;
        }

        var amount = simpatindo.response.struk.amount;


        var priceUnit = simpatindo.type == 'PREPAID' ? (amount && amount > 0 ? parseInt(amount) : parseInt(simpatindo.tempPrice)) : parseInt(simpatindo.response.struk.jml);
        var netAmount = simpatindo.type == 'PREPAID' ? (amount && amount > 0 ? parseInt(amount) : parseInt(simpatindo.tempPrice)) - parseInt(simpatindo.response.struk.adm) : parseInt(amount);
        var penalty = "";

        if (simpatindo.response.struk.bill1) {
            if (typeof simpatindo.response.struk.bill1.denda == "object") {
                penalty = 0;
            } else {
                penalty = parseInt(simpatindo.response.struk.bill1.denda);
            }
        } else {
            penalty = 0;
        }

        var itemInfo = {
            transactionId: saleTx.transactionId,
            type: CONSTANTS.TX_TYPES.SIMPATINDO.name,
            posTerminalId: saleTx.posTerminalId,
            storeCd: saleTx.storeCd,
            store: "",
            posSession: {
                posSessionId: saleTx.posSession.posSessionId,
                userId: saleTx.posSession.userId,
            },
            userId: saleTx.userId,
            userName: saleTx.userName,
            totalQuantity: 0,
            priceUnit: priceUnit,
            quantity: 1,
            priceSubtotal: priceUnit,
            // orderItems: [],
            orderId: simpatindo.response.server_trxid,
            qty: 1,
            info: simpatindo.name,
            shortDesc: simpatindo.name,
            id: simpatindo.response.server_trxid,
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
                type: CONSTANTS.TX_TYPES.SIMPATINDO.name + "-" + SIMPATINDO.getVTypeName(simpatindo.name),
                transactionAgentId: simpatindo.response.server_trxid ? simpatindo.response.server_trxid : "",
                customerId: simpatindo.response.struk.sid ? simpatindo.response.struk.sid : "",
                paymentPeriod: simpatindo.response.struk.period ? simpatindo.response.struk.period : "",
                netAmount: netAmount ? netAmount : priceUnit - parseInt(simpatindo.response.struk.adm),
                penaltyFee: "",
                totalAmount: priceUnit,
                adminFee: parseInt(simpatindo.response.struk.adm),
                responseCode: simpatindo.response.rescode,
                responseDescription: simpatindo.response.scrmessage,
                referenceCode: simpatindo.response.struk.sref ? simpatindo.response.struk.sref : "",
                additionalInfo: simpatindo.response.resmessage ? simpatindo.response.resmessage : "",
                customerName: simpatindo.response.struk.name ? simpatindo.response.struk.name : "",
                customerInfo: simpatindo.body.hp ? simpatindo.body.hp : "",
                deadlineTime: "",
                itemType: SIMPATINDO.getVTypeName(simpatindo.name),
                policyNumber: "",
                status: "SUCCESS",
            }
        }

        console.log("Bill payment item");
        console.log(itemInfo.billPaymentItem);

        if (typeof simpatindo != 'undefined') {
            itemInfo.simpatindo = simpatindo;
        }

    }

    uilog("DBUG", "getItemInfo itemInfo: " + JSON.stringify(itemInfo));
    simpatindoItemInfo.push(itemInfo);
    return simpatindoItemInfo;
}

SIMPATINDO.saveSimpatindoItem = function(item) {
    console.log("SAVE SIMPATINDO ITEM :");
    console.log(item);
    var simpatindo = $("#simpatindoOrder-dialog").data("orderResponse");
    console.log(simpatindo);
    var simpatindoItemInfo = SIMPATINDO.getItemInfo(simpatindo);
    var id = item.id;
    var priceUnit = simpatindoItemInfo[0].priceUnit;
    var shortDesc = item.name;
    var renderProduct = {
        description: id,
        name: shortDesc,
        shortDesc: shortDesc,
        currentPrice: priceUnit
    }

    console.log("RENDER SCANNED ITEM");
    console.log(simpatindoItemInfo[0]);

    console.log("RENDER PRODUCT DETAILS");
    console.log(renderProduct);

    renderScannedItem(simpatindoItemInfo[0]);
    renderProductDetails(renderProduct);
    saleTx = simpatindoItemInfo[0];
    saleTx.type = CONSTANTS.TX_TYPES.SIMPATINDO.name;
    saleTx.payments = [];
    saleTx.sequence = 1;
    saleTx = $.extend(new CASHIER.SaleTx(), saleTx);
    // saleTx.totalAmount += saleTx.priceSubtotal;

    var scannedItem = item.object;
    scannedItem.currentPrice = priceUnit;
    scannedItem.priceUnit = priceUnit;
    scannedItem.priceSubtotal = priceUnit;
    scannedItem.weight = 0;
    scannedItem.isHotSpiceItem = false;
    console.log("SCANNED ITEM OBJECT");
    console.log(scannedItem);
    addScannedItem(scannedItem);

    uilog('DBUG', hasScannedItem(saleTx));
    saveTxn();
    renderTotal();
    if (!isHcEnabled) {
        printReceipt({
            header: setReceiptHeader(saleTx),
            body: setReceiptItems(saleTx,
                saleTx, { currency: "Rp" })
        });
    }
    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
}

SIMPATINDO.printSimpatindoTransaction = function(data) {
    promptSysMsg(getMsgValue('prompt_msg_order_completed') + removeLeadingZeroes(data), 'SALE');
    renderScreenReceiptSummary();
    renderCustomerFeedbackDialog();
    DrawerModule.validateTxnToOpenDrawer();
    renderOrderSummaryDialog();

    CustomerPopupScreen.cus_removeSimpatindoAdviceDialog();
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
}

SIMPATINDO.processSimpatindoTransaction = function(param) {
    var simpatindo = param.simpatindo; //$("#bpjs-info-dialog").data("bpjsInfo");
    uilog("DBUG", "processSimpatindoTransaction param: " + JSON.stringify(param));
    uilog("DBUG", "processSimpatindoTransaction simpatindo data: " + JSON.stringify(simpatindo));
    saleTx.type = CONSTANTS.TX_TYPES.BILL_PAYMENT.name;
    saleTx.status = 'SUCCESS';

    console.log($("#simpatindoOrder-dialog").data());
    var item = $("#simpatindoOrder-dialog").data("item").object;
    uilog("DBUG", "Item: " + JSON.stringify(item));

    var penalty = "";
    if (simpatindo.response.struk.bill1) {
        if (typeof simpatindo.response.struk.bill1.denda == "object") {
            penalty = 0;
        } else {
            penalty = parseInt(simpatindo.response.struk.bill1.denda);
        }
    } else {
        penalty = 0;
    }
    // saleTx.orderItems = [item];

    var netAmount = simpatindo.type == 'PREPAID' ? parseInt(simpatindo.response.struk.amount) - parseInt(simpatindo.response.struk.adm) : parseInt(simpatindo.response.struk.amount);

    saleTx.billPaymentItem = {
        transactionDate: saleTx.transactionDate,
        type: CONSTANTS.TX_TYPES.SIMPATINDO.name + "-" + SIMPATINDO.getVTypeName(param.shortDesc),
        transactionAgentId: simpatindo.response.server_trxid,
        customerId: simpatindo.response.struk.sid ? simpatindo.response.struk.sid : "",
        paymentPeriod: simpatindo.type == 'PREPAID' ? "" : simpatindo.response.struk.bill1.prd,
        netAmount: netAmount ? netAmount : parseInt(saleTx.totalAmount) - parseInt(simpatindo.response.struk.adm),
        penaltyFee: penalty,
        totalAmount: parseInt(saleTx.totalAmount),
        adminFee: parseInt(simpatindo.response.struk.adm),
        responseCode: simpatindo.response.rescode,
        responseDescription: simpatindo.response.scrmessage ? simpatindo.response.scrmessage : "",
        referenceCode: simpatindo.response.struk.sref ? simpatindo.response.struk.sref : "",
        additionalInfo: simpatindo.response.resmessage ? simpatindo.response.resmessage : "",
        customerName: simpatindo.response.struk.name ? simpatindo.response.struk.name : "",
        customerInfo: simpatindo.body.hp ? simpatindo.body.hp : "",
        deadlineTime: "",
        itemType: SIMPATINDO.getVTypeName(param.shortDesc),
        policyNumber: "",
        status: "SUCCESS",
    }

    console.log("processSimpatindoTransaction cek disini: " + JSON.stringify(saleTx));

    try {
        RETURN_REFUND.return.service.saveCouponReturnData();
    } catch (err) {
        console.log("Save coupon return data error");
        console.log(err);
    }

    saveOrder(CONSTANTS.STATUS.COMPLETED, function(callbackData) {
        if (callbackData && callbackData.error) {
            promptSysMsg('Order failed.' + JSON.stringify(callbackData.error), 'SALE');
        } else {
            uilog('DBUG', "Masuk setelah save order");
            saleTx.type = CONSTANTS.TX_TYPES.SIMPATINDO.name;

            var data = $("#simpatindoOrder-dialog").data("orderResponse");
            console.log(data);
            var item = $("#simpatindoOrder-dialog").data("item");
            console.log(item);
            var confirm = SIMPATINDO.confirm(saleTx, data);

            if (typeof confirm == "object") {
                if (confirm.response.rescode == 0 || confirm.response.rescode == 4) {
                    var item = $("#simpatindoOrder-dialog").data("item");
                    console.log("Item : ");
                    console.log(item);

                    confirm.id = data.id;
                    confirm.name = item.name;
                    confirm.type = item.type;
                    confirm.item = item;
                    confirm.timeout = false;
                    confirm.tempPrice = item.tempPrice;
                    confirm.vtype = item.sku;

                    console.log("Confirm to send");
                    console.log(confirm);

                    $("#simpatindoConfirm-dialog").data("item", item);
                    $("#simpatindoConfirm-dialog").data("confirmResponse", confirm);
                    $("#simpatindoConfirm-dialog").data("callbackData", callbackData);
                    $("#simpatindoConfirm-dialog").dialog("open");
                } else {
                    $("#simpatindoFailed-dialog").data("failedType", "confirm");
                    $("#simpatindoFailed-dialog").data("failedResponse", confirm);
                    $("#simpatindoFailed-dialog").data("callbackData", callbackData);
                    $("#simpatindoFailed-dialog").dialog("open");
                }
                saleTx.simpatindo = confirm;
                CustomerPopupScreen.cus_simpatindoStatusRemove(data);
                CustomerPopupScreen.cus_showSimpatindoAdvice(confirm);
                CustomerPopupScreen.cus_showSimpatindoDialogAdvice(confirm);
            } else {
                var item = $("#simpatindoOrder-dialog").data("item");
                console.log("Item : ");
                console.log(item);

                data.id = data.id;
                data.name = item.name;
                data.type = item.type;
                data.item = item;
                data.timeout = true;
                data.tempPrice = item.tempPrice;
                data.vtype = item.sku;

                console.log("Data to send");
                console.log(data);

                if (typeof data.response.ext_data == 'object') {
                    data.response.scrmessage = "SEDANG DALAM PROSES";
                } else {
                    data.response.ext_data += "| | SEDANG DALAM PROSES";
                }

                $("#simpatindoConfirm-dialog").data("confirmResponse", data);
                $("#simpatindoConfirm-dialog").data("callbackData", callbackData);
                $("#simpatindoConfirm-dialog").dialog("open");
                saleTx.simpatindo = data;
                CustomerPopupScreen.cus_simpatindoStatusRemove(data);
                CustomerPopupScreen.cus_showSimpatindoAdvice(data);
                CustomerPopupScreen.cus_showSimpatindoDialogAdvice(data);
            }
        }
    }, function(error) {
        uilog('DBUG', 'FAIL: ' + error);
    });
}

SIMPATINDO.isSimpatindoTransaction = function() {
    if (!jQuery.isEmptyObject(saleTx.simpatindo)) {
        return true;
    }
    return false;
};

SIMPATINDO.xmlToJson = function(xml) {
    // Create the return object
    var obj = {};

    // console.log(xml.nodeType, xml.nodeName );

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3 ||
        xml.nodeType == 4) { // text and cdata section
        obj = xml.nodeValue
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].length) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                if (typeof(obj[nodeName]) === 'object') {
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        }
    }
    return obj;
}

SIMPATINDO.parseParsedToJsonRecursively = function(data) {
    if (typeof data != 'object' || (typeof data == 'object' && jQuery.isEmptyObject(data))) {
        return;
    } else {
        for (var key in data) {
            if (data[key]["#text"]) {
                data[key] = data[key]["#text"];
            } else {
                SIMPATINDO.parseParsedToJsonRecursively(data[key]);
            }
        }
    }
    return;
}
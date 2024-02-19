var TOPUP = TOPUP || {};

/**
 * Save TopUp Transaction
 */
TOPUP.saveTopUpTransaction = function (data) {
    return $.ajax({
        url: posWebContextPath + "/cashier/saveTopUpTransaction/" + saleTx.transactionId,
        type: "POST",
        async: false,
        dataType: "json",
        contentType: "application/json",
        // data : JSON.stringify(data), --calculate the change
        data: JSON.stringify(PAYMENT_MEDIA.finalizeSaleTxLastPaymentAmount(data)),
        success: function (response) {
            uilog("DBUG", "TopUp saved.");
        },
        error: function (jqXHR, status, error) {
            showMsgDialog("Saving of Topup Tx failed: " + error, "error");
        }
    });
}

/**
 * Sends TopUp request to simpatindo server. This function is used to reload
 * electronic voucher. Will return an error if no response from the server.
 *
 * @param data
 *            containing the data related to topup
 */
TOPUP.sendTopUpRequest = function(data) {
    var path = "simulator/main/" + data.cmd; // use this for temp simpatindo controller only
    var url = getConfigValue("TOPUP_MAIN_URL");
    var drcUrl = getConfigValue("TOPUP_DRC_URL");
    var isDrcServerUrlUsed = false;
    var response = null;
    var retries = 0;
    var cashierId = loggedInUsername; //hotfix - remove test data
    var storeCode = configuration.storeCode.toLowerCase();
    var posTerminalCode = configuration.terminalCode.toLowerCase();
    var dateNow = TOPUP.formatTopUpTxDateTime(new Date());
    var partnerTxId = saleTx.transactionId +
        (data.seqTopUpNum !== "" && data.seqTopUpNum !== null ? data.seqTopUpNum + 1 : ""); // add 1 because seqTopUpNum starts at 0.

    if (data.serverTxId)
        partnerTxId = data.serverTxId;

    var params = {
        channelid: getConfigValue("TOPUP_CHANNEL_ID"),
        posid: posTerminalCode,
        password: $.md5($.md5(getConfigValue("TOPUP_PIN") +
                getConfigValue("TOPUP_SERVER_SECRET_KEY") + partnerTxId) +
            $.md5(getConfigValue("TOPUP_CHANNEL_ID") + storeCode +
                posTerminalCode + dateNow)),
        cmd: data.cmd,
        trxtime: dateNow,
        storeid: storeCode,
        cashierid: cashierId
    };

    // add more param required for a specific request
    if (data.cmd == "topup") {
        params.hp = data.pNum;
        params.vtype = data.vType;
        params.partner_trxid = partnerTxId;
    } else if (data.cmd == "inquiry") {
        params.server_trxid = partnerTxId;
    } else if (data.cmd == "reshot") {
        params.server_trxid = partnerTxId;
    } else if (data.cmd == "change") {
        params.hp = data.newPNum;
        params.server_trxid = partnerTxId;
    } else if (data.cmd == "pingtel") {
        // additional param here
    } else if (data.cmd == "refund") {
        params.server_trxid = partnerTxId;
    }

    var reqErrCode = null;
    var reqStatus = null;
    var reqErrMsg = null;

    // request must be from proxy server, cant make ajax request to a remote
    // domain.
    while (!response) {
        response = $.ajax({
            url: proxyUrl + "/topupRequest",
            type: "GET",
            async: false,
            data: {
                topupUrl: url,
                params: params,
                timeout: Number(getConfigValue("TOPUP_TIME_OUT"))
            },
            beforeSend: function() {
                if (!$("#loading-dialog").dialog("isOpen")) {
                    $("#loading-dialog").dialog("open");
                }
            },
            success: function(data, textStatus, jqXHR) {
                reqStatus = jqXHR.statusText;
                if (jqXHR.statusText == "TIMEOUT") {
                    ++retries;
                }
            },
            error: function(jqXHR, status, error) {
                reqErrMsg = error.message;
            }
        }).responseText;

        if (retries == Number(getConfigValue("TOPUP_MAX_CON_RETRY"))) {
            if (isDrcServerUrlUsed) {
                if (reqStatus == "TIMEOUT") {
                    reqErrCode = 99;
                }
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
            resCode: reqErrCode,
            serverTrxId: partnerTxId
        };
    }

    $("#loading-dialog").dialog('close');

    return response;
}

/**
 * Converts the data(xml format) to Object.
 *
 * @param data data from topup request.
 */
TOPUP.convertTopUpResToObj = function (data) {
    var topUp = null;
    try {
        topUp = new Object();
        xmlDoc = $.parseXML(data);
        $xml = $(xmlDoc);

        topUp.resCode = $xml.find("rescode") ? $xml.find("rescode").text() : null;
        topUp.phoneNum = $xml.find("hp") ? $xml.find("hp").text() : null;
        topUp.oldPhoneNum = $xml.find("hpold") ? $xml.find("hpold").text() : null;
        topUp.vType = $xml.find("vtype") ? $xml.find("vtype").text() : null;
        topUp.serverTrxId = $xml.find("server_trxid") ? $xml.find("server_trxid").text() : null;
        topUp.partnerTrxId = $xml.find("partner_trxid") ? $xml.find("partner_trxid").text() : null;
        topUp.scrMessage = $xml.find("scrmessage") ? $xml.find("scrmessage").text() : null;
        topUp.resMessage = $xml.find("resmessage") ? $xml.find("resmessage").text() : null;
        topUp.serialNum = $xml.find("sn") ? $xml.find("sn").text() : null;
    } catch (err) {
        uilog("DBUG", "Topup Response parse error : " + err);
    }
    return topUp;
}

TOPUP.processTopUpTransaction = function () {
    if (topUpObj &&
        topUpObj.topUpTxItems &&
        processtopUpStdSleCntr == topUpObj.topUpTxItems.length) {

        if (isHcEnabled) {
            Hypercash.queuedTopUpToPrint.push(setReceiptTopUpInfo(null, false, false, false, true, true));
        } else {
            printReceipt({ topUpInfo: setReceiptTopUpInfo(null, false, false, false, true, true) });
        }

        renderTopUpInfo(null, false, false, false, true, false);

        var type = null;
        try {
            if (saleTx.type == 'RETURN') {
                RETURN_REFUND.return.service.saveCouponReturnData();
            }
            type = topUpTxItem.transactionType ? topUpTxItem.transactionType.toUpperCase() : null;
            if (type == 'REFUND') {
                RETURN_REFUND.return.service.saveCouponReturnData();
            }
        } catch (err) {
            console.log("Save coupon return data error");
            console.log(err);
        }

        saveOrder(CONSTANTS.STATUS.COMPLETED,
            function (data) {
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

                    if (topUpObj &&
                        topUpObj.topUpTxItems &&
                        topUpObj.topUpTxItems.length != 0) {
                        saleTx.topUpObj = topUpObj.topUpTxItems;
                        TOPUP.saveTopUpTransaction(saleTx);
                        //TOPUP.saveTopUpTransaction(topUpObj.topUpTxItems);
                    }

                    topUpTempObj = null;
                }
            },
            function (error) {
                uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
                promptSysMsg(getMsgValue('prompt_msg_order_failed') + JSON.stringify(error), 'SALE');
            }
        );
    } else {
        topUpTxItem = topUpObj.topUpTxItems[processtopUpStdSleCntr];
        topUpTxItem.transactionDate = new Date();
        ++processtopUpStdSleCntr;

        if (topUpTxItem.transactionType.toUpperCase() == "TOPUP") {
            var data = {
                cmd: "topup",
                seqTopUpNum: topUpTxItem.refTxItemOrder,
                pNum: topUpTxItem.phoneNum,
                vType: topUpTxItem.vType
            };
            var response = TOPUP.sendTopUpRequestNew(data);
            if (response) {
                if (response.error) {
                    topUpTxItem.scrMessage = response.error;
                    topUpTxItem.resCode = response.resCode;
                    topUpTxItem.serverTrxId = response.serverTrxId;
                    // showMsgDialog(response.error, "error", function() {
                    // TOPUP.processTopUpTransaction();
                    // });
                } else {
                    var topUpItem = TOPUP.convertTopUpResToObjNew(response);

                    topUpTxItem.resCode = topUpItem.resCode;
                    topUpTxItem.phoneNum = ((topUpItem.phoneNum === null || topUpItem.phoneNum == '') ? data.pNum : topUpItem.phoneNum);
                    topUpTxItem.vType = topUpItem.vType;
                    topUpTxItem.serverTrxId = ((topUpItem.serverTrxId === null || topUpItem.serverTrxId == '') ? saleTx.transactionId + '' + (data.seqTopUpNum + 1) : topUpItem.serverTrxId);
                    topUpTxItem.partnerTrxId = ((topUpItem.partnerTrxId === null || topUpItem.partnerTrxId == '') ? saleTx.transactionId : topUpItem.partnerTrxId);
                    topUpTxItem.scrMessage = topUpItem.scrMessage;
                    var msg = topUpItem == null ? "Parse error on topup response." : topUpItem.scrMessage;
                    // showMsgDialog(msg, topUpItem.resCode == 4 ? "info" : "warning", function() {
                    // TOPUP.processTopUpTransaction();
                    // });
                }
                var topUpRes = {
                    topUpItem: cloneObject(topUpTxItem),
                    refTxItem: cloneObject(saleTx.orderItems[topUpTxItem.refTxItemOrder])
                };

                topUpTempObj.topUpItem = cloneObject(topUpTxItem);
                topUpTempObj.refTxItem = cloneObject(saleTx.orderItems[topUpTxItem.refTxItemOrder]);

                if (isHcEnabled) {
                    Hypercash.queuedTopUpToPrint.push(setReceiptTopUpInfo(topUpRes, false, false, true, false, false));
                } else {
                    printReceipt({
                        topUpInfo: setReceiptTopUpInfo(topUpRes, false, false, true, false, false)
                    });
                }

                renderTopUpInfo(topUpRes, false, false, true, false, false);
            }
            TOPUP.processTopUpTransaction();
        } else if (topUpTxItem.transactionType.toUpperCase() == "REFUND") {
            var data = new Object();
            data.cmd = "refund";
            data.serverTxId = topUpTxItem.serverTxId;
            response = TOPUP.sendTopUpRequest(data);
            if (response) {
                var topUpMsg = "";

                if (response.error) {
                    topUpTxItem.scrMessage = response.error;
                    topUpTxItem.resCode = response.resCode;
                    topUpTxItem.serverTrxId = response.serverTrxId;
                    topUpMsg = response.error;
                    // showMsgDialog(response.error, "error", function() {
                    // TOPUP.processTopUpTransaction();
                    // });
                } else {
                    var topUpItem = TOPUP.convertTopUpResToObj(response);
                    topUpTxItem.transactionType = data.cmd.toUpperCase();
                    topUpTxItem.resCode = topUpItem.resCode;
                    topUpTxItem.phoneNum = topUpItem.phoneNum;
                    topUpTxItem.oldPhoneNum = topUpItem.oldPhoneNum;
                    topUpTxItem.vType = topUpItem.vType;
                    topUpTxItem.serverTrxId = topUpItem.serverTrxId;
                    topUpTxItem.partnerTrxId = topUpItem.partnerTrxId;
                    topUpTxItem.scrMessage = topUpItem.scrMessage;
                    topUpTxItem.resMessage = topUpItem.resMessage;
                    topUpTxItem.serialNum = topUpItem.serialNum;
                    topUpMsg = topUpItem == null ? "Parse error on topup response." : topUpItem.scrMessage;
                    // showMsgDialog(topUpMsg, topUpItem.resCode == 4 ? "info" : "warning", function() {
                    // TOPUP.processTopUpTransaction();
                    // });
                }
                var topUpRes = {
                    topUpItem: cloneObject(topUpTxItem),
                    refTxItem: cloneObject(saleTx.orderItems[topUpTxItem.refTxItemOrder])
                };

                if (isHcEnabled) {
                    Hypercash.queuedTopUpToPrint.push(setReceiptTopUpInfo(topUpRes, false, false, true, false, false));
                } else {
                    printReceipt({
                        topUpInfo: setReceiptTopUpInfo(topUpRes, false, false, true, false, false)
                    });
                }

                renderTopUpInfo(topUpRes, false, false, true, false, false);

            }
            TOPUP.processTopUpTransaction();
        } else {
            TOPUP.processTopUpTransaction();
        }
    }
}



/**
 * Initiate topup standard sale. returns false if encountered error, true otherwise.
 */
TOPUP.initTopUpStandardSale = function (prodObj) {
    var simpatindoUrl = getConfigValue("TOPUP_MAIN_URL");
    var response = checkServerStatus(simpatindoUrl, 10000);

    if (response) {
        $("#topUp-phoneNum-dialog").data("prodObj", prodObj).dialog("open");
    } else {
        showMsgDialog("TOPUP SERVER ERR! ITEM NOT ALLOWED!", "warning", function () {
            clearInputDisplay();
        });
    }

    return response;
}

/**
 * Checks if param specified is a TopUp data
 */
TOPUP.isTopUpItem = function (data) {
    if (data && data.categoryId && data.categoryId.toLowerCase() == "topup") {
        return true;
    } else {
        return false;
    }
}

/**
 * Function that will format datetime used by topup param.
 * @returns String representation of the formatted datetime.
 */
TOPUP.formatTopUpTxDateTime = function (date) {
    var dateStr = $.datepicker.formatDate("yymmdd", date);
    var hours = (date.getHours() < 10 ? "0" : "") + date.getHours();
    var minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    var seconds = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
    return dateStr + hours + minutes + seconds;
}

TOPUP.createTopupTransactionObj = function () {
    var obj = new Object();
    obj.totalAmt = 0;
    obj.topUpTxItems = [];
    return obj;
}

/*
 * Searches matching vType in topUpObj, then deletes that index.
 * @param sku the sku column in Product object
 * @return boolean true if successful; otherwise, false.
 */
TOPUP.voidTopUpItem = function (sku) {
    if (topUpObj && topUpObj.topUpTxItems) {
        for (var i = topUpObj.topUpTxItems.length - 1; i >= 0; i--) {
            var item = topUpObj.topUpTxItems[i];

            if (item.vType == sku) {
                topUpObj.topUpTxItems.splice(i, 1);
                return true;
            }
        }
    }

    return false;
}

/**
 * Retrieves a TopUp Transaction usinf transaction id and TopUp Id
 */
TOPUP.findTopUpTransaction = function (txnId, topUpId) {
    var topUp = null;
    $.ajax({
        url: posWebContextPath + "/topUp/getTopUpTxn/" + txnId + "/" + topUpId,
        type: "GET",
        async: false,
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            if (jQuery.isEmptyObject(response))
                uilog("DBUG", "TopUp Transaction is un-available");
            else {
                uilog("DBUG", "TopUp Transaction is searchable.");
                topUp = response;
            }
        },
        error: function (jqXHR, status, error) {
            uilog("DBUG", "TopUp Transaction Not Found");
        }
    });
    return topUp;
}

TOPUP.convertTopUpResToObjNew = function (data) {
    var topUp = null;
    try {

        topUp = new Object();

        var resOrder = data.body.order;
        var resOrderStatus = data.body.orderStatus;
        var resProduct = data.body.product;

        topUp.phoneNum = resOrder.destinationInfo.primaryParam;
        topUp.oldPhoneNum = resOrder.destinationInfo.primaryParam;
        topUp.serverTrxId = resOrder.requestId;
        topUp.partnerTrxId = resOrder.orderId;

        topUp.resCode = resOrderStatus.code;
        topUp.scrMessage = resOrderStatus.status;
        topUp.resMessage = resOrderStatus.message;

        topUp.vType = resProduct.type + '/' + resProduct.provider;

        topUp.serialNum = data.body.serialNumber;
    } catch (err) {
        uilog("DBUG", "Topup Response parse error : " + err);
    }
    return topUp;
}

TOPUP.sendTopUpRequestNew = function (data) {
    var path = "simulator/main/" + data.cmd; // use this for temp simpatindo controller only
    var url = getConfigValue("TOPUP_MAIN_URL");
    var drcUrl = getConfigValue("TOPUP_DRC_URL");
    var isDrcServerUrlUsed = false;
    var response = null;
    var retries = 0;
    var cashierId = loggedInUsername; //hotfix - remove test data
    var storeCode = configuration.storeCode.toLowerCase();
    var posTerminalCode = configuration.terminalCode.toLowerCase();
    var dateNow = TOPUP.formatTopUpTxDateTime(new Date());
    var partnerTxId = saleTx.transactionId +
        (data.seqTopUpNum !== "" && data.seqTopUpNum !== null ? data.seqTopUpNum + 1 : ""); // add 1 because seqTopUpNum starts at 0.

    if (data.serverTxId)
        partnerTxId = data.serverTxId;

    var params = {
        channelid: getConfigValue("TOPUP_CHANNEL_ID"),
        posid: posTerminalCode,
        password: $.md5($.md5(getConfigValue("TOPUP_PIN") +
            getConfigValue("TOPUP_SERVER_SECRET_KEY") + partnerTxId) +
            $.md5(getConfigValue("TOPUP_CHANNEL_ID") + storeCode +
                posTerminalCode + dateNow)),
        cmd: data.cmd,
        trxtime: dateNow,
        storeid: storeCode,
        cashierid: cashierId
    };

    // add more param required for a specific request
    if (data.cmd == "topup") {
        params.hp = data.pNum;
        params.vtype = data.vType;
        params.partner_trxid = partnerTxId;
    } else if (data.cmd == "inquiry") {
        params.server_trxid = partnerTxId;
    } else if (data.cmd == "reshot") {
        params.server_trxid = partnerTxId;
    } else if (data.cmd == "change") {
        params.hp = data.newPNum;
        params.server_trxid = partnerTxId;
    } else if (data.cmd == "pingtel") {
        // additional param here
    } else if (data.cmd == "refund") {
        params.server_trxid = partnerTxId;
    }

    var partnerTxIdCut = partnerTxId.substr(5);
    var reqErrCode = null;
    var reqStatus = null;
    var reqErrMsg = null;

    var topUpObjNew = {
        "version": "4.0.5",
        "functionHead": "order.create",
        "clientId": configuration.storeCode.toLowerCase(),
        "path": "/order/create",
        "body": {
            "requestId": partnerTxIdCut,
            "productId": data.vType,
            "destinationInfo": {
                "primaryParam": data.pNum,
                "secondaryParam": ""
            }
        }
    }

    $.ajax({
        url: posWebContextPath + "/cashier/tiphone/api",
        type: "POST",
        async: false,
        contentType: "application/json",
        data: JSON.stringify(topUpObjNew),
        beforeSend: function () {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (res) {
            //FOR DEV ONLY
            // res = {
            //     "response": {
            //         "head": {
            //             "version": "4.0.5",
            //             "function": "order.create",
            //             "respTime": "2023-01-12T10:11:23+07:00",
            //             "reqMsgId": "1673518246"
            //         },
            //         "body": {
            //             "order": {
            //                 "requestId": "11000567890123456124",
            //                 "orderId": "TL.202301111514081520",
            //                 "createdTime": "2023-01-11T15:14:08+07:00",
            //                 "modifiedTime": "",
            //                 "destinationInfo": {
            //                     "primaryParam": "08211112222"
            //                 }
            //             },
            //             "orderStatus": {
            //                 "code": "10",
            //                 "status": "SUCCESS",
            //                 "message": "Success"
            //             },
            //             "serialNumber": "0123456789",
            //             "token": "",
            //             "product": {
            //                 "productId": "42781046001",
            //                 "type": "MOBILE_CREDIT",
            //                 "provider": "telkomsel",
            //                 "price": {
            //                     "value": 15500,
            //                     "currency": "IDR"
            //                 },
            //                 "availability": true
            //             }
            //         }
            //     },
            //     "signature": "J1nVkralLJfiNvPvs/t9nvuxy5EAQjdhN2pny/DrWEzs8TIJtyUPCrxKifZmv3JNq/GYKYs8z/7ljvb5vIP5nQ7eWxKAsSGBW/VGeDOgFWvuzLyKBvc+a6jmexQGo1ybutVfraIc7ZT1wWy8lPI5eFaDz71tlC3gwQnQfaKVNVxuq5DgW3AKY01NWok9XBCaFixj8QCfPC21vs7LOZ2xzXHJVsNtz5n5N17KRtHKddpx4dH2BSsmB5GrY7CBa5tuX3ymla+V54PoTVMTEsICE4U9rPNAQqe8TnAX501VflFp2trU3kZmEcvygQUg/FG1Ui8yfHxTxuXwbuss41K/cA=="
            // }

            if (typeof res.response.body.orderStatus != "undefined" && res.response.body.orderStatus.code == "10") {
                response = res.response;
            } else {

                reqErrCode = (res.response.body.code == "30") ? res.response.body.code : res.response.body.orderStatus.code;
                reqStatus = (res.response.body.code == "30") ? res.response.body.status : res.response.body.orderStatus.status;
                reqErrMsg = (res.response.body.code == "30") ? res.response.body.message : res.response.body.orderStatus.message;

                response = {
                    error: reqErrMsg,
                    resCode: reqErrCode,
                    serverTrxId: partnerTxIdCut
                };
            }

        },
        error: function (jqXHR, status, error) {
            reqErrCode = "99";
            reqStatus = "error";
            reqErrMsg = "ERROR";

            response = {
                error: reqErrMsg,
                resCode: reqErrCode,
                serverTrxId: partnerTxIdCut
            };
        },
    });

    $("#loading-dialog").dialog('close');

    return response;

}
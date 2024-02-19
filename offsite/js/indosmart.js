var INDOSMART = INDOSMART || {};

INDOSMART.getStatusMessage = {
    '0': 'Success',
    '00': 'Success',
    '10': 'Message Invalid',
    '11': 'Unrecognized method in request',
    '13': 'Invalid Amount',
    '30': 'Unknown Dealer ID',
    '31': 'Unknown Bank Code',
    '33': 'Unknown Terminal ID',
    '34': 'Invalid/Unknown User',
    '35': 'Invalid Status',
    '40': 'Sign In Error',
    '41': 'Payment Failed',
    '42': 'Unknown Customer ID',
    '43': 'Unknown Payment Service',
    '44': 'Invalid Customer Status',
    '46': 'Reconcile Error',
    '47': 'Payment Pending',
    '48': 'Already Paid',
    '50': 'Invalid transaction ID',
    '51': 'Invalid transaction date time',
    '55': 'Not enough deposit for dealer',
    '56': 'Not enough deposit for terminal',
    '59': 'Transaction rejected',
    '60': 'Transaction reversal',
    '61': 'Request in process',
    '62': 'Reversal denied, top-up is success',
    '63': 'Reversal denied, no transaction request',
    '67': 'Duplicate Transaction',
    '68': 'Transaction timeout',
    '69': 'Reversal Timeout',
    '70': 'Voucher out of stock',
    '71': 'Voucher/Token Already used',
    '72': 'Voucher Unavailable',
    '77': 'Not Prepaid MSISDN',
    '78': 'Not Postpaid MSISDN',
    '79': 'Blocked MSISDN',
    '80': 'Invalid MSISDN',
    '81': 'MSISDN expired',
    '90': 'System Time-out',
    '91': 'Internal System Error',
    '92': 'Unable to route transaction',
    '97': 'System Under Maintenance',
    '99': 'Undefined Error Code'
}

INDOSMART.getCardNumber = function(itemName) {
    var name = itemName.toLowerCase();
    if (name.indexOf('telkomsel') !== -1) {
        return '110';
    } else if (name.indexOf('xl') !== -1 || name.indexOf('axis') !== -1) {
        return '111';
    } else if (name.indexOf('indosat') !== -1) {
        return '101';
    } else if (name.indexOf('three') !== -1) {
        return '189';
    } else if (name.indexOf('smartfren') !== -1) {
        return '134';
    } else if (name.indexOf('bolt') !== -1) {
        return '151';
    } else {
        return null;
    }
}

INDOSMART.getVoucherType = function(itemName) {
    var name = itemName.toLowerCase();

    if (name.indexOf('internet') !== -1 || name.indexOf('data') !== -1) {
        if (name.indexOf('telkomsel') !== -1) {
            return 'G';
        } else if (name.indexOf('xl') !== -1 || name.indexOf('axis') !== -1) {
            return 'MDS01'; // MDS01 - MDS06
        }
    } else {
        return 'R';
    }
}

INDOSMART.getValue = function(name) {
    if (name.indexOf('10K') !== -1 || name.indexOf('10 RIBU') !== -1 || name.indexOf('10 RB') !== -1) {
        return 10000;
    } else if (name.indexOf('15K') !== -1 || name.indexOf('15 RIBU') !== -1 || name.indexOf('15 RB') !== -1) {
        return 15000;
    } else if (name.indexOf('20K') !== -1 || name.indexOf('20 RIBU') !== -1 || name.indexOf('20 RB') !== -1) {
        return 20000;
    } else if (name.indexOf('25K') !== -1 || name.indexOf('25 RIBU') !== -1 || name.indexOf('25 RB') !== -1) {
        return 25000;
    } else if (name.indexOf('30K') !== -1 || name.indexOf('30 RIBU') !== -1 || name.indexOf('30 RB') !== -1) {
        return 30000;
    } else if (name.indexOf('40K') !== -1 || name.indexOf('40 RIBU') !== -1 || name.indexOf('40 RB') !== -1) {
        return 40000;
    } else if (name.indexOf('50K') !== -1 || name.indexOf('50 RIBU') !== -1 || name.indexOf('50 RB') !== -1) {
        return 50000;
    } else if (name.indexOf('60K') !== -1 || name.indexOf('60 RIBU') !== -1 || name.indexOf('60 RB') !== -1) {
        return 60000;
    } else if (name.indexOf('75K') !== -1 || name.indexOf('75 RIBU') !== -1 || name.indexOf('75 RB') !== -1) {
        return 75000;
    } else if (name.indexOf('80K') !== -1 || name.indexOf('25 RIBU') !== -1 || name.indexOf('25 RB') !== -1) {
        return 80000;
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

/**
 * Checks if param specified is a Indosmart data
 */
INDOSMART.isIndosmartItem = function(data) {
    if (data && data.categoryId && (data.categoryId.toLowerCase() == "indosmart" ||
            data.categoryId.toLowerCase() == "9")) {
        return true;
    } else {
        return false;
    }
}

INDOSMART.createIndosmartTransactionObj = function() {
    var obj = new Object();
    obj.totalAmt = 0;
    obj.indosmartTxItems = [];
    return obj;
}

/**
 * Initiate topup standard sale. returns false if encountered error, true otherwise.
 */
INDOSMART.initIndosmartStandardSale = function(prodObj) {
    var indosmartUrl = getConfigValue("INDOSMART_MAIN_URL");
    var response = checkServerStatus(indosmartUrl, 10000);

    if (response) {
        $("#indosmart-phoneNum-dialog").data("prodObj", prodObj).dialog("open");
    } else {
        showMsgDialog("INDOSMART SERVER ERR! ITEM NOT ALLOWED!", "warning", function() {
            clearInputDisplay();
        });
    }

    return response;
}

INDOSMART.processIndosmartTransaction = function() {
    if (indosmartObj &&
        indosmartObj.indosmartTxItems &&
        processIndosmartStdSleCntr == indosmartObj.indosmartTxItems.length) {

        if (isHcEnabled) {
            Hypercash.queuedIndosmartToPrint.push(setReceiptIndosmartInfo(null, false, false, false, true, true));
        } else {
            printReceipt({ indosmartInfo: setReceiptIndosmartInfo(null, false, false, false, true, true) });
        }

        renderIndosmartInfo(null, false, false, false, true, false);

        var type = null;
        try {
            if (saleTx.type == 'RETURN') {
                RETURN_REFUND.return.service.saveCouponReturnData();
            }
            type = indosmartTxItem.transactionType ? indosmartTxItem.transactionType.toUpperCase() : null;
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

                    if (indosmartObj &&
                        indosmartObj.indosmartTxItems &&
                        indosmartObj.indosmartTxItems.length != 0) {
                        saleTx.indosmartObj = indosmartObj.indosmartTxItems;
                        INDOSMART.saveIndosmartTransaction(saleTx);
                    }

                    indosmartTempObj = null;
                }
            },
            function(error) {
                uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
                promptSysMsg(getMsgValue('prompt_msg_order_failed') + JSON.stringify(error), 'SALE');
            }
        );
    } else {
        indosmartTxItem = indosmartObj.indosmartTxItems[processIndosmartStdSleCntr];
        indosmartTxItem.transactionDate = new Date();
        ++processIndosmartStdSleCntr;

        if (indosmartTxItem.transactionType.toUpperCase() == "TOPUP") {
            var data = {
                cmd: "topup",
                seqIndosmartNum: indosmartTxItem.refTxItemOrder,
                pNum: indosmartTxItem.phoneNum,
                vType: indosmartTxItem.vType,
                name: indosmartTxItem.name
            };
            var response = INDOSMART.sendIndosmartRequest(data);
            if (response) {
                if (response.error) {
                    indosmartTxItem.message = response.error;
                    indosmartTxItem.messageGeneral = "GAGAL";
                    indosmartTxItem.responseCode = response.ResponseCode || 99;
                    indosmartTxItem.referenceNo = response.ReferenceNo || response.serverTrxId;
                    indosmartTxItem.partnerTrxId = response.partnerTrxId;
                } else {
                    console.log("Response");
                    console.log(response);
                    var indosmartItem = response.data;

                    indosmartTxItem.transactionType = data.cmd.toUpperCase();
                    indosmartTxItem.merchantId = indosmartItem.MerchantID;
                    indosmartTxItem.merchantType = indosmartItem.MerchantType;
                    indosmartTxItem.transactionDateTime = indosmartItem.TransactionDateTime;
                    indosmartTxItem.partnerTrxId = indosmartItem.TransactionID;

                    if (indosmartItem.faultString) {
                        indosmartTxItem.faultString = indosmartItem.faultString;
                        indosmartTxItem.faultCode = indosmartItem.faultCode;
                    } else {
                        indosmartTxItem.responseCode = indosmartItem.ResponseCode;
                        indosmartTxItem.destination = ((indosmartItem.Destination === null || indosmartItem.Destination == '') ? data.pNum : indosmartItem.Destination);
                        indosmartTxItem.voucherType = indosmartItem.VoucherType;
                        indosmartTxItem.cardNumber = indosmartItem.CardNumber;
                        indosmartTxItem.groupId = indosmartItem.GroupID;
                        indosmartTxItem.amount = indosmartItem.Amount;
                        indosmartTxItem.processingCode = indosmartItem.ProcessingCode;
                        indosmartTxItem.referenceNo = indosmartItem.ReferenceNo;
                        indosmartTxItem.terminalId = indosmartItem.TerminalID;
                        indosmartTxItem.transactionId = saleTx.transactionId;
                        indosmartTxItem.processingCode = indosmartItem.ProcessingCode;
                        indosmartTxItem.voucherId = indosmartItem.VoucherID;
                        indosmartTxItem.voucherSn = indosmartItem.VoucherSN;
                    }

                    if (indosmartItem.Message) {
                        indosmartTxItem.message = indosmartItem.Message;
                    } else {
                        if (indosmartTxItem.faultString) {
                            indosmartTxItem.message = 'INDOSMART SERVER FAULT';
                        } else {
                            indosmartTxItem.message = INDOSMART.getStatusMessage[indosmartItem.ResponseCode];
                        }
                    }

                    if (indosmartItem.ResponseCode) {
                        if (indosmartItem.ResponseCode == '0' || indosmartItem.ResponseCode == '00' ||
                            indosmartItem.ResponseCode == '61' || indosmartItem.ResponseCode == '62') {
                            indosmartTxItem.messageGeneral = "SUKSES";
                        } else {
                            indosmartTxItem.messageGeneral = "GAGAL";
                        }
                    } else {
                        indosmartTxItem.messageGeneral = "GAGAL";
                    }
                    indosmartTxItem.terminalBalance = indosmartItem.TerminalBalance;
                    var msg = indosmartItem == null ? "Parse error on topup response." : indosmartItem.Message;
                }
                var indosmartRes = {
                    indosmartItem: cloneObject(indosmartTxItem),
                    refTxItem: cloneObject(saleTx.orderItems[indosmartTxItem.refTxItemOrder])
                };

                indosmartTempObj.indosmartItem = cloneObject(indosmartTxItem);
                indosmartTempObj.refTxItem = cloneObject(saleTx.orderItems[indosmartTxItem.refTxItemOrder]);

                if (isHcEnabled) {
                    Hypercash.queuedIndosmartToPrint.push(setReceiptIndosmartInfo(indosmartRes, false, false, true, false, false));
                } else {
                    printReceipt({
                        indosmartInfo: setReceiptIndosmartInfo(indosmartRes, false, false, true, false, false)
                    });
                }

                renderIndosmartInfo(indosmartRes, false, false, true, false, false);
            }
            INDOSMART.processIndosmartTransaction();
        } else if (indosmartTxItem.transactionType.toUpperCase() == "REFUND") {
            var data = new Object();
            data.cmd = "refund";
            data.serverTxId = indosmartTxItem.serverTxId;
            response = INDOSMART.sendIndosmartRequest(data);
            if (response) {
                var indosmartMsg = "";

                if (response.error) {
                    indosmartTxItem.scrMessage = response.error;
                    indosmartTxItem.resCode = response.resCode;
                    indosmartTxItem.referenceNo = response.serverTrxId;
                    indosmartTxItem.partnerTrxId = response.partnerTrxId;
                    indosmartMsg = response.error;
                } else {
                    var indosmartItem = response;
                    indosmartTxItem.transactionType = data.cmd.toUpperCase();
                    indosmartTxItem.responseCode = indosmartItem.ResponseCode;
                    indosmartTxItem.refDestination = ((indosmartItem.RefDestination === null || indosmartItem.Destination == '') ? data.pNum : indosmartItem.RefDestination);
                    indosmartTxItem.refVoucherType = indosmartItem.RefVoucherType;
                    indosmartTxItem.refCardNumber = indosmartItem.RefCardNumber;
                    indosmartTxItem.refAmount = indosmartItem.refAmount;
                    indosmartTxItem.processingCode = indosmartItem.ProcessingCode;
                    indosmartTxItem.refReferenceNo = indosmartItem.RefReferenceNo;
                    indosmartTxItem.terminalId = indosmartItem.TerminalID;
                    indosmartTxItem.partnerTrxId = indosmartItem.TransactionID;
                    indosmartTxItem.transactionId = saleTx.transactionId;
                    indosmartTxItem.transactionDateTime = indosmartItem.TransactionDateTime;
                    indosmartTxItem.refTransactionId = indosmartItem.RefTransactionID;
                    indosmartTxItem.refTransactionDateTime = indosmartItem.RefTransactionDateTime;
                    indosmartTxItem.processingCode = indosmartItem.ProcessingCode;
                    indosmartTxItem.refStatus = indosmartItem.RefStatus;
                    indosmartTxItem.voucherSN = indosmartItem.VoucherSN;
                    indosmartTxItem.message = indosmartItem.Message;
                    indosmartTxItem.terminalBalance = indosmartItem.TerminalBalance;
                    var msg = indosmartItem == null ? "Parse error on topup response." : indosmartItem.Message;
                }
                var indosmartRes = {
                    indosmartItem: cloneObject(indosmartTxItem),
                    refTxItem: cloneObject(saleTx.orderItems[indosmartTxItem.refTxItemOrder])
                };

                if (isHcEnabled) {
                    Hypercash.queuedIndosmartToPrint.push(setReceiptIndosmartInfo(indosmartRes, false, false, true, false, false));
                } else {
                    printReceipt({
                        indosmartInfo: setReceiptIndosmartInfo(indosmartRes, false, false, true, false, false)
                    });
                }

                renderIndosmartInfo(indosmartRes, false, false, true, false, false);

            }

            INDOSMART.processIndosmartTransaction();
        } else {
            INDOSMART.processIndosmartTransaction();
        }
    }
}

/**
 * Function that will format datetime used by topup param.
 * @returns String representation of the formatted datetime.
 */
INDOSMART.formatIndosmartTxDateTime = function(date) {
    var dateStr = $.datepicker.formatDate("yymmdd", date);
    var hours = (date.getHours() < 10 ? "0" : "") + date.getHours();
    var minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    var seconds = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
    return dateStr + "T" + hours + ":" + minutes + ":" + seconds;
}

/**
 * Sends Indosmart request to simpatindo server. This function is used to reload
 * electronic voucher. Will return an error if no response from the server.
 *
 * @param data
 *            containing the data related to topup
 */
INDOSMART.sendIndosmartRequest = function(data) {
    console.log("Request Indosmart");
    console.log(data);

    var url = getConfigValue("INDOSMART_MAIN_URL");
    var drcUrl = getConfigValue("INDOSMART_DRC_URL");
    var isDrcServerUrlUsed = false;
    var response = null;
    var retries = 0;
    var cashierId = loggedInUsername; //hotfix - remove test data
    var storeCode = configuration.storeCode.toLowerCase();
    var posTerminalCode = configuration.terminalCode.toLowerCase();
    var dateNow = INDOSMART.formatIndosmartTxDateTime(new Date());
    var partnerTxId = saleTx.transactionId +
        (data.seqIndosmartNum !== "" && data.seqIndosmartNum !== null ? data.seqIndosmartNum + 1 : ""); // add 1 because seqIndosmartNum starts at 0.

    if (data.serverTxId)
        partnerTxId = data.serverTxId;

    var params = {
        processingCode: getConfigValue('INDOSMART_PROCESSING_CODE'),
        transactionId: partnerTxId,
        transactionDateTime: dateNow,
        destination: data.pNum,
        amount: INDOSMART.getValue(data.name),
        voucherType: INDOSMART.getVoucherType(data.name),
        pin: getConfigValue('INDOSMART_PIN'),
        merchantType: getConfigValue('INDOSMART_MERCHANT_TYPE'),
        terminalId: getConfigValue('INDOSMART_TERMINAL_ID'),
        merchantId: getConfigValue('INDOSMART_MERCHANT_ID'),
        cardNumber: INDOSMART.getCardNumber(data.name),
        url: url
    }

    // var params = {
    //     processingCode: getConfigValue('INDOSMART_PROCESSING_CODE'),
    //     transactionId: partnerTxId,
    //     transactionDateTime: dateNow,
    //     destination: data.pNum,
    //     amount: INDOSMART.getValue(data.name),
    //     voucherType: INDOSMART.getVoucherType(data.name),
    //     pin: '123789',
    //     merchantType: getConfigValue('INDOSMART_MERCHANT_TYPE'),
    //     terminalId: '28038001',
    //     merchantId: '1830',
    //     cardNumber: INDOSMART.getCardNumber(data.name)
    // }

    console.log(params);

    var reqErrCode = null;
    var reqStatus = null;
    var reqErrMsg = null;

    // request must be from proxy server, cant make ajax request to a remote
    // domain.
    var stop = false;
    while (!stop) {
        $.ajax({
            type: 'POST',
            url: posWebContextPath + '/cashier/indosmart/topup',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: "application/json",
            async: false,
            timeout: getConfigValue("INDOSMART_TIME_OUT") * 1000,
            beforeSend: function() {
                $("#loadingDialogMessage").html("Request INDOSMART");
                $("#loading-dialog").dialog("open");
            },
            success: function(res) {
                uilog("DBUG", "INDOSMART response: " + JSON.stringify(res));
                if (!res.status) {
                    ++retries;
                } else {
                    if (typeof res.data == 'object') {
                        stop = true;
                        response = res;
                    } else {
                        ++retries;
                    }
                }
            },
            error: function(jqXHR, status, error) {
                response = error;
                ++retries;
                uilog("DBUG", "INDOSMART error: " + error);
            },
            complete: function(jqXHR, status) {
                $("#loading-dialog").dialog("close");
            }
        });


        if (retries == Number(getConfigValue("INDOSMART_MAX_CON_RETRY"))) {
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
            partnerTrxId: partnerTxId
        };
    }

    console.log(response);
    return response;
}

INDOSMART.sendInquiryRequest = function(data) {
    console.log("Request Indosmart");
    console.log(data);

    var url = getConfigValue("INDOSMART_MAIN_URL");
    var drcUrl = getConfigValue("INDOSMART_DRC_URL");
    var isDrcServerUrlUsed = false;
    var response = null;
    var retries = 0;
    var cashierId = loggedInUsername; //hotfix - remove test data
    var storeCode = configuration.storeCode.toLowerCase();
    var posTerminalCode = configuration.terminalCode.toLowerCase();
    var dateNow = INDOSMART.formatIndosmartTxDateTime(new Date());

    var partnerTxId = saleTx.transactionId +
        (data.seqIndosmartNum !== "" && data.seqIndosmartNum !== null ? data.seqIndosmartNum + 1 : ""); // add 1 because seqIndosmartNum starts at 0.

    var params = {
        refReferenceNo: data.indosmartId,
        processingCode: getConfigValue('INDOSMART_PROCESSING_CODE'),
        transactionId: partnerTxId,
        transactionDateTime: dateNow,
        pin: getConfigValue('INDOSMART_PIN'),
        merchantType: getConfigValue('INDOSMART_MERCHANT_TYPE'),
        terminalId: getConfigValue('INDOSMART_TERMINAL_ID'),
        merchantId: getConfigValue('INDOSMART_MERCHANT_ID'),
        url: url
    }

    console.log(params);

    var reqErrCode = null;
    var reqStatus = null;
    var reqErrMsg = null;

    // request must be from proxy server, cant make ajax request to a remote
    // domain.
    var stop = false;
    while (!stop) {
        $.ajax({
            type: 'POST',
            url: posWebContextPath + '/cashier/indosmart/inquiry',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: "application/json",
            async: false,
            timeout: getConfigValue("INDOSMART_TIME_OUT") * 1000,
            beforeSend: function() {
                $("#loadingDialogMessage").html("Request INDOSMART");
                $("#loading-dialog").dialog("open");
            },
            success: function(res) {
                uilog("DBUG", "INDOSMART response: " + JSON.stringify(res));
                if (!res.status) {
                    ++retries;
                } else {
                    if (typeof res.data == 'object') {
                        stop = true;
                        response = res;
                    } else {
                        ++retries;
                    }
                }
            },
            error: function(jqXHR, status, error) {
                response = error;
                ++retries;
                uilog("DBUG", "INDOSMART error: " + error);
            },
            complete: function(jqXHR, status) {
                $("#loading-dialog").dialog("close");
            }
        });


        if (retries == Number(getConfigValue("INDOSMART_MAX_CON_RETRY"))) {
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
            partnerTrxId: partnerTxId
        };
    }

    console.log(response);
    return response;
}

/**
 * Retrieves a TopUp Transaction usinf transaction id and TopUp Id
 */
INDOSMART.findIndosmartTransaction = function(txnId, indosmartId) {
    var indosmart = null;
    $.ajax({
        url: posWebContextPath + "/cashier/indosmart/getIndosmartTxn/" + txnId + "/" + indosmartId,
        type: "GET",
        async: false,
        dataType: "json",
        contentType: "application/json",
        success: function(response) {
            console.log(response);
            if (jQuery.isEmptyObject(response))
                uilog("DBUG", "Indosmart Transaction is un-available");
            else {
                uilog("DBUG", "Indosmart Transaction is searchable.");
                indosmart = response;
            }
        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", "Indosmart Transaction Not Found");
        }
    });
    return indosmart;
}

INDOSMART.saveIndosmartTransaction = function(data) {
    return $.ajax({
        url: posWebContextPath + "/cashier/saveIndosmartTransaction/" + saleTx.transactionId,
        type: "POST",
        async: false,
        dataType: "json",
        contentType: "application/json",
        // data : JSON.stringify(data), --calculate the change
        data: JSON.stringify(PAYMENT_MEDIA.finalizeSaleTxLastPaymentAmount(data)),
        success: function(response) {
            uilog("DBUG", "Indosmart saved.");
        },
        error: function(jqXHR, status, error) {
            showMsgDialog("Saving of Indosmart Tx failed: " + error, "error");
        }
    });
}
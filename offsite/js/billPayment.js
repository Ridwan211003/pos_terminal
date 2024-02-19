var BILL_PAYMENT = BILL_PAYMENT || {};

/**
 * Constants for different web service types.
 */
BILL_PAYMENT.constants = {
    retrieve: 'RETRIEVE_CUSTOMER_INFO',
    sendPayment: 'SEND_PAYMENT',
    inquire: 'PAYMENT_INQUIRY'
};

/**
 * Contains information for every bill payment type.
 */
BILL_PAYMENT.types = {
    MEGA_FINANCE_INSTALLMENT: {
        id: "MEGA_FINANCE_INSTALLMENT",
        name: "MEGA FINANCE INSTALLMENT",
        desc: "Bill payment for Mega Finance Installment",
        code: "MF"
    },
};

/**
 * Gets the matching payment type from BILL_PAYMENT.types based on specified id.
 * @param id - BILL_PAYMENT.types id.
 * @return BILL_PAYMENT.types - representation of Bill Payment type.
 */
BILL_PAYMENT.getPaymentType = function getPaymentType(id) {
    for (var i in BILL_PAYMENT.types) {
        if (BILL_PAYMENT.types[i].id == id) {
            return BILL_PAYMENT.types[i];
        }
    }
}

/**
 * Global variables
 */
BILL_PAYMENT.variables = {
    paymentType: null,
    transactionType: null,
    customerId: null
};

/**
 * Web service URLs.
 */
BILL_PAYMENT.url = {
    dataInquiry: "/InquiryData",
    sendPayment: "/Payment",
    statusInquiry: "/InquiryStatus"
};

BILL_PAYMENT.isBillPaymentTansaction = function() {
    if (!jQuery.isEmptyObject(saleTx.billPaymentItem)) {
        return true;
    }
    return false;
};

/**
 * Generates the request form.
 * @param requestId see BILL_PAYMENT.constants.
 * @return Object - contains data needed for every web service URL.
 */
BILL_PAYMENT.createRequest = function(requestId, params) {
    var billPaymentData = {};

    //base request
    billPaymentData.AgentID = getConfigValue("BILL_PAY_AGENT_ID");
    billPaymentData.AgentPIN = getConfigValue("BILL_PAY_AGENT_PIN");
    billPaymentData.AgenttrxID = saleTx.transactionId; //should only use one transactionId during the entire process
    billPaymentData.AgentstoreID = configuration.storeCode.toLowerCase();
    billPaymentData.ProductID = BILL_PAYMENT.variables.paymentType.code;
    billPaymentData.CustomerID = params ? params.customerId : null; //"BDG1301572";
    billPaymentData.DatetimeRequest = BILL_PAYMENT.util.formatBillPaymentDateTime(new Date());

    //additional params per requestId
    switch (requestId) {
        case BILL_PAYMENT.constants.sendPayment:
            billPaymentData.PaymentPeriod = params ? params.paymentPeriod : 0;
            billPaymentData.Amount = params ? params.netAmount : 0;
            billPaymentData.Charge = params ? params.penaltyFee : 0;
            billPaymentData.Total = params ? params.totalAmount : 0;
            billPaymentData.AdminFee = params ? params.adminFee : 0;
    }

    billPaymentData.Signature = BILL_PAYMENT.util.generateSignature(billPaymentData);

    uilog("DBUG", "Execute BILL_PAYMENT.createRequest | billPaymentData: ", billPaymentData);

    return billPaymentData;
}

/**
 * Generic AJAX call function
 * @param params - parameters to supply for the AJAX call (ex. url, data, success/error callbacks, etc.)
 */
BILL_PAYMENT.sendRequest = function(params) {
    $.ajax({
        url: params.url,
        type: params.type == undefined ? "GET" : params.type,
        cache: false,
        dataType: params.dataType == undefined ? "json" : params.dataType,
        data: params.data,
        contentType: params.contentType == undefined ? "application/json" : params.contentType,
        async: params.async == false ? false : true,
        timeout: params.timeout ? timeout : null,
        beforeSend: function() {
            if (params.beforeSend) {
                params.beforeSend();
            }
        },
        complete: function() {
            $("#bpLoading-dialog").dialog("close");
            $("#bpLoadingDialogMessage").html("");

            if (params.complete) {
                params.complete();
            }
        },
        success: function(data, textStatus, jqXHR) {
            if (jqXHR.statusText == "OK") {
                if (params.success) {
                    params.success(data);
                }
            } else {
                //TODO: Retry to connect up to n times
                showMsgDialog(getMsgValue("bp_error_unreachable_server"), "error");

                if (params.error) {
                    params.error({ status: jqXHR.statusText });
                }
            }
        }
    });
};

/**
 * Retrieves the information of the specified customer id.
 * @param customerId - contract number.
 */
BILL_PAYMENT.retrieveCustomerInfo = function(customerId) {
    var bpData = BILL_PAYMENT.createRequest(BILL_PAYMENT.constants.retrieve, { customerId: customerId });

    BILL_PAYMENT.sendRequest({
        url: proxyUrl + "/billPaymentRequest",
        data: {
            bpUrl: getConfigValue("BILL_PAY_URL") + BILL_PAYMENT.url.dataInquiry,
            params: bpData,
            timeout: getConfigValue("BILL_PAY_TIMEOUT")
        },
        dataType: "text",
        async: false,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_data_inquiry"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(data) {
            var response = BILL_PAYMENT.parseResponse(data, BILL_PAYMENT.constants.retrieve);

            if (response.responseCode == 0) {
                $("#billPaymentContractInfo-dialog").data("billPaymentInfo", response)
                    .dialog("open");
                $("#billPaymentContractNumInputField").val("");
                $("#billPaymentContractNumInput-dialog").dialog("close");
            } else {
                showMsgDialog(getMsgValue("bp_error_response").format(response.responseCode, response.responseDescription), "error");
            }
        }
    });
};

/**
 * Sends a request for payment.
 * @param billPaymentItem - representation of BillPaymentItemDTO.
 * @return Object - if request was successful, returns the parsed response; else, returns null.
 */
BILL_PAYMENT.sendPayment = function(billPaymentItem) {
    var response = null;
    var bpData = BILL_PAYMENT.createRequest(BILL_PAYMENT.constants.sendPayment, billPaymentItem);

    BILL_PAYMENT.sendRequest({
        url: proxyUrl + "/billPaymentRequest",
        data: {
            bpUrl: getConfigValue("BILL_PAY_URL") + BILL_PAYMENT.url.sendPayment,
            params: bpData,
            timeout: getConfigValue("BILL_PAY_TIMEOUT")
        },
        dataType: "text",
        async: false,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_send_payment"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(data, textStatus, jqXHR) {
            response = data;
        }
    });

    return BILL_PAYMENT.parseResponse(response, BILL_PAYMENT.constants.sendPayment);
};

/**
 * Inquires about the payment status.
 * @param billPaymentItem - represenation of BillPaymentItemDTO.
 * @return Object - if request was successful, returns the parsed response; else, returns null.
 */
BILL_PAYMENT.inquirePaymentStatus = function(billPaymentItem) {
    var response = null;
    var bpData = BILL_PAYMENT.createRequest(BILL_PAYMENT.constants.inquire, billPaymentItem);

    BILL_PAYMENT.sendRequest({
        url: proxyUrl + "/billPaymentRequest",
        data: {
            bpUrl: getConfigValue("BILL_PAY_URL") + BILL_PAYMENT.url.statusInquiry,
            params: bpData,
            timeout: getConfigValue("BILL_PAY_TIMEOUT")
        },
        dataType: "text",
        async: false,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_status_inquiry"));
            $("#bpLoading-dialog").dialog("open");
        },
        success: function(data, textStatus, jqXHR) {
            response = data;
        }
    });

    return BILL_PAYMENT.parseResponse(response, BILL_PAYMENT.constants.inquire);
};

/**
 * Creates billpaymentDTO object from the Mega Finance web service reponse.
 * @param response - AJAX response to parse.
 * @param requestId - type of web service call (see BILL_PAYMENT.constans).
 * @return Object - parsed response (see BillPaymentItemDTO).
 */
BILL_PAYMENT.parseResponse = function(response, requestId) {
    var billPaymentItem = new Object();

    if (response) {
        var delimited = response.split("|");

        //base response
        billPaymentItem.transactionDate = new Date();
        billPaymentItem.type = BILL_PAYMENT.variables.paymentType.id;
        billPaymentItem.transactionAgentId = delimited[2];
        billPaymentItem.customerId = delimited[4];

        if (requestId == BILL_PAYMENT.constants.retrieve) {
            billPaymentItem.responseCode = delimited[6];
            billPaymentItem.responseDescription = delimited[7];
            billPaymentItem.paymentPeriod = delimited[9];
            billPaymentItem.customerName = delimited[10];
            billPaymentItem.customerInfo = delimited[11];
            billPaymentItem.deadlineTime = delimited[12];
            billPaymentItem.netAmount = delimited[13];
            billPaymentItem.penaltyFee = delimited[14];
            billPaymentItem.adminFee = delimited[15];
            billPaymentItem.totalAmount = delimited[16];
            billPaymentItem.policyNumber = BILL_PAYMENT.util.getPolicyNumber(billPaymentItem.customerInfo);
            billPaymentItem.itemType = BILL_PAYMENT.util.getItemType(billPaymentItem.customerInfo);
        } else if (requestId == BILL_PAYMENT.constants.sendPayment ||
            requestId == BILL_PAYMENT.constants.inquire) {
            billPaymentItem.paymentPeriod = delimited[6];
            billPaymentItem.netAmount = delimited[7];
            billPaymentItem.penaltyFee = delimited[8];
            billPaymentItem.totalAmount = delimited[9];
            billPaymentItem.adminFee = delimited[10];
            billPaymentItem.responseCode = delimited[11];
            billPaymentItem.responseDescription = delimited[12];
            billPaymentItem.referenceCode = delimited[14];
            billPaymentItem.additionalInfo = delimited[15];
        }
    }

    uilog("DBUG", "Execute BILL_PAYMENT.parseResponse | billPaymentItem: ", billPaymentItem);

    return billPaymentItem;
};

/**
 * Resets all Bill Payment-related global variables to their default values.
 */
BILL_PAYMENT.refreshBillPayment = function() {
    BILL_PAYMENT.variables.paymentType = null;
    BILL_PAYMENT.variables.transactionType = null;
    BILL_PAYMENT.variables.customerId = null;
};

/**
 * Sends the payment and saves the Bill Payment transaction.
 * @param saleTx - representation of PosTransactionDTO.
 */
BILL_PAYMENT.processBillPaymentTransaction = function(saleTx) {
    var clonedBillPaymentItem = cloneObject(saleTx.billPaymentItem);
    var response = BILL_PAYMENT.sendPayment(saleTx.billPaymentItem);

    if (response) {
        if (response.responseCode == 0) {
            saleTx.billPaymentItem = response;
            saleTx.billPaymentItem.customerName = clonedBillPaymentItem.customerName;
            saleTx.billPaymentItem.customerInfo = clonedBillPaymentItem.customerInfo;
            saleTx.billPaymentItem.deadlineTime = clonedBillPaymentItem.deadlineTime;
            saleTx.billPaymentItem.itemType = clonedBillPaymentItem.itemType;
            saleTx.billPaymentItem.policyNumber = clonedBillPaymentItem.policyNumber;

            saleTx.billPaymentItem.status = 'SUCCESS';
            //should only save if response is sukses

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

                    /**
                     * Print header and body first before printing summary if hypercash enabled
                     **/
                    if (isHcEnabled) {
                        Hypercash.printer.printTransactionWithHeaderAndBody(detailsToPrint);
                    } else {
                        printReceipt(detailsToPrint);
                    }
                }
            }, function(error) {
                uilog('DBUG', 'FAIL: ' + error);
            });
        } else {
            //TODO: process error here
            saleTx.billPaymentItem.status = 'FAILED';

            if (response.responseCode && response.responseDescription) {
                showMsgDialog(getMsgValue("bp_error_response").format(response.responseCode, response.responseDescription), "error");
            }

            //var response = BILL_PAYMENT.inquirePaymentStatus();
            saleTx.payments = [];
            saleTx.totalAmountPaid = 0;
        }
    }
};

/**
 * Method that converts bill payment item to scanned pos tx item.
 * @param billPaymentInfo - representation of BillPaymentItemDTO.
 * @return Object - representation of PosTxItemDTO.
 */
BILL_PAYMENT.getItemInfoList = function(billPaymentInfo) {
    var itemInfoList = [];

    if (billPaymentInfo) {
        var billPaymentType = BILL_PAYMENT.getPaymentType(billPaymentInfo.type);

        var itemInfo = {
            name: billPaymentType.name,
            description: billPaymentType.desc,
            currentPrice: billPaymentInfo.totalAmount,
            priceUnit: billPaymentInfo.totalAmount,
            quantity: 1,
            itemTotal: billPaymentInfo.totalAmount,
            salesType: 'BILL_PAYMENT',
            shortDesc: billPaymentType.name,
            productId: billPaymentType.id,
            priceSubtotal: billPaymentInfo.totalAmount
        }
    }

    itemInfoList.push(itemInfo);
    return itemInfoList;
};


BILL_PAYMENT.util = {
    /**
     * Applies the date time format (YYYYMMDDhh24mmss) required for the web service request (e.g. 20150211173401).
     * @param date - date to format.
     * @return String - formatted date.
     */
    formatBillPaymentDateTime: function(date) {
        var fDate = $.datepicker.formatDate("yymmdd", date);
        var hh = (date.getHours() < 10 ? "0" : "") + date.getHours();
        var mm = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
        var ss = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();

        return fDate + hh + mm + ss;
    },

    /**
     * Generates the hashed signature required for the web service request.
     * @param billPaymentData - representation of BillPaymentItemDTO.
     * @return String - hashed signature.
     */
    generateSignature: function(billPaymentData) {
        var concat = "";
        var secretKey = getConfigValue("BILL_PAY_SECRET_KEY");

        if (billPaymentData) {
            $.each(billPaymentData, function(index, value) {
                concat += value;
            });

            concat = $.sha1(concat + secretKey);
        }

        uilog("DBUG", "Execute BILL_PAYMENT.util.generateSignature | signature: ", concat);

        return concat;
    },

    /**
     * 
     */
    getPolicyNumber: function(customerInfo) {
        var policyNumber;

        try {
            if (customerInfo && customerInfo.indexOf("#") > -1) {
                var customerInfoArr = customerInfo.split(" ");

                for (var ctr = 0; ctr < customerInfoArr.length; ctr++) {
                    if (customerInfoArr[ctr].indexOf("#") > -1) {
                        policyNumber = customerInfoArr[ctr];
                        break;
                    }
                }
            }

            if (policyNumber) {
                policyNumber = policyNumber.substring(policyNumber.indexOf("#") + 1);
            }

        } catch (e) {
            uilog("DBUG", "Error in parsing policy number: ", e);
        }

        return policyNumber;
    },

    /**
     * 
     */
    getItemType: function(customerInfo) {
        var itemType;
        var policyNumIndex;
        var customerInfoArr = [];

        try {

            if (customerInfo && customerInfo.indexOf("#") > -1) {
                customerInfoArr = customerInfo.split(" ");

                for (var ctr = 0; ctr < customerInfoArr.length; ctr++) {
                    if (customerInfoArr[ctr].indexOf("#") > -1) {
                        policyNumIndex = ctr;
                        break;
                    }
                }
            }

            if (policyNumIndex) {
                customerInfoArr.splice(policyNumIndex, 1);
                itemType = customerInfoArr.join(" ");
            }

        } catch (e) {
            uilog("DBUG", "Error in parsing item type: ", e);
        }

        return itemType;
    }

};
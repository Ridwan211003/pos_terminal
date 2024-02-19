var ADAF = ADAF || {};

ADAF.ajax = ADAF.ajax || {};

ADAF.ajax.getItem = function(data) {
    console.log(data);
    var result = null;
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/adaf/getItem',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: "application/json",
        async: false,
        timeout: 10000,
        beforeSend: function() {
            $("#loadingDialogMessage").html("Get Item From MD Portal");
            $("#loading-dialog").dialog("open");
        },
        success: function(response) {
            uilog("DBUG", "ADAF inquiry response: " + JSON.stringify(response));
            result = response;
        },
        error: function(jqXHR, status, error) {
            result = error;
            uilog("DBUG", "ADAF inquiry error: " + error);
        },
        complete: function(jqXHR, status) {
            $("#loading-dialog").dialog("close");
        }
    });
    console.log(result);
    return result;
}

ADAF.getItem = function(data) {
    data.store_code = saleTx.storeCd.toLowerCase();
    var req = ADAF.ajax.getItem(data);
    console.log(req);

    try {
        if (typeof req == "object") {
            if (req.success) {
                var result = req.result;
                console.log(result);

                if (result.success) {
                    if (Array.isArray(result.data) && result.data.length) {
                        var data = result.data[0];
                        console.log(data);
                        var item = findItem(data.adfdi_barcode);
                        item.currentPrice = data.adfdi_price_final;
                        item.priceUnit = data.adfdi_price_final;
                        item.priceSubtotal = data.adfdi_price_final;
                        item.weight = 0;
                        item.isHotSpiceItem = false;
                        item.isUsedADAF = true;
                        item.ADAFData = data;
                        item.promotions = [];

                        console.log("Process sale scan next");
                        console.log(item);
                        processSaleScanNext(item);
                        console.log(saleTx.orderItems);
                        $("#ADAF-dialog").dialog("close");
                    } else {
                        showMsgDialog("ADFD ID Not Found or Already Used.", "warning");
                    }
                } else {
                    console.log(result.msg);
                    showMsgDialog(result.msg, "warning"); //md portal server error           
                }
            } else {
                //trouble connection from store server to md portal
                console.log(req.errmsg);
                showMsgDialog(req.errmsg, "warning"); //md portal server error
            }
        } else {
            //trouble connection to store server
            console.log(req);
            showMsgDialog(req, "warning");
        }
    } catch (err) {
        console.log(err);
        showMsgDialog("Something wrong : \n" + err, "error");
    }
    return;
}
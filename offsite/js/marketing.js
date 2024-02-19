/***********************************************
 * datatables functions for marketingAds pages here
 ***********************************************/
function renderMarketingAdActions(data, type, full){
    var marketingType = getMarketingAdPromotionType(data);
    var isActiveMode;
    var isCashierOffline;
    var a = "";
    if (marketingType == 'CuWLA' || marketingType == 'CuRLA') {
        isActiveMode = false;
        var url = "/marketing/popUpCustomerPreviewSingle/"+marketingType+"/"+data+"/"+isActiveMode+"";
        a = "<a href='' id='openSinglePreview' onclick='viewSinglePreview(\""+url+"\");return false;'>View</a>"
    } else if (marketingType == 'CuWSA' || marketingType == 'CuRSA') {
        isActiveMode = true;
        var url = "/marketing/popUpCustomerPreviewSingle/"+marketingType+"/"+data+"/"+isActiveMode+"";
        a = "<a href='' id='openSinglePreview' onclick='viewSinglePreview(\""+url+"\");return false;'>View</a>"
    } else if(marketingType == 'CuCOA') {
    	isCashierOffline=true;
    	var url = "/marketing/popUpCashierOfflinePreviewSingle/"+marketingType+"/"+data+"/"+isCashierOffline+"";
        a = "<a href='' id='openSinglePreview' onclick='viewSinglePreview(\""+url+"\");return false;'>View</a>"
    } else if(marketingType == 'CaRR' || marketingType == 'CaPR') {
        var url = "/marketing/popUpCashierPreviewSingle/"+marketingType+"/"+data+"";
        a = "<a href='' id='openSinglePreview' onclick='viewSinglePreview(\""+url+"\");return false;'>View</a>"
    }
    a +=" "+"<a href='' onclick='confirmMarketingAdDelete(\""+data+"\",\""+full.title+"\");return false;'>Delete</a>";
    return a;
}

function confirmMarketingAdDelete(data, name){
    showConfirmDialog("Do you want to delete the Ad: "+name+"?","Delete",function(){
        deleteMarketingAd(data);
    });
}

function deleteMarketingAd(id){
    $("#deleteAdForm #adId").val(id);
    $("#deleteAdForm").submit();
}

function getMarketingAdPromotionType(id) {
    var marketingType = null;
    $.ajax({
        url : webContextPath + "/marketing/getMarketingAdPromotionType",
        type : "GET",
        async : false,
        dataType : "text",
        data : {
            id : id
        },
        success : function(res) {
            marketingType = res;
        },
        error : function(jqXHR, status, error) {
            showMsgDialog("Error : " + error,"error");
        }
    });
    return marketingType;
}

function viewSinglePreview(url) {
    // call openModal
    openModal(webContextPath + url, 630, 830, "Screen Preview");
}

/***********************************************
 * datatables functions for marketingConfigs pages here
 ***********************************************/
function updateConfiguration(obj) {
    var target = $("#"+obj.id).closest("tr").find("td:nth-child(2)");

    if ($("#"+obj.id).html() == "Save") {
        var newValue;

        if ($("#"+obj.name+"-input").length)
            newValue = $("#"+obj.name+"-input").val();
        else
            newValue = $("#"+obj.name+"-select").val();

        updateConfigValue(obj.name,newValue);

        target.html(newValue);
        $("#"+obj.id).html("Update");
    } else {
        var val = target.html();
        var enums = getConfigCodeEnumeration(obj.name);
        var element;

        if (enums.length) {
            element = $("<select id='"+obj.name+"-select' />");
            enums.forEach(function(key) {
                var opt = $("<option />").val(key.code).text(key.description);
                if (val == key.code)
                    opt.prop('selected', true);
                element.append(opt);
            });
        } else if (val.toLowerCase() === "true" || val.toLowerCase() === "false") {
            var options = [true,false];
            val = (val.toLowerCase() === "true");

            element = $("<select id='"+obj.name+"-select' />");
            options.forEach(function(key) {
                var opt = $("<option />").val(key).text(key);
                if (val == key)
                    opt.prop('selected', true);
                element.append(opt);
            });
        } else {
            element = $("<input id='"+obj.name+"-input' type='text' />");
            element.attr("value",val);
        }

        target.html(element);
        $("#"+obj.id).html("Save");
    }
}

function resetConfiguration(obj) {
    var target = $("#"+obj.id).closest("tr").find("td:nth-child(2)");
    target.html(resetConfigValue(obj.name));
}

function resetAllConfiguration(obj) {
    resetAllConfigValue();
    dTable_configListTable.fnDraw();
}

function configListMarketingAction(data, type, full) {
    return "<a href='' id='"+full.configCode+"-button' name='"+full.configCode+"' onclick='updateConfiguration(this);return false;'>Update</a>" +
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<a href='' id='"+full.configCode+"-resetButton' name='"+full.configCode+"' onclick='resetConfiguration(this);return false;'>Default</a>"
}

function updateConfigValue(configCode,newValue) {
    $.ajax({
        url : webContextPath + "/sys/conf/updateConfig",
        type : "POST",
        async : false,
        dataType : "json",
        data : {
            configCode : configCode,
            newValue : newValue
        },
        success : function(res) {
            if (res) {
                showInfoMsg(res.description + " updated.");
            } else {
                showInfoMsg("Error encountered. Update unsuccessful.");
            }
        },
        error : function(jqXHR, status, error) {
            showMsgDialog("Error : " + error,"error");
        }
    });
}

function resetConfigValue(configCode) {
    var newConfigValue;
    $.ajax({
        url : webContextPath + "/sys/conf/resetMarketingConfig",
        type : "POST",
        async : false,
        dataType : "json",
        data : {
            configCode : configCode
        },
        success : function(res) {
            if (res) {
                showInfoMsg(res.description + " restored to default value.");
                newConfigValue = res.configValue;
            } else {
                showInfoMsg("Error encountered. Restore unsuccessful.");
            }
        },
        error : function(jqXHR, status, error) {
            showMsgDialog("Error : " + error,"error");
        }
    });
    return newConfigValue;
}

function resetAllConfigValue() {
    $.ajax({
        url : webContextPath + "/sys/conf/resetAllMarketingConfig",
        type : "POST",
        async : false,
        dataType : "json",
        success : function(res) {
            if (res) {
                showInfoMsg("Marketing configurations restored to default values.");
            } else {
                showInfoMsg("Error encountered. Restore unsuccessful.");
            }
        },
        error : function(jqXHR, status, error) {
            showMsgDialog("Error : " + error,"error");
        }
    });
}

function getConfigCodeEnumeration(configCode) {
    return JSON.parse($.ajax({
        url : webContextPath + "/marketing/getConfigCodeEnumeration",
        type : "GET",
        async : false,
        dataType : "json",
        data : {
            enumType : configCode
        },
        error : function(jqXHR, status, error) {
            showMsgDialog("Error : " + error,"error");
        }
    }).responseText);
}

function showInfoMsg(msg) {
    $("#infoMsgDiv").html(msg).stop().css('opacity','1.0').show().fadeOut(10000);
}

$(document).ready(function() {

    var isActiveMode;
    var isCashierOffline;
    $("#openCashierPreview").click(function() {
        openModal(webContextPath + "/marketing/popUpCashierPreview", 630, 830, "Cashier Screen Preview");
    });

    $("#openCustomerStandbyPreview").click(function() {
        isActiveMode = false;
        openModal(webContextPath + "/marketing/popUpCustomerPreview/" + isActiveMode, 630, 830, "Customer Standby Screen Preview");
    });

    $("#openCustomerActivePreview").click(function() {
        isActiveMode = true;
        openModal(webContextPath + "/marketing/popUpCustomerPreview/" + isActiveMode, 630, 830, "Customer Active Screen Preview");
    });
    
    $("#openCashierOfflinePreview").click(function() {
    	isCashierOffline = true;
        openModal(webContextPath + "/marketing/popUpCashierOfflinePreview/" + isCashierOffline, 630, 830, "Cashier Offline Screen Preview");
    });

    $("#resetAllMarketingConfig").click(function() {
        resetAllConfiguration(this);
    });
});

function openModal(url, height, width, title) {
    var horizontalPadding = 30;
    var verticalPadding = 30;
    setTimeout(function(){
        $('<iframe id="modalCashierPreview" src="' + url + '" frameBorder="0"/>').dialog({
            title: (title) ? title : 'Preview',
            autoOpen: true,
            width: width,
            height: height,
            modal: true,
            resizable: false,
            autoResize: false,
            closeOnEscape: true,
            overlay: {
                opacity: 0.5,
                background: "black"
            }
        }).width(width - horizontalPadding).height(height - verticalPadding);
    }, 1000);
    $('html, body').scrollTop(0);  
}

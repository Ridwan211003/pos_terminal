$(document).ready(function () {
	$(".csh-scr-2, .csh-scr-3, .ui-dialog, #inline_functioncontent, #inline_paymentmediacontent, #inline_othercontent").click(function(event) {
        uilog("DBUG","SCR||" + $(event.target).text().replace(/\s\s+/g, ' ') + "(X:" + event.clientX + ",Y:" + event.clientY + ")");
        //uilog("DBUG", "CLICK||X:" + event.clientX + "||Y:" + event.clientY);
    });
	
    //add click coordinate listener
    //document.addEventListener("click", printMousePos);

	// $('.ui-keyboard-button span').on('click', function(){ console.log('SCR: ' + $(this).html()); });

    //disable image dragging
    //need to apply to all image classes
    $('.img').on('dragstart', function (event) {
        event.preventDefault();
    });
    //Set build version display.
    //$("#buildversion").html(appBuildVersion);

    $("#popup-message-dialog").dialog({
        modal: true,
        autoOpen: false,
        closeOnEscape: false,
        /*
         * Increasing by 100, from the default 1000,
         * to be always infront although the more functions/buttons dialog is up
         */
        //	zIndex: 5000, // not working
        dialogClass: "no-close"
    });

    $("#popup-confirm-dialog").dialog({
        modal: true,
        autoOpen: false,
        closeOnEscape: false,
        dialogClass: "no-close",
    });
});

/*function printMousePos(event) {
    uilog("DBUG", "CLICK||X:" + event.clientX + "||Y:" + event.clientY);
}*/

function getMyFuncName() {
    var ownName = arguments.callee.caller.toString();
    ownName = ownName.substr('function '.length);        // trim off "function "
    ownName = ownName.substr(0, ownName.indexOf('('));        // trim off everything after the function name
    return ownName ;
}

function uilog(lvl, msg)
{
    try
    {
        $.ajax({
            url: proxyUrl + "/uilog",
            type: "POST",
            async: true,
            dataType: "json",
            data: JSON.stringify({'lvl': lvl, 'msg': msg})
        });
    } catch (e) {
    }

    if(typeof msg == 'string' && msg.indexOf('SCR||') < 0) console.log(msg);
}

/**
 * method for date and clock display in screens.
 */
function clock() {
    var now = new Date();
    var monthNames = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    var dateStr = now.getDate() + '/' + monthNames[now.getMonth()] + '/' + now.getFullYear();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

    document.getElementById('clockDiv').innerHTML = dateStr + ' ' + strTime;
    setTimeout('clock()', 1000);
}

/**
 * Return config value using the config code specified
 * @param code config code
 * @returns config value
 */
function getConfigValue(code) {
    return (code
            && configuration
            && configuration.properties) ? configuration.properties[code] : null;
}

/**
 * Return message value using the code specified
 * @param key/code of message
 * @returns message value
 */
function getMsgValue(code) {
    return (code
            && messages) ? messages[code] : null;
}

/**
 * Adds commas to money for displaying.
 * @param val - price/money values
 * @returns string representation of number with commas
 */
function numberWithCommas(val) {
    var renderedVal = new String(val);
    return renderedVal.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Remove leading zeroes.
 * val is substituted to new variable to keep the val in original form/value.
 * @param val
 * @returns String of val;
 */
function removeLeadingZeroes(val) {
    var clonedVal = new String(val);
    return clonedVal.replace(/^0+/, '');
}

/**
 * Remove leading zeroes.
 * val is substituted to new variable to keep the val in original form/value.
 * @param val
 * @returns String of val;
 */
function removeLeadingCharacter(val, character) {
    var clonedVal = new String(val);
    while (clonedVal.substr(0, 1) === ' ') {
        clonedVal = clonedVal.substr(1, clonedVal.length - 1);
    }
    return clonedVal;
}

function addLeadingCharacter(val, length, character) {
    var clonedVal = new String(val);
    for (var ctr = length - clonedVal.length; ctr > 0; ctr--) {
        clonedVal = character + clonedVal;
    }
    return clonedVal;
}

/**
 * Clones an object or an array object.
 * @param obj object to be cloned.
 * @returns an immutable clone object.
 */
function cloneObject(obj) {
    if ($.isArray(obj)) {
        return jQuery.extend(true, new Array(), obj);
    } else {
        return jQuery.extend(true, new Object(), obj);
    }
}

/**
 * Checks if a particular variable is a function
 *
 * @param functionToCheck
 * @returns {Boolean}
 */
function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function showKeyNotAllowedMsg() {
    showMsgDialog(getMsgValue('pos_error_msg_key_not_allowed'), "warning");
}

/**
 * Show popup message dialog.
 * @param msg
 * @param type can be type "info", "warning" and "error".
 * @param callBackFunction this will be triggered after pressing OK button.
 */
function showMsgDialog(msg, type, callBackFunction) {
    /*
     <!--
     <div id="popup-message-dialog" title="Information">
     <p id="dialogMsg" class="modalMessage"></p>
     </div>
     -->
     */
	
    var popupMsgDialog = $("<div id='popup-message-dialog' title='Information'></div>");
    var dialogMsg = $("<p id='dialogMsg' class='modalMessage'></p>");
    popupMsgDialog.append(dialogMsg);

    popupMsgDialog.dialog({
        modal: true,
        autoOpen: false,
        closeOnEscape: false,
        /*
         * Increasing by 100, from the default 1000,
         * to be always infront although the more functions/buttons dialog is up
         */
        //	zIndex: 5000, // not working
        dialogClass: "no-close"
    });

    if (type.toLowerCase() == "info") {
        popupMsgDialog.dialog("option", "title", "Information");
    } else if (type.toLowerCase() == "warning") {
        popupMsgDialog.dialog("option", "title", "Warning");
    } else if (type.toLowerCase() == "error") {
        popupMsgDialog.dialog("option", "title", "Error!");
    } else if (type.toLowerCase() == "") {
        popupMsgDialog.dialog("option", "title", "");
    }

//	msg = "<em>"+msg+"</em><br />";
//    dialogMsg.html(msg);
    var msgBlk = $("<em></em>").html(msg);
    dialogMsg.html(msgBlk);
//    dialogMsg.append("<br/>");

    popupMsgDialog.dialog({
        buttons: {
            OK: function (event) {
                dialogMsg.empty();
                $(this).dialog("close");

                // call callback function after dialog close
                if (callBackFunction) {
                    callBackFunction();
                    // set to undefined so that it wont be reuse again.
                    callBackFunction = undefined;
                }
            }
        }
    });
    popupMsgDialog.dialog("open");
	
	uilog('INFO', 'Message Dialog (' + type + '):' + msg);
	
    //remove focus on buttons
    $('.ui-dialog :button').blur();
    //deactivate keyboard enter key
    $('.ui-dialog :button').keypress(function (e) {
        if (e.keyCode && (e.keyCode == 13 || e.keyCode == 10)) {
            e.preventDefault();
        }
    });
}

/**
 * Show popup confirm dialog.
 * @param msg
 * @param title
 * @param okCallBackFunction this will be triggered after pressing OK button.
 */
function showConfirmDialog(msg, title, okCallBackFunction, cancelCallBackFunction) {
    $("#popup-confirm-dialog").dialog("option", "title", title);

    msg = "<em>" + msg + "</em><br />";
    $("#dialogConfirm").html(msg);

    // callback functions will be triggered after pressing OK button.
    $("#popup-confirm-dialog").dialog({
        //width : "auto",
        buttons: {
            OK: function () {
                $("#dialogConfirm").empty();
                $(this).dialog("close");

                // call callback function after dialog close
                if (okCallBackFunction) {
                    okCallBackFunction();
                    // set to undefined so that it wont be reuse again.
                    okCallBackFunction = undefined;
                }
            },
            Cancel: function () {
                $("#dialogConfirm").empty();
                $(this).dialog("close");

                // call callback function after dialog close
                if (cancelCallBackFunction) {
                    cancelCallBackFunction();
                    // set to undefined so that it wont be reuse again.
                    cancelCallBackFunction = undefined;
                }
            }
        }
    });

    $("#popup-confirm-dialog").dialog("open");
}

/*******************************************************************************
 * START : ENUM Class
 ******************************************************************************/
//base class for all anums
var Enum = function (name) {
    //add static methods to the derived class
    //enumerized is a flag, let's do the mixin only once
    if (!this.constructor.enumerized) {
        Enum.doEnum(this.constructor);
        this.constructor.enumerized = true;
    }
    this.name = name;
    this.constructor._addEnumValue(this);
};

//mixins "static" methods to each enum "class"
//@type: the enum "class"(function)
Enum.doEnum = function (type) {
    type.enumValues = [];
    //"static" methods, for convenience will mixin them to each enum class
    type.values = function (concreteEnum) {
        //should return a copy of the array
        return this.enumValues;
    };
    /* Not needed, just use [name]
     type.valueOf = function(name){
     },
     */
    type._addEnumValue = function (obj) {
        this.enumValues.push(obj);
    };
};
/*******************************************************************************
 * END : ENUM Class
 ******************************************************************************/

/*******************************************************************************
 * START : Extended prototype functions for original Javascript objects
 ******************************************************************************/
/**
 * Adding getName functions to all objects, to easily determine its type.
 */
Object.defineProperty(Object.prototype, "getName", {
    value: function () {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec((this).constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    },
    enumerable: false
});
/**
 * Checks whether an array toCheck has a same sExpType type
 * for all its items. If toCheck is not an array, or passed
 * invalid arguments: return false;
 * @param toCheck
 * @param sExpType
 * @returns {Boolean}
 */
function checkIfUniformArrayTypes(toCheck, sExpType) {
    var isUniformTypes = true;
    if (toCheck
            && sExpType
            && toCheck.getName() == "Array") {

        for (var member in toCheck) {
            if (toCheck[member].getName() != sExpType) {
                isUniformTypes = false;
                break;
            }
        }
    } else {
        isUniformTypes = false;
        uilog("DBUG", ">> Invalid arguments, or not an Array");
    }
    return isUniformTypes;
}
;
/**
 * Converts string placeholder with string arguments,
 * i.e. "{0} is {1}".format("MJ", "handsome");
 *       returns "MJ is handsome"
 *
 * @author http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
 */
//First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                    ? args[number]
                    : match;
        });
    };
}
/*******************************************************************************
 * END : Extended prototype functions for original Javascript objects
 ******************************************************************************/

/*******************************************************************************
 * START : Extended prototype functions for Javascript String object
 ******************************************************************************/
//pads left
String.prototype.leftPad = function (padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}

//pads right
String.prototype.rightPad = function (padString, length) {
    var str = this;
    while (str.length < length)
        str = str + padString;
    return str;
}

//pads center
String.prototype.centerPad = function (padString, length) {
    var str = this;

    if (str == null || length <= 0) {
        return str;
    }

    var strLen = str.length;
    var pads = length - strLen;

    if (pads <= 0) {
        return str;
    }

    str = str.leftPad(padString, strLen + pads / 2);
    str = str.rightPad(padString, length);

    return str;
}

/**
 * Function: wordWrap Returns an string with the extra characters/words "broken".
 *
 * maxLength maximum amount of characters per line
 * breakWtih string that will be added whenever it's needed to break the line
 * cutType *
 * 0 = words longer than "maxLength" will not be broken
 * 1 = words will be broken when needed
 * 2 = any word that trespass the limit will be broken
 */
String.prototype.wordWrap = function (m, b, c) {
    var i, j, l, s, r;
    if (m < 1)
        return this;
    for (i = - 1, l = (r = this.split("\n")).length; ++i < l; r[i] += s)
        for (s = r[i], r[i] = ""; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : ""))
            j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length
                    || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/)).input.length;
    return r.join("\n");
};
/*******************************************************************************
 * END : Extended prototype functions for Javascript String object
 ******************************************************************************/

/**
 * Add last function to get last item of an array. Works on chrome and firefox
 */
Object.defineProperty(Array.prototype, 'last', {
    enumerable: false,
    configurable: true,
    get: function () {
        return this[this.length - 1];
    },
    set: undefined
});


function isAlphaNumeric(stringVal) {
    var regex = /^[a-z0-9]+$/i;

    return regex.test(stringVal);
}
/**
 * Check if number
 * @param n
 * @returns
 */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function removeAllDash(str) {
    if (str)
        return str.replace(/-/g, "");
}

/**
 * Converts UTC date to local time
 * @param utcDate
 * @returns date (localized)
 */
function utcDateToLocalTime(utcDate) {
    var localOffsetMs = utcDate.getTimezoneOffset() * 60000;
    var utcTimeMs = utcDate.getTime();
    var localizedDate = new Date((utcTimeMs - localOffsetMs));
    return localizedDate;
}

/**
 * Checks if the 2 dates are the same,
 * tolerance between difference each date is up to
 * a certain number of minutes
 * @param date1, date2
 * @returns boolean
 */
function isDatesTheSame(date1, date2) {
    var isSame = false;
    var tolerance = 14 * 60000; //first digit is the tolerance minutes
    var d1ms = date1.getTime();
    var d2ms = date2.getTime();
    var diff = Math.abs(d1ms - d2ms);
    if (diff <= tolerance)
        isSame = true;

    return isSame;
}

function formatTime(dateObj) {
    var hh = dateObj.getHours() <= 9 ? "0" + dateObj.getHours() : dateObj.getHours();
    var mm = dateObj.getMinutes() <= 9 ? "0" + dateObj.getMinutes() : dateObj.getMinutes();
    return hh + ":" + mm;
}

/**
 * Parses the string argument as a boolean. The boolean returned represents the
 * value true if the string argument is not null and is equal, ignoring case, to
 * the string "true".
 *
 * @param str
 * @returns {Boolean}
 */
function parseBoolean(str) {
    var result = false;
    if (str && str.toLowerCase() === "true")
        result = true;
    return result;
}

/***************************************************
 * GiftCard Common functions to cashier & customer
 ***************************************************/
function formatGCTransactionDateRendered(date) {
    var gcTxDate = new Date(date);
    var gcDateTime = "";
    var dateStr = gcTxDate.getFullYear() + "/" + (gcTxDate.getMonth() + 1) + "/" + gcTxDate.getDate();
    var hours = (gcTxDate.getHours() < 10 ? "0" : "") + gcTxDate.getHours();
    var minutes = (gcTxDate.getMinutes() < 10 ? "0" : "") + gcTxDate.getMinutes();
    var seconds = (gcTxDate.getSeconds() < 10 ? "0" : "") + gcTxDate.getSeconds();

    gcDateTime = dateStr + " " + hours + ":" + minutes + ":" + seconds;
    return gcDateTime;
}

function formatGiftCardDate(dateStr) {
    if (dateStr)
        return dateStr.substr(0, 4) + "/" + dateStr.substr(4, 2) + "/" + dateStr.substr(6, 2);
    //return "20" + dateStr.substr(0,2) + "/" + dateStr.substr(3,2) + "/" + dateStr.substr(6,2);
    else
        return null;
}

function maskValueWithX(val, size, position) {
    var str = new String(val);
    if (position == 'LAST') {
        return str.substr(0, str.length - size) + Array(size + 1).join('X');
    }
    if (position == 'BEGIN') {
        return Array(size + 1).join('x') + str.substr(size, str.length);
    }
}

/**
 * Get description of selected val from enumeration
 * @param posEnumType
 * @returns {Object}
 */
function getEnumerationDescriptionByEnumType(posEnumType) {
    var posEnum = getConfigCodeEnumeration(posEnumType);
    var enumByType = new Object();

    for (var i in posEnum) {
        enumByType[posEnum[i].code] = posEnum[i].description;
    }

    return enumByType;
}

/**
 * Get Enumeration by type
 * @param code
 * @param enumType
 * @returns {String}
 */
function getDescriptionFromEnumByCode(code, enumType) {
    var description = "";
    try {
        var posEnum = getEnumerationDescriptionByEnumType(enumType);

        for (var e in posEnum) {
            if (e == code) {
                description = posEnum[e];
                break;
            }
        }
        return description;

    } catch (err) {
        uilog(err);
        return "";
    }
}

/**
 * Get Enumeration
 * @param configCode
 * @returns
 */
function getConfigCodeEnumeration(configCode) {
    return JSON.parse($.ajax({
        url: posWebContextPath + "/cashier/getConfigCodeEnumeration/" + configCode,
        type: "GET",
        async: false,
        dataType: "json",
        /*data : {
         enumType : configCode
         },*/
        timeout: 3000,
        error: function (jqXHR, status, error) {
            promptSysMsg('Error loading: ' + configCode, 'Config');
        }
    }).responseText);
}

function formatDateTime(time) {
    return time.substr(0, 2) + ":" + time.substr(2, 2) + ":" + time.substr(4, 2);
}

/**
 * Overrides jquery ui dialog default values
 */
$.extend($.ui.dialog.prototype.options, {
    modal: true,
    resizable: false,
    draggable: false
});

function parseJsonData(data) {
    try {
        return JSON.parse(data);
    } catch (e) {
//		uilog('DBUG','JSON parse error: ' + data);
    }
    return null;
}

/***************************************************
 * Web/URL helper functions
 ***************************************************/

/**
 * Get url parameter as Javascript object.
 * @autrhor http://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object
 */
function getUrlParamsAsObject(urlString) {

    var search = urlString.slice(urlString.indexOf('?') + 1);
    return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');

}

/**
 * Append leading zeroes.
 * val is substituted to new variable to keep the val in original form/value.
 * @param val
 * @returns String of val;
 */
function appendLeadingZeroes(val, maxSize) {
    var newVal = val + '';
    while (newVal.length < maxSize) {
        newVal = '0' + newVal;
    }
    return newVal;
}

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) == 0;
    };
}

function formatTimeAMPM(dateObj) {
    var hours = dateObj.getHours();
    var minutes = dateObj.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    return strTime;
}

// LUCKY - ADDITIONAL FUNCTION FOR ZEPRO
function isTrxCobrand(bin, promotionsMap)
{
    uilog(bin + " " + JSON.stringify(promotionsMap));
	console.log(bin);
	// CR ADD DISCOUNT 
	if (bin == "") return false;
	// CR ADD DISCOUNT
    for (var i in promotionsMap)
    {
        for (var j in promotionsMap[i])
        {
            if (promotionsMap[i][j].promotionType == 'M' && promotionsMap[i][j].coBrandNumber.indexOf(bin) > -1)
                return true;
        }
    }

    return false;
}

function isItemCMC(barcode, promotionsMap)
{
    for (var i in promotionsMap)
    {
        for (var j in promotionsMap[i])
        {
            if (promotionsMap[i][j].promotionType == 'M' && barcode == promotionsMap[i][j].ean13code)
                return true;
        }
    }

    return false;
}

function calculateZeproAmount(saleTx)
{
    var zeproAmount = 0;
    var orderItems = saleTx.orderItems;
	var additionalDiscount = 0;
	// CR ADD DISCOUNT
	console.log("order items zepro amount : " + JSON.stringify(orderItems));
    for (var i in orderItems)
    {
		if(orderItems[i].additionalDiscount && orderItems[i].additionalDiscount > 0)
			additionalDiscount = orderItems[i].additionalDiscount;
        if (isItemCMC(orderItems[i].ean13Code, saleTx.promotionsMap))
        {
			
            if (orderItems[i].isVoided)
                zeproAmount -= (orderItems[i].priceSubtotal - orderItems[i].discountAmount - orderItems[i].discBtnAmount - orderItems[i].secondLayerDiscountAmount - additionalDiscount - orderItems[i].crmMemberDiscountAmount);
            else
                zeproAmount += (orderItems[i].priceSubtotal - orderItems[i].discountAmount - orderItems[i].discBtnAmount - orderItems[i].secondLayerDiscountAmount - additionalDiscount - orderItems[i].crmMemberDiscountAmount);
			
        }
		additionalDiscount = 0;
    }
	// CR ADD DISCOUNT
    return zeproAmount;
}

function getLabelCmc(cobrandNumber, rcmcText){
    var coBrandNumber = parseInt(cobrandNumber);
    var rcmcTextList = rcmcText.split(";");
    
    for (var i = 0; i < rcmcTextList.length; i++) {
        var rcd = rcmcTextList[i].split("|");
        var rcdNumber = parseInt(rcd[0]);
        var rcdLabel = rcd[1];

        if (rcdNumber == coBrandNumber) {
            return rcdLabel;
        }
    }
}
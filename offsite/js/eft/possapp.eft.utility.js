/******************************************
 * Utilities and Data Conversion Start
 ******************************************/
/**
 * Converts param from hex to ascii
 * @param str - data to convert
 * @return tempstr - data converted to ascii
 */
 function hexToAscii(str) {
    tempstr = '';
    for (var i = 0; i < str.length; i += 2) {
        tempstr = tempstr + String.fromCharCode(parseInt(str.substr(i, 2), 16));
    }
    return tempstr;
}

/**
 * Converts param from ascii to hex
 * @param str - data to convert
 * @return tempstr - data converted to hex
 */
function asciiToHex(str) {
    tempstr = '';
    for (a = 0; a < str.length; a = a + 1) {
        tempstr = tempstr + str.charCodeAt(a).toString(16);
    }
    return tempstr;
}

/**
 * Converts data to hex; Differs from ascii to hex.
 * Data returned is string hex
 * @param data - data to convert to hex
 */
function toHex(data){
	return data.toString(16);
}

/**
 * Converts hex to decimal
 * @param hex
 * @returns
 */
function hexToDec(hex) {
    return parseInt(hex, 16);
}

function toHexPadded(val) {
    val &= 0xFFFF;
    var hex = val.toString(16);
    return ("0000" + hex).slice(-4);
}

/**
 * Transforms an array of int to hex string.
 * Each conversion must have length of 2 bytes
 * @param encryptedMsg
 * @returns
 */
function toHexString(msgArr){
	msgHex ="", charHex ="";
	for(var i=0; i < msgArr.length; i++){
		charHex = msgArr[i].toString(16);
		charHex = ("00" + charHex).substring(0 + charHex.length, 2 + charHex.length);
		msgHex += charHex;
	}
	uilog("DBUG","toHexString() -- execute; String format: " + msgHex);
	return msgHex;
}

/**
 * Masks card no.
 * @param cardNo
 * @returns {String}
 */

function maskCardNo(cardNo){
        //sample masking: 123456xxxxxx3456
        var mask = "";
        var maskTimes = cardNo.length-6;
        if(cardNo.length > 6){
                for(var i=0;i < maskTimes && i < 6;i++){
                        mask+="x";
                }
        }
        var maskedCardno = cardNo.substring(0,6)+mask+cardNo.substring(12);
        return maskedCardno;
}

function maskCardNoNew(cardNo){
	//sample masking: 123456xxxxxx3456
	var mask = "";
	var maskTimes = cardNo.length-6;
	if(cardNo.length > 8){
		for(var i=0;i < maskTimes && i < 4;i++){
			mask+="x";
		}
	}
	var maskedCardno = cardNo.substring(0,8)+mask+cardNo.substring(12);
	return maskedCardno;
}

function maskCardNoMLC(cardNo){
	//sample masking: 123456xxxxxx3456
	var mask = "";
	var maskTimes = cardNo.length-6;
	if(cardNo.length > 8){
		for(var i=0;i < maskTimes && i < 6;i++){
			mask+="x";
		}
	}
	var maskedCardno = cardNo.substring(0,8)+mask+cardNo.substring(14);
	return maskedCardno;
}

EFT.formatDate = function(rawDate){
	var count = 0;
	var formattedDate = "";
	while(count < rawDate.toString().length){
		formattedDate = formattedDate + rawDate.substr(count, 2) + "/";
		count += 2;
	}
	return formattedDate;
}

EFT.formatTime = function(rawTime){
	try{
		var count = 0;
		var formattedTime = "";
		while(count < rawTime.toString().length){
			formattedTime = formattedTime + rawTime.substr(count, 2) + ":";
			count += 2;
		}
		return formattedTime.substr(0, formattedTime.length - 1);
	} catch (err){
		uilog("DBUG", err);
		return "";
	}
}

/******************************************
 * Utilities and Data Conversion End
 ******************************************/

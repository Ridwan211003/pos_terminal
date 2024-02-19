var dTable_configListTable;
var storeInfoMsg;
var configErrMsg;

$(document).ready(function() {

});

function showInfoMsg(msg) {
	$("#infoMsgDiv").html(msg).stop().css('opacity','1.0').show().fadeOut(10000);
	$("#errMsgDiv").hide();
}

function showErrMsg(msg) {
	$("#errMsgDiv").html(msg).show();
	$("#infoMsgDiv").hide();
}

/***********************************
 * Manage Configurations starts here
 ***********************************/
function updateConfiguration(obj) {
	var target = $("#"+obj.id).closest("tr").find("td:nth-child(2)");

	if ($("#"+obj.id).html() == "SAVE") {
		var newValue;
		var isValid = true;

		if (obj.name == "EMP_DISC_EX_ITEMS_FILE") {
			if ($("#"+obj.name+"-input")[0].files[0] != undefined) {
				var exItemsFile = $("#"+obj.name+"-input")[0].files[0];
				if (uploadExItemsFile(exItemsFile)) {
					newValue = exItemsFile.name;
				} else {
					isValid = false;
				}
			} else {
				newValue = $("#"+obj.name+"-input").attr("old-value");
			}
		} else if ($("#"+obj.name+"-input").length)
			newValue = $("#"+obj.name+"-input").val();
		else
			newValue = $("#"+obj.name+"-select").val();
		
		//Check if Hypercash Tax Invoice Range Configuration
		if(obj.name == 'HC_TAX_INVOICE_RANGE1_MIN'
			|| obj.name == 'HC_TAX_INVOICE_RANGE1_MAX'
				|| obj.name == 'HC_TAX_INVOICE_RANGE2_MIN'
					|| obj.name == 'HC_TAX_INVOICE_RANGE2_MAX'){
			isValid = valHypercashTaxInvSequenceConfig(obj.name);
		}

		if(isValid){
			updateConfigValue(obj.name,newValue);
			target.html(newValue);
			$("#"+obj.id).html("UPDATE");
		}else{
			showInfoMsg("Error encountered in updating configuration: "+obj.name);
		}
		
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
		} else if (val === "Scan and Input" || val === "Scan Only" || val === "Input Only") {
			var options = ["Scan and Input","Scan Only","Input Only"];
			val = (val === "Scan and Input");
			
			element = $("<select id='"+obj.name+"-select' />");
			
			options.forEach(function(key) {
				var opt = $("<option />").val(key).text(key);
				if (val == key)
					opt.prop('selected', true);
				element.append(opt);
			});
		} else if (val === "manual bank id" || val === "auto bank id" || val === "auto-conditional bank id") {
			var options = ["manual bank id","auto bank id","auto-conditional bank id"];
			val = (val === "manual bank id");
			
			element = $("<select id='"+obj.name+"-select' />");
			
			options.forEach(function(key) {
				var opt = $("<option />").val(key).text(key);
				if (val == key)
					opt.prop('selected', true);
				element.append(opt);
			});
		} else if (val === "Allow Price Override" || val === "Don't Allow Price Override") {
			var options = ["Allow Price Override","Don't Allow Price Override"];
			val = (val === "Allow Price Override");
			
			element = $("<select id='"+obj.name+"-select' />");
			
			options.forEach(function(key) {
				var opt = $("<option />").val(key).text(key);
				if (val == key)
					opt.prop('selected', true);
				element.append(opt);
			});
		} else if (obj.name == "EMP_DISC_EX_ITEMS_FILE") {
			element = $("<input id='"+obj.name+"-input' type='file' old-value='"+val+"' />");
		} else {
			element = $("<input id='"+obj.name+"-input' type='text' />");
			element.attr("value",val);
		}

		target.html(element);
		$("#"+obj.id).html("SAVE");
	}
}

function configListAdminAction(data, type, full) {
	return "<a href='' id='"+full.configCode+"-button' name='"+full.configCode+"' onclick='updateConfiguration(this);return false;'>UPDATE</a>"
}

//function manageEFTConfigAction(data, type, full) {
//	return "<a href='' id='"+full.configCode+"-button' name='"+full.configCode+"' onclick='updateConfiguration(this);return false;'>UPDATE</a>"
//}

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


function valHypercashTaxInvSequenceConfig(hcConfigCode){
	// if(hcConfigCode == 'HC_TAX_INVOICE_RANGE1_MIN'){
	configVal = $("#" + hcConfigCode + "-input").val();
	if (configVal == '')
		return false;

	periodDelimiter = $("#" + hcConfigCode + "-input").val().indexOf('.') > 0;
	if (!periodDelimiter)
		return false;

	hcTaxInvSeq = $("#" + hcConfigCode + "-input").val().split(".")[1];
	uilog('DBUG','hcTaxInvSeq: ' + hcTaxInvSeq)
	if (hcTaxInvSeq.length != 8)
		return false;

	var reg = /^\d+$/;
	if (!reg.test(hcTaxInvSeq))
		return false;

	// @TODO: Create validation for the counterpart config
	/*
	 * //comparison on max counterpart value valCtrPart =
	 * $('#HC_TAX_INVOICE_RANGE1_MAX-hidden').val(); uilog('DBUG','@@@@Value of
	 * max counter part: '+valCtrPart); valCtrPart = valCtrPart.split(".")[1];
	 * if(hcTaxInvSeq >= valCtrPart) return false;
	 */
	// }
	return true;
}

function getConfigCodeEnumeration(configCode) {
	return JSON.parse($.ajax({
        url : webContextPath + "/admin/getConfigCodeEnumeration",
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

function uploadExItemsFile(exItemsFile) {
	var isUploaded = false;
	var eiForm = new FormData();
	eiForm.append("exItemsFile", exItemsFile);
	$.ajax({
		url : webContextPath + "/sys/conf/discBtnExItemsUpload",
		type : "POST",
		async : false,
		data : eiForm,
		dataType : 'text',
		processData : false,
		contentType : false,
		success : function(res) {
			if (res) {
				isUploaded = true;
			}
		}
	});
	return isUploaded;
}
/***********************************
 * Manage Configurations ends here
 ***********************************/

/***********************************
 * Manage Terminals starts here
 ***********************************/
function registeredTerminalLink(data, type, full) {
	var url = webContextPath + "/admin/terminalView/" + full.id;
	return "<a href='" + url + "'>" + data + "</a>";
}

function posTerminalIsWrongIp(data, type, full) {
       var warning = '';
       if(data){
    	   warning = "Terminal have accessed on different IP address";
       }
       return warning;
}
/***********************************
 * Manage Terminals ends here
 ***********************************/

/***********************************
 * Manage Installment Companies starts here
 ***********************************/
function viewInstallmentCompany(data, type, full) {
	var url = webContextPath + "/admin/viewInstallmentCompany/" + full.id;
	return "<a href='" + url + "'>" + data + "</a>";
}

/***********************************
 * Manage Installment Companies ends here
 ***********************************/

/***********************************
 * Manage Configurations ends here
 ***********************************/

/***********************************
 * Manage MDR Configurations starts here
 ***********************************/
function registeredMdrConfigLink(data, type, full) {
	var url = webContextPath + "/admin/mdrConfigView/" + full.id;
	return "<a href='" + url + "'>" + data + "</a>";
}

/***********************************
 * Manage MDR Configurations ends here
 ***********************************/

/***********************************
 * Manage FLASHiZ Configurations starts here
 ***********************************/
function registeredFlashizConfigLink(data, type, full) {
	var url = webContextPath + "/admin/flashizConfigView/" + full.id;
	return "<a href='" + url + "'>" + data + "</a>";
}
/***********************************
 * Manage FLASHiZ Configurations ends here
 ***********************************/

/***************************************
 * Price Broadcast function calls
 ***************************************/
function generatedPriceBroadcastFiles(priceBroadcastType) {
	var title = "Price Broadcast";
	showConfirmDialog("Are you sure you want to generate Price Broadcast file?",title,function() {
		$.ajax({
			url : webContextPath + "/admin/pricebroadcast",
			type : "POST",
			async: false,
			dataType : "json",
			data : {
				"priceBroadcastType" : priceBroadcastType
			},
			success : function(res) {
				if (res.infoMsg) {
					showInfoMsg(res.infoMsg);
				}else if(res.errMsg){
					showErrMsg(res.errMsg);
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error : " + error,"error");
			}
		});
	});
}


/***********************************
 * Manage User Profiles starts here
 ***********************************/
function renderUserProfileActions(data, type, full){
	var a = "<a href='' onclick='confirmUserProfileDelete(\""+data+"\",\""+full.profileName+"\");return false;'>Delete</a>";
	var b = "<a href='userProfileUpdate?id="+data+"' th:href='@{userProfileUpdate?id="+data+"'}'>Update</a>";
	return a+"<br/>"+b;
}

function renderIsProfileCashier(data, type, full){
	var isChecked = data;
	var checkbox = $("<div>").append($("<input>")
			.attr({
			"type":"checkbox",
			"checked":isChecked,
			"onclick":"retainCheckboxState(this)",
			"title":(full.profileName+":Is Cashier")
			})).remove().html();
	
	return checkbox;
}

function confirmUserProfileDelete(data, name){
	showConfirmDialog("Do you want to delete the user profile: "+name+"?","Delete",function(){
		deleteUserProfile(data);
	});
}

function deleteUserProfile(id){
	$("#profileIdInput").val(id);
	$("#deleteUserProfileForm").submit();
}

function retainCheckboxState(cb){
	var isChecked = $(cb).is(":checked");
	$(cb).attr("checked",!isChecked);
}

function userProfileListCellRender(nTd, sData, oData, iRow, iCol) {
	var isChecked = false;
	var columnRole = roleList[iCol-2];
	var columnRoleId = columnRole.id;
	
	for(var i in sData){
		if(columnRoleId == sData[i].id){
			isChecked = true;
		}
	}
	
	var checkbox = $("<div>").append($("<input>")
			.attr({
			"type":"checkbox",
			"checked":isChecked,
			"onclick":"retainCheckboxState(this)",
			"title":(oData.profileName+":"+columnRole.rolename)
			})).remove().html();
	$(nTd).html(checkbox);
}

function submitUserProfileSave(){
	var cbRoles = $(".cbUserRoles");
	var roleIdString = "";
	for(var i=0;i<cbRoles.length;i++){
		var cb = cbRoles[i];
		if($(cb).is("input") && $(cb).attr("type") == "checkbox"){
			var isChecked = $(cb).is(":checked");
			if(isChecked){
				if(roleIdString != ""){
					roleIdString += ",";
				}
				
				var roleId = ($(cb).attr("id")).substring(13);
				roleIdString += roleId;
			}
		}
	}
	$("#rolesString").val(roleIdString);
	$("#userProfileSaveForm").submit();
}
/***********************************
 * Manage User Profiles ends here
 ***********************************//***********************************
 * Banana Report starts here
 ***********************************/

function brListActions(data, type, full) {
	var returnStr = "";
	var status = full.status;
	var isSubmitterCashier = full.submitterCashier;
	var submitterId = full.submitterEmp==null?"":full.submitterEmp.id;
	if(userEmpPk == submitterId){
		if(status == 0 || status == 1){
			returnStr = "No Actions: Report Submitted";
		}else if(status == 2){
			var bananaReportFormUrl = webContextPath + "/cashierbo/bananaReport?id=" + data;
			returnStr = "Report Rejected: <a href='" + bananaReportFormUrl + "'>Re-Submit</a>";
		}
	}else{
		if(status == 0){
			var verifyUrl = webContextPath + "/admin/bananaReportVerify?id=" + data;
			if(isSubmitterCashier){
				returnStr = "<a href='" + verifyUrl + "'>Verify</a>";
			}else{
				if(isCashierAdminUser != undefined){
					returnStr = "<a href='" + verifyUrl + "'>Verify</a>";
				}else{
					returnStr = "No Actions: Report Submitted";
				}
			}
		}else if(status == 1){
			returnStr = "No Actions: Report Verified";
		}else if(status == 2){
			returnStr = "No Actions: Report Rejected";
		}else if(status == 3){
			var bananaReportFormUrl = webContextPath + "/cashierbo/bananaReport?id=" + data;
			returnStr = "Not yet submitted: <a href='" + bananaReportFormUrl + "'>Submit</a>";
		}
	}
	return returnStr;
}

function renderBrTotal(data, type, full){
	return numberWithCommas(data);
}

function brDate(data, type, full){
	var d = new Date(data);
    var dateString = (d.getDate()+1)+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
	return dateString;
}

function brEmpFullName(data, type, full) {
	return (full.cashierEmp.givenName + " " + full.cashierEmp.middleName + " " + full.cashierEmp.lastName).toUpperCase();
}

function paymentMediaCorrectionAddOnLoad(){
	
	//-----------adds event handler nad removes decimal places of amount input start -----//
	var amountInputList = $(".amountText");
	for(var i=0;i<amountInputList.length;i++){
		var amountInput = amountInputList[i];
		removeDecimal(amountInput);
		
		$(amountInput).keydown(function(event){
			var caretPosStart = $(this).caret().start;
	    	var caretPosEnd = $(this).caret().end;
	    	var firstChar = $(this).val()==""?"":$(this).val().substring(0,1);
	    	
			// Allow: backspace, delete, tab, escape, enter
		    if ( $.inArray(event.keyCode,[46,8,9,27,13]) !== -1 ||
		         // Allow: Ctrl+A
		        (event.keyCode == 65 && event.ctrlKey === true) || 
		         // Allow: home, end, left, right
		        (event.keyCode >= 35 && event.keyCode <= 39)) {
		             // let it happen, don't do anything
		             return;
		    }else if(event.keyCode == 173){ //dash(-) key
		    	if(caretPosStart != 0 || (caretPosStart == 0 && caretPosEnd == 0 && firstChar == "-")){
		    		event.preventDefault();
		    	}
		    }else{
		        // Ensure that it is a number and stop the keypress
		        if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
		        	event.preventDefault();
		        }else if(caretPosStart == 0 && caretPosEnd == 0 && firstChar == "-"){
		        		event.preventDefault();
		        }
		    }
		});
	}
	//-----------adds event handler nad removes decimal places of amount input end -----//
	
	//-----------binds remove button it's event handler start -----//
	var buttonList = $(".hideButton");
	for(var i=0;i<buttonList.length;i++){
		var button = buttonList[i];
		$(button).click(function(){
			mediaCounter--;
			var parent = $(this).parent();
			var siblings = $(this).siblings();
			var amountTexts = $(siblings[2]).children(".amountText");
			$(amountTexts[0]).val(0);
			var mediaSelect = $(siblings[1]).children(".paymentMediaTypeSelect");
			var option = $(mediaSelect).children();
			$(option[0]).prop('selected', true);
			$(amountTexts[0]).val(0);
			mediaCorrectionSets.push(parent);
			$(parent).detach();
		});
	}
	//-----------binds remove button it's event handler end -----//
	
	//-----------hides the sets of payment media correction divs start -----//
	var mediaCorrectionSet = $(".mediaCorrectionSet");
	for(var i=mediaCorrectionSet.length-1;i>=0;i--){
		var mc = $(mediaCorrectionSet[i]);
		var mcChildren = $(mc).children();
		var amountText = $(mcChildren[3]).children(".amountText");
		var amount = $(amountText).val();
		if(amount == 0 || amount == ""){
			mediaCorrectionSets.push(mc);
			$(mc).detach();
		}
	}
	maxMedia = mediaCorrectionSet.length;
	//-----------hides the sets of payment media correction divs end -----//
	
	//-----------adds event handler to add payment media button start -----//
	$("#addMediaBtn").click(function(){
		if(mediaCounter < maxMedia){
			var mc = mediaCorrectionSets.pop();
			$("#mediaCorrectionSetContainer").append(mc);
			mediaCounter++;
		}else{
			showMsgDialog("You could only add up to "+(maxMedia-1)+" of payment media correction at a time.", "info");
		}
	});
	//-----------adds event handler to add payment media button end -----//
	
	//-----------adds event handler to date start -----//
	$("#businessDate").change(function(event){
		var dateStr = $(this).val();
		populateCashierList(dateStr);
	});
	//-----------adds event handler to date end -----//
	
}

function populateCashierList(dateStr){
	$("#msg").empty();
	$("#cashierUsername").empty();
	var cashierList = getXReportEmployeeList(dateStr);
	if(cashierList){
		if(cashierList.length > 0){
			for(var i in cashierList){
				var option = $("<option>");
				$(option).attr("value",cashierList[i].users.username);
				$(option).text(cashierList[i].givenName + " " + cashierList[i].middleName + " " + cashierList[i].lastName);
				$("#cashierUsername").append(option);
			}
		}else{
			$("#msg").html("No cashier found for the selected day.");
		}
	}else{
		$("#msg").html("No cashier found for the selected day.");
	}
}

function getXReportEmployeeList(dateStr) {
	var isHTTPStatusOK = false;
	var data = $.ajax({
		url : webContextPath + "/admin/getXReportEmployeeList/",
		type : "POST",
		async: false,
		dataType : "json",
		contentType : 'application/json',
		data : dateStr,
		success : function(data, status) {
			isHTTPStatusOK = true;
		},
		error : function(jqXHR, status, error) {
			uilog('DBUG','Error: ' + error + "\nError Response: " + jqXHR.responseText);
		}
	}).responseText;

	return (isHTTPStatusOK) ? JSON.parse(data) : null;
}

function processReportViewFromOtherPage(sourcePage){
	if(sourcePage == "cashierConsolidation"){
		$("#navigationSelectList").hide();
		populateNavigationSelect("NAV_BANANA_REPORT","Cashier Consolidation Report");
		$("#pageBodyTitle").html("Cashier Consolidation Report");
	}else if(sourcePage == "banana"){
		$("#navigationSelectList").hide();
		populateNavigationSelect("NAV_BANANA_REPORT","Banana Report Summary");
		$("#pageBodyTitle").html("Banana Report Summary");
	}
	
}
/***********************************
 * Banana Report ends here
 ***********************************/
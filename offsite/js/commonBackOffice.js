var dTable_empListTable;

/**
 * This is used for admin and cashier head
 */

/***********************************
 * Manage Employee starts here
 ***********************************/
function confirmDisable(employeeId) {
	var title = "Disable Account";
	var msg = "Are you sure you want to disable this account?";
	
	showConfirmDialog(msg,title,function() {
		$.ajax({
			url : webContextPath + "/employee/disableEmployee/" + employeeId,
			type : "GET",
			async: false,
			dataType : "json",
			success : function(res) {
				if (res.sessionActive)
					showMsgDialog("Warning : " + res.sessionActive,"warning");
				else if (res.infoMsg) {
					showInfoMsg(res.infoMsg);
					// functions that refresh the employee list table
					if (dTable_empListTable)
						dTable_empListTable.fnDraw();
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error : " + error,"error");
			}
		});
	});
}
function isActive(data) {
	var active = "Inactive";
	if (data) {
		active = "Active";
	} 
	return active;
}

function empProfileLink(data, type, full) {
	var url = webContextPath + "/employee/employeeView/" + data + "?managementType=user";
	return "<a href='" + url + "'>" + data + "</a>";
}

function empFullName(data, type, full) {
	return (full.givenName + " " + full.middleName + " " + full.lastName).toUpperCase();
}

function isLocked(data){
	var locked = "Locked";
	if(data){
		locked = "Unlocked";
	}
	return locked;
}

function renderStatus(data, type, full) {
	var activeStatus = isActive(full.users.isActive);
	var lockStatus = isLocked(full.users.enabled);
	
	if(full.users.isActive && !full.users.enabled){
		return lockStatus;
	}else{
		return activeStatus;
	}
}

function linkDisplayState(fname, label){
	this.fname = fname;
	this.label = label;
}

function empListAdminAction(data, type, full) {
	var actionDisplay;
	var isActive = full.users.isActive;
	var isEnabled = full.users.enabled;
	var isCashier = full.users.userProfile.cashier;
	var linkSeparator = " | ";
	//Active-Deactivate state, 1st link-button for "Action" column
	var empStatLink = changeLinkStatus(
			isActive, 
			full, 
			new linkDisplayState("confirmActivate", "Activate"),
			new linkDisplayState("confirmDeactivate", "Deactivate"));
	//Unlock&Reset-LockAccount state, 2nd link-button for "Action" column
	var lockUnlockLink = changeLinkStatus(
			isEnabled, 
			full, 
			new linkDisplayState("confirmResetPassword", "Unlock & Reset"),
			new linkDisplayState("confirmDisable", "Lock Account"));
	//EndSession state, 3rd link-button for "Action" column
	var endSessionLink = changeLinkStatus(
			(isActive && isCashier), 
			full, 
			null,
			new linkDisplayState("confirmEndSession", "End Session"));
	if(isActive){
		endSessionLink = (isCashier)? linkSeparator + endSessionLink : "";
		actionDisplay = empStatLink + linkSeparator + lockUnlockLink  + endSessionLink;
	}else{
		//will display "Activate" only if account is Deactivated.
		actionDisplay = empStatLink;
	}
	return actionDisplay;
}

function changeLinkStatus(data, full, onState, offState) {
	var a;
	var linkBtnPlaceholder = "<a href='' onclick='{0}(\"{1}\");return false;'>{2}</a>";
	var uname = full.users.username;
    // default values
    var fname = (onState)? onState.fname: null;
    var label = (onState)? onState.label: null;    
	if (data) {
		fname = offState.fname;
	    label = offState.label;
	} 	
	a = linkBtnPlaceholder.format(fname, uname, label);
	return a;
}

/***********************************
 * Manage Employee ends here
 ***********************************/

/***********************************
 * Manage Users starts here
 ***********************************/
/**** Manipulation for Lock/Unlock & Reset of Accounts. */
function confirmDisable(username) {
	var title = "Disable Account";
	var msg = "Are you sure you want to disable this account?";
	
	showConfirmDialog(msg,title,function() {
		$.ajax({
			url : webContextPath + "/employee/disableEmployee/" + username,
			type : "GET",
			async: false,
			dataType : "json",
			success : function(res) {
				if (res.sessionActive)
					showMsgDialog("Warning : " + res.sessionActive,"warning");
				else if (res.infoMsg) {
					showInfoMsg(res.infoMsg);
					// functions that refresh the emp list table
					if (dTable_empListTable)
						dTable_empListTable.fnDraw();
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error : " + error,"error");
			}
		});
	});
}

function confirmResetPassword(username) {
	showConfirmDialog("Are you sure you want to reset the password of user id " + username + "?","Reset Password",function() {
		$.ajax({
			url : webContextPath + "/user/resetPassword",
			type : "POST",
			async: false,
			dataType : "json",
			data : {
				"username" : username
			},
			success : function(res) {
				if (res.infoMsg) {
					showInfoMsg(res.infoMsg);
					// functions that refresh the emp list table
					if (dTable_empListTable)
						dTable_empListTable.fnDraw();
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error : " + error,"error");
			}
		});
	});
}

/**** Manipulation for Activation/Deactivation of Accounts. */

function confirmDeactivate(username) {
	var title = "Deactivate Account";
	var msg = "Are you sure you want to deactivate this account?";
	
	showConfirmDialog(msg,title,function() {
		$.ajax({
			url : webContextPath + "/employee/deactivateEmployee/" + username,
			type : "GET",
			async: false,
			dataType : "json",
			success : function(res) {
				if (res.sessionActive)
					showMsgDialog("Warning : " + res.sessionActive, "warning");
				else if (res.infoMsg) {
					showInfoMsg(res.infoMsg);
					// functions that refresh the emp list table
					if (dTable_empListTable)
						dTable_empListTable.fnDraw();
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error : " + error,"error");
			}
		});
	});
}

function confirmActivate(username) {
	var title = "Activate Account";
	showConfirmDialog("Are you sure you want to Activate user id " + username + "?",title,function() {
		$.ajax({
			url : webContextPath + "/user/activateEmployee",
			type : "POST",
			async: false,
			dataType : "json",
			data : {
				"username" : username
			},
			success : function(res) {
				if (res.infoMsg) {
					showInfoMsg(res.infoMsg);
					// functions that refresh the emp list table
					if (dTable_empListTable)
						dTable_empListTable.fnDraw();
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error : " + error,"error");
			}
		});
	});
}

function confirmEndSession(username){
	var title = getMsgValue("expire_session_admin_conf_title");
	showConfirmDialog(getMsgValue("expire_session_admin_conf_message").format(username), title, function() {
		$.ajax({
			url : webContextPath + "/user/endSessionEmployee",
			type : "POST",
			async: false,
			dataType : "json",
			data : {
				"username" : username
			},
			success : function(res) {
				if (res.errorMsg){
					showInfoMsg(res.infoMsg, true);					
				} else if (res.infoMsg) {
					showInfoMsg(res.infoMsg);
				}
				if (dTable_empListTable) {
					// functions that refresh the emp list table
					dTable_empListTable.fnDraw();
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error : " + error,"error");
			}
		});
	});
}

/***********************************
 * Manage Users ends here
 ***********************************/

function showInfoMsg(msg, isError) {
	var msgColor = 'blue';
	if(isError){
		msgColor = 'red';		
	}	
	$("#infoMsgDiv").html(msg)
					.stop()
					.css('opacity','1.0')
					.css('color', msgColor)
					.show()
					.fadeOut(10000);
}

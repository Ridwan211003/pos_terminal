var BALLOON_GAME = BALLOON_GAME || {};

BALLOON_GAME.BaseItemRequest = function(requestTypeObj, memberId){

	this.storeCode = configuration.storeCode.toLowerCase();
	this.memberId = memberId;
	
	for (var property in requestTypeObj){
		this[property] = requestTypeObj[property];
	}
};

BALLOON_GAME.RedeemableItemsRequest = function(orderItems){
	
	this.posTxItem = [];
	
	for ( var int = 0; int < orderItems.length; int++) {
		this.posTxItem.push(BALLOON_GAME.convertPosTxItemRequest(orderItems[int]));
	}
};

BALLOON_GAME.convertPosTxItemRequest = function(orderItem){
	var posTxItem = {
			ean13code : orderItem.ean13Code,
			quantity : orderItem.quantity	
	};	  
	return posTxItem;
};

BALLOON_GAME.getRedeemableItems = function(memberId, orderItems){
	
	var request = new BALLOON_GAME.BaseItemRequest(new BALLOON_GAME.RedeemableItemsRequest(orderItems), memberId);
	var redeemableItems = null;
	var balloonGameMemberId = null;
	
	$.ajax({
		url : posWebContextPath + "/balloongame/getRedeemList",
		type : "POST",
		dataType : "json",
		contentType : 'application/json',
		async: false,
		data : JSON.stringify(request),
		success : function(response) {
			uilog("DBUG","SUCCESS: " + JSON.stringify(response));
			
			BALLOON_GAME.closeCashierLoadingDialog();
			
			if(response.success && response.redeemableItemList.length > 0){
				uilog("DBUG","Response successful: " + response.success + " RedeemList Length: " + response.redeemableItemList.length);
				
				redeemableItems = response.redeemableItemList;
				balloonGameMemberId = response.memberId;
				
				var itemThreshold = parseInt(getConfigValue('BALLOON_ITEM_THRESHOLD'));
				
				//Defaults itemThreshold to 0 if value in POS-BO is Not a number
				if(isNaN(itemThreshold)) {
					itemThreshold = 0;
				};
				
				if(redeemableItems!= null && redeemableItems.length != 0){
					CustomerPopupScreen.cus_openBalloonGameItemsDialog(balloonGameMemberId, redeemableItems, itemThreshold);
					$("#balloonGameLoading-dialog").dialog("open");
					$("#balloonGameLoadingMsg").html(getMsgValue('balloon_game_loading_msg1'));
				}
				
			}else if(!response.success){
				uilog("DBUG","ERROR: " + response.errorMsg);
				BALLOON_GAME.closeCashierLoadingDialog();
				
				$("#balloonGameInputMember-dialog").dialog("open");
				$("#balloonGameMemberMsg").html(getMsgValue('balloon_game_error_getRedeemList'));
				
			}else{
				showMsgDialog(getMsgValue('balloon_game_no_redeem_items_msg1'),"info");
			}
			
		},
		error : function(jqXHR, status, error) {
			uilog('DBUG','FAIL: ' + JSON.stringify(error));

			BALLOON_GAME.closeCashierLoadingDialog();
			
			$("#balloonGameInputMember-dialog").dialog("open");
			$("#balloonGameMemberMsg").html(getMsgValue('balloon_game_error_getRedeemList'));
		}
	});
	
	return redeemableItems;
};

BALLOON_GAME.BaseBalloonRequest = function(requestTypeObj, memberId){

	this.memberId = memberId;
	this.posTxnId = saleTx.transactionId;

	for (var property in requestTypeObj){
		this[property] = requestTypeObj[property];
	}
};

BALLOON_GAME.RedeemBalloonRequest = function(selectedBalloons){
	
	this.balloonGameItemList = [];
	
	for ( var int = 0; int < selectedBalloons.length; int++) {
		this.balloonGameItemList.push(BALLOON_GAME.convertBalloonGameItemRequest(selectedBalloons[int]));
	}
};


BALLOON_GAME.convertBalloonGameItemRequest = function(selectedBalloon){
	var balloonGameItemList = {
			balloonItemId : selectedBalloon.balloonItemId,
			balloonItemDesc : selectedBalloon.balloonItemDesc,	
			type : selectedBalloon.type
	};	  
	return balloonGameItemList;
};

BALLOON_GAME.redeemBalloons =  function(memberId, selectedItems) {
	var request = new BALLOON_GAME.BaseBalloonRequest(new BALLOON_GAME.RedeemBalloonRequest(selectedItems), memberId);
	var redeemedBalloons = null;

	$.ajax({
		url : posWebContextPath + "/balloongame/redeemBalloon",
		type : "POST",
		dataType : "json",
		contentType : 'application/json',
		data : JSON.stringify(request),
		async: false,
		success : function(response) {
			uilog("DBUG","SUCCESS: " + JSON.stringify(response));

			if(response.success && response.redeemableItemList.length > 0){

				redeemedBalloons = response.redeemableItemList;

				if(redeemedBalloons != null && redeemedBalloons.length > 0) {
					var redeemBalloonInfo = getMsgValue('balloon_game_success_item_msg');

					redeemedBalloons.forEach(function(item) {
						redeemBalloonInfo = redeemBalloonInfo + item.balloonItemDesc + "<br/>";
					});

					BALLOON_GAME.redeemedBalloons.set(redeemedBalloons);
					showMsgDialog(redeemBalloonInfo, "info", function () {
						
						// close loading dialog
						BALLOON_GAME.closeCashierLoadingDialog();
						
						/*
						 * TODO: Find a better way to do this
						 * this will fire the final leg of the txn
						 */
						$("#balloonGamePrompt-dialog").dialog("close");
					});
				}

			} else if(!response.success) {
				uilog("DBUG","ERROR: " + response.errorMsg);
				BALLOON_GAME.closeCashierLoadingDialog();

				$("#balloonGameInputMember-dialog").dialog("open");
				$("#balloonGameMemberMsg").html(getMsgValue('balloon_game_error_redeem_msg'));
			} else {
				// close loading dialog
				BALLOON_GAME.closeCashierLoadingDialog();
				showMsgDialog(getMsgValue('balloon_game_no_redeem_items_msg2'), "info");
			}

		},
		error : function(jqXHR, status, error) {
			uilog('DBUG','FAIL: ' + JSON.stringify(error));

			BALLOON_GAME.closeCashierLoadingDialog();
			
			$("#balloonGameInputMember-dialog").dialog("open");
			$("#balloonGameMemberMsg").html(getMsgValue('balloon_game_error_redeem_msg'));
		}
	});
};


BALLOON_GAME.populateBalloonGameRedemptionDialog = function(redeemableItems){
	$("#balloonGameRedemptionTable").empty();
	$("#balloonGameRedemptionErrorSpan").text("");
	$("#balloonGameItemRedemption-dialog").dialog({
		width : 550,
		height: 600,
		resizable : false,
		draggable : false,
		modal : true,
		autoOpen : false,
		closeOnEscape : false
	});
	
	$("#balloonGameItemRedemption-dialog").on("dialogopen", function(event, ui) {
		//Removes existing table rows.
		$("#balloonGameRedemptionTable tr").remove();
		BALLOON_GAME.createRedeemableBalloons(redeemableItems);
		BALLOON_GAME.displayBalloonGameItems();
	});
};

BALLOON_GAME.displayBalloonGameItems = function (){
	var balloonItemRows = $("#balloonGameRedemptionTable tr");
	var rowsPerPage = 2;
	var currentPage = 1;
	var totalPages = Math.ceil(balloonItemRows.length/rowsPerPage);
	
	BALLOON_GAME.renderBalloonItemsRows(balloonItemRows, totalPages, rowsPerPage);
	
	$("#balloonPreviousBtn").click(function(event) {
		if(currentPage-1 > 0) {
			BALLOON_GAME.getBalloonPage(currentPage, --currentPage);
		} else {
			$("#balloonPreviousBtn").prop("disabled",true);
		}
		BALLOON_GAME.clickHandler(event.target);
	});

	$("#balloonNextBtn").click(function(event) {
		if(currentPage+1 <= totalPages) {
			BALLOON_GAME.getBalloonPage(currentPage, ++currentPage);
		} else {
			$("#balloonNextBtn").prop("disabled",true);
		}
		BALLOON_GAME.clickHandler(event.target);
	});
};

BALLOON_GAME.renderBalloonItemsRows = function(balloonObj, totalPages, rowsPerPage) {
	var startIndex = 0;
	var endIndex = 0;
	
	for(var i = 1; i <= totalPages; i++) {
		startIndex = (i-1) * rowsPerPage;
		endIndex = startIndex + (rowsPerPage);
		
		if(endIndex > balloonObj.length) {
			endIndex = balloonObj.length;
		}
		
		var newArray = new Array();
		newArray = $(balloonObj).slice(startIndex, endIndex).get();
		newArray.forEach(function(newArrayRow) {
			if(i == 1) {
				$(newArrayRow).attr("class", "balloonItemRow" + i);
			} else {
				$(newArrayRow).attr("class", "balloonItemRow" + i).hide();
			}
		});
		
	}
};

BALLOON_GAME.getBalloonPage = function(prevPage, newPage) {
	$(".balloonItemRow" + prevPage).hide();
	$(".balloonItemRow" + newPage).show();
};

BALLOON_GAME.clickHandler = function(eventSource) {
	if($(eventSource)[0] === $("#balloonNextBtn")[0]){
		$("#balloonPreviousBtn").prop("disabled",false);
	} else if($(eventSource)[0] === $("#balloonPreviousBtn")[0]) {
		$("#balloonNextBtn").prop("disabled",false);
	}
};

BALLOON_GAME.createRedeemableBalloons = function(redeemableItems) {
	var itemsPerRow = 5;
	var rowCount = Math.ceil(redeemableItems.length / itemsPerRow);
	var rowArray = new Array();
	
	for(var i=0;i<rowCount;i++){
		var row = $("<tr>");
		rowArray.push(row);
	}
	
	for(var i=0;i<redeemableItems.length;i++){
		var itemEnabled = redeemableItems[i].enabled;
		var td = $("<td>");
		
		var div = $("<div>").attr({
			"id" : "bgItemDiv"+redeemableItems[i].balloonItemId,
			"class" : itemEnabled?"balloonGameRedeemableItem":"balloonGameRedeemableItemDisabled"
		});

		var checkbox = $("<input>").attr({
			"type" : "checkbox",
			"id" : "bgItemChk"+redeemableItems[i].balloonItemId,
			"class" : "balloonGameRedeemableItemChk",
			"balloonType" : redeemableItems[i].type
		});
		
		if(itemEnabled){
			$(div).click(function(event){
				var id = $(this).attr("id");
				id = id.replace("bgItemDiv","bgItemChk");
				var cb = $("#"+id);
				var parent = $(event.target).parents(".balloonGameRedeemableItem");
				if(this === event.target || this === parent[0]) {
					cb[0].click();
					BALLOON_GAME.changeCheckboxValue(cb);
				}
			});
			
			$(checkbox).click(function(event){
				event.stopPropagation();
				var cb = $(this);
				BALLOON_GAME.changeCheckboxValue(cb);
			});
			
		}else{
			$(checkbox).attr({
				"disabled" : "disabled"
			});
		}
		
		var span = $("<span>").text(redeemableItems[i].balloonItemDesc);
		var itemTextContainer = $("<div>").attr({
			"class" : "balloonGameRedeemableItemTextContainer"
		});
		var itemChkContainer = $("<div>").attr({
			"class" : "balloonGameRedeemableItemChkContainer"
		});
		
		$(itemTextContainer).append(span);
		$(itemChkContainer).append(checkbox);
		$(div).append(itemTextContainer).append(itemChkContainer);
		$(td).append(div);
		
		var rowIndex = Math.floor(i/itemsPerRow);
		$(rowArray[rowIndex]).append(td);
	}
	
	for(var i in rowArray){
		$("#balloonGameRedemptionTable").append(rowArray[i]);
	}
	
	var itemThreshold = BALLOON_GAME.itemThreshold.get();
	if(itemThreshold > 0){
		$("#balloonRedemptionItemLimitInfo").text("Please select items to redeem (max of " + itemThreshold + " items):").css("font-weight","bold");
	} else {
		$("#balloonRedemptionItemLimitInfo").text("No items may be selected at this time").css("font-weight","bold");
	}
};

BALLOON_GAME.changeCheckboxValue = function(checkbox){
	var isCbChecked = $(checkbox).is(":checked");

	if(isCbChecked) {
		if(BALLOON_GAME.validateBalloonGameItemSelection()){
			$(checkbox).attr("checked", isCbChecked);
		}
		else {
			$(checkbox).attr("checked", !isCbChecked);
		}
	}
};

BALLOON_GAME.validateBalloonGameItemSelection = function(){
	var bgCheckboxes = $(".balloonGameRedeemableItemChk");
	var checkedCount = 0;
	var isValid = true;
	var itemThreshold = BALLOON_GAME.itemThreshold.get();
	for(var i=0;i<bgCheckboxes.length;i++){
		var isChecked = $(bgCheckboxes[i]).is(":checked");
		if(isChecked){
			checkedCount++;
		}
	}

	if(checkedCount > itemThreshold){
		$("#balloonGameRedemptionErrorSpan").text("Max of only " + itemThreshold +" items can be selected.");
		isValid = false;
	}else{
		$("#balloonGameRedemptionErrorSpan").text("");
	}
	return isValid;
};

BALLOON_GAME.sendRedeemDataToCashier = function(selectedBalloons) {
	var _data = {
			"messageType": "BALLOON_GAME_REDEEM_DATA",
			"balloonGameSelectedItems": selectedBalloons,
			"memberId": BALLOON_GAME.member.get()
		};
		cashierWinObject.postMessage(_data,location.protocol+"//"+location.host);
};

BALLOON_GAME.requestRedeemableItemsToCashier = function(memberId) {
	var _data = {
			"messageType": "REQUEST_BALLOON_GAME_REDEEMABLE_ITEMS",
			"memberId": memberId
		};
		cashierWinObject.postMessage(_data,location.protocol+"//"+location.host);
};

BALLOON_GAME.getBalloonGameSelectedItems = function(){
	var selectedBalloons = [];
	var bgCheckboxes = $(".balloonGameRedeemableItemChk");
	
	for(var i=0;i<bgCheckboxes.length;i++){
		var isChecked = $(bgCheckboxes[i]).is(":checked");
		var balloon = new Object();
		if(isChecked){
			var id = $(bgCheckboxes[i]).attr("id");
			var desc = $(bgCheckboxes[i]).parent().prev().text();
			var type = $(bgCheckboxes[i]).attr("balloonType");
			id = id.replace("bgItemChk","");
			balloon.balloonItemId = id;
			balloon.balloonItemDesc = desc;
			balloon.type = type;
			selectedBalloons.push(balloon);
		}
	}

	return selectedBalloons;
};

BALLOON_GAME.itemThreshold = (function() {
	 var itemThreshold = null;
	 
	 return {
		 set: function(itemLimit) {
				 itemThreshold = itemLimit;
		 },
		 get: function() {
				 return itemThreshold;
		 }
	 };
})();

BALLOON_GAME.member = (function() {
	 var memberId = null;
	 
	 return {
		 set: function(id) {
				 memberId = id;
		 },
		 get: function() {
				 return memberId;
		 }
	 };
}());

BALLOON_GAME.redeemedBalloons = (function() {
	 var balloons = null;
	 
	 return {
		 set: function(items) {
				 balloons = items;
		 },
		 get: function() {
				 return balloons;
		 }
	 };
}());

/*
 * Close Cashier waiting screenlock from Customer Page
 */
BALLOON_GAME.closeLoadingDialog = function(){
	var _data = {
			"messageType": "BALLOON_GAME_CLOSE_CASHIER_LOADING_DIALOG"
	};
	cashierWinObject.postMessage(_data,location.protocol+"//"+location.host);
};

BALLOON_GAME.closeCashierLoadingDialog = function(){
	$("#loadingDialogMessage").html("");
	$("#loading-dialog").dialog("close");
	$("#balloonGameLoading-dialog").dialog("close");
};
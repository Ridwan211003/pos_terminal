var Banana = Banana || {};
Banana.bananaFormJson = null;

Banana.url = {
		getBananaReportForm:	posWebContextPath + '/hypercash/hypercashsequence/taxInvoiceNumber/'
};

Banana.service = {
	promptCashierBananaReportDialog: function() {
		$.ajax({
			url : posWebContextPath + "/bananareport/getBananaDTOByCashier",
			type : "GET",
			async : false,
			dataType : "json",
			success : function(response) {
				if (!jQuery.isEmptyObject(response) && !response.error) {
					bananaReportFormDTO = response;
					if(bananaReportFormDTO.bananaReportDto && bananaReportFormDTO.bananaReportDto.status != null){
						if(bananaReportFormDTO.bananaReportDto.status == '0' || bananaReportFormDTO.bananaReportDto.status == '1') {
							//This means banana report is already submitted/approved
							$('#brForm').hide();
							$('#brMessageSubmitted').html('Banana report was already submitted.');
							$("#bananareport-dialog-without-submit").dialog("open");
						}else if(bananaReportFormDTO.bananaReportDto.status == '2')	{
							//This means banana Report is rejected; Retrieve rejected banana report
							$('#brForm').show();
							$('#brMessage').html('Banana Report was rejected. Please update and submit again.')
							Banana.service.setBananaReportFormHeaderValues();
							Banana.service.plotBananaReport();
							$("#bananareport-dialog").dialog("open");
						}else{
							//This means banana report hasnt been submitted yet
							$('#brForm').show();
							Banana.service.setBananaReportFormHeaderValues();
							$("#bananareport-dialog").dialog("open");
						}
						
					}
				}
				else {
					//No Banana Report entry for cashier yet.
					showMsgDialog(getMsgValue('pos_warning_msg_file_not_found'), "warning");
				}
			}
		});
		
	},
	
	plotBananaReport:	function()	{
		/*========================EFT ONLINE Start ===========================*/
		$('input[name=eftOnline\\.megaVisaUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.megaVisaUnt);
		$('input[name=eftOnline\\.megaVisaAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.megaVisaAmt);
		$('input[name=eftOnline\\.megaMstrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.megaMstrUnt);
		$('input[name=eftOnline\\.megaMstrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.megaMstrAmt);
		$('input[name=eftOnline\\.megaVisaOthrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.megaVisaOthrUnt);
		$('input[name=eftOnline\\.megaVisaOthrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.megaVisaOthrAmt);
		$('input[name=eftOnline\\.megaMstrOthrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.megaMstrOthrUnt);
		$('input[name=eftOnline\\.megaMstrOthrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.megaMstrOthrAmt);
		$('input[name=eftOnline\\.eftTotalUnt1]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.eftTotalUnt1);
		$('input[name=eftOnline\\.eftTotalAmt1]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.eftTotalAmt1);
		
		$('input[name=eftOnline\\.citiVisaUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.citiVisaUnt);
		$('input[name=eftOnline\\.citiVisaAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.citiVisaAmt);
		$('input[name=eftOnline\\.citiMstrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.citiMstrUnt);
		$('input[name=eftOnline\\.citiMstrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.citiMstrAmt);
		$('input[name=eftOnline\\.eftTotalUnt2]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.eftTotalUnt2);
		$('input[name=eftOnline\\.eftTotalAmt2]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.eftTotalAmt2);
		
		$('input[name=eftOnline\\.briVisaUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.briVisaUnt);
		$('input[name=eftOnline\\.briVisaAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.briVisaAmt);
		$('input[name=eftOnline\\.briMstrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.briMstrUnt);
		$('input[name=eftOnline\\.briMstrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.briMstrAmt);
		$('input[name=eftOnline\\.eftTotalUnt3]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.eftTotalUnt3);
		$('input[name=eftOnline\\.eftTotalAmt3]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.eftTotalAmt3);
		
		$('input[name=eftOnline\\.amexUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.amexUnt);
		$('input[name=eftOnline\\.amexAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.amexAmt);
		$('input[name=eftOnline\\.eftTotalUnt4]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.eftTotalUnt4);
		$('input[name=eftOnline\\.eftTotalAmt4]').attr('value', bananaReportFormDTO.bananaReportDto.eftOnline.eftTotalAmt4);
		/*========================EFT ONLINE END ===========================*/
		
		/*========================EFT OFFLINE START ===========================*/
		$('input[name=eftOffline\\.megaVisaUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.megaVisaUnt);
		$('input[name=eftOffline\\.megaVisaAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.megaVisaAmt);
		$('input[name=eftOffline\\.megaMstrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.megaMstrUnt);
		$('input[name=eftOffline\\.megaMstrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.megaMstrAmt);
		$('input[name=eftOffline\\.megaVisaOthrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.megaVisaOthrUnt);
		$('input[name=eftOffline\\.megaVisaOthrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.megaVisaOthrAmt);
		$('input[name=eftOffline\\.megaMstrOthrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.megaMstrOthrUnt);
		$('input[name=eftOffline\\.megaMstrOthrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.megaMstrOthrAmt);
		$('input[name=eftOffline\\.eftTotalUnt1]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.eftTotalUnt1);
		$('input[name=eftOffline\\.eftTotalAmt1]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.eftTotalAmt1);
		
		$('input[name=eftOffline\\.citiVisaUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.citiVisaUnt);
		$('input[name=eftOffline\\.citiVisaAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.citiVisaAmt);
		$('input[name=eftOffline\\.citiMstrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.citiMstrUnt);
		$('input[name=eftOffline\\.citiMstrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.citiMstrAmt);
		$('input[name=eftOffline\\.eftTotalUnt2]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.eftTotalUnt2);
		$('input[name=eftOffline\\.eftTotalAmt2]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.eftTotalAmt2);
		
		$('input[name=eftOffline\\.briVisaUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.briVisaUnt);
		$('input[name=eftOffline\\.briVisaAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.briVisaAmt);
		$('input[name=eftOffline\\.briMstrUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.briMstrUnt);
		$('input[name=eftOffline\\.briMstrAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.briMstrAmt);
		$('input[name=eftOffline\\.eftTotalUnt3]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.eftTotalUnt3);
		$('input[name=eftOffline\\.eftTotalAmt3]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.eftTotalAmt3);
		
		$('input[name=eftOffline\\.amexUnt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.amexUnt);
		$('input[name=eftOffline\\.amexAmt]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.amexAmt);
		$('input[name=eftOffline\\.eftTotalUnt4]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.eftTotalUnt4);
		$('input[name=eftOffline\\.eftTotalAmt4]').attr('value', bananaReportFormDTO.bananaReportDto.eftOffline.eftTotalAmt4);
		/*========================EFT OFFLINE END ===========================*/
		
		/*========================EDC BCA START    ==========================*/
		$('input[name=ebDebitBcaUnt]').attr('value', bananaReportFormDTO.bananaReportDto.ebDebitBcaUnt);
		$('input[name=ebDebitBcaAmt]').attr('value', bananaReportFormDTO.bananaReportDto.ebDebitBcaAmt);
		$('input[name=ebEdcPaymentUnt]').attr('value', bananaReportFormDTO.bananaReportDto.ebEdcPaymentUnt);
		$('input[name=ebEdcPaymentAmt]').attr('value', bananaReportFormDTO.bananaReportDto.ebEdcPaymentAmt);
		$('input[name=ebBcaCardUnt]').attr('value', bananaReportFormDTO.bananaReportDto.ebBcaCardUnt);
		$('input[name=ebBcaCardAmt]').attr('value', bananaReportFormDTO.bananaReportDto.ebBcaCardAmt);
		$('input[name=ebFlazzBcaUnt]').attr('value', bananaReportFormDTO.bananaReportDto.ebFlazzBcaUnt);
		$('input[name=ebFlazzBcaAmt]').attr('value', bananaReportFormDTO.bananaReportDto.ebFlazzBcaAmt);
		$('input[name=ebBcaOtherUnt]').attr('value', bananaReportFormDTO.bananaReportDto.ebBcaOtherUnt);
		$('input[name=ebBcaOtherAmt]').attr('value', bananaReportFormDTO.bananaReportDto.ebBcaOtherAmt);
		/*========================EDC BCA END    ==========================*/
		
		/*========================OTHERS(1) START ==========================*/
		$('input[name=giftCardVoucher1Unt]').attr('value', bananaReportFormDTO.bananaReportDto.giftCardVoucher1Unt);
		$('input[name=giftCardVoucher1Amt]').attr('value', bananaReportFormDTO.bananaReportDto.giftCardVoucher1Amt);
		$('input[name=giftCardVoucher2Unt]').attr('value', bananaReportFormDTO.bananaReportDto.giftCardVoucher2Unt);
		$('input[name=giftCardVoucher2Amt]').attr('value', bananaReportFormDTO.bananaReportDto.giftCardVoucher2Amt);
		$('input[name=supplierVoucherUnt]').attr('value', bananaReportFormDTO.bananaReportDto.supplierVoucherUnt);
		$('input[name=supplierVoucherAmt]').attr('value', bananaReportFormDTO.bananaReportDto.supplierVoucherAmt);
		$('input[name=otherVoucherUnt]').attr('value', bananaReportFormDTO.bananaReportDto.otherVoucherUnt);
		$('input[name=otherVoucherAmt]').attr('value', bananaReportFormDTO.bananaReportDto.otherVoucherAmt);
		$('input[name=dinnersUnt]').attr('value', bananaReportFormDTO.bananaReportDto.dinnersUnt);
		$('input[name=dinnersAmt]').attr('value', bananaReportFormDTO.bananaReportDto.dinnersAmt);
		$('input[name=installmentUnt]').attr('value', bananaReportFormDTO.bananaReportDto.installmentUnt);
		$('input[name=installmentAmt]').attr('value', bananaReportFormDTO.bananaReportDto.installmentAmt);
		$('input[name=otherPaymentTotalUnt]').attr('value', bananaReportFormDTO.bananaReportDto.otherPaymentTotalUnt);
		$('input[name=otherPaymentTotalAmt]').attr('value', bananaReportFormDTO.bananaReportDto.otherPaymentTotalAmt);
		//$('input[name=total1Amt]').val(),
		/*========================OTHERS(1) END  ==========================*/
		
		/*=======================CASH(Notes) START =======================*/
		$('input[name=note100kUnt]').attr('value', bananaReportFormDTO.bananaReportDto.note100kUnt);
		$('input[name=note50kUnt]').attr('value', bananaReportFormDTO.bananaReportDto.note50kUnt);
		$('input[name=note20kUnt]').attr('value', bananaReportFormDTO.bananaReportDto.note20kUnt);
		$('input[name=note10kUnt]').attr('value', bananaReportFormDTO.bananaReportDto.note10kUnt);
		$('input[name=note5kUnt]').attr('value', bananaReportFormDTO.bananaReportDto.note5kUnt);
		$('input[name=note2kUnt]').attr('value', bananaReportFormDTO.bananaReportDto.note2kUnt);
		$('input[name=note1kUnt]').attr('value', bananaReportFormDTO.bananaReportDto.note1kUnt);
		/*=======================CASH(Notes) END =======================*/
		
		/*=======================CASH(Coins) START =======================*/
		$('input[name=coin1000Unt]').attr('value', bananaReportFormDTO.bananaReportDto.coin1000Unt);
		$('input[name=coin500Unt]').attr('value', bananaReportFormDTO.bananaReportDto.coin500Unt);
		$('input[name=coin200Unt]').attr('value', bananaReportFormDTO.bananaReportDto.coin200Unt);
		$('input[name=coin100Unt]').attr('value', bananaReportFormDTO.bananaReportDto.coin100Unt);
		$('input[name=coin50Unt]').attr('value', bananaReportFormDTO.bananaReportDto.coin50Unt);
		/*=======================CASH(Coins) END =======================*/
		
		/*========================OTHERS(2) START ==========================*/
		$('input[name=cashCvsAmt]').attr('value', bananaReportFormDTO.bananaReportDto.cashCvsAmt);
		$('input[name=cashEcommerceAmt]').attr('value', bananaReportFormDTO.bananaReportDto.cashEcommerceAmt);
		$('input[name=cashHomeDeliveryAmt]').attr('value', bananaReportFormDTO.bananaReportDto.cashHomeDeliveryAmt);
		/*========================OTHERS(2) END   ==========================*/

		/*========================CASH PICKUP START ==========================*/
		$('input[name=cashPickup1Amt]').attr('value', bananaReportFormDTO.bananaReportDto.cashPickup1Amt);
		$('input[name=cashPickup2Amt]').attr('value', bananaReportFormDTO.bananaReportDto.cashPickup2Amt);
		$('input[name=cashPickup3Amt]').attr('value', bananaReportFormDTO.bananaReportDto.cashPickup3Amt);
		$('input[name=cashPickup4Amt]').attr('value', bananaReportFormDTO.bananaReportDto.cashPickup4Amt);
		$('input[name=cashPickup5Amt]').attr('value', bananaReportFormDTO.bananaReportDto.cashPickup5Amt);
		$('input[name=totalOthersAmt]').attr('value', bananaReportFormDTO.bananaReportDto.totalOthersAmt);
		$('input[name=roundingAdjstmntAmt]').attr('value', bananaReportFormDTO.bananaReportDto.roundingAdjstmntAmt);
		/*========================CASH PICKUP END   ==========================*/

		/*=================Recompute Banana Report =============================*/
		Banana.service.computeBananaReport();
	},
	
	submitCashierBananaReport: function() {
		var jsonrequest = Banana.json.constructJsonRequest();
		$.ajax({
			url : posWebContextPath + "/bananareport/bananaReportSubmitByCashier",
			type : 'post',
			dataType : "json",
			contentType : 'application/json',
			data : JSON.stringify(jsonrequest),
			success : function(response) {
				uilog('DBUG','Successfully submitted banana Form');
			},
			error : function(response) {
				uilog('DBUG','Error encountered on submitting Banana Report.'
						+ response);
			}
		});
	},
	
	setBananaReportFormHeaderValues: function(){
		$("#brfReportDate").html(bananaReportFormDTO.reportDate);
		$("#brfCashierUsername").html(bananaReportFormDTO.bananaReportDto.cashierEmp.users.username);
		
		var givenName = bananaReportFormDTO.bananaReportDto.cashierEmp.givenName;
		var middleName = bananaReportFormDTO.bananaReportDto.cashierEmp.middleName;
		var lastName = bananaReportFormDTO.bananaReportDto.cashierEmp.lastName;
		var fullName =  givenName + (middleName ? ' ':' '+middleName+' ') + lastName;
		$("#brfCashierName").html(fullName);
		$("#brfLastTerminalNo").html(bananaReportFormDTO.bananaReportDto.lastTerminalNo);
		
		$('input[name=roundingAdjstmntAmt]').attr('value', bananaReportFormDTO.bananaReportDto.roundingAdjstmntAmt);
	},	
	
	computeBananaReport: function(){
		$('.numberInputText').css('text-align','right');
		$('.numberComputedText').css('text-align','right');
		
		//********************EFT Online Start ***********************
		//Total1
		var eftOnMegaVisaUnt = parseInt($("input[name=eftOnline\\.megaVisaUnt]").val());
		if(isNaN(eftOnMegaVisaUnt))eftOnMegaVisaUnt = 0;
		var eftOnMegaVisaAmt = parseInt($("input[name=eftOnline\\.megaVisaAmt]").val());
		if(isNaN(eftOnMegaVisaAmt))eftOnMegaVisaAmt = 0;
		
		var eftOnMegaMstrUnt = parseInt($("input[name=eftOnline\\.megaMstrUnt]").val());
		if(isNaN(eftOnMegaMstrUnt))eftOnMegaMstrUnt = 0;
		var eftOnMegaMstrAmt = parseInt($("input[name=eftOnline\\.megaMstrAmt]").val());
		if(isNaN(eftOnMegaMstrAmt))eftOnMegaMstrAmt = 0;
		
		var eftOnMegaVisaOthrUnt = parseInt($("input[name=eftOnline\\.megaVisaOthrUnt]").val());
		if(isNaN(eftOnMegaVisaOthrUnt))eftOnMegaVisaOthrUnt = 0;
		var eftOnMegaVisaOthrAmt = parseInt($("input[name=eftOnline\\.megaVisaOthrAmt]").val());
		if(isNaN(eftOnMegaVisaOthrAmt))eftOnMegaVisaOthrAmt = 0;
		
		var eftOnMegaMstrOthrUnt = parseInt($("input[name=eftOnline\\.megaMstrOthrUnt]").val());
		if(isNaN(eftOnMegaMstrOthrUnt))eftOnMegaMstrOthrUnt = 0;
		var eftOnMegaMstrOthrAmt = parseInt($("input[name=eftOnline\\.megaMstrOthrAmt]").val());
		if(isNaN(eftOnMegaMstrOthrAmt))eftOnMegaMstrOthrAmt = 0;
		
		var eftOnlineTotalUnt1 =
			eftOnMegaVisaUnt+
			eftOnMegaMstrUnt+
			eftOnMegaVisaOthrUnt+
			eftOnMegaMstrOthrUnt;
		$("input[name=eftOnline\\.eftTotalUnt1]").val(eftOnlineTotalUnt1);
		
		var eftOnlineTotalAmt1 =
			eftOnMegaVisaAmt+
			eftOnMegaMstrAmt+
			eftOnMegaVisaOthrAmt+
			eftOnMegaMstrOthrAmt;
		$("input[name=eftOnline\\.eftTotalAmt1]").val(eftOnlineTotalAmt1);
		
		//Total2
		var eftOnCitiVisaUnt = parseInt($("input[name=eftOnline\\.citiVisaUnt]").val());
		if(isNaN(eftOnCitiVisaUnt))eftOnCitiVisaUnt = 0;
		var eftOnCitiVisaAmt = parseInt($("input[name=eftOnline\\.citiVisaAmt]").val());
		if(isNaN(eftOnCitiVisaAmt))eftOnCitiVisaAmt = 0;
		
		var eftOnCitiMstrUnt = parseInt($("input[name=eftOnline\\.citiMstrUnt]").val());
		if(isNaN(eftOnCitiMstrUnt))eftOnCitiMstrUnt = 0;
		var eftOnCitiMstrAmt = parseInt($("input[name=eftOnline\\.citiMstrAmt]").val());
		if(isNaN(eftOnCitiMstrAmt))eftOnCitiMstrAmt = 0;
		
		var eftOnlineTotalUnt2 =
			eftOnCitiVisaUnt+
			eftOnCitiMstrUnt;
		$("input[name=eftOnline\\.eftTotalUnt2]").val(eftOnlineTotalUnt2);
		
		var eftOnlineTotalAmt2 =
			eftOnCitiVisaAmt+
			eftOnCitiMstrAmt;
		$("input[name=eftOnline\\.eftTotalAmt2]").val(eftOnlineTotalAmt2);
		
		//Total3
		var eftOnBriVisaUnt = parseInt($("input[name=eftOnline\\.briVisaUnt]").val());
		if(isNaN(eftOnBriVisaUnt))eftOnBriVisaUnt = 0;
		var eftOnBriVisaAmt = parseInt($("input[name=eftOnline\\.briVisaAmt]").val());
		if(isNaN(eftOnBriVisaAmt))eftOnBriVisaAmt = 0;
		
		var eftOnBriMstrUnt = parseInt($("input[name=eftOnline\\.briMstrUnt]").val());
		if(isNaN(eftOnBriMstrUnt))eftOnBriMstrUnt = 0;
		var eftOnBriMstrAmt = parseInt($("input[name=eftOnline\\.briMstrAmt]").val());
		if(isNaN(eftOnBriMstrAmt))eftOnBriMstrAmt = 0;
		
		var eftOnlineTotalUnt3 =
			eftOnBriVisaUnt+
			eftOnBriMstrUnt;
		$("input[name=eftOnline\\.eftTotalUnt3]").val(eftOnlineTotalUnt3);
		
		var eftOnlineTotalAmt3 =
			eftOnBriVisaAmt+
			eftOnBriMstrAmt;
		$("input[name=eftOnline\\.eftTotalAmt3]").val(eftOnlineTotalAmt3);
		
		//Total4
		var eftOnAmexUnt = parseInt($("input[name=eftOnline\\.amexUnt]").val());
		if(isNaN(eftOnAmexUnt))eftOnAmexUnt = 0;
		var eftOnAmexAmt = parseInt($("input[name=eftOnline\\.amexAmt]").val());
		if(isNaN(eftOnAmexAmt))eftOnAmexAmt = 0;
		
		$("input[name=eftOnline\\.eftTotalUnt4]").val(eftOnAmexUnt);
		$("input[name=eftOnline\\.eftTotalAmt4]").val(eftOnAmexAmt);
		//********************EFT Online End ***********************
		
		//********************EFT Offline Start ***********************
		//Total5
		var eftOffMegaVisaUnt = parseInt($("input[name=eftOffline\\.megaVisaUnt]").val());
		if(isNaN(eftOffMegaVisaUnt))eftOffMegaVisaUnt = 0;
		var eftOffMegaVisaAmt = parseInt($("input[name=eftOffline\\.megaVisaAmt]").val());
		if(isNaN(eftOffMegaVisaAmt))eftOffMegaVisaAmt = 0;
		
		var eftOffMegaMstrUnt = parseInt($("input[name=eftOffline\\.megaMstrUnt]").val());
		if(isNaN(eftOffMegaMstrUnt))eftOffMegaMstrUnt = 0;
		var eftOffMegaMstrAmt = parseInt($("input[name=eftOffline\\.megaMstrAmt]").val());
		if(isNaN(eftOffMegaMstrAmt))eftOffMegaMstrAmt = 0;
		
		var eftOffMegaVisaOthrUnt = parseInt($("input[name=eftOffline\\.megaVisaOthrUnt]").val());
		if(isNaN(eftOffMegaVisaOthrUnt))eftOffMegaVisaOthrUnt = 0;
		var eftOffMegaVisaOthrAmt = parseInt($("input[name=eftOffline\\.megaVisaOthrAmt]").val());
		if(isNaN(eftOffMegaVisaOthrAmt))eftOffMegaVisaOthrAmt = 0;
		
		var eftOffMegaMstrOthrUnt = parseInt($("input[name=eftOffline\\.megaMstrOthrUnt]").val());
		if(isNaN(eftOffMegaMstrOthrUnt))eftOffMegaMstrOthrUnt = 0;
		var eftOffMegaMstrOthrAmt = parseInt($("input[name=eftOffline\\.megaMstrOthrAmt]").val());
		if(isNaN(eftOffMegaMstrOthrAmt))eftOffMegaMstrOthrAmt = 0;
		
		var eftOfflineTotalUnt1 =
			eftOffMegaVisaUnt+
			eftOffMegaMstrUnt+
			eftOffMegaVisaOthrUnt+
			eftOffMegaMstrOthrUnt;
		$("input[name=eftOffline\\.eftTotalUnt1]").val(eftOfflineTotalUnt1);
		
		var eftOfflineTotalAmt1 =
			eftOffMegaVisaAmt+
			eftOffMegaMstrAmt+
			eftOffMegaVisaOthrAmt+
			eftOffMegaMstrOthrAmt;
		$("input[name=eftOffline\\.eftTotalAmt1]").val(eftOfflineTotalAmt1);
		
		//Total6
		var eftOffCitiVisaUnt = parseInt($("input[name=eftOffline\\.citiVisaUnt]").val());
		if(isNaN(eftOffCitiVisaUnt))eftOffCitiVisaUnt = 0;
		var eftOffCitiVisaAmt = parseInt($("input[name=eftOffline\\.citiVisaAmt]").val());
		if(isNaN(eftOffCitiVisaAmt))eftOffCitiVisaAmt = 0;
		
		var eftOffCitiMstrUnt = parseInt($("input[name=eftOffline\\.citiMstrUnt]").val());
		if(isNaN(eftOffCitiMstrUnt))eftOffCitiMstrUnt = 0;
		var eftOffCitiMstrAmt = parseInt($("input[name=eftOffline\\.citiMstrAmt]").val());
		if(isNaN(eftOffCitiMstrAmt))eftOffCitiMstrAmt = 0;
		
		var eftOfflineTotalUnt2 =
			eftOffCitiVisaUnt+
			eftOffCitiMstrUnt;
		$("input[name=eftOffline\\.eftTotalUnt2]").val(eftOfflineTotalUnt2);
		
		var eftOfflineTotalAmt2 =
			eftOffCitiVisaAmt+
			eftOffCitiMstrAmt;
		$("input[name=eftOffline\\.eftTotalAmt2]").val(eftOfflineTotalAmt2);
		
		//Total7
		var eftOffBriVisaUnt = parseInt($("input[name=eftOffline\\.briVisaUnt]").val());
		if(isNaN(eftOffBriVisaUnt))eftOffBriVisaUnt = 0;
		var eftOffBriVisaAmt = parseInt($("input[name=eftOffline\\.briVisaAmt]").val());
		if(isNaN(eftOffBriVisaAmt))eftOffBriVisaAmt = 0;
		
		var eftOffBriMstrUnt = parseInt($("input[name=eftOffline\\.briMstrUnt]").val());
		if(isNaN(eftOffBriMstrUnt))eftOffBriMstrUnt = 0;
		var eftOffBriMstrAmt = parseInt($("input[name=eftOffline\\.briMstrAmt]").val());
		if(isNaN(eftOffBriMstrAmt))eftOffBriMstrAmt = 0;
		
		var eftOfflineTotalUnt3 =
			eftOffBriVisaUnt+
			eftOffBriMstrUnt;
		$("input[name=eftOffline\\.eftTotalUnt3]").val(eftOfflineTotalUnt3);
		
		var eftOfflineTotalAmt3 =
			eftOffBriVisaAmt+
			eftOffBriMstrAmt;
		$("input[name=eftOffline\\.eftTotalAmt3]").val(eftOfflineTotalAmt3);
		
		//Total8
		var eftOffAmexUnt = parseInt($("input[name=eftOffline\\.amexUnt]").val());
		if(isNaN(eftOffAmexUnt))eftOffAmexUnt = 0;
		var eftOffAmexAmt = parseInt($("input[name=eftOffline\\.amexAmt]").val());
		if(isNaN(eftOffAmexAmt))eftOffAmexAmt = 0;
		
		$("input[name=eftOffline\\.eftTotalUnt4]").val(eftOffAmexUnt);
		$("input[name=eftOffline\\.eftTotalAmt4]").val(eftOffAmexAmt);
		//********************EFT Offline End ***********************
		
		//********************EDC BCA Start ***********************
		//Total9
		var ebDebitBcaUnt = parseInt($("input[name=ebDebitBcaUnt]").val());
		if(isNaN(ebDebitBcaUnt))ebDebitBcaUnt = 0;
		var ebDebitBcaAmt = parseInt($("input[name=ebDebitBcaAmt]").val());
		if(isNaN(ebDebitBcaAmt))ebDebitBcaAmt = 0;
		
		var ebEdcPaymentUnt = parseInt($("input[name=ebEdcPaymentUnt]").val());
		if(isNaN(ebEdcPaymentUnt))ebEdcPaymentUnt = 0;
		var ebEdcPaymentAmt = parseInt($("input[name=ebEdcPaymentAmt]").val());
		if(isNaN(ebEdcPaymentAmt))ebEdcPaymentAmt = 0;
		
		var ebBcaCardUnt = parseInt($("input[name=ebBcaCardUnt]").val());
		if(isNaN(ebBcaCardUnt))ebBcaCardUnt = 0;
		var ebBcaCardAmt = parseInt($("input[name=ebBcaCardAmt]").val());
		if(isNaN(ebBcaCardAmt))ebBcaCardAmt = 0;
		
		var ebFlazzBcaUnt = parseInt($("input[name=ebFlazzBcaUnt]").val());
		if(isNaN(ebFlazzBcaUnt))ebFlazzBcaUnt = 0;
		var ebFlazzBcaAmt = parseInt($("input[name=ebFlazzBcaAmt]").val());
		if(isNaN(ebFlazzBcaAmt))ebFlazzBcaAmt = 0;
		
		var ebBcaOtherUnt = parseInt($("input[name=ebBcaOtherUnt]").val());
		if(isNaN(ebBcaOtherUnt))ebBcaOtherUnt = 0;
		var ebBcaOtherAmt = parseInt($("input[name=ebBcaOtherAmt]").val());
		if(isNaN(ebBcaOtherAmt))ebBcaOtherAmt = 0;
		
		var edcBcaTotalUnt =
			ebDebitBcaUnt+
			ebEdcPaymentUnt+
			ebBcaCardUnt+
			ebFlazzBcaUnt+
			ebBcaOtherUnt;
		$("input[name=edcBcaTotalUnt]").val(edcBcaTotalUnt);
		
		var edcBcaTotalAmt =
			ebDebitBcaAmt+
			ebEdcPaymentAmt+
			ebBcaCardAmt+
			ebFlazzBcaAmt+
			ebBcaOtherAmt;
		$("input[name=edcBcaTotalAmt]").val(edcBcaTotalAmt);
		//********************EDC BCA End ***********************
		
		//********************Others Start ***********************
		//Total10
		var giftCardVoucher1Unt = parseInt($("input[name=giftCardVoucher1Unt]").val());
		if(isNaN(giftCardVoucher1Unt))giftCardVoucher1Unt = 0;
		var giftCardVoucher1Amt = parseInt($("input[name=giftCardVoucher1Amt]").val());
		if(isNaN(giftCardVoucher1Amt))giftCardVoucher1Amt = 0;
		
		var giftCardVoucher2Unt = parseInt($("input[name=giftCardVoucher2Unt]").val());
		if(isNaN(giftCardVoucher2Unt))giftCardVoucher2Unt = 0;
		var giftCardVoucher2Amt = parseInt($("input[name=giftCardVoucher2Amt]").val());
		if(isNaN(giftCardVoucher2Amt))giftCardVoucher2Amt = 0;
		
		var supplierVoucherUnt = parseInt($("input[name=supplierVoucherUnt]").val());
		if(isNaN(supplierVoucherUnt))supplierVoucherUnt = 0;
		var supplierVoucherAmt = parseInt($("input[name=supplierVoucherAmt]").val());
		if(isNaN(supplierVoucherAmt))supplierVoucherAmt = 0;
		
		var otherVoucherUnt = parseInt($("input[name=otherVoucherUnt]").val());
		if(isNaN(otherVoucherUnt))otherVoucherUnt = 0;
		var otherVoucherAmt = parseInt($("input[name=otherVoucherAmt]").val());
		if(isNaN(otherVoucherAmt))otherVoucherAmt = 0;
		
		var dinnersUnt = parseInt($("input[name=dinnersUnt]").val());
		if(isNaN(dinnersUnt))dinnersUnt = 0;
		var dinnersAmt = parseInt($("input[name=dinnersAmt]").val());
		if(isNaN(dinnersAmt))dinnersAmt = 0;
		
		var installmentUnt = parseInt($("input[name=installmentUnt]").val());
		if(isNaN(installmentUnt))installmentUnt = 0;
		var installmentAmt = parseInt($("input[name=installmentAmt]").val());
		if(isNaN(installmentAmt))installmentAmt = 0;
		
		var otherPaymentTotalUnt =
			giftCardVoucher1Unt+
			giftCardVoucher2Unt+
			supplierVoucherUnt+
			otherVoucherUnt+
			dinnersUnt+
			installmentUnt;
		$("input[name=otherPaymentTotalUnt]").val(otherPaymentTotalUnt);
		
		var otherPaymentTotalAmt =
			giftCardVoucher1Amt+
			giftCardVoucher2Amt+
			supplierVoucherAmt+
			otherVoucherAmt+
			dinnersAmt+
			installmentAmt;
		$("input[name=otherPaymentTotalAmt]").val(otherPaymentTotalAmt);
		//********************Others End ***********************
		
		//***********START:Computes for Total Amount 1 ******************//
		var total1 = eftOnlineTotalAmt1 +
			eftOnlineTotalAmt2 +
			eftOnlineTotalAmt3 +
			eftOnAmexAmt + 
			eftOfflineTotalAmt1 +
			eftOfflineTotalAmt2 +
			eftOfflineTotalAmt3 +
			eftOffAmexAmt +
			edcBcaTotalAmt +
			otherPaymentTotalAmt;
		$("input[name=total1Amt]").val(total1);
		//***********END:Computes for Total Amount 1 ******************//
		
		//********************Cash Notes Start ***********************
		var note100kUnt = parseInt($("input[name=note100kUnt]").val());
		if(isNaN(note100kUnt))note100kUnt = 0;
		$("#note100kAmt").val(note100kUnt * 100000);
		var note100kAmt = parseInt($("#note100kAmt").val());
		if(isNaN(note100kAmt))note100kAmt = 0;
		
		var note50kUnt = parseInt($("input[name=note50kUnt]").val());
		if(isNaN(note50kUnt))note50kUnt = 0;
		$("#note50kAmt").val(note50kUnt * 50000);
		var note50kAmt = parseInt($("#note50kAmt").val());
		if(isNaN(note50kAmt))note50kAmt = 0;
		
		var note20kUnt = parseInt($("input[name=note20kUnt]").val());
		if(isNaN(note20kUnt))note20kUnt = 0;
		$("#note20kAmt").val(note20kUnt * 20000);
		var note20kAmt = parseInt($("#note20kAmt").val());
		if(isNaN(note20kAmt))note20kAmt = 0;
		
		var note10kUnt = parseInt($("input[name=note10kUnt]").val());
		if(isNaN(note10kUnt))note10kUnt = 0;
		$("#note10kAmt").val(note10kUnt * 10000);
		var note10kAmt = parseInt($("#note10kAmt").val());
		if(isNaN(note10kAmt))note10kAmt = 0;
		
		var note5kUnt = parseInt($("input[name=note5kUnt]").val());
		if(isNaN(note5kUnt))note5kUnt = 0;
		$("#note5kAmt").val(note5kUnt * 5000);
		var note5kAmt = parseInt($("#note5kAmt").val());
		if(isNaN(note5kAmt))note5kAmt = 0;
		
		var note2kUnt = parseInt($("input[name=note2kUnt]").val());
		if(isNaN(note2kUnt))note2kUnt = 0;
		$("#note2kAmt").val(note2kUnt * 2000);
		var note2kAmt = parseInt($("#note2kAmt").val());
		if(isNaN(note2kAmt))note2kAmt = 0;
		
		var note1kUnt = parseInt($("input[name=note1kUnt]").val());
		if(isNaN(note1kUnt))note1kUnt = 0;
		$("#note1kAmt").val(note1kUnt * 1000);
		var note1kAmt = parseInt($("#note1kAmt").val());
		if(isNaN(note1kAmt))note1kAmt = 0;
		//********************Cash Notes End ***********************
		
		//********************Cash Coins Start ***********************
		var coin1000Unt = parseInt($("input[name=coin1000Unt]").val());
		if(isNaN(coin1000Unt))coin1000Unt = 0;
		$("#coin1000Amt").val(coin1000Unt * 1000);
		var coin1000Amt = parseInt($("#coin1000Amt").val());
		if(isNaN(coin1000Amt))coin1000Amt = 0;
		
		var coin500Unt = parseInt($("input[name=coin500Unt]").val());
		if(isNaN(coin500Unt))coin500Unt = 0;
		$("#coin500Amt").val(coin500Unt * 500);
		var coin500Amt = parseInt($("#coin500Amt").val());
		if(isNaN(coin500Amt))coin500Amt = 0;
		
		var coin200Unt = parseInt($("input[name=coin200Unt]").val());
		if(isNaN(coin200Unt))coin200Unt = 0;
		$("#coin200Amt").val(coin200Unt * 200);
		var coin200Amt = parseInt($("#coin200Amt").val());
		if(isNaN(coin200Amt))coin200Amt = 0;
		
		var coin100Unt = parseInt($("input[name=coin100Unt]").val());
		if(isNaN(coin100Unt))coin100Unt = 0;
		$("#coin100Amt").val(coin100Unt * 100);
		var coin100Amt = parseInt($("#coin100Amt").val());
		if(isNaN(coin100Amt))coin100Amt = 0;
		
		var coin50Unt = parseInt($("input[name=coin50Unt]").val());
		if(isNaN(coin50Unt))coin50Unt = 0;
		$("#coin50Amt").val(coin50Unt * 50);
		var coin50Amt = parseInt($("#coin50Amt").val());
		if(isNaN(coin50Amt))coin50Amt = 0;
		//********************Cash Coins End ***********************
		
		//***********START:Computes for Total Amount 2 ******************//
		var total2 =
			note100kAmt+
			note50kAmt+
			note20kAmt+
			note10kAmt+
			note5kAmt+
			note2kAmt+
			note1kAmt+
			coin1000Amt+
			coin500Amt+
			coin200Amt+
			coin100Amt+
			coin50Amt;
		$("input[name=total2Amt]").val(total2);
		//***********END:Computes for Total Amount 2 ******************//
		
		//********************Cash Others Start ***********************
		var cashCvsAmt = parseInt($("input[name=cashCvsAmt]").val());
		if(isNaN(cashCvsAmt))cashCvsAmt = 0;
		var cashEcommerceAmt = parseInt($("input[name=cashEcommerceAmt]").val());
		if(isNaN(cashEcommerceAmt))cashEcommerceAmt = 0;
		var cashHomeDeliveryAmt = parseInt($("input[name=cashHomeDeliveryAmt]").val());
		if(isNaN(cashHomeDeliveryAmt))cashHomeDeliveryAmt = 0;
		//********************Cash Others End ***********************
		
		//***********START:Computes for Total Amount 3 ******************//
		var total3 =
			cashCvsAmt+
			cashEcommerceAmt+
			cashHomeDeliveryAmt;
		$("input[name=total3Amt]").val(total3);
		//***********END:Computes for Total Amount 3 ******************//
		
		//********************Cash Pickup Start ***********************
		var cashPickup1Amt = parseInt($("input[name=cashPickup1Amt]").val());
		if(isNaN(cashPickup1Amt))cashPickup1Amt = 0;
		var cashPickup2Amt = parseInt($("input[name=cashPickup2Amt]").val());
		if(isNaN(cashPickup2Amt))cashPickup2Amt = 0;
		var cashPickup3Amt = parseInt($("input[name=cashPickup3Amt]").val());
		if(isNaN(cashPickup3Amt))cashPickup3Amt = 0;
		var cashPickup4Amt = parseInt($("input[name=cashPickup4Amt]").val());
		if(isNaN(cashPickup4Amt))cashPickup4Amt = 0;
		var cashPickup5Amt = parseInt($("input[name=cashPickup5Amt]").val());
		if(isNaN(cashPickup5Amt))cashPickup5Amt = 0;
		//********************Cash Pickup End ***********************
		
		//***********START:Computes for Total Amount 4 ******************//
		var total4 =
			cashPickup1Amt+
			cashPickup2Amt+
			cashPickup3Amt+
			cashPickup4Amt+
			cashPickup5Amt;
		$("input[name=total4Amt]").val(total4);
		//***********START:Computes for Total Amount 4 ******************//
		
		//********************Other Total Start ***********************
		var total5 = parseInt($("input[name=totalOthersAmt]").val());
		if(isNaN(total5))total5 = 0;
		//********************Other Total End ***********************
		var roundingAmount = parseInt($("input[name=roundingAdjstmntAmt]").val());
		if(isNaN(roundingAmount))roundingAmount = 0;
		
		var grandTotal =
			total1+
			total2+
			total3+
			total4+
			total5;
		$("input[name=grandTotalAmt]").val(grandTotal);
		
		var grandTotalAftrAdjAmt = grandTotal - roundingAmount;
		$("input[name=grandTotalAftrAdjAmt]").val(grandTotalAftrAdjAmt);
		
		var difference = grandTotal - grandTotalAftrAdjAmt;
		$("input[name=differenceAmt]").val(difference);
	}
};

Banana.json = {
		constructJsonRequest: function(){
			var jsonBrf = {
					'reportDate'		:	bananaReportFormDTO.reportDate,
					'bananaReportDto'	:	Banana.json.constructBananaReportDtoJson()
			}
			return jsonBrf;
		},
		
		constructBananaReportDtoJson: function(){
			var json = {
					//First Tab 
					'id'				:	bananaReportFormDTO.bananaReportDto.id,
					'status'			:	bananaReportFormDTO.bananaReportDto.status,
					'lastTerminalNo'	:	bananaReportFormDTO.bananaReportDto.lastTerminalNo,
					'cashierEmp'		:	Banana.json.constructEmployee(),
					'eftOnline'			: 	Banana.json.constructEftOnline(),
					'eftOffline'		: 	Banana.json.constructEftOffline(),
					'ebDebitBcaUnt'		:	$('input[name=ebDebitBcaUnt]').val(),
					'ebDebitBcaAmt'		:	$('input[name=ebDebitBcaAmt]').val(),
					'ebEdcPaymentUnt'	:	$('input[name=ebEdcPaymentUnt]').val(),
					'ebEdcPaymentAmt'	:	$('input[name=ebEdcPaymentAmt]').val(),
					'ebBcaCardUnt'		:	$('input[name=ebBcaCardUnt]').val(),
					'ebBcaCardAmt'		:	$('input[name=ebBcaCardAmt]').val(),
					'ebFlazzBcaUnt'		:	$('input[name=ebFlazzBcaUnt]').val(),
					'ebFlazzBcaAmt'		:	$('input[name=ebFlazzBcaAmt]').val(),
					'ebBcaOtherUnt'		:	$('input[name=ebBcaOtherUnt]').val(),
					'ebBcaOtherAmt'		:	$('input[name=ebBcaOtherAmt]').val(),
					'giftCardVoucher1Unt'	:	$('input[name=giftCardVoucher1Unt]').val(),
					'giftCardVoucher1Amt'	:	$('input[name=giftCardVoucher1Amt]').val(),
					'giftCardVoucher2Unt'	:	$('input[name=giftCardVoucher2Unt]').val(),
					'giftCardVoucher2Amt'	:	$('input[name=giftCardVoucher2Amt]').val(),
					'supplierVoucherUnt'	:	$('input[name=supplierVoucherUnt]').val(),
					'supplierVoucherAmt'	:	$('input[name=supplierVoucherAmt]').val(),
					'otherVoucherUnt'		:	$('input[name=otherVoucherUnt]').val(),
					'otherVoucherAmt'		:	$('input[name=otherVoucherAmt]').val(),
					'dinnersUnt'			:	$('input[name=dinnersUnt]').val(),
					'dinnersAmt'			:	$('input[name=dinnersAmt]').val(),
					'installmentUnt'		:	$('input[name=installmentUnt]').val(),
					'installmentAmt'		:	$('input[name=installmentAmt]').val(),
					'otherPaymentTotalUnt'	:	$('input[name=otherPaymentTotalUnt]').val(),
					'otherPaymentTotalAmt'	:	$('input[name=otherPaymentTotalAmt]').val(),
					'total1Amt'				:	$('input[name=total1Amt]').val(),
					
					//Second tab
					'note100kUnt'			:	$('input[name=note100kUnt]').val(),
					'note50kUnt'			:	$('input[name=note50kUnt]').val(),
					'note20kUnt'			:	$('input[name=note20kUnt]').val(),
					'note10kUnt'			:	$('input[name=note10kUnt]').val(),
					'note5kUnt'				:	$('input[name=note5kUnt]').val(),
					'note2kUnt'				:	$('input[name=note2kUnt]').val(),
					'note1kUnt'				:	$('input[name=note1kUnt]').val(),
					'coin1000Unt'			:	$('input[name=coin1000Unt]').val(),
					'coin500Unt'			:	$('input[name=coin500Unt]').val(),
					'coin200Unt'			:	$('input[name=coin200Unt]').val(),
					'coin100Unt'			:	$('input[name=coin100Unt]').val(),
					'coin50Unt'				:	$('input[name=coin50Unt]').val(),
					'total2Amt'				:	$('input[name=total2Amt]').val(),
					
					//Third tab
					'cashCvsAmt'			:	$('input[name=cashCvsAmt]').val(),
					'cashEcommerceAmt'		:	$('input[name=cashEcommerceAmt]').val(),
					'cashHomeDeliveryAmt'	:	$('input[name=cashHomeDeliveryAmt]').val(),
					'total3Amt'				:	$('input[name=total3Amt]').val(),
					
					'cashPickup1Amt'		:	$('input[name=cashPickup1Amt]').val(),
					'cashPickup2Amt'		:	$('input[name=cashPickup2Amt]').val(),
					'cashPickup3Amt'		:	$('input[name=cashPickup3Amt]').val(),
					'cashPickup4Amt'		:	$('input[name=cashPickup4Amt]').val(),
					'cashPickup5Amt'		:	$('input[name=cashPickup5Amt]').val(),
					'total4Amt'				:	$('input[name=total4Amt]').val(),
					'totalOthersAmt'		:	$('input[name=totalOthersAmt]').val(),
					'roundingAdjstmntAmt'	:	$('input[name=roundingAdjstmntAmt]').val(),
					
					//Fourth tab
					'grandTotalAmt'			:	$('input[name=grandTotalAmt]').val(),
					'grandTotalAftrAdjAmt'	:	$('input[name=grandTotalAftrAdjAmt]').val(),
					'differenceAmt'			:	$('input[name=differenceAmt]').val(),
					'salesCitiLinkAmt'		:	$('input[name=salesCitiLinkAmt]').val()					
			};
			
			return json;
		},
		
		constructEftOnline: function(){
			var eftOnlineJson = {
						'id'				:	bananaReportFormDTO.bananaReportDto.eftOnline.id,
						'megaVisaUnt'		:	$('input[name=eftOnline\\.megaVisaUnt]').val(),
						'megaVisaAmt'		:	$('input[name=eftOnline\\.megaVisaAmt]').val(),
						'megaMstrUnt'		:	$('input[name=eftOnline\\.megaMstrUnt]').val(),
						'megaMstrAmt'		:	$('input[name=eftOnline\\.megaMstrAmt]').val(),
						'megaVisaOthrUnt'	:	$('input[name=eftOnline\\.megaVisaOthrUnt]').val(),
						'megaVisaOthrAmt'	:	$('input[name=eftOnline\\.megaVisaOthrAmt]').val(),
						'megaMstrOthrUnt'	:	$('input[name=eftOnline\\.megaMstrOthrUnt]').val(),
						'megaMstrOthrAmt'	:	$('input[name=eftOnline\\.megaMstrOthrAmt]').val(),
						'eftTotalUnt1'		:	$('input[name=eftOnline\\.eftTotalUnt1]').val(),
						'eftTotalAmt1'		:	$('input[name=eftOnline\\.eftTotalAmt1]').val(),
						
						'citiVisaUnt'		:	$('input[name=eftOnline\\.citiVisaUnt]').val(),
						'citiVisaAmt'		:	$('input[name=eftOnline\\.citiVisaAmt]').val(),
						'citiMstrUnt'		:	$('input[name=eftOnline\\.citiMstrUnt]').val(),
						'citiMstrAmt'		:	$('input[name=eftOnline\\.citiMstrAmt]').val(),
						'eftTotalUnt2'		:	$('input[name=eftOnline\\.eftTotalUnt2]').val(),
						'eftTotalAmt2'		:	$('input[name=eftOnline\\.eftTotalAmt2]').val(),
						
						'briVisaUnt'		:	$('input[name=eftOnline\\.briVisaUnt]').val(),
						'briVisaAmt'		:	$('input[name=eftOnline\\.briVisaAmt]').val(),
						'briMstrUnt'		:	$('input[name=eftOnline\\.briMstrUnt]').val(),
						'briMstrAmt'		:	$('input[name=eftOnline\\.briMstrAmt]').val(),
						'eftTotalUnt3'		:	$('input[name=eftOnline\\.eftTotalUnt3]').val(),
						'eftTotalAmt3'		:	$('input[name=eftOnline\\.eftTotalAmt3]').val(),
						
						'amexUnt'			:	$('input[name=eftOnline\\.amexUnt]').val(),
						'amexAmt'			:	$('input[name=eftOnline\\.amexAmt]').val(),
						'eftTotalUnt4'		:	$('input[name=eftOnline\\.eftTotalUnt4]').val(),
						'eftTotalAmt4'		:	$('input[name=eftOnline\\.eftTotalAmt4]').val()
						
			};
			
			return eftOnlineJson;
		},
		
		constructEftOffline: function(){
			var eftOfflineJson = {
					'id'				:	bananaReportFormDTO.bananaReportDto.eftOffline.id,
					'megaVisaUnt'		:	$('input[name=eftOffline\\.megaVisaUnt]').val(),
					'megaVisaAmt'		:	$('input[name=eftOffline\\.megaVisaAmt]').val(),
					'megaMstrUnt'		:	$('input[name=eftOffline\\.megaMstrUnt]').val(),
					'megaMstrAmt'		:	$('input[name=eftOffline\\.megaMstrAmt]').val(),
					'megaVisaOthrUnt'	:	$('input[name=eftOffline\\.megaVisaOthrUnt]').val(),
					'megaVisaOthrAmt'	:	$('input[name=eftOffline\\.megaVisaOthrAmt]').val(),
					'megaMstrOthrUnt'	:	$('input[name=eftOffline\\.megaMstrOthrUnt]').val(),
					'megaMstrOthrAmt'	:	$('input[name=eftOffline\\.megaMstrOthrAmt]').val(),
					'eftTotalUnt1'		:	$('input[name=eftOffline\\.eftTotalUnt1]').val(),
					'eftTotalAmt1'		:	$('input[name=eftOffline\\.eftTotalAmt1]').val(),
					
					'citiVisaUnt'		:	$('input[name=eftOffline\\.citiVisaUnt]').val(),
					'citiVisaAmt'		:	$('input[name=eftOffline\\.citiVisaAmt]').val(),
					'citiMstrUnt'		:	$('input[name=eftOffline\\.citiMstrUnt]').val(),
					'citiMstrAmt'		:	$('input[name=eftOffline\\.citiMstrAmt]').val(),
					'eftTotalUnt2'		:	$('input[name=eftOffline\\.eftTotalUnt2]').val(),
					'eftTotalAmt2'		:	$('input[name=eftOffline\\.eftTotalAmt2]').val(),
					
					'briVisaUnt'		:	$('input[name=eftOffline\\.briVisaUnt]').val(),
					'briVisaAmt'		:	$('input[name=eftOffline\\.briVisaAmt]').val(),
					'briMstrUnt'		:	$('input[name=eftOffline\\.briMstrUnt]').val(),
					'briMstrAmt'		:	$('input[name=eftOffline\\.briMstrAmt]').val(),
					'eftTotalUnt3'		:	$('input[name=eftOffline\\.eftTotalUnt3]').val(),
					'eftTotalAmt3'		:	$('input[name=eftOffline\\.eftTotalAmt3]').val(),
					
					'amexUnt'			:	$('input[name=eftOffline\\.amexUnt]').val(),
					'amexAmt'			:	$('input[name=eftOffline\\.amexAmt]').val(),
					'eftTotalUnt4'		:	$('input[name=eftOffline\\.eftTotalUnt4]').val(),
					'eftTotalAmt4'		:	$('input[name=eftOffline\\.eftTotalAmt4]').val()
			};
			return eftOfflineJson;
		},
		
		constructEmployee: function(){
			var empJson = {
					'id'	:	bananaReportFormDTO.bananaReportDto.cashierEmp.id
			};
			return empJson;
		}
		
		
};

$(function() {
	/**
	 * Tabs loaded in Banana Report form dialog box
	 */
    $( "#bananaFormTabs" ).tabs();
    
    /**
     *  Calls JS function for banana report computation
     */
    $('.numberInputText').change(function(){
    	Banana.service.computeBananaReport();
    });
    
    
    //Set 0 as default values
    $('input[name^=eftOnline\\.]').attr('value', '0');
    $('input[name^=eftOffline\\.]').attr('value', '0');
    $('input[name^=eb][name$=Unt]').attr('value', '0');
    $('input[name^=eb][name$=Amt]').attr('value', '0');
    $('input[name^=edcBcaTotal]').attr('value', '0');
    $('input[name^=giftCard][name$=Unt]').attr('value', '0');
    $('input[name^=giftCard][name$=Amt]').attr('value', '0');
    $('input[name^=supplierVoucher]').attr('value', '0');
	$('input[name^=otherVoucher]').attr('value', '0');
	$('input[name^=dinners]').attr('value', '0');
	$('input[name^=installment]').attr('value', '0');
	$('input[name^=otherPaymentTotal]').attr('value', '0');
	//$('input[name=total1Amt]').attr('value', '0');
	
	$('input[name^=note][name$=Unt]').attr('value', '0');
	$('input[name^=coin][name$=Unt]').attr('value', '0');
	//$('input[name=total2Amt]').attr('value', '0');
	
	$('input[name=cashCvsAmt]').attr('value', '0');
	$('input[name=cashEcommerceAmt]').attr('value', '0');
	$('input[name=cashHomeDeliveryAmt]').attr('value', '0');
	$('input[name=total3Amt]').attr('value', '0');
	
	$('input[name^=cashPickup][name$=Amt]').attr('value', '0');
	//$('input[name=total4Amt]').attr('value', '0');
	$('input[name=totalOthersAmt]').attr('value', '0');
	
	$('input[name=grandTotalAmt]').attr('value', '0');
	$('input[name=grandTotalAftrAdjAmt]').attr('value', '0');
	$('input[name=differenceAmt]').attr('value', '0');
	$('input[name=salesCitiLinkAmt]').attr('value', '0');
});





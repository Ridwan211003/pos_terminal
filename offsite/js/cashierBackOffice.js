function bananaReportOnload(bananaReportSubmitted, bananaReportSubmitSuccess,
		bananaReportForVerification, verificationViewingError){
	computeBananaReport();
	if(bananaReportSubmitted || bananaReportSubmitSuccess){
		$("#submitBtn").hide();
	}
	
	var inputList = $(".numberInputText");
	for(var i=0;i<inputList.length;i++){
		
		$(inputList[i]).keyup(function(event) {
			computeBananaReport();
	    });
		$(inputList[i]).keydown(function(event) {
			allowOnlyNumbers(event);
	    });
		removeDecimal(inputList[i]);

		if(bananaReportSubmitted || bananaReportSubmitSuccess ||
				bananaReportForVerification){
			$(inputList[i]).prop("readonly",true);
		}
	}
	
	var computedList = $(".numberComputedText");
	for(var i=0;i<computedList.length;i++){
		removeDecimal(computedList[i]);
	}
	
	if(verificationViewingError){
		$("#bananaReportForm").hide();
	}
	
	if(bananaReportForVerification){
		var action = webContextPath+"/admin/bananaReportVerify";
		$("#bananaReportForm").attr("action",action);
		$("#submitBtn").html("Verify");
	}else{
		$("#rejectBtn").hide();
	}
	
	$("#rejectBtn").click(function(){
		var action = webContextPath+"/admin/bananaReportReject";
		$("#bananaReportForm").attr("action",action);
		$("#bananaReportForm").submit();
	});
}

function removeDecimal(element){
	var val = parseFloat($(element).val());
	if(isNaN(val))val = 0;
	val = Math.round(val);
	$(element).val(val.toFixed(0));
}

function allowOnlyNumbers(event){
	// Allow: backspace, delete, tab, escape, enter
    if ( $.inArray(event.keyCode,[46,8,9,27,13]) !== -1 ||
         // Allow: Ctrl+A
        (event.keyCode == 65 && event.ctrlKey === true) || 
         // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
             // let it happen, don't do anything
             return;
    }
    else {
        // Ensure that it is a number and stop the keypress
        if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
            event.preventDefault(); 
        }   
    }
}

function computeBananaReport(){
	//********************EFT Online Start ***********************
	//Total1
	var eftOnMegaVisaUnt = parseInt($("#bananaReportDto\\.eftOnline\\.megaVisaUnt").val());
	if(isNaN(eftOnMegaVisaUnt))eftOnMegaVisaUnt = 0;
	var eftOnMegaVisaAmt = parseFloat($("#bananaReportDto\\.eftOnline\\.megaVisaAmt").val());
	if(isNaN(eftOnMegaVisaAmt))eftOnMegaVisaAmt = 0;
	
	var eftOnMegaMstrUnt = parseInt($("#bananaReportDto\\.eftOnline\\.megaMstrUnt").val());
	if(isNaN(eftOnMegaMstrUnt))eftOnMegaMstrUnt = 0;
	var eftOnMegaMstrAmt = parseFloat($("#bananaReportDto\\.eftOnline\\.megaMstrAmt").val());
	if(isNaN(eftOnMegaMstrAmt))eftOnMegaMstrAmt = 0;
	
	var eftOnMegaVisaOthrUnt = parseInt($("#bananaReportDto\\.eftOnline\\.megaVisaOthrUnt").val());
	if(isNaN(eftOnMegaVisaOthrUnt))eftOnMegaVisaOthrUnt = 0;
	var eftOnMegaVisaOthrAmt = parseFloat($("#bananaReportDto\\.eftOnline\\.megaVisaOthrAmt").val());
	if(isNaN(eftOnMegaVisaOthrAmt))eftOnMegaVisaOthrAmt = 0;
	
	var eftOnMegaMstrOthrUnt = parseInt($("#bananaReportDto\\.eftOnline\\.megaMstrOthrUnt").val());
	if(isNaN(eftOnMegaMstrOthrUnt))eftOnMegaMstrOthrUnt = 0;
	var eftOnMegaMstrOthrAmt = parseFloat($("#bananaReportDto\\.eftOnline\\.megaMstrOthrAmt").val());
	if(isNaN(eftOnMegaMstrOthrAmt))eftOnMegaMstrOthrAmt = 0;
	
	var eftOnlineTotalUnt1 =
		eftOnMegaVisaUnt+
		eftOnMegaMstrUnt+
		eftOnMegaVisaOthrUnt+
		eftOnMegaMstrOthrUnt;
	$("#bananaReportDto\\.eftOnline\\.eftTotalUnt1").val(eftOnlineTotalUnt1);
	
	var eftOnlineTotalAmt1 =
		eftOnMegaVisaAmt+
		eftOnMegaMstrAmt+
		eftOnMegaVisaOthrAmt+
		eftOnMegaMstrOthrAmt;
		
	$("#bananaReportDto\\.eftOnline\\.eftTotalAmt1").val(eftOnlineTotalAmt1);
	
	//Total2
	var eftOnCitiVisaUnt = parseInt($("#bananaReportDto\\.eftOnline\\.citiVisaUnt").val());
	if(isNaN(eftOnCitiVisaUnt))eftOnCitiVisaUnt = 0;
	var eftOnCitiVisaAmt = parseFloat($("#bananaReportDto\\.eftOnline\\.citiVisaAmt").val());
	if(isNaN(eftOnCitiVisaAmt))eftOnCitiVisaAmt = 0;
	
	var eftOnCitiMstrUnt = parseInt($("#bananaReportDto\\.eftOnline\\.citiMstrUnt").val());
	if(isNaN(eftOnCitiMstrUnt))eftOnCitiMstrUnt = 0;
	var eftOnCitiMstrAmt = parseFloat($("#bananaReportDto\\.eftOnline\\.citiMstrAmt").val());
	if(isNaN(eftOnCitiMstrAmt))eftOnCitiMstrAmt = 0;
	
	var eftOnlineTotalUnt2 =
		eftOnCitiVisaUnt+
		eftOnCitiMstrUnt;
	$("#bananaReportDto\\.eftOnline\\.eftTotalUnt2").val(eftOnlineTotalUnt2);
	
	var eftOnlineTotalAmt2 =
		eftOnCitiVisaAmt+
		eftOnCitiMstrAmt;
	$("#bananaReportDto\\.eftOnline\\.eftTotalAmt2").val(eftOnlineTotalAmt2);
	
	//Total3
	var eftOnBriVisaUnt = parseInt($("#bananaReportDto\\.eftOnline\\.briVisaUnt").val());
	if(isNaN(eftOnBriVisaUnt))eftOnBriVisaUnt = 0;
	var eftOnBriVisaAmt = parseFloat($("#bananaReportDto\\.eftOnline\\.briVisaAmt").val());
	if(isNaN(eftOnBriVisaAmt))eftOnBriVisaAmt = 0;
	
	var eftOnBriMstrUnt = parseInt($("#bananaReportDto\\.eftOnline\\.briMstrUnt").val());
	if(isNaN(eftOnBriMstrUnt))eftOnBriMstrUnt = 0;
	var eftOnBriMstrAmt = parseFloat($("#bananaReportDto\\.eftOnline\\.briMstrAmt").val());
	if(isNaN(eftOnBriMstrAmt))eftOnBriMstrAmt = 0;
	
	var eftOnlineTotalUnt3 =
		eftOnBriVisaUnt+
		eftOnBriMstrUnt;
	$("#bananaReportDto\\.eftOnline\\.eftTotalUnt3").val(eftOnlineTotalUnt3);
	
	var eftOnlineTotalAmt3 =
		eftOnBriVisaAmt+
		eftOnBriMstrAmt;
	$("#bananaReportDto\\.eftOnline\\.eftTotalAmt3").val(eftOnlineTotalAmt3);
	
	//Total4
	var eftOnAmexUnt = parseInt($("#bananaReportDto\\.eftOnline\\.amexUnt").val());
	if(isNaN(eftOnAmexUnt))eftOnAmexUnt = 0;
	var eftOnAmexAmt = parseFloat($("#bananaReportDto\\.eftOnline\\.amexAmt").val());
	if(isNaN(eftOnAmexAmt))eftOnAmexAmt = 0;
	
	$("#bananaReportDto\\.eftOnline\\.eftTotalUnt4").val(eftOnAmexUnt);
	$("#bananaReportDto\\.eftOnline\\.eftTotalAmt4").val(eftOnAmexAmt);
	//********************EFT Online End ***********************
	
	//********************EFT Offline Start ***********************
	//Total5
	var eftOffMegaVisaUnt = parseInt($("#bananaReportDto\\.eftOffline\\.megaVisaUnt").val());
	if(isNaN(eftOffMegaVisaUnt))eftOffMegaVisaUnt = 0;
	var eftOffMegaVisaAmt = parseFloat($("#bananaReportDto\\.eftOffline\\.megaVisaAmt").val());
	if(isNaN(eftOffMegaVisaAmt))eftOffMegaVisaAmt = 0;
	
	var eftOffMegaMstrUnt = parseInt($("#bananaReportDto\\.eftOffline\\.megaMstrUnt").val());
	if(isNaN(eftOffMegaMstrUnt))eftOffMegaMstrUnt = 0;
	var eftOffMegaMstrAmt = parseFloat($("#bananaReportDto\\.eftOffline\\.megaMstrAmt").val());
	if(isNaN(eftOffMegaMstrAmt))eftOffMegaMstrAmt = 0;
	
	var eftOffMegaVisaOthrUnt = parseInt($("#bananaReportDto\\.eftOffline\\.megaVisaOthrUnt").val());
	if(isNaN(eftOffMegaVisaOthrUnt))eftOffMegaVisaOthrUnt = 0;
	var eftOffMegaVisaOthrAmt = parseFloat($("#bananaReportDto\\.eftOffline\\.megaVisaOthrAmt").val());
	if(isNaN(eftOffMegaVisaOthrAmt))eftOffMegaVisaOthrAmt = 0;
	
	var eftOffMegaMstrOthrUnt = parseInt($("#bananaReportDto\\.eftOffline\\.megaMstrOthrUnt").val());
	if(isNaN(eftOffMegaMstrOthrUnt))eftOffMegaMstrOthrUnt = 0;
	var eftOffMegaMstrOthrAmt = parseFloat($("#bananaReportDto\\.eftOffline\\.megaMstrOthrAmt").val());
	if(isNaN(eftOffMegaMstrOthrAmt))eftOffMegaMstrOthrAmt = 0;
	
	var eftOfflineTotalUnt1 =
		eftOffMegaVisaUnt+
		eftOffMegaMstrUnt+
		eftOffMegaVisaOthrUnt+
		eftOffMegaMstrOthrUnt;
	$("#bananaReportDto\\.eftOffline\\.eftTotalUnt1").val(eftOfflineTotalUnt1);
	
	var eftOfflineTotalAmt1 =
		eftOffMegaVisaAmt+
		eftOffMegaMstrAmt+
		eftOffMegaVisaOthrAmt+
		eftOffMegaMstrOthrAmt;
	$("#bananaReportDto\\.eftOffline\\.eftTotalAmt1").val(eftOfflineTotalAmt1);
	
	//Total6
	var eftOffCitiVisaUnt = parseInt($("#bananaReportDto\\.eftOffline\\.citiVisaUnt").val());
	if(isNaN(eftOffCitiVisaUnt))eftOffCitiVisaUnt = 0;
	var eftOffCitiVisaAmt = parseFloat($("#bananaReportDto\\.eftOffline\\.citiVisaAmt").val());
	if(isNaN(eftOffCitiVisaAmt))eftOffCitiVisaAmt = 0;
	
	var eftOffCitiMstrUnt = parseInt($("#bananaReportDto\\.eftOffline\\.citiMstrUnt").val());
	if(isNaN(eftOffCitiMstrUnt))eftOffCitiMstrUnt = 0;
	var eftOffCitiMstrAmt = parseFloat($("#bananaReportDto\\.eftOffline\\.citiMstrAmt").val());
	if(isNaN(eftOffCitiMstrAmt))eftOffCitiMstrAmt = 0;
	
	var eftOfflineTotalUnt2 =
		eftOffCitiVisaUnt+
		eftOffCitiMstrUnt;
	$("#bananaReportDto\\.eftOffline\\.eftTotalUnt2").val(eftOfflineTotalUnt2);
	
	var eftOfflineTotalAmt2 =
		eftOffCitiVisaAmt+
		eftOffCitiMstrAmt;
	$("#bananaReportDto\\.eftOffline\\.eftTotalAmt2").val(eftOfflineTotalAmt2);
	
	//Total7
	var eftOffBriVisaUnt = parseInt($("#bananaReportDto\\.eftOffline\\.briVisaUnt").val());
	if(isNaN(eftOffBriVisaUnt))eftOffBriVisaUnt = 0;
	var eftOffBriVisaAmt = parseInt($("#bananaReportDto\\.eftOffline\\.briVisaAmt").val());
	if(isNaN(eftOffBriVisaAmt))eftOffBriVisaAmt = 0;
	
	var eftOffBriMstrUnt = parseInt($("#bananaReportDto\\.eftOffline\\.briMstrUnt").val());
	if(isNaN(eftOffBriMstrUnt))eftOffBriMstrUnt = 0;
	var eftOffBriMstrAmt = parseFloat($("#bananaReportDto\\.eftOffline\\.briMstrAmt").val());
	if(isNaN(eftOffBriMstrAmt))eftOffBriMstrAmt = 0;
	
	var eftOfflineTotalUnt3 =
		eftOffBriVisaUnt+
		eftOffBriMstrUnt;
	$("#bananaReportDto\\.eftOffline\\.eftTotalUnt3").val(eftOfflineTotalUnt3);
	
	var eftOfflineTotalAmt3 =
		eftOffBriVisaAmt+
		eftOffBriMstrAmt;
	$("#bananaReportDto\\.eftOffline\\.eftTotalAmt3").val(eftOfflineTotalAmt3);
	
	//Total8
	var eftOffAmexUnt = parseInt($("#bananaReportDto\\.eftOffline\\.amexUnt").val());
	if(isNaN(eftOffAmexUnt))eftOffAmexUnt = 0;
	var eftOffAmexAmt = parseFloat($("#bananaReportDto\\.eftOffline\\.amexAmt").val());
	if(isNaN(eftOffAmexAmt))eftOffAmexAmt = 0;
	
	$("#bananaReportDto\\.eftOffline\\.eftTotalUnt4").val(eftOffAmexUnt);
	$("#bananaReportDto\\.eftOffline\\.eftTotalAmt4").val(eftOffAmexAmt);
	//********************EFT Offline End ***********************
	
	//********************EDC BCA Start ***********************
	//Total9
	var ebDebitBcaUnt = parseInt($("#bananaReportDto\\.ebDebitBcaUnt").val());
	if(isNaN(ebDebitBcaUnt))ebDebitBcaUnt = 0;
	var ebDebitBcaAmt = parseFloat($("#bananaReportDto\\.ebDebitBcaAmt").val());
	if(isNaN(ebDebitBcaAmt))ebDebitBcaAmt = 0;
	
	var ebEdcPaymentUnt = parseInt($("#bananaReportDto\\.ebEdcPaymentUnt").val());
	if(isNaN(ebEdcPaymentUnt))ebEdcPaymentUnt = 0;
	var ebEdcPaymentAmt = parseFloat($("#bananaReportDto\\.ebEdcPaymentAmt").val());
	if(isNaN(ebEdcPaymentAmt))ebEdcPaymentAmt = 0;
	
	var ebBcaCardUnt = parseInt($("#bananaReportDto\\.ebBcaCardUnt").val());
	if(isNaN(ebBcaCardUnt))ebBcaCardUnt = 0;
	var ebBcaCardAmt = parseFloat($("#bananaReportDto\\.ebBcaCardAmt").val());
	if(isNaN(ebBcaCardAmt))ebBcaCardAmt = 0;
	
	var ebFlazzBcaUnt = parseInt($("#bananaReportDto\\.ebFlazzBcaUnt").val());
	if(isNaN(ebFlazzBcaUnt))ebFlazzBcaUnt = 0;
	var ebFlazzBcaAmt = parseFloat($("#bananaReportDto\\.ebFlazzBcaAmt").val());
	if(isNaN(ebFlazzBcaAmt))ebFlazzBcaAmt = 0;
	
	var ebBcaOtherUnt = parseInt($("#bananaReportDto\\.ebBcaOtherUnt").val());
	if(isNaN(ebBcaOtherUnt))ebBcaOtherUnt = 0;
	var ebBcaOtherAmt = parseFloat($("#bananaReportDto\\.ebBcaOtherAmt").val());
	if(isNaN(ebBcaOtherAmt))ebBcaOtherAmt = 0;
	
	var edcBcaTotalUnt =
		ebDebitBcaUnt+
		ebEdcPaymentUnt+
		ebBcaCardUnt+
		ebFlazzBcaUnt+
		ebBcaOtherUnt;
	$("#bananaReportDto\\.edcBcaTotalUnt").val(edcBcaTotalUnt);
	
	var edcBcaTotalAmt =
		ebDebitBcaAmt+
		ebEdcPaymentAmt+
		ebBcaCardAmt+
		ebFlazzBcaAmt+
		ebBcaOtherAmt;
	$("#bananaReportDto\\.edcBcaTotalAmt").val(edcBcaTotalAmt);
	//********************EDC BCA End ***********************
	
	//********************Others Start ***********************
	//Total10
	var giftCardVoucher1Unt = parseInt($("#bananaReportDto\\.giftCardVoucher1Unt").val());
	if(isNaN(giftCardVoucher1Unt))giftCardVoucher1Unt = 0;
	var giftCardVoucher1Amt = parseFloat($("#bananaReportDto\\.giftCardVoucher1Amt").val());
	if(isNaN(giftCardVoucher1Amt))giftCardVoucher1Amt = 0;
	
	var giftCardVoucher2Unt = parseInt($("#bananaReportDto\\.giftCardVoucher2Unt").val());
	if(isNaN(giftCardVoucher2Unt))giftCardVoucher2Unt = 0;
	var giftCardVoucher2Amt = parseFloat($("#bananaReportDto\\.giftCardVoucher2Amt").val());
	if(isNaN(giftCardVoucher2Amt))giftCardVoucher2Amt = 0;
	
	var supplierVoucherUnt = parseInt($("#bananaReportDto\\.supplierVoucherUnt").val());
	if(isNaN(supplierVoucherUnt))supplierVoucherUnt = 0;
	var supplierVoucherAmt = parseFloat($("#bananaReportDto\\.supplierVoucherAmt").val());
	if(isNaN(supplierVoucherAmt))supplierVoucherAmt = 0;
	
	var otherVoucherUnt = parseInt($("#bananaReportDto\\.otherVoucherUnt").val());
	if(isNaN(otherVoucherUnt))otherVoucherUnt = 0;
	var otherVoucherAmt = parseFloat($("#bananaReportDto\\.otherVoucherAmt").val());
	if(isNaN(otherVoucherAmt))otherVoucherAmt = 0;
	
	var dinnersUnt = parseInt($("#bananaReportDto\\.dinnersUnt").val());
	if(isNaN(dinnersUnt))dinnersUnt = 0;
	var dinnersAmt = parseFloat($("#bananaReportDto\\.dinnersAmt").val());
	if(isNaN(dinnersAmt))dinnersAmt = 0;
	
	var installmentUnt = parseInt($("#bananaReportDto\\.installmentUnt").val());
	if(isNaN(installmentUnt))installmentUnt = 0;
	var installmentAmt = parseFloat($("#bananaReportDto\\.installmentAmt").val());
	if(isNaN(installmentAmt))installmentAmt = 0;
	
	var otherPaymentTotalUnt =
		giftCardVoucher1Unt+
		giftCardVoucher2Unt+
		supplierVoucherUnt+
		otherVoucherUnt+
		dinnersUnt+
		installmentUnt;
	$("#bananaReportDto\\.otherPaymentTotalUnt").val(otherPaymentTotalUnt);
	
	var otherPaymentTotalAmt =
		giftCardVoucher1Amt+
		giftCardVoucher2Amt+
		supplierVoucherAmt+
		otherVoucherAmt+
		dinnersAmt+
		installmentAmt;
	$("#bananaReportDto\\.otherPaymentTotalAmt").val(otherPaymentTotalAmt);
	//********************Others End ***********************
	
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
	$("#bananaReportDto\\.total1Amt").val(total1);
	
	//********************Cash Notes Start ***********************
	var note100kUnt = parseInt($("#bananaReportDto\\.note100kUnt").val());
	if(isNaN(note100kUnt))note100kUnt = 0;
	$("#note100kAmt").val(note100kUnt * 100000);
	var note100kAmt = parseInt($("#note100kAmt").val());
	if(isNaN(note100kAmt))note100kAmt = 0;
	
	var note50kUnt = parseInt($("#bananaReportDto\\.note50kUnt").val());
	if(isNaN(note50kUnt))note50kUnt = 0;
	$("#note50kAmt").val(note50kUnt * 50000);
	var note50kAmt = parseInt($("#note50kAmt").val());
	if(isNaN(note50kAmt))note50kAmt = 0;
	
	var note20kUnt = parseInt($("#bananaReportDto\\.note20kUnt").val());
	if(isNaN(note20kUnt))note20kUnt = 0;
	$("#note20kAmt").val(note20kUnt * 20000);
	var note20kAmt = parseInt($("#note20kAmt").val());
	if(isNaN(note20kAmt))note20kAmt = 0;
	
	var note10kUnt = parseInt($("#bananaReportDto\\.note10kUnt").val());
	if(isNaN(note10kUnt))note10kUnt = 0;
	$("#note10kAmt").val(note10kUnt * 10000);
	var note10kAmt = parseInt($("#note10kAmt").val());
	if(isNaN(note10kAmt))note10kAmt = 0;
	
	var note5kUnt = parseInt($("#bananaReportDto\\.note5kUnt").val());
	if(isNaN(note5kUnt))note5kUnt = 0;
	$("#note5kAmt").val(note5kUnt * 5000);
	var note5kAmt = parseInt($("#note5kAmt").val());
	if(isNaN(note5kAmt))note5kAmt = 0;
	
	var note2kUnt = parseInt($("#bananaReportDto\\.note2kUnt").val());
	if(isNaN(note2kUnt))note2kUnt = 0;
	$("#note2kAmt").val(note2kUnt * 2000);
	var note2kAmt = parseInt($("#note2kAmt").val());
	if(isNaN(note2kAmt))note2kAmt = 0;
	
	var note1kUnt = parseInt($("#bananaReportDto\\.note1kUnt").val());
	if(isNaN(note1kUnt))note1kUnt = 0;
	$("#note1kAmt").val(note1kUnt * 1000);
	var note1kAmt = parseInt($("#note1kAmt").val());
	if(isNaN(note1kAmt))note1kAmt = 0;
	//********************Cash Notes End ***********************
	
	//********************Cash Coins Start ***********************
	var coin1000Unt = parseInt($("#bananaReportDto\\.coin1000Unt").val());
	if(isNaN(coin1000Unt))coin1000Unt = 0;
	$("#coin1000Amt").val(coin1000Unt * 1000);
	var coin1000Amt = parseInt($("#coin1000Amt").val());
	if(isNaN(coin1000Amt))coin1000Amt = 0;
	
	var coin500Unt = parseInt($("#bananaReportDto\\.coin500Unt").val());
	if(isNaN(coin500Unt))coin500Unt = 0;
	$("#coin500Amt").val(coin500Unt * 500);
	var coin500Amt = parseInt($("#coin500Amt").val());
	if(isNaN(coin500Amt))coin500Amt = 0;
	
	var coin200Unt = parseInt($("#bananaReportDto\\.coin200Unt").val());
	if(isNaN(coin200Unt))coin200Unt = 0;
	$("#coin200Amt").val(coin200Unt * 200);
	var coin200Amt = parseInt($("#coin200Amt").val());
	if(isNaN(coin200Amt))coin200Amt = 0;
	
	var coin100Unt = parseInt($("#bananaReportDto\\.coin100Unt").val());
	if(isNaN(coin100Unt))coin100Unt = 0;
	$("#coin100Amt").val(coin100Unt * 100);
	var coin100Amt = parseInt($("#coin100Amt").val());
	if(isNaN(coin100Amt))coin100Amt = 0;
	
	var coin50Unt = parseInt($("#bananaReportDto\\.coin50Unt").val());
	if(isNaN(coin50Unt))coin50Unt = 0;
	$("#coin50Amt").val(coin50Unt * 50);
	var coin50Amt = parseInt($("#coin50Amt").val());
	if(isNaN(coin50Amt))coin50Amt = 0;
	//********************Cash Coins End ***********************
	
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
	$("#bananaReportDto\\.total2Amt").val(total2);
	
	//********************Cash Others Start ***********************
	var cashCvsAmt = parseFloat($("#bananaReportDto\\.cashCvsAmt").val());
	if(isNaN(cashCvsAmt))cashCvsAmt = 0;
	var cashEcommerceAmt = parseFloat($("#bananaReportDto\\.cashEcommerceAmt").val());
	if(isNaN(cashEcommerceAmt))cashEcommerceAmt = 0;
	var cashHomeDeliveryAmt = parseFloat($("#bananaReportDto\\.cashHomeDeliveryAmt").val());
	if(isNaN(cashHomeDeliveryAmt))cashHomeDeliveryAmt = 0;
	//********************Cash Others End ***********************
	
	var total3 =
		cashCvsAmt+
		cashEcommerceAmt+
		cashHomeDeliveryAmt;
	$("#bananaReportDto\\.total3Amt").val(total3);
	
	//********************Cash Pickup Start ***********************
	var cashPickup1Amt = parseInt($("#bananaReportDto\\.cashPickup1Amt").val());
	if(isNaN(cashPickup1Amt))cashPickup1Amt = 0;
	var cashPickup2Amt = parseInt($("#bananaReportDto\\.cashPickup2Amt").val());
	if(isNaN(cashPickup2Amt))cashPickup2Amt = 0;
	var cashPickup3Amt = parseInt($("#bananaReportDto\\.cashPickup3Amt").val());
	if(isNaN(cashPickup3Amt))cashPickup3Amt = 0;
	var cashPickup4Amt = parseInt($("#bananaReportDto\\.cashPickup4Amt").val());
	if(isNaN(cashPickup4Amt))cashPickup4Amt = 0;
	var cashPickup5Amt = parseInt($("#bananaReportDto\\.cashPickup5Amt").val());
	if(isNaN(cashPickup5Amt))cashPickup5Amt = 0;
	//********************Cash Pickup End ***********************
	
	var total4 =
		cashPickup1Amt+
		cashPickup2Amt+
		cashPickup3Amt+
		cashPickup4Amt+
		cashPickup5Amt;
	$("#bananaReportDto\\.total4Amt").val(total4);
	
	//********************Other Total Start ***********************
	var total5 = parseInt($("#bananaReportDto\\.totalOthersAmt").val());
	if(isNaN(total5))total5 = 0;
	//********************Other Total End ***********************
	var roundingAmount = parseInt($("#bananaReportDto\\.roundingAdjstmntAmt").val());
	if(isNaN(roundingAmount))roundingAmount = 0;
	
	var grandTotal =
		total1+
		total2+
		total3+
		total4+
		total5;
	$("#bananaReportDto\\.grandTotalAmt").val(grandTotal);
	
	var grandTotalAftrAdjAmt = grandTotal - roundingAmount;
	$("#bananaReportDto\\.grandTotalAftrAdjAmt").val(grandTotalAftrAdjAmt);
	
	var difference = grandTotal - grandTotalAftrAdjAmt;
	$("#bananaReportDto\\.differenceAmt").val(difference);
}
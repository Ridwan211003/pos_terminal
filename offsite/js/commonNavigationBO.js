/**
 * This is used for the navigation list box
 */

var NAVIGATION = {
	"NAV_MARKETING":{
		"Manage Ads and Reminders":["/marketing/viewCustomerAds","Manage Ads and Reminders"],
		"Manage Marketing Configurations":["/marketing/viewMarketingConfigs","Manage Marketing Configurations"]
	},
	"NAV_REPORTS":{
		"select report":["","Select report..."],
		"exportItemCodeNotInFileReport":["/admin/report/viewReport?reportName=ITEM_CODE_NOT_IN_FILE","Item code not in file"],
		"exportSupervisorInterventionReport":["/admin/report/viewReport?reportName=SUPERVISOR_INTERVENTION","Supervisor intervention"],
		"exportForcedSignOffReport":["/admin/report/viewReport?reportName=FORCED_SIGNOFF","Forced Signoff Report"],
		"exportReturnPerItemReport":["/admin/report/viewReport?reportName=RETURN_PER_ITEM","Return Per Item Report"],
		"exportRefundPerItemReport":["/admin/report/viewReport?reportName=REFUND_PER_ITEM","Refund Per Item Report"],
		"exportTopUpReport":["/admin/report/viewReport?reportName=TOP_UP","Top-Up Report"],
//		"exportReturnRefundReport":["/admin/report/viewReport?reportName=RETURN_REFUND","Return Refund Report"],
		"exportPasswordChangeAndResetReport":["/admin/report/viewReport?reportName=PASSWORD_CHANGE_AND_RESET","Password changed and reset"],
		"exportFreeParkingReport":["/admin/report/viewReport?reportName=FREE_PARKING","Free parking"],
		"exportOfflineModeReport":["/admin/report/viewReport?reportName=OFFLINE_MODE","Offline mode"],
		"exportDonationReport":["/admin/report/viewReport?reportName=DONATION","Donation"],
		"exportRoundingReport":["/admin/report/viewReport?reportName=ROUNDING","Rounding"],
		"exportXReport":["/admin/report/viewReport?reportName=XREPORT","X-Report"],
		"exportZReport":["/admin/report/viewReport?reportName=ZREPORT","Z-Report"],
		"exportMediaSummaryReport":["/admin/report/viewReport?reportName=MEDIASUMMARY","Media Summary"],
		"exportTerminalSalesReport":["/admin/report/viewReport?reportName=TERMINALSALES","Terminal Sales"],
		"exportProductivityReport":["/admin/report/viewReport?reportName=PRODUCTIVITY","Productivity Per Period"],
		"exportInstallmentReport":["/admin/report/viewReport?reportName=INSTALLMENT", "Installment"],
		"exportTurnoverReport":["/admin/report/viewReport?reportName=TURNOVER", "Turnover per Department/Division"],
//		"exportGCItemSalesReport":["/admin/report/viewReport?reportName=GC_ITEM_SALES", "GC Items Sale"],
		"exportCustomerReport":["/hcadmin/report/viewReport?reportName=CUSTOMER", "Customer"],
		"exportTaxInvoiceTransactionReport":["/hcadmin/report/viewReport?reportName=TAX_INVOICE_TRANSACTION", "Tax Invoice Transaction"],
		"exportTaxInvoiceDeclarationReport":["/hcadmin/report/viewReport?reportName=TAX_INVOICE_DECLARATION", "Tax Invoice Declaration"],
		"exportSpecialDiscountReport":["/hcadmin/report/viewReport?reportName=SPECIAL_DISCOUNT", "Special Discount"],
		"exportMonthlySalesReport":["/hcadmin/report/viewReport?reportName=MONTHLY_SALES", "Monthly Sales"],
		"exportTVSTransactionReport":["/admin/report/viewReport?reportName=TVS_TRANSACTION", "TVS Transaction"],
		"exportCashierConsolidationReport":["/admin/report/viewReport?reportName=CASHIER_CONSOLIDATION", "Cashier Consolidation"],
		"exportBananaReport":["/admin/report/viewReport?reportName=BANANA_REPORT","Banana Report Summary"],
		"exportGcPaymentAnalysisReport": ["/admin/report/viewReport?reportName=GC_PAYMENT_ANALYSIS_REPORT", "GC Payment Analysis Report (Ogloba)"],
		"exportItemSalesActivationReport": ["/admin/report/viewReport?reportName=ITEM_SALES_ACTIVATION_REPORT", " GC Item Sales Report (OGloba)"],
        "exportGcPaymentAnalysisReportMMS":["/admin/report/viewReport?reportName=GC_PAYMENT_REPORT_MMS", "GC Payment Analysis Report (MMS)"],
        "exportGCActivationReportMMS":["/admin/report/viewReport?reportName=GC_ACTIVATION_REPORT_MMS","GC Item Sales Report (MMS)"],
        "exportProductivitySalesReport":["/admin/report/viewReport?reportName=PRODUCTIVITY_SALES_REPORT", "Productivity Sales Report"],
        "exportCustomerFeedBackReport":["/admin/report/viewReport?reportName=CUSTOMER_FEEDBACK", "Customer Feedback Report"],
		"exportConsolidatedSalesSummaryReport": ["/admin/report/viewReport?reportName=CONSOLIDATED_SALES_SUMMARY", "Consolidated Sales Summary"],
        "exportReturnDiscrepancyReport": ["/admin/report/viewReport?reportName=RETURN_DISCREPANCY", "Return Discrepancy"],
        "exportBillPaymentReport": ["/admin/report/viewReport?reportName=BILL_PAYMENT", "Bill Payment"],
        "exportCreditCardPaymentAnalysisReport": ["/admin/report/viewReport?reportName=CC_PAYMENT_ANALYSIS", "Credit Card Payment Analysis"]
	},
	"NAV_COM_REPORTS":{
		"select report":["","Select report..."],
		"exportReturnPerItemReport":["/admin/report/viewReport?reportName=RETURN_PER_ITEM","Return Per Item Report"],
		"exportRefundPerItemReport":["/admin/report/viewReport?reportName=REFUND_PER_ITEM","Refund Per Item Report"],
		"exportTurnoverReport":["/admin/report/viewReport?reportName=TURNOVER", "Turnover per Department/Division"]
	},
	"NAV_EMPLOYEE":{
		"Employee List":["/employee/employeeList","Employee List"],
		"Create New Employee":["/employee/createEmployee?managementType=user","Create New Employee"]
	},
	"NAV_SHIFT_MANAGEMENT":{
		"General Parameter":["/headcashier/viewWorkloadList","General Parameter"],
		"Cashier Parameters":["/headcashier/viewCashierList","Cashier Parameters"],
		"Weekly Schedule and Day off Profiles":["/headcashier/viewScheduleProfileList","Weekly Schedule and Day off Profiles"],
		"Budget Parameters":["/headcashier/viewBudgetList","Budget Parameters"]
	},
	"NAV_PRICE_BROADCAST":{
		"Price Broadcast":["/admin/pricebroadcast","Price Broadcast"],
		"Price Broadcast Config":["/admin/viewPriceBroadcastConfigs","Price Broadcast Config"]
	},
	"NAV_USER_PROFILE":{
		"User Profile List":["/admin/userProfileList","User Profile List"],
		"Add User Profile":["/admin/userProfileAdd","Add User Profile"]
	},
	"NAV_BANANA_REPORT":{
		"Banana Report List":["/admin/bananaReportList","Banana Report List"],
		"Add Payment Media Correction":["/admin/addPaymentMediaCorrection","Add Payment Media Correction"],
		"Cashier Consolidation Report":["/admin/cashierConsolidationReport","Cashier Consolidation Report"],
		"Banana Report Summary":["/admin/bananaReportSummary","Banana Report Summary"]
	}
};

function populateNavigationSelect(navigationKey,currentPage,append){
	var navigationSelectDiv = $("#navigationSelect");
	if(!append){
		$(navigationSelectDiv).empty();
	}
	var navItem = NAVIGATION[navigationKey];
	var counter = 0;
	if(navigationKey && navItem){
		for(var i in navItem){
			if(i!=currentPage){
				var anchor = $("<a>");
				$(anchor).attr({
					"href":webContextPath+navItem[i][0]
				});
				$(anchor).text(navItem[i][1]);
				if(counter != 0 || append)
					$(navigationSelectDiv).append(" | ");
				
				$(navigationSelectDiv).append(anchor);
				counter++;
			}
		}
	}
}

function populateNavigationSelectOptions(navigationKey, currentPage, append) {
	var navigationSelectBox = $("#navigationSelect");

	if (!append) {
		navigationSelectBox.empty();
	}

	var navItem = NAVIGATION[navigationKey];
	if (navigationKey && navItem) {
		for(var i in navItem){
			if(i!=currentPage){
				$(navigationSelectBox).append($("<option>").attr("value",navItem[i][0]).text(navItem[i][1]));
			}
		}
	}

	$(navigationSelectBox).change(function() {
		var href = $(this).val();
		if(href){
			window.location.href = webContextPath + href;
		}
	});
}


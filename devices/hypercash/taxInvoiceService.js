/*
 * Author: Jennifer Ebora
 * 
 * This represents the service for generating the Tax Invoice PDF. This service
 * makes use of fluentReports node module that is designed for PDF reporting.
 * FluentReports has dependency to pdfkit -- another node module.
 * 
 * @public
 * printTaxInvoice - method that will call other methods that will generate
 *					 the Tax Invoice PDF.
 *
 * @private
 * @return Report - constructed report.
 * constructTaxInvoice - method that constructs the different parts of the
 *						 PDF (e.g. Header, Body, Footer, Final Summary, etc.)
 *
 * @private
 * renderTaxInvoice - method that does the actual generation of the constructed PDF.
 *
 * NOTE:
 * default margin - 50
 * total width - 540
 *
 * KNOWN ISSUES:
 * 1. Big asterisk - cannot apply multiple formats in one cell.
 * 2. Extra page - when the data fit exactly in one page, an extra page is being generated.
 * 3. Page footer is not exactly placed in actual printed PDF.
 */

var Report = require('fluentreports').Report;

var totalNumberOfPages = -1;
var isDraft = true;
var configuration;
var proceedToPrint = false;

exports.printTaxInvoice = function(taxInvoice, callback) {
	console.log("taxInvoice.js printTaxInvoice ===");

	if (!configuration) {
		configuration = global.configuration_poss;
	}

	var rpt = constructTaxInvoice(taxInvoice);
	renderTaxInvoice(rpt, taxInvoice, callback);
}

function constructTaxInvoice(options) {
	"use strict";
	options = options || {};

	var hitFooter = true; //flag to know if fnConstructPageFooter had run once
	var stopRendering = false;
	var finalSummaryHits = 0;

	/*
	 * transactionId, invoiceNumber
	 * configuration.properties['HC_NAME'], formatInvoiceDate(taxInvoice.dateIssued)
	 * configuration.properties['HC_ADDRESS'], taxInvoice.cashierId
	 * configuration.properties['HC_TELEPHONE_HOTLINE_NO'], Bekasi Juanda
	 * configuration.properties['HC_TAX_ID'], Page x/y
	 * taxInvoice.taxName, taxInvoice.customerNumber
	 * taxInvoice.taxAddress, formatInvoiceDate(taxInvoice.dateIssued)
	 * taxInvoice.taxId, formatInvoiceTime(taxInvoice.dateIssued)
	 */
	var fnConstructPageHeader = function(report, data) {
		if (finalSummaryHits == 2) {
			stopRendering = true;
			return;
		}

		//temporary solution, counter of page number
		//console.log("isDraft: ", isDraft);
		if (isDraft) {
			totalNumberOfPages++;
			//console.log("totalNumberOfPages: ", totalNumberOfPages);
		}

		report.fontSize(9);
		//report.setCurrentY(70);

		if (options.reprint) {
			report.print("RE-PRINT", {x: 500});
		} else {
			report.newLine();
		}

		//report.newLine();
		
		report.band([
			{data: "", width: 70}, //Nomor Transaksi
			{data: options.transactionId, width: 165, align: 2},
			{data: "", width: 90}, //Nomor Seri Faktur Pajak
			{data: options.invoiceNumber, width: 215, align: 2}
		], {border: 0, wrap: 1});

		report.newLine(); //Pengusaha Kena Pajak

		report.band([
			{data: "", width: 45}, //Nama
			{data: configuration.properties['HC_NAME'], width: 325},
			{data: "", width: 70}, //Tanggal
			{data: options.formattedDateIssued, width: 100}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 45}, //Alamat
			{data: configuration.properties['HC_ADDRESS'], width: 325},
			{data: "", width: 70}, //Kasir ID
			{data: options.cashierId, width: 100, align: 1}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 45}, //Telepon
			{data: configuration.properties['HC_TELEPHONE_HOTLINE_NO'], width: 325, align: 1},
			{data: "", width: 70}, //Nama toko
			{data: configuration.properties['HC_STORE_NAME'], width: 100}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 45}, //NPWP
			{data: configuration.properties['HC_TAX_ID'], width: 325, align: 1},
			{data: "", width: 70}, //Halaman
			{data: report.currentPage() + "/" + totalNumberOfPages, width: 100}
		], {border: 0, wrap: 1});

		report.newLine(2); //Pembeli Barang Kena Pajak / Penerima Jasa Kena Pajak

		report.band([
			{data: "", width: 45}, //Nama
			{data: options.taxName, width: 325},
			{data: "", width: 70}, //Nomor Anggota
			{data: options.customerNumber, width: 100, align: 1}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 45}, //Alamat
			{data: options.taxAddress, width: 325},
			{data: "", width: 70}, //Tgl. Pembelian
			{data: options.formattedDateIssued, width: 100}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 45}, //NPWP
			{data: options.taxId, width: 325, align: 1},
			{data: "", width: 70}, //Jam
			{data: options.formattedTimeIssued, width: 100}
		], {border: 0, wrap: 1});

		report.newLine(2);
	};

	/*
	 * HACK!
	 * Lots of manipulation to affix proper page footer
	 * TODO: Improve once fluentReports has fixed the problem
	 */
	var fnConstructPageFooter = function(report, data) {
		if (stopRendering) {
			return;
		}

		console.log("******maxY: ", report.maxY());
		console.log("******currentY: ", report.getCurrentY());

		//report.setMargins({left: 50, bottom: 5, right: 0, top: 0});

		if (hitFooter) {
			hitFooter = false;
		} else {
			if ((report.getCurrentY() + 32.946) <= report.maxY()) { //report.getCurrentY()
				console.log("****in if");
				report.setCurrentY(670); //710
			} else {
				report.newLine();
			}
		}

		//report.newLine();
		report.print(configuration.properties['HC_CITY_LOCATION'] + ", " + options.formattedDateIssued, {x: 420, border: true});
		report.newLine();
		report.print(options.signatoryFullName, {x: 420, border: true});
	};

	var fnConstructFinalSummary = function(report, data) {
		finalSummaryHits++;

		report.fontSize(9.5);
		report.newLine(2);

		report.band([
			{data: "", width: 30},
			{data: options.markupLabel, width: 295}, //Total Non Member / Employee Mark Up
			{data: "", width: 45},
			{data: "", width: 70},
			{data: options.totalNonMemberMarkupTaxable, width: 100, align: 3}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 30},
			{data: "Harga Jual", width: 295},
			{data: report.totals.quantity, width: 45, align: 2},
			{data: "", width: 70},
			{data: options.totalSellingPriceBeforeTax, width: 100, align: 3}
		], {border: 0, wrap: 1});	

		report.band([
			{data: "", width: 30},
			{data: "PPN", width: 295},
			{data: "", width: 45},
			{data: "", width: 70},
			{data: options.totalTax, width: 100, align: 3}
		], {border: 0, wrap: 1});	
		
		//If MDR Surcharge > 0, display MDR field on printed tax invoice
		/*if(options.totalMdrSurcharge > 0){
			report.band([
				 			{data: "", width: 30},
				 			{data: "MDR Surcharge", width: 295},
				 			{data: "", width: 45},
				 			{data: "", width: 70},
				 			{data: options.totalMdrSurcharge, width: 100, align: 3}
				 		], {border: 0, wrap: 1});
		}*/
		
		report.band([
			{data: "", width: 30},
			{data: "Total Yang Harus Dibayar", width: 295},
			{data: "", width: 45},
			{data: "", width: 70},
			{data: options.totalAmtTaxed, width: 100, align: 3, border: {bottom: 1}}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 30},
			{data: "Total media payment", width: 295},
			{data: "", width: 45},
			{data: "", width: 70},
			{data: options.totalAmountPaid, width: 100, align: 3}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 30},
			{data: "Kembalian", width: 295},
			{data: "", width: 45},
			{data: "", width: 70},
			{data: options.totalChange, width: 100, align: 3, border: {bottom: 1}}
		], {border: 0, wrap: 1});

		report.newLine(2);

		//second section summary
		report.band([
			{data: "", width: 30},
			{data: "", width: 115},
			{data: "HARGA", width: 50, align: 2},
			{data: "PPN", width: 55, align: 2},
			{data: "TOTAL", width: 70, align: 2}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 30},
			{data: "", width: 115},
			{data: "", width: 50, align: 2},
			{data: "", width: 55, align: 2},
			{data: "HARGA", width: 70, align: 2}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 30},
			{data: "Barang & Jasa Kena Pajak*", width: 115},
			{data: options.sumSellingPriceTaxable, width: 50, align: 3},
			{data: options.sumPPN, width: 55, align: 3},
			{data: options.sumSellingPricePlusTax, width: 70, align: 3}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 30},
			{data: "Bukan Barang Kena Pajak & Jasa Kena Pajak*", width: 115},
			{data: options.totalSellingPriceNonTaxable, width: 50, align: 3},
			{data: "0", width: 55, align: 3}, //hard-coded
			{data: options.totalSellingPriceNonTaxable, width: 70, align: 3}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 30},
			{data: "GRAND TOTAL", width: 115},
			{data: options.grandHarga, width: 50, align: 3},
			{data: options.totalTax, width: 55, align: 3},
			{data: options.grandTotalHarga, width: 70, align: 3}
		], {border: 0, wrap: 1});

		report.newLine();

		report.setCurrentY(670);

        report.print(configuration.properties['HC_CITY_LOCATION'] + ", " + options.formattedDateIssued, {x: 420, border: true});
        report.newLine();
        report.print(options.signatoryFullName, {x: 420, border: true});
	};

	var fnFormatReport = function(data, callback) {
    	callback(null, data);
  	};

  	/*
  	 * TODO: Bigger font for asterisk
  	 */
  	var fnConstructDetailBand = function(report, data) {
  		report.fontSize(11);

  		report.band([
  					{data: data.number, width: 30, align: 2, fontBold: false, fontSize: 11}, //No.
      				{data: data.ean13Code + " " + data.description + (data.isTaxInclusive ? " *" : ""), fontBold: false, width: 290, fontSize: 11}, //Nama Barang Kena Pajak / Jasa Kena Pajak
      				{data: data.quantity, width: 50, align: 2, fontBold: false, fontSize: 11}, //Jumlah
      				{data: data.price, width: 68, align: 3, fontBold: false, fontSize: 11}, //Harga Satuan (Rp.)
      				{data: data.subtotal, width: 102, align: 3, fontBold: false, fontSize: 11}], {border: 0, width: 0, wrap: 1}); //Harga Jual / Penggantian (Rp.)
	};

	var report = new Report(options.fileName, {paper: "letter"});
	report.pageHeader(fnConstructPageHeader)
		  .data(options.data)
		  .detail(fnConstructDetailBand)
		  //.pageFooter(fnConstructPageFooter)
		  .totalFormatter(fnFormatReport)
		  .margins(50);

	report.groupBy("common")
		  .sum("quantity")
		  .footer(fnConstructFinalSummary);

	//report.margins({left: 50, bottom: 10, right: 0, top: 0});

	return report;
}

//TODO: Improve callback function
function renderTaxInvoice(report, options, callback) {
	report.printStructure(); //for logging purposes only

	var pdf = report.render(function(err, name) {
      	if (err) {
        	console.error("Report had an error: ", err);
      	} else {
        	/*
        	 * HACK!
        	 * PDF is rendered twice. First is the draft to know the total number of pages rendered.
        	 * Then, the final PDF will be rendered again replacing the temporary total no. of pages in draft
        	 */
        	if (proceedToPrint) {
				callback(configuration.properties['HC_PRINTER_QUEUE_NAME'], options.fileName, configuration.properties['HC_INV_N_COPIES']);
			} else if (isDraft) {
				console.log("Generating final draft..");
	        	console.log("Filename: ", name);
	        	console.log("--total pages: ", totalNumberOfPages);

	        	isDraft = false;
	        	proceedToPrint = true;

	          	var rpt = constructTaxInvoice(options);
				renderTaxInvoice(rpt, options, callback);
			}
      	}
  	});
}

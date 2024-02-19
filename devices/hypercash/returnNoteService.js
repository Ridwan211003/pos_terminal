/*
 * Author: Jennifer Ebora
 * 
 * This represents the service for generating the Return Note PDF. This service
 * makes use of fluentReports node module that is designed for PDF reporting.
 * FluentReports has dependency to pdfkit -- another node module.
 * 
 * @public
 * printReturnNote - method that will call other methods that will generate
 *					 the Return Note PDF.
 *
 * @private
 * @return Report - constructed report.
 * constructReturnNote - method that constructs the different parts of the
 *						 PDF (e.g. Header, Body, Footer, Final Summary, etc.)
 *
 * @private
 * renderReturnNote - method that does the actual generation of the constructed PDF.
 *
 * NOTE:
 * default margin - 50
 * total width - 540
 *
 * KNOWN ISSUES:
 * 1. Big asterisk - cannot apply multiple formats in one cell.
 * 2. Extra page - when the data fit exactly in one page, an extra page is being generated.
 */

var Report = require('fluentreports').Report;

var totalNumberOfPages = -1;
var isDraft = true;
var configuration;
var proceedToPrint = false;

exports.printReturnNote = function(returnNote, callback) {
	console.log("returnNoteService.js printReturnNote ===");
	
	if (!configuration) {
		configuration = global.configuration_poss;
	}

	var rpt = constructReturnNote(returnNote);
	renderReturnNote(rpt, returnNote, callback);
}


function constructReturnNote(options) {
	"use strict";
	options = options || {};

	var hitFooter = true; //flag to know if fnConstructPageFooter had run once

	/*
	 * returnNote.returnNoteNumber
	 * returnNote.taxInvoiceNumber, formatPurchaseDate(returnNote.purchaseDate)
	 * returnNote.transactionId
	 * returnNote.customerName
	 * returnNote.taxAddress
	 * returnNote.taxId
	 * configuration.properties['HC_NAME']
	 * configuration.properties['HC_ADDRESS']
	 * configuration.properties['HC_TAX_ID']
	 */
	var fnConstructPageHeader = function(report, data) {
		//temporary solution, counter of page number
		//console.log("isDraft: ", isDraft);
		if (isDraft) {
			totalNumberOfPages++;
			//console.log("totalNumberOfPages: ", totalNumberOfPages);
		}

		report.setCurrentY(44);
		report.fontSize(9);

		report.band([
			{data: "", width: 300}, //Nomor
			{data: options.returnNoteNumber, width: 240, align: 1}
		], {border: 0, wrap: 1}); 

		report.setCurrentY(report.getCurrentY() + 5);
		//report.newLine();

		report.band([
			{data: "", width: 75}, //Atas Faktur Pajak No.
			{data: options.taxInvoiceNumber, width: 345, align: 1},
			{data: "", width: 35}, //Tanggal
			{data: options.purchaseDate, width: 85, align: 1}
		], {border: 0, wrap: 1});

		report.setCurrentY(report.getCurrentY() - 2);

		report.band([
			{data: "", width: 35}, //Nomor
			{data: options.transactionId, width: 505, align: 1}
		], {border: 0, wrap: 1});

		report.newLine();

		//Pembeli BKP | Nama, Alamat, NPWP
		report.print([options.customerName, options.taxAddress, options.taxId], {x: 150, width: 440});

		report.newLine();

		//Kepada Penjual | Nama, Alamat, Telepon, NPWP
		report.print([configuration.properties['HC_NAME'], 
					  configuration.properties['HC_ADDRESS'], 
					  configuration.properties['HC_TELEPHONE_HOTLINE_NO'], 
					  configuration.properties["HC_TAX_ID"]], {x: 150, width: 440});

		report.newLine(4);
	};

	/*
	 * configuration.properties['HC_CITY_LOCATION']
	 * formatReturnDate(returnNote.returnDate)
	 * returnNote.customerName
	 */
	var fnConstructPageFooter = function(report, data) {
		console.log("******maxY: ", report.maxY());
		console.log("******currentY: ", report.getCurrentY());

		if (hitFooter) {
			hitFooter = false;
		} else {
			if ((report.getCurrentY() + 31.212) <= report.maxY()) {
				console.log("****in if");
				report.setCurrentY(670);
			} else {
				report.newLine();
			}
		}

		//report.newLine();
		report.print(configuration.properties['HC_CITY_LOCATION'] + ", " + options.returnDate, {x: 420});
		report.newLine();
		report.print(options.customerName, {x: 420}); //TODO: Confirm if signatoryFullName / customerName
	};

	var fnConstructFinalSummary = function(report, data) {
		report.fontSize(9.5);
		report.newLine(2);

		//TODO: If only one page, final summary should be at the bottom of the page
		report.band([
			{data: "", width: 25},
			{data: "Jumlah Harga Jual BKP yang dikembalikan", width: 330},
			{data: "", width: 35, align: 2},
			{data: "", width: 75},
			{data: options.totalSellingPriceBeforeTax, width: 75, align: 3}
		], {border: 0, wrap: 1});	

		report.band([
			{data: "", width: 25},
			{data: "Potongan Harga BKP yang dikembalikan", width: 330},
			{data: "", width: 35},
			{data: "", width: 75},
			{data: "-", width: 75, align: 3} //hard-coded
		], {border: 0, wrap: 1});	

		report.band([
			{data: "", width: 25},
			{data: "Total Harga Jual BKP setelah Potongan Harga yang dikembalikan", width: 330},
			{data: "", width: 35},
			{data: "", width: 75},
			{data: options.totalSellingPriceBeforeTax, width: 75, align: 3}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 25},
			{data: "PPN yang diminta kembali", width: 330},
			{data: "", width: 35},
			{data: "", width: 75},
			{data: options.totalTax, width: 75, align: 3, border: {bottom: 1}}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 25},
			{data: "Total yang harus dikembalikan", width: 330},
			{data: "", width: 35},
			{data: "", width: 75},
			{data: options.totalAmount, width: 75, align: 3}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 25},
			{data: "PPnBM yang diminta kembali", width: 330},
			{data: "", width: 35},
			{data: "", width: 75},
			{data: "-", width: 75, align: 3} //hard-coded
		], {border: 0, wrap: 1});

		report.newLine(2);

		//second section summary
		report.band([
			{data: "", width: 25},
			{data: "", width: 120},
			{data: "HARGA", width: 60, align: 2},
			{data: "PPN", width: 70, align: 2},
			{data: "TOTAL", width: 80, align: 2}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 25},
			{data: "", width: 120},
			{data: "", width: 60, align: 2},
			{data: "", width: 70, align: 2},
			{data: "HARGA", width: 80, align: 2}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 25},
			{data: "Barang & Jasa Kena Pajak*", width: 120},
			{data: options.sumSellingPriceTaxable, width: 60, align: 3},
			{data: options.sumPPN, width: 70, align: 3},
			{data: options.sumSellingPricePlusTax, width: 80, align: 3}
		], {border: 0, wrap: 1});

		report.band([
			{data: "", width: 25},
			{data: "Bukan barang kena pajak", width: 120},
			{data: options.totalSellingPriceNonTaxable, width: 60, align: 3},
			{data: "", width: 70, align: 3},
			{data: options.totalSellingPriceNonTaxable, width: 80, align: 3}
		], {border: 0, wrap: 1});

		report.newLine();

		report.setCurrentY(670);

		report.print(configuration.properties['HC_CITY_LOCATION'] + ", " + options.returnDate, {x: 420});
		report.newLine();
		report.print(options.customerName, {x: 420}); //TODO: Confirm if signatoryFullName / customerName
	};

	var fnFormatReport = function(data, callback) {
		callback(null, data);
	};

	var fnConstructDetailBand = function(report, data) {
		report.fontSize(11);

  		report.band([
  					{data: data.number, width: 25, align: 2, fontBold: false, fontSize: 10}, //No Urut
      				{data: data.ean13Code + " " + data.description + (data.isTaxInclusive ? " *" : ""), fontBold: false, width: 330, fontSize: 10}, //Macam dan Jenis BKP
      				{data: data.quantity, width: 35, align: 2, fontBold: false, fontSize: 10}, //Jumlah
      				{data: data.price, width: 75, align: 3, fontBold: false, fontSize: 10}, //Harga Satuan menurut Fatur Pajak (Rp)
      				{data: data.subtotal, width: 75, align: 3, fontBold: false, fontSize: 10}], {border: 0, width: 0, wrap: 1}); //Harga Jual BKP (Rp)
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

	//report.margins({left: 50, bottom: 5, right: 0, top: 0});

	return report;
}

//TODO: Improve callback function
function renderReturnNote(report, options, callback) {
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

          		var rpt = constructReturnNote(options);
				renderReturnNote(rpt, options, callback);
        	}
      	}
  	});
}

Hypercash = Hypercash || {};

Hypercash.drawer = {
	/**
	 * Renders the list of tax invoice issued today in the specified container.
	 * @params container - html element where the list will be rendered.
	 * @params taxInvoiceList - list to be rendered.
	 * @return String - html representation of the result.
	 */
	renderTaxInvoiceTodayList : function(container, taxInvoiceList){
		container.html('');
		var returnHtml = '';
		$.each(taxInvoiceList, function(i, item){
			// for formatting, if even row, apply lightgray class style
			if(i%2 == 0){
				returnHtml += '<tr class="lightgray">';
			} else {
				returnHtml += '<tr>';
			}
			returnHtml += '<td style="width: 30px"><input type="radio" name="reprintSearchTransactionNumber" value="'+ item.transactionId + '" id="ti_' + item.transctionId + '" /></td>';
			returnHtml += '<td class="radio-table customerNumber">'+ item.customerNumber + '</td>';
			returnHtml += '<td class="radio-table date">'+ $.format.date(new Date(item.dateIssued+'Z'), 'yyyy-MM-dd HH:mm:ss'); +'</td>';
			returnHtml += '<td class="radio-table transactionNumber">'+ item.transactionId +'</td>';
			returnHtml += '<td class="radio-table amount">' + item.totalAmount + '</td>'; 
			returnHtml += '</tr>';
		});
		container.html(returnHtml);
		return returnHtml;
	},

	/**
	 * Renders the search result when searching for tax invoices to be reprinted.
	 * @params container - html element where the list will be rendered.
	 * @params searchResult - result to be rendered.
	 * @return String - html representation of the result.
	 */
	renderTaxInvoiceToReprintSearchResult : function(container, searchResult) {
		container.html("");
		var resultHTML = "<tr>"; // contains data to be inserted in container

		resultHTML += '<td style="width: 50px; text-align: center;"><input type="radio" name="reprintSearchTransactionNumber" value="'+ searchResult.transactionId + '" id="ti_' + searchResult.transactionId + '" style="display: inline; width: 50px;" /></td>';
		resultHTML += '<td style="width: 150px; text-align: center;">'+ searchResult.customerNumber + '</td>';
		resultHTML += '<td style="width: 180px; text-align: center;">'+ $.format.date(new Date(searchResult.dateIssued+'Z'), 'yyyy-MM-dd HH:mm:ss'); +'</td>';
		resultHTML += '<td style="width: 150px; text-align: center;">'+ searchResult.transactionId +'</td>';
		resultHTML += '<td style="width: 120px; text-align: center;">' + numberWithCommas(searchResult.totalAmount) + '</td>'; 
		
		resultHTML += "</tr>";

		container.html(resultHTML);
		return resultHTML;
	}	
};
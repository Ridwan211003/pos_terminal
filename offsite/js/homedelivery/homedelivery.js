var homedelivery = {
	
	removeAddedTransaction : function(mData, iRow){
		app.addedTransactionView.trigger('removeClick', mData);
	},
	
	getDistanceItemCodeCheckByTransactionAmount :  function(hdDistanceItemCodeProducts, transactionAmount){
		return _.reduce(hdDistanceItemCodeProducts, function(returnItem, item){
			if(transactionAmount > item.hdDistanceItemCode.minAmount ){
				return item;
			} else {
				return returnItem;
			}
		}, null);
	},
	
	getDeliveryFeeDisplay : function(itemCodeProduct, deliveryType){
		if(deliveryType == "AC_INSTALLATION") {
			itemCodeProduct.product.currentPrice = 1.0;
		}
		if(itemCodeProduct.product.currentPrice == 1.0){
			return 'FREE DELIVERY';
		} else {
			return (itemCodeProduct.product.currentPrice * itemCodeProduct.hdDistanceItemCode.qualifier).toMoney();
		}
	},
	
	getTaxAmount : function(deliveryFeeAmount){
		return deliveryFeeAmount * 0.1;
	},
	
	getTaxableAmount : function(deliveryFeeAmount){
		return deliveryFeeAmount; //Taxable amount = Delivery Fee
	},

	getTotalAmountPlusTax : function(taxableAmount){
		return taxableAmount * 1.1;
	},
	
	parseDate : function(dateFromServer){
		if(dateFromServer.indexOf('Z') !== -1){
			return new Date(Date.parse(dateFromServer));
		}
		return new Date(Date.parse(dateFromServer + 'Z'));
	}
};
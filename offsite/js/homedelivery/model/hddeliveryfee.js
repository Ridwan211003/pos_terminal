Homedelivery.HdDeliveryFee = Backbone.Model.extend({
	defaults : {
		product : {
			currentPrice : 0.0
		},
		hdDistanceItemCode : 0,
		paymentType : 'CASH',
		cardNumber : '',
		eftData : null
	},
	
	getOrderItem : function(){
		priceSubtotal = this.get('product').currentPrice == 1.0 ? 1.0 : this.get('hdDistanceItemCode').qualifier * this.get('product').currentPrice;
		return {
			productId : this.get('product').id,
			shortDesc : this.get('product').shortDesc,
			priceUnit : this.get('product').currentPrice,
			quantity : this.get('hdDistanceItemCode').qualifier,
			isTaxInclusive : this.get('product').isTaxInclusive,
			priceSubtotal : priceSubtotal,
			salesType : 'SALE',
			categoryId :  this.get('product').categoryId,
			ean13Code :  this.get('product').ean13Code,
			description :  this.get('product').description
		};
	},
	
	getPriceUnit : function(){
		return this.get('product').currentPrice;		
	},
	
	getPaymentAmount : function(){
		return this.get('hdDistanceItemCode').qualifier * this.get('product').currentPrice;
	},
	
	getPayments : function(){
		amountPaid = this.getOrderItem().priceSubtotal; 
		if(!!this.eftData){
			return {
				paymentMediaType : HDConstants.HOME_DELIVERY_PAYMENT_TYPE,
				amountPaid : amountPaid,
				eftData : this.eftData.toParams(),
				installmentPayment : null
			};
		} else {
			return {
				paymentMediaType : HDConstants.HOME_DELIVERY_PAYMENT_TYPE,
				amountPaid : amountPaid,
				eftData : null,
				installmentPayment : null
			};			
		}
	},
	
	getTaxableAmount : function(){
		orderItem = this.getOrderItem();
		return orderItem.isTaxInclusive ? orderItem.priceSubtotal : 0.0; 
	},
	
	getTariff : function(totalTaxableAmount){
		return this.getTaxableAmount() / 1.1;
	},
	
	toPosTransactionDTO : function(){
		return $.extend({}, 
			Homedelivery.PosTransactionDTO.prototype.defaults, 
			{
				orderItems : [this.getOrderItem()],
				payments : [this.getPayments()]
			},
			{
				totalQuantity : this.get('hdDistanceItemCode').qualifier,
				totalAmountPaid : this.getPayments().amountPaid,
				totalAmount : this.getPayments().amountPaid,
				totalTaxableAmount : this.getTaxableAmount(),
				tariff : this.getTariff(),
				vat : homedelivery.getTaxAmount(this.getTariff()),
				
			}
		);
	},
	
	getMaskedCardNumber : function(){
		if(!!this.cardNumber){
			return this.cardNumber.substring(0, 6) + 'xxxxxx' + this.cardNumber.substring(11, 15);
		} else {
			return '';		
		}

	}
	
});
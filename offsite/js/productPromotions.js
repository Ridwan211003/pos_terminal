var PROMOTIONS = PROMOTIONS || {};

/**
 * function that gets promo that gives the maximum discount amount
 * 
 * @param validPromos
 * @returns promo object
 */
PROMOTIONS.getMaxDiscountPromo = function(validPromos, basePrice, quantity){
	
	var highestPromo;
	var maxDiscount = 0;

	for ( var num = 0; num < validPromos.length; num++) {
		var promo = cloneObject(validPromos[num]);	
		var discount = PROMOTIONS.calculateDiscount(promo, basePrice, quantity);
		
		if(maxDiscount < discount){
			maxDiscount = discount;
			highestPromo = promo;
		}
	}

	return highestPromo;

};

/**
 * returns valid promos for a given promotion type to search
 * 
 * @param data
 * @param promoToSearch
 * @param time
 * @returns validPromos
 */
PROMOTIONS.getValidPromos = function(data, promoToSearch, time){
	
	//console.log(data);
	var clonedPromotions = cloneObject(data.promotions);
	var validPromos = [];

	if(clonedPromotions){
		for ( var num = 0; num < clonedPromotions.length; num++) {
			var promo = cloneObject(clonedPromotions[num]);
			var bValidPromoDateTime = time?isValidPromoDateTime(promo, time, data):
						isValidPromoDateTime(promo);

			if(promo.promotionType == promoToSearch.type
					&& isValidTargetGroup(promo, promoToSearch)//TODO: move this function from cashier.js
					&& isValidMemberGroup(promo, promoToSearch)//TODO: move this function from cashier.js
					&& (promo.enabled)
					&& bValidPromoDateTime){
				//add valid promo
				validPromos.push(promo);
			}
		}
	}
	
	return validPromos;
};


/**
 * This method calculates the total discount per order item (same products already grouped).
 * Calculates it based on discount type of the promotion (% Discount, Amount Off, Promo Selling Price)
 *
 * @param promo
 * @param orderItem
 * @returns {Number}
 */

PROMOTIONS.calculateDiscount = function(promo, basePrice, qty, isScannedByWeight){
	
	var discount = 0;

	var discountPerItem = 0;
	//uilog('DBUG', promo);
	//console.log(promo);
	try{
		if(promo.discountType == CONSTANTS.PROMOTION_DISCOUNT_TYPES.PERCENT_DISCOUNT && promo.percentDiscount > 0){
			//console.log('percent discount : ' + promo.percentDiscount + ' type : ' + typeof(promo.percentDiscount));
			//console.log('base price : ' + basePrice + ' type : ' + typeof(basePrice));
			discountPerItem = (promo.percentDiscount * basePrice) / 100;
			
			//console.log(discountPerItem);
			if(!isScannedByWeight){
				discountPerItem = Math.round(discountPerItem);
			}
			
		}else if(promo.discountType == CONSTANTS.PROMOTION_DISCOUNT_TYPES.AMOUNT_OFF && promo.amountOff > 0){
			discountPerItem = promo.amountOff;

		}else if(promo.discountType == CONSTANTS.PROMOTION_DISCOUNT_TYPES.PROMO_SELLING_PRICE && promo.promoSellingPrice >= 0){
			discountPerItem = basePrice - promo.promoSellingPrice;
		}

		if(discountPerItem > 0){
			// get discount per 1 kg, qty = 1
			if(isScannedByWeight){
				discount = discountPerItem;
			}else{
				//console.log(discountPerItem);
				//console.log(qty);
				discount = qty ? (discountPerItem * qty): (discountPerItem * promo.qualifiedQuantity);
			}
		}

	}catch(e){
		uilog("DBUG","Error in calculateDiscount " + e);
	}

	return discount;

};


/**
 * This method returns the following promo receipt details
 * Promo Type 2 - Buy 2 Get 3 @ Disc Price
 * Promo Type 4 - First 2 @ Disc Price
 * Promo Type 5 - Buy 2 Item Get 3 @ Disc Price
 * Promo Type 8 - Sliding Promotion
 *
 * @param promo
 * @param item
 * @param maxDiscount
 * @returns {String}
 */
// CR ADD DISCOUNT
PROMOTIONS.getPromoLabel = function(promo, item, maxDiscount, rewardPromoDetails){
	
	var promoLabel = "";

	try {
		//console.log(promo.promotionType);
		if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.BUY_N_AT_PROMOTION.type) {
			promoLabel = getMsgValue("pos_receipt_promo_type_four_label")
					.format(item.shortDesc, promo.maxPromoQty,
							numberWithCommas(item.priceUnit));
		} else if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.SLIDING_DISCOUNT.type) {
			promoLabel = getMsgValue("pos_receipt_promo_type_eight_label")
					.format(item.shortDesc, numberWithCommas(item.priceUnit));
		} else if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.BUY_N_GET_Y_PROMOTION.type) {
			promoLabel = getMsgValue("pos_receipt_promo_type_two_label")
					.format(item.shortDesc, promo.normalPriceQty,
							promo.promoPriceQty,
							numberWithCommas(item.priceUnit));
		} else if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.BUY_N_A_GET_Y_B_PROMOTION.type) {

			var qualifierItemsDesc = "";
			for ( var i = 0; i < rewardPromoDetails.qualifierItems.length; i++) {
				if(i === 0){
					qualifierItemsDesc += rewardPromoDetails.qualifierItems[i].shortDesc;
				}else{
					qualifierItemsDesc += ("/" + rewardPromoDetails.qualifierItems[i].shortDesc);
				}
			}

			promoLabel = getMsgValue("pos_receipt_promo_type_five_label").format((promo.requiredPoint / promo.pointPerUnit),
					qualifierItemsDesc, 1, item.shortDesc,numberWithCommas(item.priceUnit));
		} else if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.PURCHASE_WITH_PURCHASE.type) {
			promoLabel = 'Prog. Promo:\n' + item.shortDesc;
		} else if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.ADDITIONAL_DISCOUNT.type) {
			//console.log('masuk if product promotion');
			promoLabel = 'Prog. Promo: ' + item.shortDesc;
		}
	} catch (e) {
		uilog("DBUG","Error in getPromoLabel");
	}
	return promoLabel;
};
// CR ADD DISCOUNT

PROMOTIONS.getReversedCmcItems = function(memberPromos, coBrandNumber){
	var reversedItems = {};
	

	uilog("DBUG", JSON.stringify(memberPromos));
	uilog("DBUG", JSON.stringify(coBrandNumber));
	for(var i in memberPromos){
	    var promo = memberPromos[i];
	    var isValid = coBrandNumber && promo.coBrandNumber && (promo.coBrandNumber.indexOf(coBrandNumber.substring(0,6)) != -1 || promo.coBrandNumber.indexOf(coBrandNumber.substring(0,8)) != -1) ;
	    
	    if(!isValid){
	    	reversedItems[i] = promo;
	    }
	}
	
	uilog("DBUG","reversedItems", reversedItems);
	return reversedItems;
};


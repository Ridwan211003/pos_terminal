/**
 * Created by mdelrosario on 1/8/15.
 */

var SALE_RETURN_COUPON = SALE_RETURN_COUPON || {};

SALE_RETURN_COUPON.isCouponReturnCmc = function(txObj){
	if(txObj != undefined){
		return SALE_RETURN_COUPON.isUseCouponReturn(txObj) && SALE_RETURN_COUPON.isCardCoBrand(txObj);
	}else{
		return SALE_RETURN_COUPON.isUseCouponReturn() && SALE_RETURN_COUPON.isCardCoBrand();
	}
}

SALE_RETURN_COUPON.isCouponReturnNotCmc = function(txObj){
	if(txObj != undefined){
		return SALE_RETURN_COUPON.isUseCouponReturn(txObj) && !SALE_RETURN_COUPON.isCardCoBrand(txObj);
	}else{
		return SALE_RETURN_COUPON.isUseCouponReturn() && !SALE_RETURN_COUPON.isCardCoBrand();
	}
}

SALE_RETURN_COUPON.isUseCouponReturn = function(txObj){
	if(txObj != undefined){
		return txObj.payments.some(function(p){
			return p.paymentMediaType == 'COUPON_RETURN';
		})
	}else{
		return saleTx.payments.some(function(p){
			return p.paymentMediaType == 'COUPON_RETURN';
		})
	}

}

SALE_RETURN_COUPON.isNotUseCouponReturn = function(txObj){
	var temp = txObj != undefined? txObj : saleTx;
	return !SALE_RETURN_COUPON.isUseCouponReturn(temp)
}

SALE_RETURN_COUPON.isCardCoBrand = function(txObj){
	if(txObj != undefined){
		console.log("Is card co brand function");
		console.log("Co brand number : " + txObj.coBrandNumber);
		console.log("Is card cobrand : " + txObj.isCardCoBrand);
		return txObj.coBrandNumber && txObj.isCardCoBrand;
	}else{
		console.log("Is card co brand function");
		console.log("Co brand number : " + saleTx.coBrandNumber);
		console.log("Is card cobrand : " + saleTx.isCardCoBrand);
		return saleTx.coBrandNumber && saleTx.isCardCoBrand;
	}

}

// SALE_RETURN_COUPON.isAlreadyCancelledCmc = function(txObj){
// 	var temp = txObj != undefined? txObj : saleTx;
// 	if(temp.isAlreadyCancelledCmc){
// 		temp.isAlreadyCancelledCmc = true;
// 	}
// }

SALE_RETURN_COUPON.isCmcPayment = function(txObj){
	if(txObj != undefined){
		return txObj.payments.some(function(p){
			return p.paymentMediaType.length > 3 && p.paymentMediaType.indexOf("CMC") !== -1;
		});
	}else{
		return saleTx.payments.some(function(p){
			return p.paymentMediaType.length > 3 && p.paymentMediaType.indexOf("CMC") !== -1;
		});
	}

}

SALE_RETURN_COUPON.getDiscountPercentage = function(){
    var cmcCouponDiscountPercentage = getConfigValue('CO_BRAND_COUPON_DISC_PERCENTAGE');
	var cmcListPercentage = cmcCouponDiscountPercentage.split(";");

	for(var i = 0; i <  cmcListPercentage.length; i++){
		var cmcP = cmcListPercentage[i];
		var cmcCoupon =  cmcP.split("|");
		var coBrandNumberCode = cmcCoupon[0];
		var coBrandDiscount = parseInt(cmcCoupon[1]);

		if(coBrandNumberCode == saleTx.coBrandNumber){
			return coBrandDiscount / 100;
		}
    }
    return 0;
}

SALE_RETURN_COUPON.calculateTotalMemberDiscount = function(total){
	var percentage = SALE_RETURN_COUPON.getDiscountPercentage(saleTx.coBrandNumber);
	var disc = total * percentage;
	return Math.ceil(disc);
}

SALE_RETURN_COUPON.isCouponAlreadyUsedInTransaction = function(couponId, txObj){
	var temp = txObj != undefined? txObj : saleTx;
	return temp.payments.some(function(p){
		if(!p.couponReturn){
			return false;
		}else{
			return p.couponReturn.couponReturnId == couponId;
		}
	})
}

SALE_RETURN_COUPON.calculateCouponReturn = function(txObj){
	var temp = txObj != undefined? txObj : saleTx;
	var amount = 0; 
	for(var i = 0; i < temp.payments.length; i++){
		if(temp.payments[i].paymentMediaType == 'COUPON_RETURN'){
			amount += temp.payments[i].amountPaid;
		}
	}
	return amount;
}

SALE_RETURN_COUPON.isCashFirst = function(txObj){
	var temp = txObj != undefined? txObj : saleTx;
	for(var i = 0; i < temp.payments.length; i++){
		if(temp.payments[i].paymentMediaType == 'COUPON_RETURN' || temp.payments[i].paymentMediaType == 'COUPON'){
			continue;
		}
		else if(temp.payments[i].paymentMediaType == 'CASH'){
			return true;
		}
		else{
			return false;
		}
	}
	return false;
}
SALE_RETURN_COUPON.subtotalPayWithCash = function(txObj){
	return CASHIER.getFinalSubtotalTxAmount(txObj) + SALE_RETURN_COUPON.calculateCouponReturn();
}

SALE_RETURN_COUPON.processReturnCouponCmcPayment = function(func, paymentMediaType){

}

SALE_RETURN_COUPON.processReturnCouponNonCmcPayment = function(func, paymentMediaType){

}
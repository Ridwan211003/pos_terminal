Homedelivery.PosTxItemCollection = Backbone.Collection.extend({
	model : Homedelivery.PosTxItem,
	getPosItemIds : function() {
		return _.pluck(this.toJSON(), 'id');
	},
	removeVoided : function(){
		var ean13codes = _.uniq(this.pluck('ean13code'));
		_.each(ean13codes, function(ean13code){
			var alreadyForDelivery = this.where({ ean13code : ean13code, hdDeliveryItemType : 'ALREADY_FOR_DELIVERY' });
			var models = _(this.remove(this.filter(function(item){ return item.get('ean13code') === ean13code 
				&& (item.get('hdDeliveryItemType') === 'OK' 
				|| item.get('hdDeliveryItemType') === 'ALREADY_FOR_DELIVERY');
			})));
			var model = models.first();
			var quantitySum = models.reduce(function(memo, value){
				if(!!value.get('voided')){
					return memo - value.get('quantity');
				} else {
					return memo + value.get('quantity');
				}
			}, 0);
			if(alreadyForDelivery.length > 0){
				model.set({hdDeliveryItemType : 'ALREADY_FOR_DELIVERY'});
			}
			if(quantitySum > 0) {
				model.set({ quantity : quantitySum });
				this.add(model);
			}
		}, this);
		return this;
	},
	getHdDeliveryItems : function(){
		return this.reduce(function(hdDeliveryItems, value) {
			hdDeliveryItems.push({
				posTxItemId : value.get('id'),
				priceSubtotal : value.get('quantity') * value.get('priceUnit'),
				priceUnit : value.get('priceUnit'),
				productId : value.get('productId'),
				quantity : value.get('quantity')
			});
			return hdDeliveryItems;
		}, []);
	}
});
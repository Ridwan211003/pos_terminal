Homedelivery.Page3DeliveryItemsListView = Backbone.View.extend({
	el : '#deliveryItemsContainer',
	
	initialize : function(){
		_(this).bindAll('render', 'add', 'remove');
		this.collection.on('add', this.add, this);
		this.collection.on('remove', this.remove, this);
		this.collection.on('reset', this.reset, this);
	},
	
	render : function(){
		var view = this;
		_.each(this.collection.models, function(model){
			this.$('#deliveryItemsTable').append(new Homedelivery.Page3DeliveryItemView({model : model}).render());
		}, this);
		this.$el.show();
		return this;
	},
	
	add : function(model){
		this.$('#deliveryItemsTable').append(new Homedelivery.Page3DeliveryItemView({model : model}).render());
	},
	
	remove : function(model){
		model.view.remove();
	},
	
	reset : function(collection, options){
		this.$('#deliveryItemsTable').empty();
		_.each(options.previousModels, function(model){
			model.view.remove();
		}, this);
	},
	
	clear : function(){
		this.collection.reset();
	},
});
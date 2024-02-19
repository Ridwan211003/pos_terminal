Homedelivery.Page5SearchOrderListView = Backbone.View.extend({
	el : '#page5searchOrderList',
	
	initialize : function(){
		_(this).bindAll('add', 'remove', 'reset', 'complete');
		this.collection.on('add', this.add, this);
		this.collection.on('remove', this.remove, this);
		this.collection.on('reset', this.reset, this);
	},
	
	add : function(model){
		model.on('cancel', this.cancel, this);
		model.on('complete', this.complete, this);
		this.$el.append(new Homedelivery.Page5SearchOrderView({ model : model }).render());
	},
	
	remove : function(model){
		uilog('DBUG','Page5SearchOrderControlView#remove');
	},
	
	reset : function(collection, options){
		_.each(options.previousModels, function(item){
			item.clear();
		}, this);
	},
	
	render : function(){
		this.$el.show();
	}, 
		
	complete : function(model){
		this.trigger('complete', model);
	}
});
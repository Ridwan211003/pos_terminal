Homedelivery.ODPrintPreview = Backbone.View.extend({
	className : 'hdOperationDeliveryReport',
	
	initialize : function(){
	},
	
	render : function(data){
		var source = $('#HDOperationalDeliveryTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template(data));
		return this.$el;
	}, 
	
	tearDown : function(){
		uilog('DBUG','Homedelivery.ODPrintPreview#tearDown');
		this.remove();
	}
});
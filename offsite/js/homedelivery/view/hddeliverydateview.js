Homedelivery.DeliveryDateView = Backbone.Epoxy.View.extend({
	datetimepickersettings : {},
	
	//This function will initialize the delivery date values
	initialize : function(options) {
		_(this).bindAll('render', 'clearDeliveryDate', 'completed', 'clear', 'setDeliveryTimeSlots', 'reset');
		this.model = new Homedelivery.HdDeliveryDate();
		if(options.originalDeliveryDate){
			this.model.set('originalDeliveryDate', options.originalDeliveryDate );
		} 
		
		if(options.datetimepickersettings){
			this.datetimepickersettings = options.datetimepickersettings;
		}
		this.model.on('change:complete', this.completed, this);
	},

	//This function will set the DeliveryDate Timeslots
	setDeliveryTimeSlots : function(data) {
		this.timeSlots = data;
		var now = new Date();
		var view = this;
		this.dateTimePicker = this.$("input.deliveryDate").datetimepicker($.extend({}, hdSettings.deliveryDatePicker, {
			timeSlots : view.timeSlots[now.dateFormat('Y-m-d')],
			minTime : now.dateFormat('H:i'),
			onSelectDate : function(currentDateTime, elem){
				$('div.xdsoft_current').removeClass('xdsoft_current');
				var now = new Date();
				if(now.getDate() == currentDateTime.getDate()){
					this.setOptions({
						minTime: now.dateFormat('H:i')
					});
				} else {
					this.setOptions({
						minTime: '0:00'
					});
				}
				xd = $(this).data('xdsoft_datetime');
				xd.currentTime.setHours(0);
				xd.currentTime.setMinutes(0);
				$(this).data('xdsoft_datetime', xd);
				this.setOptions({ timeSlots : view.timeSlots[currentDateTime.dateFormat('Y-m-d')] , value : ''});
				elem.val('');
				elem.trigger('change');
			},
			onShow : function(currentDateTime, elem){
				$('div.xdsoft_current').removeClass('xdsoft_current');
				xd = $(this).data('xdsoft_datetime');
				xd.currentTime.setHours(0);
				xd.currentTime.setMinutes(0);
				$(this).data('xdsoft_datetime', xd);
				elem.val('');
				elem.trigger('change');
			}
		}, this.datetimepickersettings));
	},
	
	events : {
		'click .clearButton' : 'clearDeliveryDate'
	},

	render : function(deliveryType) {
		if (deliveryType ==  "AC_INSTALLATION") {
			ajax.getACTimeSlot(this.setDeliveryTimeSlots);
		} else {
			ajax.getHDTimeSlot(this.setDeliveryTimeSlots);
		}
		this.$el.show();
	},

	bindings : {
		'input.deliveryDate' : 'value:deliveryDate, events:["keyup", "change", "click", "focus", "blur"]',
		'span.deliveryDateDisplay' : 'text:deliveryDate',
		'.clearButton' : 'toggle:deliveryDate',
		'.originalDeliveryDate' : 'text:originalDeliveryDate',

		'span.invalid.deliveryDate' : 'text:deliveryDateValid'
	},


	//This function will clear the delivery date
	clearDeliveryDate : function() {
		$('div.xdsoft_current').removeClass('xdsoft_current');
		this.$('.clearButton').change();
		this.model.set('deliveryDate', '');
	},

	completed : function(model, isComplete) {
		this.complete = isComplete;
		this.trigger('complete:deliveryDate', isComplete);
	},

	clear : function() {
		if(this.dateTimePicker){
			this.dateTimePicker.datetimepicker('destroy');			
		}
		this.reset();
	},
	
	reset : function(){
		this.model.set(Homedelivery.HdDeliveryDate.prototype.defaults);		
	}
});
//{ vendorId: 2362,
//    productId: 9488,
//    path: 'USB_093a_2510_6400000',
//    serialNumber: '',
//    manufacturer: 'PixArt',
//    product: 'USB Optical Mouse',
//    release: 256,
//    interface: -1 }
var demodata = require("./demodata");
var HID = require('node-hid');
var devices = HID.devices();
//console.log(devices);   //uncomment to get specific HID device metadata
var device = null;

exports.mouseAction = "";
exports.mouseActions = function(io) {
	for(var i=0 && !device; i<devices.length; i++){
		if(devices[i].product.toLowerCase().search("mouse") > -1){
			device = new HID.HID(devices[i].path);
			console.log("Create device");
			device.read(onRead);
		}
	}
	if(!device) {
		console.log("Create device from explicit path");
		//use explicit path for USB mouse if auto-detection above doesn't work
		device = new HID.HID("USB_093a_2510_6400000");
		device.read(onRead);
	}

	function onRead(error, data) {
		if(data) {
			//filter mouse press events
			if(data[0] != 0 && data[1] == 0 && data[2] == 0 && data[3] == 0) {
				if(data[0] == 1) {
//					mouseAction = "left press";
					mouseAction = demodata.getBarcode();
				}
				else if(data[0] == 2) {
//					mouseAction = "right press";
					mouseAction = demodata.getBarcode();
				}
				else if(data[0] == 4) {
//					mouseAction = "middle press";
					mouseAction = demodata.getBarcode();
				}
				console.log(mouseAction);
	 		    io.sockets.emit('mouseData', {data:mouseAction});
			}
		}
		device.read(onRead);
	};
};

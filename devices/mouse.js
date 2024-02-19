var fs = require("fs");
var events = require("events");
var eventEmitter = events.EventEmitter;
var demodata = require("./demodata.js");

exports.mouseAction = "";
exports.mouseActions = function(io) {
	var mouse = new Mouse();
	mouse.on('button', function(event) {
//		if(event.leftBtn) {
//			mouseAction = "left press";
//			mouseAction = demodata.getBarcode();
//		}
//		else if(event.rightBtn) {
//			mouseAction = "right press";
//			mouseAction = demodata.getBarcode();
//		}
		if(event.middleBtn) {
//			mouseAction = "middle press";
			mouseAction = demodata.getBarcode();
		}
		console.log(mouseAction);
		io.sockets.emit('mouseData', {data:mouseAction});
	});
};

exports.mouse = function(socket) {
	// a socket client, listen for new serial data:
	var mouse = new Mouse();
	mouse.on('button', function(data) {
		// set the value property of scores to the serial string:
		serialData = data;
		// send a serial event to the web client with the data:
		socket.emit('mouse', serialData);
	});
	/*
	 * mouse.on('moved', function(data) { // set the value property of scores to
	 * the serial string: serialData = data; // for debugging, you should see
	 * this in Terminal: // console.log(data); // send a serial event to the web
	 * client with the data: socket.emit('serialEvent', serialData); });
	 */
};

function parse(mouse, buffer) {
	var event = {
//		leftBtn : (buffer[0] & 1) > 0, // Bit 0
//		rightBtn : (buffer[0] & 2) > 0, // Bit 1
		middleBtn : (buffer[0] & 4) > 0, // Bit 2
		xSign : (buffer[0] & 16) > 0, // Bit 4
		ySign : (buffer[0] & 32) > 0, // Bit 5
		xOverflow : (buffer[0] & 64) > 0, // Bit 6
		yOverflow : (buffer[0] & 128) > 0, // Bit 7
		xDelta : buffer.readInt8(1), // Byte 2 as signed int
		yDelta : buffer.readInt8(2)
	};
	if (event.leftBtn || event.rightBtn || event.middleBtn) {
		event.type = 'button';
	} else {
		event.type = 'moved';
	}
	return event;
}

//open mouse device using file system
function Mouse(mouseid) {
	this.wrap('onOpen');
	this.wrap('onRead');
	this.dev = typeof (mouseid) === 'number' ? 'mouse' + mouseid : 'mice';
	this.buf = new Buffer(3);
	fs.open('/dev/input/' + this.dev, 'r', this.onOpen);
}

Mouse.prototype = Object.create(eventEmitter.prototype, {
	constructor : {
		value : Mouse
	}
});

Mouse.prototype.wrap = function(name) {
	var self = this;
	var fn = this[name];
	this[name] = function(err) {
		if (err)
			return self.emit('error', err);
		return fn.apply(self, Array.prototype.slice.call(arguments, 1));
	};
};

/*******************************************************************************
 * Read Functions
 ******************************************************************************/
Mouse.prototype.onOpen = function(fd) {
	this.fd = fd;
	this.startRead();
};

Mouse.prototype.startRead = function() {
	fs.read(this.fd, this.buf, 0, 3, null, this.onRead);
};

Mouse.prototype.onRead = function(bytesRead) {
	var event = parse(this, this.buf);
	event.dev = this.dev;
	this.emit(event.type, event);
	if (this.fd)
		this.startRead();
};

Mouse.prototype.close = function(callback) {
	fs.close(this.fd, (function() {
		console.log(this);
	}));
	this.fd = undefined;
};

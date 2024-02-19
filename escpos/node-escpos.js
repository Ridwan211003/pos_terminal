"use strict";

var util = require('util');
var serialport = require("serialport");
var Iconv = require('iconv').Iconv;
var SerialPort = serialport.SerialPort;

var controlCodes = {
    NUL: String.fromCharCode(0),
    EOT: String.fromCharCode(4),
    ENQ: String.fromCharCode(5),
    HT: String.fromCharCode(9),
    LF: String.fromCharCode(10),
    FF: String.fromCharCode(12),
    CR: String.fromCharCode(13),
    DLE: String.fromCharCode(16),
    DC4: String.fromCharCode(20),
    CAN: String.fromCharCode(24),
    ESC: String.fromCharCode(27),
    FS: String.fromCharCode(28),
    GS: String.fromCharCode(29)
};

var escPosCommands = {
    hwInit: "\x1b\x40"
};

var centerText = function(txt, lineWidth) {
    if (txt.length < lineWidth - 2) {
        var pad = "";
        var nbSpaces = (lineWidth - txt.length) / 2;
        for (var i = 0; i < nbSpaces; i++) {
            pad += " ";
        }
        return pad + txt;
    } else {
        return txt;
    }
};

function EscPos(path, options) {
    serialport.SerialPort.call(this, path, options);
    var self = this;
	this.newLineMode = true;

    this.on("open", function() {
        self.write(escPosCommands.hwInit);
        self.emit('ready');
    });
}
util.inherits(EscPos, serialport.SerialPort);

EscPos.prototype.text = function(txt) {
    var iconv = new Iconv('UTF-8', 'CP437//TRANSLIT//IGNORE');
    var buffer = iconv.convert(txt);
    this.write(buffer);
};

/****************************************************
 *
 * ESC/POS PRINTER STUFF
 *
 ****************************************************/
var escPosPrinterCommands = {
};

var printerStatus = {
    isDrawerOpen : '18',
    isDrawerClosed : '22',
};

function EscPosPrinter(path, options) {
    EscPos.call(this, path, options);
    var self = this;
    this.newLineMode = true;
    this.on('data', function(data) {
        self.emit('readStatus', data);
    });
}
util.inherits(EscPosPrinter, EscPos);

EscPosPrinter.prototype.printLine = function(txt) {
    if(this.newLineMode) this.text(txt + "\n\r");
    else this.text(txt + "\r");
};

EscPosPrinter.prototype.printCentered = function(txt) {
    if(this.newLineMode) this.text(centerText(txt, 39) + "\n\r");
    else this.text(centerText(txt, 39) + "\r");
};

EscPosPrinter.prototype.printCenteredLen = function(txt, len) {
    if(this.newLineMode) this.text(centerText(txt, len) + "\n\r");
    else this.text(centerText(txt, len) + "\r");
};

EscPosPrinter.prototype.printCommand = function(txt) {
    this.write(txt);
};

EscPosPrinter.prototype.checkStatus = function(txt) {
    this.write(txt);
};

EscPosPrinter.prototype.setNewLineMode = function(mode) {
    this.newLineMode = mode;
};


module.exports.EscPosPrinter = EscPosPrinter;

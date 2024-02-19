/*
 * NEW POSS DEVELOPMENT 
 * 20150826 - LUCKY (lucky@equnix.co.id)
 */

/**
 * Start/Run Application
 */
var http 	= require('http');
var Q 		= require('q');
var fs 		= require('fs');
var util 	= require('util');

var hasServerStarted = false;

startServer(false);

function startServer(forceOffsite) 
{
	require("./proxyserver.js").startServer(forceOffsite);
}


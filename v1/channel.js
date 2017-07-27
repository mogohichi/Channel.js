
/*!
* Channel JavaScript SDK
* Version: 1.0
* Created: Sunday June 11 2017.
* https://www.getchannel.co
*
* Copyright 2017 Mogohichi, Inc.
* The Channel JavaScript SDK is freely distributable under the MIT license.
*
*/

(function(root) {
	"use strict";
	root.Channel = root.Channel || {};
	root.Channel.VERSION = "0.1";
	var getUrl = window.location;
	// root.Channel.baseUrl = "https://api.getchannel.co/";
	root.Channel.baseUrl = "http://localhost:8080/api";
	root.Channel.applicationKey = "";
}(this));

(function() {
	var root = this;
	Channel.init = function(applicationKey) {
		Channel.applicationKey = applicationKey;
		localStorage.setItem("__channelApplicationKey",btoa(applicationKey));
		return new Promise(function(resolve) {resolve()});
	};

	var getApplicationKey = function(){
		var applicationKey = localStorage.getItem('__channelApplicationKey');
		return atob(applicationKey);
	}

	var setClient = function(data){
		var encoded = encodeURIComponent(JSON.stringify(data));
		localStorage.setItem("__currentClient" + getApplicationKey(), btoa(encoded));
	};

	var getClient = function(){
		var client = localStorage.getItem('__currentClient' + getApplicationKey());
		if (client !== null){
			try {
				var u = JSON.parse(decodeURIComponent(atob(client)));
				return u;
			} catch (e) {
				console.log("Channel: Invalid client data");
				return null;
			}
		}
		console.log("Missing Client ID. Did you call Channel.init?");
		return null;
	};

	var clientExists = function(){
		return localStorage.getItem('__currentClient' + getApplicationKey()) !== null;
	}

	var _currentClient = {};
	Channel.newClientIfNeeded = function(){
		return new Promise(function(resolve) {
			_newClient().then(function(client){
				_currentClient = new ChannelClient(client);
				resolve(_currentClient);
			});
		});
	};

	Channel.currentClient = function(){
		return _currentClient;
	};

	_newClient = function(){
		return new Promise(function(success, error) {
			var url = "/client";
			var ajaxSuccess = function(data,status){
				setClient(data.result);
				var c = getClient();
				success(c);
			};

			var _navigator = {};
			
			for (var i in navigator) {
				_navigator[i] = navigator[i];
			}

			delete _navigator.plugins;
			delete _navigator.mimeTypes;
			var clientData =  {
				deviceInfo:_navigator
			};
			var referrer = (window.location != window.parent.location)
			    ? document.referrer
			    : document.location.href;
			clientData.deviceInfo["referrer"] = referrer;
			clientData.deviceInfo["url"] = window.location.href;
			clientData.deviceInfo["channelClient"] = "Channel.js/" + Channel.VERSION;
			var data =  JSON.stringify(clientData);
			var c = getClient();
			if (c !== null) {
				_currentClient = new ChannelClient(c);
				_requestClientProtectedResource("PUT",url,data).then(ajaxSuccess);
			} else {
				_request("POST",url,data).then(ajaxSuccess);
			}
			
		});
	};

	//Channel Client 
	var ChannelClient = function(client){
		this.clientID = client.data.clientID;
	};

	ChannelClient.prototype.sendTextMessage = function(text,success,error){
		if (clientExists() == false) {
			return;
		}
		var url = "/thread/messages";
		var data =  JSON.stringify({
			"data":{"text":text}
		});
		return _requestClientProtectedResource("POST",url,data).then(success,error);
	};

	ChannelClient.prototype.sendData = function(data,success,error){
		if (clientExists() == false) {
			return;
		}
		var url = "/thread/messages";
		var data =  JSON.stringify({
			"data":data
		});
		return _requestClientProtectedResource("POST",url,data).then(success,error);
	};

	ChannelClient.prototype.uploadImage = function(imageData,success,error){
		if (clientExists() == false) {
			return;
		}
		var url = "/thread/messages/upload";
		var data =  JSON.stringify({
			"imageBase64":imageData
		});
		return _requestClientProtectedResource("POST",url,data).then(success,error);
	};

	ChannelClient.prototype.sendImageMessage = function(fileUrl,success,error){
		if (clientExists() == false) {
			return;
		}
		var url = "/thread/messages";

		var data = JSON.stringify({
			"data": {
				"card":{
					"type":"image",
					"payload":{
						"url":fileUrl
					}
				}
			}
		})
		return _requestClientProtectedResource("POST",url,data).then(success,error);
	};

	ChannelClient.prototype.loadMessages = function(success,error){
		if (Channel.currentClient() == null) {
			return;
		}
		var url = "/thread/messages";
		return _requestClientProtectedResource("GET",url,null).then(success,error);
	};

	ChannelClient.prototype.subscribe = function(success){
		//SSE
		c = getApplicationKey() + ":" + _currentClient.clientID;
		var endpoint = Channel.baseUrl + "/subscribe?c=" + btoa(c);
		var source = new EventSource(endpoint);
		source.onmessage = function(event) {
			var sseData = JSON.parse(event.data)
			success(sseData);
		};
	};
	
	//internal methods
	_requestClientProtectedResource = function(method, url, data){
		return _ajax(true,method,url,data)
	};

	_request = function(method, url, data){
		return _ajax(false,method,url,data)
	};

	_ajax = function(withClient, method, url, data){
		return new Promise(function(success, error) {
			if (Channel.applicationKey === ""){
				error("Channel applicationKey cannot be blank.",0);
				return;
			}

			var xhr = new XMLHttpRequest();
			xhr.withCredentials = true;
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status != 200){
						try {
							response = JSON.parse(xhr.responseText);
							error(response,xhr.status);
							return;
						} catch (e) {
							if (error) {
								error(xhr.responseText,xhr.status);
							}
						}
						return;
					}

					var response;
					try {
						response = JSON.parse(xhr.responseText);
					} catch (e) {
						if (error) {
							error(xhr,xhr.status);
						}
					}

					if (response && success) {
						success(response,xhr.status);
						return;
					}

					if (!response && error){
						response = JSON.parse(xhr.responseText);
						error(response,xhr.status);
					}
					return;
				}
			};

			xhr.open(method, Channel.baseUrl + url,true);
			if (withClient === true){
				xhr.setRequestHeader("X-Channel-Client-ID", _currentClient.clientID);
			}
			
			xhr.setRequestHeader("X-Channel-Application-Key", getApplicationKey());
			xhr.setRequestHeader("Content-Type","application/json");
			xhr.send(data);

		});
	};

})(this);
/*
Sorry if this javascript is messy. Come fix it for us! hello@mogohichi.com
*/

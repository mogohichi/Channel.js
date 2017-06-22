# Channel.js
Channel.js is a javascript library that makes it easy for you to send/receive messages via Channel Platform. https://www.getchannel.co

#### Demo 
A [demo page](https://www.getchannel.co/apps/app_fb5BAM_dgEJMAKQ0ux6iDx17sal5i6lCDQPP4GKbEXs/) using our Javascript library and Vue.js

#### Requirement
An account and Application on https://www.getchannel.co

#### Including Channel.js
Begin by including the library and setting your Application key. To get started, include this script on your pages. It should always be loaded directly from https://js.getchannel.co/v1/channel.js
``` html
<script src="https://js.getchannel.co/v1/channel.js"></script>
```

#### Channel.init(applicationKey)
Use `Channel.init(applicationKey)` to initialize your application and create an instance of Channel client object. Application Key is required when calling this function. If succeeded, your current client will be stored in `Channel.currentClient()`

```javascript
var applicationKey = ""
Channel.init(applicationKey)
```

#### Channel.currentClient()
Use `Channel.currentClient` to get current Channel client instance. 
```javascript
var client = Channel.currentClient();
```

### Receiving Message
#### client.subscribe([callback])
Use `client.subscribe([callback])` to receive message from Channel server.
```javascript
var client = Channel.currentClient();
client.subscribe(function(data){
  console.log("A message from server", data);
});
```

#### client.loadMessages([successCallback], [errorCallback])
Use `client.loadMessages([successCallback], [errorCallback])` to load current Channel client's messages.
See more on [Docs](https://docs.getchannel.co/#load-messages)
```javascript
var client = Channel.currentClient();
client.loadMessages(function(data,status){
  console.log("successfully load messages", data);
},function(error,status){
  console.log("something went wrong", error);
})
```

### Sending Message
#### client.sendTextMessage(text, [successCallback], [errorCallback])
Use `client.sendTextMessage(text,[successCallback],[errorCallback])` to send a simple text message. when successfully sent, server will response with a message object. (More on [Docs](https://docs.getchannel.co/#send-new-message))
```javascript
var client = Channel.currentClient();
client.sendTextMessage("hi there this is a message",function(data,status){
  console.log("successfully sent", data);
},function(error,status){
  console.log("something went wrong", error);
})
```
#### client.sendImageMessage(imageURL, [successCallback], [errorCallback])
Use `client.sendImageMessage(imageURL, [successCallback], [errorCallback])` to send image. Your image URL must be a valid URL.  Use `client.uploadImage(base64EncodedImageData, [successCallback], [errorCallback])` if you want to host your image on Channel.
```javascript
var client = Channel.currentClient();
client.sendImageMessage("https://www.getchannel.co/images/logo@2x.png",function(data,status){
  console.log("successfully sent", data);
},function(error,status){
  console.log("something went wrong", error);
})
```

#### client.uploadImage(base64EncodedImageData, [successCallback], [errorCallback])
Use `client.uploadImage(base64EncodedImageData, [successCallback], [errorCallback])` to upload an image to Channel server. You will receive a signed URL when upload successfully. [Docs](https://docs.getchannel.co/#upload-image)

```javascript
var base64ImageData = "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";

var client = Channel.currentClient();
client.uploadImage(base64ImageData,function(data,status){
var signedURL = data.result.data.url;
  console.log("successfully uploaded", signedURL);
},function(error,status){
  console.log("something went wrong", error);
})
```

---
If you have any question, Feel free to create an issue here or channel@mogohichi.com

https://www.getchannel.co

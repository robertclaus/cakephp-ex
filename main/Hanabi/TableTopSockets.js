var myConnectionId;
var allConnectionIds=[];
var postLockAction;
var postConnectAction;
var websocket;
function init(roomName,afterConnect) { 
            websocket = new WebSocket(
            //"ws://robertclaus.info:80","echo-protocol");
			"ws://nodejs-mongo-persistent-robert-node.1d35.starter-us-east-1.openshiftapps.com/health","echo-protocol");
            //"ws://socket-robertclaus.rhcloud.com:8000","echo-protocol");
            //"ws://apple.cranberry.ninja/","echo-protocol");
            
            websocket.onopen = function() { console.log("connected");
				var room = {};
				room["room"]=roomName;
				websocket.send("*"+JSON.stringify(room));
            };
            
            websocket.onmessage = function(evt) {
				console.log("IN");
				console.log(evt.data);
            	var obj= 		JSON.parse(evt.data);
			  processConnectionMessage(obj);
				if(evt.data.fromConnection!=myConnectionId)
				{
              processLockMessage(obj);
			  processSyncMessage(obj);
				}
            };
            
            websocket.onerror = function(evt) {console.log(evt);};
            websocket.onclose = function(evt) { console.log(evt);};
			
			postConnectAction=afterConnect;
}

var send=function send(msg){

	msg.fromConnection=myConnectionId;
	console.log("OUT"+myConnectionId);
		console.log(msg);
websocket.send(JSON.stringify(msg));
};

var sendConnectionRequests = function sendConnectionRequests()
{
	var msg={};
	msg.requestingConnections=true;
	msg.myConnectionId=myConnectionId;
	allConnectionIds=[];
	allConnectionIds.push(myConnectionId);
	send(msg);
};

var locked=false;
var requesting=false;

//Used to process all locking and unlocking ack's having arrived.
function processLockAck(data)
{
	console.log(data);
	if(data.originalMessage=="lockRequest")
	{
		locked=true;
		console.log("Locked");
		afterLockAction();
	}
	if(data.originalMessage=="unlockRequest")
	{
		locked=false;
		console.log("Unlocked");
	}
};

//Used to process lock and unlock messages
function processLockMessage(data)
{
	if(data.lockRequest)
	{
		var message={};
	  message.originalMessage="lockRequest";
	  message.ack=true;
	  message.lockRequester=data.fromConnection;
		send(message);
	  locked=true;
	  console.log("Locked -elsewhere");
	}
	if(data.unlockRequest)
	{
		var message={};
	  message.originalMessage="unlockRequest";
	  message.ack=true;
	  message.lockRequester=data.fromConnection;
		send(message);
	  locked=false;
	  console.log("Unlocked - elsewhere");
	}
	
	if(data.ack && data.lockRequester==myConnectionId)
	{
	  ackCount--;
	  if(ackCount<1)
	  {
		processLockAck(data);
	  }
	}
	
	if(data.nack)
	{
		alert("Someone tried to grab the deck while someone else was using it.");
	}
};

//Private - Used to process messages from sendConnectionRequests and it's ack
function processConnectionMessage(data){
	if(data.connectionId)
	{
		myConnectionId=data.connectionId;
		console.log("PostConnectAction");
		postConnectAction();
	}
	if(data.requestingConnections)
	{

		if(allConnectionIds.indexOf(data.myConnectionId)==-1)
		{
			allConnectionIds.push(data.myConnectionId);
			console.log(allConnectionIds);
		}

		var msg={};
		msg.sendingConnectionId=true;
		msg.otherConnectionId=myConnectionId;
		send(msg);
	}
	if(data.sendingConnectionId)
	{
		if(allConnectionIds.indexOf(data.otherConnectionId)==-1)
		{
			allConnectionIds.push(data.otherConnectionId);
			console.log(allConnectionIds);
		}
	}
};

//Private - Used to process message from syncObject function
function processSyncMessage(data){
	if(data.isSync)
	{
		window[data.receiveFunction](data.obj);
		console.log(data);
	}
	
	if(data.isRequest)
	{
		var msg={};
		msg.isRequestResponse=true;
		msg.receiverFunction=data.receiverFunction;
		msg.obj=window[data.objectFunction]();
		send(msg);
		console.log(data);
	}
	
	if(data.isRequestResponse && requesting)
	{
		window[data.receiverFunction](data.obj);
		requesting=false;
		console.log(data);
	}
};

//Private - Called by doLockAction
var grabLock=function grabLock(alf){
	locked=true;
	afterLockAction=alf;
	var message={};
	message.lockRequest=true;
	ackCount=allConnectionIds.length;
	message.ackCount=ackCount;
	send(message);
};

//Private - Called by doLockAction
var releaseLock=function releaseLock(){
	locked=false;
	var message={};
	message.unlockRequest=true;
	ackCount=allConnectionIds.length;
	send(message);
};


//Private - Used to lock the object sharing while syncing
function doLockedAction(action){
	if(!locked)
	{
		grabLock(function(){
			action();
			releaseLock();
		});
		return true;
	}
	else
	{
		alert("Failed to lock object.");
		return false;
	}
};

//Public - Used to sync an object
function pushObject(obj,receiveFunction)
{
	doLockedAction(function(){
	var message={};
	  message.isSync=true;
	  message.receiveFunction=receiveFunction;
	  message.obj=obj;
	  send(message);
	});
};

//Public - Used to request object
function requestObject(objectFunction,receiverFunction)
{
	doLockedAction(function(){
		requesting=true;
		var message={};
		message.isRequest=true;
		message.receiverFunction=receiverFunction;
		message.objectFunction=objectFunction;
		send(message);
	});
}

//Public returns unique ID for this connection
function getMyId()
{
	return myConnectionId;
}

//Public returns a list of all ID's currently connected
function getAllIds()
{
	return allConnectionIds;
}
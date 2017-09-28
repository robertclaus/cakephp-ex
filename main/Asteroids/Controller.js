$( document ).ready(function() {

function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

var userId= getCookie("userId");
console.log("User");
console.log(userId);
if(userId=="")
{
	userId=makeid(64);
	userId=setCookie("userId",userId,100);
}
console.log(userId);
console.log(encodeURIComponent(userId));

var websocket;
var id;
var connected=false;
function init() { 
        websocket = new WebSocket(
            "ws://socket-robertclaus.rhcloud.com:8000","echo-protocol");
           
            
		websocket.onopen = function() { console.log("connected");
            connected=true;
            var room = {};
			room["room"]="new";
			room["roomMode"]="controller";
			room["amHost"]="false";
			websocket.send("*"+JSON.stringify(room));
			genericData(commands);
			websocket.send(JSON.stringify(commands));

		websocket.onmessage = function(evt) {
				console.log(evt.data);
				var d=JSON.parse(evt.data);
				if(d["connectionId"]!=undefined)
				{
					id=d["connectionId"];
				}
				if(d["id"]==userId && d["scored"]!=undefined)
				{
					if(!(parseInt(commands["score"])>0))
					{
						console.log("reset");
						commands["score"]=0;
					}
					commands["score"]=parseInt(commands["score"])+parseInt(d["scored"]);
					cache["score"]=commands["score"];
					saveCache();
					displayScore();
				}
			};
						
		websocket.onerror = function(evt) { connected=false; console.log("Disconnected"); console.log(evt);
		setTimeout(resetConnection, 3000);
		};
		websocket.onclose = function(evt) { connected=false; console.log("Disconnected"); console.log(evt);
		setTimeout(resetConnection, 3000);};
	};

function resetConnection()
{
	if(!connected)
	{
		init();
	}
}
	
	
	function displayScore()
	{
		$(".cScore").html(commands["score"]);
	}
function genericData(commands)
{
commands["id"]=userId;
commands["connectionId"]=id;
}

var commands={"keys":{},"strings":{}};
var cache={"strings":{}};

function down(actionId)
{
genericData(commands);
commands["keys"][actionId]=true;
websocket.send(JSON.stringify(commands));
}

function downButton()
{
	down(event.currentTarget.id);
}

var downKey=function downKey(e)
{
	down(keyToAction(e.keyCode));
}

function up(actionId)
{
genericData(commands);
commands["keys"][actionId]=false;
websocket.send(JSON.stringify(commands));
}

function upButton()
{
	up(event.currentTarget.id);
}

var upKey = function upKey(e)
{
	up(keyToAction(e.keyCode));
}

function keyToAction(key)
{
	if(key==65)
	{
		return "left";
	}
	if(key==68)
	{
		return "right";
	}
	if(key==87)
	{
		return "forward";
	}
	if(key==32)
	{
		return "fire";
	}
}

function changeValue()
{
	genericData(commands);
	commands["strings"][event.currentTarget.id]=event.currentTarget.value;
	websocket.send(JSON.stringify(commands));
}

function refillValues()
{
	console.log("refill");
	$(".cValue").each(function(id,elem){console.log($(elem));
		elem.value=commands["strings"][elem.id];
		var elemObj=($(elem)[0].classList.value.indexOf("jscolor"));
		console.log(elemObj);
		if($(elem)[0].classList.value.indexOf("jscolor")>-1)
		{
			elem.jscolor.fromString(elem.value);
		}
	});
}

function updateCache()
{
	console.log("updateCache");
	cache["strings"][event.currentTarget.id]=event.currentTarget.value;
	saveCache();
}
function saveCache()
{
	console.log(cache);
	console.log(JSON.stringify(cache));
	var baseURL = "http://php-robertclaus.rhcloud.com/test3.php?query=";
	var query = "INSERT INTO `Generic`(`userId`, `data`) VALUES ('"+userId+"','"+JSON.stringify(cache)+"')  ON DUPLICATE KEY UPDATE userId='"+userId+"', data='"+JSON.stringify(cache)+"'";
	var fullString=baseURL+encodeURIComponent(query);

	console.log(fullString);
	console.log(userId);
	$.get(fullString, function(data){
		console.log(data);
	});
}

function getCache()
{
	var baseURL = "http://php-robertclaus.rhcloud.com/test3.php?query=";
	var queryString="SELECT data FROM `Generic` WHERE userId='"+userId+"'";
	var fullString=baseURL+encodeURIComponent(queryString);
	console.log("getCache");
	console.log(fullString);
	$.get(fullString, function(data){
		console.log(data);
		if(data!="Query failed"&&data!="[]")
		{
		console.log(JSON.parse(data)[0]);
		cache=JSON.parse(JSON.parse(data)[0]);
		commands["strings"]=cache["strings"];
		commands["score"]=cache["score"];
		displayScore();
		refillValues();
		
		}
			if(cache["strings"]==undefined)
	{
		cache={};
		cache["strings"]={};
	}
	console.log(cache);
	});

}
getCache();


$(".cButton").bind('touchstart touchenter', down);
$(".cButton").bind('touchend touchcancel touchleave',up);
$(".cValue").bind('change',changeValue);
$(".cache").bind("change",updateCache);
document.onkeydown = downKey;
document.onkeyup = upKey;


      
}
init();  
});
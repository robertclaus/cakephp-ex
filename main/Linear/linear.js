$(document).ready(function(){

window.addEventListener("keydown", dealWithKeyboardDown, false);
window.addEventListener("keyup", dealWithKeyboardUp, false);

var connectionId;
function init() { 
            websocket = new WebSocket("ws://socket-robertclaus.rhcloud.com:8000","echo-protocol");
            
            websocket.onopen = function() { console.log("connected");};
            
            websocket.onmessage = function(evt) { 
            var message = JSON.parse(evt.data);
            //console.log(message);
            if(message.connectionId!=undefined)
            {
            	connectionId=message.connectionId;
              return;
            }
            var playerMessage = message.players;
            $(playerMessage).each(function(ind,elem){
            	if(elem.connectionId!=connectionId)
              {
				var found=false;
              	$(players).each(function(inde,eleme){
                	if(eleme.color==elem.color)
					{
						players[inde]=elem;
						found=true;
					}
                });
                if(!found)
                {
                players.push(elem);
                }
              }
            });
            var zoneMessage = message.zones;
            if(zoneMessage!=null)
            {
				Zones=zoneMessage;
            }
            //players=JSON.parse(evt.data);
            };
            
            websocket.onerror = function(evt) {
            connectionId=undefined;
            alert("Error with websocket");};
            
            }
            init();
            function sendPlayers() {
							if(connectionId==undefined)
{return;}             
var wrapper={"players":players};
websocket.send(JSON.stringify(wrapper));
            }
            function sendZones() {
            if(connectionId==undefined){return;}
            var wrapper={"zones":Zones};
            websocket.send(JSON.stringify(wrapper));
            }


var debug;
var selectedField;
var playerCount=0;
var players=[];
var xoffset=0;
var farthestEver=0;
var farthestEverColor="";

var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");

var keysdown=[];

function dealWithKeyboardDown(e) {
	var charCode=String.fromCharCode(e.keyCode);
    if(selectedField!=undefined)
    {
$(selectedField).html(charCode);
    $(".selected").removeClass("selected");
    selectedField=undefined;
    return;
    }
    if(keysdown.indexOf(charCode)==-1)
    {
    	keysdown.push(charCode);
    }
}

function dealWithKeyboardUp(e){
var charCode=String.fromCharCode(e.keyCode);
var indexOfChar = keysdown.indexOf(charCode);
if(indexOfChar>-1)
{
keysdown.splice(indexOfChar,1);
}
}

setInterval(loop, 30);
var running=false;

function loop()
{
	if(running==false)
	{
		running=true;
		calcMovement();
    calcLife();
    calcStrength();
    pickupItems();
    drawAll();
    sendPlayers();
	calcStats();
	//sendZones(); //Sent in dropItems
    running=false;
   }
}

function pickupItems()
{
$(players).each(function(inde,elem){
var itemZone=inZone(elem,"item");
if(itemZone!=null && Zones[itemZone].collected!=true && !hasItem(elem,Zones[itemZone].item.type) && elem.life>0)
{
Zones[itemZone].collected=true;
Zones[itemZone].item.zoneIndex=itemZone;
elem.items.push(Zones[itemZone].item);
sendZones();
}
});
}

function calcStats()
{
	var maxDistance = 0;
	var maxStrength = 0;
	var strongestColor;
	var farthestColor;
	$(players).each(function(inde,elem){
		if(elem.x>maxDistance)
		{
			maxDistance=elem.x;
			farthestColor = elem.color;
		}
		if(elem.strength>maxStrength)
		{
			maxStrength=Math.floor(elem.strength);
			strongestColor=elem.color;
		}
});
	if(farthestEver<maxDistance)
	{
		farthestEver=maxDistance;
		farthestEverColor=farthestColor;
		$(Zones).each(function(inde,z){
			if(z.type=="farthest")
			{
				z.start=farthestEver+3;
				z.end=farthestEver+5;
			}
		});
	}
	$("#strongest").text(maxStrength);
	$("#strongest").css({'color':strongestColor});
	$("#farthest").text(farthestEver);
	$("#farthest").css({'color':farthestEverColor});
}

function calcStrength()
{
$(players).each(function(inde,elem){
if(!inSafeZone(elem)&&elem.life>0)
{
elem.strength+=Math.sqrt(elem.x)/100;
}
});
}

function calcLife()
{
$(players).each(function(inde,elem){
var isSafe=inSafeZone(elem);
	if(isSafe)
		{elem.life+=5;}
	if(!isSafe && elem.life>=0)
	{
    	elem.life-=lifeDamage(inde);
			if(elem.life<=0)
				{elem.strength-=elem.strength*.5;
         dropItems(elem);}
  }
	if(elem.life>100)
		{elem.life=100;}
});
}

function lifeDamage(playerID)
{
var p=players[playerID];
var closePlayers=0;
var heal=0;
$(players).each(function(inde,elem){
	if(Math.abs(elem.x-p.x)<25)
  {
  	closePlayers+=1;
    if(hasItem(elem,"healaura"))
    {
    	heal+=.1;
    }
  }
});
if(inDamageZone(p) && !hasItem(p,"shield"))
{
return p.x/(Math.pow(p.strength,1.05)*closePlayers) -heal;
}
return p.x/(Math.pow(p.strength,1.3)*closePlayers) -heal;
}

function hasItem(player, type)
{
var returner=null;
$(player.items).each(function(itemIndex,itemElement){
if(itemElement.type==type)
{
returner=itemElement;
}
});
return returner;
}

function dropItems(player)
{
var itemInd;
var lastItemOffset=0;
$(player.items).each(function(itemIndex,itemElement){
console.log(itemElement);
Zones[itemElement.zoneIndex].collected=false;
Zones[itemElement.zoneIndex].start=player.x+lastItemOffset;
Zones[itemElement.zoneIndex].end=player.x+5+lastItemOffset;
lastItemOffset+=6;
});
player.items=[];
sendZones();
}


var Zones=[
{"start":-1000,"end":-1001,"type":"farthest"},
{"start":-5,"end":25,"type":"safe"},
{"start":50,"end":55,"type":"item","item":{"url":"http://images.clipartpanda.com/shield-clipart-4c9Edq7ni.svg","type":"shield"}},
{"start":30,"end":35,"type":"item","item":{"url":"http://cdn.1001freedownloads.com/vector/thumb/104376/1293960051.png","type":"healaura"}},
{"start":300,"end":325,"type":"safe"},
{"start":600,"end":625,"type":"safe"},
{"start":975,"end":1075,"type":"damage"}];

function inZone(elem, type)
{
var returner=null;
$(Zones).each(function(zoneIndex,zoneElement){
if(elem.x>zoneElement.start&&elem.x<zoneElement.end&&zoneElement.type==type)
{
returner=zoneIndex;
}
});
return returner;
}

function inSafeZone(elem)
{
return inZone(elem,"safe")!=null;
}

function inDamageZone(elem)
{
return inZone(elem,"damage")!=null;
}

function calcMovement()
{
keysdown.forEach(function(element){
    $(players).each(function(inde,elem){
    if(elem.connectionId==connectionId)
    {
      if(element==elem.left && elem.x>0)
      {
        move(inde,-1);
      }else if(element==elem.right && elem.life>0)
      {
        move(inde,1);
      }
    }
    });
 });
}

function move(player,distance){
	players[player].x = players[player].x+distance;
  if(players[player].x>100)
  {
  xoffset=players[player].x-200;
  }
  }

function strengthToSize(strength)
{
return Math.sqrt(strength);
}

function drawAll()
{
ctx.clearRect(0, 0, c.width, c.height);
drawZones();
$(players).each(function(inde,elem){
    drawOne(inde);
    });
}

function drawOne(player){
  var p=players[player];
  ctx.fillStyle=getNextColor(player);
  ctx.strokeStyle=getNextColor(player);
  var size=strengthToSize(p.strength);
  if(p.life>0)
  {
  ctx.beginPath();
  ctx.arc(p.x-xoffset, 75, (size)*(p.life/100), 0, 2 * Math.PI);
ctx.fill();
ctx.arc(p.x-xoffset, 75, (size), 0, 2 * Math.PI);
ctx.stroke();
}else
{
ctx.beginPath();
ctx.arc(p.x-xoffset, 75, (size), 0, 2 * Math.PI);
ctx.stroke();
}

$(p.items).each(function(ind,ele){
drawItem(ele,p.x,ind);
});
}

function drawZones(){
$(Zones).each(function(ind,ele){
  if(ele.type=="safe")
  {
  ctx.fillStyle="green";
  }
  if(ele.type=="damage")
  {
  ctx.fillStyle="red";
  }
  if(ele.type=="item")
  {
    if(ele.collected!=true)
    {
			drawItem(ele.item,(ele.end+ele.start)/2);
    }
  return;
  }
  if(ele.type=="farthest")
  {
	  ctx.fillStyle = "yellow";
  }
  ctx.fillRect(ele.start-xoffset,0,(ele.end-ele.start),300);
});
}

function drawItem(item,x,count)
{
		if(count==null)
    {
    count=1;
    }
    var image;
    if(true||item.image==null)
    {
    image = new Image();
    image.src=item.url;
    item.image=image;
    }else{
    image=item.image;
    }
    ctx.drawImage(image, x-(25/2)-xoffset, 20*count,25,25);
}

function keyFieldClick(){
$(".keyField").click(function(e){
selectedField=e.currentTarget;
$(".selected").removeClass("selected");
$(selectedField).addClass("selected");
});
}

function AddPlayer(){
var newPlayer = "<tr data-player='"+playerCount+"'><td><textarea class='nameField' style='background-color:"+getNextColor(playerCount)+"'>Test</textarea></td><td><div disabled class='keyField'>"+getNextDefaultKeys(playerCount)[0]+"</div></td><td><div disabled class='keyField'>"+getNextDefaultKeys(playerCount)[1]+"</div></td><td>true</td></tr>";
$("#playerConfig").append(newPlayer);
keyFieldClick();
playerCount++;
}

function AddKnownPlayer(elem){
	var control = elem.connectionId==connectionId;
	var newPlayer = "<tr data-player='"+playerCount+"'><td><textarea class='nameField' style='background-color:"+elem.color+"'>Test</textarea></td><td><div disabled class='keyField'>"+elem.left+"</div></td><td><div disabled class='keyField'>"+elem.right+"</div></td><td>"+control+"</td></tr>";
$("#playerConfig").append(newPlayer);
keyFieldClick();
playerCount++;
}

$(".newPlayer").click(function(){
AddPlayer();
});

$(".finishConfig").click(function(){
$(".Config").hide();
$(".openConfig").show();
scrapeConfig();
});

$(".openConfig").click(function(){
	redrawConfig();
$(".Config").show();
$(".openConfig").hide();
});

function getNextColor(count)
{
var back = ["blue","gray","purple","pink","yellow","skyblue","white","orange","lightgreen","maroon"];
  return back[count];
}

function getNextDefaultKeys(count)
{
var back = [["A","S"],["O","P"],["1","2"],["T","Y"],["N","M"]];
if(count>back.length)
{
return ["a","b"];
}
return back[count];
}

function redrawConfig() {
	$("#playerConfig").html("");
	$(players).each(function(pInd,pElem){
		AddKnownPlayer(pElem);
	});
}

function scrapeConfig () {
//players=[];
$("#playerConfig").children("tr").each(function(ind,elem){
var exists=null;
$(players).each(function(pIndex,pElem){
	if(pElem.color==getNextColor(ind)){exists=pIndex;}
});
if(exists!=null)
{
    players[exists].name=$(elem).find(".nameField")[0].value;
    players[exists].left=$(elem).find(".keyField")[0].innerHTML;
    players[exists].right=$(elem).find(".keyField")[1].innerHTML;
}
else
{
    var player = {
    "connectionId":connectionId,
    "color":getNextColor(ind),
    "name":$(elem).find(".nameField")[0].value,
    "left":$(elem).find(".keyField")[0].innerHTML,
    "right":$(elem).find(".keyField")[1].innerHTML,
    "x":0,
    "life":50.0,
    "strength":10.0,
    "items":[]
    };
    players.push(player);
  }
  });
  console.log(players);
}

});
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
    return result;
}

function getNum(min, max) {
    return Math.random() * (max - min) + min;
};

var roomName=findGetParameter("room");
if(roomName==null)
{
	roomName="Hanabi";
}

var playerName=findGetParameter("player");
if(playerName==null)
{
	playerName=getNum(1,1000);
}



//Hanabi
var colors=["R","B","G","Y","W","M"];
var numbers=[1,1,1,2,2,3,3,4,4,5];

var deck=[];
var players={};
var hands={};
var field=[];
var discard=[];

function afterConnect()
{
	players[playerName]=playerName;
	requestObject("returnTable","receiveTableStart");
}

function drawTable()
{
	$("#name").html("Players:");
	for (var key in players) {
		if (players.hasOwnProperty(key)) {
			$("#name").append("<div>"+players[key]+"</div>");
		}
	}
	
	$("#deck").children(".card").html(deck.length);
	
	$("#field").empty();
	for(var i=0;i<field.length;i++)
	{
		$("#field").append("<div class='card "+cardColor(field[i])+" "+cardNumberClass(field[i])+"'>"+cardNumber(field[i])+"</div>");
	}
	
	$("#hands").empty();
	for (var key in hands) {
		if (hands.hasOwnProperty(key)) {
			
			$("#hands").append("<div id='Hand-"+playerName+"' class='zone'>My Hand: </div>");
			if(!(key==playerName)){
				var name="Player "+key;
				if(players[key]!=null)
				{
					name=players[key];
				}
				$("#hands").append("<div id='Hand-"+key+"' class='zone'>"+name+"</div>");
			}
			
			for(var i=0;i<hands[key].length;i++)
			{
				printCard("#Hand-"+key,hands[key][i],playerName==key);//cardNumberClass(hands[key][i]),cardNumber(hands[key][i]),cardColor(hands[key][i]),playerName==key);
			}	
		}
	}
}

function printCard(hand,card,isMine)//numberClass,numberValue,colorClass,isMine)
{
	var numberClass=cardNumberClass(card);
	var numberValue=cardNumber(card);
	var colorClass=cardColor(card);
	if(isMine)
	{
		var card = $("<div>",{"class":"card back "+numberClass});
		var number = $("<div>",{"class":"number"});
		number.html("?");
		var play = $("<div>",{"class":"play"});
		play.html("Play");
		var discard = $("<div>",{"class":"discard"});
		discard.html("Discard");
		card.append(number);
		card.append(play);
		card.append(discard);
		
		$(hand).append(card);
	}
	else
	{
		var card = $("<div>",{"class":"card "+colorClass+" "+numberClass});
		var number = $("<div>",{"class":"number"});
		number.html(numberValue);
		var play = $("<div>",{"class":"color-hint"});
		play.html("Color");
		var discard = $("<div>",{"class":"number-hint"});
		discard.html("Number");
		card.append(number);
		card.append(play);
		card.append(discard);
		
		$(hand).append(card);
	}
}

function cardColor(card)
{
	var colorCode=card.substring(0,1);
	switch(colorCode){
		case "R":
			return "Red";
		case "B":
			return "Blue";
		case "G":
			return "Green";
		case "Y":
			return "Yellow";
		case "W":
			return "White";
		case "M":
			return "Rainbow";
		default:
			return "Back";
	}
}

function cardNumberClass(card)
{
	var colorCode=card.substring(1,2);
	switch(colorCode){
		case "1":
			return "One";
		case "2":
			return "Two";
		case "3":
			return "Three";
		case "4":
			return "Four";
		case "5":
			return "Five";
	}
}

function cardNumber(card)
{
	var number=card.substring(1,2);
	return number;
}







function returnTable()
{
	var table={};
	table.deck=deck;
	table.players=players;
	table.hands=hands;
	table.field=field;
	table.discard=discard;
	return table;
}

function sendTable()
{
	pushObject(returnTable(), "receiveTable");
	drawTable();
};

function receiveTableStart(table)
{
	receiveTable(table);
	players[playerName]=playerName;
	sendTable();
}

function receiveTable(table)
{
	deck=table.deck;
	players=table.players;
	hands=table.hands;
	field=table.field;
	discard=table.discard;
	drawTable();
}

function generateDeck(){
	deck=[];
	for(var i=0;i<colors.length;i++)
  {
  	for(var y=0;y<numbers.length;y++)
    {
    	deck.push(colors[i]+numbers[y]);
    }
  }
	sendTable();
  console.log(deck);
};

function shuffleDeck(){
	var cardCount=deck.length;
  for(var i=0;i<1000;i++)
  {
  	var pos1=Math.floor(getNum(0,cardCount));
  	var c1=deck[pos1];
    var pos2=Math.floor(getNum(0,cardCount));
    var c2=deck[pos2];
    deck[pos1]=c2;
    deck[pos2]=c1;
  }
	sendTable();
  console.log(deck);
};

function drawCard(){
	if(hands[playerName]==undefined)
	{
		hands[playerName]=[];
	}
		
hands[playerName].push(deck.pop());
sendTable();
console.log(hands);
};

function discardCard(){
	if(hands[playerName]==undefined)
	{
		hands[playerName]=[];
	}
discard.push(hands[playerName].pop());
sendTable();
console.log(hands);
};

function playCard(){
	if(hands[playerName]==undefined)
	{
		hands[playerName]=[];
	}
field.push(hands[playerName].pop());
sendTable();
console.log(hands);
};

init(roomName,afterConnect);

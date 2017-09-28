var cameraSelected=false;
var playersSelected=false;
var startUpPhaseID=0;
//0=select camera
//1=take a picture of all other players
//2=wait for all players to finish taking pictures
//3=starting game

var roomID;
var phaseID;
var playerID;

var otherPlayers = [];
var otherPlayerCount = 0;
var connectedPlayers = 1000;

var url="://php-robertclaus.rhcloud.com/test3.php?query="
if (location.protocol === 'https:') {
    url="https"+url;
}
else
{
    url="http"+url;
}



function startGame()
{
		//Initialize player
		var playerInsert = "INSERT INTO MafiaPlayers (playerID,currentRoom,role,active,target) Values (NULL,NULL,NULL,0,NULL);";
		var playerQuery = "SELECT playerID FROM MafiaPlayers WHERE active=0 LIMIT 1;";
		$.ajax({url:url+playerInsert,
			dataType:'json',
			async:false,
			success:function(result){
				$.ajax({url:url+playerQuery,
					dataType:'json',
					async:false,
					success:function(result){
						playerID = result[0];
						var playerGrab = "UPDATE MafiaPlayers SET active=1 WHERE playerID="+playerID;
						
						$.ajax({url:url+playerGrab,
							dataType:'json',
							success:function(result){
							}
						});
						window.addEventListener("beforeunload", onClose, false);
					}
				});
			}
		});

		//get The current roomID
		getRoom();

		//Room selector field
		document.querySelector('#room').addEventListener('blur', function(e) {
			getRoom();
		});


		//Next Step Blinking
		(function blink() { 
		  if(startUpPhaseID==0)
		  {
			document.querySelector('#instructions').innerHTML = "Select a camera and room to use.";
			$('#room').fadeTo(450,0).fadeTo(450,1);
		  	$('.select').fadeTo(500,0).fadeTo(500, 1, blink); 
		  }
		  else
		  {
			startUpPhaseID=1;
			$('.selectButton').fadeTo(500,0).fadeTo(500, 1, blinkSelectButton);
			document.querySelector('#instructions').innerHTML = "Snap a picture of every other player.";
		  }
		})();
		function blinkSelectButton() { 
		  if(startUpPhaseID==1)
		  {
		  	$('.selectButton').fadeTo(500,0).fadeTo(500, 1, blinkSelectButton); 
		  }
		};

	//Name Selector
	document.querySelector('#name').addEventListener('blur', function(e) {
		console.log(e);
		var query = "UPDATE  MafiaPlayers SET  name= '"+e.target.innerHTML+"' WHERE  playerID ="+playerID;
		runQuery(query);
	});

	//Select Players
	document.querySelector('#selectButton').addEventListener('click', function(e) {
		//alert("Player ID: "+playerID+"  RoomID: "+roomID);
		if(startUpPhaseID==1 && roomID!=-1)
		{
			otherPlayerCount++;
			var player = {"id":otherPlayerCount, "angle":direction, "image": lastRectctx.getImageData(0, 0, 200, 200)};
			otherPlayers.push(player);
			var playerCountQuery = url+"SELECT playerID FROM MafiaPlayers WHERE currentRoom="+roomID;
			$.ajax({url:playerCountQuery,
					dataType:'json',
					async:false,
					success:function(result){
						connectedPlayers = result.length;
					}
			});
			document.querySelector('#instructions').innerHTML = "Selected "+otherPlayers.length + " players out of " +(connectedPlayers-1) +" others.";
			//alert("picked "+otherPlayers.length+" of "+connectedPlayers);

			if(otherPlayers.length +1 >= connectedPlayers)
			{
				startUpPhaseID=2;
				window.setInterval(updateFaceRepeat, 1000);

				for(var i =0; i<otherPlayers.length; i++)
				{
					var query = url + "INSERT INTO MafiaPlayerAngles (id, mainPlayer, secondPlayer, angle) VALUES (NULL, '"+playerID+"' , NULL, '"+Math.floor(otherPlayers[i].angle)+"')";
					$.ajax({url:query,
						dataType:'json',
						async:false,
						success:function(result){}
					});
				}

				setTimeout(waitForAllAngles, 1000);
			}
		}
		else if(startUpPhaseID==3)
		{
			var tempDirection = direction;
			var minPlayer = -1;
			var minPlayerDirection = -1;
			var minDirectionDiff=1000;
			for(var i=0;i<otherPlayers.length;i++)
			{
				//dir-player or dir + (180-player) or player + (180-dir) or player-dir
				var directionDiff = Math.abs(tempDirection-otherPlayers[i].angle);
				if(directionDiff < minDirectionDiff)
				{
					minPlayer = i;
					minDirectionDiff = directionDiff;
					minPlayerDirection=otherPlayers[i].angle;
				}
				directionDiff = 360 - directionDiff;
				if(directionDiff < minDirectionDiff)
				{
					minPlayer = i;
					minDirectionDiff = directionDiff;
					minPlayerDirection=otherPlayers[i].angle;
				}
			}
			//alert("About to place picture");
			currentFacectx.putImageData(otherPlayers[minPlayer].image,0,0,0,0,200,200);

			alert("Player "+minPlayer +"    Player Direction: "+minPlayerDirection+"      Focused Direction: "+tempDirection);
			var selectQuery = "UPDATE MafiaPlayers SET target="+otherPlayers[minPlayer].player+" WHERE playerID="+playerID;
			runQuery(selectQuery);
			
			var countTargetsQuery = "SELECT Count(DISTINCT playerID) FROM MafiaPlayers WHERE ISNULL(target) AND currentRoom="+roomID;
			var playerCount = runQuery(countTargetsQuery);
			console.log(playerCount);
			playerCount=playerCount[0];
			if(playerCount=="0")
			{
				alert("resolving round");
				checkRoles();
				resolveRound();
			}
			updatePlayers();
			
		}
	});
}

function checkRoles()
{
	var setAllToVillager = "UPDATE MafiaPlayers SET role=1 WHERE currentRoom="+roomID;
	runQuery(setAllToVillager);
}

function resolveRound()
{
	var events=[];
				var fullTargetsQuery = "SELECT playerID,role,target FROM MafiaPlayers WHERE currentRoom="+roomID;
				var results = runQuery(fullTargetsQuery);
				for(var i=0;i<results.length;i=i+3)
				{
					console.log("player"+results[i]);
					var currentEvent;
					for(var j=0;j<events.length;j++)
					{
						if(events[j].type==results[i+1])
						{
							currentEvent=events[j];
						}
					}
					if(currentEvent==undefined)
					{
						newEvent={};
						newEvent.type = results[i+1];
						newEvent.targets = [];
						events.push(newEvent);
						currentEvent=newEvent;
					}
					var correctTarget;
					for(var k=0;k<currentEvent.targets.length;k++)
					{
						if(currentEvent.targets[k].player==results[i+2])
						{
							correctTarget=currentEvent.targets[k];
						}
					}
					if(correctTarget==undefined)
					{
						newTarget ={};
						newTarget.player = results[i+2];
						newTarget.votes = 1;
						newEvent.targets.push(newTarget);
						correctTarget=newTarget;
					}
					else
					{
						correctTarget.votes++;
					}
				}
				console.log("starting votes");
				for(var i=0;i<events.length;i++)
				{
					var mostVotes=0;
					var finalTarget;
					for(var j=0;j<events[i].targets.length;j++)
					{
						if(events[i].targets[j].votes>mostVotes)
						{
							mostVotes=events[i].targets[j].votes;
							finalTarget= events[i].targets[j];
						}
						
					}
					console.log(event[i]);
					console.log(finalTarget);
					resolveVote(events[i].type, finalTarget);
				}

			var nextRoundQuery = "UPDATE MafiaPlayers SET target=NULL WHERE currentRoom="+roomID;
			runQuery(nextRoundQuery);
}

function resolveVote(typeOfEvent,target)
{
	if(typeOfEvent==2)// && phaseID==1)
	{
		var killPlayerQuery = "UPDATE MafiaPlayers SET dead=true WHERE playerID="+target.player;
		runQuery(killPlayerQuery);
	}
	if(typeOfEvent==1 )//&& phaseID==2)
	{
		var killPlayerQuery = "UPDATE MafiaPlayers SET dead=true WHERE playerID="+target.player;
		runQuery(killPlayerQuery);
	}
}

function getRoom()
{
var roomName = document.getElementById("room").innerHTML;

			var roomQuery = url+"SELECT id, currentPhase FROM MafiaRooms WHERE name='"+roomName+"'";
		  		$.ajax({url:roomQuery,
					dataType:'json',
					success:function(result){
						if(result.length<1)
						{
							var query=url+"INSERT INTO MafiaRooms (id,name,currentPhase) Values (NULL,'"+roomName+"',1)";
							$.ajax({url:query,
							dataType:'json'});

							$.ajax({url:roomQuery,
								dataType:'json',
								success:function(result){
									if(result.length<1)
									{
										alert("Error: No room found/generated.");
										return;
									}
									roomID=result[0];
									phaseID=result[1];

									var currentRoomQuery = url+ "UPDATE MafiaPlayers SET currentRoom="+roomID+" WHERE playerID="+playerID;
									$.ajax({url:currentRoomQuery,
										dataType:'json',
										success:function(result){
										}
									});
								}
							});
							return;
						}
						roomID=result[0];
						phaseID=result[1];
									var currentRoomQuery = url+ "UPDATE MafiaPlayers SET currentRoom="+roomID+" WHERE playerID="+playerID;
									$.ajax({url:currentRoomQuery,
										dataType:'json',
										success:function(result){
										}
									});
		 			}
				});
}

var doFaceUpdate=true;

function updateFaceRepeat()
{
updateFace();

}

function updateFace()
{
if(doFaceUpdate)
{

	if(startUpPhaseID>1)
	{
			updatePlayers();
			var tempDirection = direction;
			var minPlayer = -1;
			var minPlayerDirection = -1;
			var minDirectionDiff=1000;
			for(var i=0;i<otherPlayers.length;i++)
			{
				//dir-player or dir + (180-player) or player + (180-dir) or player-dir
				var directionDiff = Math.abs(tempDirection-otherPlayers[i].angle);
				if(directionDiff < minDirectionDiff)
				{
					minPlayer = i;
					minDirectionDiff = directionDiff;
					minPlayerDirection=otherPlayers[i].angle;
				}
				directionDiff = 360 - directionDiff;
				if(directionDiff < minDirectionDiff)
				{
					minPlayer = i;
					minDirectionDiff = directionDiff;
					minPlayerDirection=otherPlayers[i].angle;
				}
			}
			//alert("About to place picture");
			currentFacectx.putImageData(otherPlayers[minPlayer].image,0,0,0,0,200,200);
			console.log("dead: "+otherPlayers[minPlayer].dead);
			if(otherPlayers[minPlayer].name!=undefined)
			{
				document.getElementById("otherPlayerData").innerHTML = "Name: "+otherPlayers[minPlayer].name+"     Status:"+otherPlayers[minPlayer].dead;		
			}	
			else
			{
				document.getElementById("otherPlayerData").innerHTML = "No name entered.";
			}
	}
}	
}

function onClose(e)
{
						console.log("Closing");
							var playerUnGrab = "UPDATE MafiaPlayers SET active=0, currentRoom=NULL, name=NULL, target=NULL WHERE playerID="+playerID;
							$.ajax({url:url+playerUnGrab,
							dataType:'json',
							async:false,
							success:function(result){
							}
							});
							var deletePlayerAngles = "DELETE FROM MafiaPlayerAngles WHERE mainPlayer ="+playerID;
							$.ajax({url:url+deletePlayerAngles,
							dataType:'json',
							async:false,
							success:function(result){
							}
							});
						return null;
}

var mapped= false;
var timer = 0;
function waitForAllAngles()
{
	if(!mapped)
	{
	var countAnglesQuery = "SELECT Count(Distinct id), Count(Distinct mainPlayer) FROM MafiaPlayerAngles INNER JOIN MafiaPlayers AS mp ON mainPlayer=mp.playerID WHERE mp.currentRoom="+roomID;
	var returnedItems=runQuery(countAnglesQuery);
	var anglesSelected = returnedItems[0];
	var readyPlayers= returnedItems[1];
	if(anglesSelected == readyPlayers*(readyPlayers-1))
	{
		mapPlayers();
		document.querySelector('#instructions').innerHTML="Mapped all players.";
		mapped=true;
		startUpPhaseID=3;
	}
	else
	{
		document.querySelector('#instructions').innerHTML="Waiting for other players.  "+(readyPlayers)+" players ready."+timer;
		timer++;
		setTimeout(waitForAllAngles, 1000);
	}
	}
	else
	{
		//document.querySelector('#instructions').innerHTML="Should be mapped.";

	}

}

function runQuery(query)
{
	var returnVal;
							$.ajax({url:url+query,
							dataType:'json',
							async:false,
							success:function(result){
							returnVal=result;
							}
							});
	return returnVal;
}




















function mapPlayers()
{

var room = roomID;
//var room = 22;
var threshold = 20;

var playerAngles = [];
var matchQuery = 
"SELECT mainPlayer,angle,id,name FROM MafiaPlayerAngles AS p "+
"INNER JOIN MafiaPlayers AS p1 ON p.mainPlayer = p1.playerID AND p1.currentRoom="+room;
$.ajax({url:url+matchQuery,
	dataType:'json',
	async:false,
	success:function(result){
		console.log(result);

		for(var i=0;i<result.length;i=i+4)
		{
			var playerAngle = {};
			playerAngle.player = result[i];
			playerAngle.angle = result[i+1];
			playerAngle.angleID = result[i+2];
			playerAngle.name = result[i+3];
			playerAngles.push(playerAngle);
		}
	}
});



otherPlayers = matchPlayersByAverageAngles(otherPlayers,playerAngles);
alert("mapped");
//matchPlayersByAngleCombination(otherPlayers,playerAngles);
}

function debugOtherPlayers(playerAngles)
{
	pID=97;
	//Generate otherPlayers for debug
	otherPlayers=[];
	var count=0;
	for(var i=0;i<playerAngles.length;i++)
	{
		if(playerAngles[i].player==pID)
		{
			otherPlayers[count]={};
			otherPlayers[count].angle=playerAngles[i].angle;	
			count++;
		}
	}
	return otherPlayers;
}


function matchPlayersByAverageAngles(otherPlayers,playerAngles)
{

	//otherPlayers = debugOtherPlayers(playerAngles);


	//players
	//player = playerID
	//angles = array of angles
	//angleCount = number of Angles
	//averageAngle = average Angle Value

	var players =[];
	var playerCount = 0;
	var playerIndex =[];
	for(var i=0; i<playerAngles.length;i++)
	{
		if(playerIndex[playerAngles[i].player]==undefined)
		{
			playerIndex[playerAngles[i].player]=playerCount;
			players[playerCount]={};
			players[playerCount].player = playerAngles[i].player;
			players[playerCount].angles = [];
			players[playerCount].angles.push(playerAngles[i].angle);
			players[playerCount].angleCount = 1;
			players[playerCount].averageAngle = parseInt(playerAngles[i].angle);
			players[playerCount].name = playerAngles[i].name;
			playerCount++;
		}
		else
		{
			var oldAverage = players[playerIndex[playerAngles[i].player]].averageAngle;
			var oldCount = players[playerIndex[playerAngles[i].player]].angleCount;
			var newCount = oldCount+1;
			players[playerIndex[playerAngles[i].player]].angleCount = newCount;
			players[playerIndex[playerAngles[i].player]].angles.push(playerAngles[i].angle);
			players[playerIndex[playerAngles[i].player]].averageAngle = ((oldAverage*oldCount) + parseInt(playerAngles[i].angle))/newCount;
		}
	}
	
	//place yourself at [0] as a reference point
	for(var j=0; j<players.length;j++)
	{
		if(players[j]!=undefined && players[j].player == playerID)
		{
			var swapPlayer = players[0];
			players[0]=players[j];
			players[j]=swapPlayer;
		}
	}


	//sort into clockwise order from yourself as [0]
	for(var j=1; j<players.length; j++)
	{
		if(players[j]!=undefined)
		{
		for( var k=j+1; k<players.length; k++)
		{
			if(players[k]!=undefined && afollowsb(players[j].averageAngle,players[k].averageAngle,players[0].averageAngle))
			{
				var jplayer = players[j];
				var kplayer = players[k];
				players[j] = kplayer;
				players[k] = jplayer;
			}
		}
		}
	}

	//Players are now in clockwise order in the players array starting with yourself
	
	//grab opposite of average angle

	var backAngle = players[0].averageAngle + 180;
	if(backAngle>360)
	{
		backAngle=backAngle-360;
	}

	//remove self from array
	players.splice(0,1);

	//Sort players you saw (otherPlayers) in clockwise order starting with the backAngle (so left to right)
	for(var j=0; j<otherPlayers.length; j++)
	{
		for(var k=j+1; k<otherPlayers.length; k++)
		{
			if(afollowsb(otherPlayers[j].angle,otherPlayers[k].angle,backAngle))
			{
				var jplayer = otherPlayers[j];
				var kplayer = otherPlayers[k];
				otherPlayers[j] = kplayer;
				otherPlayers[k] = jplayer;
			}
		}
	}
	console.log(players);
	console.log(otherPlayers);


	//Attach playerID to otherPlayers
	for(var i=0; i<players.length; i++)
	{
		otherPlayers[i].player = players[i].player;
		otherPlayers[i].name = players[i].name;
	}

	//debug
	console.log(otherPlayers);
	return otherPlayers;
}

function afollowsb(a,b,start)
{
	if(((b>a)&&(b>start))||((b<a)&&(b<start)))
	{
		return true;
	}
	return false;
}

function updatePlayers()
{
	var updatePlayerQuery="SELECT playerID,name,dead FROM MafiaPlayers WHERE currentRoom="+roomID;
	var result = runQuery(updatePlayerQuery);
	for(var i=0;i<result.length;i=i+3)
	{
		for(var j=0;j<otherPlayers.length;j++)
		{
			if(otherPlayers[j].player==result[i])
			{
				otherPlayers[j].name=result[i+1];
				otherPlayers[j].dead=result[i+2];
			}
		}
	}
}
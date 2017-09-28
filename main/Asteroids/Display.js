$(document).ready(function () {
	var shipSize = 20;
	var missileSize = 3;
	var dragRatio = .95;
	var rotationRate = 8;
	var thrustRate = .2;
	var missileVelocity = 8;
	var hitDistance = 10;
	var startHP = 1;
	var maxX = 400;
	var maxY = 400;
	var timeBetweenShots = 250;
	var timeBetweenFrames = 50;

	var websocket;
	var connected=false;
	function init() {
		websocket = new WebSocket(
				//"ws://robertclaus.info:80","echo-protocol");
				"ws://socket-robertclaus.rhcloud.com:8000", "echo-protocol");
		//"ws://apple.cranberry.ninja/","echo-protocol");

		websocket.onopen = function () {
			connected=true;
			console.log("connected");
			var room = {};
			room["room"] = "new";
			room["roomMode"] = "controller";
			room["amHost"] = "true";
			websocket.send("*"+JSON.stringify(room));
			$("#connected").text("Connected");
		};

		websocket.onmessage = function (evt) {
			var obj = JSON.parse(evt.data);
			if (obj.id != undefined) {
				console.log(obj);
				var iplayer = findPlayer(obj.id);
				iplayer.nextKeys = obj.keys;
				if(obj.strings.color!=undefined)
				{
					iplayer.color = "#"+obj.strings.color;
				}
				if(obj.strings.name!=undefined)
				{
					iplayer.name = obj.strings.name;
				}
			}
			console.log(players);
		};

		websocket.onerror = function(evt) { connected=false; console.log("Disconnected"); console.log(evt);
		setTimeout(resetConnection, 3000);};
		websocket.onclose = function(evt) { connected=false; console.log("Disconnected"); console.log(evt);
		setTimeout(resetConnection, 3000);};
	};

function resetConnection()
{
	$("#connected").text("Connecting...");
	if(!connected)
	{
		init();
	}
}

	var send = function send() {
		websocket.send("test");
	};
	init();

	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");

	players = [];
	missiles = [];

	setInterval(loop, timeBetweenFrames);
	var running = false;
	function loop() {
		if (running == false) {
			running = true;
			applyActions();

			movePlayers();
			moveMissiles();
			calcCollision();

			ctx.clearRect(0, 0, c.width, c.height);
			drawMissiles();
			drawPlayers();
			running = false;
		}
	}

	function addPlayer(id) {
		var newPlayer = {};
		newPlayer["angle"] = 0;
		newPlayer["v"] = 0;
		newPlayer["x"] = Math.floor(Math.random() * maxX - 50) + 50;
		newPlayer["y"] = Math.floor(Math.random() * maxX - 50) + 50;
		newPlayer["id"] = id;
		newPlayer["color"] = getRandomColor();
		newPlayer["hp"] = startHP;
		players.push(newPlayer);
		return newPlayer;
	}

	function addMissile(player) {
		var newMissile = {};
		newMissile["angle"] = player.angle;
		newMissile["v"] = missileVelocity;
		newMissile["x"] = player.x;
		newMissile["y"] = player.y;
		newMissile["id"] = player.id;
		newMissile["color"] = player.color;
		missiles.push(newMissile);
		return newMissile;
	}

	function findPlayer(id) {
		for (var i = 0; i < players.length; i++) {
			if (players[i].id == id) {
				return players[i];
			}
		}
		return addPlayer(id);
	}

	function applyKey(player) {
		for (var k in player.nextKeys)
		{
			if(player.nextKeys[k]!=true)
			{
				continue;
			}
			switch (k) {
			case "left":
				player.angle -= rotationRate;
				if (player.angle < 0) {
					player.angle += 360;
				}
				break;
			case "right":
				player.angle += rotationRate;
				if (player.angle > 360) {
					player.angle -= 360;
				}
				break;
			case "forward":
				player.v += thrustRate;
				break;
			case "fire":
				if (player["firing"] == undefined || player["firing"] <= Date.now()) {
					player["firing"] = Date.now() + timeBetweenShots;
					addMissile(player);
				}
				break;
			}
		}
	}

	function applyActions() {
		for (var i = 0; i < players.length; i++) {
			applyKey(players[i]);
		}
	}

	function movePlayers() {
		for (var i = 0; i < players.length; i++) {
			var conv = 2 * Math.PI / 360;
			var p = players[i];
			p.x += p.v * Math.cos(p.angle * conv);
			p.y += p.v * Math.sin(p.angle * conv);
			p.v = p.v * dragRatio;
			if (p.x > maxX) {
				p.x = 0;
			}
			if (p.y > maxY) {
				p.y = 0;
			}
			if (p.x < 0) {
				p.x = maxX;
			}
				if (p.y < 0) {
					p.y = maxY;
				}
			
		}
	}
	function moveMissiles() {
		for (var i = 0; i < missiles.length; i++) {

			var conv = 2 * Math.PI / 360;
			var m = missiles[i];
			if (m.x > maxX || m.y > maxY || m.x < 0 || m.y < 0) {
				missiles.splice(i, i + 1);
				return;
			}
			m.x += m.v * Math.cos(m.angle * conv);
			m.y += m.v * Math.sin(m.angle * conv);
			m.v = m.v;
		}
	}

	function drawPlayers() {

		for (var i = 0; i < players.length; i++) {
			drawTriangle(players[i].x, players[i].y, players[i].angle, players[i].color);
			if(players[i].name!=undefined)
			{
				drawString(players[i].x,players[i].y,players[i].name,players[i].color);
			}
		}
	}

	function drawMissiles() {
		for (var i = 0; i < missiles.length; i++) {
			drawCircle(missiles[i].x, missiles[i].y, missiles[i].color);
		}
	}

	function drawCircle(x, y, color) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, missileSize, 0, 2 * Math.PI);
		ctx.fill();
	}
	
	function drawString(x,y,str,color)
	{
		ctx.font="10px Georgia";
		ctx.fillStyle = color;
		ctx.fillText(str,x+10,y-10);
	}

	function drawTriangle(x, y, a, color) {
		var length = shipSize;
		var conv = 2 * Math.PI / 360;

		var dx = length * Math.cos(a * conv);
		var dy = length * Math.sin(a * conv);
		var perpA = a - 90;
		var dxp = length * .3 * Math.cos(perpA * conv);
		var dyp = length * .3 * Math.sin(perpA * conv);
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(x + dx, y + dy);
		ctx.lineTo(x + dxp, y + dyp);
		ctx.lineTo(x - dxp, y - dyp);
		ctx.fill();
	}

	function getRandomColor() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	function calcCollision() {
		for (var i = 0; i < missiles.length; i++) {
			for (var j = 0; j < players.length; j++) {
				if (missiles[i] != undefined && players[j] != undefined && missiles[i].id != players[j].id) {
					var m = missiles[i];
					var p = players[j];
					var mppx = m.x - p.x;
					var mppy = m.y - p.y;
					var distance = Math.sqrt(Math.pow(mppx, 2) + Math.pow(mppy, 2));
					if (distance < hitDistance) {
						players[j].hp--;
						
						if (players[j].hp <= 0) {
							players.splice(j, 1);
							var scoreString='{"id":"'+missiles[i].id+'","scored":"1"}';
							console.log(scoreString);
							websocket.send(scoreString);
						}
						
						missiles.splice(i, 1);
					}
				}
			}
		}
	}

});

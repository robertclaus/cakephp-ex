//Todo - placing set temperatures
//Todo - placing custom transfer coefficients


var canvas;
var context;
var count=0;
var running = 1;
var cellsize = 10;
var field;
var physics; // {steadyTemperature:##, transferCoefficient:##}
var water;
var newwater;
var ascii=true;
var mousex=0;
var mousey=0;
var dr = false;
var heat;
var clickMode = 1; //1=heat, 2=cool, 3=physics
var running = false;
var defaultTransferCoefficient=.14;
var clickFunction= function(mousex,mousey){addheat(mousex,mousey,10);};

var maxCellx;
var maxCelly;

window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
var reqId_ = null;
(function callback(time)
{ // time is the Unix time.
  // move element.
  reqId_ = window.requestAnimationFrame(callback);
})();

function draw(time)
{
	if(!running) return false;
	GaussSeidel2D();
	drawfield();
	
	
	window.requestAnimationFrame(draw, canvas);
}

function GaussSeidel2D()
{
	totalHeat=0;
	totalTemp=0;
	newField=Array.matrix(canvas.width,canvas.height,0);
    for(var i=1;i<canvas.width/cellsize;i++)
	{
        for(var j=1;j<canvas.height/cellsize;j++)
		{
			normalizationFactor=1;
            newField[i][j] = 
			normalizationFactor*1.0*(
				field[i][j]
				+transfer(i,j,i-1,j)*(field[i-1][j]-field[i][j])
				+transfer(i,j,i+1,j)*(field[i+1][j]-field[i][j])
				+transfer(i,j,i,j-1)*(field[i][j-1]-field[i][j])
				+transfer(i,j,i,j+1)*(field[i][j+1]-field[i][j]))
			+ heat[i][j];

			if(physics[i][j].steadyTemperature)
			{
				newField[i][j]=physics[i][j].steadyTemperature;
			}
			
			totalHeat+=heat[i][j];
			totalTemp+=field[i][j];
		}
	}
	console.log(totalHeat);
	console.log(totalTemp);
	field=newField;
}

function transfer(i1,j1,i2,j2)
{
	var t1 = physics[i1][j1].transferCoefficient;
	var t2 = physics[i2][j2].transferCoefficient;
	
	if(!t1)
	{
		t1=defaultTransferCoefficient;
	}
	if(!t2)
	{
		t2=defaultTransferCoefficient;
	}
	
	if(i1==0||i2==0||j1==0||j2==0 || i1==maxCellx || i2==maxCellx || j1==maxCelly || j2==maxCelly)
	{
		return 0;
	}
	
	return Math.min(t1,t2);
}

function startStop()
{
	if(running)
	{
		running = false;
		settext(10,20,"Stopped");
	}
	else
	{
		running = true;
		draw();
	}
}



function drawfield()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	if(dr)
		clickFunction(mousex,mousey);
	
	for(var x=0;x < canvas.width;x+=cellsize)
		for(var y=0;y < canvas.height;y+=cellsize)
		{
			var cellx = Math.round((x/cellsize));
			var celly = Math.round((y/cellsize));
			var c = Math.round(field[cellx][celly]);
			var b = 0;
			
			if(c>255)
            {
                c = 255;
                //b = c;
            }
            else if(c<0)
            {
                b = c*-1;
                c = 0;
                if(b>255)b=255;
                else if(b<0)b=0;
            }
            
            if(ascii)
            {
				if(physics[cellx][celly].transferCoefficient)
				{
					makeCell(x,y,"#"+RGBtoHex(c,b,255-(physics[cellx][celly].transferCoefficient*255)));
				}
				else{
				makeCell(x,y,"#"+RGBtoHex(c,b,0));
				//console.log("#"+RGBtoHex(c,b,0));
				}
            }
            else
            {
                //g.setColor(Color.black);
                //g.drawString(""+(int)world[cellx][celly], j, i);
				settext(x,y,Math.round(field[cellx][celly]));
            }
			if(Math.abs(heat[cellx][celly])<1)
			{
				heat[cellx][celly]*=.1;//0.09;
			}
			else if(heat[cellx][celly]>0)
			{
				heat[cellx][celly]-=5;
			}
            else if(heat[cellx][celly]<0)
			{
				heat[cellx][celly]+=5;
			}
		}
	
	//setTimeout("drawfield()",5);
}

function makeCell(x,y,color)
{
	context.beginPath();
	context.rect(x, y, cellsize, cellsize);
    context.fillStyle = color;
    context.fill();
}

function placeCell(x,y,color)
{
	var fieldx = Math.floor(x/cellsize)*cellsize;
	var fieldy = Math.floor(y/cellsize)*cellsize;
	makeCell(fieldx,fieldy,color);
}

function manageClick(x,y)
{
	var fieldx = Math.floor(x/cellsize)*cellsize;
	var fieldy = Math.floor(y/cellsize)*cellsize;
	field[fieldx][fieldy] = 1;
	makeCell(fieldx,fieldy,"#FF0000");
}

function settext(x,y,text)
{
	context.font = "8pt Arial";
	context.fillStyle = "#ffffff";
    context.fillText(text, x, y);
}

function addheat(x,y,h)
{
	var cellx = Math.floor((x/cellsize));
	var celly = Math.floor((y/cellsize));
	
	
	heat[cellx][celly]+=h;
}

function removeheat(x,y,h)
{
	var cellx = Math.floor((x/cellsize));
	var celly = Math.floor((y/cellsize));
	
	heat[cellx][celly]-=h;
}

function setTransferCoefficient(x,y,h)
{
	var cellx = Math.floor((x/cellsize));
	var celly = Math.floor((y/cellsize));
	physics[cellx][celly].transferCoefficient=h;
}

function setSteadyTemperature(x,y,h)
{
	var cellx = Math.floor((x/cellsize));
	var celly = Math.floor((y/cellsize));
	physics[cellx][celly].steadyTemperature=h;
}

function init()
{
	canvas.width  = 580; //window.innerWidth
	canvas.height = 600; //window.innerHeight
	
	field = Array.matrix(canvas.width,canvas.height,0);
	heat = Array.matrix(canvas.width,canvas.height,0);
	physics = Array.matrix(canvas.width,canvas.height,0);
	
	maxCellx=Math.floor(canvas.width/cellsize);
	maxCelly=Math.floor(canvas.height/cellsize);
	
	for(var x=0;x < canvas.width;x+=cellsize)
		for(var y=0;y < canvas.height;y+=cellsize)
		{
			var cellx = Math.floor((x/cellsize));
			var celly = Math.floor((y/cellsize));
			field[cellx][celly] = 0;
			heat[cellx][celly] = 0;
			physics[cellx][celly]={};
		}
	draw();
	
	canvas.onmousemove = function(e)
	{
		var mx = (e.clientX-canvas.offsetLeft),
			my = (e.clientY-canvas.offsetTop);
			
			mousex = mx;
			mousey = my;
			
		//if(draw)
		//	manageClick(mx,my);
	};
	
	window.onkeypress = function(e)
	{
		
		var charStr = String.fromCharCode(e.which);
		//console.log("key:"+charStr);
		
		switch(charStr)
		{
			case 'a':
				if(ascii) ascii=false;
				else ascii=true;
			break;
			
			case 'h':
				clickFunction= function(mousex,mousey){addheat(mousex,mousey,10);};
			break;
			
			case 'c':
				clickFunction= function(mousex,mousey){removeheat(mousex,mousey,-10);};
			break;
			
			case 'w':
				clickFunction= function(mousex,mousey){setTransferCoefficient(mousex,mousey,.007);};
			break;
			
			case 't':
				clickFunction= function(mousex,mousey){setSteadyTemperature(mousex,mousey,500);};
			break;
		}
	};
	
	canvas.onmousedown = function(e)
	{
		dr = true;
		//console.log("dr:true");
	};
	
	canvas.onmouseup = function(e)
	{
		dr=false;
		//console.log("dr:false");
	};
}

function RGBtoHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(N) {
 if (N==null) return "00";
 N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 return "0123456789ABCDEF".charAt((N-N%16)/16)
      + "0123456789ABCDEF".charAt(N%16);
}


window.onload = function()
{
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
	init();
};


Array.matrix = function (m, n, initial)
{
    var a, i, j, mat = [];
    for (i = 0; i < m; i += 1) {
      a = [];
      for (j = 0; j < n; j += 1) {
        a[j] = 0;
      }
      mat[i] = a;
    }
    return mat;
};
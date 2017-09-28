var trackStart = [];

$(document).mousemove(function(e){
    $(".tint").css({left:e.pageX+5, top:e.pageY+5});
});

window.onload = functionA;

function functionA() {
    var htmltext = "";
    var fieldcount = 8;
    for (var j = 4; j > -1; j--) {
        for (var i = 0; i < fieldcount; i++) {

            htmltext = htmltext + "<button id='"+i+"."+j+"' onClick='addCamel(" + i + "," + j + ")' style='float:left;height:50px;width:50px'>" /*+ j + "," + i */+ "</button>";

        }
        htmltext = htmltext + "<button id='"+fieldcount+"."+j+"' onClick='addCamel(" +/* fieldcount + "," + j +*/ ")' style='height:50px;width:50px'>" +/* j + "," + fieldcount +*/ "</button><br>";
    }
    
    
    
    for (var i = 0; i < fieldcount; i++) {
        htmltext = htmltext + "<button class='desert' style='float:left;height:10px;width:50px'>-</button>";
    }
    htmltext = htmltext + "<button class='desert' style='height:10px;width:50px'>-</button>";
    document.getElementById("boxer").innerHTML = htmltext;
}

function addCamel(spot, level) {

    for (var i = 0; i < trackStart.length; i++) {
        var tindex = trackStart[i].indexOf(selectedColor);
        if (tindex > -1) {
            trackStart[i].splice(tindex, 1);
        }
    }
    for(i=0;i<9;i++)
    {
               for(var j=0;j<5;j++)
    		{
 if(document.getElementById(""+i+"."+j).style.backgroundColor==selectedColor)
           {
 document.getElementById(i+"."+j).style.backgroundColor="";
 $("#"+i+"\\."+j).toggleClass("selectedButton");
 console.log("#"+i+"\\."+j);
           }
        }
    }
    
    document.getElementById(""+spot+"."+trackStart[spot].length).style.backgroundColor = selectedColor;
 $("#"+spot+"\\."+trackStart[spot].length).addClass("selectedButton");

    //alert(selectedColor+" camel added to "+spot);

    if (trackStart[spot] === 'undefined') {
        trackStart[spot] = [];
    }
    trackStart[spot].push(selectedColor);

    //document.getElementById("debug2").innerHTML = trackStart;
    
    myFunction();
}

var selectedColor = 'red';

function selector(color) {
    selectedColor = color;
    //document.getElementById("debug2").innerHTML = trackStart;
    $(".tint").css( "background-color", color);
}

$(document).mousemove(function(e){
    $("#image").css({left:e.pageX+10, top:e.pageY});
});

var camels = ['red', 'white', 'blue', 'yellow', 'green'];
var wins = [0, 0, 0, 0, 0];
var trackStart = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    ['red','white','blue','yellow','green'],
    [],
    []

];


function myFunction() {

    var pick;
    var roll;
    var spot;
    var level;
    var currentCamel;
    var track;
    var i;
    var j;
    var k;
    var l;

    var camelsToGo;

    var test = [1, 2, 3, 4, 5];
    var permutations = permute(test);
    for (i = 0; i < permutations.length; i++) {
        //document.getElementById("debug3").innerHTML = document.getElementById("debug3").innerHTML+"<br>"+permutations[i]+"  - "+permutations.length;
    }
    var runs = 5000; //permutations.length*234;
    var onPerm = 0;
    for (onPerm = 0; onPerm < runs; onPerm++) {
        track = [];
        for (i = 0; i < trackStart.length; i++) {
            track[i] = [1];
            for (j = 0; j < trackStart[i].length; j++) {
                if (trackStart[i][j] != "Undefined") {
                    track[i][j] = trackStart[i][j].slice(0);
                }
            }
        }
        //document.getElementById("debug3").innerHTML = document.getElementById("debug3").innerHTML + "<br>" + track;
        for (i = track.length; i <= 50; i++) {
            track[i] = [];
        }
        camelsToGo = [];
        for (i = 0; i < camels.length; i++) {
            camelsToGo[i] = camels[i].slice(0);
        }

        for (var p = 0; p < 5; p++) {
            pick = Math.floor(Math.random() * camelsToGo.length);

            roll = Math.floor(Math.random() * 3) + 1;

            spot = -1;
            level = -1;

            currentCamel = camelsToGo[pick];
            //currentCamel="blue";
            //roll=1;
            camelsToGo.splice(camelsToGo.indexOf(currentCamel), 1);

            //document.getElementById("camel").innerHTML = currentCamel;
            for (i = 0; i < track.length; i++) {

                if (track[i].indexOf(currentCamel) > -1) {

                    spot = i;

                    level = track[i].indexOf(currentCamel);

                }
            }
            //document.getElementById("roll").innerHTML = roll;
            var camelUnit = track[spot].slice(level, track[spot].length);


            track[spot].splice(level, 5);
            if (track[spot + roll] == "undefined") {
                track[spot + roll] = camelUnit;
            } else {
                for (i = 0; i < camelUnit.length; i++) {
                    track[spot + roll].push(camelUnit[i]);
                }
            }
                        //document.getElementById("debug").innerHTML = document.getElementById("debug").innerHTML + "<br>" + currentCamel + "  -  " + camelsToGo.length + "   -  " + camels.length + "   -    " + track;
        }
        var winner = "";

        for (i = 0; i < track.length; i++) {
            for (j = 0; j < track[i].length; j++) {
                if(track[i][j].length>0)
                {
                winner = track[i][j];
                }
            }
        }

        wins[camels.indexOf(winner)]++;

    }

    //document.getElementById("debug2").innerHTML = "???";
    for (l = 0; l < wins.length; l++) {
        //document.getElementById("order").innerHTML = document.getElementById("order").innerHTML + "," + Math.floor((wins[l] / runs) * 100);
    }
    //document.getElementById("order").innerHTML = document.getElementById("order").innerHTML + "<br>";
    
        document.getElementById("red").innerHTML="Red - "+Math.floor((wins[0] / runs) * 100)+"%";
        document.getElementById("white").innerHTML="White - "+Math.floor((wins[1] / runs) * 100)+"%";
        document.getElementById("blue").innerHTML="Blue - "+Math.floor((wins[2] / runs) * 100)+"%";
        document.getElementById("yellow").innerHTML="Yellow - "+Math.floor((wins[3] / runs) * 100)+"%";
        document.getElementById("green").innerHTML="Green - "+Math.floor((wins[4] / runs) * 100)+"%";
    
    wins=[0,0,0,0,0];
    
}

var permArr = [],
    usedChars = [];

function permute(input) {
    var i, ch;
    for (i = 0; i < input.length; i++) {
        ch = input.splice(i, 1)[0];
        usedChars.push(ch);
        if (input.length === 0) {
            permArr.push(usedChars.slice());
        }
        permute(input);
        input.splice(i, 0, ch);
        usedChars.pop();
    }
    return permArr;
}
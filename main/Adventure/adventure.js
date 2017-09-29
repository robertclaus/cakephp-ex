var simulate=false;
var simulatedImage=1;


var url="http://cakephp-mysql-persistent-robert.7e14.starter-us-west-2.openshiftapps.com/main/Adventure/";
if(simulate)
{
	url="file:///A:/Github/PHP/main/Adventure/";
}



var teamName;
var teamId;
var currentPuzzle;
var sectionName;
var currentImage;

var teamInitialized=false;

function initializeTeamAssociation(){
	if(simulate)
	{
		teamId=1;
		changeTeamName(teamName);
		currentPuzzle=1;
		sectionName="Capital";
		setImage((simulatedImage)+".jpg")
		return;
	}
	$.ajax({url:url+'sql.php?query=SELECT TeamId,TeamName,CurrentPuzzle,Image,Section.Name FROM Team LEFT OUTER JOIN Puzzle ON (Team.CurrentPuzzle=Puzzle.PuzzleId) LEFT OUTER JOIN Section ON (Puzzle.SectionId=Section.SectionId) WHERE TeamName="'+$("#currentTeamName").text()+'"',
			dataType:'json',
			success:function(result){
				if(result.length>2)
				{
					teamId=result[0];
					changeTeamName(result[1]);
					currentPuzzle=result[2];
					sectionName=result[4];
					
					setImage(result[3]);
					teamInitialized=true;
				}
				else
				{
					enterEditTeamMode();
					alert("Not a valid team name! :(");
				}
	}});
}

function enterCode(){
	if(simulate)
	{
		simulatedImage++;
		if(simulatedImage==4)
		{simulatedImage=1;}
		$("#code").val("");
		initializeTeamAssociation();
		return;
	}
	
	$.ajax({url:url+'sql.php?query=SELECT Next.PuzzleId,Next.Image,Current.SectionId,TeamSectionOrder.NextSectionId FROM Team LEFT OUTER JOIN Puzzle AS Current ON (CurrentPuzzle=Current.PuzzleId AND CompletionCode="'+$("#code").val()+'") LEFT OUTER JOIN Puzzle AS Next ON (Current.NextPuzzleId=Next.PuzzleId) LEFT OUTER JOIN TeamSectionOrder ON (Current.SectionId=TeamSectionOrder.CurrentSectionId AND Team.TeamId=TeamSectionOrder.TeamId) WHERE Team.TeamId='+teamId,
			dataType:'json',
			success:function(result){
				if(result.length>1 && result[2]!=null) //Use current section as a check that we found a valid puzzle
				{
					if(result[0]!=null)//New Puzzle, not new section
					{
						$.ajax({url:url+'sql.php?query=UPDATE Team SET CurrentPuzzle=(SELECT Next.PuzzleId FROM Puzzle AS Current LEFT OUTER JOIN Puzzle AS Next ON (Current.NextPuzzleId=Next.PuzzleId) WHERE Current.PuzzleId='+currentPuzzle+' AND Current.CompletionCode="'+$("#code").val()+'" AND TeamId='+teamId+') WHERE TeamId='+teamId,
							dataType:'json',
							success:function(result){
								$("#code").val("");
								initializeTeamAssociation();//Inside so that this update completes first
							},
							error:function(result){
								$("#code").val("");
								initializeTeamAssociation();//Inside so that this update completes first
							}
						});
					}
					else //New section and new puzzle
					{
						$.ajax({url:url+'sql.php?query=UPDATE Team SET CurrentPuzzle=(SELECT Next.PuzzleId FROM Puzzle AS Next WHERE Next.First=1 AND Next.SectionId='+result[3]+') WHERE TeamId='+teamId,
							dataType:'json',
							success:function(result){
								$("#code").val("");
								initializeTeamAssociation();
							},
							error:function(result){
								$("#code").val("");
								initializeTeamAssociation();//Inside so that this update completes first
							}
						});
					}
				} else {
					alert("Bad Code!");
				}
	}});
}

function setImage(newImage){
	$("#img").attr("src",url+"loading.jpg");
	currentImage=newImage;
	$("#img").attr("src",url+"images/"+sectionName+"/"+currentImage);
}

function changeTeamName(newName){
	$("#currentTeamName").text(newName);
	$("#newTeamName").val(newName);
	$("#teamName").val("");
	teamName=newName;
	insertParam("team", teamName);
}

var editMode=false;
function enterEditTeamMode(){
	$("#currentTeamName").hide();
	$("#newTeamName").show();
	$("#changeTeam").html("Select");
	editMode=true;
}

function exitEditTeamMode(){
	$("#currentTeamName").show();
	$("#newTeamName").hide();
	$("#changeTeam").html("Change");
	editMode=false;
}

$(document).ready(function(){
	
	$("#changeTeam").click(function(){
		if(editMode){
			changeTeamName($("#newTeamName").val());
			exitEditTeamMode();
			initializeTeamAssociation();
		}
		else
		{
			enterEditTeamMode();
		}
	});
	
	$("#submitCode").click(function() {
		enterCode();
	});
	
	changeTeamName(findGetParameter("team"));
	initializeTeamAssociation();
	
	window.setInterval(function(){
		getLocation();
	},60*1000);
	
	getLocation();
});




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

function insertParam(key, value)
{
	history.pushState(null, null, "?"+key+"="+teamName);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
       // x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    console.log("Latitude: " + position.coords.latitude + 
    "    Longitude: " + position.coords.longitude); 
	var n=new Date();
	$.ajax({url:url+'sql.php?query=INSERT INTO Location VALUES ('+teamId+','+position.coords.latitude+','+position.coords.longitude+',"'+n.toISOString().slice(0, 19).replace('T', ' ')+'");',
							dataType:'json',
							success:function(result){
	}});
}
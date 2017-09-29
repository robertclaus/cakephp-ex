
var url="http://cakephp-mysql-persistent-robert.7e14.starter-us-west-2.openshiftapps.com/main/Adventure/"

var teamName;
var teamId;
var currentPuzzle;
var sectionName;
var currentImage;

var teamInitialized=false;

function initializeTeamAssociation(){
	$.ajax({url:'sql.php?query=SELECT TeamId,TeamName,CurrentPuzzle,Image,Section.Name FROM Team LEFT OUTER JOIN Puzzle ON (Team.CurrentPuzzle=Puzzle.PuzzleId) LEFT OUTER JOIN Section ON (Puzzle.SectionId=Section.SectionId) WHERE TeamName="'+$("#teamName").val()+'"',
			dataType:'json',
			success:function(result){
				if(result.length>2)
				{
					teamId=result[0];
					teamName=result[1];
					currentPuzzle=result[2];
					sectionName=result[4];
					
					setImage(result[3]);
					teamInitialized=true;
				}
	}});
}

function enterCode(){
	$.ajax({url:'sql.php?query=SELECT Next.PuzzleId,Next.Image,Current.SectionId,TeamSectionOrder.NextSectionId FROM Team LEFT OUTER JOIN Puzzle AS Current ON (CurrentPuzzle=Current.PuzzleId AND CompletionCode="'+$("#code").val()+'") LEFT OUTER JOIN Puzzle AS Next ON (Current.NextPuzzleId=Next.PuzzleId) LEFT OUTER JOIN TeamSectionOrder ON (Current.SectionId=TeamSectionOrder.CurrentSectionId AND Team.TeamId=TeamSectionOrder.TeamId) WHERE Team.TeamId='+teamId,
			dataType:'json',
			success:function(result){
				if(result.length>1 && result[2]!=null) //Use current section as a check that we found a valid puzzle
				{
					if(result[0]!=null)//New Puzzle, not new section
					{
						$.ajax({url:'sql.php?query=UPDATE Team SET CurrentPuzzle=(SELECT Next.PuzzleId FROM Puzzle AS Current LEFT OUTER JOIN Puzzle AS Next ON (Current.NextPuzzleId=Next.PuzzleId) WHERE Current.PuzzleId='+currentPuzzle+' AND Current.CompletionCode="'+$("#code").val()+'" AND TeamId='+teamId+') WHERE TeamId='+teamId,
							dataType:'json',
							success:function(result){
								$("#code").val("");
								initializeTeamAssociation();//Inside so that this update completes first
						}});
					}
					else //New section and new puzzle
					{
						$.ajax({url:'sql.php?query=UPDATE Team SET CurrentPuzzle=(SELECT Next.PuzzleId FROM Puzzle AS Next WHERE Next.First=1 AND Next.SectionId='+result[3]+') WHERE TeamId='+teamId,
							dataType:'json',
							success:function(result){
								$("#code").val("");
								initializeTeamAssociation();
						}});
					}
				}
	}});
}

function setImage(newImage){
	currentImage=newImage;
	$("#img").attr("src",url+"images/"+sectionName+"/"+currentImage);
}

$(document).ready(function(){
	
	var wto;
	$('#teamName').change(function() {
	  clearTimeout(wto);
	  wto = setTimeout(function() {
		initializeTeamAssociation();
	  }, 500);
	});
	
	var wto2;
	$('#code').change(function() {
	  clearTimeout(wto2);
	  wto2 = setTimeout(function() {
		enterCode();
	  }, 500);
	});

	initializeTeamAssociation();
});
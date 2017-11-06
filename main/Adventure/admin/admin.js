Dropzone.autoDiscover = false;


var url="https://cakephp-mysql-persistent-robert.7e14.starter-us-west-2.openshiftapps.com/main/Adventure/";

var section;
var sections={};

var puzzles=[];


/* Section Selection */
function queryForSections(){
	$.ajax({url:url+'sql.php?query=SELECT Section.SectionId,Section.Name FROM Section',
		dataType:'json',
		success:function(result){
			sections={};
			for(var i=0; i<result.length; i=i+2)
			{
				sections[result[i]]={'id':result[i],'name':result[i+1]};
			}
			populateSectionList();
			if(section)
			{
				selectSection(section);
			}
	}});
}

function populateSectionList(){
	var sectionList=$('#sectionList');
	sectionList.empty();
	$.each(sections, function(sect){
		if(sections[sect])
		{
			addSectionButton(sectionList,sections[sect]['id'],sections[sect]['name']);
		}
	});
	addSectionButton('-1','Add Section');
}


function addSectionButton(sectionList,id,name){
	$('<button/>').text(name).data("sectionId",id).on('click',function(event){
		desiredSection=$(event.target).data("sectionId");
		selectSection(desiredSection);
	}).appendTo(sectionList);
}

function selectSection(SectionId){
	if(SectionId=='-1')
	{
		$.ajax({url:url+'sql.php?query=INSERT INTO Section VALUES (null,"New")',
		dataType:'json',
		complete:function(result){
			queryForSections();
		}});
	} else {
		$('#currentSectionName').val(sections[SectionId]['name']);
		section=SectionId;
		queryForPuzzles();
	}
}

/* Section Level Properties */
function updateSectionName(newName,sectionId){
	$.ajax({url:url+'sql.php?query=UPDATE Section SET Name="'+newName+'" WHERE SectionId='+sectionId,
		dataType:'json',
		complete:function(result){
			queryForSections();
	}});
}

function deleteSection(sectionId){
	$.ajax({url:url+'sql.php?query=DELETE FROM Section WHERE SectionId='+sectionId,
		dataType:'json',
		complete:function(result){
			section=null;
			$('#currentSectionName').val("");
			queryForSections();
	}});
}

/* Puzzle List */

function queryForPuzzles() {
	
	$.ajax({url:url+'sql.php?query=SELECT PuzzleId,CompletionCode,Image,NextPuzzleId,First FROM Puzzle WHERE SectionId='+section,
		dataType:'json',
		success:function(result){
			puzzles=[];
			var tempPuzzles={};
			var firstPuzzle;
			for(var i=0; i<result.length; i=i+5)
			{
				tempPuzzles[result[i]]={'id':result[i],'code':result[i+1],'img':result[i+2],'NextPuzzleId':result[i+3],'First':result[i+4]};
				
				if(result[i+4]=='1'){
					firstPuzzle=tempPuzzles[result[i]];
				}
			}
			if(firstPuzzle){
				addNextPuzzle(tempPuzzles,firstPuzzle);
			}
			$.each(tempPuzzles,function(puzzleIndex){
				if(!tempPuzzles[puzzleIndex]['added']){
					tempPuzzles[puzzleIndex]['added']=true;
					puzzles.push(tempPuzzles[puzzleIndex]);
				}
			});
			populatePuzzleList();
	}});
}

function addNextPuzzle(tempPuzzles,lastPuzzle){
	lastPuzzle['added']=true;
	puzzles.push(lastPuzzle);
	if(lastPuzzle['NextPuzzleId'])
	{
		addNextPuzzle(tempPuzzles,tempPuzzles[lastPuzzle['NextPuzzleId']]);
	}
}

function populatePuzzleList(){
	var puzzleList=$('#puzzleList');
	puzzleList.empty();
	$.each(puzzles, function(puzzleIndex){
		if(puzzles[puzzleIndex])
		{
			addPuzzleRow(puzzleList,puzzles[puzzleIndex]['id'],puzzles[puzzleIndex]['code'],puzzles[puzzleIndex]['id']+".jpg"); 
			//puzzles[puzzleIndex]['img']);
		}
	});
}

function addPuzzleRow(puzzleList,id,code,img){
	
	var newRow=$('<div/>').data("puzzleId",id).addClass("puzzleRow");
	$('<div/>').text(id).appendTo(newRow);
	$('<textarea/>').data("puzzleId",id).val(code).on('change',function(event){
		var puzzleId=$(event.target).data("puzzleId");
		$.each(puzzles,function(puzzle){
			if(puzzles[puzzle]['id']==puzzleId)
			{
				puzzles[puzzle]['code']=$(event.target).val();
			}
		});
	}).appendTo(newRow);
	$('<img/>').attr("src",url+"uploads/Small/"+sections[section]['name']+"/"+img).appendTo(newRow);
	$('<input/>').attr("type","radio").attr("name","selectedPuzzle").data("puzzleId",id).appendTo(newRow);
	newRow.appendTo(puzzleList);
}

function saveSection(){
	$.each(puzzles,function(puzzleIndex){
		var puzzle=puzzles[puzzleIndex];
		$.ajax({url:url+'sql.php?query=UPDATE Puzzle SET CompletionCode="'+puzzle['code']+'", Image="'+puzzle['id']+'.jpg", NextPuzzleId='+puzzle['NextPuzzleId']+', First='+puzzle['First']+' WHERE PuzzleId='+puzzle['id'],
		dataType:'json',
		success:function(result){	
		}});
	});
}

function addPuzzle(){
	$.ajax({url:url+'sql.php?query=INSERT INTO Puzzle VALUES (null,'+section+',"",null,"default",null)',
			dataType:'json',
			complete:function(result){
				queryForPuzzles();
			}});
}

$(document).ready(function(){
	
	// Grab elements, create settings, etc.
	var video = document.getElementById('video');

	if (location.protocol === 'https:') {
		// Get access to the camera!
		if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			// Not adding `{ audio: true }` since we only want video now
			navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
				video.src = window.URL.createObjectURL(stream);
				video.play();
			});
		}
	}
	else
	{
		//alert("Please access page via https to take pictures directly.");
	}
	
	var myDropzone = $("div#myDropzone").dropzone({ 
		url: "../upload.php", 
		init: function(){
				this.on("sending", function(file,xhr,formData){
					formData.append("folderName",sections[section]['name']);
					formData.append("renameFile",$('input[name=selectedPuzzle]:checked').data("puzzleId")+".jpg");
				});
			}
		});
	
	//Initialize Sections
	queryForSections();
	
	//Bind section name update
	$('#currentSectionName').on('change',function(){updateSectionName($('#currentSectionName').val(),section);});
	
	//Bind section delete
	$('#deleteCurrentSection').on('click',function(){deleteSection(section);});
	
	//Bind save section
	$('#saveSection').on('click',function(){saveSection();});
	
	//Bind add puzzle
	$('#addPuzzle').on('click',function(){addPuzzle();});
	
	//Activate slip.js for manipulating order of puzzles
	var o1=document.getElementById('puzzleList');
	o1.addEventListener('slip:beforeswipe', function(e){
		e.preventDefault();
	}, false);
	o1.addEventListener('slip:reorder',function(e){
		e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
		var movedPuzzleId=$(event.target).data("puzzleId");
		var newPreviousPuzzleId=$(event.target).prev().data("puzzleId");
		var newNextPuzzleId=$(event.target).next().data("puzzleId");
		var oldPreviousPuzzleId;
		var oldNextPuzzleId;
		
		
		var movedPuzzleIndex;
		var oldNextPuzzleIndex;
		var newPreviousPuzzleIndex;
		var oldPrevPuzzleIndex;
		var newNextPuzzleIndex;
		
		$.each(puzzles,function(puzzleIndex){
			//moved
			if(puzzles[puzzleIndex]['id']==movedPuzzleId){
				movedPuzzleIndex=puzzleIndex;
				oldNextPuzzleId=puzzles[puzzleIndex]['NextPuzzleId'];
			}
			
			//oldPrevious
			if(puzzles[puzzleIndex]['NextPuzzleId']==movedPuzzleId){
				oldPrevPuzzleIndex=puzzleIndex;
			}
			
			if(puzzles[puzzleIndex]['id']==newPreviousPuzzleId){
				newPreviousPuzzleIndex=puzzleIndex;
			}
			
			if(puzzles[puzzleIndex]['id']==newNextPuzzleId){
				newNextPuzzleIndex=puzzleIndex;
			}
		});
		$.each(puzzles,function(puzzleIndex){
			if(puzzles[puzzleIndex]['id']==oldNextPuzzleId){
				oldNextPuzzleIndex=puzzleIndex;
			}
		});
		
		//Moved.next
		if(newNextPuzzleId==undefined){
			puzzles[movedPuzzleIndex]['NextPuzzleId']=null;
		} else {
			puzzles[movedPuzzleIndex]['NextPuzzleId']=newNextPuzzleId;
		}
		
		//oldPrevious.next
		if(oldPrevPuzzleIndex!=null){
			puzzles[oldPrevPuzzleIndex]['NextPuzzleId']=oldNextPuzzleId;
		}
		
		//newPrevious.next
		if(newPreviousPuzzleIndex!=null){
			puzzles[newPreviousPuzzleIndex]['NextPuzzleId']=movedPuzzleId;
		}
		
		//moved was first
		if(puzzles[movedPuzzleIndex]['First']){
			puzzles[movedPuzzleIndex]['First']=null;
			puzzles[oldNextPuzzleIndex]['First']='1';
		}
		
		//moved is now first
		if(!newPreviousPuzzleId){
			puzzles[movedPuzzleIndex]['First']='1';
			puzzles[newNextPuzzleIndex]['First']=null;
		}
		
		return false;
	}, false);
	new Slip(o1);
});
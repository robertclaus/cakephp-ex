function toggleTaskForm()
{
	if(document.getElementById(TASKFORMID).innerHTML!="")
	{
		clearNewTaskForm();
	}
	else
	{
		populateTaskForm();
	}
}


function populateTaskForm()
{
	
	var reccuranceWrapper = document.createElement("div");
	reccuranceWrapper.id="RecurranceWrapper";
	reccuranceWrapper.className = "Wrapper";
	populateRadioGroup(reccuranceWrapper, RECURRANCEVALUES,"Recurrance");
	
	var dayWrapper = document.createElement("div");
	dayWrapper.id="DayWrapper";
	dayWrapper.className="Wrapper";
	populateRadioGroup(dayWrapper, DAYVALUES,"Day");
	
	var whoWrapper = document.createElement("div");
	whoWrapper.id="WhoWrapper";
	whoWrapper.innerHTML="";
	whoWrapper.className="Wrapper";
	populateRadioGroup(whoWrapper, USERS,"Who");
	
	var nameField = document.createElement("input");
	nameField.type="text";
	nameField.id="NameField";
	nameField.placeholder="Task Title";
	
	var addButton = document.createElement("input");
	addButton.type="button";
	addButton.onclick=addEvent;
	addButton.value="Add Event";
	
	var taskForm = document.getElementById(TASKFORMID);
	taskForm.innerHTML="";
	taskForm.appendChild(reccuranceWrapper);
	taskForm.appendChild(dayWrapper);
	taskForm.appendChild(whoWrapper);
	taskForm.appendChild(nameField);
	taskForm.appendChild(addButton);
}

//dataArray should have title and value for each array element object.
function populateRadioGroup(DOMelem, dataArray, radioGroupId)
{
	for(var i=0; i<dataArray.length;i++)
	{
		var Details = dataArray[i];
		
		//<input type="radio" name="recurranceList" id="once" value="-1">
		//<label for="once">Once</label>
		
		var radioButton = document.createElement("input");
		radioButton.name=radioGroupId;
		radioButton.id=radioGroupId+"-"+Details.title;
		radioButton.value=Details.value;
		radioButton.type="radio";
		radioButton.className="radio-custom";
		if(Details.checkedDefault==true)
		{
			radioButton.checked=true;
			radioButton.className=radioButton.className+" default";
		}
		DOMelem.appendChild(radioButton);
		/*
		var displayLabel = document.createElement("label");
		displayLabel.htmlFor=Details.title;
		displayLabel.innerHTML="";
		displayLabel.className="LabelDisplay";
		DOMelem.appendChild(displayLabel);
		*/
		var textLabel = document.createElement("label");
		textLabel.htmlFor=radioGroupId+"-"+Details.title;
		textLabel.innerHTML=Details.title;
		textLabel.className="radio-custom-label";
		DOMelem.appendChild(textLabel);

	}
}

function getRecurrance()
{
	var RecurranceFrequency = $("input:radio[name ='Recurrance']:checked").first().val();
	var RecurranceDay = $("input:radio[name ='Day']:checked").first().val();
	
	switch(RecurranceFrequency)
	{
		case "FREQ=DAILY;":
			RecurranceDay="";
			break;
		case "FREQ=WEEKLY;":
			switch(RecurranceDay){
				case "BYDAY=MO;":
				case "BYDAY=TU;":
				case "BYDAY=WE;":
				case "BYDAY=TH;":
				case "BYDAY=FR;":
				case "BYDAY=SA;":
				case "BYDAY=SU;":
				default:
					break;
			}
			break;
		case "FREQ=MONTHLY;":
			switch(RecurranceDay){
				case "BYDAY=MO;":
					RecurranceDay="BYDAY=1MO;"
					break;
				case "BYDAY=TU;":
					RecurranceDay="BYDAY=1TU;"
					break;
				case "BYDAY=WE;":
					RecurranceDay="BYDAY=1WE;"
					break;
				case "BYDAY=TH;":
					RecurranceDay="BYDAY=1TH;"
					break;
				case "BYDAY=FR;":
					RecurranceDay="BYDAY=1FR;"
					break;
				case "BYDAY=SA;":
					RecurranceDay="BYDAY=1SA;"
					break;
				case "BYDAY=SU;":
					RecurranceDay="BYDAY=1SU;"
					break;
			}
			break;
		case "":
			RecurranceDay="";
			break;
	}
	var rrRule="RRULE:"+RecurranceFrequency+RecurranceDay+"WKST=SU;";
	if(rrRule!="RRULE:WKST=SU;")
	{
	return rrRule;
	}
	return null;
}

function getWho()
{
	return $("input:radio[name ='Who']:checked").first().val();
}

function getTaskName()
{
	return $("#"+TASKFORMID).find("#NameField").first().val();
}

function clearNewTaskForm()
{
	document.getElementById(TASKFORMID).innerHTML="";
}
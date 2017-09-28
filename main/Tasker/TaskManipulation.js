
	  function addEvent()
	  {
		  var startDate="2016-08-15";//T10:00:00.000-07:00";
		  var endDate="2016-08-16";//T10:25:00.000-07:00";
		  var summary = getTaskName();
		  var responsible = getWho();
		  var recurrance = getRecurrance();
		  
		  var resource = 
		  {
				"summary":summary,
				"start":{
					"date": startDate
				},
				"end":{
					"date": endDate
				},
				"extendedProperties":
				{
					"shared":
					{
						"responsible":responsible,
						"active":true
					}
				},
				"recurrence":[recurrance]
			};
			
			var requestContent = {
			  'calendarId': CALENDARID,
			  'resource': resource
			};
		console.log(requestContent);
		  var request = gapi.client.calendar.events.insert(requestContent);
		  request.then(function(resp){
			  initializeList();
			  clearNewTaskForm();
		  });
	  }

	  function markTaskAsDeleted(id)
	  {
		   var resource = EVENTS[id];
		   if(resource.extendedProperties==null)
		   {
			   resource.extendedProperties={};
		   }
		   if(resource.extendedProperties.shared==null)
		   {
			   resource.extendedProperties.shared={};
		   }
		   resource.extendedProperties.shared.active=false;
			
			EVENTS[id]=resource;
			var requestContent = {
			  'calendarId': CALENDARID,
			  'eventId':id,
			  'resource': resource
			};
			var request = gapi.client.calendar.events.patch(requestContent);
			request.then(function(resp){console.log("Deleted");});
	  }
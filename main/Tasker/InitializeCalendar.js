//Call initializeCalendarAPI() to populate CALENDARID based on CALENDARNAME.  
//This will create the necessary google calendar if one doesn't exist.
	  
		//Public
	  function initializeCalendarAPI()
	  {
		initializeFilterByOwnerGroup();
		findCALENDARID(CALENDARNAME).then(function(){initializeList();});
	  }
	  
		//Private
	  function findCALENDARID(calendarName) {
		  var request = gapi.client.calendar.calendarList.list({
			  "fields":"items(id,summary)"
		  });
		  return request.then(function(resp){
			  console.log(resp);
			  resp.result.items.forEach(function(calendar){
				  if(calendar.summary==calendarName)
				  {
					  if(CALENDARID!=null)
					  {
						  console.log("WARNING: Multiple Calendars with Key Name.  Defaulting to last.");
					  }
					  CALENDARID=calendar.id;
				  }
			  });
		  }).then(function(){return createNewCalendar(calendarName)});
	  }
	  
		//Private
	  function createNewCalendar(calendarName) {
		  console.log(CALENDARID);
		  if(CALENDARID===null)
			{
			  var request = gapi.client.calendar.calendars.insert({
				  "fields":"id",
				  "resource":{
					  "summary":calendarName
				  }
			  });
			  return request.then(function(resp){
				  console.log("NOTIFICATION: Generated new Calendar.");
				  CALENDARID = resp.result.id;
			  });
			}
	  }
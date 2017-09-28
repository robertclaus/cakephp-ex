
  
  /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function initializeList() {
		  
        var request = gapi.client.calendar.events.list({
          'calendarId': CALENDARID,
          'timeMin': addDays((new Date()),-1*MAXDAYSBACK).toISOString(),
		  'timeMax': addDays((new Date()),MAXDAYSFORWARD).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 20,
          'orderBy': 'startTime'
        });
		
        request.execute(function(resp) {
			clearTaskList();
			console.log(resp);
          var events = resp.items;
          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
              var event = events[i];
			  EVENTS[event.id]=event;
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
			  if(event.extendedProperties==null || 
					  event.extendedProperties.shared==null || 
					  (
						event.extendedProperties.shared.active!="false"&&
						(
							event.extendedProperties.shared.responsible==getOwnerFilter()||
							event.extendedProperties.shared.responsible==ANYUSERKEYWORD||
							getOwnerFilter()==ANYUSERKEYWORD
						)
					   )
				 )
			  {
				var owner="";
				if(event.extendedProperties!=null && event.extendedProperties.shared!=null&& event.extendedProperties.shared.responsible!=null)
				{
					owner=event.extendedProperties.shared.responsible;
				}
				if(owner=="Any")
				{
					owner="";
				}
				
				addTaskToList(event.summary, event.id, owner, when);
			  }
            }
          } else {
            noTasks();
          }
			updateListeners();
        });
      }
	  
	  function initializeFilterByOwnerGroup()
	  {
		  var userFilter = document.getElementById("FilterByUserGroup");
		  populateRadioGroup(userFilter, USERS,"userFilter");
		  $("input:radio[name ='userFilter']").change(function(elem){
			  initializeList();
		  });
	  }
	  
	  function getOwnerFilter()
	  {
		  return  $("input:radio[name ='userFilter']:checked").val();
	  }
	  
	  
	  function addDays(date, days)
	  {
		  date.setTime( date.getTime() + days * 86400000 );
		  return date;
	  }
	  
	  function updateListeners()
	  {
		  var options={ direction: Hammer.DIRECTION_RIGHT, threshold: 10 };
			$(".Task").hammer(options).bind("swiperight", function(event) {
				markTaskAsDeleted(event.target.id);
				removeTaskFromList(event.target);
			});
	  }
	  
	  function removeTaskFromList(elem)
	  {
		  $(elem).hide("slide", { direction: "right" }, 200);
	  }
	  
	  function addTaskToList(taskName, id, owner, dueDate)
	  {
		  if(owner!="")
		  {
			  owner=" - "+owner;
		  }
		  elem=document.createElement("div");
		  elem.appendChild(document.createTextNode(taskName + ' (' + dueDate + ')'+owner));
		  elem.id=id;
		  elem.className="Task";
		  appendPre(elem);
	  }
	  
	  function clearTaskList()
	  {
		  var elem = document.createElement("h4");
		  elem.innerHTML='Upcoming events:';
		  var pre = document.getElementById(OUTPUTID);
		  pre.innerHTML="";
		  appendPre(elem);
	  }
	  
	  function noTasks()
	  {
		  clearTaskList();
		  appendPre(document.createTextNode("No current tasks"));
	  }
	  
	        /**
       * Append a pre element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById(OUTPUTID);
        pre.appendChild(message);
      }
  
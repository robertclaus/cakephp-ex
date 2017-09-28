
//Calendar API specific
		//The name of the calendar the page uses
		var CALENDARNAME = "hearthTaskCalendar";

		//The Google ID of the calendar being used.  Initialized in MainList.js -> findCalendar
		var CALENDARID = null;

		var MAXDAYSFORWARD = 3;
		var MAXDAYSBACK = 3;

//Google Auth Specific
      // Your Client ID can be retrieved from your project in the Google
      // Developer Console, https://console.developers.google.com

	  var CLIENT_ID = '67376591829-bmr78kplm2nusgmf68l13s8bn2omojcg.apps.googleusercontent.com';

      var SCOPES = ["https://www.googleapis.com/auth/calendar"];

	  
	  
	  var ANYUSERKEYWORD = "Any";
	  var ONCERECURRANCEVALUE = -1;
	  
	  var EVENTS = {};
	  
	  var USERS = [
	  {"title":"Any","value":ANYUSERKEYWORD,"checkedDefault":true}
	  ,
	  {"title":"Robert","value":"Robert"},
	  {"title":"Angela","value":"Angela"}
		];
		
		var RECURRANCEVALUES = [
		{"title":"Once",
		"value":"",
		"checkedDefault":true
		},
				{"title":"Daily",
		"value":"FREQ=DAILY;"
		},
				{"title":"Weekly",
		"value":"FREQ=WEEKLY;"
		},
				{"title":"Monthly",
		"value":"FREQ=MONTHLY;"
		}
		];
		
		var DAYVALUES = [
		{"title":"Monday", "value":"BYDAY=MO;"},
		{"title":"Tuesday", "value":"BYDAY=TU;"},
		{"title":"Wednesday", "value":"BYDAY=WE;"},
		{"title":"Thursday", "value":"BYDAY=TH;"},
		{"title":"Friday", "value":"BYDAY=FR;"},
		{"title":"Saturday", "value":"BYDAY=SA;"},
		{"title":"Sunday", "value":"BYDAY=SU;"},
		{"title":"Doesn't Matter", "value":"", "checkedDefault":true}
		];
		
//HTML IDs
var TASKFORMID = "TaskForm";
var AUTHORIZEDIVID = "authorize-div";
var OUTPUTID = "output";
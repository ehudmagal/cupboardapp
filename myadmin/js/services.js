'use strict';

function padNumWithZero(num){
    var res = num.toString();
    if(res.length == 1){
        res = '0'+res;
    }
    return res;
}
/* Services */

  app.factory('loggerRepository', function($http) {
    return {
        getLogger: function(logger_id) {
            var url = server_string + '/activeadmin/remote_loggers/'+logger_id+'.json';
            return $http.get(url);
        }
    };
});

 app.factory('UserLoggersRepository', function($http) {
    return {
        getUserLoggers: function(user_id) {
		    var url =  server_string+'/activeadmin/remote_loggers.json?utf8=%E2%9C%93&q%5Bowner_id_eq%5D='+user_id+'&commit=Filter&order=id_asc&per_page=10000';
            return $http.get(url);
        }
    };
});

app.factory('ChangeLoggerOwnerFactory', function($http,$cookies) {
    return {
           changeLoggerOwner: function(logger,user_id) {
           $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	       var csrf_token = $cookies['CSRF-TOKEN']
	       var post_data = {};
	       post_data['authenticity_token'] = csrf_token;
	       post_data['_method'] = 'patch';
	       logger['owner_id'] = user_id;
	       post_data['remote_logger'] = logger;
           post_data = $.param(post_data);
	       return $http.post(server_string + '/activeadmin/remote_loggers/'+logger.id, post_data)
        }
    };
});

app.factory('SubmitJsonFactory', function($http,$cookies) {
    return {
           submitJson: function(url,json_obj,json_obj_name,content_type) {
		   content_type = content_type || "application/x-www-form-urlencoded";
           $http.defaults.headers.post["Content-Type"] = content_type;		  
	       var csrf_token = $cookies['CSRF-TOKEN'];
		   $http.defaults.headers.post["X-CSRF-Token"] = csrf_token;
	       var post_data = {};
	       post_data['authenticity_token'] = csrf_token;
	       post_data['_method'] = 'patch';	       
	       post_data[json_obj_name] = json_obj;
	       return $http.post(url, post_data)
        }
    };
});

app.factory('SubmitPostFactory', function($http,$cookies) {
    return {
           submitPost: function(url) {
           $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	       var csrf_token = $cookies['CSRF-TOKEN']
	       var post_data = {};
	       post_data['authenticity_token'] = csrf_token;
		   post_data = $.param(post_data);
	       return $http.post(url, post_data);
        }
    };
});

app.factory('GetDateTimeFormatForAngularFactory', function() {
    return {
           getDateTimeFormatForAngular: function(str) {          
	       return str.substring(0,str.indexOf('.'));
        }
    };
});

app.factory('GetDateTimeFormatForRubbyFactory', function() {
    return {
           getDateTimeFormatForRubby: function(str) {          
	       return str+'.000Z';
        }
    };
});

app.factory('GetObjectByUrlFactory', function($http) {
    return {
           getObjectByUrl: function(url) {          
	       return $http.get(url);
        }
    };
});

app.factory('GetObjectByIdFactory', function() {
    return {
           getObjectById: function(id,arr) {          
	       var res = null;
		   for(var i = 0 ; i < arr.length ; i++){
		    var obj = arr[i];
			if(obj.id == id){
			res = obj;
			break;
			}
		   }
		   return res;
        }
    };
});



app.factory('breadcrumbs', ['$rootScope', '$location', function($rootScope, $location){

  var breadcrumbs = [];
  var breadcrumbsService = {};

  //we want to update breadcrumbs only when a route is actually changed
  //as $location.path() will get updated imediatelly (even if route change fails!)
  $rootScope.$on('$routeChangeSuccess', function(event, current){

    var pathElements = $location.path().split('/'), result = [], i;
    var breadcrumbPath = function (index) {
	  //var rootpath = '/app/index.html#'
      //var rootpath = '/admin/#';
      return rootpath+'/' + (pathElements.slice(0, index + 1)).join('/');
    };

    pathElements.shift();
    for (i=0; i<pathElements.length; i++) {
      result.push({name: pathElements[i], path: breadcrumbPath(i)});
    }

    breadcrumbs = result;
  });

  breadcrumbsService.getAll = function() {
    return breadcrumbs;
  };

  breadcrumbsService.getFirst = function() {
    return breadcrumbs[0] || {};
  };

  return breadcrumbsService;
}]);

app.factory('GetDateForDatePickerFactory', function() {
    return {
           getDateForDatePicker: function(d) {          
	       var year=d.getFullYear();
           var month=d.getMonth()+1;
           if (month<10){
            month="0" + month;
            };
            var day=d.getDate();
            var res = year + "-" + month + "-" + day;
			return res;
        }
    };
});
app.factory('GetDateTimeForDatePickerFactory', function() {
    return {
           getDateTimeForDatePicker: function(d) {
	       var year=d.getFullYear();
           var month=d.getMonth()+1;
           if (month<10){
            month="0" + month;
            };
            var day=d.getDate();
            //padding all numbers with zero, for formating reason.
            var hours = d.getHours();
            var hours_str = padNumWithZero(hours);
            var minutes = d.getMinutes();
            var minutes_str = padNumWithZero(minutes);
            var seconds = d.getSeconds();
            var seconds_str = padNumWithZero(seconds);
            var res = year + "-" + month + "-" + day + "T" + hours_str + ":" + minutes_str + ":" + seconds_str ;
			return res;
        }
    };
});
app.factory('TransformJsonToUrlFactory', function() {
    return {
           transformJsonToUrl: function(obj) {
         var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
      
        for(name in obj) {
        value = obj[name];
        
        if(value instanceof Array) {
         for(i=0; i<value.length; ++i) {
           subValue = value[i];
           fullSubName = name + '[' + i + ']';
           innerObj = {};
           innerObj[fullSubName] = subValue;
           query += param(innerObj) + '&';
        }
      }
       else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
      
     return query.length ? query.substr(0, query.length - 1) : query;
  }
    };
});




app.factory('UpdateUserFactory', function($http,$cookies) {
    return {
           updateUser: function(user) {
           var url = server_string + '/activeadmin/users/'+user.id;
	       var  content_type =  "application/x-www-form-urlencoded";
           $http.defaults.headers.post["Content-Type"] = content_type;
	       var csrf_token = $cookies['CSRF-TOKEN'];
           $http.defaults.headers.post["X-CSRF-Token"] = csrf_token;
	       var post_data = {};
	       post_data['authenticity_token'] = csrf_token;
	       post_data['_method'] = 'patch';
	       post_data['user'] = user;
	       var parsed_post_data = $.param(post_data);
	       return $http.post(url, parsed_post_data).success(function(data) {
	       alert("user form has been posted successfully");
	       }).error(function(data){
	        alert('error accured :' + JSON.stringify(data));
	       });
           }
}
});
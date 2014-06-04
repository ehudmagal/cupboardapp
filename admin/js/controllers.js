//app is the main module

var app = angular.module('main', ['ngTable','ngRoute','ngCookies']);
//angular.bootstrap(document, ['app']);
app.controller('DemoCtrl', function($scope, $filter,$http, ngTableParams,breadcrumbs,$location,$cookies) {
     $scope.breadcrumbs = breadcrumbs;
     $scope.location = $location;
    $scope.load_users_table = function(){
      $http.get(server_string + '/users.json?per_page=-1').success(function(data) {
      $scope.raw_users = data;
	  $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 100,          // count per page
        sorting: {
            first_name: 'asc'     // initial sorting
        }
    }, {
        total:  $scope.raw_users.length, // length of data
        getData: function($defer, params) {
            // use build-in angular filter
            var orderedData = params.sorting() ?
                                $filter('orderBy')( $scope.raw_users, params.orderBy()) :
                                 $scope.raw_users;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });
     });
   }
    $scope.load_users_table();
    $scope.new_user = function() {
    window.location.assign("#/users/new_user")
  };
     $scope.untested_loggers = function() {
    window.location.assign("#/production")
  };
     $scope.push_notifications = function() {
    window.location.assign("#/push_notifications")
  };
   $scope.delete_user = function(user){
   var r=confirm("Are you sure You want to delete user?");
    if(r){
   var url = server_string+'/activeadmin/users/'+user.id;
   $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	 var csrf_token = $cookies['CSRF-TOKEN'];
	 var post_data = {};
	 post_data['authenticity_token'] = csrf_token;
     post_data['_method'] = 'delete';
     var urlEncodedObj = $.param(post_data);
	 $http.post(url, urlEncodedObj).success(function( data, status, headers, config) {
     //removing project from local projects list
    //$scope.load_users_table();
	 alert("user has been deleted successfully");
      window.location.assign("#/users")
}).error(function(data, status, headers, config) {
     //$scope.load_users_table();
	 alert('error accured :' + JSON.stringify(data));
     window.location.assign("#/users")
    });
  }
  }
    $scope.show_users_with_projects = true;
});

app.controller('userConfigurationCtrl', ['$scope', '$routeParams','$http','$cookies','loggerRepository','UserLoggersRepository',
'ChangeLoggerOwnerFactory','SubmitJsonFactory','GetDateTimeFormatForAngularFactory','GetDateTimeFormatForRubbyFactory','breadcrumbs','$location',
'$filter','GetObjectByIdFactory','GetObjectByUrlFactory','UpdateUserFactory',
  function($scope, $routeParams,$http,$cookies,loggerRepository,UserLoggersRepository,ChangeLoggerOwnerFactory,SubmitJsonFactory,GetDateTimeFormatForAngularFactory,GetDateTimeFormatForRubbyFactory,
    breadcrumbs,$location,$filter ,GetObjectByIdFactory,GetObjectByUrlFactory,UpdateUserFactory) {
	//pagination
	$scope.itemsPerPage = 15;
    $scope.currentPage = 0;
 

  $scope.prevPage = function() {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
    }
  };

  $scope.prevPageDisabled = function() {
    return $scope.currentPage === 0 ? "disabled" : "";
  };

  $scope.pageCount = function() {
  try{
    return Math.ceil($scope.free_loggers.length/$scope.itemsPerPage)-1;
	}catch(e){
	}
  };

  $scope.nextPage = function() {
    if ($scope.currentPage < $scope.pageCount()) {
      $scope.currentPage++;
    }
  };

  $scope.nextPageDisabled = function() {
    return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
  };

	//pagination end
      //pagination for all projects
	$scope.itemsPerPage = 15;
    $scope.projectsCurrentPage = 0;


    $scope.projectsPrevPage = function() {
    if ($scope.projectsCurrentPage > 0) {
      $scope.projectsCurrentPage--;
    }
  };

  $scope.projectsPrevPageDisabled = function() {
    return $scope.projectsCurrentPage === 0 ? "disabled" : "";
  };

  $scope.projectsPageCount = function() {
  try{
    return Math.ceil($scope.all_projects.length/$scope.itemsPerPage)-1;
	}catch(e){
	}
  };

  $scope.projectsNextPage = function() {
    if ($scope.projectsCurrentPage < $scope.projectsPageCount()) {
      $scope.projectsCurrentPage++;
    }
  };

  $scope.projectsNextPageDisabled = function() {
    return $scope.projectsCurrentPage === $scope.projectsPageCount() ? "disabled" : "";
  };

	//all projects pagination end

    //declering vars for timing loading mechanizm
    $scope.owned_loggers_finished = false;
    $scope.projects_loggers_finished = false;
    $scope.owned_projects_finished = false;
    $scope.shared_project_ids_finished = false;
    $scope.$watch('[owned_loggers_finished,owned_projects_finished,shared_project_ids_finished,projects_loggers_finished]',
    function(){
        if($scope.owned_loggers_finished && $scope.owned_projects_finished&& $scope.shared_project_ids_finished
         && $scope.projects_loggers_finished){
         //get all free loggers
         $scope.load_free_loggers();
         //get all projects
         $scope.get_all_projects();
        }
    },true
    );
    //////////////////
    $scope.location = $location;
    $scope.breadcrumbs = breadcrumbs;
    $scope.readonly = true;
    $scope.userId = $routeParams.userId;
    $scope.sysId = 1;
    $scope.owned_loggers = [];
    $scope.show_projects = true;
    $scope.change_tabs = function(){
     $scope.show_projects = !$scope.show_projects;
    }
    $scope.loggers_class = function(){
        var res = '';
        if(!$scope.show_projects){
            res = 'active';
        }
        return res;
    }
      $scope.projects_class = function(){
        var res = '';
        if($scope.show_projects){
            res = 'active';
        }
        return res;
    }
    $http.get(server_string+'/users/'+$scope.userId+'.json').success(function(data){
    $scope.user = data;
    //metric units configuration
    $scope.metric_units = ['metric','inches']
    if($scope.user.metric_units){
     $scope.selected_metric_unit =  $scope.metric_units[0];
    }else{
        $scope.selected_metric_unit =  $scope.metric_units[1];
    }
    $scope.$watch('selected_metric_unit', function(){
     if($scope.selected_metric_unit == 'metric'){
     $scope.user.metric_units =  true;
    }else{
       $scope.user.metric_units =  false;
    }
   });
	$scope.user.created_at = GetDateTimeFormatForAngularFactory.getDateTimeFormatForAngular($scope.user.created_at);
	$scope.user.updated_at = GetDateTimeFormatForAngularFactory.getDateTimeFormatForAngular($scope.user.updated_at);  	
	var owned_project_ids = $scope.user.owned_project_ids;
	$scope.owned_projects = [];
    if(!owned_project_ids.length){
    $scope.owned_projects_finished = true;
    }
    $scope.projcts_logger_ids = [];//this var is for loading additional loggers
    if(owned_project_ids.length){
	for(var i = 0 ; i < owned_project_ids.length ; i++){
	var owned_project_id = owned_project_ids[i];
	 $http.get(server_string+'/activeadmin/projects/'+owned_project_id.toString()+'.json').success(function(data) {
	 var proj =  data;
     var projcts_logger_ids  = proj.remote_logger_ids; //we have to add project loggers to global loggers list ugly.
     //fetching loggers belongs to projects and pushing them inside  $scope.owned_loggers
     $scope.add_loggers(projcts_logger_ids);
     //loading projects_loggers is nearly done
     $scope.projects_loggers_finished = true;
	 $scope.owned_projects.push(proj);
	 if($scope.owned_projects.length == $scope.user.owned_project_ids.length){
	 //$scope.load_free_loggers();
     $scope.owned_projects_finished = true;
	 }
	 });
	}
   }else{
    $scope.projects_loggers_finished = true;
     $scope.owned_projects_finished = true;
    }
	//getting all projects shared with this user
	 var shared_project_ids = $scope.user.viewable_project_ids;
    if(!shared_project_ids.length){
     $scope.shared_project_ids_finished = true;
    }
	 $scope.shared_projects = [];
	 for(var i = 0 ; i < shared_project_ids.length ; i++){
	 var shared_proj_id = shared_project_ids[i];
	 var url = server_string+'/activeadmin/projects/'+shared_proj_id+'.json';
	 $http.get(url).success(function(data) {
	 var proj =  data;
	 $scope.shared_projects.push(proj);
     if($scope.shared_projects.length == $scope.user.viewable_project_ids.length){
      $scope.shared_project_ids_finished  = true;
     }
	 });
	 }
	})	 
	UserLoggersRepository.getUserLoggers($scope.userId).success(function(data) {
	$scope.owned_loggers = $scope.owned_loggers.concat(data);
    $scope.owned_loggers_finished  = true;
    })
    $scope.displayDate = function(date){
	var res = null;
	if(date){
	day = date.getDate();
	month = date.getMonth()+1;
	year = date.getFullYear();
	res = day+'/'+month+'/'+year;
	}
	return res;
	}	
	$scope.yesOrNo = function(value){
	var res = null;
	if(value){
	res = 'yes';
	}else{
	res = 'no';
	}
	return res;
	}
	
	$scope.addLoggerToUser = function(logger){
	loggerRepository.getLogger(logger.id).success(function(data) {
	var refreshed_logger = data;
	if(refreshed_logger.owner_id == 1){//if logger is still free
	$scope.owned_loggers.push(logger);
	var index = $scope.free_loggers.indexOf(logger);
	$scope.free_loggers.splice(index,1);	
	
	//
	ChangeLoggerOwnerFactory.changeLoggerOwner(logger,$scope.userId).success(function(data) {
	console.log('success');
	});
	//
	}else{
	alert("logger " + logger.id + " is not free anymore! refreshing page parameters.");
	$scope.load_free_loggers();
	}
	});
	
	}
	$scope.deleteLoggerFromUser = function(logger){	
	$scope.free_loggers.push(logger);
	var index = $scope.owned_loggers.indexOf(logger);
	$scope.owned_loggers.splice(index,1);
    ChangeLoggerOwnerFactory.changeLoggerOwner(logger,1).success(function(data) {
	console.log('success');
	});	
	}
	
	$scope.edit_user = function(){
	$scope.readonly = !$scope.readonly;
	}
	$scope.submit_user = function(){
     UpdateUserFactory.updateUser($scope.user);
	}
    $scope.activate_deactivate_logger = function(logger){
        if(!logger.activated){
           $scope.activate_logger(logger);
        }else{
            $scope.deactivate_logger(logger);
        }
    }
    $scope.deactivate_logger = function(logger){
     var url = server_string + '/remote_loggers/'+logger.id+'/deactivate.json';
     $http.defaults.headers.post["X-Requested-With"] = 'XMLHttpRequest';
	 var csrf_token = $cookies['CSRF-TOKEN'];
     $http.defaults.headers.post["X-CSRF-Token"] = csrf_token;
	 $http.post(url).success(function(data) {
      alert("logger has been deactivated successfully");
	}).error(function(data){
	 alert('error accured :' + JSON.stringify(data));
	});
	}
     $scope.activate_logger = function(logger){
     var url = server_string + '/remote_loggers/'+logger.id+'/activate.json';
     $http.defaults.headers.post["X-Requested-With"] = 'XMLHttpRequest';
	 var csrf_token = $cookies['CSRF-TOKEN'];
     $http.defaults.headers.post["X-CSRF-Token"] = csrf_token;
     $http.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded; charset=UTF-8';
     var post_data = {};
     logger.longitude = 0;
     logger.latitude = 0;
     post_data['_method'] = 'put';
     post_data['commit'] = 'Activate';
	 post_data['remote_logger'] = logger;
	 var parsed_post_data = $.param(post_data);
	 $http.post(url,parsed_post_data).success(function(data) {
      alert("logger has been activated successfully");
	}).error(function(data){
	 alert('error accured :' + JSON.stringify(data));
	});
	}
    $scope.edit_project = function(project){
	 window.location.assign("#/users/"+$scope.userId+"/edit_project/"+project.id)
	}
	$scope.manage_user = function(){
    window.location.assign('#/users/'+$scope.userId+'/manage_user');
    }
	$scope.load_free_loggers = function(){
    var url = server_string+'/remote_loggers/unattached.json?tested=true';
    $http.get(url).success(function(data){
    $scope.free_loggers = data;
    })

	}
    $scope.get_all_projects = function(){
    var url = server_string+'/activeadmin/projects.json?per_page=-1'
         GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
         $scope.all_projects = data;
         })
	}
    $scope.add_loggers = function(logger_ids){
     for(var i = 0 ; i < logger_ids.length ; i++){
	 var id = GetObjectByIdFactory.getObjectById(logger_ids[i],$scope.owned_loggers);
	 if(id == null || id === undefined){//add more loggers to loggers array
     logger_id = logger_ids[i];
	 var url = server_string+'/remote_loggers/'+logger_id+'.json';
     $http.get(url).success(function(data){
     var logger = data;
     logger.showSiblings = false;
     var id = GetObjectByIdFactory.getObjectById(logger.id,$scope.owned_loggers);
	 if(id == null || id == undefined){//add more loggers to loggers array
     $scope.owned_loggers.push(logger);
     }
 })
	 }
	 }
    }
  $scope.share_project_with_user = function(project){
      if($scope.user.viewable_project_ids.indexOf(project.id) == -1){
      $scope.user.viewable_project_ids.push(project.id);
       var url = server_string+'/activeadmin/projects/'+project.id+'.json';
	   $http.get(url).success(function(data) {
	   var proj =  data;
	   $scope.shared_projects.push(proj);
	 }).error(function(data, status, headers, config) {
	    alert('error accured :' + JSON.stringify(data));
    });;
   }
  }
  $scope.unshare_project = function(project){
       var r=confirm("Are you sure You want to unshare project?");
       if(r){
       var index = $scope.user.viewable_project_ids.indexOf(project.id);
       if(index != -1){
           $scope.user.viewable_project_ids.splice(index,1);
       }
      index = -1;
      for(var i = 0 ; i < $scope.shared_projects.length ; i ++){
          var proj = $scope.shared_projects[i];
          if(proj.id == project.id){
            index = i;
             break;
          }
      }
      if(index != -1){
          $scope.shared_projects.splice(index,1);
      }
       }
  }
  $scope.delete_project = function(project){
   var r=confirm("Are you sure You want to delete project?");
    if(r){
   var url = server_string+'/activeadmin/projects/'+project.id;
   $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	 var csrf_token = $cookies['CSRF-TOKEN'];
	 var post_data = {};
	 post_data['authenticity_token'] = csrf_token;
     post_data['_method'] = 'delete';
     var urlEncodedObj = $.param(post_data);
	 $http.post(url, urlEncodedObj).success(function( data, status, headers, config) {
     //removing project from local projects list
     var index = $scope.owned_projects.indexOf(project);
     $scope.owned_projects.splice(index,1);
	 alert("project has been deleted successfully");
}).error(function(data, status, headers, config) {
	 alert('error accured :' + JSON.stringify(data));
    });
  }
  }
  }]);
  
  
 app.controller('userManagementCtrl', ['$scope', '$routeParams','$http','$location','breadcrumbs','GetObjectByUrlFactory',
 'GetObjectByIdFactory','SubmitPostFactory','$cookies',
  function($scope, $routeParams,$http,$location,breadcrumbs,GetObjectByUrlFactory,GetObjectByIdFactory,
  SubmitPostFactory,$cookies) { 
    $scope.location = $location;
    $scope.breadcrumbs = breadcrumbs;
    $scope.userId = $routeParams.userId;     
	var sysId = 1;	
	var url = server_string+'/activeadmin/projects.json?utf8=%E2%9C%93&q%5Bowner_id_eq%5D='+$scope.userId+'&commit=Filter&order=id_asc&per_page=-1'
    GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
    $scope.projects = data;
	var url = server_string+'/remote_loggers.json?owner_id='+$scope.userId;
    GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
    $scope.loggers = data;
	 for(var i = 0 ; i < $scope.loggers.length ; i++){//adding showSiblings attr to loggers
     var logger = $scope.loggers[i];
     logger['showSiblings'] = true;

	
	//making sure the only project_id in logger belongs to user
	var logger_projects = logger.project_ids;
	logger_projects = $scope.remove_unrelaited_projects(logger_projects);
	logger.project_ids = logger_projects;
   }
   for(var i = 0 ; i < $scope.projects.length ; i++){//adding showSiblings attr to projects
   var project = $scope.projects[i];
   project['showSiblings'] = true;
   //making sure the only project_id in logger belongs to user
	var project_loggers = project.remote_logger_ids;
    $scope.add_loggers(project_loggers);
	//project_loggers = $scope.remove_unrelaited_loggers(project_loggers);
	//project.remote_logger_ids = project_loggers;
   }
   $scope.showSiblings = function(obj) {
      obj.showSiblings = !obj.showSiblings;
    }
   $scope.getChevronClass = function(proj){
       var res = 'icon-chevron-up';
       if(proj.showSiblings){
           res = 'icon-chevron-down';
       }
       return res;
   }
	$scope.getLoggerProjects = function(logger){//return all project objects related to project
	  var project_ids = logger.project_ids;
	  var res = [];
	  for(var i = 0 ; i < project_ids.length ; i++){
	  var project_id = project_ids[i];
	  var project = GetObjectByIdFactory.getObjectById(project_id,$scope.projects);
	  if(project != null){
	  res.push(project);
	  }
	  }
	  return res;
	 }
	$scope.deletePair = function(logger_id,project){
    var r=confirm("Are you sure?");
    if(r){
	var logger_ids = project.remote_logger_ids;
	logger_ids.splice(logger_ids.indexOf(logger_id),1);	
	var logger = GetObjectByIdFactory.getObjectById(logger_id,$scope.loggers);
	var logger_projects = logger.project_ids;
    logger_projects.splice(logger_projects.indexOf(project.id),1);
	var url = server_string + '/remote_loggers/'+logger_id+'/detach/'+project.id+'.json';
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	var csrf_token = $cookies['CSRF-TOKEN']
	var post_data = {};
	post_data['authenticity_token'] = csrf_token;
	var parsed_post_data = $.param(post_data);
	$http.post(url, parsed_post_data).success(
	function(data){
	console.log('success');
	}
	).error(function(data, status, headers, config) {
	alert('error accured :' + JSON.stringify(data));        
    });
    }
	}
	$scope.addPair = function(project_id,logger_id){
     var r=confirm("Are you sure?");
    if(r){
	var project = GetObjectByIdFactory.getObjectById(project_id,$scope.projects);
	var project_loggers = project.remote_logger_ids;
	if(project_loggers.indexOf(logger_id) == -1){//if logger_id is not allready in project.remote_logger_ids
	project_loggers.push(logger_id);
	}	
	var logger = GetObjectByIdFactory.getObjectById(logger_id,$scope.loggers);
	var logger_projects = logger.project_ids;
    if(logger_projects.indexOf(project_id) == -1){//if project_id is not allready in logger.project_ids
	logger_projects.push(project_id);
	var url = server_string + '/remote_loggers/'+logger_id+'/attach/'+project_id+'.json'
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	var csrf_token = $cookies['CSRF-TOKEN']
	var post_data = {};
	post_data['authenticity_token'] = csrf_token;
	var parsed_post_data = $.param(post_data);
	$http.post(url, parsed_post_data).success(
	function(data){
	console.log('success');
	}
	).error(function(data, status, headers, config) {
	alert('error accured :' + JSON.stringify(data));        
    });
	}
	}
    }
	
  });
  });
    $scope.remove_unrelaited_loggers = function(logger_ids){
	 var res = [];
	 for(var i = 0 ; i < logger_ids.length ; i++){
	 var logger = GetObjectByIdFactory.getObjectById(logger_ids[i],$scope.loggers);
	 if(logger != null && logger != undefined){
	 res.push(logger.id);
	 }
	 }
	 return res;
	}
    $scope.add_loggers = function(logger_ids){
     for(var i = 0 ; i < logger_ids.length ; i++){
	 var id = GetObjectByIdFactory.getObjectById(logger_ids[i],$scope.loggers);
	 if(id == null || id === undefined){//add more loggers to loggers array
     logger_id = logger_ids[i];
	 var url = server_string+'/remote_loggers/'+logger_id+'.json';
     $http.get(url).success(function(data){
     var logger = data;
     var id = GetObjectByIdFactory.getObjectById(logger.id,$scope.loggers);
	 if(id == null || id === undefined){//add more loggers to loggers array
     logger.showSiblings = true;
     $scope.loggers.push(logger);
     }
     })
	 }
	 }
     }
    $scope.remove_unrelaited_projects = function(project_ids){
	 var res = [];
	 for(var i = 0 ; i < project_ids.length ; i++){
	 var project = GetObjectByIdFactory.getObjectById(project_ids[i],$scope.projects);
	 if(project != null && project != undefined){
	 res.push(project.id);
	 }
	 }
	 return res;
	}
     $scope.edit_project = function(project){
     var url = "#/users/"+$scope.userId+"/edit_project/"+project.id
	 window.location.assign(url);
	}
	}
	
  ]);
  
app.controller('projectConfigurationCtrl',['$http','$scope','$routeParams','GetObjectByUrlFactory','GetObjectByIdFactory','SubmitJsonFactory','$location','breadcrumbs','$cookies'
,function($http,$scope,$routeParams,GetObjectByUrlFactory,GetObjectByIdFactory,
SubmitJsonFactory,$location,breadcrumbs,$cookies){
 // $scope.edit_project = true;

//pagination
	$scope.itemsPerPage = 15;
    $scope.users_curent_page={
        cur_page:0
    };
     $scope.calcs_curent_page={
        cur_page:0
    };

    $scope.prevPage = function(curentPage) {
    if (curentPage.cur_page > 0) {
      curentPage.cur_page--;
    }
  };

  $scope.prevPageDisabled = function(curentPage) {
    return curentPage.cur_page === 0 ? "disabled" : "";
  };

  $scope.pageCount = function(arr) {
  try{
    return Math.ceil(arr.length/$scope.itemsPerPage)-1;
	}catch(e){
	}
  };

  $scope.nextPage = function(currentPage,arr) {
    if (currentPage.cur_page  < $scope.pageCount(arr)) {
      currentPage.cur_page ++;
    }
  };

  $scope.nextPageDisabled = function(currentPage,arr) {
    return currentPage.cur_page  === $scope.pageCount(arr) ? "disabled" : "";
  };
	//pagination end
$scope.location = $location;
//determine wether it is viewable project or editable project
var path = $scope.location.path();
$scope.edit_project = path.indexOf('edit_project') != -1;
$scope.view_project = path.indexOf('view_project') != -1;
$scope.breadcrumbs = breadcrumbs;
$scope.projectId = $routeParams.projectId;  
$scope.ownerId = $routeParams.userId;  
$scope.shared_user_id = -1;
//determine if it is a red only project or not
var path = $scope.location.path();
$scope.readonly = false;
if(path.indexOf('view_project') > -1){
$scope.readonly = true
}
var url = server_string+'/activeadmin/users/'+$scope.ownerId+'.json'
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
$scope.owner = data;
})



var url = server_string+'/activeadmin/projects/'+$scope.projectId+'.json';
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
$scope.project = data; 


var soilsUrl = server_string+'/activeadmin/soils.json?per_page=-1';
GetObjectByUrlFactory.getObjectByUrl(soilsUrl).success(function(data){
$scope.soils = data;

$scope.default_soil = GetObjectByIdFactory.getObjectById($scope.project.soil_id,$scope.soils);
var url = server_string+'/activeadmin/users.json?per_page=-1';
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
$scope.users = data;
var url = server_string+'/activeadmin/crops.json?per_page=-1';
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
$scope.crops = data;
var url = server_string+'/activeadmin/datasets.json?utf8=✓&q%5Bprojects_id_eq%5D='+$scope.projectId+'&commit=Filter&order=id_asc&per_page=-1';
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
$scope.calcs = data;
var shared_user_ids = $scope.project.shared_user_ids;
$scope.shared_users = [];
if(shared_user_ids){
for(var i = 0 ; i < shared_user_ids.length ; i++){
 var shared_user_id = shared_user_ids[i];
 var url = server_string+'/activeadmin/users/'+shared_user_id+'.json';
 GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
 $scope.shared_users.push(data);
})
}
}else{
$scope.project.shared_user_ids = [];
}
})//var url = server_string+'/activeadmin/crops.json?per_page=-1';
})
})
})///
})
$scope.submit_project = function(){
     if(!$scope.readonly){
	 var url = server_string+'/activeadmin/projects/'+$scope.projectId;
	 var csrf_token = $cookies['CSRF-TOKEN'];	 
	 var post_data = {};
	 post_data.authenticity_token = csrf_token;
	 post_data._method = 'patch';
     //cloning project for post
     var clone_of_proj = JSON.parse( JSON.stringify(  $scope.project ) );
     //deleting unpermited fields
     delete clone_of_proj.id;
     delete clone_of_proj.created_at;
     delete clone_of_proj.updated_at;
     delete clone_of_proj.mobile_prefs;
     delete clone_of_proj.remote_logger_ids;
	 post_data['project'] =  clone_of_proj;
     post_data['commit'] =  'Update Project';
	 var urlEncodedObj = $.param(post_data);			
     $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	 $http.post(url, urlEncodedObj).success(function(data){
	 alert('project has been updated successfully');
	 });

}
}
$scope.add_shared_user = function(user){
if( $scope.project.shared_user_ids.indexOf(user.id) == -1
&& user.id != -1
&& !$scope.readonly){//check if shared user is not already inserted
$scope.project.shared_user_ids.push(user.id);
$scope.shared_users.push(user);
}
}

$scope.delete_shared_user = function(user){
if( $scope.project.shared_user_ids.indexOf(user.id) != -1 
&& !$scope.readonly){//check if shared user is inserted
$scope.project.shared_user_ids.splice($scope.project.shared_user_ids.indexOf(user.id,1));
$scope.shared_users.splice($scope.shared_users.indexOf(user),1);
}
}
$scope.new_dataset = function(){
var path = $scope.location.path();
var url = "#/users/"+$scope.ownerId+"/edit_project_"+$scope.projectId+'/new_dataset';
if(path.indexOf('view_project') != -1){
 url = "#/users/"+$scope.ownerId+"/view_project_"+$scope.projectId+'/new_dataset';
}
window.location.assign(url);
}
$scope.mobile_prefs = function(){
var path = $scope.location.path();
var url = "#/users/"+$scope.ownerId+"/edit_project_"+$scope.projectId+'/mobile_prefs';
if(path.indexOf('view_project') != -1){
 url = "#/users/"+$scope.ownerId+"/view_project_"+$scope.projectId+'/mobile_prefs';
}
window.location.assign(url);
}
 $scope.manage_user = function(){
var url = "#/users/"+$scope.ownerId+"/manage_user";
window.location.assign(url);
}
 $scope.charts_page  = function(){
var url = server_string +'/projects/'+$scope.projectId+'/charts#';
window.location.assign(url);
}
}])



app.controller('newProjectCtrl',['$http','$scope','$routeParams','GetObjectByUrlFactory','GetObjectByIdFactory','SubmitJsonFactory','$location','breadcrumbs','$cookies','GetDateForDatePickerFactory',
function($http,$scope,$routeParams,GetObjectByUrlFactory,GetObjectByIdFactory,
SubmitJsonFactory,$location,breadcrumbs,$cookies,GetDateForDatePickerFactory){
//creating a new project object with null fields to connect to form and send to server on submit.
$scope.edit_project = false;//hide some of the fields if this is a new project
$scope.location = $location;
$scope.breadcrumbs = breadcrumbs;
$scope.ownerId = $routeParams.userId;
//getting todays date
var d=new Date();
var today = GetDateForDatePickerFactory.getDateForDatePicker(d);
var f = new Date();
f.setDate(f.getDate() + 10*365 /*days*/);
var future = GetDateForDatePickerFactory.getDateForDatePicker(f);
$scope.project = {
'name':'',
'soil_id': -1,
'crop_id' : -1,
'timezone':'UTC',
'latitude': -1,
'longitude': -1,
'activation_date':today,
'deactivation_date':future,
'activation_date(1i)':-1,
'activation_date(2i)':-1,
'activation_date(3i)':-1,
'deactivation_date(1i)':-1,
'deactivation_date(2i)':-1,
'deactivation_date(3i)':-1,
'owner_id': parseInt($scope.ownerId),//set default owner to be the owner that pressed "new project"
'logo':'phytechlogo.png',
'status':'active'
}

var url = server_string+'/activeadmin/users.json?per_page=-1';
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
$scope.users = data;
var url = server_string+'/activeadmin/users/'+$scope.ownerId+'.json'
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
$scope.owner = data;
$scope.shared_user_id = -1;
var soilsUrl = server_string+'/activeadmin/soils.json?per_page=-1';
GetObjectByUrlFactory.getObjectByUrl(soilsUrl).success(function(data){
$scope.soils = data;
var url = server_string+'/activeadmin/crops.json?per_page=-1';
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
$scope.crops = data;

})

})
})
})
$scope.convert_date_format_for_proj = function(date){
     var year = date.getFullYear();
	 var month = date.getMonth()+1;
	 var day = date.getDate();
	 var res = {};
	 res['1i'] = year;
	 res['2i'] = month;
	 res['3i'] = day;
	 return res
}
$scope.submit_project = function(){
	 var url = server_string+'/activeadmin/projects.json';
	 $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	 var csrf_token = $cookies['CSRF-TOKEN'];
	 var post_data = {};
	 post_data['authenticity_token'] = csrf_token;
	 post_data['commit'] = 'Create Project';
	 //converting the dates to post format as in activeadmin	
	 var activation_date = new Date($scope.project.activation_date);
	 var converted_date = $scope.convert_date_format_for_proj(activation_date);	
	 $scope.project['activation_date(1i)'] = converted_date['1i'];
	 $scope.project['activation_date(2i)'] = converted_date['2i'];
	 $scope.project['activation_date(3i)'] =  converted_date['3i'];
	 var deactivation_date = new Date($scope.project.deactivation_date);	 
	 var converted_date = $scope.convert_date_format_for_proj(deactivation_date);
     $scope.project['deactivation_date(1i)'] = converted_date['1i'];
	 $scope.project['deactivation_date(2i)'] = converted_date['2i'];
	 $scope.project['deactivation_date(3i)'] =  converted_date['3i'];
     //delete unpermited fields
     delete $scope.project.activation_date;
     delete $scope.project.deactivation_date;
     $scope.project.shared_user_ids = [];
	 post_data['project'] = $scope.project;
     var urlEncodedObj = $.param(post_data);
	 $http.post(url, urlEncodedObj).success(function( data, status, headers, config) {
	 alert("new project has been created successfully");
     //redirect to newly created project
     var location = headers('Location');
     var pathArray = location.split( '/' );
     var projId = pathArray[pathArray.length-1];
     window.location.assign("#/users/"+$scope.ownerId+"/edit_project_"+projId);
}).error(function(data, status, headers, config) {
	 alert('error accured :' + JSON.stringify(data));
    });
}

$scope.new_dataset = function(){
window.location.assign("#/users/"+$scope.ownerId+"/new_project_"+$scope.project.id+"/new_dataset");
}
}])





app.controller('newDataSetCtrl',['$http','$scope','$routeParams','GetObjectByUrlFactory','GetObjectByIdFactory','SubmitJsonFactory','$location','breadcrumbs','$cookies','GetDateForDatePickerFactory',
function($http,$scope,$routeParams,GetObjectByUrlFactory,GetObjectByIdFactory,
SubmitJsonFactory,$location,breadcrumbs,$cookies,GetDateForDatePickerFactory){
//pagination
	$scope.itemsPerPage = 15;
    $scope.currentPage = 0;
 

  $scope.prevPage = function() {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
    }
  };

  $scope.prevPageDisabled = function() {
    return $scope.currentPage === 0 ? "disabled" : "";
  };

  $scope.pageCount = function() {
  try{
    return Math.ceil($scope.parent_datasets.length/$scope.itemsPerPage)-1;
	}catch(e){
	}
  };

  $scope.nextPage = function() {
    if ($scope.currentPage < $scope.pageCount()) {
      $scope.currentPage++;
    }
  };

  $scope.nextPageDisabled = function() {
    return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
  };

	//pagination end
//creating a new dataset object with null fields to connect to form and send to server on submit.
$scope.location = $location;
$scope.breadcrumbs = breadcrumbs;
$scope.ownerId = $routeParams.userId;
$scope.projectId = $routeParams.projectId;
$scope.readonly = false;
$scope.offsets=[0,10,20,30,40,50,60,70,80,90,100];
$scope.calculation_types = [
{name:'Daily Evapotranspiration Greenhouse',id:205,selected_components : 5},
{name:'Water Meter',id:176,selected_components:1, calc_parameters : {litre_per_pulse: -1,
                                                                     number_of_trees: -1,
																	 scale_factor: -1,
																	 trees_per_acre: -1}},
{name:'Rain Meter',id:176,selected_components:1},
{name:'Vapor Pressure Deficit',id:204,selected_components:2},
{name:'Daily Evapotranspiration',id:203,selected_components:6},
 {name:'Degree Days Accumulation',id:206,selected_components:1,calc_parameters : {initialization_value : 0}},
 {name:'Tensiometer',id:160,selected_components:1,calc_parameters : {offset : 0}},
  {name:'SWP',id:209,selected_components:1,calc_parameters : {scale_factor : 0},offset:0}
];
$scope.selectedCalcType = null;

$scope.$watch('selectedCalcType',function(){
    if($scope.selectedCalcType){
    $scope.dataset.type_id = $scope.selectedCalcType.id;
    }
})
$scope.calculateFactor = function(){
    var  fixed_factor = 4047 ;
    var res = ($scope.dataset.calc_parameters.litre_per_pulse*$scope.dataset.calc_parameters.trees_per_acre)/(fixed_factor*$scope.dataset.calc_parameters.number_of_trees);
    return res;
}


$scope.project = {};
$http.get(server_string + '/activeadmin/projects/'+$scope.projectId+'.json').success(function(data) {
  $scope.project = data;
 })
$scope.dataset = {
origins : [],
calculation_type:{name:'',id:0,selected_components : 0},//mockup data
title: '',
sampling_interval_minutes : 60,
latitude: 0,
longitude: 0,
threshold_min:-1,
threshold_max:-1,
parent_ids : []
}

$scope.$watch('project', function(){
  $scope.dataset.latitude =  $scope.project.latitude;
  $scope.dataset.longitude =  $scope.project.longitude;
});
//terrible
 var url = server_string+'/projects/'+$scope.projectId+'/datasets.json';
 $http.get(url).success(function(data){
 $scope.parent_datasets = data;
 }) 
//terrible end
$scope.getNumber = function(num) {
    return new Array(num);   
}
$scope.chosen_parent = null;
$scope.showRow = function(rowIndex){
var res = false;
if(rowIndex < $scope.dataset.calculation_type.selected_components){
res = true;
}
return res;
}

$scope.add_parent = function(pd){
if($scope.dataset.calculation_type.selected_components > $scope.dataset.parent_ids.length){
$scope.dataset.parent_ids.push(pd);
}
}

$scope.delete_parent = function(id){
var index = $scope.dataset.parent_ids.indexOf(id);
$scope.dataset.parent_ids.splice(index,1);
$scope.dataset.origins.splice(index,1);
}

$scope.get_parent_by_id = function(id){
var res = undefined;
for(var i = 0 ; i < $scope.parent_datasets.length ; i++){
var pd = $scope.parent_datasets[i];
if(id == pd.id){
res = pd;
break;
}
}
return res;
}

$scope.$watch('dataset.type_id', function(){
  $scope.dataset.calculation_type =  GetObjectByIdFactory.getObjectById($scope.dataset.type_id ,$scope.calculation_types); ;
});
$scope.submit_dataset = function(){
	 var url = server_string+'/projects/'+$scope.projectId+'/datasets';

	 if($scope.dataset.type_id == 176 && $scope.selectedCalcType.name == 'Water Meter'){//ugly
	   $scope.dataset.calc_parameters.scale_factor =   $scope.calculateFactor();
	 }
	$scope.dataset.calculation_type = undefined;//delete unnecessary data
	//
	content_type = "application/json; charset=UTF-8";
    $http.defaults.headers.post["Content-Type"] = content_type;		  
	var csrf_token = $cookies['CSRF-TOKEN'];
    $http.defaults.headers.post["X-CSRF-Token"] = csrf_token;
	$http.defaults.headers.post["X-Requested-With"] = 'XMLHttpRequest';
	var post_data = {};
	post_data.dataset = $scope.dataset;
    $http.post(url, post_data).success(function(data) {
	 alert("user form has been posted successfully");
	}).error(function(data, status, headers, config) {
	 alert('error accured :' + JSON.stringify(data));     	     
    });
	//
	}
$scope.manage_user = function(){
    window.location.assign('#/users/'+$scope.ownerId+'/manage_user');
    }
}])






app.controller('newUserCtrl',['$http','$scope','$routeParams','GetObjectByUrlFactory','GetObjectByIdFactory','SubmitJsonFactory','$location','breadcrumbs','$cookies','GetDateTimeForDatePickerFactory',
function($http,$scope,$routeParams,GetObjectByUrlFactory,GetObjectByIdFactory,
SubmitJsonFactory,$location,breadcrumbs,$cookies,GetDateTimeForDatePickerFactory){
//creating a new project object with null fields to connect to form and send to server on submit.
$scope.location = $location;
$scope.breadcrumbs = breadcrumbs;
 $http.get(server_string + '/activeadmin/users.json?per_page=1000').success(function(data) {
  $scope.agronomists = data;
 })
$scope.user ={
       "first_name":"",
       "last_name":"",
       "password": "",
       "email":"",
       "agronomist_id":1,
       "country":"",
       "state":"",
       "address":"",
       "agronomist_id":-1,
        "metric_units":1
}

    $scope.metric_units = [{name:'metric',id:1},{name:'inches',id:0}];
    $scope.submit_user = function(){
	 var url = server_string + '/activeadmin/users.json';
	 content_type =  "application/x-www-form-urlencoded";
     $http.defaults.headers.post["Content-Type"] = content_type;
	 var csrf_token = $cookies['CSRF-TOKEN'];
     //$http.defaults.headers.post["X-CSRF-Token"] = csrf_token;
	 var post_data = {};
	 post_data['authenticity_token'] = csrf_token;
	 post_data['user'] = $scope.user;
	 var parsed_post_data = $.param(post_data);
	 return $http.post(url, parsed_post_data).success(function(data) {
	 alert("user form has been posted successfully");
	}).error(function(data){
	 alert('error accured :' + JSON.stringify(data));
	});
	}

}])












///////////////////////////////////////////////////////
app.controller('mobilePrefsCtrl',['$http','$scope','$routeParams','GetObjectByUrlFactory','GetObjectByIdFactory','SubmitJsonFactory','$location','breadcrumbs','$cookies','UpdateUserFactory',
function($http,$scope,$routeParams,GetObjectByUrlFactory,GetObjectByIdFactory,
SubmitJsonFactory,$location,breadcrumbs,$cookies,UpdateUserFactory){

 //pagination for portrait dataset
	$scope.itemsPerPage = 15;
    $scope.portrait_curent_page={
        cur_page:0
    };
     $scope.landscape_curent_page={
        cur_page:0
    };
    $scope.table_curent_page={
        cur_page:0
    };
     $scope.status_curent_page={
        cur_page:0
    };
    $scope.prevPage = function(curentPage) {
    if (curentPage.cur_page > 0) {
      curentPage.cur_page--;
    }
  };

  $scope.prevPageDisabled = function(curentPage) {
    return curentPage.cur_page === 0 ? "disabled" : "";
  };

  $scope.pageCount = function(arr) {
  try{
    return Math.ceil(arr.length/$scope.itemsPerPage)-1;
	}catch(e){
	}
  };

  $scope.nextPage = function(currentPage,arr) {
    if (currentPage.cur_page  < $scope.pageCount(arr)) {
      currentPage.cur_page ++;
    }
  };

  $scope.nextPageDisabled = function(currentPage,arr) {
    return currentPage.cur_page  === $scope.pageCount(arr) ? "disabled" : "";
  };

	// pagination end

$scope.location = $location;
$scope.breadcrumbs = breadcrumbs;
$scope.projectId = $routeParams.projectId;
$scope.ownerId = $routeParams.userId;
$scope.shared_user_id = -1;
$scope.show_graphs = true;
//determine if it is a red only project or not
var path = $scope.location.path();
$scope.targetColor = '#ebebeb';
$scope.datasets = [];


var url = server_string+'/projects/'+$scope.projectId+'/mobile_prefs.json';
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
$scope.mobile_prefs = data;
//init mobile_prefs in case it is empty
if(JSON.stringify($scope.mobile_prefs) == '{}'){
    //mobile_prefs.graph_metadata.graphs
  $scope.mobile_prefs.graph_metadata = {};
  $scope.mobile_prefs.graph_metadata.graphs = [];
  $scope.mobile_prefs.graph_metadata.tables = [];
  $scope.mobile_prefs.graph_metadata.plant_status_ids = [];
  $scope.mobile_prefs.graph_metadata.plant_status_id = -1;
  $scope.mobile_prefs.enabled_indicators = {};
}
if($scope.mobile_prefs.enabled_indicators == undefined){
   $scope.mobile_prefs.enabled_indicators = {};
}
 $scope.enabled_indicators =
 {
    "plant_status": {
    "units": "%"
    },
     "degree_days": {
     "units": "DD"

    }
  ,"cotton_yield": {
     "units": "yield_rate"
    }
 };

    //init indicators for $scope.enabled_indicators to be the same as $scope.mobile_prefs.enabled_indicators if exist
    for(var key in  $scope.mobile_prefs.enabled_indicators){
        var value = $scope.mobile_prefs.enabled_indicators[key];
        $scope.enabled_indicators[key] =  value;
    }
    $scope.is_indicator_present = function(key){
        var res = false;
        if($scope.mobile_prefs.enabled_indicators[key] != undefined){
            res = true;
        }
        return res;
    }
    $scope.search_calctype = function(calc_type_to_search,arr){
        var res = null;
        for(var i = 0 ; i < arr.length ; i++){
            var obj = arr[i];
            if(obj.calc_type.toLowerCase().indexOf(calc_type_to_search.toLowerCase()) != -1){
               res = obj;
                break;
            }
        }
        return res;
    }
 $scope.search_for_plant_status_ma = function(dataset){
     var res = null;
     for(var i = 0 ; i < $scope.datasets.length ; i++){
         var target_data_set = $scope.datasets[i];
         //looking for same orig in both datasets
         for(var j = 0 ; j < target_data_set.origins.length ; j++){
             var t_origin = target_data_set.origins[j];
             for(var k = 0 ; k < dataset.origins.length ; k++){
                 var s_orig = dataset.origins[k];
                 if(t_origin == s_orig && target_data_set.calc_type == 'plant_status_ma'){
                     //aureka
                     res = target_data_set;
                     break;
                 }
             }
         }
     }
     return res;
 }
 $scope.add_remove_indicator = function(key,value){
   if($scope.mobile_prefs.enabled_indicators[key]  && !value.checked){
      //delete this param from enabled_indicators
      delete $scope.mobile_prefs.enabled_indicators[key]
   }else if($scope.mobile_prefs.enabled_indicators[key] == undefined && value.checked){
      //clonning value for deleting un necesary fields
      var copiedValue = {};
      jQuery.extend(copiedValue,value);
      delete copiedValue.checked;
      //find correct dataset_id for inserted indicator
      var calc_type_to_search = null;
      switch (key) {
      case "plant_status":
           calc_type_to_search = 'plant_status';
      break;
    case "degree_days":
            calc_type_to_search = 'degree_days';
    break;
    case "cotton_yield":
        calc_type_to_search = "plant_status_ma";
           break;
    default :
             break;
    }
     var dataset =   $scope.search_calctype(calc_type_to_search,$scope.datasets);
       if(dataset){
          if(key == "plant_status"){
            var ma_dataset = $scope.search_for_plant_status_ma(dataset);
            if(ma_dataset){
            copiedValue.ma_dataset_id = ma_dataset.id;
            }else{
                alert('its ashame but we couldnt find a ma_dataset for this dataset');
            }
          }
          copiedValue.dataset_id = dataset.id;
          $scope.mobile_prefs.enabled_indicators[key] = copiedValue;
       }else{
           delete $scope.mobile_prefs.enabled_indicators[key];
           value.checked = false;
           alert("Dataset could not be inserted because "+calc_type_to_search+ " could not be found.");
       }

   }
 }
var url = server_string+'/projects/'+$scope.projectId+'/datasets.json';
GetObjectByUrlFactory.getObjectByUrl(url).success(function(data){
  $scope.datasets = data;
 //get the system user for template graphs and table
}).error(function(data){
    alert('error accured :' + JSON.stringify(data));
});
})

$scope.$watch('mobile_prefs', function(){
  $scope.init_selected_graph_obj();
  $scope.init_selected_table_obj();
});
$scope.show_landscape_dataset_search = false;
$scope.show_portrait_dataset_search = false;
$scope.show_table_dataset_search = false;
$scope.show_status_dataset_search = false;
$scope.get_landscape_class = function(){
    var res = '';
}
$scope.submit_mobile_prefs_graph = function(graph,mobile_prefs,projId){
    if(graph != null){
    $scope.save_graph(graph,mobile_prefs);
    }
    $scope.prepere_mobile_prefs_for_submit(mobile_prefs); //clear all '#' out of datasets colorss
	 var url = server_string+'/projects/' + projId + '/mobile_prefs';
     $http.defaults.headers.post["Content-Type"] = "application/json; charset=UTF-8";
     var csrf_token = $cookies['CSRF-TOKEN'];
     $http.defaults.headers.post["X-CSRF-Token"] = csrf_token;
     $http.defaults.headers.post["X-Requested-With"] = 'XMLHttpRequest';
	 $http.post(url, mobile_prefs).success(function(data){
     $scope.prepere_mobile_prefs_for_show(mobile_prefs);
	 alert('mobile prefs has been updated successfully');
	 }).error(function(data){
        alert('error accured :' + JSON.stringify(data));
     });

}

    $scope.submit_mobile_prefs_table = function(table,mobile_prefs,projectId){
    if(table != null){
    $scope.save_table(table);
    }
    $scope.prepere_mobile_prefs_for_submit(mobile_prefs); //clear all '#' out of datasets colorss
	 var url = server_string+'/projects/' + projectId + '/mobile_prefs';
     $http.defaults.headers.post["Content-Type"] = "application/json; charset=UTF-8";
     var csrf_token = $cookies['CSRF-TOKEN'];
     $http.defaults.headers.post["X-CSRF-Token"] = csrf_token;
     $http.defaults.headers.post["X-Requested-With"] = 'XMLHttpRequest';
	 $http.post(url, $scope.mobile_prefs).success(function(data){
     $scope.prepere_mobile_prefs_for_show(mobile_prefs);
	 alert('mobile prefs has been updated successfully');
	 }).error(function(data){
        alert('error accured :' + JSON.stringify(data));
     });;


}

$scope.submit_web_client_prefs_graph = function(){
	//UpdateUserFactory.updateUser($scope.sys_user);//avoid code duplicate is allways good

}

$scope.get_title = function(data_set){
    var res = ''
    if($scope.datasets.length){
    var obj = GetObjectByIdFactory.getObjectById(data_set.id,$scope.datasets);
    if(obj && obj.title){
        res = obj.title
    }
    }
    return res;
}


$scope.get_title_by_id = function(id){
    var res = ''
    if($scope.datasets.length){
    var obj = GetObjectByIdFactory.getObjectById(id,$scope.datasets);
    if(obj && obj.title){
        res = obj.title
    }
    }
    return res;
}
$scope.delete_from_array = function(data_set,arr){
    var index = arr.indexOf(data_set);
    if(index != -1){
        arr.splice(index,1);
    }
}

$scope.add_dataset = function(dataset,arr,color){
 var obj = GetObjectByIdFactory.getObjectById(dataset.id,arr);
 if(obj == null || obj == undefined){
     var topush = {id:dataset.id,color:color}
     arr.push(topush);
 }
}

 $scope.add_dataset_table = function(dataset,arr){
 var obj = GetObjectByIdFactory.getObjectById(dataset.id,arr);
 if(obj == null || obj == undefined){
     var topush = {id:dataset.id}
     topush.title = $scope.get_title(dataset);
     arr.push(topush);
 }
}
$scope.load_graph = function(graph){
 //change color formats
 for(var i = 0 ; i < graph.landscape.data_sources.length ; i++){
  var dataset = graph.landscape.data_sources[i];
  if(dataset.color.indexOf('#') == -1){
  dataset.color = '#'+dataset.color
  }
 }
 for(var i = 0 ; i < graph.portrait.data_sources.length ; i++){
  var dataset = graph.portrait.data_sources[i];
   if(dataset.color.indexOf('#') == -1){
  dataset.color = '#'+dataset.color
  }
 }
 $scope.selected_graph_obj = graph;
 }

 $scope.load_table = function(table){
 $scope.selected_table_obj = table;
 }
 $scope.new_table = function(){
     $scope.selected_table_obj =  {"title":"",
         "data_sources":[],
         "days_back":5}
 }
 $scope.new_graph = function(){
     $scope.selected_graph_obj = {"category":"Plant",
    "portrait":{"title":"",
    "data_sources":[]},
    "landscape":{"title":"","data_sources":[]}
 }

 }
 $scope.save_graph = function(graph,mobile_prefs){
     if(mobile_prefs.graph_metadata.graphs.indexOf(graph) == -1){
     mobile_prefs.graph_metadata.graphs.push(graph);
     }
 }

  $scope.graphs_class = function(){
        var res = '';
        if($scope.show_graphs){
            res = 'active';
        }
        return res;
    }
     $scope.tables_class = function(){
        var res = '';
        if(!$scope.show_graphs){
            res = 'active';
        }
        return res;
    }

    $scope.init_selected_graph_obj = function(){
        try{
        if( $scope.mobile_prefs.graph_metadata.graphs.length){
        $scope.selected_graph_obj = $scope.mobile_prefs.graph_metadata.graphs[0];
        }else{
            $scope.new_graph();
        }
        }catch(e){
          $scope.new_graph();
        }finally{
        $scope.load_graph($scope.selected_graph_obj );
        }
    }
    $scope.init_selected_table_obj = function(){
        try{
        if($scope.mobile_prefs.graph_metadata.tables.length){
            $scope.selected_table_obj = $scope.mobile_prefs.graph_metadata.tables[0];
        }else{
            $scope.new_table();
        }
        }catch(e){
             $scope.new_table();
        }
    }
    $scope.save_table = function(table){
       if( $scope.mobile_prefs.graph_metadata.tables.indexOf(table) == -1){
       $scope.mobile_prefs.graph_metadata.tables.push(table);
       }
    }
    $scope.getSelectedTableClass= function(table){
        var res = "icon-edit bigger-160";
        if(table == $scope.selected_table_obj){
          res = "selectedItem "+res;
        }
        return res;
    }
    $scope.getSelectedGraphClass= function(graph){
        var res = "icon-edit bigger-160";
        if(graph == $scope.selected_graph_obj){
          res = "selectedItem "+res;
        }
        return res;
    }
    $scope.getTableClass = function(){
        var res = "icon-plus bigger-230";
        if($scope.show_table_dataset_search){
         res = "icon-minus bigger-230";
        }
        return res;
    }
     $scope.getStatusClass = function(){
        var res = "icon-plus bigger-230";
        if($scope.show_status_dataset_search){
         res = "icon-minus bigger-230";
        }
        return res;
    }
    $scope.set_status = function(dataset){
       $scope.mobile_prefs.graph_metadata.plant_status_id = dataset.id;
       $scope.mobile_prefs.graph_metadata.plant_status_ids[0] = dataset.id;
    }
    $scope.prepere_mobile_prefs_for_submit = function(mobile_prefs){
        //clear the '#' out of all datasets colors in graph
       var graphs = mobile_prefs.graph_metadata.graphs;
       for(var k = 0 ; k < graphs.length ; k++){
       var graph = graphs[k];
       for(var i = 0 ; i < graph.landscape.data_sources.length ; i++){
       var dataset = graph.landscape.data_sources[i];
         if(dataset.color.indexOf('#') != -1){
         dataset.color = dataset.color.replace('#','');
        }
       }
      for(var i = 0 ; i < graph.portrait.data_sources.length ; i++){
       var dataset = graph.portrait.data_sources[i];
         if(dataset.color.indexOf('#') != -1){
        dataset.color = dataset.color.replace('#','');
       }
        }
       }
    }
     $scope.prepere_mobile_prefs_for_show = function(mobile_prefs){
        //clear the '#' out of all datasets colors in graph
       var graphs = mobile_prefs.graph_metadata.graphs;
       for(var k = 0 ; k < graphs.length ; k++){
       var graph = graphs[k];
       for(var i = 0 ; i < graph.landscape.data_sources.length ; i++){
       var dataset = graph.landscape.data_sources[i];
         if(dataset.color.indexOf('#') == -1){
         dataset.color = '#'+dataset.color;
        }
       }
      for(var i = 0 ; i < graph.portrait.data_sources.length ; i++){
       var dataset = graph.portrait.data_sources[i];
         if(dataset.color.indexOf('#') == -1){
        dataset.color = '#'+dataset.color
       }
        }
       }
    }
    $scope.delete_graph = function(graph){
     var r=confirm("Are you sure You want to delete graph?");
     if(r){
     var index = $scope.mobile_prefs.graph_metadata.graphs.indexOf(graph);
     $scope.mobile_prefs.graph_metadata.graphs.splice(index,1);
     $scope.submit_mobile_prefs_graph(null,$scope.mobile_prefs,$scope.projectId);
     $scope.init_selected_graph_obj();
     }
    }
    $scope.delete_table = function(table){
     var r=confirm("Are you sure You want to delete table?");
     if(r){
     var index = $scope.mobile_prefs.graph_metadata.tables.indexOf(table);
     $scope.mobile_prefs.graph_metadata.tables.splice(index,1);
      $scope.submit_mobile_prefs_table(null,$scope.mobile_prefs,$scope.projectId);
     $scope.init_selected_table_obj();
    }
    }
    $scope.save_graph_as_template = function(){
     if($scope.client_prefs.graph_metadata == undefined){
         $scope.client_prefs.graph_metadata = {};
         $scope.client_prefs.graph_metadata.graphs = [];
     }
     $scope.client_prefs.graph_metadata.graphs.push($scope.selected_graph_obj);
     $scope.submit_mobile_prefs_graph($scope.selected_graph_obj,$scope.client_prefs);
    }
    $scope.save_table_as_template = function(){
     if($scope.client_prefs.tables == undefined){
         $scope.client_prefs.tables = [];
     }
     $scope.client_prefs.tables.push($scope.selected_table_obj);
    }

    $scope.getLandscapeClass = function(){
        var res = "icon-plus bigger-230";
        if($scope.show_landscape_dataset_search){
           res =   "icon-minus bigger-230";
        }
        return res;
    }
     $scope.getPortraitClass = function(){
        var res = "icon-plus bigger-230";
        if($scope.show_portrait_dataset_search){
           res =   "icon-minus bigger-230";
        }
        return res;
    }
}]);



app.controller('untestedLoggersCtrl', ['$scope', '$routeParams','$http','$cookies','loggerRepository','UserLoggersRepository',
'ChangeLoggerOwnerFactory','SubmitJsonFactory','GetDateTimeFormatForAngularFactory','GetDateTimeFormatForRubbyFactory','breadcrumbs','$location',
'$filter','GetObjectByIdFactory','GetObjectByUrlFactory',
  function($scope, $routeParams,$http,$cookies,loggerRepository,UserLoggersRepository,ChangeLoggerOwnerFactory,SubmitJsonFactory,GetDateTimeFormatForAngularFactory,GetDateTimeFormatForRubbyFactory,
    breadcrumbs,$location,$filter ,GetObjectByIdFactory,GetObjectByUrlFactory) {
	//pagination
//pagination for portrait dataset
	$scope.itemsPerPage = 15;
    $scope.untested_loggers_curent_page={
        cur_page:0
    };
       $scope.tested_loggers_curent_page={
        cur_page:0
    };
    $scope.prevPage = function(curentPage) {
    if (curentPage.cur_page > 0) {
      curentPage.cur_page--;
    }
  };

  $scope.prevPageDisabled = function(curentPage) {
    return curentPage.cur_page === 0 ? "disabled" : "";
  };

  $scope.pageCount = function(arr) {
  try{
    return Math.ceil(arr.length/$scope.itemsPerPage)-1;
	}catch(e){
	}
  };

  $scope.nextPage = function(currentPage,arr) {
    if (currentPage.cur_page  < $scope.pageCount(arr)) {
      currentPage.cur_page ++;
    }
  };

  $scope.nextPageDisabled = function(currentPage,arr) {
    return currentPage.cur_page  === $scope.pageCount(arr) ? "disabled" : "";
  };


	//pagination end
 //get all untested loggers
   $http.get(server_string+'/remote_loggers/unattached.json?tested=false').success(function(data){
    $scope.untested_loggers_arr = data;
    $http.get(server_string+'/remote_loggers/unattached.json?tested=true').success(function(data){
     $scope.tested_loggers_arr = data;
    })
   })
  $scope.test_logger = function(logger){
      var r=confirm("Are you sure You want make logger "+logger.id+" tested?");
      if(r){
      var url = server_string + '/remote_loggers/'+logger.id+'/tested.json';
      var csrf_token = $cookies['CSRF-TOKEN'];
      $http.defaults.headers.post["X-CSRF-Token"] = csrf_token;
      $http.defaults.headers.post["X-Requested-With"] = 'XMLHttpRequest';
      $http.post(url).success(function(data){
      var index = $scope.untested_loggers_arr.indexOf(logger);
      $scope.untested_loggers_arr.splice(index,1);
       console.log('success');
      }).error(function(data){
          alert('error accured:' +  JSON.stringify(data))
      })
      }else{
          logger.tested = false;
      }
  }
  }]);
////////////////////////////////////////////////////////




app.controller('pushNotificationsCtrl', ['$scope', '$routeParams','$http','$cookies','loggerRepository','UserLoggersRepository',
'ChangeLoggerOwnerFactory','SubmitJsonFactory','GetDateTimeFormatForAngularFactory','GetDateTimeFormatForRubbyFactory','breadcrumbs','$location',
'$filter','GetObjectByIdFactory','GetObjectByUrlFactory',
  function($scope, $routeParams,$http,$cookies,loggerRepository,UserLoggersRepository,ChangeLoggerOwnerFactory,SubmitJsonFactory,GetDateTimeFormatForAngularFactory,GetDateTimeFormatForRubbyFactory,
    breadcrumbs,$location,$filter ,GetObjectByIdFactory,GetObjectByUrlFactory) {


      //test post to android device
      var url = 'https://android.googleapis.com/gcm/send'
      $http.defaults.headers.post["Content-Type"] = 'application/json';
      $http.defaults.headers.post["Authorization"] = 'Key=AIzaSyAFKc2e5mr7xBHDidbNBoRcVji1IUaiP4k';
      var payload = {"registration_ids" : ["99"],
  "data" : {
    "Shalom":"Shalom"
  }};
      $http.post(url,payload).success(function(data){
      alert('message has been sent  successfully')
      }).error(function(data){
          alert('error accured:' +  JSON.stringify(data))
      })

  }]);

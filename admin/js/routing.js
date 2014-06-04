app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '/admin/partials/users_page.html',
        controller: 'DemoCtrl'
      }).
      when('/users/new_user', {
        templateUrl: '/admin/partials/new_user.html',
        controller: 'newUserCtrl'
      }).
       when('/production', {
        templateUrl: '/admin/partials/untested_loggers.html',
        controller: 'untestedLoggersCtrl'
      }).
      when('/users/:userId', {
        templateUrl: '/admin/partials/user_configuration.html',
        controller: 'userConfigurationCtrl'
      }).
	   when('/users/:userId/edit_project_:projectId', {
        templateUrl: '/admin/partials/edit_project.html',
        controller: 'projectConfigurationCtrl'
      }).	
	    when('/users/:userId/new_project', {
        templateUrl: '/admin/partials/edit_project.html',
        controller: 'newProjectCtrl'
      }).	
	  when('/users/:userId/view_project_:projectId', {
        templateUrl: '/admin/partials/edit_project.html',
        controller: 'projectConfigurationCtrl'
      }).	
	   when('/users/:userId/view_project_:projectId/new_dataset', {
        templateUrl: '/admin/partials/new_dataset.html',
        controller: 'newDataSetCtrl'
      }).	
	   when('/users/:userId/edit_project_:projectId/new_dataset', {
        templateUrl: '/admin/partials/new_dataset.html',
        controller: 'newDataSetCtrl'
      }).	
	   when('/users/:userId/new_project_:projectId/new_dataset', {
        templateUrl: '/admin/partials/new_dataset.html',
        controller: 'newDataSetCtrl'
      }).
      when('/users/:userId/edit_project_:projectId/mobile_prefs', {
        templateUrl: '/admin/partials/mobile_prefs.html',
        controller: 'mobilePrefsCtrl'
      }).
	   when('/users/:userId/new_project_:projectId/mobile_prefs', {
        templateUrl: '/admin/partials/mobile_prefs.html',
        controller: 'mobilePrefsCtrl'
      }).
     when('/users/:userId/manage_user', {
        templateUrl: '/admin/partials/user_management.html',
        controller: 'userManagementCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
  //#/users/6/edit_project/21/new_dataset
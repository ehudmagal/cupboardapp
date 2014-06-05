'use strict';

/* Directives */

//add drggable directive to app
app.directive('draggable', function() {
    return function(scope, element) {
        // this gives us the native JS object
        var el = element[0];

        el.draggable = true;

        el.addEventListener(
            'dragstart',
            function(e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('Text', this.id);
                this.classList.add('drag');
                return false;
            },
            false
        );

        el.addEventListener(
            'dragend',
            function(e) {
                this.classList.remove('drag');
                return false;
            },
            false
        );
    }
});

var INTEGER_REGEXP =  /^\-?\d+((\.|\,)\d+)?$/;
app.directive('integer', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (INTEGER_REGEXP.test(viewValue)) {
          // it is valid
          ctrl.$setValidity('integer', true);
          return viewValue;
        } else {
          // it is invalid, return undefined (no model update)
          ctrl.$setValidity('integer', false);
          return undefined;
        }
      });
    }
  };
});


app.directive('droppable', function() {
    return {
        link: function(scope, element) {
            // again we need the native object
       var el = element[0];
	    el.scope = scope//this is for using scope inside event listeners	
	    el.addEventListener(
    'dragover',
    function(e) {
        e.dataTransfer.dropEffect = 'move';
        // allows us to drop
        if (e.preventDefault) e.preventDefault();
        this.classList.add('over');
        return false;
    },
    false
   );
   el.addEventListener(
    'dragenter',
    function(e) {
        this.classList.add('over');
        return false;
    },
    false
);

el.addEventListener(
    'dragleave',
    function(e) {
        this.classList.remove('over');
        return false;
    },
    false
);

el.addEventListener(
    'drop',
    function(e) {
        // Stops some browsers from redirecting.
        if (e.stopPropagation) e.stopPropagation();
        this.classList.remove('over');
        var item = document.getElementById(e.dataTransfer.getData('Text'));
		var logger_id = item.id;
		var project_id = e.target.id;
        var target = e.target;
        while(project_id == ''){//going to parent until we find project. ugly.
         target = target.parentNode;
         project_id = target.id;
        }
		//check if project have been dragged to project
		if(logger_id.indexOf("project") != -1 && project_id.indexOf("logger") != -1){//swap
		    var temp = logger_id;
			logger_id = project_id;
			project_id = temp;
		}else if(logger_id.indexOf("logger") != -1 && project_id.indexOf("logger") != -1){//same objects, exit
		 return false;
		}
		else if(logger_id.indexOf("project") != -1 && project_id.indexOf("project") != -1){//same objects, exit
		 return false;
		}
		logger_id = parseInt(logger_id.replace("logger_",""));
		project_id = parseInt(project_id.replace("project_",""));
		scope.addPair(project_id,logger_id);				
		scope.$apply();
        return false;
    },
    false
);
   
 }
    }
});



app.directive('notdroppable', function() {
    return {
        link: function(scope, element) {
            // again we need the native object
       var el = element[0];
	    el.scope = scope//this is for using scope inside event listeners
	    el.removeEventListener(
    'dragover',
    function(e) {
        return false;
    },
    false
   );
   el.removeEventListener(
    'dragenter',
    function(e) {
        return false;
    },
    false
);

el.removeEventListener(
    'dragleave',
    function(e) {
        return false;
    },
    false
);

el.removeEventListener(
    'drop',
    function(e) {
        return false;
    },
    false
);

 }
    }
});




app.directive('notdraggable', function() {
    return function(scope, element) {
        // this gives us the native JS object
        var el = element[0];

        el.draggable = false;

        el.removeEventListener(
            'dragstart',
            function(e) {
                return false;
            },
            false
        );

        el.removeEventListener(
            'dragend',
            function(e) {
                return false;
            },
            false
        );
    }
});

app.directive('cutledder', function() {
    return function(scope, element) {
        // this gives us the native JS object
        var el = element[0];
        var a=0;
    }
});

var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;
app.directive('smartFloat', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (FLOAT_REGEXP.test(viewValue)) {
          ctrl.$setValidity('float', true);
          return parseFloat(viewValue.replace(',', '.'));
        } else {
          ctrl.$setValidity('float', false);
          return undefined;
        }
      });
    }
  };
});



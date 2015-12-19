screen = 0;
nextEnable = 0;

var Gender = {
  MALE: 0,
  FEMALE: 1
};

var questions = [
    "גבר או אישה?",
    "מה לדעתך יהיה גובה הפנסיה החודשית שלך?",
    "מהי ההכנסה החודשית שלך?",
    "כמה שנים אתה כבר חוסך לפנסיה?",
    "כמה שנים את כבר חוסכת לפנסיה?"
];

var values;
var user_prop;

var loadCalculator = function() {
	$('#assumption').html("₪ "+(getUserProperty("assumption_pens")));
	var gender = getUserProperty("gender");
	$('document').ready(function() {
		$.getJSON("includes/data.json", function(data) {
			calculator_params = data["calculator_scales"];
			initParams(calculator_params);
			values = new Array(calculator_params.length);
			for (var i = 0; i < calculator_params.length; i++) {
				var id = "range"+i;
				var sHTML = '<div id="slider"><div id="calcQues">';
				if(gender == Gender.MALE) {
					sHTML += calculator_params[i]["male_q"];
				} else if (gender == Gender.FEMALE) {
					sHTML += calculator_params[i]["female_q"];
				}
				sHTML += '</div><input type="text" id="'+id+'" value="" name="range" /></div>';
				var slider = $(sHTML);
				$("#sliderArea").append(slider);
				
				if(calculator_params[i]["is_fixed"]) {
					createFixedSlider(i, calculator_params[i]);
				} else {
					createSlider(i, calculator_params[i]);	
				}
			}
			getParams();
			calculate();
		});
		$(document).scroll(function() {
			  var y = $(this).scrollTop();
			  if (y > 500) {
			    $('.bottomFinish').fadeIn('fast');
			    $('.bottomFinish').click(function() {
					window.location.href = 'finish.html';
				});
			  }
		});
	});
};

var createFixedSlider = function(id, scale) {
	$("#range"+id).ionRangeSlider({
    	keyboard: true,
        min: scale["min_val"],
        max: scale["max_val"],
        from: scale["default"],
        type: 'single',
        values: scale["values"],
        prefix: scale["prefix"],
        grid_num: id,
	});
	$("#range"+id).on("change", function () {
    		var $this = $(this), value = $this.prop("value");
        	values[id] = value;
        	getParams();
        	calculate();
	});
	$("#range"+id).on("update", function () {
    		var $this = $(this), value = $this.prop("value");
        	values[id] = value;
        	getParams();
        	calculate();
	});
	$("#range"+id).on("finish", function () {
    		var $this = $(this), value = $this.prop("value");
        	values[id] = value;
        	getParams();
        	calculate();
	});
	values[id] = $("#range"+id).prop("value");
};

var createSlider = function(id, scale) {
	var from = scale["default"];
	if(id == 0) {
		from = salary;
	} else if (id == 9) {
		from = savings;
	}
	$("#range"+id).ionRangeSlider({
    	keyboard: true,
        min: scale["min_val"],
        max: scale["max_val"],
        from: from,
        type: 'single',
        step: scale["steps"],
        prefix: scale["prefix"],
        grid_num: id,
		onChange: function (data) {
		  	var $this = $(this);
		    values[$this.prop("grid_num")] = data.from;
        	getParams();
        	calculate();
		},
		onUpdate: function (data) {
       		var $this = $(this);
		    values[$this.prop("grid_num")] = data.from;
        	getParams();
        	calculate();
    	},
    	onFinish: function (data) {
      		var $this = $(this);
		    values[$this.prop("grid_num")] = data.from;
        	getParams();
        	calculate();
    	}
	});
	values[id] = $("#range"+id).prop("value");
};


var nextDisabled = function() {
	nextEnable = 0;
	if (screen==3) {
		var btn_disabled = '<section id="calc_disabled"></section>';
	} else {
		var btn_disabled = '<section id="btn_disabled"></section>';
	}
	$('#next_btn').html(btn_disabled);
	$('#next_btn').unbind('click');
};

var nextEnabled = function() {
	if(!nextEnable) {
		if (screen==3) {
			var btn_enabled = '<section id="calc_enabled"></section>';
		} else {
			var btn_enabled = '<section id="btn_enabled"></section>';	
		}
		$('#next_btn').html(btn_enabled);
		$("#next_btn").click(function() {
			screen++;
			saveUser();
			setScreen();
		});
		nextEnable = 1;
	}
};

var incrementCircles = function() {
	var circles = '<ul>';
	for (var i=0; i<4; i++) {
		if(i==0) {
			if (i == 3-screen) {
				circles += '<li class="selected left"></li>';
			} else {
				circles += '<li class="left"></li>';	
			}
		} else {
			if (i == 3-screen) {
			circles += '<li class="selected"></li>';
			} else {
				circles += '<li></li>';
			}	
		}
	}
	$("#circles").html(circles);
	if(screen == 3) {
		$("#circles").css("top", "90px");
	}
};

var loadUser = function() {
	$('document').ready(function() {
		$.getJSON("includes/data.json", function(data) {
			user_prop = data["user"];
			console.log(user_prop);
		});
	});
};

var setUserProperty = function(property, value) {
	localStorage.setItem(property, value);
	console.log("property: "+property+ " = "+localStorage.getItem(property));
};

var getUserProperty = function(property) {
	return localStorage.getItem(property);
};

var saveUser = function() {
	/*localStorage.setItem("gender",user_prop["gender"]);
	console.log("user prop from storage: "+localStorage.getItem("gender"));*/
};

var getUserGender = function() {
	nextDisabled();
	$('#question').html(questions[0]);
	$('#icon').html('<section id="female"></section><section id="male"></section>');
	$("#male").html('<img src="img/malered.png">');
	$("#female").html('<img src="img/femalered.png">');
	$("#male").click(function() {
		setUserProperty("gender", Gender.MALE);
		$("#male").html('<img src="img/maleblue.png">');
		$("#female").html('<img src="img/femalered.png">');
		nextEnabled();
	}).css("cursor", "pointer");
	$("#female").click(function() {
		setUserProperty("gender", Gender.FEMALE);
		$("#male").html('<img src="img/malered.png">');
		$("#female").html('<img src="img/femaleblue.png">');
		nextEnabled();
	}).css("cursor", "pointer");
};

var getUserAssumption = function() {
	nextDisabled();
	$('#question').fadeOut('slow', function() {
		$('#question').html(questions[1]);
	    $('#question').fadeIn('slow').css("font-size", "80px");
	});
	$('#icon').fadeOut('slow', function() {
		$('#icon').html('<img src="img/graphred.png">');
		$('#icon').fadeIn('slow');
	});
	$('#user_input').fadeOut('slow', function() {
		$('#user_input').html('<section id="line"><img src="img/line.png"></section>');
		$('#user_input').append('<section id="currency"><img src="img/layer_15.png"></section>');
		$('#user_input').append('<input type="text" id="inp_field">');
		$("#inp_field").bind('keyup', function() {
			var sanitized = $(this).val().replace(/[^0-9]/g,'');
  			$(this).val(sanitized);
			var empty = false;
            if ($(this).val() == '') {
                empty = true;
            } else if ($(this).val().length > 8) {
            	this.value = this.value.substring(0, 8);
            }
            if (empty) {
            	$('#icon').html('<img src="img/graphred.png">');
            	nextDisabled();
        	} else {
        		$('#icon').html('<img src="img/graphblue.png">');
            	nextEnabled();
        	}
        });
	    $('#user_input').fadeIn('slow');
	});
};

var getUserSalary = function() {
	nextDisabled();
	$('#question').fadeOut('slow', function() {
		$('#question').html(questions[2]);
	    $('#question').fadeIn('slow').css("font-size", "80px");
	});
	$('#icon').fadeOut('slow', function() {
		$('#icon').html('<img src="img/salaryred.png">');
		$('#icon').fadeIn('slow').css({"left":"20px","top":"80px"});
	});
	$('#user_input').fadeOut('slow', function() {
		$('#user_input').html('<section id="line"><img src="img/line.png"></section>');
		$('#user_input').append('<section id="currency"><img src="img/layer_15.png"></section>');
		$('#user_input').append('<input type="text" id="inp_field">');
		$("#inp_field").bind('keyup', function() {
			var sanitized = $(this).val().replace(/[^0-9]/g,'');
  			$(this).val(sanitized);
			var empty = false;
            if ($(this).val() == '') {
                empty = true;
            } else if ($(this).val().length > 8) { 
            	this.value = this.value.substring(0, 8);	
            }
            if (empty) {
            	$('#icon').html('<img src="img/salaryred.png">');
            	nextDisabled();
        	} else {
        		$('#icon').html('<img src="img/salaryblue.png">');
            	nextEnabled();
        	}
        });
	    $('#user_input').fadeIn('slow');
	});
	$('footer').html('<div id="footer_container"><img src="img/arrow_r.png">'+localStorage.getItem("assumption_pens")+' שח<img src="img/arrow_l.png"></div>');
};

var getUserYears = function() {
	nextDisabled();
	$("#inp_field").val('');
	$('#question').fadeOut('slow', function() {
		$('#question').html(questions[3+Number(getUserProperty("gender"))]);
	    $('#question').fadeIn('slow');
	});
	$('#icon').fadeOut('slow', function() {
		$('#icon').html('<img src="img/savingred.png">');
		$('#icon').fadeIn('slow').css({"left":"20px","top":"100px"});
	});
	$('#user_input').fadeOut('slow', function() {
		$('#user_input').html('<section id="small_line"><img src="img/linesmall.png"></section>');
		$('#user_input').append('<section id="years"><img src="img/years.png"></section>');
		$('#user_input').append('<input type="text" id="small_inp">');
		$("#small_inp").bind('keyup', function() {
			var sanitized = $(this).val().replace(/[^0-9]/g,'');
  			$(this).val(sanitized);
			var empty = false;
            if ($(this).val() == '') {
                empty = true;
            } else if ($(this).val().length > 2) {
            	this.value = this.value.substring(0, 2);	
            }	 
            if (empty) {
            	$('#icon').html('<img src="img/savingred.png">');
            	nextDisabled();
        	} else {
        		$('#icon').html('<img src="img/savingblue.png">');
            	nextEnabled();
        	}
        });
	    $('#user_input').fadeIn('slow');
	});
	console.log("ass: "+user_prop["assumption_pens"]);
	$('footer').html('<div id="footer_container"><img src="img/arrow_r.png">'+localStorage.getItem("assumption_pens")+' שח<img src="img/arrow_l.png"></div>');

};

var goToCalculator = function() {
	window.location.href = 'calculator.html';
};

var setScreen = function() {
	loadUser();
	incrementCircles();
	console.log("screen:"+screen);
	switch(screen){
		case 1:
			getUserAssumption();
			break;
		case 2:
			var assumption = parseInt($('#inp_field').val());
			//user_prop["assumption_pens"] = assumption;
			setUserProperty("assumption_pens",assumption);
			getUserSalary();
			break;
		case 3:
			var salary = parseInt($('#inp_field').val());
			setUserProperty("salary",salary);
			//user_prop["salary"] = salary;
			getUserYears();
			break;
		case 4:
			var years = parseInt($('#small_inp').val());
			setUserProperty("pre_years",years);
			//user_prop["years"] = years;
			goToCalculator();
			break;
		default:
			getUserGender();
			break;
	}
};
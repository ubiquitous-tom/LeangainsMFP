var lg = {};
var woDays = {m:1, t:0, w:1, th:0, f:1, sa:0, su:0};
var rtDays = {m:0, t:0, w:0, th:0, f:0, sa:0, su:0};
var woCal = 0;
var rtCal = 0;
var woMacro = {protein:0, carbs:0, fat:0};
var rtMacro = {protein:0, carbs:0, fat:0};
var personalData = {gender:'m', height_ft:0, height_in:0, weight_lb:0, age:0, activity:0};
var bmr, tdee, twee, week_cal, week_diff;
var z = 0;

function load_options() {
	chrome.storage.local.get('lg', function(items) {
		console.log('lg: ',items.lg);
		lg = items.lg;
	
		if (lg) {
			woDays = (lg.woDays) ? lg.woDays : woDays;
			woCal = (lg.woCal) ? lg.woCal : woCal;
			rtCal = (lg.rtCal) ? lg.rtCal : rtCal;
			woMacro = (lg.woMacro) ? lg.woMacro : woMacro;
			rtMacro = (lg.rtMacro) ? lg.rtMacro : rtMacro;
			for (var day in woDays) {
				if (woDays[day] == 1) {
					// console.log('if');
					rtDays[day] = 0;
				} else { 
					// console.log('else');
					rtDays[day] = 1; 
				}
			}
			console.log(woDays, woCal, woMacro, rtDays, rtCal, rtMacro);
			restore_options();
		} else {
			alert('Please enter your Leangains info');
			$('#workout_m,#rest_t,#workout_w,#rest_th,#workout_f,#rest_sa,#rest_su,#gender_m').attr('checked',"checked");
		}
	});

}

function save_options() {
	var wods = {};
	$('[id^=workout_]').each(function(ind, el) {
		//console.log(ind+': '+el.id+' - '+el.value+' @ '+$(el).prop('checked'));
		wods[el.value] = ($(el).prop('checked')) ? 1 : 0;
	});
	// console.log(wods);
	
	var rtds = {};;
	$('[id^=rest_]').each(function(ind, el) {
		//console.log(ind+': '+el.id+' - '+el.value+' @ '+$(el).prop('checked'));
		rtds[el.value] = ($(el).prop('checked')) ? 1 : 0;
	});
	// console.log(rtds);

	var woc = $('#wo-cal-input').val();
	var rtc = $('#rt-cal-input').val();
	// console.log(woc,rtc);

	var womac = {protein:$('#wo-protein').val(), carbs:$('#wo-carbs').val(), fat:$('#wo-fat').val()}
	var rtmac = {protein:$('#rt-protein').val(), carbs:$('#rt-carbs').val(), fat:$('#rt-fat').val()}
	// console.log(womac,rtmac);

	var gender = $('[name=gender]:checked').val();
	console.log('gender: ',gender);

	var hf = $('#height_ft').val();
	var hi = $('#height_in').val();
	console.log(hf,hi);

	var wl = $('#weight_lb').val();
	console.log(wl);

	var ag = $('#age').val();
	console.log(ag);

	var ac = $('#activity').val();
	console.log(ac);

	var theValue = {woDays:wods, rtds:rtds, woCal:woc, rtCal:rtc, woMacro:womac, rtMacro:rtmac, gender:gender, ht:{foot:hf, inch:hi}, weight:wl, age:ag, activity:ac};
	chrome.storage.local.set({'lg': theValue}, function() {
		// Notify that we saved.
		console.log('Settings saved');
	});

}

function delete_options() {
    chrome.storage.local.remove('lg', function() {
        // Notify that we saved.
        console.log('Settings removed');
        location.reload();
    });
}

function restore_options() {
	

	// load days for workout days and rest days
	for (var wd  in woDays) {
		// console.log('in for', wd);
		if (woDays[wd] == 1) { 
			// console.log(woDays[wd],wd);
			$('#workout_'+wd).attr("checked", true);
			// console.log('#workout_'+wd, $('#workout_'+wd).val());
			// console.log('in if');
		} else {
			$('#rest_'+wd).attr("checked", true);
		}
	}

	// load Calories for workout day and rest day
	$('#wo-cal-input').val(woCal);
	$('#rt-cal-input').val(rtCal);

	// load Macro for workout day and rest day
	$('#wo-protein').val(parseFloat(woMacro.protein).toFixed(2));
	$('#wo-carbs').val(parseFloat(woMacro.carbs).toFixed(2));
	$('#wo-fat').val(parseFloat(woMacro.fat).toFixed(2));
	$('#rt-protein').val(parseFloat(rtMacro.protein).toFixed(2));
	$('#rt-carbs').val(parseFloat(rtMacro.carbs).toFixed(2));
	$('#rt-fat').val(parseFloat(rtMacro.fat).toFixed(2));

	// load personal data
	// console.log(lg.activity);
	$('#gender_'+lg.gender).attr('checked','checked');
	$('#height_ft').val(lg.ht.foot);
	$('#height_in').val(lg.ht.inch);
	$('#height_cm').val((parseFloat(lg.ht.foot*12)+parseFloat(lg.ht.inch))*2.54);
	$('#weight_lb').val(lg.weight);
	$('#weight_kg').val(parseFloat(lg.weight/2.2).toFixed(2));
	$('#age').val(lg.age);
	$('#activity').val(lg.activity);

	// Calculate TDEE and all that good stuff
	do_the_bmr();
	check_input();
}

function do_the_bmr() {
	var bmr_ar = [];
	var bmr_gender = $('[name=gender]:checked').val();
	$('.watched').each(function(ind, el){
		//console.log(ind, el, $(el).val());
		bmr_ar[$(el).attr('id')] = $(el).val();
	});
	console.log(bmr_ar);
	var cal_type = (bmr_ar.body_fat.length == 0) ? 1 : 0; 
	var cal_variable = (bmr_gender == 'm') ? 5 : -161;
	bmr = Math.floor( (10*bmr_ar.weight_kg)+(6.25*bmr_ar.height_cm)-(5*bmr_ar.age)+(cal_variable) );
	$('#bmr').val( bmr );
	do_the_tdee();
}

function do_the_tdee() {
	var activity_level = {0:1.2, 1:1.375, 2:1.55, 3:1.725, 4:1.9};
	var activity_multiplier = activity_level[$('#activity').val()];
	console.log(bmr,activity_multiplier);
	tdee = Math.floor(bmr*activity_multiplier);
	$('#tdee').val(tdee);
	do_the_twee();
}

function do_the_twee() {
	twee = tdee * 7;
	$('#twee').val(twee);
	do_the_week_cal();
}

function do_the_week_cal() {
	week_cal = parseInt($('#wo-cal-input').val())*3 + parseInt($('#rt-cal-input').val())*4;
	$('.week_cal').text(week_cal);
	do_the_week_diff();
	add_pos_neg('.week_cal', week_cal);
}

function do_the_week_diff() {
	week_diff = week_cal-twee;
	$('.week_diff').text(week_diff);
	do_the_week_change();
	add_pos_neg('.week_diff', week_diff);
}

function do_the_week_change() {
	var week_change = parseFloat(week_diff/3500);
	$('.week_change').text(week_change);
	add_pos_neg('.week_change', week_change);
	if (z++ < 1) $('#bmr,#tdee,#twee').parent().wrap('<div class="control-group info"></div>');
}

function add_pos_neg(ele_name, value) {
	var the_class = (value > 0) ? 'positive' : 'negative';
	$(ele_name).addClass(the_class);
}

function check_input() {
	console.log('check_input');
	$('.control-group').find('input[value!=""]').end().addClass('success');
}

$(document).ready(function() {
	load_options();
	//restore_options();
	//save_options();

	chrome.storage.onChanged.addListener(function(changes, namespace) {
	  for (key in changes) {
	    var storageChange = changes[key];
	    console.log('Storage key "%s" in namespace "%s" changed. ' +
	                'Old value was "%s", new value is "%s".',
	                key,
	                namespace,
	                storageChange.oldValue,
	                storageChange.newValue);
	  }
	});
		
	$('#submit').click(function(e){
		e.preventDefault();
		save_options();
		console.log('submit');
	});

	$('#delete').click(function(e){
		e.preventDefault();
		delete_options();
		console.log('delete');
	});

	$('#height_ft,#height_in').focusout(function(){
		if ($(this).val()) {
			$('#height_cm').val( (parseFloat($('#height_ft').val()*12) + parseFloat($('#height_in').val())) *2.54);
		}
	});

	$('#weight_lb').focusout(function(){
		if ($(this).val()) {
			$('#weight_kg').val(parseFloat($('#weight_lb').val()/2.2).toFixed(2));
		}
	});
	
	$('.watched').focusout(function(){do_the_bmr()});
	$('[name=gender]').change(function(){do_the_bmr()});
	$('input').focusout(function(){console.log('yay');check_input();});
});
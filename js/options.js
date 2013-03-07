var lg = {};
var woDays = {m:1, t:0, w:1, th:0, f:1, sa:0, su:0};
var rtDays = {m:0, t:0, w:0, th:0, f:0, sa:0, su:0};
var woCal = 0;
var rtCal = 0;
var woMacro = {protein:0, carbs:0, fat:0};
var rtMacro = {protein:0, carbs:0, fat:0};
var personalData = {gender:'m', height_ft:0, height_in:0, weight_lb:0, age:0, activity:0};

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
			$('#workout_m,#rest_t,#workout_w,#rest_th,#workout_f,#rest_sa,#rest_su').attr('checked',true);
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

	// var gender = $('[name=gender]:checked').val();
	// console.log('gender: ',gender);

	// var hf = $('#height_ft').val();
	// var hi = $('#height_in').val();
	// console.log(hf,hi);

	// var wl = $('#weight_lb').val();
	// console.log(wl);

	// var ag = $('#age').val();
	// console.log(ag);

	// var ac = $('#activity').val();
	// console.log(ac);

	var theValue = {woDays:wods, rtds:rtds, woCal:woc, rtCal:rtc, woMacro:womac, rtMacro:rtmac};//, gender:gender, ht:{foot:hf, inch:hi}, weight:wl, age:ag, activity:ac};
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
	// $('#gender_'+lg.gender).attr('checked','checked');
	// $('#height_ft').val(lg.ht.foot);
	// $('#height_in').val(lg.ht.inch);
	// $('#height_cm').val((parseFloat(lg.ht.foot*12)+parseFloat(lg.ht.inch))*2.54);
	// $('#weight_lb').val(lg.weight);
	// $('#weight_kg').val(parseFloat(lg.weight/2.2).toFixed(2));
	// $('#age').val(lg.age);
	// $('#activity').val(lg.activity);

	// Calculate TDEE
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

});
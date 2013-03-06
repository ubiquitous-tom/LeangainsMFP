var woDays = {m:1, t:0, w:1, th:0, f:1, sa:0, su:0};
var rtDays = {m:0, t:0, w:0, th:0, f:0, sa:0, su:0};
var woCal = 0;
var rtCal = 0;
var woMacro = {protein:0, carbs:0, fat:0};
var rtMacro = {protein:0, carbs:0, fat:0};
var cal_index, carbs_index, fiber_index, fat_index, protien_index, t_cal, t_carbs, t_fiber, t_fat, t_protein;

function initialize_lg() {
    //google.load( "visualization", "1.0", {packages:["corechart"]} );
    //console.log('haha');
    //restore_options();
    cal_index = $('table').find('td:contains("Calories")').index();
    carbs_index = $('table').find('td:contains("Carbs")').index();
    fiber_index = $('table').find('td:contains("Fiber")').index();
    fat_index = $('table').find('td:contains("Fat")').index();
    protein_index = $('table').find('td:contains("Protein")').index();
    //console.log(cal_index, carbs_index, fiber_index, fat_index, protein_index);
    
    load_options();
}

function loadChart() {
    google.load( "visualization", "1.0", {packages:["corechart"], "callback":initialize_lg} );
}

function initLoader() {
    var script = document.createElement("script");
    script.src = "https://www.google.com/jsapi?callback=loadChart";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
}

function load_options() {
    chrome.storage.local.get('lg', function(items) {
        console.log('lg: ',items.lg);
        lg = items.lg;
    
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
        // console.log(woDays, woCal, woMacro, rtDays, rtCal, rtMacro);
        //restore_options();
        set_today_type();
        inject_daily_cal_macro();
        recalculate_remaining();
        add_net_carb_column();
    });

}

function get_today_type(date) {
    var d = new Date(date);
    var weekday = new Array(7);
    weekday[0] = "su";
    weekday[1] = "m";
    weekday[2] = "t";
    weekday[3] = "w";
    weekday[4] = "th";
    weekday[5] = "f";
    weekday[6] = "sa";

    var n = weekday[d.getDay()];
    //var today = days[n];
    return n;
}


function set_today_type() {
    // console.log($('#date_selector').val());
    var retrieved_date = $('#date_selector').val().split('-');
    // console.log(retrieved_date);
    var today = new Date(retrieved_date[0], retrieved_date[1], retrieved_date[2]);
    // console.log(today);
    // console.log(type);
    // console.log(get_today_type(today));
    var type = get_today_type(today);
    // console.log(woDays[type]);
    if (woDays[type]) {
        day_type = 'WorkOut Day';
        t_cal = Math.ceil(lg.woCal);
        t_carbs = Math.ceil(lg.woMacro.carbs);
        t_fat = Math.ceil(lg.woMacro.fat);
        t_protein = Math.ceil(lg.woMacro.protein);
    } else { 
        day_type = 'Rest Day';
        t_cal = Math.ceil(lg.rtCal);
        t_carbs = Math.ceil(lg.rtMacro.carbs);
        t_fat = Math.ceil(lg.rtMacro.fat);
        t_protein = Math.ceil(lg.rtMacro.protein);
    };
    // console.log(day_type);
    var day_type_div = $('<div></div>').addClass('day-type')
    var h1 = $('<h1></h1>').text('Today is a '+day_type);
    $('.container').prepend($(day_type_div).append(h1));
    
}

function inject_daily_cal_macro() {
    // console.log(t_cal,t_carbs,t_fat,t_protein,cal_index);
    //console.log($('.total.alt').find('td:eq('+cal_index+')').text());
    $('.total.alt')
    .find('td:eq('+cal_index+')').text(t_cal).end()
    .find('td:eq('+carbs_index+')').text(t_carbs).end()
    .find('td:eq('+fat_index+')').text(t_fat).end()
    .find('td:eq('+protein_index+')').text(t_protein);
}

function inject_pie_chart_script() {
    
    
}

function inject_pie_chart() {
    
    $('#content').after($('<div/>').addClass('lg_google_graph'));
    var data1 = new google.visualization.DataTable();
        data1.addColumn('string', 'Type');
        data1.addColumn('number', 'Cals');
        data1.addRows([
           ['Net Carbs', 23],
           ['Protein', 23],
           ['Fat', 23]
        ]);

    var chart = new google.visualization.PieChart($('.lg_google_graph').get(0));
    chart.draw(data1, {width: 400, height: 300, title: 'Daily Totals by Calories'});
}

function recalculate_remaining() {
    // console.log('total cal: ',$('.total:eq(0)').find('td:eq('+cal_index+')').text().replace(/\s/g, "").replace(",", ""));
    var total_cal = parseInt($('.total:eq(0)').find('td:eq('+cal_index+')').text().replace(/\s/g, "").replace(",", ""));
    var total_carbs = parseInt($('.total:eq(0)').find('td:eq('+carbs_index+')').text().replace(/\s/g, "").replace(",", ""));
    var total_fat = parseInt($('.total:eq(0)').find('td:eq('+fat_index+')').text().replace(/\s/g, "").replace(",", ""));
    var total_protein = parseInt($('.total:eq(0)').find('td:eq('+protein_index+')').text().replace(/\s/g, "").replace(",", ""));
    var before_class_cal = $('.total:eq(0)').find('td:eq('+cal_index+')').attr('class');
    var before_class_carbs = $('.total:eq(0)').find('td:eq('+carbs_index+')').attr('class');
    var before_class_fat = $('.total:eq(0)').find('td:eq('+fat_index+')').attr('class');
    var before_class_protein = $('.total:eq(0)').find('td:eq('+protein_index+')').attr('class');
    // console.log('before class: ',before_class_cal,before_class_carbs,before_class_fat,before_class_protein);
    // console.log('remaining cal: ',parseInt(t_cal),parseInt(total_cal));
    var remaining_cal = parseInt(t_cal)-parseInt(total_cal); if (remaining_cal >= 0) { var remaining_cal_class = 'positive'; } else { var remaining_cal_class = 'negative'; }
    var remaining_carbs = parseInt(t_carbs)-parseInt(total_carbs); if (remaining_carbs >= 0) { var remaining_carbs_class = 'positive'; } else { var remaining_carbs_class = 'negative'; }
    var remaining_fat = parseInt(t_fat)-parseInt(total_fat); if (remaining_fat >= 0) { var remaining_fat_class = 'positive'; } else { var remaining_fat_class = 'negative'; }
    var remaining_protein = parseInt(t_protein)-parseInt(total_protein); if (remaining_protein >= 0) { var remaining_protein_class = 'positive'; } else { var remaining_protein_class = 'negative'; }
    $('.total.remaining')
    .find('td:eq('+cal_index+')').removeClass().addClass(remaining_cal_class).text(remaining_cal).end()
    .find('td:eq('+carbs_index+')').removeClass().addClass(remaining_carbs_class).text(remaining_carbs).end()
    .find('td:eq('+fat_index+')').removeClass().addClass(remaining_fat_class).text(remaining_fat).end()
    .find('td:eq('+protein_index+')').removeClass().addClass(remaining_protein_class).text(remaining_protein);
}

function add_net_carb_column() {

    // console.log(carbs_index, fiber_index);
    $('table').find('td:contains("Carbs")').before($('<td />').addClass('alt net-carbs').html('Net<br>Carbs'));
    $('colgroup').find('col:eq('+carbs_index+')').before($('<col />').addClass('col-2'));
    //$('tfoot').find(':contains("Carbs")').before($('<td />').addClass('alt').html('Net<br>Carbs'));
    //$('tr.bottom, tr.total').each(function(index, el) {
    $('tbody tr').not('.meal_header,.spacer').each(function(index, el) {
        // console.log(index, el);
        // console.log($(el).attr('class'));
        var carbs_text = $(el).find('td:eq('+carbs_index+')').text();
        var fiber_text = $(el).find('td:eq('+fiber_index+')').text();
        var carbs = 0, fiber = 0, net_carbs = 0;
        var class_name = $(el).attr('class');
        switch (class_name) {
            case 'total':
                // console.log('in total');
                var total_net_carbs = 0;
                $('.bottom .net_carbs').each(function(){
                    total_net_carbs += ($(this).text().trim().length === 0)?0:parseInt($(this).text());
                });
                $(el).find('td').eq(carbs_index).before($('<td/>').addClass('total_net_carbs').text(total_net_carbs));
                break;
            case 'total alt':
                // console.log('in total alt');
                // console.log('carbs: ',$(el).find('td').eq(carbs_index).text());
                $(el).find('td').eq(carbs_index).before($('<td/>').addClass('goal_net_carbs').text($(el).find('td').eq(carbs_index).text()));
                break;
            case 'total remaining':
                // console.log('in total remaining');
                // console.log('goal and total: ',$('.goal_net_carbs').text(),$('.total_net_carbs').text());
                var remaining = $('.goal_net_carbs').text()-$('.total_net_carbs').text();
                // console.log('remaining: ', remaining);
                var remaining_class = 'positive';
                if (remaining < 0) remaining_class = 'negative';
                $(el).find('td').eq(carbs_index).before($('<td/>').addClass('remaining_net_carbs '+remaining_class).text($(el).find('td').eq(carbs_index).text()));
                $('.remaining_net_carbs').text(remaining);
                break;
            default:
                // console.log('in default');
                carbs = carbs_text;
                fiber = fiber_text;
                // console.log(carbs_text, fiber_text);
                // console.log(carbs_text.trim().length === 0,fiber_text.trim().length === 0);
                if (carbs_text.trim().length === 0 || fiber_text.trim().length === 0) { 
                    net_carbs = '';
                    // console.log('net_carbs in if: ',net_carbs);
                } else {
                    net_carbs = carbs-fiber; 
                    // console.log('net_carbs in else: ',net_carbs);
                }
                //if (net_carbs == 0) net_carbs = '';
                $(el).not('.total alt,.total remaining').find('td:eq('+carbs_index+')').before($('<td />').addClass('net_carbs').text(net_carbs));
        }
        
        
        

       // console.log(parseInt(carbs, 10), parseInt(fiber, 10)); 
    });

}


document.addEventListener("DOMContentLoaded", initLoader);

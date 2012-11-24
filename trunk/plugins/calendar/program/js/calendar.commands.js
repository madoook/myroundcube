//compile 0a1a5a5d8ee6affa8ab79b4be4d87ea8
/* Commands */
function calendar_commands(){
  this.init = function(){
    rcmail.register_command('plugin.calendar_newevent', calendar_commands.newevent, true);
    rcmail.register_command('plugin.calendar_reload', calendar_commands.reload, true); 
    rcmail.register_command('plugin.calendar_runTests', calendar_commands.runTests, true); 
    rcmail.register_command('plugin.calendar_switchCalendar', calendar_commands.switchCalendar, true);
    rcmail.register_command('plugin.exportEventsZip', calendar_commands.exportEventsZip, true);
    rcmail.register_command('plugin.importEvents', calendar_commands.importEvents, true);
    rcmail.register_command('plugin.calendar_print', calendar_commands.previewPrintEvents, true);
    rcmail.register_command('plugin.calendar_filterEvents', calendar_commands.filterEvents, true);
    rcmail.register_command('plugin.calendar_do_print', calendar_commands.printEvents, true);
    rcmail.register_command('plugin.calendar_toggle_view', calendar_commands.toggleView, true);
    this.scheduleSync();
  }
  
  /* sort by keys */
  this.ksort = function(arr){
    // Setup Arrays
    var sortedKeys = new Array();
    var sortedObj = {};

    // Separate keys and sort them
    for (var i in arr){
      sortedKeys.push(i);
    }
    sortedKeys.sort();

    // Reconstruct sorted obj based on keys
    for(var i in sortedKeys){
      sortedObj[sortedKeys[i]] = arr[sortedKeys[i]];
    }
    return sortedObj;
  }
  
  /* new event */
  this.newevent = function(){
    d = (Math.floor(new Date().getTime() / 1000 / 3600 * rcmail.env.calsettings.settings.timeslots) * 1000 * 3600 / rcmail.env.calsettings.settings.timeslots) + (3600 * 1000 / rcmail.env.calsettings.settings.timeslots);
    calendar_callbacks.dayClick(new Date(d), false, true, false, rcmail.env.calsettings);
  }
  
  /* call compose tasks */
  this.compose = function(url){
    url += '&_id=' + rcmail.env.edit_event.id;
    if(rcmail.env.compose_newwindow){
      opencomposewindowcaller(url);
    }
    else{
      document.location.href = url;
    }
  }
  
  /* edit recurring events */
  this.edit_event = function(type, action){
    rcmail.env.edit_recurring = type;
    if(action == 'resize'){
      calendar_callbacks.eventResize(rcmail.env.edit_event, rcmail.env.edit_delta, rcmail.env.calsettings);
    }
    else if(action == 'move'){
      calendar_callbacks.eventDrop(rcmail.env.edit_event, rcmail.env.edit_dayDelta, rcmail.env.minuteDelta, rcmail.env.allDay, rcmail.env.revertFunc, rcmail.env.calsettings);
    }
    else{
      calendar_callbacks.eventClick(rcmail.env.edit_event, rcmail.env.calsettings);
    }
    $('#calendaroverlay').hide();
    $('#calendaroverlay').html('')
  }
  
  /* edit recurring html */
  this.edit_recurring_html = function(action){
    var html = "<div id='recurringdialog'>";
    html = html + "<br /><fieldset><legend>" + rcmail.gettext('calendar.applyrecurring') + "</legend><p>";
    html = html + "<input class='button' type='button' onclick='calendar_commands.edit_event(\"initial\",\"" + action + "\")' value='&bull;' />&nbsp;<span>" + rcmail.gettext('calendar.editall') + "</span><br />";
    html = html + "<input class='button' type='button' onclick='calendar_commands.edit_event(\"future\",\"" + action + "\")' value='&bull;' />&nbsp;<span>" + rcmail.gettext('calendar.editfuture') + "</span><br />";
    html = html + "<input class='button' type='button' onclick='calendar_commands.edit_event(\"single\",\"" + action + "\")' value='&bull;' />&nbsp;<span>" + rcmail.gettext('calendar.editsingle') + "</span>";
    html = html + "</p></fieldset>";
    html = html + "<div style='float: right'><a href='#' onclick='$(\"#calendar\").fullCalendar(\"refetchEvents\");$(\"#calendaroverlay\").html(\"\");$(\"#calendaroverlay\").hide()'>" + rcmail.gettext('calendar.cancel') + "</a></div></div>";
    $('#calendaroverlay').html(html);
    $('#calendaroverlay').show();
  }
  
  /* reload the calendar */
  this.reload = function() {
    rcmail.http_request('plugin.calendar_renew');
  }
  
  /* schedule sync calendar */
  this.scheduleSync = function() {
    window.setTimeout('calendar_commands.syncCalendar()', 1000 * 10);
  }
  
  /* sync calendar */
  this.syncCalendar = function() {
    rcmail.http_request('plugin.calendar_syncEvents');
    window.setTimeout('calendar_commands.syncCalendar()', 1000 * 60);
  }

  /* run tests */
  this.runTests = function() {
    return true;
  }
  
  /* trigger search */
  this.triggerSearch = function() {
    var str = $("#calsearchfilter").val();
    $("#calsearchset").hide();
    while(str.indexOf('\\') > -1)
      str = str.replace('\\','');
    $("#calsearchfilter").val(str);  
    if(str.length > 2 && str != rcmail.env.cal_search_string){
      var arr = DstDetect($('#calendar').fullCalendar('getDate'));
      if(!arr[0])
        arr[0] = new Date(0);
      if(!arr[1])
        arr[1] = new Date(0);
      end = new Date($('#calendar').fullCalendar('getDate').getTime() + (365 * 86400 * 1000));
      rcmail.env.cal_search_string = str;
      if(!rcmail.env.replication_complete){
        rcmail.display_message(rcmail.gettext('calendar.replicationincomplete'), 'notice');
      }
      rcmail.http_post('plugin.calendar_searchEvents', '_str='+str);
    }
    else{
      $("#calsearchdialog").dialog('close');
    }
  }
  
  /* search fields */
  this.searchFields = function (str) {
    if(str == ''){
      $('#cal_search_field_summary').attr('checked','checked');
    }
    rcmail.env.cal_search_string = '';
    rcmail.http_post('plugin.calendar_searchSet', str);
  }
  
  /* goto Date */
  this.gotoDate = function(ts, event_id) {
    ts = parseInt(ts);
    try{
      var gap = - (new Date().getTimezoneOffset() - new Date(ts * 1000).getTimezoneOffset()) * 60;
    }
    catch(e){
      var gap = 0;
    }
    var mydate = new Date((ts + gap) * 1000);
    if(event_id){
      $('#rcmrow' + event_id).addClass('selected');
      $('#rcmmatch' + event_id).removeClass('calsearchmatch');
      $('#rcmmatch' + event_id).addClass('calsearchmatchselected');
      rcmail.env.calsearch_id = event_id;
    }
    else{
      rcmail.env.calsearch_id = null;
    }
    $('#jqdatepicker').datepicker('setDate', mydate);
    $('#calendar').fullCalendar('gotoDate', $.fullCalendar.parseDate(mydate));
    $('#upcoming').fullCalendar('gotoDate', $.fullCalendar.parseDate(mydate));
  }
  
  /* switch calendar */
  this.switchCalendar = function() {
    if(!rcmail.env.replication_complete){
      rcmail.display_message(rcmail.gettext('backgroundreplication', 'calendar'), 'error');
      return;
    }
    var $dialogContent = $("#calswitch");
    var caluser = $dialogContent.find("select[name='_caluser']");
    var token = $dialogContent.find("input[name='_token']");
    var submit = rcmail.gettext('submit', 'calendar');
    var cancel = rcmail.gettext('cancel', 'calendar');
    var buttons = {};

    buttons[submit] = function() {
      // send request to RoundCube
      rcmail.env.calendar_msgid = rcmail.set_busy(true,'loading');
      rcmail.http_post('plugin.calendar_switch_user', '_caluser='+caluser.val()+'&_token='+token.val());
      rcmail.env.cal_search_string = '';
      $('#calendaroverlay').show();
      $dialogContent.dialog("close");
    };
    buttons[cancel] = function() {
      $dialogContent.dialog("close");
    };
    $dialogContent.dialog({
      modal: false,
      title: rcmail.gettext('switch_calendar', 'calendar'),
      width: 500,
      close: function() {
        $dialogContent.dialog("destroy");
        $dialogContent.hide();
      },
      buttons: buttons
    }).show();
  }
  
  /* export events */
  this.exportEventsZip = function() {
    return true;
  }
  
  /* import events */
  this.importEvents = function() {
    calendar_callbacks.dayClick(new Date(), 1, {start:new Date()}, 'agendaWeek', rcmail.env.calsettings)
    for(var i=0; i<5; i++){
      calendar_gui.initTabs(2, i);
    }
    $('#event').tabs('select',2);
    $('#event').tabs('disable', 0);
    $('#ui-dialog-title-event').html(rcmail.gettext('calendar.import'));
  }
  
  /* print preview */
  this.previewPrintEvents = function() {
    var url = './?_task=dummy&_action=plugin.calendar_print';
    url = url + '&_view=' + escape($('#calendar').fullCalendar('getView').name.replace('agenda','basic'));
    url = url + '&_date=' + $('#calendar').fullCalendar('getDate').getTime() / 1000;
    mycalpopup = window.open(url, "Print", "width=740,height=740,location=0,resizable=1,scrollbars=1");
    if(mycalpopup){
      mycalpopup.focus();
      rcmail.env.calpopup = true;
      return true;
    }
    else
      return false;
  }
  
  /* filter events */
  this.filterEvents = function() {
    var $dialogContent = $("#calfilter");
    var submit = rcmail.gettext('submit', 'calendar');
    var cancel = rcmail.gettext('cancel', 'calendar');
    var all    = rcmail.gettext('removefilters', 'calendar');
    var buttons = {};

    buttons[submit] = function() {
      rcmail.http_post('plugin.calendar_setfilters',$('#filter').serialize());
      rcmail.env.cal_search_string = '';
      $dialogContent.dialog("close");
    };
    buttons[all] = function() {
      $('#calfilter input[type=checkbox]').each(function() {
        $(this).prop('checked', false);
      });
      rcmail.http_post('plugin.calendar_setfilters','');
      rcmail.env.cal_search_string = '';
      $dialogContent.dialog("close");
    };
    buttons[cancel] = function() {
      $dialogContent.dialog("close");
    };
    $dialogContent.dialog({
      modal: false,
      title: rcmail.gettext('filter_events', 'calendar'),
      width: 500,
      close: function() {
        $dialogContent.dialog("destroy");
        $dialogContent.hide();
      },
      buttons: buttons
    }).show();
  }
  
  /* print events */
  this.printEvents = function() {
    $('#toolbar').hide();
    self.print();
    $('#toolbar').show();
    return true; 
  }

  /* toggle view between agenda and list view */
  this.toggleView = function() {
   if(rcmail.env.calendar_print_curview == 'agendalist'){
      rcmail.env.calendar_print_curview = 'calendar';
      $('#agendalist').hide();
      $('#calendar').show();
      $('#calendar').fullCalendar('render');
    }
    else{
      calendar_commands.createAgendalist();
      $('#agendalist').show();
      $('#calendar').hide();
      rcmail.env.calendar_print_curview = 'agendalist';
    }
  }  
  
  /* create agendalist */
  this.createAgendalist = function() {
    var arrcategories = new Array();
    var arrcols = new Array();
    var ldays = new Array();
    var events = new Array();
    ldays['Sun'] = rcmail.env.calsettings.settings['days_short'][0];
    ldays['Mon'] = rcmail.env.calsettings.settings['days_short'][1];
    ldays['Tue'] = rcmail.env.calsettings.settings['days_short'][2];
    ldays['Wed'] = rcmail.env.calsettings.settings['days_short'][3];
    ldays['Thu'] = rcmail.env.calsettings.settings['days_short'][4];
    ldays['Fri'] = rcmail.env.calsettings.settings['days_short'][5];
    ldays['Sat'] = rcmail.env.calsettings.settings['days_short'][6];
    var temp, disp, table, row, start, end, mydate, myday, ts_start, ts_end, timeslot;
    var thead = '<tr><th width="1%" class="day">' + rcmail.gettext('day','calendar') + '</th>';
    var tbody = '<tr>';
    myevents = $('#calendar').fullCalendar('clientEvents');
    for(var i in myevents){
      events[events.length] = myevents[i];
      if(myevents[i].end){
        clone =  jQuery.extend({},myevents[i]); // subsequent changes to the copied Object will not affect the original Object
        while(clone.start.getTime() < clone.end.getTime() - 86400000){
          start = new Date(clone.start.getFullYear(), clone.start.getMonth(), clone.start.getDate(), 0, 0, 0);
          clone = jQuery.extend({},myevents[i]);
          clone.start = new Date(start.getTime() + 86400000);
          // DST Start overlap
          if(clone.start.getHours() == 1){
            clone.start = new Date(clone.start.getTime() - 3600000);
          }
          // DST End overlap
          if(clone.start.getHours() == 23){
            clone.start = new Date(clone.start.getTime() + 3600000);
          }
          events[events.length] = clone;
        }
      }
    }
    myevents = new Array();
    for(var i in events){
      temp = '';
      if(events[i].title){
        temp = events[i].title;
      }
      myevents[events[i].start.getTime() + '-' + temp + '-' + i] = events[i];
    }
    events = calendar_commands.ksort(myevents);
    var t_start = $('#calendar').fullCalendar('getView').visStart.getTime();
    var t_end   = $('#calendar').fullCalendar('getView').visEnd.getTime();
    var ii = 0;
    for(var i in events){
      if(!events[i].end){
        events[i].end = events[i].start;
      }
      disp = events[i].className;
      if(events[i].classNameDisp){
        disp = events[i].classNameDisp;
      }
      if(typeof disp == 'string' && typeof arrcategories[disp] == 'undefined'){
        arrcategories[disp] = true;
        ii ++;
        if(disp == rcmail.gettext('default', 'calendar')){
          arrcols[ii] = '';
        }
        else{
          arrcols[ii] = disp;
        }
      }
    }
    arrcols.sort();
    for(var i in arrcols){
      temp = arrcols[i];
      if(temp == '')
        temp = rcmail.gettext('default', 'calendar');
      thead = thead + '<th width="' + parseInt(100 / arrcols.length) + '%">' + temp + '</th>';
    }
    var mwidth = parseInt(700 / arrcols.length / 10) * 10;
    rcmail.env.cal_print_cols = arrcols.length;
    thead = thead + '</tr>';
    tbody = '';
    cats = new Array();
    for(var i in events){
      if((events[i] && events[i].start && events[i].start.getTime() >= t_start) || (events[i] && events[i].end && events[i].end.getTime() <= t_end)){
        start = parseInt(events[i].start.getTime() / 60000);
        end = parseInt(events[i].end.getTime() / 60000);
        if(events[i].start.getDay() != events[i].end.getDay()){
          end = parseInt(new Date(events[i].start.getFullYear(), events[i].start.getMonth(), events[i].start.getDate(), 23, 59, 59).getTime() / 60000);
        }
        timeslot = parseInt(new Date(events[i].start.getFullYear(), events[i].start.getMonth(), events[i].start.getDate(), 0, 0, 0).getTime() / 60000) + '-';
        timeslot = timeslot + parseInt(new Date(events[i].start.getFullYear(), events[i].start.getMonth(), events[i].start.getDate(), 23, 59, 59).getTime() / 60000);
        if(!cats[timeslot]){
          cats[timeslot] = new Array();
          cats[timeslot][0] = events[i];
        }
        else{
          cats[timeslot][cats[timeslot].length] = events[i];
        }
      }
    }
    var c = -1;
    for(var i in cats){
      if(cats[i][0] && cats[i][0].start.getTime() < t_start || cats[i][0] && cats[i][0].start.getTime() >= t_end){
        continue;
      }
      start = $.fullCalendar.parseDate( cats[i][0].start );
      myday  = $.fullCalendar.formatDate( start, "ddd" );
      mydate = $.fullCalendar.formatDate( start, js_date_formats[rcmail.env.rc_date_format] );
      //mydate = mydate.replace(start.getFullYear(), '');
      row = '<tr><td nowrap width="1%" align="center" class="day">' + ldays[myday] + '<br /><small>(' + mydate + ')</small></td>';
      var cols = new Object();
      for(var ii in cats[i]){
        ts_start = $.fullCalendar.formatDate( cats[i][ii].start, js_time_formats[rcmail.env.rc_time_format] );
        if(cats[i][ii].end){
          if(cats[i][ii].start.getTime() == cats[i][ii].end.getTime()){
            ts_end = ts_start;
            ts_start = '';
          }
          else if(cats[i][ii].start.getHours() == 0 && cats[i][ii].start.getMinutes() == 0 && cats[i][ii].end.getHours() == 23 && cats[i][ii].end.getMinutes() == 59){
            ts_start = '';
            ts_end = rcmail.gettext('all-day', 'calendar');
          }
          else{
            ts_end = $.fullCalendar.formatDate( cats[i][ii].end, js_time_formats[rcmail.env.rc_time_format] );
          }
        }
        else{
          ts_end = '';
        }
        disp = cats[i][ii].className;
        if(cats[i][ii].classNameDisp){
          disp = cats[i][ii].classNameDisp;
        }
        if(disp == rcmail.gettext('default', 'calendar'))
          disp = '';
        content = cats[i][ii].title;
        if(cats[i][ii].location){
          content = content + '<br />------<br /><small>@ ' + cats[i][ii].location + '</small>';
        }
        if(cats[i][ii].description){
          content = content + '<br />------<br /><small>' + cats[i][ii].description + '</small>';
        }
        content = content + '<br />------<br /><table cellspacing="0" cellpadding="0">';
        if(ts_start != ''){
          content = content + '<tr><td style="border-style:none"><small>' + rcmail.gettext('start','calendar') + ':&nbsp;</small></td><td style="border-style:none"><small>' + ts_start + '</small></td></tr>';
        }
        if(ts_end != ''){
          if(ts_end == rcmail.gettext('all-day', 'calendar') || ts_start == ''){
            content = content + '<tr><td style="border-style:none"><small>' + ts_end + '</small></td></tr>';
          }
          else{
            content = content + '<tr><td style="border-style:none"><small>' + rcmail.gettext('end','calendar') + ':&nbsp;</small></td><td style="border-style:none"><small>' + ts_end + '</small></td></tr>';
          }
        }
        content = content + '</table>';
        content = '<fieldset style="max-width: ' + mwidth + 50 + 'px;word-wrap: break-word;" class="print">' + content + '</fieldset>';
        if(!cols[disp]){
          cols[disp] = content;
        }
        else{
          cols[disp] = cols[disp] + content;
        }
      }
      for(ii in arrcols){
        if(cols[arrcols[ii]]){
          row = row + '<td valign="top">' + cols[arrcols[ii]] + '</td>';
        }
        else{
          row = row + '<td>&nbsp;</td>';
        }
      }
      c ++;
      row = row + '</tr>';
      rcmail.env.myevents[c] = i + '_' + row;
    }
    rcmail.env.myevents.sort();
    for(i in rcmail.env.myevents){
      temp = rcmail.env.myevents[i].split("_");
      row = rcmail.env.myevents[i].replace(temp[0] + '_', '');
      tbody = tbody + row;
    }
    thead = '<tr><th colspan="' + arrcols.length + 3 + '">' + $.fullCalendar.formatDate( new Date(t_start), js_date_formats[rcmail.env.rc_date_format] ) + ' - ' + $.fullCalendar.formatDate( new Date(t_end - 1), js_date_formats[rcmail.env.rc_date_format] ) + '</th></tr>' + thead;
    table = '<table id="calprinttable" cellspacing="0" width="99%"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';
    $('#agendalist').html(table);
  }
}
var calendar_commands = new calendar_commands();





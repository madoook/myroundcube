function show_caldav_dialog(a,b){var c=$("#caldav_dialog");if(!0!==c.dialog("isOpen")){var d={};d[rcmail.gettext("cancel","calendar")]=function(){c.dialog("close");b.checked=!1};d[rcmail.gettext("remove","calendar")]=function(){$("#caldav_category").val(a);rcmail.http_post("plugin.calendar_removeCalDAV",$("#caldav_form").serialize());c.dialog("destroy");c.hide();$("#edit_"+a).attr("style","visibility:hidden");$("#category_handler_"+a).attr("class","");$("#category_handler_"+a).attr("onclick","removeRow(this.parentNode.parentNode)");
$("#category_handler_"+a).attr("title",rcmail.gettext("remove_category","calendar"));b.checked=!1};d[rcmail.gettext("save","calendar")]=function(){$("#caldav_category").val(a);""!=$("#caldav_user").val()&&""!=$("#caldav_password").val()&&""!=$("#caldav_url").val()?(rcmail.http_post("plugin.calendar_saveCalDAV",$("#caldav_form").serialize()),c.dialog("destroy"),c.hide(),$("#edit_"+a).attr("style","visibility:visible"),$("#category_handler_"+a).attr("class","protected_category"),$("#category_handler_"+
a).attr("onclick","calendar_toggle_caldav(this, '"+a+"')"),$("#category_handler_"+a).attr("title",rcmail.gettext("unlink_caldav","calendar")),b.checked=!1):$("#caldav_user").focus()};c.dialog({modal:!1,width:600,position:"center",title:a,close:function(){c.dialog("destroy");c.hide();b.checked=!1},buttons:d}).hide()}}
function calendar_toggle_caldav(a,b){"X"==a.value&&(a=document.getElementById("dialog_handler_"+b));rcmail.http_post("plugin.calendar_getCalDAVs","_category="+b);show_caldav_dialog(b,a)}function calendar_getCalDAVs(a){var b=0;$(".edit_caldav").each(function(){"visibility:visible"==$(this).attr("style")&&b++});b>=a.max_caldavs?$("input:radio").each(function(){$(this).attr("disabled",!0)}):$("input:radio").each(function(){$(this).attr("disabled",!1)});calendar_categories_gui(a)}
function calendar_categories_gui(a){$("#caldav_user").val(a.user);"ENCRYPTED"==a.pass||"SESSION"==a.pass||"GOOGLE"==a.pass?($("#caldav_password").val(a.pass),$("#caldav_password").attr("title",rcmail.gettext("passwordisset","calendar"))):($("#caldav_password").val(""),$("#caldav_password").attr("title",rcmail.gettext("passwordisnotset","calendar")));a.url?$("#caldav_url").val(a.url):$("#caldav_url").val(a.cat);a.saved?$("#edit_"+a.category).attr("style","visibility:visible"):$("#edit_"+a.category).attr("style",
"visibility:hidden");a.cal_dont_save_passwords&&$("#caldav_password").attr("readonly",!0);"external"==a.extr||!0===a.extr?$("#caldav_extr").val("external"):$("#caldav_extr").val("internal");"detect"==a.auth?$("#caldav_auth").val("detect"):$("#caldav_auth").val("basic");a.show&&$("#caldav_dialog").show()}
function addRowCategories(a){var b=document.getElementsByTagName("table")[0],c=b.rows.length,a='<input type="text" name="_categories[]" size="'+a+'" />',d='<input type="button" value="X" onclick="removeRow(this.parentNode.parentNode)" title="'+rcmail.gettext("remove_category","calendar")+'" />';try{var e=b.insertRow(c),f=e.insertCell(0);f.innerHTML="&nbsp;";f.className="title";f=e.insertCell(1);f.innerHTML=d+"&nbsp;"+a+'&nbsp;<input type="text" name="_colors[]" size="6" class="color" value="ffffff" />';
jscolor.init()}catch(g){}jscolor_removeHexStrings()}
function addRowCalFeeds(a){var b=document.getElementsByTagName("table")[0],c=b.rows.length,a='<input type="text" name="_calendarfeeds[]" size="'+a+'" />',d='<select name="_feedscategories[]">',e;for(e in categories)d+='<option value="'+e+'">'+e+"</option>";d+="</select>";e='<input type="button" value="X" onclick="removeRow(this.parentNode.parentNode)" title="'+rcmail.gettext("remove_feed","calendar")+'" />';try{var f=b.insertRow(c),g=f.insertCell(0);g.innerHTML="&nbsp;";g.className="title";g=f.insertCell(1);
g.innerHTML=e+"&nbsp;"+a+"&nbsp;"+d;jscolor.init()}catch(h){}}function removeRow(a){var b=document.getElementsByTagName("table")[0];try{b.deleteRow(a.rowIndex),document.forms.form.submit()}catch(c){}}$(document).ready(function(){rcmail.addEventListener("plugin.calendar_getCalDAVs",calendar_getCalDAVs)});
function rcmail_archive(){if(rcmail.env.uid||rcmail.message_list&&rcmail.message_list.get_selection().length){var a=rcmail.env.uid?rcmail.env.uid:rcmail.message_list.get_selection().join(","),b=rcmail.set_busy(!0,"loading");rcmail.http_post("plugin.archive","_uid="+a+"&_mbox="+urlencode(rcmail.env.mailbox),b)}}function rcmail_archive_contextmenu(a){(rcmail.env.uid||rcmail.message_list&&rcmail.message_list.get_selection().length)&&0<rcmail.message_list.get_selection().length&&rcmail_archive(a)}
$(document).ready(function(){window.rcmail&&("larry"!=rcmail.env.skin&&$(".archivefolder").text(""),rcmail.addEventListener("init",function(){rcmail.env.archive_folder&&rcmail.add_onload("rcmail_archive_init()");rcmail.register_command("plugin.archive",rcmail_archive,rcmail.env.uid&&rcmail.env.mailbox!=rcmail.env.archive_folder);rcmail.message_list&&rcmail.message_list.addEventListener("select",function(a){rcmail.enable_command("plugin.archive",0<a.get_selection().length&&rcmail.env.mailbox!=rcmail.env.archive_folder)});
rcmail_archive_icon()}))});function rcmail_archive_icon(){var a;if(rcmail.env.archive_folder&&rcmail.env.archive_folder_icon&&(a=rcmail.get_folder_li(rcmail.env.archive_folder,"",!0)))"larry"!=rcmail.env.skin?$(a).css("background-image","url("+rcmail.env.archive_folder_icon+")"):$(a).addClass("archive"),$(a).insertAfter("#mailboxlist .inbox"),a=$("._archive"),$(a.get(0)).insertBefore("#rcmContextMenu .drafts")}
function rcmail_archive_init(){window.rcm_contextmenu_register_command&&rcm_contextmenu_register_command("archive","rcmail_archive_contextmenu",rcmail.gettext("archivefolder.buttontitle"),"delete",null,!0)};
function collapseall(){$("#mailboxlist div.expanded").each(function(){var a=$(this),a=(""+$(a).attr("onclick")).match(/.*rcmail.command\(["']collapse-folder["'],\s*["']([^"']*)["']\).*/i);rcmail.collapse_folder(a[1])})}function expandall(){$("#mailboxlist div.collapsed").each(function(){var a=$(this),a=(""+$(a).attr("onclick")).match(/.*rcmail.command\(["']collapse-folder["'],\s*["']([^"']*)["']\).*/i);rcmail.collapse_folder(a[1])})};

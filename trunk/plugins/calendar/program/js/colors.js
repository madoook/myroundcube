function d2h(b){return b.toString(16)}function h2d(b){return parseInt(b,16)}function darker(b,f){var b=b.replace("#","").toUpperCase(),d="",a,e,d="",c=[];c.R=h2d(b.substr(0,1)+b.substr(1,1));c.G=h2d(b.substr(2,1)+b.substr(3,1));c.B=h2d(b.substr(4,1)+b.substr(5,1));for(var g in c)e=c[g],a=e/100,a=Math.round(a*f),a=e-a,a=d2h(a),2>a.length&&(a="0"+a),d+=a;return d}
function lighter(b,f){var b=b.replace("#","").toUpperCase(),d="",a,e,d="",c=[];c.R=h2d(b.substr(0,1)+b.substr(1,1));c.G=h2d(b.substr(2,1)+b.substr(3,1));c.B=h2d(b.substr(4,1)+b.substr(5,1));for(var g in c)e=c[g],a=255-e,a/=100,a=Math.round(a*f),a=e+a,a=d2h(a),2>a.length&&(a="0"+a),d+=a;return d};

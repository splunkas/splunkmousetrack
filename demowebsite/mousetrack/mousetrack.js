/**
 *
 * SplunkMouseTrack
 * Custom library for mouse tracking in Javascript and sending it to Splunk
 *
 * Adapted by Lukas Utz <lutz@splunk.com>
 * Based on https://github.com/dgacitua/MouseTrack
 *
 * License: MIT
 * http://opensource.org/licenses/MIT
 *
 */

/**
 * @class vars
 * @constructor
 * @namespace BUCKA
 * @property w window
 * @property d document
 * @property e document element
 * @property g document body
 * @property ping Image object (used to transmit mouse position data to the server)
 * @property srvr url to the 1x1 image used by ping
 * @property navTime navigation start Unix timestamp
 */


var hec_uri = "https://localhost:8088/services/collector";
var hec_token = "YOURHECTOKEN";


var MouseTrack = {};

MouseTrack.vars = {
  w: window,
  d: document
};

MouseTrack.vars.e = MouseTrack.vars.d.documentElement;
MouseTrack.vars.g = MouseTrack.vars.d.getElementsByTagName('html')[0];
MouseTrack.vars.ping = new Image();
MouseTrack.vars.srvr = null;
MouseTrack.vars.navTime = null;

MouseTrack.sendEvent = function(eventstr) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", hec_uri, true);
  xhttp.setRequestHeader("Authorization", "Splunk " + hec_token);
  xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhttp.send(JSON.stringify({ "event": eventstr }));
};

MouseTrack.getPreciseTimestamp = function() {
  if (MouseTrack.vars.navTime != null) {
    return MouseTrack.vars.navTime + performance.now();
  } else {
    return performance.now();
  }
};

MouseTrack.addEvent = function(obj, type, fn) {
  if (obj.attachEvent) {
    obj['e' + type + fn] = fn;
    obj[type + fn] = function() {
      obj['e' + type + fn](MouseTrack.vars.w.event);
    }
    obj.attachEvent('on' + type, obj[type + fn]);
  } else {
    obj.addEventListener(type, fn, false);
  }
};

MouseTrack.moveListener = function(evt) {
  if (MouseTrack.vars.srvr != null) {
    var time = MouseTrack.getPreciseTimestamp();

    var x = evt.pageX,
      y = evt.pageY,
      w = MouseTrack.vars.w.innerWidth || MouseTrack.vars.e.clientWidth || MouseTrack.vars.g.clientWidth,
      h = MouseTrack.vars.w.innerHeight || MouseTrack.vars.e.clientHeight || MouseTrack.vars.g.clientHeight,
      src = window.location;

    if (x == null && evt.clientX != null) {
      x = evt.clientX + (MouseTrack.vars.e && MouseTrack.vars.e.scrollLeft || MouseTrack.vars.g && MouseTrack.vars.g.scrollLeft || 0) -
        (MouseTrack.vars.e && MouseTrack.vars.e.clientLeft || MouseTrack.vars.g && MouseTrack.vars.g.clientLeft || 0);
      y = evt.clientY + (MouseTrack.vars.e && MouseTrack.vars.e.scrollTop || MouseTrack.vars.g && MouseTrack.vars.g.scrollTop || 0) -
        (MouseTrack.vars.e && MouseTrack.vars.e.clientTop || MouseTrack.vars.g && MouseTrack.vars.g.clientTop || 0);
    }

    var movement_output = {
      type: 'mouse_movement',
      x_pos: x,
      y_pos: y,
      w_scr: w,
      h_scr: h,
      _time: time,
      src_url: src
    };

//    console.log(movement_output);
    MouseTrack.sendEvent(movement_output);
  }
};

MouseTrack.clickListener = function(evt) {
  console.log("click");
  if (MouseTrack.vars.srvr != null) {
    var time = MouseTrack.getPreciseTimestamp();

    var x = evt.pageX,
      y = evt.pageY,
      w = MouseTrack.vars.w.innerWidth || MouseTrack.vars.e.clientWidth || MouseTrack.vars.g.clientWidth,
      h = MouseTrack.vars.w.innerHeight || MouseTrack.vars.e.clientHeight || MouseTrack.vars.g.clientHeight,
      src = window.location;

    if (x == null && evt.clientX != null) {
      x = evt.clientX + (MouseTrack.vars.e && MouseTrack.vars.e.scrollLeft || MouseTrack.vars.g && MouseTrack.vars.g.scrollLeft || 0) -
        (MouseTrack.vars.e && MouseTrack.vars.e.clientLeft || MouseTrack.vars.g && MouseTrack.vars.g.clientLeft || 0);
      y = evt.clientY + (MouseTrack.vars.e && MouseTrack.vars.e.scrollTop || MouseTrack.vars.g && MouseTrack.vars.g.scrollTop || 0) -
        (MouseTrack.vars.e && MouseTrack.vars.e.clientTop || MouseTrack.vars.g && MouseTrack.vars.g.clientTop || 0);
    }

    var click_output = {
      type: 'mouse_click',
      x_pos: x,
      y_pos: y,
      w_scr: w,
      h_scr: h,
      _time: time,
      src_url: src
    };

    console.log(click_output);
    MouseTrack.sendEvent(click_output);
  }
};


MouseTrack.init = function(srvr) {
  MouseTrack.vars.srvr = srvr;
  MouseTrack.vars.navTime = Date.now();
  MouseTrack.addEvent(MouseTrack.vars.g, "click", MouseTrack.clickListener);
  MouseTrack.addEvent(MouseTrack.vars.g, "mouseover", MouseTrack.moveListener);
};

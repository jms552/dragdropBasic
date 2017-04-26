var dragdrop = (function () {

  /*
   * Make 'wells' for dragging out multiple copies of the options.
   * Handle dragging options over dropzones & dropping them in.
   * Use one c.for both interact functions, so we can share
   * info about the dragged option.
   */

  var c = {
  
    // enable inertial throwing
    inertia: true,

    // enable autoScroll
    autoScroll: true,
  
    // we'll be dragging a copy of the clicked item.
    thumb: null,
  
    // we keep track of whether it was dropped somewhere good.
    dropped_onto_target: false,
  
    // create a copy of the clicked item.
    onstart: function (evt) {
      c.thumb = evt.target.cloneNode(true);
      // to match styles and position easily, just put the thumb in the original's parent.
      document.body.appendChild(c.thumb);
      c.thumb.style.position = "absolute";
      c.thumb.classList.add('dragging','clone');
  
      var orig_rect = evt.target.getBoundingClientRect();
      c.thumb.dataset.drag_x = 0;
      c.thumb.dataset.drag_y = 0;
      c.thumb.style.left = orig_rect.left + "px";
      c.thumb.style.top = orig_rect.top + "px";
      c.thumb.style.width = (orig_rect.right - orig_rect.left) + "px";
    },

    onmove: function (evt) {
      // keep the dragged position in the data-x/data-y attributes
      x = (c.thumb.dataset.drag_x|0) + evt.dx,
      y = (c.thumb.dataset.drag_y|0) + evt.dy;

      // translate the element
      c.thumb.style.webkitTransform =
      c.thumb.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
        c.thumb.dataset.drag_x = x;
        c.thumb.dataset.drag_y = y;
    },

    ondragenter: function (evt) {
      c.dragged_element = evt.relatedTarget;
      c.drop_target = evt.target;
      c.drop_target.classList.add("hovered");
      c.drop_target.parentNode.classList.add("hovered");
    },

    ondragleave: function (evt) {
      var screeningtools = document.getElementsByClassName("screeningtool");
      var screeningtool;
      for (var i=0; i < screeningtools.length; i++) {
        screeningtool = screeningtools[i];
        if (screeningtool === undefined) continue;
        screeningtool.classList.remove("hovered");
        for (var j=0; j < screeningtool.children.length; j++) {
          if (screeningtool.children[j] === undefined) continue;
          screeningtool.children[j].classList.remove("hovered");
        }
      }
    },
  
    ondrop: function (evt) 
    {
      c.dragged_element = evt.relatedTarget;
      c.drop_target = evt.target;
      // make sure there isn't one of these already in the container.
      var already_dropped_options = c.drop_target.getElementsByTagName("span");
      var option_already_here = false;
      for (var i=0; i <already_dropped_options.length; i++) {
        if (already_dropped_options[i].innerHTML == c.dragged_element.innerHTML) {
          option_already_here = true;
        }
      }
      if (!option_already_here) {
        c.thumb = document.body.removeChild(c.thumb);
    	  var dropped_span = document.createElement("span");
    	  dropped_span.innerHTML = c.thumb.innerHTML;
        dropped_span.title = c.thumb.title;
    	  c.drop_target.appendChild(dropped_span);
        c.drop_target.classList.remove("hovered");
        var screeningtools = document.getElementsByClassName("screeningtool");
        var screeningtool;
        for (var i=0; i < screeningtools.length; i++) {
          screeningtool = screeningtools[i];
          if (screeningtool === undefined) continue;
          screeningtool.classList.remove("hovered");
        }
        try {
          // record the answer.
          answer_state[c.drop_target.id].push(c.thumb.innerHTML);
        } catch (e) { 
          console.log("Could not record drop for:", c.drop_target.parentElement.id, c.option_title);
        }
  	    c.dropped_onto_target = true;
      }
    },
  
    onend: function (evt) {
       // if not dropped over a valid target, remove the draggable.
       if (!c.dropped_onto_target) {
         c.thumb.classList.add("fading");
         evt.target
         setTimeout(function () {
            document.body.removeChild(c.thumb);
         }, 200);
       }
       c.dropped_onto_target = false;
     },
  
  }

  // for discarding dragged copies once they have been placed.
  var d = {
    onstart: function (evt) {
      d.parentNode = evt.target.parentNode;
      var orig_rect = evt.target.getBoundingClientRect();
      evt.target.style.position = "absolute";
      var x = evt.interaction.startOffset.left;
      var y = evt.interaction.startOffset.top;
      // translate the element
      evt.target.style.webkitTransform =
      evt.target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';
    },
  
    onmove: function (evt) {
      // keep the dragged position in the data-x/data-y attributes
      x = (evt.target.dataset.drag_x|0) + evt.dx,
      y = (evt.target.dataset.drag_y|0) + evt.dy;

      // translate the element
      evt.target.style.webkitTransform =
      evt.target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      evt.target.dataset.drag_x = x;
      evt.target.dataset.drag_y = y;
    },
  
    onend: function (evt) {
      evt.target.classList.add("fading");
      evt.target
      setTimeout(function () {
        evt.target.parentNode.removeChild(evt.target);
      }, 200);
    }
  }

  // hash of definitions for tooltips.
  defs = {
    
  }

  function init () {
    // initialize definition tooltips.
    var options = document.getElementsByTagName("span");
    var option;
    for (var i=0; i<options.length; i++) {
      option = options[i];
      option.title = option.getAttribute("data-tool"); //defs[option.innerHTML];
    }
  
    // initialize drag-and-drop.
    interact('.well > span').draggable(c);
    interact('.droptarget').dropzone(c);
    interact('.screeningtool > div:not(.guy) span').draggable(d);
  }
  
  init();
  
  var answer_state = {
    "screeningtool1": [],
    "screeningtool2": [],
    "screeningtool3": [],
    "screeningtool4": [],
    "screeningtool5": [],
    "screeningtool6": []
  };
  
  function getState () {
    return JSON.stringify(answer_state);
  }
  
  function setState (info) {
    state_str = arguments.length === 1 ? arguments[0] : arguments[1];
    answer_state = JSON.parse(state_str);
  } 
  
  function getGrade () {
    return JSON.stringify(answer_state);
  }
  
  return {
    getState: getState,
    setState: setState,
    getGrade: getGrade
  }
})();


document.addEventListener("DOMContentLoaded", dragdrop.init); 
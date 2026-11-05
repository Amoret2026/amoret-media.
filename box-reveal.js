(function(){
  if (window.__amrReveal) return; window.__amrReveal = true;
  var BASE = "https://cdn.jsdelivr.net/gh/Amoret2026/amoret-media.@main/box-reveal/";
  var TOTAL = 180;
  var STEP_START = [0, 4, 22, 47, 70, 92, 115, 140];
  var IVORY = "rgba(247,244,238,1)", IVORY_0 = "rgba(247,244,238,0)";

  var track = document.getElementById("amr-reveal");
  if (!track) return;

  /* Squarespace keeps blocks inside fixed-height grids, which stops a long scroll section working.
     On the live site, lift the animation out of its section so it sits directly after the hero. */
  var editing = document.body.classList.contains("sqs-edit-mode-active") || /config|editor/.test(location.search);
  var sec = track.closest("section");
  if (sec && !editing){
    sec.parentNode.insertBefore(track, sec);
    sec.style.display = "none";
  }

  var canvas = document.getElementById("amr-film"), ctx = canvas.getContext("2d");
  var items = document.getElementById("amr-steps").children;
  var loadEl = document.getElementById("amr-loading");
  var frames = new Array(TOTAL), loaded = 0, current = -1, drawn = -1;

  function src(i){ return BASE + "f_" + String(i + 1).padStart(3, "0") + ".webp"; }
  function nearest(i){
    for (var d = 0; d < TOTAL; d++){
      if (frames[i - d] && frames[i - d].ok) return i - d;
      if (frames[i + d] && frames[i + d].ok) return i + d;
    }
    return -1;
  }
  function draw(){
    var n = nearest(current);
    if (n < 0 || n === drawn) return;
    var W = canvas.width, H = canvas.height, E = 56;
    ctx.drawImage(frames[n], 12, 0, 696, 1280, 0, 0, W, H);
    [[0,0,E,0],[W,0,W-E,0],[0,0,0,E],[0,H,0,H-E]].forEach(function(g){
      var gr = ctx.createLinearGradient(g[0],g[1],g[2],g[3]);
      gr.addColorStop(0, IVORY); gr.addColorStop(1, IVORY_0);
      ctx.fillStyle = gr; ctx.fillRect(0,0,W,H);
    });
    drawn = n;
  }
  function stepFor(i){ var s = 0; for (var k = 0; k < STEP_START.length; k++) if (i >= STEP_START[k]) s = k; return s; }
  function update(){
    var r = track.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
    var i = Math.round(p * (TOTAL - 1));
    if (i !== current){
      current = i;
      var s = stepFor(i);
      for (var k = 0; k < items.length; k++) items[k].classList.toggle("on", k === s);
      drawn = -1; draw();
    }
  }
  var next = 0, inflight = 0;
  function pump(){
    while (inflight < 6 && next < TOTAL){
      (function(idx){
        var im = new Image(); inflight++;
        im.onload = function(){ im.ok = true; loaded++; inflight--; if (loaded === TOTAL) loadEl.style.display = "none"; if (Math.abs(idx - current) < 4 || drawn < 0) { drawn = -1; draw(); } pump(); };
        im.onerror = function(){ inflight--; pump(); };
        im.src = src(idx); frames[idx] = im;
      })(next++);
    }
  }
  pump();
  var ticking = false;
  window.addEventListener("scroll", function(){ if (!ticking){ ticking = true; requestAnimationFrame(function(){ ticking = false; update(); }); } }, {passive:true});
  window.addEventListener("resize", update);
  update();
})();

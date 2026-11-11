/* Hero WebGL scene (Three.js r128). Loaded lazily after first paint by main.js.
   Wireframe geometry, orbit rings and a particle shell around the photo frame;
   theme-aware colours, mouse parallax, scroll-driven camera, pauses off-screen. */
window.initHeroScene = function (canvas, stage, opts) {
  var THREE = window.THREE;
  var mobile = window.matchMedia("(max-width: 900px)").matches;
  var lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !mobile, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile || lowPower ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  camera.position.set(0, 0, 9);

  var world = new THREE.Group(); scene.add(world);

  function lineMat(o) { return new THREE.LineBasicMaterial({ transparent: true, opacity: o, depthWrite: false }); }
  function wire(geo, o) { return new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineMat(o)); }

  // Large icosahedron cage behind the frame
  var cage = wire(new THREE.IcosahedronGeometry(3.3, 1), .22); world.add(cage);
  // Torus knot, upper right
  var knot = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.TorusKnotGeometry(.55, .16, 64, 8, 2, 3)), lineMat(.42));
  knot.position.set(2.6, 2.2, -1); world.add(knot);
  // Octahedron, lower left
  var octa = wire(new THREE.OctahedronGeometry(.7, 0), .7); octa.position.set(-2.8, -2.1, .6); world.add(octa);
  // Small dodecahedron, right
  var dode = wire(new THREE.DodecahedronGeometry(.42, 0), .6); dode.position.set(3, -1.4, 1.2); world.add(dode);
  // Tetra, top left
  var tetra = wire(new THREE.TetrahedronGeometry(.38, 0), .7); tetra.position.set(-2.4, 2.4, .8); world.add(tetra);
  // Orbit rings
  function ring(r, tilt) { var g = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2).getPoints(160)); var l = new THREE.LineLoop(g, lineMat(.35)); l.rotation.x = tilt; return l; }
  var ring1 = ring(3.9, 1.25), ring2 = ring(4.4, 1.05); ring2.rotation.y = .5; world.add(ring1, ring2);
  // Orbiting beads
  var beadGeo = new THREE.SphereGeometry(.07, 12, 12);
  var bead1 = new THREE.Mesh(beadGeo, new THREE.MeshBasicMaterial({ transparent: true })), bead2 = bead1.clone(); bead2.material = bead1.material.clone();
  world.add(bead1, bead2);

  // Particles in a spherical shell
  var count = mobile ? 220 : lowPower ? 380 : 700;
  var pos = new Float32Array(count * 3), seeds = new Float32Array(count);
  for (var i = 0; i < count; i++) {
    var r = 3.2 + Math.random() * 3.4, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * .9; pos[i * 3 + 2] = r * Math.cos(ph) * .7 - 1;
    seeds[i] = Math.random();
  }
  var pgeo = new THREE.BufferGeometry(); pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  var dot = document.createElement("canvas"); dot.width = dot.height = 64;
  var dctx = dot.getContext("2d"), grd = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(.35, "rgba(255,255,255,.6)"); grd.addColorStop(1, "rgba(255,255,255,0)");
  dctx.fillStyle = grd; dctx.fillRect(0, 0, 64, 64);
  var pmat = new THREE.PointsMaterial({ size: mobile ? .07 : .06, map: new THREE.CanvasTexture(dot), transparent: true, depthWrite: false, sizeAttenuation: true });
  var points = new THREE.Points(pgeo, pmat); world.add(points);

  // Theme colours
  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#3987FF"; }
  function applyColors() {
    var dark = (window.getTheme ? window.getTheme() : "dark") === "dark";
    var a = new THREE.Color(css("--accent")), b = new THREE.Color(css("--accent2")), c = new THREE.Color(css("--cyan"));
    var blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending, k = dark ? 1 : 1.25;
    cage.material.color = a; cage.material.opacity = .2 * k;
    knot.material.color = b; knot.material.opacity = .42 * k;
    octa.material.color = c; dode.material.color = a; tetra.material.color = b;
    ring1.material.color = a; ring2.material.color = b; ring1.material.opacity = ring2.material.opacity = .32 * k;
    bead1.material.color = c; bead2.material.color = b;
    pmat.color = dark ? c : a; pmat.opacity = dark ? .85 : .55; pmat.blending = blend;
    [cage, knot, octa, dode, tetra, ring1, ring2].forEach(function (o) { o.material.blending = blend; o.material.needsUpdate = true; });
    pmat.needsUpdate = true;
  }
  applyColors();
  window.addEventListener("themechange", function () { requestAnimationFrame(function () { applyColors(); if (!running) render(performance.now()); }); });

  function resize() {
    var r = canvas.getBoundingClientRect(); if (!r.width) return;
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener("resize", resize);

  var running = false, raf = 0, t0 = performance.now(), entrance = 0;
  var rotX = 0, rotY = 0;
  function render(now) {
    var t = (now - t0) / 1000;
    entrance = Math.min(1, entrance + .012);
    var e = 1 - Math.pow(1 - entrance, 3);
    var p = window.__heroPointer || { x: 0, y: 0 };
    rotY += (p.x * .5 - rotY) * .05; rotX += (p.y * .35 - rotX) * .05;
    world.rotation.y = rotY + (opts.reduced ? .3 : t * .03);
    world.rotation.x = rotX;
    world.scale.setScalar(.7 + .3 * e);

    if (!opts.reduced) {
      cage.rotation.y = t * .08; cage.rotation.x = t * .05;
      knot.rotation.x = t * .4; knot.rotation.y = t * .25; knot.position.y = 2.2 + Math.sin(t * .8) * .15;
      octa.rotation.y = t * .6; octa.rotation.z = t * .3; octa.position.y = -2.1 + Math.sin(t * .9 + 1) * .18;
      dode.rotation.x = t * .5; dode.rotation.y = t * .35; dode.position.y = -1.4 + Math.sin(t * 1.1 + 2) * .14;
      tetra.rotation.x = t * .7; tetra.rotation.z = t * .4;
      points.rotation.y = -t * .02;
      var a1 = t * .5, a2 = -t * .35 + 2;
      bead1.position.set(Math.cos(a1) * 3.9, Math.sin(a1) * 3.9 * Math.cos(1.25), Math.sin(a1) * 3.9 * Math.sin(1.25));
      bead2.position.set(Math.cos(a2) * 4.4, Math.sin(a2) * 4.4 * Math.cos(1.05), Math.sin(a2) * 4.4 * Math.sin(1.05)).applyAxisAngle(new THREE.Vector3(0, 1, 0), .5);
    } else {
      bead1.position.set(3.9, 0, 0); bead2.position.set(-4.4, 0, 0);
    }
    // scroll-driven camera: pull back and drift up as the hero leaves the viewport
    var sr = stage.getBoundingClientRect(), prog = Math.min(1, Math.max(0, -sr.top / (sr.height || 1)));
    camera.position.z = 9 + prog * 4; camera.position.y = prog * 1.6; camera.position.x = p.x * -.6;
    camera.lookAt(0, prog * .6, 0);
    renderer.render(scene, camera);
    if (running && !opts.reduced) raf = requestAnimationFrame(render);
  }
  function start() { if (running) return; running = true; raf = requestAnimationFrame(render); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  if (opts.reduced) { entrance = 1; render(performance.now()); }
  else {
    new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(stage);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  }
  stage.classList.add("gl-ready");
};

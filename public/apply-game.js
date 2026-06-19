/* ============================================================
   Olivier Club — "Hero Journey" pixel ski-game scene
   A self-contained canvas renderer. The form controller drives it
   via window.SkiGame.skiToStop(k) and window.SkiGame.summit().
   ============================================================ */
(function () {
  "use strict";

  // ---- Palette ---------------------------------------------------------
  const C = {
    sky: "#ECE7D3",
    sun: "#F2A93B",
    sunCore: "#F8C75B",
    cloud: "#D7D1C0",
    cloud2: "#CFC8B5",
    rangeFar: "#DCD8E4", // distant snow range (cool tint)
    rangeFar2: "#CFCBDD",
    rangeMid: "#E9E5EE",
    rock: "#9B94A6",
    rockDark: "#7E7689",
    snow: "#FBFAF4",
    snowEdge: "#FFFFFF",
    snowShade: "#DCE2EA",
    snowShade2: "#C9D2DE",
    pine: "#3C5A45",
    pineDark: "#2C4536",
    pineSnow: "#EEF2F0",
    flagRed: "#C0392B",
    flagBlue: "#2A6FAF",
    pole: "#5A5547",
    jacket: "#5B5A3C", // brand olive (used for a small chest patch)
    jacketHi: "#6E6D4B",
    jacketLo: "#3F3E28",
    pants: "#2E2D1C",
    skin: "#E8BB90",
    skinSh: "#CF9E72",
    hair: "#3A2C22",
    scarf: "#C0392B",
    // detailed skier kit (matches the reference)
    helmet: "#F3F2EC",
    helmetSh: "#CFCEC4",
    helmetRim: "#9C9B91",
    suit: "#7FB4E0",
    suitHi: "#AAD4F2",
    suitLo: "#4E84B8",
    glove: "#243F5E",
    boot: "#ECECE4",
    bootSh: "#B7B7AD",
    goggleBlue: "#3E7FD0",
    goggleBlueHi: "#CDE6FF",
    goggleRim: "#16243A",
    goggleHi: "#FFFFFF",
    ski: "#211F18",
    skiBody: "#22303E",
    skiBlue: "#2A6FAF",
    skiRed: "#C0392B",
    skiWhite: "#F2F2EC",
    // hobby horse
    horse: "#9A6234",
    horseDark: "#6E4220",
    horseMane: "#4A2C16",
    horseStick: "#8A5A30",
    // mountain goat
    goatBody: "#ECE8DC",
    goatDark: "#B9B2A2",
    goatHorn: "#6E5A3C",
    goatBeard: "#D2CBB8",
    goatHoof: "#3A332A",
    // show-jumping gates
    gatePost: "#CFC7B5",
    gatePostTop: "#A89E88",
    gateRailA: "#C0392B",
    gateRailB: "#F4F2EA",
    // trampoline
    // trampoline (round, black, Tunturi-style)
    trampFrame: "#1A1A20",
    trampMat: "#26252E",
    trampLeg: "#AFACA4",
    spray: "#FFFFFF",
    flagPole: "#5A5547",
    summitFlag: "#C0392B",
  };

  // ---- Terrain profile (fraction of canvas height; 0=top,1=bottom) -----
  // 10 stops: stop 0..8 = questions 1..9, stop 9 = the finish.
  const SEG = 560; // world px between stops
  const NSTOP = 10;
  // Downhill ski-slope geometry. The skier stays locked at a fixed screen
  // height while the diagonal slope + obstacles scroll past (classic
  // side-scroller), so it reads as actually skiing downhill through snow.
  const GROUND_FRAC = 0.44; // rider's foot screen height (fraction of H)
  const GRADE = 0; // straight, flat ground
  const ROLL_A = 0; // no roll — plain straight ground
  const ROLL_P = 540;

  // ---- State -----------------------------------------------------------
  let canvas,
    ctx,
    W = 0,
    H = 0,
    dpr = 1,
    PX = 4;
  let raf = null,
    t0 = performance.now(),
    lastT = t0;
  let scrollX = 0,
    scrollTarget = 0;
  // smooth eased glide between stops
  let tweening = false,
    tweenFrom = 0,
    tweenTo = 0,
    tweenT = 0,
    tweenDur = 1500;
  let cameraY = 0,
    cameraTarget = 0; // vertical camera pan (summit reveal)
  let curStop = 0;
  let moving = false;
  let glintT = 0,
    glintActive = 0;
  const spray = [];
  let summitMode = false,
    summitT = 0,
    flagPlanted = false;
  let hop = 0; // extra vertical lift (px) for summit landing
  let prevLift = 0; // last frame's airborne lift (jump/land detection)
  let launched = false; // has the launch ramp fired this run
  const clouds = [];
  let skierScreen = { x: 0, y: 0 };
  const onArriveCbs = [];

  // skier sits at this fraction of width
  function skierScreenX() {
    return Math.round(W * 0.4);
  }

  // ---- Helpers ---------------------------------------------------------
  function snap(v) {
    return Math.round(v / PX) * PX;
  }
  function smooth(t) {
    return t * t * (3 - 2 * t);
  }
  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function stopX(k) {
    return k * SEG;
  }

  // ---- Jumps: the skier leaps over each obstacle while gliding ----------
  const JUMP_HALF = SEG * 0.34; // horizontal half-width of a jump arc
  function jumpInfo(wx) {
    for (const o of obstacles) {
      if (o.jumpH == null) continue;
      const half = o.half || JUMP_HALF;
      const d = wx - o.wx;
      if (Math.abs(d) < half) {
        const t = (d + half) / (2 * half); // 0..1 across the arc
        return { o, t, lift: Math.sin(t * Math.PI) * o.jumpH * PX };
      }
    }
    return null;
  }
  function airLift(wx) {
    const j = jumpInfo(wx);
    return j ? j.lift : 0;
  }

  // a snow summit at the very end that the rider is catapulted onto
  function peakLift(wx) {
    const c = stopX(NSTOP - 1);
    const halfW = SEG * 0.72;
    const d = Math.abs(wx - c);
    if (d >= halfW) return 0;
    return smooth(1 - d / halfW) * H * 0.4;
  }

  // ---- Downhill slope geometry (skier-relative screen coordinates) -----
  function skierWX() {
    return scrollX + skierScreenX();
  }
  // screen Y of the snow surface at a given SCREEN x (cameraY applied
  // separately via the frame's translate, so it's not included here)
  function screenGroundY(screenX) {
    const wx = scrollX + screenX;
    const roll = ROLL_A * H * (Math.sin(wx / ROLL_P) - Math.sin(skierWX() / ROLL_P));
    return GROUND_FRAC * H + GRADE * (screenX - skierScreenX()) + roll - peakLift(wx);
  }
  function groundAngle(screenX) {
    const d = 12;
    return Math.atan2(screenGroundY(screenX + d) - screenGroundY(screenX - d), d * 2);
  }

  // which mount the rider is on, by world position:
  //   acts 1-3 hobby horse · 4-8 mountain goat · final trampoline jump on skis
  function phaseAt(wx) {
    const seg = wx / SEG;
    if (seg < 3) return "hobby";
    if (seg < 8) return "goat";
    return "ski"; // skis only for the last trampoline leap to the peak
  }

  // ---- Obstacles -------------------------------------------------------
  // Show-jumping gates that get HIGHER and HIGHER. The rider jumps each on
  // whatever mount the act calls for; the last is the big trampoline.
  const obstacles = [];
  function buildObstacles() {
    obstacles.length = 0;
    const N = NSTOP - 1; // 9 jumps (one between each pair of stops)
    for (let i = 0; i < N; i++) {
      const wx = stopX(i) + SEG * 0.5;
      const ph = i < 3 ? "hobby" : i < 8 ? "goat" : "ski";
      const h = 4 + i * 1.45; // gate height (PX units) — climbs each time
      let jumpH,
        kind = "gate",
        half;
      if (i === N - 1) {
        // final TRAMPOLINE — bounces him onto the peak
        kind = "tramp";
        jumpH = 44;
        half = SEG * 0.5;
      } else if (ph === "hobby") jumpH = h + 6;
      else if (ph === "goat")
        jumpH = h + 18; // goat leaps really high
      else jumpH = h + 9;
      obstacles.push({ wx, h, jumpH, half, idx: i, kind, isFinal: i === N - 1 });
    }
  }

  // ---- Clouds ----------------------------------------------------------
  function buildClouds() {
    clouds.length = 0;
    const N = 7;
    for (let i = 0; i < N; i++) {
      clouds.push({
        x: Math.random(), // 0..1 of a wide band
        y: 0.08 + Math.random() * 0.34,
        s: 0.7 + Math.random() * 0.8, // scale
        spd: 0.4 + Math.random() * 0.7,
      });
    }
  }

  // ---- Resize ----------------------------------------------------------
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    PX = Math.max(3, Math.round(W / 300));
    // keep skier at current stop after resize
    scrollTarget = stopX(curStop) - skierScreenX();
    if (!tweening) {
      scrollX = scrollTarget;
      tweenFrom = tweenTo = scrollTarget;
    }
  }

  // ---- Drawing primitives ---------------------------------------------
  function R(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(snap(x), snap(y), Math.max(PX, snap(w)), Math.max(PX, snap(h)));
  }

  // ---- Background elements --------------------------------------------
  function drawSun(time) {
    const cx = W * 0.78,
      cy = H * 0.2;
    const pulse = 1 + Math.sin(time / 900) * 0.06;
    // glow
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 130 * pulse);
    g.addColorStop(0, "rgba(242,169,59,0.55)");
    g.addColorStop(0.5, "rgba(242,169,59,0.18)");
    g.addColorStop(1, "rgba(242,169,59,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, 130 * pulse, 0, Math.PI * 2);
    ctx.fill();
    // pixel disc
    const r = 26;
    for (let yy = -r; yy <= r; yy += PX) {
      for (let xx = -r; xx <= r; xx += PX) {
        if (xx * xx + yy * yy <= r * r) {
          const core = xx * xx + yy * yy <= r * 0.5 * (r * 0.5);
          R(cx + xx, cy + yy, PX, PX, core ? C.sunCore : C.sun);
        }
      }
    }
  }

  function drawCloud(px, py, scale, shade) {
    const u = PX * scale;
    const col = shade ? C.cloud2 : C.cloud;
    // chunky pixel cloud blob
    const cells = [
      [2, 0, 3, 1],
      [1, 1, 6, 1],
      [0, 2, 9, 1],
      [0, 3, 9, 1],
      [1, 4, 7, 1],
    ];
    for (const [x, y, w, h] of cells) {
      R(px + x * u, py + y * u, w * u, h * u, col);
    }
  }

  function drawClouds(time) {
    const band = W + 400;
    for (const c of clouds) {
      let x = c.x * band - time * 0.006 * c.spd - scrollX * 0.05;
      x = (((x % band) + band) % band) - 200;
      drawCloud(x, H * c.y, c.s, c.x > 0.5);
    }
  }

  // distant snow ranges (parallax)
  function drawRange(par, baseFrac, amp, period, color, alpha) {
    const off = -scrollX * par;
    const baseY = H * baseFrac;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += PX) {
      const wx = x - off;
      const y =
        baseY -
        Math.abs(Math.sin(wx / period)) * amp -
        Math.abs(Math.sin(wx / (period * 0.37 + 11))) * amp * 0.4;
      ctx.lineTo(snap(x), snap(y));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ---- Foreground snow slope ------------------------------------------
  function drawSlope() {
    // main snow body
    ctx.fillStyle = C.snow;
    ctx.beginPath();
    ctx.moveTo(0, H);
    const pts = [];
    for (let x = -PX; x <= W + PX; x += PX) {
      const y = screenGroundY(x);
      pts.push([snap(x), snap(y)]);
    }
    ctx.lineTo(pts[0][0], pts[0][1]);
    for (const p of pts) ctx.lineTo(p[0], p[1]);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    // bright top edge
    for (const [x, y] of pts) R(x, y, PX, PX, C.snowEdge);
    // shade band a bit below the edge + faint contour lines
    for (const [x, y] of pts) {
      R(x, y + PX * 2, PX, PX, C.snowShade);
    }
    for (let k = 6; k < 40; k += 7) {
      for (const [x, y] of pts) {
        if ((x + k) % (PX * 9) < PX) R(x, y + PX * k, PX, PX, "rgba(201,210,222,0.5)");
      }
    }
  }

  // ---- Obstacle sprites ------------------------------------------------
  // a show-jumping gate (two standards + red/white rails) — climbs each level
  function drawGate(sx, sy, h) {
    const u = PX;
    const wHalf = 3.6;
    // posts
    R(sx - wHalf * u, sy - h * u, u, h * u, C.gatePost);
    R(sx + wHalf * u, sy - h * u, u, h * u, C.gatePost);
    R(sx - wHalf * u, sy - h * u, u, u, C.gatePostTop);
    R(sx + wHalf * u, sy - h * u, u, u, C.gatePostTop);
    // rails between the posts (alternating red / white)
    const nR = Math.max(2, Math.round(h / 2.6));
    for (let k = 0; k < nR; k++) {
      const ry = sy - ((h * (k + 0.7)) / nR) * u;
      R(sx - wHalf * u + u, ry, (wHalf * 2 - 1) * u, u * 0.9, k % 2 ? C.gateRailA : C.gateRailB);
    }
    // base feet
    R(sx - (wHalf + 1) * u, sy - u, u * 1.6, u, C.gatePostTop);
    R(sx + wHalf * u - 0.6 * u, sy - u, u * 1.6, u, C.gatePostTop);
  }

  // the final round black trampoline (Tunturi-style) that bounces him up
  function drawTrampoline(sx, sy) {
    const u = PX;
    const rx = 9.5,
      ry = 3.2; // ellipse radii (px units) — wide, low
    const topY = sy - 5.2; // mat plane height above ground
    // angled metal legs
    R(sx - rx * 0.7 * u, topY * u + ry * 0.6 * u, 1.2 * u, 5.6 * u, C.trampLeg);
    R(sx + rx * 0.7 * u - 1.2 * u, topY * u + ry * 0.6 * u, 1.2 * u, 5.6 * u, C.trampLeg);
    R(sx - 1.6 * u, topY * u + ry * u, 1.1 * u, 5.2 * u, C.trampLeg);
    R(sx + 0.5 * u, topY * u + ry * u, 1.1 * u, 5.2 * u, C.trampLeg);
    // black mat (filled ellipse)
    for (let yy = -ry; yy <= ry; yy += 0.5) {
      const w = Math.sqrt(Math.max(0, 1 - (yy / ry) * (yy / ry))) * rx;
      R(sx - w * u, (topY + yy) * u, w * 2 * u, 0.6 * u, C.trampMat);
    }
    // mat sheen
    R(sx - rx * 0.4 * u, (topY - ry * 0.3) * u, rx * 0.5 * u, 0.6 * u, "#34333E");
    // thick padded black rim around the ellipse edge
    for (let a = 0; a < Math.PI * 2; a += 0.16) {
      const ex = Math.cos(a) * rx,
        ey = Math.sin(a) * ry;
      R(sx + ex * u - 0.5 * u, (topY + ey) * u - 0.5 * u, 1.5 * u, 1.5 * u, C.trampFrame);
    }
    // brighter front lip
    for (let a = 0.2; a < Math.PI - 0.2; a += 0.18) {
      const ex = Math.cos(a) * rx,
        ey = Math.sin(a) * ry;
      R(sx + ex * u, (topY + ey) * u, 1.1 * u, 0.9 * u, "#3A3A46");
    }
  }

  function drawObstacles() {
    for (const o of obstacles) {
      const sx = o.wx - scrollX;
      if (sx < -200 || sx > W + 200) continue;
      const sy = screenGroundY(sx) + PX;
      if (o.kind === "tramp") drawTrampoline(sx, sy);
      else drawGate(sx, sy, o.h);
    }
  }

  // summit flag (planted on success)
  function drawSummitFlag(sx, sy, prog) {
    const u = PX;
    const poleH = 16 * u;
    R(sx, sy - poleH, u, poleH, C.flagPole);
    const fw = Math.round(7 * prog);
    for (let r = 0; r < 5; r++) {
      const w = Math.max(0, Math.min(fw, 7 - Math.abs(r - 2)));
      if (w > 0) R(sx + u, sy - poleH + r * u, w * u, u, C.summitFlag);
    }
    // little snow mound at base
    R(sx - 3 * u, sy - u, 7 * u, u, C.snowEdge);
  }

  // ---- Rider sprite (3 acts: hobby-horse · mountain goat · skis) -------
  // local art layout, origin at the rider's foot on the snow, y up = negative.
  // The torso/head/helmet/goggles are shared; only the mount + legs change.
  function drawRider(time, lean, run) {
    const su = Math.max(2, Math.round(PX * 0.8));
    const sx = skierScreenX();
    const wx = scrollX + sx;
    const ji = jumpInfo(wx);
    const lift = ji ? ji.lift : 0;
    const sy = screenGroundY(sx) - hop - lift;
    const phase = phaseAt(wx);
    const airborne = lift > 1.5;
    skierScreen.x = sx;
    skierScreen.y = sy - 31 * su + cameraY; // helmet-top anchor (incl. camera pan)

    // rotation: level on flat ground; nose-up on takeoff → nose-down on landing
    let rot = lean * 0.4;
    if (ji && lift > 1) rot = (ji.t - 0.5) * 0.7;

    ctx.save();
    ctx.translate(snap(sx), snap(sy));
    ctx.rotate(rot);

    const bob = Math.sin(time / 130) * (run ? 1 : 0.3) * su * 0.4;

    function r(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.round(x * su),
        Math.round(y * su + bob),
        Math.round(Math.max(1, w) * su),
        Math.round(Math.max(1, h) * su)
      );
    }
    function disc(cx, cy, rad, color) {
      for (let yy = -rad; yy <= rad; yy++) {
        for (let xx = -rad; xx <= rad; xx++) {
          if (xx * xx + yy * yy <= rad * rad + rad * 0.5) r(cx + xx, cy + yy, 1, 1, color);
        }
      }
    }
    function line(x1, y1, x2, y2, wd, color) {
      const steps = Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))) * 2;
      for (let i = 0; i <= steps; i++) {
        const tt = i / steps;
        r(x1 + (x2 - x1) * tt, y1 + (y2 - y1) * tt, wd, wd, color);
      }
    }

    const gait = run && !airborne ? Math.sin(time / 90) : 0;

    // ================= MOUNT + LEGS (phase-specific) =================
    if (phase === "ski") {
      // ---- SKIS ----
      r(-9, 0.2, 20, 1.4, C.skiBody);
      r(10.5, -1, 3, 1.7, C.skiBody);
      r(-11, -0.3, 2.6, 1.6, C.skiBody);
      r(7.4, 0.5, 2.2, 0.9, C.skiBlue);
      r(9.6, 0.5, 1.5, 0.9, C.skiWhite);
      r(-9, 0.5, 2.2, 0.9, C.skiRed);
      // ---- BOOTS ----
      r(-2.9, -4, 3.1, 4, C.boot);
      r(0.7, -4, 3.1, 4, C.boot);
      r(-2.9, -4, 3.1, 1, C.bootSh);
      r(0.7, -4, 3.1, 1, C.bootSh);
      r(-2.9, -1.2, 3.1, 1.2, C.glove);
      r(0.7, -1.2, 3.1, 1.2, C.glove);
      // ---- LEGS (downhill tuck) ----
      r(-2.7, -9, 2.9, 5.2, C.suit);
      r(0.7, -9, 2.9, 5.2, C.suit);
      r(-2.7, -9, 0.9, 5.2, C.suitHi);
      r(0.7, -9, 0.9, 5.2, C.suitHi);
      r(1.7, -9, 0.9, 5.2, C.suitLo);
      r(-0.7, -9, 0.7, 5.2, C.suitLo);
      r(-3, -13.6, 3.3, 5, C.suit);
      r(0.5, -13.6, 3.3, 5, C.suit);
      r(-3, -13.6, 1, 5, C.suitHi);
      r(0.5, -13.6, 1, 5, C.suitHi);
      r(-3, -9.7, 3.3, 0.8, C.suitLo);
      r(0.5, -9.7, 3.3, 0.8, C.suitLo);
    } else if (phase === "hobby") {
      // ---- HOBBY HORSE: head held UP at the hands, stick down between legs ----
      const hb = airborne ? -2 : 0;
      // back (far) running leg — behind the stick
      r(-2.6, -14, 2.6, 5, C.suitLo);
      r(-2.6 - gait * 1.4, -9.4, 2.5, 5.6, C.suitLo);
      r(-3.0 - gait * 1.4, -4, 3, 1.8, C.boot);
      // the stick angles from the held head down & back BETWEEN the legs to the ground
      line(4.4, -13 + hb, -1.8, -0.4, 1.3, C.horseStick);
      // front (near) running leg — drawn over the stick
      r(0.8, -14, 2.6, 5, C.suit);
      r(0.8 + gait * 1.6, -9.4, 2.5, 5.6, C.suitHi);
      r(0.6 + gait * 1.6, -4, 3, 1.8, C.boot);
      // horse head held UP near the hands, facing forward — clearly visible
      r(3.4, -16.6 + hb, 2.3, 4, C.horse); // neck
      r(3.0, -18.6 + hb, 1.7, 5, C.horseMane); // mane down the neck
      disc(6.2, -17 + hb, 2.4, C.horse); // head
      r(6.4, -18.2 + hb, 3.6, 2.7, C.horse); // muzzle forward
      r(9.4, -17.4 + hb, 1.2, 1.6, C.horseDark); // nose tip
      r(5.2, -20 + hb, 1.3, 2.1, C.horseDark); // ear
      r(6.9, -19.8 + hb, 1.1, 1.9, C.horse); // 2nd ear
      r(7.8, -16.8 + hb, 0.9, 0.9, "#1C140C"); // eye
      r(4.6, -14.2 + hb, 3.6, 1, C.horseDark); // bridle / reins
    } else {
      // ---- MOUNTAIN GOAT (rider sits on top; goat legs reach the ground) ----
      const gl = airborne ? Math.sin(time / 70) * 1.4 : gait * 1.2; // leg swing
      // far legs (slightly darker)
      r(-5.4, -7.2, 1.9, 7.4 - 0.0, C.goatDark); // rear-far
      r(5.0, -7.2, 1.9, 7.4, C.goatDark); // front-far
      // body
      r(-6.4, -13, 12.6, 6.4, C.goatBody); // barrel
      r(-6.4, -13, 12.6, 1.4, "#FFFFFF"); // back highlight
      r(-6.4, -7.8, 12.6, 1.2, C.goatDark); // belly shadow
      r(-7.4, -12, 1.6, 4.2, C.goatBody); // rump
      r(-8.0, -11, 1.2, 2.4, C.goatBeard); // tail
      // near legs (jump tuck)
      r(-4.6, -7 + gl, 2.1, 7 - gl, C.goatBody); // rear-near
      r(-4.8, -1 + gl, 2.5, 1.3, C.goatHoof); // hoof
      r(4.0, -7 - gl, 2.1, 7 + gl, C.goatBody); // front-near
      r(3.8, -1 - gl, 2.5, 1.3, C.goatHoof); // hoof
      // head + horns + beard (front)
      disc(7.4, -12.4, 2.3, C.goatBody); // head
      r(8.6, -12.6, 2.6, 2, C.goatBody); // muzzle
      r(10.8, -11.6, 1, 1.2, C.goatDark); // nose
      r(6.6, -16, 1, 3.4, C.goatHorn); // horn back-curve
      r(7.2, -16.6, 2.2, 1, C.goatHorn);
      r(8.8, -16, 1, 1.8, C.goatHorn);
      r(7.6, -10.6, 1.4, 2.6, C.goatBeard); // chin beard
      r(8.0, -11.4, 0.9, 0.9, "#1C140C"); // eye
      // ---- RIDER LEGS straddling the goat ----
      r(-2.6, -15.4, 2.7, 4.2, C.suit); // near thigh
      r(-2.6, -12.4, 2.5, 4.2, C.suit); // near shin down the side
      r(-2.8, -8.6, 2.9, 1.6, C.boot); // boot
      r(1.4, -15.4, 2.6, 4, C.suitLo); // far thigh (shadow)
    }

    // ================= SHARED TORSO =================
    r(-3.9, -20.8, 7.8, 7.6, C.suit);
    r(-3.9, -20.8, 1.6, 7.6, C.suitHi);
    r(2.3, -20.8, 1.6, 7.6, C.suitLo);
    r(-0.4, -20.2, 0.8, 6.8, C.suitLo);
    r(-3.9, -14.2, 7.8, 1, C.suitLo);
    r(-3.5, -19.9, 1.9, 1.9, C.jacket); // brand-olive chest patch
    r(-2.4, -21.4, 4.8, 1.3, C.suitHi); // collar

    // ================= ARMS (phase-specific grip) =================
    // back (left) arm
    r(-5.3, -20.3, 2.3, 2.5, C.suit);
    r(-5.9, -18, 2.1, 4.1, C.suit);
    if (phase === "ski") {
      r(-6.3, -14.3, 2.1, 3.5, C.suit);
      r(-6.5, -11.5, 2.5, 2.3, C.glove);
      line(-5.6, -10.8, -9.6, 2.0, 0.7, C.pole);
      r(-9.9, 1.6, 1.9, 0.7, C.pole);
    } else if (phase === "hobby") {
      // forearm angles inward to grip the stick at the body centreline
      r(-4.4, -16, 2.6, 2, C.suit);
      r(-1.6, -15.2, 2.3, 2.2, C.glove);
    } else {
      // forearm forward to grip reins / horns
      r(-5.6, -16.4, 2.6, 2, C.suit);
      r(-3.2, -16.6, 2.4, 2.2, C.glove);
    }
    // front (right) arm
    r(3, -20.3, 2.3, 2.5, C.suit);
    r(3.9, -18.2, 2.2, 3.6, C.suit);
    if (phase === "hobby") {
      // front forearm also comes in to grip the stick top
      r(1.4, -15.8, 2.8, 2, C.suit);
      r(0.1, -14.9, 2.3, 2.2, C.glove);
    } else {
      r(4.7, -15.1, 3.1, 2, C.suit);
      r(7.2, -15.3, 2.5, 2.3, C.glove);
      if (phase === "ski") {
        line(8.2, -14.2, 11.2, 1.6, 0.7, C.pole);
        r(10.9, 1.2, 1.9, 0.7, C.pole);
      } else if (phase === "goat") {
        line(8.4, -14.6, 7.4, -16.2, 0.6, C.horseMane); // rein to the goat's head
      }
    }

    // ================= SHARED HEAD =================
    disc(0, -23.1, 3.1, C.skin);
    r(2.6, -22.2, 1.3, 1.3, C.skin);
    r(-2.5, -22.6, 1, 1.7, C.skinSh);
    r(-0.6, -20.6, 1.8, 0.7, C.skinSh);
    // goggles (blue mirrored)
    r(-3, -23.9, 6.1, 1.9, C.goggleRim);
    r(-2.6, -23.5, 5.3, 1.2, C.goggleBlue);
    r(-2.6, -23.5, 5.3, 0.5, C.goggleBlueHi);
    r(0.7, -23.3, 0.8, 0.8, "#FFFFFF");
    // helmet (white)
    disc(0, -27.4, 3.7, C.helmet);
    r(-3.7, -24.5, 7.4, 0.9, C.helmetRim);
    r(-2.7, -29.4, 2.5, 1.3, "#FFFFFF");
    r(0.2, -29, 0.8, 2.2, C.helmetSh);
    r(3, -23.7, 0.9, 3, C.helmetRim);
    r(-3.6, -23.7, 0.9, 2.5, C.helmetRim);

    // goggle glint sweep
    if (glintActive > 0) {
      const gp = 1 - glintActive;
      const gx = -2.6 + gp * 5.3;
      ctx.fillStyle = C.goggleBlueHi;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(
        Math.round(gx * su),
        Math.round(-23.5 * su + bob),
        Math.round(0.9 * su),
        Math.round(1.2 * su)
      );
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ---- Snow spray ------------------------------------------------------
  function emitSpray() {
    const sx = skierScreenX();
    const sy = screenGroundY(sx);
    for (let i = 0; i < 2; i++) {
      spray.push({
        x: sx - PX * 8 + Math.random() * PX * 3,
        y: sy - PX * 1 - Math.random() * PX * 2,
        vx: -(0.6 + Math.random() * 1.4),
        vy: -(0.4 + Math.random() * 1.6),
        life: 1,
      });
    }
  }
  function updateSpray(dt) {
    for (let i = spray.length - 1; i >= 0; i--) {
      const p = spray[i];
      p.x += p.vx * dt * 0.06;
      p.y += p.vy * dt * 0.06;
      p.vy += dt * 0.012;
      p.life -= dt * 0.0022;
      if (p.life <= 0) spray.splice(i, 1);
    }
  }
  function drawSpray() {
    for (const p of spray) {
      ctx.globalAlpha = clamp(p.life, 0, 1) * 0.9;
      R(p.x, p.y, PX, PX, C.spray);
    }
    ctx.globalAlpha = 1;
  }

  // ---- Main loop -------------------------------------------------------
  function frame(now) {
    const dt = Math.min(50, now - lastT);
    lastT = now;
    const time = now - t0;

    // smooth eased glide between stops
    if (tweening) {
      tweenT += dt;
      const p = clamp(tweenT / tweenDur, 0, 1);
      scrollX = tweenFrom + (tweenTo - tweenFrom) * easeInOut(p);
      if (p >= 1) {
        tweening = false;
        scrollX = tweenTo;
        // fire arrive callbacks once the glide finishes
        while (onArriveCbs.length) {
          try {
            onArriveCbs.shift()();
          } catch {}
        }
      }
    } else {
      scrollX = scrollTarget;
    }
    moving = tweening && Math.abs(tweenTo - tweenFrom) > 1;

    // vertical camera pan (eases toward target — summit reveal)
    cameraY += (cameraTarget - cameraY) * (1 - Math.pow(0.04, dt / 1000));

    // glint timer
    glintT += dt;
    if (glintActive > 0) {
      glintActive -= dt / 420;
      if (glintActive < 0) glintActive = 0;
    } else if (glintT > 2600 + Math.random() * 1500) {
      glintActive = 1;
      glintT = 0;
    }

    // summit landing squash
    if (summitMode) {
      summitT += dt;
      const tt = clamp(summitT / 600, 0, 1);
      hop = Math.sin(tt * Math.PI) * PX * 3; // small landing bounce
      if (summitT > 380) flagPlanted = true;
    }

    // ---- jump-over-obstacle detection (sound cues each leap) ----
    const headWX = scrollX + skierScreenX();
    const lift = airLift(headWX);
    if (lift > 2 && prevLift <= 2) {
      launched = true;
      if (window.SkiSound) window.SkiSound.jump();
      if (headWX > stopX(8)) cameraTarget = H * 0.46; // final catapult → pan down, open sky above
    }
    if (lift <= 2 && prevLift > 2 && launched) {
      if (window.SkiSound) window.SkiSound.land();
    }
    prevLift = lift;

    if (moving && lift < 2 && phaseAt(headWX) === "ski") emitSpray(); // spray only on skis, on the ground
    updateSpray(dt);

    // ---- render ----
    ctx.clearRect(0, 0, W, H);
    R(0, 0, W, H, C.sky); // sky fills the whole viewport (no pan)

    ctx.save();
    ctx.translate(0, cameraY); // everything else pans with the camera
    drawSun(time);
    drawClouds(time);
    // distant ranges (fade away as we approach the summit so no second
    // mountain shows behind the finish)
    const rAlpha = clamp(1 - (headWX - stopX(7)) / (SEG * 1.6), 0, 1);
    if (rAlpha > 0.01) {
      drawRange(0.18, 0.44, 95, 240, C.rangeFar, rAlpha);
      drawRange(0.34, 0.5, 120, 180, C.rangeFar2, rAlpha);
      drawRange(0.55, 0.56, 95, 120, C.rangeMid, rAlpha);
    }
    // foreground
    drawSlope();
    drawObstacles();
    const lean = groundAngle(skierScreenX());
    drawSpray();
    drawRider(time, lean, moving);
    // finish flag once near/at the end
    if (curStop >= NSTOP - 1) {
      const fScreenX = stopX(NSTOP - 1) - scrollX;
      const sy = screenGroundY(fScreenX) - PX;
      const fsx = fScreenX + PX * 5;
      drawSummitFlag(fsx, sy, flagPlanted ? 1 : clamp(summitT / 700, 0, 1));
    }
    ctx.restore();

    raf = requestAnimationFrame(frame);
  }

  // ---- Public API ------------------------------------------------------
  const API = {
    init(cv) {
      canvas = cv;
      ctx = canvas.getContext("2d");
      buildObstacles();
      buildClouds();
      resize();
      window.addEventListener("resize", resize);
      curStop = 0;
      scrollX = scrollTarget = tweenFrom = tweenTo = stopX(0) - skierScreenX();
      tweening = false;
      if (!raf) {
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    skiToStop(k, cb) {
      curStop = clamp(k, 0, NSTOP - 1);
      const to = stopX(curStop) - skierScreenX();
      scrollTarget = to;
      tweenFrom = scrollX;
      tweenTo = to;
      tweenT = 0;
      // duration scales gently with distance so single steps glide ~1.5s
      tweenDur = clamp(900 + Math.abs(to - scrollX) * 1.1, 900, 2200);
      tweening = Math.abs(to - scrollX) > 1;
      if (cb) {
        if (tweening) onArriveCbs.push(cb);
        else cb();
      }
    },
    summit(cb) {
      this.skiToStop(NSTOP - 1, () => {
        summitMode = true;
        summitT = 0;
        cameraTarget = H * 0.46; // drop the peak low; lots of sky above for the banner
        if (cb) setTimeout(cb, 700);
      });
    },
    reset() {
      summitMode = false;
      summitT = 0;
      flagPlanted = false;
      hop = 0;
      launched = false;
      prevLift = 0;
      cameraTarget = 0;
      cameraY = 0;
      spray.length = 0;
      this.skiToStop(0);
    },
    // manual frame advance — used for offline/headless verification only
    step(now) {
      frame(typeof now === "number" ? now : performance.now());
    },
    skierPos() {
      return skierScreen;
    },
    stops: NSTOP,
  };

  window.SkiGame = API;
})();

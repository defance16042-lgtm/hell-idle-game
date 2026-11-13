(() => {
  'use strict';

  if (window.__parallelThreeGeneralsCanvasAttacksV3) return;
  window.__parallelThreeGeneralsCanvasAttacksV3 = true;

  const profiles = [
    {
      names: ['李儒'], kind: 'poison', duration: 1020, color: '#b747ff', bright: '#e5ffc2', deep: '#532590',
      pivot: '28% 70%', curve: -0.035, anchor: [0.24, 0.43], rays: 10,
      pose: [[0,0,0,0,1],[.18,5,-5,-4,1.02],[.42,-13,1,5,1.04],[.68,-5,0,1,1.02],[1,0,0,0,1]]
    },
    {
      names: ['樊稠將軍','樊稠'], kind: 'cleave', duration: 900, color: '#ff7830', bright: '#fff0a4', deep: '#8f281d',
      pivot: '28% 70%', curve: 0.015, anchor: [0.22, 0.47], rays: 8,
      pose: [[0,0,0,0,1],[.18,8,-2,5,1.01],[.42,-20,0,-10,1.04],[.64,-7,1,4,1.01],[1,0,0,0,1]]
    },
    {
      names: ['張濟將軍','張濟'], kind: 'spear', duration: 880, color: '#42dcf2', bright: '#e4ffff', deep: '#1677ad',
      pivot: '27% 68%', curve: -0.008, anchor: [0.21, 0.44], rays: 8,
      pose: [[0,0,0,0,1],[.20,7,-2,4,1.01],[.43,-25,0,-5,1.035],[.62,10,0,3,1.01],[1,0,0,0,1]]
    },
    {
      names: ['呂布'], kind: 'fangtian', duration: 1080, color: '#d72e83', bright: '#f5d3ff', deep: '#5423bb',
      pivot: '30% 72%', curve: 0.045, anchor: [0.24, 0.43], rays: 12,
      pose: [[0,0,0,0,1],[.20,12,-7,6,1.03],[.43,-33,-4,-12,1.08],[.64,12,1,8,1.035],[.80,-5,0,-3,1.01],[1,0,0,0,1]]
    }
  ];
  const profileByName = new Map();
  for (const profile of profiles) for (const name of profile.names) profileByName.set(name, profile);

  let canvas = null;
  let context = null;
  let rafId = 0;
  let runId = 0;
  let activeSpriteState = null;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  function ensureCanvas(stage) {
    if (!canvas || canvas.parentElement !== stage) {
      canvas?.remove();
      canvas = document.createElement('canvas');
      canvas.id = 'parallel-generals-canvas-attack-layer';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:90;overflow:visible';
      if (getComputedStyle(stage).position === 'static') stage.style.position = 'relative';
      stage.appendChild(canvas);
      context = canvas.getContext('2d');
    }
    return context;
  }

  function saveSpriteStyle(sprite) {
    const properties = ['transform', 'transform-origin', 'filter', 'transition'];
    return properties.map(property => ({
      property,
      value: sprite.style.getPropertyValue(property),
      priority: sprite.style.getPropertyPriority(property)
    }));
  }

  function restoreSprite() {
    if (!activeSpriteState) return;
    const { sprite, styles } = activeSpriteState;
    for (const entry of styles) {
      if (entry.value) sprite.style.setProperty(entry.property, entry.value, entry.priority);
      else sprite.style.removeProperty(entry.property);
    }
    activeSpriteState = null;
  }

  function stopCurrentRun() {
    runId++;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    restoreSprite();
    if (canvas && context) {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function samplePose(frames, progress) {
    for (let i = 1; i < frames.length; i++) {
      if (progress <= frames[i][0]) {
        const a = frames[i - 1], b = frames[i];
        const t = smooth((progress - a[0]) / Math.max(.001, b[0] - a[0]));
        return a.slice(1).map((value, index) => lerp(value, b[index + 1], t));
      }
    }
    return frames[frames.length - 1].slice(1);
  }

  function moveSprite(sprite, profile, progress) {
    const [x, y, rotation, scale, brightness] = samplePose(profile.pose, progress);
    sprite.style.setProperty('transform-origin', profile.pivot, 'important');
    sprite.style.setProperty('transition', 'none', 'important');
    sprite.style.setProperty('transform', `translate3d(${x}px,${y}px,0) rotate(${rotation}deg) scale(${scale})`, 'important');
    sprite.style.setProperty('filter', `brightness(${brightness}) drop-shadow(0 0 ${Math.round(6 + Math.abs(rotation))}px ${profile.color})`, 'important');
  }

  function drawCharge(ctx, point, angle, progress, profile, now, width, height) {
    const strength = clamp(progress / .24);
    const radius = Math.max(10, Math.min(width, height) * (.018 + strength * .052));
    const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 1.9);
    glow.addColorStop(0, `${profile.bright}e8`);
    glow.addColorStop(.28, `${profile.color}b8`);
    glow.addColorStop(1, `${profile.deep}00`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(angle);
    ctx.globalAlpha = .35 + strength * .55;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.strokeStyle = i === 0 ? profile.bright : profile.color;
      ctx.lineWidth = i === 0 ? 2.4 : 1.4;
      ctx.ellipse(0, 0, radius * (.56 + i * .20), radius * (.28 + i * .10), now * .0012 + i * .7, -.95, .95);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTravelMark(ctx, point, angle, progress, profile, now, width, height) {
    const length = Math.max(48, Math.min(106, width * (profile.kind === 'fangtian' ? .115 : .092)));
    const thickness = Math.max(18, Math.min(54, height * (profile.kind === 'fangtian' ? .105 : .072)));
    const fade = progress > .86 ? clamp((1 - progress) / .14) : 1;
    const pulse = .92 + Math.sin(now * .025) * .08;

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(angle);
    ctx.globalAlpha = fade;
    ctx.shadowColor = profile.color;
    ctx.shadowBlur = profile.kind === 'fangtian' ? 22 : 15;

    if (profile.kind === 'poison') {
      const orb = ctx.createRadialGradient(-length * .08, 0, 1, 0, 0, thickness * .88);
      orb.addColorStop(0, profile.bright);
      orb.addColorStop(.25, profile.color);
      orb.addColorStop(.62, `${profile.deep}c9`);
      orb.addColorStop(1, `${profile.deep}00`);
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.ellipse(0, 0, length * .55, thickness * .66 * pulse, -.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = profile.bright;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, length * .50, thickness * .32, Math.sin(now * .018) * .18, -.8, 2.35);
      ctx.stroke();
      ctx.strokeStyle = '#a6ff76';
      ctx.globalAlpha *= .72;
      ctx.beginPath();
      ctx.ellipse(-length * .12, 0, length * .66, thickness * .48, -.18, 2.4, 5.7);
      ctx.stroke();
    } else if (profile.kind === 'cleave') {
      const blade = ctx.createLinearGradient(-length, 0, length, 0);
      blade.addColorStop(0, `${profile.deep}00`);
      blade.addColorStop(.42, `${profile.color}8a`);
      blade.addColorStop(.78, profile.bright);
      blade.addColorStop(1, `${profile.bright}20`);
      ctx.fillStyle = blade;
      ctx.beginPath();
      ctx.moveTo(-length * .94, -thickness * .12);
      ctx.quadraticCurveTo(-length * .18, -thickness * 1.55, length * .83, -thickness * .30);
      ctx.quadraticCurveTo(length * 1.06, 0, length * .83, thickness * .30);
      ctx.quadraticCurveTo(-length * .18, thickness * .72, -length * .94, thickness * .12);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = profile.bright;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-length * .72, -thickness * .10);
      ctx.quadraticCurveTo(-length * .04, -thickness * .84, length * .88, -thickness * .25);
      ctx.stroke();
    } else if (profile.kind === 'spear') {
      ctx.fillStyle = `${profile.deep}b8`;
      ctx.fillRect(-length, -thickness * .13, length * 1.40, thickness * .26);
      ctx.fillStyle = profile.bright;
      ctx.beginPath();
      ctx.moveTo(length * .35, -thickness * .55);
      ctx.lineTo(length, 0);
      ctx.lineTo(length * .35, thickness * .55);
      ctx.lineTo(length * .48, 0);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = profile.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-length * 1.45, -thickness * .42);
      ctx.lineTo(length * .30, -thickness * .22);
      ctx.moveTo(-length * 1.35, thickness * .40);
      ctx.lineTo(length * .25, thickness * .18);
      ctx.stroke();
    } else {
      const blade = ctx.createLinearGradient(-length, 0, length, 0);
      blade.addColorStop(0, `${profile.deep}00`);
      blade.addColorStop(.35, `${profile.deep}b8`);
      blade.addColorStop(.68, `${profile.color}f0`);
      blade.addColorStop(.86, profile.bright);
      blade.addColorStop(1, `${profile.bright}12`);
      ctx.fillStyle = blade;
      ctx.beginPath();
      ctx.moveTo(-length, -thickness * .12);
      ctx.quadraticCurveTo(-length * .05, -thickness * 1.65, length * .88, -thickness * .24);
      ctx.quadraticCurveTo(length * 1.12, 0, length * .84, thickness * .24);
      ctx.quadraticCurveTo(-length * .05, thickness * .82, -length, thickness * .12);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha *= .82;
      ctx.strokeStyle = profile.bright;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-length * .80, -thickness * .12);
      ctx.quadraticCurveTo(-length * .02, -thickness * .94, length * .94, -thickness * .21);
      ctx.stroke();
      ctx.strokeStyle = '#ff547e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-length * .78, thickness * .08);
      ctx.quadraticCurveTo(-length * .08, thickness * .56, length * .70, thickness * .16);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = fade * .76;
    for (let i = 0; i < 5; i++) {
      const trail = (i + 1) / 6;
      const px = -length * (.8 + trail * 1.7);
      const py = Math.sin(now * .018 + i * 1.9) * thickness * .24;
      ctx.fillStyle = i % 2 ? profile.color : profile.bright;
      ctx.beginPath();
      ctx.arc(px, py, 1.4 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawImpact(ctx, point, angle, progress, profile, width, height) {
    const impact = clamp((progress - .76) / .24);
    if (!impact) return;
    const alpha = 1 - impact;
    const radius = Math.max(18, Math.min(width, height) * (.035 + impact * .10));
    const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 1.7);
    glow.addColorStop(0, `${profile.bright}${Math.round(alpha * 235).toString(16).padStart(2,'0')}`);
    glow.addColorStop(.3, `${profile.color}${Math.round(alpha * 170).toString(16).padStart(2,'0')}`);
    glow.addColorStop(1, `${profile.deep}00`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = profile.bright;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.05, radius * .48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = profile.color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.32, radius * .70, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < profile.rays; i++) {
      const a = (Math.PI * 2 * i / profile.rays) + angle;
      const inner = radius * .48;
      const outer = radius * (1.35 + (i % 3) * .20);
      ctx.strokeStyle = i % 3 === 0 ? profile.bright : profile.color;
      ctx.lineWidth = i % 3 === 0 ? 2.8 : 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }

  function playAttack(profile) {
    const stage = document.getElementById('battle-stage');
    const sprite = document.querySelector('#monster-icon .monster-sprite');
    const player = document.getElementById('player-icon');
    if (!stage || !sprite || !player || !sprite.isConnected) return false;

    stopCurrentRun();
    const ctx = ensureCanvas(stage);
    if (!ctx) return false;

    const stageRect = stage.getBoundingClientRect();
    const monsterRect = sprite.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const width = stageRect.width;
    const height = stageRect.height;
    if (width < 10 || height < 10 || !monsterRect.width || !playerRect.width) return false;

    const from = {
      x: monsterRect.left - stageRect.left + monsterRect.width * profile.anchor[0],
      y: monsterRect.top - stageRect.top + monsterRect.height * profile.anchor[1]
    };
    const to = {
      x: playerRect.left - stageRect.left + playerRect.width * .52,
      y: playerRect.top - stageRect.top + playerRect.height * .50
    };
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const reducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    const duration = reducedMotion ? Math.max(680, profile.duration * .70) : profile.duration;
    const styles = saveSpriteStyle(sprite);
    const thisRun = ++runId;
    const start = performance.now();
    activeSpriteState = { sprite, styles };

    function finish() {
      if (thisRun !== runId) return;
      restoreSprite();
      rafId = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function draw(now) {
      if (thisRun !== runId) return;
      if (!canvas?.isConnected || !sprite.isConnected) { finish(); return; }
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const pixelWidth = Math.max(1, Math.round(rect.width * dpr));
      const pixelHeight = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const progress = clamp((now - start) / duration);
      moveSprite(sprite, profile, progress);
      if (progress < .25) drawCharge(ctx, from, angle, progress, profile, now, rect.width, rect.height);

      if (progress >= .16 && progress < .90) {
        const q = clamp((progress - .16) / .70);
        const travel = 1 - Math.pow(1 - q, 2.15);
        const curve = Math.sin(Math.PI * travel) * profile.curve * distance;
        const point = {
          x: from.x + dx * travel - (dy / distance) * curve,
          y: from.y + dy * travel + (dx / distance) * curve
        };
        drawTravelMark(ctx, point, angle, travel, profile, now, rect.width, rect.height);
      }
      if (progress >= .76) drawImpact(ctx, to, angle, progress, profile, rect.width, rect.height);

      if (progress < 1) rafId = requestAnimationFrame(draw);
      else finish();
    }

    rafId = requestAnimationFrame(draw);
    return true;
  }

  const previous = window.playParallelThreeKingdomsBossAttackStoryboard;
  window.playParallelThreeKingdomsBossAttackStoryboard = (name, skillName) => {
    const profile = profileByName.get(String(name || '').trim());
    if (profile) return playAttack(profile);
    return previous?.(name, skillName) || false;
  };
})();

/* Data Darśana — architecture diagram renderer.
 *
 * One generic SVG renderer over a small JSON DSL, so ~130 archetypes can each
 * carry a picture without hand-drawing 130 one-off SVGs.
 *
 * Authors never supply coordinates — only structure. Every layout kind computes
 * its own geometry from the node/lane counts. Fills use the app's CSS custom
 * properties, so light/dark themes come free.
 *
 * A node carrying {cap:"DAAI-104"} or {arch:"ARCH-02-01"} emits data-cap /
 * data-arch, which the app's existing wireLinks() already turns into navigation.
 *
 * Spec shape:
 *   { kind, title?, caption?, nodes:[...], edges:[...], lanes?:[...], ... }
 * Node: { id, label, sub?, cap?, arch?, tone? }
 *   tone: 'accent' | 'warn' | 'muted' | undefined
 * Edge: { from, to, label?, style? }   style: 'dashed' | 'thick' | undefined
 */
(function (root) {
  'use strict';

  /* The drawer is ~440-520px wide, so the viewBox is sized close to its render
   * width — a 720-wide canvas scaled down to 460 renders 11px text at ~7px. */
  var W = 560;                 // fixed viewBox width; height is computed
  var PAD = 12;
  var FS = 12;                 // node label font-size
  var FS_SUB = 9;
  var CHAR = 6.05;             // approx advance width of Manrope at 12px

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* greedy word wrap to a pixel width */
  function wrap(text, boxW, fs) {
    var max = Math.max(4, Math.floor((boxW - 12) / (CHAR * (fs / FS))));
    var words = String(text || '').split(/\s+/), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!cur) { cur = w; }
      else if ((cur + ' ' + w).length <= max) { cur += ' ' + w; }
      else { lines.push(cur); cur = w; }
      // a single word longer than the box: hyphenate rather than sever it
      while (cur.length > max) { lines.push(cur.slice(0, max - 1) + '-'); cur = cur.slice(max - 1); }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }

  function toneFill(tone) {
    if (tone === 'accent') return 'var(--accent-soft)';
    if (tone === 'warn') return 'color-mix(in srgb, var(--saffron) 14%, transparent)';
    if (tone === 'muted') return 'transparent';
    return 'var(--surface-2)';
  }
  function toneStroke(tone) {
    if (tone === 'accent') return 'var(--accent)';
    if (tone === 'warn') return 'var(--saffron)';
    return 'var(--line2)';
  }

  /* a labelled rounded box, vertically centred text, optional sub-line */
  function box(n, x, y, w, h) {
    var link = n.cap ? ' data-cap="' + esc(n.cap) + '"' : (n.arch ? ' data-arch="' + esc(n.arch) + '"' : '');
    var cls = 'dnode' + (n.cap || n.arch ? ' dlink' : '');
    var lines = wrap(n.label, w, FS);
    var subLines = n.sub ? wrap(n.sub, w, FS_SUB) : [];
    var totalH = lines.length * (FS + 2) + (subLines.length ? subLines.length * (FS_SUB + 1) + 3 : 0);
    var ty = y + h / 2 - totalH / 2 + FS;
    var s = '<g class="' + cls + '"' + link + '>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" ' +
      'fill="' + toneFill(n.tone) + '" stroke="' + toneStroke(n.tone) + '" stroke-width="1"/>';
    lines.forEach(function (ln, i) {
      s += '<text x="' + (x + w / 2) + '" y="' + (ty + i * (FS + 2)) + '" text-anchor="middle" ' +
        'font-size="' + FS + '" font-weight="600" fill="var(--text)">' + esc(ln) + '</text>';
    });
    subLines.forEach(function (ln, i) {
      s += '<text x="' + (x + w / 2) + '" y="' + (ty + lines.length * (FS + 2) + 1 + i * (FS_SUB + 1)) +
        '" text-anchor="middle" font-size="' + FS_SUB + '" fill="var(--muted)">' + esc(ln) + '</text>';
    });
    return s + '</g>';
  }

  function edgeAttrs(e) {
    var a = 'stroke="var(--muted)" fill="none" marker-end="url(#dgArrow)"';
    if (e && e.style === 'dashed') a += ' stroke-dasharray="4 3" stroke-width="1.1"';
    else if (e && e.style === 'thick') a += ' stroke-width="2.2"';
    else a += ' stroke-width="1.3"';
    return a;
  }

  function edgeLabel(txt, x, y) {
    if (!txt) return '';
    var w = String(txt).length * 4.6 + 8;
    return '<rect x="' + (x - w / 2) + '" y="' + (y - 12) + '" width="' + w + '" height="13" rx="3" ' +
      'fill="var(--surface)" stroke="none" opacity="0.92"/>' +
      '<text x="' + x + '" y="' + (y - 2) + '" text-anchor="middle" font-size="8.5" fill="var(--muted)">' +
      esc(txt) + '</text>';
  }

  function sectionLabel(txt, x, y, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'start') + '" font-size="9" ' +
      'letter-spacing="0.14em" fill="var(--faint2)">' + esc(String(txt).toUpperCase()) + '</text>';
  }

  /* ---------------- layout kinds ---------------- */
  var K = {};

  /* flow — left-to-right chain, optionally stacked into lanes (rows) */
  K.flow = function (spec) {
    var lanes = spec.lanes && spec.lanes.length ? spec.lanes : [null];
    var rows = lanes.map(function (ln) {
      return spec.nodes.filter(function (n) { return (n.lane || null) === (ln ? ln.id : null); });
    });
    var laneLabelW = spec.lanes && spec.lanes.length ? 74 : 0;
    var maxCols = Math.max.apply(null, rows.map(function (r) { return r.length; }).concat([1]));
    var gap = 18, h = 48;
    var avail = W - PAD * 2 - laneLabelW - gap * (maxCols - 1);
    var bw = Math.max(62, Math.floor(avail / maxCols));
    var y = PAD + (spec.title ? 18 : 0), svg = '', pos = {};
    rows.forEach(function (r, ri) {
      // grow the row to the tallest node in it rather than clipping against a fixed height
      var maxLab = 1, maxSub = 0;
      r.forEach(function (n) {
        maxLab = Math.max(maxLab, wrap(n.label, bw, FS).length);
        if (n.sub) maxSub = Math.max(maxSub, wrap(n.sub, bw, FS_SUB).length);
      });
      var rowH = Math.max(h, maxLab * (FS + 2) + (maxSub ? maxSub * (FS_SUB + 1) + 3 : 0) + 22);
      if (lanes[ri]) {
        svg += '<rect x="' + PAD + '" y="' + y + '" width="' + (W - PAD * 2) + '" height="' + rowH +
          '" rx="9" fill="var(--sunk)" opacity="0.55" stroke="none"/>';
        var lnLines = wrap(lanes[ri].label, laneLabelW + 4, 9.5);
        lnLines.forEach(function (ln, li) {
          svg += '<text x="' + (PAD + 10) + '" y="' +
            (y + rowH / 2 + 3 - (lnLines.length - 1) * 5.5 + li * 11) +
            '" font-size="9.5" font-weight="600" fill="var(--muted)">' + esc(ln) + '</text>';
        });
      }
      // centre a short row (measured: fewer backwards hand-offs than left or right)
      var offset = Math.round((maxCols - r.length) * (bw + gap) / 2);
      r.forEach(function (n, ci) {
        var x = PAD + laneLabelW + offset + ci * (bw + gap);
        pos[n.id] = { x: x, y: y, w: bw, h: rowH, cx: x + bw / 2, cy: y + rowH / 2, col: ci };
        svg += box(n, x, y, bw, rowH);
      });
      y += rowH + 22;
    });
    // edges; labels are collected separately and painted last
    var ed = '', lab = '', deep = 0;
    (spec.edges || []).forEach(function (e) {
      var a = pos[e.from], b = pos[e.to];
      if (!a || !b) return;
      if (Math.abs(a.cy - b.cy) < 2) {                       // same row
        var adjacent = Math.abs(a.col - b.col) === 1;
        if (adjacent) {
          var x1 = a.x + a.w, x2 = b.x;
          if (x2 < x1) { x1 = a.x; x2 = b.x + b.w; }
          ed += '<path d="M' + x1 + ' ' + a.cy + ' H' + (x2 - 6) + '" ' + edgeAttrs(e) + '/>';
          lab += edgeLabel(e.label, (x1 + x2) / 2, a.cy - 3);   // on the line; labels paint last
        } else {
          /* non-adjacent same-row: a straight line would pass UNDER the boxes in
           * between and read as a chain the author never drew — route it below */
          var dip = a.y + a.h + 11;
          ed += '<path d="M' + a.cx + ' ' + (a.y + a.h) + ' V' + dip + ' H' + b.cx + ' V' + (b.y + b.h + 6) +
            '" ' + edgeAttrs(e) + '/>';
          lab += edgeLabel(e.label, (a.cx + b.cx) / 2, dip + 12);
          deep = Math.max(deep, dip + 16);   // grow the canvas to cover a label routed below
        }
      } else if (a.x - b.x > (W - PAD * 2) * 0.45 && b.cy > a.cy) {   // wrapped continuation
        /* the next step sits most of a canvas to the LEFT on the row below: drawn
         * straight it reads as flowing backwards, so route it around the margin like
         * the carriage return it actually is. A shorter step back is just a diagonal
         * and is left to the normal cross-row routing. */
        var midW = (a.y + a.h + b.y) / 2;
        ed += '<path d="M' + (a.x + a.w) + ' ' + a.cy + ' H' + (W - 5) + ' V' + midW +
          ' H5 V' + b.cy + ' H' + (b.x - 6) + '" ' + edgeAttrs(e) + '/>';
        lab += edgeLabel(e.label, W / 2, midW - 1);
      } else {                                               // across rows
        var mid = (a.cy + b.cy) / 2;
        var up = b.cy < a.cy;                                 // leave by the near face
        var startY = up ? a.y : a.y + a.h;
        var endY = up ? b.y + b.h + 6 : b.y - 6;
        ed += '<path d="M' + a.cx + ' ' + startY + ' V' + mid + ' H' + b.cx + ' V' + endY + '" ' +
          edgeAttrs(e) + '/>';
        lab += edgeLabel(e.label, (a.cx + b.cx) / 2, mid - 1);
      }
    });
    // order: connectors, then boxes, then labels on top of both
    return { body: ed + svg + lab, height: Math.max(y - 22, deep) + PAD };
  };

  /* stack — horizontal bands, top to bottom (layer cakes) */
  K.stack = function (spec) {
    var y = PAD + (spec.title ? 18 : 0), svg = '', h = 42;
    spec.nodes.forEach(function (n) {
      svg += box(n, PAD, y, W - PAD * 2, h);
      y += h + 9;
    });
    return { body: svg, height: y - 9 + PAD };
  };

  /* distance from a box centre to its edge along `ang` — so connectors stop at
   * the border instead of being drawn underneath the box */
  function rectEdge(ang, hw, hh) {
    var c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang));
    return Math.min(c < 1e-6 ? Infinity : hw / c, s < 1e-6 ? Infinity : hh / s);
  }

  /* hub — one centre, spokes evenly around it */
  K.hub = function (spec) {
    var centre = spec.nodes.find(function (n) { return n.hub; }) || spec.nodes[0];
    var spokes = spec.nodes.filter(function (n) { return n !== centre; });
    var cw = 146, ch = 54, bw = 108, bh = 44;
    // elliptical ring: boxes are far wider than they are tall, so a circular
    // ring would overlap the centre horizontally while wasting space vertically
    var Rx = cw / 2 + bw / 2 + 46, Ry = ch / 2 + bh / 2 + 38;
    Rx = Math.min(Rx, W / 2 - PAD - bw / 2);
    var cx = W / 2, cy = PAD + Ry + bh / 2 + (spec.title ? 18 : 0);
    var svg = '', ed = '';
    spokes.forEach(function (n, i) {
      var ang = (-Math.PI / 2) + (i * 2 * Math.PI / spokes.length);
      var px = cx + Math.cos(ang) * Rx, py = cy + Math.sin(ang) * Ry;
      svg += box(n, px - bw / 2, py - bh / 2, bw, bh);
      // aim along the real centre-to-centre line, stopping at each box's border
      var vx = px - cx, vy = py - cy, len = Math.sqrt(vx * vx + vy * vy) || 1;
      var a2 = Math.atan2(vy, vx);
      var d0 = rectEdge(a2, cw / 2, ch / 2) + 4;
      var d1 = len - rectEdge(a2, bw / 2, bh / 2) - 7;
      if (d1 <= d0) return;                              // no room for a connector
      ed += '<path d="M' + (cx + vx / len * d0).toFixed(1) + ' ' + (cy + vy / len * d0).toFixed(1) +
        ' L' + (cx + vx / len * d1).toFixed(1) + ' ' + (cy + vy / len * d1).toFixed(1) +
        '" ' + edgeAttrs(spec.edgeStyle ? { style: spec.edgeStyle } : null) + '/>';
    });
    svg += box(centre, cx - cw / 2, cy - ch / 2, cw, ch);
    return { body: ed + svg, height: cy + Ry + bh / 2 + PAD };
  };

  /* stream — a topic spine with producers above and consumers below */
  K.stream = function (spec) {
    var prod = spec.nodes.filter(function (n) { return n.role === 'producer'; });
    var cons = spec.nodes.filter(function (n) { return n.role === 'consumer'; });
    var spine = spec.nodes.filter(function (n) { return n.role === 'topic'; });
    var top = PAD + (spec.title ? 18 : 0), bh = 42, svg = '', ed = '';
    function row(list, y) {
      var gap = 14, bw = Math.max(62, Math.floor((W - PAD * 2 - gap * (list.length - 1)) / Math.max(1, list.length)));
      return list.map(function (n, i) {
        var x = PAD + i * (bw + gap);
        svg += box(n, x, y, bw, bh);
        return { cx: x + bw / 2, y: y, h: bh };
      });
    }
    var pPos = row(prod, top);
    var spineY = top + bh + 34;
    var sh = 34, gap2 = 12;
    var sw = Math.max(90, Math.floor((W - PAD * 2 - gap2 * (spine.length - 1)) / Math.max(1, spine.length)));
    svg += '<rect x="' + PAD + '" y="' + (spineY - 7) + '" width="' + (W - PAD * 2) + '" height="' + (sh + 14) +
      '" rx="10" fill="var(--sunk)" opacity="0.6"/>';
    spine.forEach(function (n, i) {
      svg += box(n, PAD + 6 + i * (sw + gap2), spineY, sw - 12, sh);
    });
    var cPos = row(cons, spineY + sh + 34);
    pPos.forEach(function (p) {
      ed += '<path d="M' + p.cx + ' ' + (p.y + p.h) + ' V' + (spineY - 13) + '" ' + edgeAttrs(null) + '/>';
    });
    cPos.forEach(function (c) {
      ed += '<path d="M' + c.cx + ' ' + (spineY + sh + 7) + ' V' + (c.y - 6) + '" ' + edgeAttrs(null) + '/>';
    });
    svg = ed + svg;
    return {
      body: sectionLabel('producers', W - PAD, top - 5, 'end') + svg +
        sectionLabel('consumers', W - PAD, spineY + sh + 28, 'end'),
      height: spineY + sh + 34 + bh + PAD
    };
  };

  /* split — two (or three) columns compared side by side */
  K.split = function (spec) {
    var cols = spec.columns || [];
    var gap = 18, cw = Math.floor((W - PAD * 2 - gap * (cols.length - 1)) / cols.length);
    var svg = '', maxY = 0, top = PAD + (spec.title ? 18 : 0);
    cols.forEach(function (col, ci) {
      var x = PAD + ci * (cw + gap), y = top;
      svg += '<text x="' + (x + cw / 2) + '" y="' + (y + 10) + '" text-anchor="middle" font-size="10.5" ' +
        'font-weight="700" fill="var(--text)">' + esc(col.label) + '</text>';
      y += 20;
      spec.nodes.filter(function (n) { return n.col === col.id; }).forEach(function (n) {
        var h = n.sub ? 48 : 38;
        svg += box(n, x, y, cw, h);
        y += h + 8;
      });
      maxY = Math.max(maxY, y);
    });
    return { body: svg, height: maxY + PAD };
  };

  /* star — a centre fact with dimensions around it (dimensional schemas) */
  K.star = function (spec) {
    var fact = spec.nodes.find(function (n) { return n.fact; }) || spec.nodes[0];
    var dims = spec.nodes.filter(function (n) { return n !== fact; });
    var s = K.hub({
      nodes: [Object.assign({}, fact, { hub: true, tone: fact.tone || 'accent' })].concat(dims),
      title: spec.title
    });
    return s;
  };

  /* cycle — a closed loop of steps */
  K.cycle = function (spec) {
    var n = spec.nodes.length, bw = 116, bh = 46, R = 104;
    var cx = W / 2, cy = PAD + R + bh / 2 + (spec.title ? 18 : 0);
    var svg = '', ed = '', pts = [];
    spec.nodes.forEach(function (nd, i) {
      var ang = (-Math.PI / 2) + (i * 2 * Math.PI / n);
      var x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
      pts.push({ x: x, y: y, ang: ang });
      svg += box(nd, x - bw / 2, y - bh / 2, bw, bh);
    });
    for (var i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n];
      var mA = a.ang + 0.52, mB = b.ang - 0.52;   // clear the boxes at both ends
      var x1 = cx + Math.cos(mA) * (R + 4), y1 = cy + Math.sin(mA) * (R + 4);
      var x2 = cx + Math.cos(mB) * (R + 4), y2 = cy + Math.sin(mB) * (R + 4);
      ed += '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A' + (R + 4) + ' ' + (R + 4) +
        ' 0 0 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" ' + edgeAttrs(null) + '/>';
    }
    return { body: ed + svg, height: cy + R + bh / 2 + PAD };
  };

  /* grid — a labelled matrix (bus matrix, coverage grids) */
  K.grid = function (spec) {
    var rows = spec.rows || [], cols = spec.cols || [];
    var labW = 116, cellH = 26, gap = 3;
    var cw = Math.floor((W - PAD * 2 - labW - gap * cols.length) / cols.length);
    var top = PAD + (spec.title ? 18 : 0) + 26, svg = '';
    cols.forEach(function (c, ci) {
      var x = PAD + labW + ci * (cw + gap);
      svg += '<text x="' + (x + cw / 2) + '" y="' + (top - 8) + '" text-anchor="middle" font-size="8.5" ' +
        'fill="var(--muted)">' + esc(c.label) + '</text>';
    });
    rows.forEach(function (r, ri) {
      var y = top + ri * (cellH + gap);
      svg += '<text x="' + PAD + '" y="' + (y + cellH / 2 + 3.5) + '" font-size="10" fill="var(--text)">' +
        esc(r.label) + '</text>';
      cols.forEach(function (c, ci) {
        var x = PAD + labW + ci * (cw + gap);
        var on = (r.on || []).indexOf(c.id) >= 0;
        svg += '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + cellH + '" rx="5" fill="' +
          (on ? 'var(--accent-soft)' : 'var(--sunk)') + '" stroke="' + (on ? 'var(--accent)' : 'var(--line2)') +
          '" stroke-width="1"/>';
        if (on) svg += '<circle cx="' + (x + cw / 2) + '" cy="' + (y + cellH / 2) + '" r="3.4" fill="var(--accent)"/>';
      });
    });
    return { body: svg, height: top + rows.length * (cellH + gap) + PAD };
  };

  /* topology — nested zones containing nodes */
  K.topology = function (spec) {
    var zones = spec.zones || [];
    var top = PAD + (spec.title ? 18 : 0), svg = '', y = top, zoneY = [];
    zones.forEach(function (z) {
      var items = spec.nodes.filter(function (n) { return n.zone === z.id; });
      var gap = 10;
      var bw = Math.max(66, Math.floor((W - PAD * 2 - 24 - gap * (items.length - 1)) / Math.max(1, items.length)));
      // grow to the tallest node rather than clipping a 2-line label over a 2-line sub
      var mL = 1, mS = 0;
      items.forEach(function (n) {
        mL = Math.max(mL, wrap(n.label, bw, FS).length);
        if (n.sub) mS = Math.max(mS, wrap(n.sub, bw, FS_SUB).length);
      });
      var bh = Math.max(44, mL * (FS + 2) + (mS ? mS * (FS_SUB + 1) + 3 : 0) + 16);
      var zh = bh + 34;
      svg += '<rect x="' + PAD + '" y="' + y + '" width="' + (W - PAD * 2) + '" height="' + zh + '" rx="10" ' +
        'fill="none" stroke="' + (z.tone === 'warn' ? 'var(--saffron)' : 'var(--line2)') +
        '" stroke-width="1" stroke-dasharray="5 4"/>';
      svg += '<text x="' + (PAD + 10) + '" y="' + (y + 14) + '" font-size="9" letter-spacing="0.12em" ' +
        'fill="var(--faint2)">' + esc(String(z.label).toUpperCase()) + '</text>';
      items.forEach(function (n, i) {
        svg += box(n, PAD + 12 + i * (bw + gap), y + 22, bw, bh);
      });
      zoneY.push({ top: y, bottom: y + zh });
      y += zh + 12;
    });
    // every zone flows into the next — without this the zones read as three
    // unrelated inventories rather than a path a request must traverse
    var flow = '';
    for (var zi = 0; zi < zoneY.length - 1; zi++) {
      flow += '<path d="M' + (W / 2) + ' ' + zoneY[zi].bottom + ' V' + (zoneY[zi + 1].top - 6) + '" ' +
        edgeAttrs({ style: 'thick' }) + '/>';
    }
    return { body: svg + flow, height: y + PAD };
  };

  /* sequence — actors as columns, ordered messages down the page */
  K.sequence = function (spec) {
    var actors = spec.nodes, msgs = spec.messages || [];
    var gap = 10, bh = 36;
    var bw = Math.floor((W - PAD * 2 - gap * (actors.length - 1)) / actors.length);
    var top = PAD + (spec.title ? 18 : 0), svg = '', cx = {};
    actors.forEach(function (a, i) {
      var x = PAD + i * (bw + gap);
      cx[a.id] = x + bw / 2;
      svg += box(a, x, top, bw, bh);
    });
    var y0 = top + bh + 22, step = 34;
    actors.forEach(function (a) {
      svg += '<line x1="' + cx[a.id] + '" y1="' + (top + bh) + '" x2="' + cx[a.id] + '" y2="' +
        (y0 + msgs.length * step) + '" stroke="var(--line2)" stroke-width="1" stroke-dasharray="3 4"/>';
    });
    msgs.forEach(function (m, i) {
      var y = y0 + i * step, a = cx[m.from], b = cx[m.to];
      if (a == null || b == null) return;
      var dir = b > a ? -6 : 6;
      svg += '<path d="M' + a + ' ' + y + ' H' + (b + dir) + '" ' + edgeAttrs(m) + '/>';
      svg += '<text x="' + ((a + b) / 2) + '" y="' + (y - 5) + '" text-anchor="middle" font-size="8.5" ' +
        'fill="var(--muted)">' + esc(m.label) + '</text>';
    });
    return { body: svg, height: y0 + msgs.length * step + PAD };
  };

  var KINDS = Object.keys(K);
  var MAX_NODES = 14;

  function render(spec) {
    if (!spec || !spec.kind) return '';
    var fn = K[spec.kind];
    if (!fn) return '<!-- unknown diagram kind: ' + esc(spec.kind) + ' -->';
    var count = (spec.nodes || []).length;
    if (count > MAX_NODES) {
      return '<!-- diagram too dense: ' + count + ' nodes (max ' + MAX_NODES + ') -->';
    }
    var out;
    try { out = fn(spec); } catch (e) { return '<!-- diagram error: ' + esc(e.message) + ' -->'; }
    var h = Math.ceil(out.height);
    var s = '<svg class="dgram" viewBox="0 0 ' + W + ' ' + h + '" width="100%" ' +
      'preserveAspectRatio="xMidYMin meet" role="img" aria-label="' +
      esc(spec.title || spec.caption || 'architecture diagram') + '" ' +
      'font-family="Manrope, system-ui, sans-serif">';
    s += '<defs><marker id="dgArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" ' +
      'orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z" fill="var(--muted)"/></marker></defs>';
    if (spec.title) {
      s += '<text x="' + PAD + '" y="' + (PAD + 2) + '" font-size="10" letter-spacing="0.12em" ' +
        'fill="var(--faint2)">' + esc(String(spec.title).toUpperCase()) + '</text>';
    }
    s += out.body + '</svg>';
    if (spec.caption) {
      s += '<p class="dgcap">' + esc(spec.caption) + '</p>';
    }
    return s;
  }

  root.Diagram = { render: render, kinds: KINDS, maxNodes: MAX_NODES };
})(typeof window !== 'undefined' ? window : this);

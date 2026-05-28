// viz_us_arrivals.js
// U.S. inbound travelers.
(function () {
    var YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
    var ARRIVALS = {
        2018: 79745920,
        2019: 79442000,
        2020: 19212120,
        2021: 22280146,
        2022: 50770684,
        2023: 66349860,
        2024: 72390320
    };
    var ASSET_ROOT = 'assets/figma_airport_arrivals/figma_codex_airport_arrivals_asset_pack/assets/';
    var TRAVELER_COUNT = { 2018: 8, 2019: 8, 2020: 3, 2021: 3, 2022: 5, 2023: 7, 2024: 7 };
    var TRAVELER_LAYOUT = [
        { n: 'traveler_01.png', x: 0.060, y: 0.835, h: 0.300, mirror: false },
        { n: 'traveler_02.png', x: 0.225, y: 0.800, h: 0.280, mirror: false },
        { n: 'traveler_03.png', x: 0.345, y: 0.760, h: 0.200, mirror: false },
        { n: 'traveler_04.png', x: 0.430, y: 0.770, h: 0.135, mirror: false },
        { n: 'traveler_05.png', x: 0.555, y: 0.790, h: 0.142, mirror: false },
        { n: 'traveler_06.png', x: 0.675, y: 0.805, h: 0.165, mirror: false },
        { n: 'traveler_07.png', x: 0.810, y: 0.850, h: 0.225, mirror: false },
        { n: 'traveler_08.png', x: 0.900, y: 0.835, h: 0.265, mirror: false }
    ];
    var COLORS = {
        bg: '#fbfefe',
        ink: '#123f4f',
        muted: '#5d7e86',
        teal: '#2dbdb4',
        tealDark: '#187f7b',
        mint: '#c8eded',
        aqua: '#66e5df',
        sky: '#b1dff6',
        blue: '#81baf7',
        covid: '#f49f86',
        glass: '#e8f8fb',
        rail: '#5fa9ab',
        line: '#d7eeee',
        land: '#ddf3f0',
        gray: '#d9e2e8'
    };

    function parseCSV(text) {
        var lines = (text || '').trim().split(/\r?\n/);
        var header = lines.shift().split(',');
        var entityIndex = header.indexOf('Entity');
        var yearIndex = header.indexOf('Year');
        var valueIndex = header.indexOf('Arrivals of tourists from abroad');
        return lines.map(function (line) {
            var parts = line.split(',');
            return { entity: parts[entityIndex], year: +parts[yearIndex], value: +parts[valueIndex] };
        }).filter(function (d) {
            return d.entity === 'United States' && d.year && isFinite(d.value);
        });
    }

    function currentYear(manager) {
        return manager.usArrivals && manager.usArrivals.selectedYear ? manager.usArrivals.selectedYear : 2019;
    }

    function valueFor(year) {
        return Math.round((ARRIVALS[year] || ARRIVALS[2019]) / 1000000);
    }

    function rawValueFor(year) {
        return ARRIVALS[year] || ARRIVALS[2019];
    }

    function yearColor(year) {
        return year === 2020 || year === 2021 ? COLORS.covid : COLORS.teal;
    }

    function statusFor(value, year) {
        if (year === 2019) return 'baseline';
        var ratio = rawValueFor(year) / ARRIVALS[2019];
        if (ratio >= 0.95) return 'near baseline';
        if (ratio >= 0.70) return 'rebuilding';
        if (ratio >= 0.35) return 'early recovery';
        return 'pandemic low';
    }

    function fmt(value) {
        return String(Math.round(value));
    }

    function formatInteger(value) {
        return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function previousYearChange(year) {
        var previous = ARRIVALS[year - 1];
        var current = ARRIVALS[year];
        if (!previous || !current) return null;
        return ((current - previous) / previous) * 100;
    }

    function formatPercent(value) {
        var sign = value > 0 ? '+' : '';
        return sign + value.toFixed(1) + '%';
    }

    function selectYear(manager, year) {
        var state = manager.usArrivals;
        if (!state || !ARRIVALS[year] || state.selectedYear === year) return;
        state.selectedYear = year;
        state.animStart = Date.now();
        state.lastDisplay = state.displayValue == null ? valueFor(year) : state.displayValue;
    }

    function buildYearOverlay(manager) {
        var vis = document.getElementById('vis');
        if (!vis) return;
        if (manager._usArrivalsOverlay && document.body.contains(manager._usArrivalsOverlay.root)) return;
        manager._usArrivalsOverlay = null;

        if (getComputedStyle(vis).position === 'static') {
            vis.style.position = 'fixed';
        }

        var overlay = document.createElement('div');
        overlay.className = 'worldmap-overlay usarrivals-overlay';

        var label = document.createElement('div');
        label.className = 'worldmap-year-label';
        label.textContent = String(currentYear(manager));

        var range = document.createElement('input');
        range.type = 'range';
        range.min = '2018';
        range.max = '2024';
        range.step = '1';
        range.value = String(currentYear(manager));
        range.className = 'worldmap-year-range';
        range.setAttribute('aria-label', 'Select U.S. arrivals year');

        var ticks = document.createElement('div');
        ticks.className = 'worldmap-year-ticks';
        YEARS.forEach(function (year) {
            var tick = document.createElement('span');
            tick.textContent = year;
            if (year === 2020 || year === 2021) tick.className = 'covid-year';
            ticks.appendChild(tick);
        });

        overlay.appendChild(label);
        overlay.appendChild(range);
        overlay.appendChild(ticks);
        vis.appendChild(overlay);

        range.addEventListener('input', function () {
            var year = +range.value;
            label.textContent = String(year);
            selectYear(manager, year);
        });

        manager._usArrivalsOverlay = { root: overlay, range: range, label: label };
    }

    function layoutYearOverlay(manager) {
        var state = manager.usArrivals;
        if (!manager._usArrivalsOverlay || !state || !state.sliderBox) return;
        var overlay = manager._usArrivalsOverlay.root;
        var canvas = document.querySelector('#vis canvas');
        var canvasLeft = canvas ? canvas.offsetLeft : 0;
        var canvasTop = canvas ? canvas.offsetTop : 0;
        var box = state.sliderBox;
        var width = Math.round(Math.max(360, Math.min(520, box.w * 0.52)));
        overlay.style.display = 'block';
        overlay.style.width = width + 'px';
        overlay.style.left = Math.round(canvasLeft + manager.margin.left + box.x + box.w - width - 12) + 'px';
        overlay.style.top = Math.round(canvasTop + manager.margin.top + box.y + 19) + 'px';
    }

    function shadow(p, blur, color, ox, oy) {
        var ctx = p.drawingContext;
        ctx.shadowBlur = blur || 14;
        ctx.shadowColor = color || 'rgba(21,64,72,0.12)';
        ctx.shadowOffsetX = ox || 0;
        ctx.shadowOffsetY = oy || 6;
    }

    function noShadow(p) {
        var ctx = p.drawingContext;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    function domImage(src) {
        var img = new Image();
        img.src = src;
        return img;
    }

    function drawImageCover(p, img, x, y, w, h) {
        if (!img || !img.complete || !img.naturalWidth) return false;
        var scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        var sw = w / scale;
        var sh = h / scale;
        var sx = (img.naturalWidth - sw) / 2;
        var sy = (img.naturalHeight - sh) / 2;
        p.drawingContext.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        return true;
    }

    function drawAsset(p, img, x, y, w, h, alpha, mirror) {
        if (!img || !img.complete || !img.naturalWidth) return false;
        var ctx = p.drawingContext;
        ctx.save();
        ctx.globalAlpha = alpha == null ? 1 : alpha;
        if (mirror) {
            ctx.translate(x + w, y);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, w, h);
        } else {
            ctx.drawImage(img, x, y, w, h);
        }
        ctx.restore();
        return true;
    }

    function plane(p, x, y, s, color, angle) {
        p.push();
        p.translate(x, y);
        p.rotate(angle || -0.35);
        p.noStroke();
        p.fill(color || COLORS.tealDark);
        p.triangle(-s * 0.32, -s * 0.07, s * 0.35, 0, -s * 0.32, s * 0.07);
        p.rect(-s * 0.06, -s * 0.035, s * 0.34, s * 0.07, 3);
        p.triangle(-s * 0.04, -s * 0.035, -s * 0.2, -s * 0.24, s * 0.06, -s * 0.035);
        p.triangle(-s * 0.04, s * 0.035, -s * 0.2, s * 0.24, s * 0.06, s * 0.035);
        p.pop();
    }

    function drawHeader(p, x, y) {
        p.noStroke();
        p.fill(COLORS.mint);
        p.ellipse(x + 30, y + 31, 44, 44);
        plane(p, x + 30, y + 31, 27, COLORS.tealDark, -0.35);
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(24);
        p.text('U.S. Arrivals', x + 66, y + 8);
        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(12);
        p.text('International inbound travelers', x + 68, y + 39);
    }

    function drawOverviewMap(p, manager, x, y, w, h) {
        var state = manager.usArrivals || {};
        p.push();
        shadow(p, 16, 'rgba(21,64,72,0.10)', 0, 6);
        p.noStroke();
        p.fill(255, 246);
        p.rect(x, y, w, h, 18);
        noShadow(p);

        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(15);
        p.text('Global Overview', x + 22, y + 22);
        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(10);
        p.text('Worldwide context', x + 22, y + 43);

        var mapX = x + 18;
        var mapY = y + 78;
        var mapW = w - 36;
        var mapH = h - 142;
        if (state.countries && state.countries.length && typeof d3 !== 'undefined') {
            var projection = d3.geoNaturalEarth1();
            projection.fitExtent([[mapX, mapY], [mapX + mapW, mapY + mapH]], { type: 'Sphere' });
            var ctx = p.drawingContext;
            var path = d3.geoPath(projection, ctx);
            ctx.save();
            state.countries.forEach(function (feature) {
                var name = feature.properties && feature.properties.name;
                ctx.beginPath();
                path(feature);
                ctx.fillStyle = name === 'United States of America' ? COLORS.teal : COLORS.land;
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 0.75;
                ctx.stroke();
            });
            ctx.restore();
            var us = projection([-98, 39]);
            var europe = projection([10, 48]);
            var asia = projection([104, 35]);
            if (us) {
                p.noFill();
                p.stroke(COLORS.tealDark);
                p.strokeWeight(1.3);
                p.drawingContext.setLineDash([4, 7]);
                if (europe) p.bezier(europe[0], europe[1], x + w * 0.70, y + h * 0.32, x + w * 0.50, y + h * 0.45, us[0], us[1]);
                if (asia) p.bezier(asia[0], asia[1], x + w * 0.78, y + h * 0.55, x + w * 0.55, y + h * 0.52, us[0], us[1] + 4);
                p.drawingContext.setLineDash([]);
                p.noStroke();
                p.fill(COLORS.teal);
                p.ellipse(us[0], us[1], 22, 22);
                p.fill(255);
                p.ellipse(us[0], us[1], 8, 8);
            }
        }

        p.fill(COLORS.muted);
        p.textSize(10);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text('Index vs. 2019', x + 22, y + h - 28);
        var grad = p.drawingContext.createLinearGradient(x + 104, y + h - 34, x + w - 22, y + h - 34);
        grad.addColorStop(0, COLORS.mint);
        grad.addColorStop(0.55, COLORS.aqua);
        grad.addColorStop(1, COLORS.blue);
        p.drawingContext.fillStyle = grad;
        p.noStroke();
        p.rect(x + 104, y + h - 38, w - 126, 9, 9);
        p.pop();
    }

    function drawAirportInterior(p, x, y, w, h) {
        var grad = p.drawingContext.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#dff5fb');
        grad.addColorStop(0.50, '#edf9fb');
        grad.addColorStop(1, '#ffffff');
        p.drawingContext.fillStyle = grad;
        p.noStroke();
        p.rect(x, y, w, h, 0, 0, 18, 18);

        p.stroke('rgba(129,186,247,0.28)');
        p.strokeWeight(1);
        for (var i = 0; i < 8; i++) {
            var gx = x + w * (0.08 + i * 0.13);
            p.line(gx, y, gx, y + h * 0.72);
        }
        p.line(x + 20, y + h * 0.36, x + w - 22, y + h * 0.34);
        p.line(x + 22, y + h * 0.63, x + w - 24, y + h * 0.66);

        p.noStroke();
        p.fill(255, 185);
        for (var c = 0; c < 7; c++) {
            var cx = x + w * (0.08 + c * 0.14);
            var cy = y + h * (0.13 + (c % 3) * 0.07);
            p.ellipse(cx, cy, 50, 18);
            p.ellipse(cx + 26, cy + 4, 35, 13);
        }

        p.fill('#c6e8ef');
        for (var b = 0; b < 14; b++) {
            var bh = 28 + (b % 5) * 17;
            p.rect(x + w * 0.16 + b * 28, y + h * 0.48 - bh, 17 + (b % 4) * 8, bh, 3);
        }

        p.fill('rgba(177,223,246,0.42)');
        p.rect(x + w * 0.58, y + h * 0.50, w * 0.30, h * 0.28, 120, 120, 0, 0);
        p.fill('#eefafa');
        p.rect(x + w * 0.64, y + h * 0.60, w * 0.18, h * 0.17, 8);
        p.fill(COLORS.tealDark);
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(15);
        p.text('ARRIVALS', x + w * 0.73, y + h * 0.56);

        p.fill(COLORS.teal);
        p.rect(x + 30, y + 72, 126, 36, 7);
        p.fill(255);
        p.textStyle(p.BOLD);
        p.textSize(14);
        p.text('WELCOME', x + 93, y + 86);
        p.text('TO THE U.S.', x + 93, y + 103);

        p.fill('rgba(255,255,255,0.78)');
        p.rect(x + w * 0.78, y + h * 0.64, w * 0.14, h * 0.12, 8);
        p.fill('#9bdce0');
        p.rect(x + w * 0.805, y + h * 0.685, w * 0.095, h * 0.05, 5);

        p.fill('#bddde6');
        p.rect(x + w * 0.72, y + h * 0.14, 18, 118, 6);
        p.fill('#a7d8e3');
        p.rect(x + w * 0.705, y + h * 0.07, 50, 28, 6);
        p.fill(COLORS.sky);
        p.triangle(x + w * 0.71, y + h * 0.07, x + w * 0.77, y + h * 0.07, x + w * 0.74, y + h * 0.035);
        plane(p, x + w * 0.62, y + h * 0.15, 30, 'rgba(95,154,155,0.42)', -0.35);
    }

    function drawPlants(p, x, y, s, flip) {
        p.push();
        p.translate(x, y);
        p.scale(flip ? -s : s, s);
        p.noStroke();
        p.fill('rgba(95,154,155,0.20)');
        p.rect(-16, 0, 32, 56, 12, 12, 5, 5);
        p.fill('#66cfc6');
        for (var i = 0; i < 6; i++) {
            var a = -1.2 + i * 0.42;
            p.push();
            p.rotate(a);
            p.ellipse(0, -32 - i * 4, 15, 58);
            p.pop();
        }
        p.pop();
    }

    function drawRails(p, x, y, w, h) {
        p.push();
        p.stroke(COLORS.rail);
        p.strokeWeight(2.3);
        for (var i = 0; i < 8; i++) {
            var rx = x + w * (0.20 + i * 0.095);
            p.line(rx, y + h * 0.75, rx, y + h * 0.90);
            p.noStroke();
            p.fill(COLORS.rail);
            p.ellipse(rx, y + h * 0.75, 7, 7);
            p.stroke(COLORS.rail);
        }
        p.line(x + w * 0.20, y + h * 0.77, x + w * 0.83, y + h * 0.74);
        p.line(x + w * 0.21, y + h * 0.87, x + w * 0.86, y + h * 0.84);
        p.stroke('rgba(197,223,228,0.70)');
        p.strokeWeight(1);
        for (var f = 0; f < 6; f++) {
            var fy = y + h * 0.82 + f * 15;
            p.line(x + 18, fy, x + w - 18, fy + 8);
        }
        p.pop();
    }

    function drawTraveler(p, x, y, scale, index, flip) {
        p.push();
        p.translate(x, y);
        p.scale(flip ? -scale : scale, scale);
        p.noStroke();
        var shirt = index % 3 === 0 ? '#55c9bd' : (index % 3 === 1 ? '#5fa9ab' : '#81baf7');
        p.fill('rgba(21,64,72,0.12)');
        p.ellipse(0, 26, 36, 8);
        p.fill(index % 2 === 0 ? '#174d58' : '#285f69');
        p.ellipse(0, -44, 13, 14);
        p.fill('#f4d6c4');
        p.ellipse(1, -39, 12, 13);
        p.fill(shirt);
        p.rect(-8, -31, 16, 31, 8);
        p.stroke('#174d58');
        p.strokeWeight(2);
        p.line(-4, -2, -11, 24);
        p.line(4, -2, 12, 22);
        p.strokeWeight(1.7);
        p.line(-7, -22, -17, -8);
        p.line(7, -22, 15, -8);
        p.noStroke();
        if (index % 2 === 0) {
            p.fill(COLORS.teal);
            p.rect(-30, -4, 18, 28, 5);
            p.fill(COLORS.sky);
            p.rect(-27, -1, 12, 22, 3);
            p.stroke(COLORS.teal);
            p.line(-21, -4, -21, -17);
        } else {
            p.fill(COLORS.blue);
            p.rect(13, -6, 14, 26, 5);
            p.stroke(COLORS.blue);
            p.line(20, -6, 20, -18);
        }
        p.pop();
    }

    function drawTravelers(p, x, y, w, h, value) {
        var count = Math.max(3, Math.min(14, Math.round(value / 8)));
        var slots = [
            [0.11, 0.88, 1.04, 0], [0.18, 0.84, 1.10, 1],
            [0.54, 0.86, 1.00, 0], [0.63, 0.87, 1.06, 1],
            [0.72, 0.82, 0.74, 0], [0.79, 0.78, 0.64, 1],
            [0.86, 0.73, 0.56, 0], [0.33, 0.87, 0.66, 1],
            [0.40, 0.84, 0.62, 0], [0.48, 0.82, 0.58, 1],
            [0.26, 0.89, 0.55, 0], [0.92, 0.84, 0.52, 1],
            [0.36, 0.77, 0.48, 0], [0.68, 0.75, 0.48, 1]
        ];
        for (var i = 0; i < count; i++) {
            var s = slots[i];
            drawTraveler(p, x + w * s[0], y + h * s[1], s[2], i, s[3]);
        }
    }

    function drawSplitFlap(p, x, y, value, scale) {
        var digits = fmt(value);
        scale = scale || 1;
        var boxW = 84 * scale;
        var boxH = 126 * scale;
        var gap = 8 * scale;
        p.push();
        for (var i = 0; i < digits.length; i++) {
            var bx = x + i * (boxW + gap);
            shadow(p, 12, 'rgba(12,92,87,0.22)', 0, 5);
            p.noStroke();
            p.fill('#147c77');
            p.rect(bx, y, boxW, boxH, 10);
            noShadow(p);
            var g = p.drawingContext.createLinearGradient(bx, y, bx, y + boxH);
            g.addColorStop(0, '#35bdb6');
            g.addColorStop(1, '#16746f');
            p.drawingContext.fillStyle = g;
            p.rect(bx + 4, y + 4, boxW - 8, boxH - 8, 8);
            p.stroke('rgba(12,92,87,0.78)');
            p.strokeWeight(2);
            p.line(bx + 5, y + boxH / 2, bx + boxW - 5, y + boxH / 2);
            p.noStroke();
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textStyle(p.BOLD);
            p.textSize(76 * scale);
            p.text(digits[i], bx + boxW / 2, y + boxH / 2 + 5);
        }
        p.pop();
    }

    function splitFlapWidth(value, scale) {
        var digits = fmt(value);
        scale = scale || 1;
        return digits.length * 84 * scale + Math.max(0, digits.length - 1) * 8 * scale;
    }

    function drawSceneAsset(p, manager, x, y, w, h) {
        var assets = manager.usArrivals && manager.usArrivals.assets;
        if (!assets || !drawImageCover(p, assets.background, x, y, w, h)) {
            drawAirportInterior(p, x, y, w, h);
        }
    }

    function drawFigmaSigns(p, manager, x, y, w, h) {
        var signs = manager.usArrivals.assets && manager.usArrivals.assets.signs;
        if (!signs) return;
        drawAsset(p, signs.welcome, x + w * 0.165, y + h * 0.575, w * 0.085, w * 0.085 * (284 / 253), 0.98);
        drawAsset(p, signs.wayfinding, x + w * 0.855, y + h * 0.455, w * 0.142, w * 0.142 * (234 / 343), 0.98);
    }

    function removeHeadLevelBars(p, x, y, w, h) {
        p.push();
        p.noStroke();
        p.fill(194, 231, 237, 230);
        p.rect(x + w * 0.540, y + h * 0.505, w * 0.195, h * 0.010, 3);
        p.fill(219, 244, 248, 210);
        p.rect(x + w * 0.545, y + h * 0.520, w * 0.165, h * 0.008, 3);
        p.pop();
    }

    function drawFigmaTravelers(p, manager, x, y, w, h, year) {
        var people = manager.usArrivals.assets && manager.usArrivals.assets.people;
        if (!people || !people.length) return;
        var count = TRAVELER_COUNT[year] || 10;
        var progress = Math.min(1, (Date.now() - (manager.usArrivals.animStart || Date.now())) / 780);
        var appear = 1 - Math.pow(1 - progress, 3);
        for (var i = TRAVELER_LAYOUT.length - 1; i >= 0; i--) {
            if (i >= count) continue;
            var item = TRAVELER_LAYOUT[i];
            var img = people[i];
            var ih = h * item.h;
            var iw = ih * (img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.58);
            var drift = (1 - appear) * h * 0.035 * (i % 2 === 0 ? 1 : -0.45);
            var alpha = i >= count - 2 && progress < 1 ? 0.45 + appear * 0.55 : 1;
            drawAsset(p, img, x + w * item.x - iw / 2, y + h * item.y - ih + drift, iw, ih, alpha, item.mirror);
        }
    }

    function drawHeroPanel(p, manager, x, y, w, h, shown, year) {
        p.push();
        p.noStroke();
        noShadow(p);

        var compact = w < 760;
        var headerH = compact ? 94 : 88;
        p.fill(255);
        p.rect(x, y, w, headerH);
        p.fill(COLORS.mint);
        p.ellipse(x + 58, y + 44, 50, 50);
        plane(p, x + 58, y + 44, 31, COLORS.tealDark, -0.35);
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(compact ? 20 : 26);
        p.text('U.S. Arrivals', x + 112, y + 24);
        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(compact ? 12 : 14);
        p.text('International inbound travelers', x + 113, y + 56);
        manager.usArrivals.sliderBox = { x: x, y: y, w: w, h: headerH };

        var sceneY = y + headerH;
        var sceneH = h - headerH;
        var ctx = p.drawingContext;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, sceneY, w, sceneH);
        ctx.clip();
        drawSceneAsset(p, manager, x, sceneY, w, sceneH);
        removeHeadLevelBars(p, x, sceneY, w, sceneH);
        drawFigmaSigns(p, manager, x, sceneY, w, sceneH);
        drawFigmaTravelers(p, manager, x, sceneY, w, sceneH, year);
        ctx.restore();

        var scale = Math.max(0.68, Math.min(1.48, w / 1040));
        var flapW = splitFlapWidth(shown, scale);
        var boardW = Math.max(300 * scale, flapW + 118 * scale);
        var boardH = 245 * scale;
        var flapX = x + w * 0.50 - flapW / 2;
        var flapY = sceneY + sceneH * (compact ? 0.035 : 0.075);
        p.fill(255, 250);
        shadow(p, 18, 'rgba(21,64,72,0.12)', 0, 8);
        p.rect(x + w * 0.50 - boardW / 2, flapY - 46 * scale, boardW, boardH, 22);
        noShadow(p);
        p.fill(COLORS.ink);
        p.textAlign(p.CENTER, p.TOP);
        p.textStyle(p.NORMAL);
        p.textSize(15 * scale);
        p.text('Inbound travelers', x + w * 0.50, flapY - 17 * scale);
        drawSplitFlap(p, flapX, flapY + 28 * scale, shown, scale);
        p.fill(year === 2020 || year === 2021 ? '#d56f51' : COLORS.muted);
        p.textSize(12 * scale);
        p.text('million travelers, rounded', x + w * 0.50, flapY + 164 * scale);
        p.textSize(10 * scale);
        p.fill(COLORS.muted);
        p.text(String(year) + ': ' + formatInteger(rawValueFor(year)) + ' arrivals', x + w * 0.50, flapY + 181 * scale);
        var yoy = previousYearChange(year);
        p.fill(yoy == null ? COLORS.muted : (yoy < 0 ? '#d56f51' : COLORS.tealDark));
        p.text(yoy == null ? 'vs previous year: n/a' : 'vs previous year: ' + formatPercent(yoy), x + w * 0.50, flapY + 196 * scale);
        p.pop();
    }

    window.VizUSArrivals = {
        setData: function (manager) {
            manager.usArrivals = {
                selectedYear: 2019,
                rows: [],
                countries: [],
                displayValue: valueFor(2019),
                lastDisplay: valueFor(2019),
                animStart: Date.now(),
                assets: {
                    background: null,
                    people: [],
                    signs: {}
                }
            };
            manager.usArrivals.assets.background = domImage(ASSET_ROOT + 'backgrounds/airport_arrivals_hall_background.png');
            manager.usArrivals.assets.people = TRAVELER_LAYOUT.map(function (d) {
                return domImage(ASSET_ROOT + 'people/individual_png/' + d.n);
            });
            manager.usArrivals.assets.signs = {
                welcome: domImage(ASSET_ROOT + 'signage/individual_png/welcome_us_sign.png'),
                wayfinding: domImage(ASSET_ROOT + 'signage/individual_png/wayfinding_board.png')
            };

            var dataPromise = fetch('data/World_traveler_data.csv')
                .then(function (response) { return response.text(); })
                .then(parseCSV);
            var mapPromise = fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
                .then(function (response) { return response.json(); });

            return Promise.all([dataPromise, mapPromise]).then(function (results) {
                manager.usArrivals.rows = results[0];
                manager.usArrivals.countries = topojson.feature(results[1], results[1].objects.countries).features;
                return manager.usArrivals;
            }).catch(function (err) {
                console.error('U.S. arrivals data load failed', err);
                return manager.usArrivals;
            });
        },

        draw: function (p, manager) {
            var state = manager.usArrivals;
            if (!state) return;
            buildYearOverlay(manager);

            p.push();
            p.translate(manager.margin.left, manager.margin.top);
            p.background(COLORS.bg);

            var year = currentYear(manager);
            var target = valueFor(year);
            var elapsed = Math.min(1, (Date.now() - (state.animStart || Date.now())) / 950);
            var eased = 1 - Math.pow(1 - elapsed, 3);
            var shown = state.lastDisplay + (target - state.lastDisplay) * eased;
            if (elapsed >= 1) shown = target;
            state.displayValue = shown;

            var w = manager.width;
            var h = manager.height;
            if (manager._usArrivalsOverlay) {
                manager._usArrivalsOverlay.range.value = String(year);
                manager._usArrivalsOverlay.label.textContent = String(year);
            }

            var pad = 8;
            drawHeroPanel(p, manager, pad, 8, w - pad * 2, h - 16, shown, year);
            layoutYearOverlay(manager);
            p.pop();
        },

        hideOverlay: function (manager) {
            if (manager && manager._usArrivalsOverlay) {
                manager._usArrivalsOverlay.root.style.display = 'none';
            }
        }
    };
})();

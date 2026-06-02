// viz_intro.js
// Animated opening sequence for the tourism article.
(function () {
    var COLORS = {
        bg: '#fbfefe',
        text: '#152124',
        muted: '#6f8388',
        faint: '#d9e2e8',
        teal: '#66e5df',
        deepTeal: '#5fa9ab',
        blue: '#81baf7',
        time: '#b1dff6',
        money: '#acffc9',
        covid: '#f49f86'
    };

    var ROUTES = [
        { from: [-74, 40], to: [-0.1, 51.5], bend: 0.18 },
        { from: [-118, 34], to: [139.7, 35.7], bend: -0.16 },
        { from: [2.3, 48.9], to: [103.8, 1.35], bend: 0.12 },
        { from: [-46.6, -23.5], to: [-3.7, 40.4], bend: -0.14 },
        { from: [151.2, -33.9], to: [116.4, 39.9], bend: 0.11 },
        { from: [31.2, 30.0], to: [77.2, 28.6], bend: -0.08 },
        { from: [18.4, -34.0], to: [55.3, 25.2], bend: 0.16 },
        { from: [-99.1, 19.4], to: [-0.1, 51.5], bend: 0.1 },
        { from: [12.5, 41.9], to: [100.5, 13.7], bend: -0.1 }
    ];

    var CITIES = [
        [-74, 40], [-0.1, 51.5], [139.7, 35.7], [-118, 34],
        [2.3, 48.9], [103.8, 1.35], [-46.6, -23.5], [-3.7, 40.4],
        [151.2, -33.9], [116.4, 39.9], [31.2, 30], [77.2, 28.6],
        [18.4, -34], [55.3, 25.2], [-99.1, 19.4], [100.5, 13.7]
    ];

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function smoothstep(t) {
        t = clamp(t, 0, 1);
        return t * t * (3 - 2 * t);
    }

    function windowFade(value, start, end) {
        return smoothstep((value - start) / (end - start));
    }

    function segmentFade(value, start, peak, end) {
        return Math.min(windowFade(value, start, peak), 1 - windowFade(value, peak, end));
    }

    function holdFade(value, inStart, inEnd, outStart, outEnd) {
        return Math.min(windowFade(value, inStart, inEnd), 1 - windowFade(value, outStart, outEnd));
    }

    function easeOut(t) {
        t = clamp(t, 0, 1);
        return 1 - Math.pow(1 - t, 3);
    }

    function drawWrappedText(p, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';
        for (var i = 0; i < words.length; i++) {
            var test = line ? line + ' ' + words[i] : words[i];
            if (p.textWidth(test) > maxWidth && line) {
                p.text(line, x, y);
                line = words[i];
                y += lineHeight;
            } else {
                line = test;
            }
        }
        if (line) p.text(line, x, y);
    }

    function makeProjection(p, manager) {
        var left = manager.margin.left + 24;
        var top = manager.margin.top + 102;
        var right = manager.canvasWidth - manager.margin.right - 24;
        var bottom = manager.canvasHeight - 70;
        var projection = d3.geoNaturalEarth1();
        projection.fitExtent([[left, top], [right, bottom]], { type: 'Sphere' });
        return projection;
    }

    function drawWorld(p, manager, projection, alpha) {
        var wm = manager.worldMap || {};
        if (!wm.countries || !wm.countries.length || typeof d3 === 'undefined') return;

        var ctx = p.drawingContext;
        var path = d3.geoPath(projection, ctx);
        ctx.save();
        wm.countries.forEach(function (feature) {
            ctx.beginPath();
            path(feature);
            ctx.fillStyle = 'rgba(217, 226, 232, ' + (0.58 * alpha).toFixed(3) + ')';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.9 * alpha).toFixed(3) + ')';
            ctx.lineWidth = 0.65;
            ctx.stroke();
        });
        ctx.restore();
    }

    function curvedPoint(a, b, bend, t) {
        var midX = (a[0] + b[0]) / 2;
        var midY = (a[1] + b[1]) / 2 - Math.abs(a[0] - b[0]) * bend;
        var x = Math.pow(1 - t, 2) * a[0] + 2 * (1 - t) * t * midX + t * t * b[0];
        var y = Math.pow(1 - t, 2) * a[1] + 2 * (1 - t) * t * midY + t * t * b[1];
        return [x, y];
    }

    function drawRoutes(p, projection, progress, globalAlpha) {
        p.push();
        p.noFill();
        ROUTES.forEach(function (route, i) {
            var appear = windowFade(progress, 0.14 + i * 0.018, 0.34 + i * 0.018);
            var fadeOut = 1 - windowFade(progress, 0.72, 0.84);
            var a = appear * fadeOut * globalAlpha;
            if (a <= 0.01) return;

            var from = projection(route.from);
            var to = projection(route.to);
            if (!from || !to) return;
            var control = curvedPoint(from, to, route.bend, 0.5);

            p.stroke(102, 229, 223, 175 * a);
            p.strokeWeight(1.4);
            p.beginShape();
            var steps = 36;
            var drawn = clamp((progress - 0.14 - i * 0.018) / 0.24, 0, 1);
            for (var s = 0; s <= steps * drawn; s++) {
                var t = s / steps;
                var point = curvedPoint(from, to, route.bend, t);
                p.vertex(point[0], point[1]);
            }
            p.endShape();

            var moving = (p.frameCount * 0.012 + i * 0.17) % 1;
            var dot = curvedPoint(from, to, route.bend, moving);
            p.noStroke();
            p.fill(129, 186, 247, 190 * a);
            p.circle(dot[0], dot[1], 4.5);
            p.noFill();
        });
        p.pop();
    }

    function drawCities(p, projection, progress) {
        p.push();
        CITIES.forEach(function (lonLat, i) {
            var pos = projection(lonLat);
            if (!pos) return;
            var appear = windowFade(progress, 0.18 + i * 0.01, 0.38 + i * 0.01);
            var fadeOut = 1 - windowFade(progress, 0.72, 0.84);
            var pulse = 0.65 + 0.35 * Math.sin(p.frameCount * 0.07 + i);
            var a = appear * fadeOut;
            p.noStroke();
            p.fill(102, 229, 223, 100 * a * pulse);
            p.circle(pos[0], pos[1], 14 * pulse);
            p.fill(95, 169, 171, 220 * a);
            p.circle(pos[0], pos[1], 4.2);
        });
        p.pop();
    }

    function drawPlane(p, projection, progress) {
        var fade = segmentFade(progress, 0.1, 0.36, 0.68);
        if (fade <= 0.01) return;
        var route = ROUTES[1];
        var from = projection(route.from);
        var to = projection(route.to);
        var t = (p.frameCount * 0.0035 + progress * 0.8) % 1;
        var pos = curvedPoint(from, to, route.bend, t);
        var next = curvedPoint(from, to, route.bend, Math.min(1, t + 0.02));
        var angle = Math.atan2(next[1] - pos[1], next[0] - pos[0]);

        p.push();
        p.translate(pos[0], pos[1]);
        p.rotate(angle);
        p.noStroke();
        p.fill(21, 33, 36, 225 * fade);
        p.triangle(13, 0, -9, -6, -5, 0);
        p.triangle(13, 0, -9, 6, -5, 0);
        p.fill(129, 186, 247, 190 * fade);
        p.triangle(-2, 0, -16, -10, -11, 0);
        p.triangle(-2, 0, -16, 10, -11, 0);
        p.pop();
    }

    function drawBill(p, x, y, w, h, angle, alpha) {
        p.push();
        p.translate(x, y);
        p.rotate(angle);
        p.rectMode(p.CENTER);

        p.stroke(78, 135, 101, 105 * alpha);
        p.strokeWeight(1);
        p.fill(174, 238, 196, 220 * alpha);
        p.rect(0, 0, w, h, 4);

        p.noFill();
        p.stroke(103, 163, 128, 120 * alpha);
        p.strokeWeight(0.9);
        p.rect(0, 0, w * 0.82, h * 0.68, 3);

        p.noStroke();
        p.fill(76, 136, 104, 105 * alpha);
        p.ellipse(0, 0, w * 0.22, h * 0.5);
        p.fill(255, 255, 255, 72 * alpha);
        p.rect(-w * 0.26, -h * 0.2, w * 0.18, h * 0.07, 99);
        p.pop();
    }

    function drawBillPile(p, x, baseY, rows, cols, billW, alpha, highlight) {
        var billH = billW * 0.46;
        var stackGap = billH * 0.46;
        var rowWidth = cols * billW * 0.34;
        p.push();

        for (var r = 0; r < rows; r++) {
            var rowProgress = clamp(alpha * rows - r, 0, 1);
            if (rowProgress <= 0.01) continue;
            var rowA = smoothstep(rowProgress);
            var rowY = baseY - r * stackGap - (1 - rowA) * billH * 1.2;
            var count = Math.max(2, Math.min(cols, 4) - Math.floor(r * 0.08));
            var rowShift = (r % 2 ? billW * 0.12 : -billW * 0.06);

            p.push();
            p.translate(x + rowShift, rowY);
            p.rotate((r % 3 - 1) * 0.012);
            for (var c = 0; c < count; c++) {
                var bx = (c - (count - 1) / 2) * billW * 0.44;
                var by = Math.sin(c * 0.9 + r) * billH * 0.035;
                drawBill(p, bx, by, billW * 1.06, billH, 0, rowA);
            }
            p.noStroke();
            p.fill(95, 169, 171, 115 * rowA);
            p.rectMode(p.CENTER);
            p.rect(0, 0, Math.min(rowWidth, count * billW * 0.42 + billW * 0.36), billH * 0.24, 3);
            p.pop();
        }
        p.pop();

        if (highlight && alpha > 0.82) {
            p.push();
            p.noFill();
            p.stroke(95, 169, 171, 200);
            p.strokeWeight(3);
            p.rect(
                x - cols * billW * 0.32,
                baseY - rows * stackGap - billH * 0.78,
                cols * billW * 0.64,
                rows * stackGap + billH * 1.46,
                10
            );
            p.pop();
        }
    }

    function drawCoin(p, x, y, size, alpha) {
        p.push();
        p.stroke(80, 143, 111, 130 * alpha);
        p.strokeWeight(1);
        p.fill(172, 255, 201, 235 * alpha);
        p.ellipse(x, y, size, size * 0.42);
        p.noStroke();
        p.fill(255, 255, 255, 110 * alpha);
        p.ellipse(x - size * 0.14, y - size * 0.05, size * 0.16, size * 0.07);
        p.pop();
    }

    function drawCoinPile(p, x, baseY, rows, cols, coinW, alpha, highlight) {
        var visibleRows = Math.floor(rows * alpha);
        for (var r = 0; r < visibleRows; r++) {
            var count = cols - Math.floor(r * 0.18);
            for (var c = 0; c < count; c++) {
                var offset = (r % 2) * coinW * 0.23;
                drawCoin(p, x + (c - count / 2) * coinW * 0.62 + offset, baseY - r * coinW * 0.16, coinW, 1);
            }
        }
        if (highlight && alpha > 0.82) {
            p.push();
            p.noFill();
            p.stroke(95, 169, 171, 200);
            p.strokeWeight(3);
            p.rect(x - cols * coinW * 0.34, baseY - rows * coinW * 0.16 - 8, cols * coinW * 0.68, rows * coinW * 0.18 + 24, 10);
            p.pop();
        }
    }

    function drawMoneyMoment(p, manager, progress) {
        var a = windowFade(progress, 0.36, 0.56) * (1 - windowFade(progress, 0.64, 0.72));
        if (a <= 0.01) return;

        var leftX = manager.canvasWidth * 0.33;
        var rightX = manager.canvasWidth * 0.66;
        var baseY = manager.canvasHeight * 0.79;
        var drop = easeOut(clamp((progress - 0.38) / 0.22, 0, 1));

        p.push();
        p.textAlign(p.CENTER, p.TOP);
        p.noStroke();
        p.fill(21, 33, 36, 220 * a);
        p.textStyle(p.BOLD);
        p.textSize(Math.min(22, manager.canvasWidth * 0.016));
        p.text('Global GDP', leftX, baseY + 22);
        p.text('Travel & Tourism', rightX, baseY + 22);
        var bill = Math.min(54, manager.canvasWidth * 0.03);
        drawBillPile(p, leftX, baseY, 15, 5, bill, drop, false);
        drawBillPile(p, rightX, baseY, 4, 3, bill, drop, true);

        var numberA = windowFade(progress, 0.48, 0.62);
        p.textSize(Math.min(72, manager.canvasWidth * 0.052));
        p.fill(95, 169, 171, 235 * numberA);
        p.text('10.4%', rightX, baseY - bill * 4.7);
        p.textSize(Math.min(19, manager.canvasWidth * 0.014));
        p.textStyle(p.NORMAL);
        p.fill(111, 131, 136, 220 * numberA);
        p.text('of global GDP in 2019', rightX, baseY - bill * 3.32);
        p.textSize(11);
        p.fill(111, 131, 136, 145 * numberA);
        p.text('Source: WTTC', rightX, baseY - bill * 2.82);
        p.pop();
    }

    function drawPandemicBreak(p, manager, progress) {
        var a = holdFade(progress, 0.76, 0.82, 0.86, 0.91);
        if (a <= 0.01) return;
        p.push();
        p.noStroke();
        p.fill(244, 159, 134, 32 * a);
        p.rect(0, 0, manager.canvasWidth, manager.canvasHeight);
        p.fill(21, 33, 36, 220 * a);
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(Math.min(82, manager.canvasWidth * 0.058));
        p.text('Then, movement stopped.', manager.canvasWidth / 2, manager.canvasHeight * 0.46);
        p.pop();
    }

    function drawOpeningText(p, manager, progress) {
        var openingA = segmentFade(progress, 0, 0.16, 0.42);
        var connectedA = segmentFade(progress, 0.55, 0.68, 0.78);
        var questionA = windowFade(progress, 0.88, 0.94);
        var narrow = manager.canvasWidth < 720;

        p.push();
        p.textAlign(p.CENTER, p.CENTER);
        p.noStroke();

        if (openingA > 0.01) {
            p.fill(21, 33, 36, 245 * openingA);
            p.textStyle(p.BOLD);
            var openingSize = narrow ? Math.min(44, manager.canvasWidth * 0.052) : Math.min(86, manager.canvasWidth * 0.058);
            p.textSize(openingSize);
            drawWrappedText(
                p,
                'Before 2020, global travel never stopped.',
                manager.canvasWidth / 2,
                manager.canvasHeight * 0.22,
                manager.canvasWidth * (narrow ? 0.68 : 0.8),
                openingSize * 1.28
            );
        }

        if (connectedA > 0.01) {
            p.fill(21, 33, 36, 235 * connectedA);
            p.textStyle(p.BOLD);
            var connectedSize = narrow ? Math.min(36, manager.canvasWidth * 0.046) : Math.min(62, manager.canvasWidth * 0.044);
            p.textSize(connectedSize);
            drawWrappedText(
                p,
                'Travel connected people, cultures, and economies.',
                manager.canvasWidth / 2,
                manager.canvasHeight * 0.22,
                manager.canvasWidth * (narrow ? 0.7 : 0.78),
                connectedSize * 1.3
            );
        }

        if (questionA > 0.01) {
            p.fill(21, 33, 36, 245 * questionA);
            p.textStyle(p.BOLD);
            var questionSize = narrow ? Math.min(30, manager.canvasWidth * 0.038) : Math.min(52, manager.canvasWidth * 0.034);
            p.textSize(questionSize);
            var questionLines = [
                'After a long pause, the pandemic finally ended.',
                'Did travelers come back?',
                'Did spending confidence return?',
                'Did people go back to the destinations they loved?'
            ];
            var questionLineHeight = questionSize * 1.28;
            var questionY = manager.canvasHeight * 0.31;
            questionLines.forEach(function (line, i) {
                p.text(line, manager.canvasWidth / 2, questionY + i * questionLineHeight);
            });
        }

        p.pop();
    }

    window.VizIntro = {
        draw: function (p, manager, ai, progress) {
            var story = clamp(progress || 0, 0, 1);

            p.push();
            p.background(COLORS.bg);
            if (typeof d3 !== 'undefined') {
                var projection = makeProjection(p, manager);
                drawWorld(p, manager, projection, 1 - windowFade(story, 0.82, 0.96));
                drawRoutes(p, projection, story, 1);
                drawCities(p, projection, story);
                drawPlane(p, projection, story);
            }
            drawMoneyMoment(p, manager, story);
            drawPandemicBreak(p, manager, story);
            drawOpeningText(p, manager, story);
            p.pop();
        }
    };
})();

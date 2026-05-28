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
        var a = windowFade(progress, 0.36, 0.56) * (1 - windowFade(progress, 0.72, 0.82));
        if (a <= 0.01) return;

        var leftX = manager.canvasWidth * 0.33;
        var rightX = manager.canvasWidth * 0.66;
        var baseY = manager.canvasHeight * 0.76;
        var drop = easeOut(clamp((progress - 0.38) / 0.22, 0, 1));

        p.push();
        p.textAlign(p.CENTER, p.TOP);
        p.noStroke();
        p.fill(21, 33, 36, 220 * a);
        p.textStyle(p.BOLD);
        p.textSize(Math.min(22, manager.canvasWidth * 0.016));
        p.text('Global GDP', leftX, baseY + 22);
        p.text('Travel & Tourism', rightX, baseY + 22);
        var coin = Math.min(34, manager.canvasWidth * 0.019);
        drawCoinPile(p, leftX, baseY, 20, 14, coin, drop, false);
        drawCoinPile(p, rightX, baseY, 9, 9, coin, drop, true);

        var numberA = windowFade(progress, 0.48, 0.62);
        p.textSize(Math.min(72, manager.canvasWidth * 0.052));
        p.fill(95, 169, 171, 235 * numberA);
        p.text('10.4%', rightX, baseY - coin * 8.2);
        p.textSize(Math.min(19, manager.canvasWidth * 0.014));
        p.textStyle(p.NORMAL);
        p.fill(111, 131, 136, 220 * numberA);
        p.text('of global GDP in 2019', rightX, baseY - coin * 5.4);
        p.textSize(11);
        p.fill(111, 131, 136, 145 * numberA);
        p.text('Source: WTTC', rightX, baseY - coin * 4.4);
        p.pop();
    }

    function drawPandemicBreak(p, manager, progress) {
        var a = segmentFade(progress, 0.72, 0.82, 0.9);
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
        var questionA = windowFade(progress, 0.92, 0.985);

        p.push();
        p.textAlign(p.CENTER, p.CENTER);
        p.noStroke();

        if (openingA > 0.01) {
            p.fill(21, 33, 36, 245 * openingA);
            p.textStyle(p.BOLD);
            p.textSize(Math.min(86, manager.canvasWidth * 0.058));
            drawWrappedText(p, 'Before 2020, global travel never stopped.', manager.canvasWidth / 2, manager.canvasHeight * 0.22, manager.canvasWidth * 0.8, 92);
        }

        if (connectedA > 0.01) {
            p.fill(21, 33, 36, 235 * connectedA);
            p.textStyle(p.BOLD);
            p.textSize(Math.min(62, manager.canvasWidth * 0.044));
            drawWrappedText(p, 'Travel connected people, cultures, and economies.', manager.canvasWidth / 2, manager.canvasHeight * 0.22, manager.canvasWidth * 0.78, 72);
        }

        if (questionA > 0.01) {
            p.fill(21, 33, 36, 245 * questionA);
            p.textStyle(p.BOLD);
            p.textSize(Math.min(78, manager.canvasWidth * 0.052));
            drawWrappedText(p, 'What happened to tourism through the pandemic?', manager.canvasWidth / 2, manager.canvasHeight * 0.5, manager.canvasWidth * 0.78, 86);
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

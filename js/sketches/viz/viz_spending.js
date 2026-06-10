// viz_spending.js
// U.S. travel spending recovery after the pandemic shock.
(function () {
    var COLORS = {
        bg: '#fbfefe',
        ink: '#123f4f',
        muted: '#5d7e86',
        faint: '#d9e2e8',
        axis: '#9ab3ba',
        grid: '#d7eeee',
        teal: '#2dbdb4',
        tealDark: '#187f7b',
        aqua: '#66e5df',
        mint: '#c8eded',
        sky: '#b1dff6',
        blue: '#81baf7',
        money: '#acffc9',
        spend: '#c75f72',
        spendLight: '#f4c5cf',
        spendDark: '#934452',
        covid: '#f49f86',
        paper: '#ffffff'
    };

    function parseCSV(text) {
        var lines = (text || '').trim().split(/\r?\n/);
        lines.shift();
        return lines.map(function (line) {
            var parts = line.split(',');
            return {
                year: +parts[0],
                spending: +parts[1]
            };
        }).filter(function (d) {
            return d.year && isFinite(d.spending);
        });
    }

    function formatMoney(value) {
        if (value >= 1000) return '$' + (value / 1000).toFixed(value >= 1000 ? 2 : 1).replace(/0$/, '').replace(/\.$/, '') + 'T';
        return '$' + Math.round(value) + 'B';
    }

    function formatPct(value) {
        var sign = value > 0 ? '+' : '';
        return sign + value.toFixed(0) + '%';
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function easeOut(t) {
        t = Math.max(0, Math.min(1, t));
        return 1 - Math.pow(1 - t, 3);
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

    function drawDollarIcon(p, x, y, r) {
        p.push();
        p.noStroke();
        p.fill(COLORS.spendLight);
        p.circle(x, y, r * 2);
        p.fill(COLORS.spendDark);
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(r * 1.15);
        p.text('$', x, y + 1);
        p.pop();
    }

    function drawHeader(p, x, y) {
        drawDollarIcon(p, x + 28, y + 30, 23);
        p.noStroke();
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(24);
        p.text('U.S. Travel Spending', x + 66, y + 7);
        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(12);
        p.text('Total travel spending, 2019-2024', x + 68, y + 39);
    }

    function pointFor(d, chart, minV, maxV, years) {
        var x = lerp(chart.x, chart.x + chart.w, (d.year - years[0]) / (years[years.length - 1] - years[0]));
        var y = lerp(chart.y + chart.h, chart.y, (d.spending - minV) / (maxV - minV));
        return { x: x, y: y };
    }

    function drawChart(p, state, x, y, w, h) {
        var rows = state.rows || [];
        if (!rows.length) {
            p.noStroke();
            p.fill(COLORS.muted);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(14);
            p.text('Loading spending data...', x + w / 2, y + h / 2);
            return;
        }

        var years = rows.map(function (d) { return d.year; });
        var minV = 0;
        var maxV = 1500;
        var baseline = rows.filter(function (d) { return d.year === 2019; })[0].spending;
        var chart = { x: x + 68, y: y + 38, w: w - 112, h: h - 112 };
        var progress = easeOut(Math.min(1, (Date.now() - (state.animStart || Date.now())) / 1800));

        p.push();
        var covidX0 = pointFor({ year: 2020, spending: minV }, chart, minV, maxV, years).x - chart.w / (years.length - 1) * 0.46;
        var covidX1 = pointFor({ year: 2021, spending: minV }, chart, minV, maxV, years).x + chart.w / (years.length - 1) * 0.46;
        p.fill(244, 159, 134, 50);
        p.rect(covidX0, chart.y, covidX1 - covidX0, chart.h, 0);
        p.fill('#d56f51');
        p.textStyle(p.BOLD);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(11);
        p.text('COVID shock', (covidX0 + covidX1) / 2, chart.y + 10);

        p.stroke(COLORS.grid);
        p.strokeWeight(1);
        p.textStyle(p.NORMAL);
        for (var tick = 0; tick <= 1500; tick += 300) {
            var ty = lerp(chart.y + chart.h, chart.y, (tick - minV) / (maxV - minV));
            p.line(chart.x, ty, chart.x + chart.w, ty);
            p.noStroke();
            p.fill(COLORS.muted);
            p.textAlign(p.RIGHT, p.CENTER);
            p.textSize(10);
            p.text(formatMoney(tick), chart.x - 10, ty);
            p.stroke(COLORS.grid);
        }

        var baselineY = lerp(chart.y + chart.h, chart.y, (baseline - minV) / (maxV - minV));
        p.stroke(COLORS.axis);
        p.strokeWeight(1.2);
        p.drawingContext.setLineDash([5, 7]);
        p.line(chart.x, baselineY, chart.x + chart.w, baselineY);
        p.drawingContext.setLineDash([]);
        p.noStroke();
        p.fill(COLORS.axis);
        p.textAlign(p.RIGHT, p.BOTTOM);
        p.textSize(10);
        p.text('2019 baseline', chart.x + chart.w, baselineY - 7);

        p.stroke(COLORS.spend);
        p.strokeWeight(3);
        var totalSegments = rows.length - 1;
        var drawAmount = progress * totalSegments;
        for (var lineIndex = 0; lineIndex < totalSegments; lineIndex++) {
            if (drawAmount <= lineIndex) break;
            var segmentProgress = Math.min(1, drawAmount - lineIndex);
            var a = pointFor(rows[lineIndex], chart, minV, maxV, years);
            var b = pointFor(rows[lineIndex + 1], chart, minV, maxV, years);
            p.line(a.x, a.y, lerp(a.x, b.x, segmentProgress), lerp(a.y, b.y, segmentProgress));
        }

        p.noStroke();
        rows.forEach(function (d, i) {
            var pt = pointFor(d, chart, minV, maxV, years);
            var appear = Math.max(0, Math.min(1, progress * rows.length - i));
            if (appear <= 0) return;
            var r = 5 + 2 * appear;
            p.fill(COLORS.bg);
            p.stroke(COLORS.spend);
            p.strokeWeight(2);
            p.circle(pt.x, pt.y, r);
            p.noStroke();

            p.fill(d.year === 2020 || d.year === 2021 ? '#d56f51' : COLORS.muted);
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(10);
            p.text(d.year, pt.x, chart.y + chart.h + 14);
        });

        p.stroke(COLORS.axis);
        p.strokeWeight(1.2);
        p.line(chart.x, chart.y + chart.h, chart.x + chart.w, chart.y + chart.h);
        p.line(chart.x, chart.y, chart.x, chart.y + chart.h);

        if (progress >= 0.98) {
            drawHover(p, rows, chart, minV, maxV, years, baseline, state.mouseX || -999, state.mouseY || -999);
        }
        p.pop();
    }

    function drawHover(p, rows, chart, minV, maxV, years, baseline, mouseX, mouseY) {
        var mx = mouseX;
        var my = mouseY;
        var nearest = null;
        var nearestDist = Infinity;
        rows.forEach(function (d) {
            var pt = pointFor(d, chart, minV, maxV, years);
            var dist = Math.hypot(mx - pt.x, my - pt.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = { row: d, pt: pt };
            }
        });
        if (!nearest || nearestDist > 34) return;

        var row = nearest.row;
        var pt = nearest.pt;
        var pct = ((row.spending - baseline) / baseline) * 100;
        var tw = 160;
        var th = 74;
        var tx = Math.min(pt.x + 16, p.width - tw - 16);
        if (tx < pt.x) tx = pt.x - tw - 16;
        var ty = Math.max(16, pt.y - th - 18);

        p.push();
        shadow(p, 14, 'rgba(21,64,72,0.14)', 0, 5);
        p.noStroke();
        p.fill(255);
        p.rect(tx, ty, tw, th, 8);
        noShadow(p);
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.text(row.year + ' spending', tx + 13, ty + 11);
        p.fill(COLORS.spend);
        p.textSize(20);
        p.text(formatMoney(row.spending), tx + 13, ty + 31);
        p.fill(COLORS.muted);
        p.textStyle(p.NORMAL);
        p.textSize(10);
        p.text(formatPct(pct) + ' vs. 2019', tx + 13, ty + 56);
        p.pop();
    }

    window.VizSpending = {
        setData: function (manager) {
            manager.spending = {
                rows: [],
                animStart: Date.now()
            };
            return fetch('data/us_travel_spending.csv')
                .then(function (response) { return response.text(); })
                .then(function (text) {
                    manager.spending.rows = parseCSV(text);
                    manager.spending.animStart = Date.now();
                    return manager.spending.rows;
                }).catch(function (err) {
                    console.error('spending data load failed', err);
                    return [];
                });
        },

        draw: function (p, manager) {
            var state = manager.spending || {};
            state.mouseX = p.mouseX - manager.margin.left;
            state.mouseY = p.mouseY - manager.margin.top;
            p.push();
            p.translate(manager.margin.left, manager.margin.top);
            p.background(COLORS.bg);

            var x = 10;
            var y = 12;
            var w = manager.width - 20;
            var h = manager.height - 24;

            drawHeader(p, x + 2, y + 2);

            drawChart(p, state, x, y + 54, w, h - 64);
            p.pop();
        }
    };
})();

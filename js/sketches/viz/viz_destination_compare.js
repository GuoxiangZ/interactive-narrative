// viz_destination_compare.js
// Compare recovery profiles for Hawaii and Cancun.
(function () {
    var COLORS = {
        bg: '#fbfefe',
        ink: '#123f4f',
        muted: '#5d7e86',
        axis: '#9ab3ba',
        grid: '#d7eeee',
        mint: '#c8eded',
        teal: '#2dbdb4',
        tealDark: '#187f7b',
        blue: '#81baf7',
        blueDark: '#376f9c',
        hawaii: '#7a5cff',
        cancun: '#d39a2e',
        covid: '#f49f86',
        spend: '#c75f72',
        card: '#ffffff'
    };

    var METRICS = [
        {
            key: 'arrivals',
            title: 'Air Arrivals',
            unit: 'M',
            min: 5200000,
            max: 10400000,
            format: function (v) { return (v / 1000000).toFixed(1) + 'M'; }
        },
        {
            key: 'occupancy',
            title: 'Hotel Occupancy',
            unit: '%',
            min: 0.48,
            max: 0.86,
            format: function (v) { return Math.round(v * 100) + '%'; }
        },
        {
            key: 'spending',
            title: 'Real Spend / Visitor',
            unit: '$',
            min: 1050,
            max: 2350,
            format: function (v) { return '$' + Math.round(v).toLocaleString(); }
        }
    ];

    function parseCSV(text) {
        var lines = (text || '').trim().split(/\r?\n/);
        lines.shift();
        return lines.map(function (line) {
            var parts = line.split(',').map(function (d) { return d.trim(); });
            return {
                city: parts[0],
                year: +parts[1],
                arrivals: +parts[2],
                occupancy: +parts[3],
                avgSpend: +parts[4],
                spending: +parts[5]
            };
        }).filter(function (d) {
            return d.city && d.year;
        });
    }

    function easeOut(t) {
        t = Math.max(0, Math.min(1, t));
        return 1 - Math.pow(1 - t, 3);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function phaseLabel(year) {
        if (year === 2018) return 'Pre-COVID';
        if (year === 2021) return 'During COVID';
        return 'Post-COVID';
    }

    function cityColor(city) {
        return city === 'Hawaii' ? COLORS.hawaii : COLORS.cancun;
    }

    function drawHeader(p, x, y) {
        p.noStroke();
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(24);
        p.text('Destination Travel and Spending Profiles', x, y);
    }

    function drawLegend(p, x, y) {
        p.noStroke();
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(11);
        p.textStyle(p.NORMAL);
        p.fill(cityColor('Hawaii'));
        p.circle(x, y, 9);
        p.fill(COLORS.muted);
        p.text('Hawaii', x + 12, y);
        p.fill(cityColor('Cancun'));
        p.circle(x + 88, y, 9);
        p.fill(COLORS.muted);
        p.text('Cancun', x + 100, y);
    }

    function pointFor(row, metric, chart, years) {
        var x = lerp(chart.x, chart.x + chart.w, (row.year - years[0]) / (years[years.length - 1] - years[0]));
        var y = lerp(chart.y + chart.h, chart.y, (row[metric.key] - metric.min) / (metric.max - metric.min));
        return { x: x, y: y };
    }

    function drawMetric(p, rows, metric, x, y, w, h, progress, mouse) {
        var years = [2018, 2021, 2024];
        var chart = { x: x + 54, y: y + 48, w: w - 82, h: h - 96 };
        var hovered = null;

        p.noStroke();
        p.fill(metric.key === 'spending' ? COLORS.spend : COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(14);
        p.text(metric.title, x + 16, y + 14);

        var covidX = pointFor({ year: 2021, arrivals: metric.min, occupancy: metric.min, spending: metric.min }, metric, chart, years).x;
        p.fill(244, 159, 134, 34);
        p.rect(covidX - 26, chart.y, 52, chart.h, 6);

        p.stroke(COLORS.grid);
        p.strokeWeight(1);
        for (var i = 0; i < 3; i++) {
            var gy = lerp(chart.y, chart.y + chart.h, i / 2);
            p.line(chart.x, gy, chart.x + chart.w, gy);
        }

        p.stroke(COLORS.axis);
        p.strokeWeight(1.1);
        p.line(chart.x, chart.y + chart.h, chart.x + chart.w, chart.y + chart.h);
        p.line(chart.x, chart.y, chart.x, chart.y + chart.h);

        ['Hawaii', 'Cancun'].forEach(function (city) {
            var cityRows = rows.filter(function (d) { return d.city === city; });
            var drawAmount = progress * (cityRows.length - 1);
            p.stroke(cityColor(city));
            p.strokeWeight(2.6);
            for (var j = 0; j < cityRows.length - 1; j++) {
                if (drawAmount <= j) break;
                var t = Math.min(1, drawAmount - j);
                var a = pointFor(cityRows[j], metric, chart, years);
                var b = pointFor(cityRows[j + 1], metric, chart, years);
                p.line(a.x, a.y, lerp(a.x, b.x, t), lerp(a.y, b.y, t));
            }

            cityRows.forEach(function (row, idx) {
                var appear = Math.max(0, Math.min(1, progress * cityRows.length - idx));
                if (appear <= 0) return;
                var pt = pointFor(row, metric, chart, years);
                var distToMouse = Math.sqrt(Math.pow(mouse.x - pt.x, 2) + Math.pow(mouse.y - pt.y, 2));
                if (distToMouse <= 11 && (!hovered || distToMouse < hovered.distance)) {
                    hovered = {
                        city: city,
                        row: row,
                        metric: metric,
                        point: pt,
                        distance: distToMouse
                    };
                }
                p.fill(COLORS.bg);
                p.stroke(cityColor(city));
                p.strokeWeight(2);
                p.circle(pt.x, pt.y, (hovered && hovered.row === row && hovered.city === city && hovered.metric === metric) ? 12 : 7 + appear * 2);
            });
        });

        p.noStroke();
        years.forEach(function (year) {
            var xPos = pointFor({ year: year, arrivals: metric.min, occupancy: metric.min, spending: metric.min }, metric, chart, years).x;
            p.fill(year === 2021 ? '#d56f51' : COLORS.muted);
            p.textAlign(p.CENTER, p.TOP);
            p.textStyle(year === 2021 ? p.BOLD : p.NORMAL);
            p.textSize(10);
            p.text(String(year).slice(2), xPos, chart.y + chart.h + 12);
            p.textStyle(p.NORMAL);
            p.textSize(9);
            p.text(phaseLabel(year), xPos, chart.y + chart.h + 27);
        });

        p.fill(COLORS.muted);
        p.textAlign(p.RIGHT, p.TOP);
        p.textSize(10);
        p.text(metric.format(metric.max), chart.x - 8, chart.y - 4);
        p.textAlign(p.RIGHT, p.BOTTOM);
        p.text(metric.format(metric.min), chart.x - 8, chart.y + chart.h + 4);

        return hovered;
    }

    function drawTooltip(p, hover, localW, localH) {
        if (!hover) return;
        var metric = hover.metric;
        var row = hover.row;
        var lines = [
            hover.city,
            row.year + ' ' + metric.title,
            metric.format(row[metric.key])
        ];

        p.push();
        p.textStyle(p.NORMAL);
        p.textSize(11);
        var tw = Math.max(p.textWidth(lines[0]), p.textWidth(lines[1]), p.textWidth(lines[2])) + 24;
        var th = 66;
        var tx = hover.point.x + 14;
        var ty = hover.point.y - th - 12;
        if (tx + tw > localW - 10) tx = hover.point.x - tw - 14;
        if (ty < 10) ty = hover.point.y + 14;

        p.noStroke();
        p.fill(255, 255, 255, 245);
        p.rect(tx, ty, tw, th, 8);
        p.noFill();
        p.stroke(cityColor(hover.city));
        p.strokeWeight(1.2);
        p.rect(tx, ty, tw, th, 8);

        p.noStroke();
        p.fill(cityColor(hover.city));
        p.circle(tx + 14, ty + 17, 7);
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.text(lines[0], tx + 25, ty + 9);
        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(10);
        p.text(lines[1], tx + 12, ty + 30);
        p.fill(COLORS.ink);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.text(lines[2], tx + 12, ty + 46);
        p.pop();
    }

    window.VizDestinationCompare = {
        setData: function (manager) {
            manager.destinationCompare = {
                rows: [],
                animStart: Date.now()
            };
            return fetch('data/Hawaii_Cancun.csv')
                .then(function (response) { return response.text(); })
                .then(function (text) {
                    manager.destinationCompare.rows = parseCSV(text);
                    manager.destinationCompare.animStart = Date.now();
                    return manager.destinationCompare.rows;
                }).catch(function (err) {
                    console.error('destination data load failed', err);
                    return [];
                });
        },

        draw: function (p, manager) {
            var state = manager.destinationCompare || {};
            var rows = state.rows || [];
            var progress = easeOut(Math.min(1, (Date.now() - (state.animStart || Date.now())) / 1500));

            p.push();
            p.translate(manager.margin.left, manager.margin.top);
            p.background(COLORS.bg);

            var x = 12;
            var y = 12;
            var w = manager.width - 24;
            var h = manager.height - 24;
            drawHeader(p, x + 2, y + 4);
            drawLegend(p, x + w - 180, y + 24);

            if (!rows.length) {
                p.noStroke();
                p.fill(COLORS.muted);
                p.textAlign(p.CENTER, p.CENTER);
                p.text('Loading destination data...', x + w / 2, y + h / 2);
                p.pop();
                return;
            }

            var gap = 22;
            var panelW = Math.min(245, (w - gap * 2) / 3);
            var panelH = Math.min(270, h - 142);
            var totalW = panelW * 3 + gap * 2;
            var panelY = y + 118;
            var panelStartX = x + (w - totalW) / 2;
            var mouse = { x: p.mouseX - manager.margin.left, y: p.mouseY - manager.margin.top };
            var hover = null;
            METRICS.forEach(function (metric, i) {
                var candidate = drawMetric(p, rows, metric, panelStartX + i * (panelW + gap), panelY, panelW, panelH, progress, mouse);
                if (candidate && (!hover || candidate.distance < hover.distance)) hover = candidate;
            });
            drawTooltip(p, hover, manager.width, manager.height);
            p.pop();
        }
    };
})();

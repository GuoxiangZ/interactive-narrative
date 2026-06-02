// viz_tourism_galaxy.js
// Recovery bubble chart using the supplied tourism recovery data.
(function () {
    var COLORS = {
        bg: '#f7fbfb',
        card: '#ffffff',
        ink: '#0a4d52',
        muted: '#526d78',
        grid: '#d7e2e3',
        axis: '#6fafb0',
        threshold: '#5c9fa4',
        footer: '#dff5f3',
        sand: '#ede1cc',
        europe: '#4a90e2',
        asia: '#f5a33a',
        northAmerica: '#f56b54',
        southAmerica: '#a17bd8',
        africa: '#7bc96f',
        oceania: '#4ccbc3'
    };

    var YEARS = ['2019', '2021', '2024'];
    var X_DOMAIN = [0, 205];
    var Y_DOMAIN = [0, 260];

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function ease(t) {
        t = clamp(t, 0, 1);
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function seededUnit(seed) {
        var x = Math.sin(seed * 999.73) * 43758.5453123;
        return x - Math.floor(x);
    }

    function radiusFor(arrivals) {
        return clamp(4 + Math.sqrt(arrivals || 1) * 2.05, 5, 26);
    }

    function metricAt(row, key, year) {
        if (year === '2019') return 100;
        return row && row[key] ? +(row[key][year] || 0) : 0;
    }

    function yearStateFromSelection(state) {
        state = state || {};
        var fromIndex = clamp(typeof state.fromIndex === 'number' ? state.fromIndex : 2, 0, YEARS.length - 1);
        var targetIndex = clamp(typeof state.targetIndex === 'number' ? state.targetIndex : 2, 0, YEARS.length - 1);
        var elapsed = Date.now() - (state.transitionStart || 0);
        var duration = state.transitionDuration || 700;
        var amount = fromIndex === targetIndex ? 1 : ease(elapsed / duration);
        if (amount >= 1 && fromIndex !== targetIndex) {
            state.fromIndex = targetIndex;
        }
        return {
            from: YEARS[fromIndex],
            to: YEARS[targetIndex],
            t: amount,
            label: YEARS[targetIndex],
            targetIndex: targetIndex
        };
    }

    function valueFor(row, key, ys) {
        return metricAt(row, key, ys.from) + (metricAt(row, key, ys.to) - metricAt(row, key, ys.from)) * ys.t;
    }

    function buildYearOverlay(manager) {
        var vis = document.getElementById('vis');
        if (!vis) return;
        if (manager._tourismGalaxyOverlay && document.body.contains(manager._tourismGalaxyOverlay.root)) return;
        manager._tourismGalaxyOverlay = null;

        if (getComputedStyle(vis).position === 'static') {
            vis.style.position = 'fixed';
        }

        var overlay = document.createElement('div');
        overlay.className = 'worldmap-overlay tourism-galaxy-overlay';

        var buttons = document.createElement('div');
        buttons.className = 'tourism-galaxy-year-buttons';
        YEARS.forEach(function (year) {
            var button = document.createElement('button');
            button.type = 'button';
            button.textContent = year;
            button.dataset.yearIndex = String(YEARS.indexOf(year));
            button.setAttribute('aria-label', 'Show ' + year + ' tourism recovery');
            buttons.appendChild(button);
        });

        overlay.appendChild(buttons);
        vis.appendChild(overlay);

        buttons.addEventListener('click', function (event) {
            var button = event.target.closest('button');
            if (!button) return;
            var state = manager.tourismGalaxy;
            if (!state) return;
            var nextIndex = clamp(+button.dataset.yearIndex, 0, YEARS.length - 1);
            if (nextIndex === state.targetIndex) return;
            state.fromIndex = typeof state.targetIndex === 'number' ? state.targetIndex : 2;
            state.targetIndex = nextIndex;
            state.transitionStart = Date.now();
        });

        manager._tourismGalaxyOverlay = { root: overlay, buttons: buttons };
    }

    function layoutYearOverlay(manager) {
        var overlayState = manager._tourismGalaxyOverlay;
        var chart = manager.tourismGalaxy && manager.tourismGalaxy.sliderBox;
        if (!overlayState || !chart) return;
        var canvas = document.querySelector('#vis canvas');
        var canvasLeft = canvas ? canvas.offsetLeft : 0;
        var canvasTop = canvas ? canvas.offsetTop : 0;
        var width = Math.round(Math.max(240, Math.min(430, chart.w * 0.48)));
        overlayState.root.style.display = 'block';
        overlayState.root.style.width = width + 'px';
        overlayState.root.style.left = Math.round(canvasLeft + manager.margin.left + chart.x + (chart.w - width) / 2) + 'px';
        overlayState.root.style.top = Math.round(canvasTop + manager.margin.top + chart.y + chart.h + 54) + 'px';
    }

    function hideOverlay(manager) {
        if (manager && manager._tourismGalaxyOverlay) {
            manager._tourismGalaxyOverlay.root.style.display = 'none';
        }
    }

    function drawAxes(p, plot, xScale, yScale) {
        var compact = plot.w < 380;
        var ticksX = compact ? [0, 50, 100, 150, 200] : [0, 25, 50, 75, 100, 125, 150, 175, 200];
        var ticksY = compact ? [0, 50, 100, 150, 200, 250] : [0, 50, 100, 150, 200, 250];

        p.noStroke();
        p.fill(255, 255, 255, 150);
        p.rect(plot.x, plot.y, plot.w, plot.h, 4);

        p.stroke(COLORS.grid);
        p.strokeWeight(1);
        p.drawingContext.setLineDash([2, 3]);
        ticksX.forEach(function (t) { p.line(xScale(t), plot.y, xScale(t), plot.y + plot.h); });
        ticksY.forEach(function (t) { p.line(plot.x, yScale(t), plot.x + plot.w, yScale(t)); });
        p.drawingContext.setLineDash([]);

        p.stroke(COLORS.threshold);
        p.strokeWeight(1.4);
        p.drawingContext.setLineDash([7, 8]);
        p.line(xScale(100), plot.y, xScale(100), plot.y + plot.h);
        p.line(plot.x, yScale(100), plot.x + plot.w, yScale(100));
        p.drawingContext.setLineDash([]);

        p.stroke(COLORS.axis);
        p.strokeWeight(1.2);
        p.line(plot.x, plot.y + plot.h, plot.x + plot.w + 8, plot.y + plot.h);
        p.line(plot.x, plot.y + plot.h, plot.x, plot.y - 8);

        p.noStroke();
        p.fill(COLORS.muted);
        p.textSize(compact ? 9 : 11);
        p.textStyle(p.NORMAL);
        ticksX.forEach(function (t) {
            p.textAlign(p.CENTER, p.TOP);
            p.text(t + '%', xScale(t), plot.y + plot.h + 12);
        });
        ticksY.forEach(function (t) {
            p.textAlign(p.RIGHT, p.CENTER);
            p.text(t + '%', plot.x - 12, yScale(t));
        });

        p.fill(COLORS.ink);
        p.textSize(compact ? 10 : 15);
        p.textAlign(p.CENTER, p.TOP);
        p.text('Arrival recovery vs 2019', plot.x + plot.w / 2, plot.y + plot.h + 38);
        p.push();
        p.translate(plot.x - (compact ? 44 : 52), plot.y + plot.h / 2);
        p.rotate(-Math.PI / 2);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Tourism receipts recovery vs 2019', 0, 0);
        p.pop();
    }

    function displayRegion(row) {
        var sub = row.subregion || '';
        var region = row.region || '';
        var country = row.country || '';
        if (region === 'Europe') return 'Europe';
        if (region === 'Africa') return 'Africa';
        if (region === 'Middle East') return 'Asia';
        if (/Australia|New Zealand|Oceania|Pacific/i.test(country + ' ' + sub)) return 'Oceania';
        if (/South America/i.test(sub)) return 'South America';
        if (/North America|Caribbean|Central America/i.test(sub)) return 'North America';
        if (region === 'Americas') return 'North America';
        if (region === 'Asia-Pacific') return 'Asia';
        return region || 'Asia';
    }

    function regionColor(rowOrName) {
        var name = typeof rowOrName === 'string' ? rowOrName : displayRegion(rowOrName);
        if (name === 'Europe') return COLORS.europe;
        if (name === 'Asia') return COLORS.asia;
        if (name === 'North America') return COLORS.northAmerica;
        if (name === 'South America') return COLORS.southAmerica;
        if (name === 'Africa') return COLORS.africa;
        if (name === 'Oceania') return COLORS.oceania;
        return COLORS.asia;
    }

    function drawPanel(p, x, y, w, h) {
        p.push();
        p.noStroke();
        p.drawingContext.shadowBlur = 12;
        p.drawingContext.shadowColor = 'rgba(10, 77, 82, 0.10)';
        p.drawingContext.shadowOffsetY = 4;
        p.fill(COLORS.card);
        p.rect(x, y, w, h, 12);
        p.drawingContext.shadowBlur = 0;
        p.noFill();
        p.stroke(215, 226, 227, 210);
        p.strokeWeight(1);
        p.rect(x, y, w, h, 12);
        p.pop();
    }

    function drawLegend(p, x, y, w) {
        drawPanel(p, x, y, w, 220);
        p.noStroke();
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(14);
        p.text('Continent', x + 18, y + 18);
        var items = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];
        items.forEach(function (name, i) {
            var yy = y + 54 + i * 28;
            p.fill(regionColor(name));
            p.stroke(regionColor(name));
            p.strokeWeight(1);
            p.circle(x + 28, yy, 16);
            p.noStroke();
            p.fill(COLORS.ink);
            p.textStyle(p.NORMAL);
            p.textSize(12);
            p.text(name, x + 48, yy - 8);
        });
    }

    function drawRankGuide(p, x, y, w) {
        drawPanel(p, x, y, w, 185);
        p.noStroke();
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.text('World Tourism Rank', x + 18, y + 18);
        p.textStyle(p.NORMAL);
        p.textSize(11);
        p.text('(Bubble Size Guide)', x + 18, y + 36);
        [
            { r: 8, label: 'Rank #20' },
            { r: 13, label: 'Rank #10' },
            { r: 18, label: 'Rank #5' }
        ].forEach(function (item, i) {
            var yy = y + 70 + i * 33;
            p.fill(160, 166, 171, 120);
            p.stroke(136, 142, 148, 120);
            p.strokeWeight(1);
            p.circle(x + 34, yy, item.r * 2);
            p.noStroke();
            p.fill(COLORS.muted);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(11);
            p.text(item.label, x + 68, yy);
        });
    }

    function drawTooltip(p, row, x, y, ys, w, h) {
        if (!row) return;
        var arrival = Math.round(valueFor(row, 'arrivalRecovery', ys));
        var receipt = Math.round(valueFor(row, 'receiptRecovery', ys));
        var lines = [
            row.country,
            row.region,
            'Arrivals ' + arrival + '%  |  Receipts ' + receipt + '%'
        ];
        p.push();
        p.textSize(12);
        var tw = Math.max(p.textWidth(lines[0]), p.textWidth(lines[1]), p.textWidth(lines[2])) + 28;
        var th = 78;
        var tx = x + 18;
        var ty = y - th - 16;
        if (tx + tw > w - 12) tx = x - tw - 18;
        if (ty < 12) ty = y + 16;
        p.noStroke();
        p.fill(255, 255, 255, 245);
        p.rect(tx, ty, tw, th, 8);
        p.noFill();
        p.stroke(regionColor(row));
        p.strokeWeight(1.2);
        p.rect(tx, ty, tw, th, 8);
        p.noStroke();
        p.fill(regionColor(row));
        p.circle(tx + 16, ty + 18, 8);
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.text(lines[0], tx + 28, ty + 10);
        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(11);
        p.text(lines[1], tx + 14, ty + 34);
        p.fill(COLORS.ink);
        p.textSize(12);
        p.text(lines[2], tx + 14, ty + 54);
        p.pop();
    }

    window.VizTourismGalaxy = {
        setData: function (manager) {
            manager.tourismGalaxy = {
                rows: [],
                animStart: Date.now(),
                fromIndex: 2,
                targetIndex: 2,
                transitionStart: Date.now(),
                transitionDuration: 700,
                dragging: false
            };
            return fetch('data/tourism_recovery_galaxy.json?v=20260601-audited')
                .then(function (response) { return response.json(); })
                .then(function (rows) {
                    manager.tourismGalaxy.rows = Array.isArray(rows) ? rows : [];
                    manager.tourismGalaxy.animStart = Date.now();
                    return manager.tourismGalaxy.rows;
                }).catch(function (err) {
                    console.error('tourism galaxy data load failed', err);
                    return [];
                });
        },

        draw: function (p, manager) {
            var state = manager.tourismGalaxy || {};
            var rows = state.rows || [];
            var w = manager.width;
            var h = manager.height;
            var now = Date.now() - (state.animStart || 0);

            p.push();
            p.translate(manager.margin.left, manager.margin.top);
            p.background(COLORS.bg);

            var compact = w < 760;
            var plot = compact ? {
                x: 58,
                y: 94,
                w: Math.max(220, w - 86),
                h: Math.max(210, h - 216)
            } : {
                x: Math.max(82, w * 0.075),
                y: Math.max(92, h * 0.15),
                w: w - Math.max(260, w * 0.29),
                h: h - Math.max(222, h * 0.36)
            };
            var legendX = plot.x + plot.w + 34;
            var legendW = Math.max(150, Math.min(220, w - legendX - 24));
            var xScale = function (value) {
                return plot.x + ((value - X_DOMAIN[0]) / (X_DOMAIN[1] - X_DOMAIN[0])) * plot.w;
            };
            var yScale = function (value) {
                return plot.y + plot.h - ((value - Y_DOMAIN[0]) / (Y_DOMAIN[1] - Y_DOMAIN[0])) * plot.h;
            };

            drawAxes(p, plot, xScale, yScale);

            var ys = yearStateFromSelection(manager.tourismGalaxy);

            p.noStroke();
            p.fill(COLORS.ink);
            p.textAlign(p.LEFT, p.TOP);
            p.textStyle(p.BOLD);
            p.textSize(compact ? 18 : Math.max(26, Math.min(40, w * 0.04)));
            p.text(ys.label + ' Tourism Recovery vs 2019', plot.x, compact ? 14 : 20);
            if (manager.tourismGalaxy) manager.tourismGalaxy.sliderBox = plot;
            buildYearOverlay(manager);
            layoutYearOverlay(manager);

            var overlayState = manager._tourismGalaxyOverlay;
            if (overlayState) {
                var selectedIndex = ys.targetIndex;
                Array.prototype.forEach.call(overlayState.buttons.querySelectorAll('button'), function (button) {
                    button.classList.toggle('is-selected', +button.dataset.yearIndex === selectedIndex);
                });
            }

            if (!rows.length) {
                p.fill(COLORS.muted);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(14);
                p.text('Loading galaxy data...', w / 2, h / 2);
                p.pop();
                return;
            }

            var mouse = { x: p.mouseX - manager.margin.left, y: p.mouseY - manager.margin.top };
            var hovered = null;
            rows.forEach(function (row, i) {
                var x = xScale(valueFor(row, 'arrivalRecovery', ys));
                var y = yScale(valueFor(row, 'receiptRecovery', ys));
                var r = radiusFor(row.arrivals2024Millions);
                var drift = 0;
                var distance = Math.sqrt(Math.pow(mouse.x - x, 2) + Math.pow(mouse.y - y, 2));
                if (distance <= r + 6 && (!hovered || distance < hovered.distance)) {
                    hovered = { row: row, x: x, y: y, distance: distance };
                }

                var c = regionColor(row);
                p.drawingContext.shadowBlur = hovered && hovered.row === row ? 12 : 6;
                p.drawingContext.shadowColor = 'rgba(10, 77, 82, 0.16)';
                p.noStroke();
                p.fill(c);
                p.drawingContext.globalAlpha = hovered && hovered.row === row ? 0.88 : 0.70;
                p.circle(x, y + drift, r * 2);
                p.drawingContext.shadowBlur = 0;
                p.drawingContext.globalAlpha = 0.35;
                p.fill(255);
                p.circle(x - r * 0.28, y + drift - r * 0.32, Math.max(2, r * 0.40));
                p.drawingContext.globalAlpha = 1;
                p.noFill();
                p.stroke(c);
                p.strokeWeight(1.2);
                p.circle(x, y + drift, r * 2);
            });

            rows.filter(function (row) { return row.isCallout && row.labelOffset; }).forEach(function (row) {
                var x = xScale(valueFor(row, 'arrivalRecovery', ys));
                var y = yScale(valueFor(row, 'receiptRecovery', ys));
                var dx = row.labelOffset.dx * 0.78;
                var dy = row.labelOffset.dy * 0.78;
                var lx = clamp(x + dx, plot.x + 8, plot.x + plot.w - 8);
                var ly = clamp(y + dy, plot.y + 10, plot.y + plot.h - 10);
                p.stroke(100, 142, 148, 150);
                p.strokeWeight(1);
                p.line(x, y, lx, ly);
                p.noStroke();
                p.fill(COLORS.ink);
                p.textAlign(dx < 0 ? p.RIGHT : p.LEFT, p.CENTER);
                p.textStyle(p.BOLD);
                p.textSize(12);
                p.text(row.country, lx, ly);
            });

            if (!compact) {
                drawLegend(p, legendX, plot.y + 8, legendW);
                drawRankGuide(p, legendX, plot.y + 244, legendW);
            }

            if (hovered) {
                drawTooltip(p, hovered.row, hovered.x, hovered.y, ys, w, h);
            }
            p.pop();
        },

        hideOverlay: hideOverlay
    };
})();

// viz_worldmap.js
// Interactive choropleth for inbound tourist arrivals, 2018-2024.
(function () {
    var YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
    var COLORS = {
        water: '#fbfefe',
        landNoData: '#d9e2e8',
        mapStroke: '#ffffff',
        text: '#152124',
        muted: '#6f8388',
        light: '#c8eded',
        mid: '#66e5df',
        dark: '#5fa9ab',
        darker: '#347f82',
        time: '#b1dff6',
        country: '#81baf7',
        covid: '#f49f86'
    };

    var ARRIVAL_BINS = [
        { min: 0, max: 1000000, label: '<1M', color: '#c8eded' },
        { min: 1000000, max: 5000000, label: '1-5M', color: '#a5ece8' },
        { min: 5000000, max: 15000000, label: '5-15M', color: '#66e5df' },
        { min: 15000000, max: 40000000, label: '15-40M', color: '#5fa9ab' },
        { min: 40000000, max: Infinity, label: '40M+', color: '#347f82' }
    ];

    var NAME_ALIASES = {
        'United States of America': 'United States',
        'Dem. Rep. Congo': 'Democratic Republic of Congo',
        'Democratic Republic of the Congo': 'Democratic Republic of Congo',
        'Republic of Congo': 'Congo',
        'Côte d\'Ivoire': "Cote d'Ivoire",
        'Bosnia and Herz.': 'Bosnia and Herzegovina',
        'Dominican Rep.': 'Dominican Republic',
        'Central African Rep.': 'Central African Republic',
        'Eq. Guinea': 'Equatorial Guinea',
        'eSwatini': 'Eswatini',
        'Solomon Is.': 'Solomon Islands',
        'S. Sudan': 'South Sudan',
        'Lao PDR': 'Laos',
        'Korea': 'South Korea',
        'Republic of Korea': 'South Korea',
        'Vietnam': 'Viet Nam',
        'Russia': 'Russia',
        'Turkey': 'Turkey',
        'United Republic of Tanzania': 'Tanzania',
        'Tanzania, United Republic of': 'Tanzania',
        'Palestine': 'Palestine',
        'Brunei Darussalam': 'Brunei',
        'Bahamas, The': 'Bahamas',
        'Gambia, The': 'Gambia',
        'Cape Verde': 'Cape Verde',
        'Timor-Leste': 'East Timor',
        'Venezuela': 'Venezuela',
        'Bolivia': 'Bolivia',
        'Iran': 'Iran',
        'Syria': 'Syria',
        'Moldova': 'Moldova',
        'Macedonia': 'North Macedonia',
        'Kosovo': 'Kosovo'
    };

    function normalizeName(name) {
        return (name || '')
            .replace(/^The\s+/i, '')
            .replace(/\s*\(.+\)\s*/g, '')
            .replace(/&/g, 'and')
            .trim();
    }

    function parseCSV(text) {
        var lines = (text || '').trim().split(/\r?\n/);
        var header = lines.shift().split(',');
        var entityIndex = header.indexOf('Entity');
        var codeIndex = header.indexOf('Code');
        var yearIndex = header.indexOf('Year');
        var valueIndex = header.indexOf('Arrivals of tourists from abroad');
        return lines.map(function (line) {
            var parts = line.split(',');
            return {
                entity: parts[entityIndex],
                code: parts[codeIndex],
                year: +parts[yearIndex],
                value: +parts[valueIndex]
            };
        }).filter(function (d) {
            return d.entity && d.year && isFinite(d.value);
        });
    }

    function formatArrival(value) {
        if (!isFinite(value)) return 'No data';
        if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 1 : 2).replace(/\.0$/, '') + 'M';
        if (value >= 1000) return (value / 1000).toFixed(value >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'K';
        return String(Math.round(value));
    }

    function colorForValue(value) {
        if (!isFinite(value) || value <= 0) return COLORS.landNoData;
        for (var i = 0; i < ARRIVAL_BINS.length; i++) {
            var bin = ARRIVAL_BINS[i];
            if (value >= bin.min && value < bin.max) return bin.color;
        }
        return COLORS.darker;
    }

    function getCountryRecord(worldMap, rawName, year) {
        var dataName = NAME_ALIASES[rawName] || NAME_ALIASES[normalizeName(rawName)] || rawName;
        var candidates = [
            dataName,
            normalizeName(dataName),
            rawName,
            normalizeName(rawName)
        ];

        for (var i = 0; i < candidates.length; i++) {
            var name = candidates[i];
            if (name && worldMap.byNameYear && worldMap.byNameYear[name] && worldMap.byNameYear[name][year] !== undefined) {
                return { name: name, value: worldMap.byNameYear[name][year] };
            }
        }

        return { name: dataName || rawName, value: undefined };
    }

    function buildOverlay(manager) {
        var vis = document.getElementById('vis');
        if (!vis) return;
        if (manager._worldMapOverlay && document.body.contains(manager._worldMapOverlay.root)) return;
        manager._worldMapOverlay = null;

        if (getComputedStyle(vis).position === 'static') {
            vis.style.position = 'fixed';
        }

        var overlay = document.createElement('div');
        overlay.className = 'worldmap-overlay';

        var label = document.createElement('div');
        label.className = 'worldmap-year-label';
        label.textContent = '2018';

        var range = document.createElement('input');
        range.type = 'range';
        range.min = '2018';
        range.max = '2024';
        range.step = '1';
        range.value = '2018';
        range.className = 'worldmap-year-range';
        range.setAttribute('aria-label', 'Select year');

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
            manager.worldMap.selectedYear = +range.value;
            label.textContent = range.value;
        });

        manager._worldMapOverlay = { root: overlay, range: range, label: label };
    }

    function layoutOverlay(manager) {
        if (!manager._worldMapOverlay) return;
        var overlay = manager._worldMapOverlay.root;
        var map = manager.worldMap && manager.worldMap.mapBox;
        if (!map) return;
        var canvas = document.querySelector('#vis canvas');
        var canvasLeft = canvas ? canvas.offsetLeft : 0;
        var canvasTop = canvas ? canvas.offsetTop : 0;
        overlay.style.left = Math.round(canvasLeft + manager.margin.left + map.x + 22) + 'px';
        overlay.style.top = Math.round(canvasTop + manager.margin.top + map.y + map.h - 28) + 'px';
        overlay.style.width = Math.round(Math.min(330, map.w * 0.46)) + 'px';
    }

    function currentYear(manager) {
        return manager.worldMap && manager.worldMap.selectedYear ? manager.worldMap.selectedYear : 2018;
    }

    window.VizWorldMap = {
        setData: function (manager) {
            manager.worldMap = {
                selectedYear: 2018,
                rows: [],
                byNameYear: {},
                maxValue: 1,
                countries: [],
                hovered: null,
                mapBox: null
            };

            var dataPromise = fetch('data/World_traveler_data.csv')
                .then(function (response) { return response.text(); })
                .then(parseCSV);

            var mapPromise = fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
                .then(function (response) { return response.json(); });

            return Promise.all([dataPromise, mapPromise]).then(function (results) {
                var rows = results[0];
                var world = results[1];
                var byNameYear = {};
                var maxValue = 1;

                rows.forEach(function (row) {
                    if (!byNameYear[row.entity]) byNameYear[row.entity] = {};
                    if (!byNameYear[normalizeName(row.entity)]) byNameYear[normalizeName(row.entity)] = {};
                    byNameYear[row.entity][row.year] = row.value;
                    byNameYear[normalizeName(row.entity)][row.year] = row.value;
                    maxValue = Math.max(maxValue, row.value);
                });

                manager.worldMap.rows = rows;
                manager.worldMap.byNameYear = byNameYear;
                manager.worldMap.maxValue = maxValue;
                manager.worldMap.countries = topojson.feature(world, world.objects.countries).features;
                buildOverlay(manager);
                return manager.worldMap;
            }).catch(function (err) {
                console.error('world map load failed', err);
                return manager.worldMap;
            });
        },

        draw: function (p, manager) {
            buildOverlay(manager);

            var wm = manager.worldMap || {};
            var year = currentYear(manager);
            if (manager._worldMapOverlay) {
                manager._worldMapOverlay.root.style.display = 'block';
                manager._worldMapOverlay.range.value = String(year);
                manager._worldMapOverlay.label.textContent = String(year);
            }

            p.push();
            p.translate(manager.margin.left, manager.margin.top);
            p.background(COLORS.water);

            var x = 10;
            var y = 10;
            var w = manager.width - 20;
            var h = manager.height - 48;
            wm.mapBox = { x: x, y: y, w: w, h: h };
            layoutOverlay(manager);

            p.noStroke();
            p.fill(COLORS.text);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(16);
            p.textStyle(p.BOLD);
            p.text('Inbound Tourism Arrivals', x + 22, y + 4);
            p.textStyle(p.NORMAL);
            p.fill(COLORS.muted);
            p.textSize(11);
            p.text('Darker teal means more visitors from abroad. Gray countries have no data.', x + 22, y + 26);

            if (!wm.countries || !wm.countries.length || typeof d3 === 'undefined') {
                p.fill(COLORS.muted);
                p.textSize(14);
                p.textAlign(p.CENTER, p.CENTER);
                p.text('Loading map...', x + w / 2, y + h / 2);
                p.pop();
                return;
            }

            var projection = d3.geoNaturalEarth1();
            projection.fitExtent([[x + 10, y + 48], [x + w - 10, y + h - 58]], { type: 'Sphere' });
            var ctx = p.drawingContext;
            var path = d3.geoPath(projection, ctx);
            var mx = p.mouseX - manager.margin.left;
            var my = p.mouseY - manager.margin.top;
            var hovered = null;

            ctx.save();
            wm.countries.forEach(function (feature) {
                var rawName = feature.properties && feature.properties.name;
                var record = getCountryRecord(wm, rawName, year);
                var value = record.value;
                var fill = colorForValue(value);

                ctx.beginPath();
                path(feature);
                ctx.fillStyle = fill;
                ctx.fill();
                ctx.strokeStyle = COLORS.mapStroke;
                ctx.lineWidth = 0.65;
                ctx.stroke();

                if (!hovered && mx >= x && mx <= x + w && my >= y && my <= y + h && d3.geoContains(feature, projection.invert([mx, my]))) {
                    hovered = { feature: feature, name: record.name || rawName, rawName: rawName, value: value };
                }
            });
            ctx.restore();

            if (hovered) {
                ctx.save();
                ctx.beginPath();
                path(hovered.feature);
                ctx.fillStyle = 'rgba(129, 186, 247, 0.36)';
                ctx.fill();
                ctx.strokeStyle = COLORS.country;
                ctx.lineWidth = 1.6;
                ctx.stroke();
                ctx.restore();
            }

            drawLegend(p, x + w - 254, y + h - 48);
            drawTooltip(p, hovered, mx, my, year, manager.width, manager.height);
            p.pop();
        },

        hideOverlay: function (manager) {
            if (manager._worldMapOverlay) manager._worldMapOverlay.root.style.display = 'none';
        }
    };

    function drawLegend(p, x, y) {
        var boxW = 38;
        var boxH = 11;
        p.noStroke();
        p.fill(COLORS.muted);
        p.textSize(10);
        p.textAlign(p.LEFT, p.TOP);
        p.text('Arrivals', x, y - 16);
        for (var i = 0; i < ARRIVAL_BINS.length; i++) {
            var bin = ARRIVAL_BINS[i];
            p.fill(bin.color);
            p.rect(x + i * boxW, y, boxW, boxH);
            p.fill(COLORS.muted);
            p.textAlign(p.CENTER, p.TOP);
            p.text(bin.label, x + i * boxW + boxW / 2, y + 16);
        }
    }

    function drawTooltip(p, hovered, mx, my, year, localWidth, localHeight) {
        if (!hovered) return;
        var title = hovered.name || hovered.rawName || 'Country';
        var value = formatArrival(hovered.value);
        var lines = [title, year + ': ' + value + ' arrivals'];
        p.textSize(13);
        var tw = Math.max(p.textWidth(lines[0]), p.textWidth(lines[1])) + 28;
        var th = 58;
        var rightLimit = (localWidth || p.width) - 12;
        var bottomLimit = (localHeight || p.height) - 12;
        var tx = mx + 16;
        var ty = my - th - 14;

        if (tx + tw > rightLimit) tx = mx - tw - 16;
        tx = Math.max(12, Math.min(tx, rightLimit - tw));
        ty = Math.max(12, Math.min(ty, bottomLimit - th));

        p.noStroke();
        p.fill(255);
        p.rect(tx, ty, tw, th, 8);
        p.stroke('#b1dff6');
        p.strokeWeight(1);
        p.noFill();
        p.rect(tx, ty, tw, th, 8);

        p.noStroke();
        p.fill(COLORS.text);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.textAlign(p.LEFT, p.TOP);
        p.text(lines[0], tx + 14, ty + 10);
        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(12);
        p.text(lines[1], tx + 14, ty + 32);
    }
})();

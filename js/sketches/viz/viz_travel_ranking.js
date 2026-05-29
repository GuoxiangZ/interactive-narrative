// viz_travel_ranking.js
// Static center blocks for the destination ranking game. p5 interaction can be added on top.
(function () {
    var ASSET_ROOT = 'assets/travel_ranking_figma_design/assets/icons/';
    var COLORS = {
        bg: '#fbfefe',
        ink: '#102A43',
        muted: '#65778A',
        teal: '#007C78',
        tealDark: '#005E60',
        tealLight: '#D9F3EE',
        line: '#CBD8E3',
        dash: '#95B8C6',
        panel: '#FFFFFF',
        panelSoft: '#F8FBFC',
        restricted: '#EEF4F7',
        red: '#C83232'
    };

    var ICONS = {
        'France': { src: 'france_eiffel.svg', color: '#0F5A9C' },
        'U.S.': { src: 'us_statue.svg', color: '#C83232' },
        'Japan': { src: 'japan_torii.svg', color: '#5B368A' },
        'Mexico': { src: 'mexico_pyramid.svg', color: '#087F4F' },
        'Spain': { src: 'spain_sagrada.svg', color: '#B66A1E' },
        'Canada': { src: 'canada_cn_maple.svg', color: '#C83232' },
        'Australia': { src: 'australia_opera.svg', color: '#0F5A9C' },
        'Turkey': { src: 'turkey_mosque.svg', color: '#087E92' }
    };

    var PRE = ['France', 'U.S.', 'Japan', 'Mexico', 'Spain'];
    var DURING = ['Japan', 'Mexico', 'U.S.', 'Turkey', 'Australia'];
    var BANK = ['Japan', 'Canada', 'U.S.', 'Australia', 'Turkey'];

    function domImage(src) {
        var img = new Image();
        img.src = src;
        return img;
    }

    function iconFor(manager, country) {
        return manager.travelRanking && manager.travelRanking.icons[country];
    }

    function drawIcon(p, img, x, y, size, tintColor) {
        p.push();
        if (img && img.complete && img.naturalWidth) {
            p.drawingContext.drawImage(img, x, y, size, size);
        } else {
            p.noFill();
            p.stroke(tintColor || COLORS.teal);
            p.strokeWeight(1.7);
            p.rect(x + size * 0.18, y + size * 0.18, size * 0.64, size * 0.64, 4);
            p.line(x + size * 0.27, y + size * 0.70, x + size * 0.73, y + size * 0.30);
        }
        p.pop();
    }

    function shadow(p, blur, color, ox, oy) {
        var ctx = p.drawingContext;
        ctx.shadowBlur = blur || 12;
        ctx.shadowColor = color || 'rgba(16,42,67,0.08)';
        ctx.shadowOffsetX = ox || 0;
        ctx.shadowOffsetY = oy || 4;
    }

    function noShadow(p) {
        var ctx = p.drawingContext;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    function dashedRect(p, x, y, w, h, r, color) {
        var ctx = p.drawingContext;
        ctx.save();
        ctx.setLineDash([7, 6]);
        ctx.strokeStyle = color || COLORS.dash;
        ctx.lineWidth = 1.4;
        roundRectPath(ctx, x, y, w, h, r);
        ctx.stroke();
        ctx.restore();
    }

    function roundRectPath(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function panel(p, x, y, w, h, accent, dashed) {
        p.push();
        shadow(p, 12, 'rgba(16,42,67,0.06)', 0, 5);
        p.fill(COLORS.panel);
        p.stroke(accent || COLORS.teal);
        p.strokeWeight(1.4);
        p.rect(x, y, w, h, 18);
        noShadow(p);
        if (dashed) dashedRect(p, x + 2, y + 2, w - 4, h - 4, 16, COLORS.dash);
        p.pop();
    }

    function header(p, x, y, num, title, badge, muted) {
        p.noStroke();
        p.fill(muted ? COLORS.muted : COLORS.teal);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(31);
        p.text(num, x, y);
        p.textSize(18);
        p.text(title, x + 60, y + 7);
        p.textStyle(p.NORMAL);
        p.fill(muted ? '#DCE7EE' : COLORS.tealLight);
        p.rect(x + 62, y + 42, 118, 28, 999);
        p.fill(muted ? '#65778A' : COLORS.teal);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(11);
        p.text(badge, x + 121, y + 56);
    }

    function rankBadge(p, x, y, rank) {
        p.fill('#F7FCFD');
        p.stroke('#8FD2D0');
        p.strokeWeight(1.2);
        p.ellipse(x, y, 36, 36);
        p.noStroke();
        p.fill(COLORS.teal);
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.NORMAL);
        p.textSize(17);
        p.text(String(rank), x, y + 1);
    }

    function row(p, manager, x, y, w, h, rank, country, muted) {
        var icon = ICONS[country];
        rankBadge(p, x + 22, y + h / 2, rank);
        p.fill(muted ? COLORS.panelSoft : COLORS.panel);
        p.stroke(muted ? COLORS.line : '#B9D2DF');
        p.strokeWeight(1.2);
        p.rect(x + 55, y, w - 55, h, 10);
        p.noStroke();
        p.fill(muted ? COLORS.muted : (icon && icon.color) || COLORS.ink);
        p.textAlign(p.LEFT, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(18);
        p.text(country.toUpperCase(), x + 82, y + h / 2 + 1);
        drawIcon(p, iconFor(manager, country), x + w - 55, y + 10, h - 20, icon && icon.color);
    }

    function slot(p, x, y, w, h, rank) {
        rankBadge(p, x - 26, y + h / 2, rank);
        p.fill('rgba(255,255,255,0.72)');
        p.stroke(COLORS.dash);
        p.strokeWeight(1.2);
        dashedRect(p, x, y, w, h, 10, COLORS.dash);
        p.noStroke();
        p.fill(COLORS.muted);
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.NORMAL);
        p.textSize(13);
        p.text('Drag a destination here', x + w / 2, y + h / 2);
    }

    function chip(p, manager, x, y, w, h, country) {
        var icon = ICONS[country];
        p.fill(COLORS.panel);
        p.stroke((icon && icon.color) || COLORS.teal);
        p.strokeWeight(1.35);
        p.rect(x, y, w, h, 9);
        p.noStroke();
        p.fill((icon && icon.color) || COLORS.ink);
        p.textAlign(p.LEFT, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(country === 'Australia' ? 14 : 16);
        p.text(country.toUpperCase(), x + 24, y + h / 2 + 1);
        drawIcon(p, iconFor(manager, country), x + w - 49, y + 9, h - 18, icon && icon.color);
    }

    function drawPanelRows(p, manager, x, y, w, countries, muted) {
        for (var i = 0; i < countries.length; i++) {
            row(p, manager, x + 28, y + 132 + i * 74, w - 56, 52, i + 1, countries[i], muted);
        }
    }

    function drawTopFourBlocks(p, manager, x, y, scale) {
        p.push();
        p.translate(x, y);
        p.scale(scale);

        panel(p, 55, 145, 390, 570, COLORS.teal, false);
        panel(p, 475, 145, 390, 570, COLORS.dash, true);
        panel(p, 895, 145, 390, 570, COLORS.teal, false);
        panel(p, 1320, 145, 230, 570, COLORS.teal, true);

        header(p, 78, 177, '01', 'PRE-COVID', 'Open Borders', false);
        header(p, 498, 177, '02', 'DURING COVID', 'Restricted Travel', true);
        header(p, 918, 177, '03', 'POST-COVID', 'Your Guess', false);

        p.fill(COLORS.ink);
        p.textAlign(p.CENTER, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(15);
        p.text('Available destinations', 1435, 178);
        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(12);
        p.text('Drag from here', 1435, 205);
        p.stroke(COLORS.teal);
        p.strokeWeight(1.5);
        p.line(1435, 231, 1435, 247);
        p.line(1429, 241, 1435, 247);
        p.line(1441, 241, 1435, 247);
        p.noStroke();

        drawPanelRows(p, manager, 55, 145, 390, PRE, false);
        drawPanelRows(p, manager, 475, 145, 390, DURING, true);
        for (var i = 0; i < 5; i++) slot(p, 990, 290 + i * 85, 285, 62, i + 1);
        for (var j = 0; j < BANK.length; j++) chip(p, manager, 1335, 355 + j * 70, 200, 58, BANK[j]);

        p.pop();
    }

    window.VizTravelRanking = {
        setData: function (manager) {
            manager.travelRanking = { icons: {} };
            Object.keys(ICONS).forEach(function (country) {
                manager.travelRanking.icons[country] = domImage(ASSET_ROOT + ICONS[country].src);
            });
            return Promise.resolve(manager.travelRanking);
        },

        draw: function (p, manager) {
            p.push();
            p.translate(manager.margin.left, manager.margin.top);
            p.background(COLORS.bg);
            var baseW = 1600;
            var baseH = 760;
            var scale = Math.min(manager.width / baseW, manager.height / baseH);
            var x = (manager.width - baseW * scale) / 2;
            var y = (manager.height - baseH * scale) / 2;
            drawTopFourBlocks(p, manager, x, y, scale);
            p.pop();
        }
    };
})();

// viz_travel_ranking.js
// Center blocks for the destination ranking game.
(function () {
    var ASSET_ROOT = 'assets/travel_ranking_figma_design/assets/icons/';
    var ASSET_VERSION = '20260529-landmarks-v2';
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
        wrong: '#D85B4A',
        wrongSoft: '#FFF2EF'
    };

    var ICONS = {
        'France': { src: 'france_eiffel.svg', color: COLORS.teal },
        'U.S.': { src: 'us_statue.svg', color: COLORS.teal },
        'Japan': { src: 'japan_torii.svg', color: COLORS.teal },
        'Mexico': { src: 'mexico_pyramid.svg', color: COLORS.teal },
        'Spain': { src: 'spain_sagrada.svg', color: COLORS.teal },
        'Canada': { src: 'canada_cn_maple.svg', color: COLORS.teal },
        'Australia': { src: 'australia_opera.svg', color: COLORS.teal },
        'Turkey': { src: 'turkey_mosque.svg', color: COLORS.teal },
        'China': { src: 'china_temple.svg', color: COLORS.teal },
        'Italy': { src: 'italy_colosseum.svg', color: COLORS.teal }
    };

    var PRE = ['France', 'Spain', 'U.S.', 'China', 'Italy'];
    var DURING = ['France', 'Mexico', 'Turkey', 'Italy', 'U.S.'];
    var POST_ANSWER = ['France', 'Spain', 'U.S.', 'Turkey', 'Italy'];
    var BANK = ['France', 'Spain', 'U.S.', 'Turkey', 'Italy'];
    var COUNTS = {
        pre: {
            'France': 89400000,
            'Spain': 83700000,
            'U.S.': 79442000,
            'China': 65700000,
            'Italy': 64500000
        },
        during: {
            'France': 48400000,
            'Mexico': 31900000,
            'Turkey': 29900000,
            'Italy': 26900000,
            'U.S.': 22280146
        },
        post: {
            'France': 100000000,
            'Spain': 94000000,
            'U.S.': 72390320,
            'Turkey': 62300000,
            'Italy': 57200000
        }
    };
    var BANK_LAYOUT = [
        { country: 'France', x: 1335, y: 355, w: 200, h: 58 },
        { country: 'Spain', x: 1335, y: 425, w: 200, h: 58 },
        { country: 'U.S.', x: 1335, y: 495, w: 200, h: 58 },
        { country: 'Turkey', x: 1335, y: 565, w: 200, h: 58 },
        { country: 'Italy', x: 1335, y: 635, w: 200, h: 58 }
    ];
    var SLOTS = [
        { rank: 1, x: 990, y: 290, w: 285, h: 62 },
        { rank: 2, x: 990, y: 375, w: 285, h: 62 },
        { rank: 3, x: 990, y: 460, w: 285, h: 62 },
        { rank: 4, x: 990, y: 545, w: 285, h: 62 },
        { rank: 5, x: 990, y: 630, w: 285, h: 62 }
    ];
    var REVEAL_BUTTON = { x: 1030, y: 735, w: 220, h: 56 };

    function domImage(src) {
        var img = new Image();
        img.src = src + '?v=' + ASSET_VERSION;
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

    function formatCount(value) {
        if (!value) return '';
        return (value / 1000000).toFixed(value >= 10000000 ? 1 : 2).replace(/\.0+$/, '') + 'M visitors';
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

    function header(p, x, y, num, title, yearLabel, badge, muted) {
        p.noStroke();
        p.fill(COLORS.teal);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(31);
        p.text(num, x, y);
        p.textSize(18);
        p.text(title, x + 60, y + 7);
        p.textStyle(p.NORMAL);
        p.textSize(11);
        p.fill(COLORS.tealDark);
        p.text(yearLabel, x + 60, y + 31);
        p.textStyle(p.NORMAL);
        p.fill(muted ? '#DCE7EE' : COLORS.tealLight);
        p.rect(x + 62, y + 50, 118, 28, 999);
        p.fill(COLORS.teal);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(11);
        p.text(badge, x + 121, y + 64);
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

    function row(p, manager, x, y, w, h, rank, country, muted, count, wrong) {
        var icon = ICONS[country];
        rankBadge(p, x + 22, y + h / 2, rank);
        p.fill(wrong ? COLORS.wrongSoft : (muted ? COLORS.panelSoft : COLORS.panel));
        p.stroke(wrong ? COLORS.wrong : (muted ? COLORS.line : '#B9D2DF'));
        p.strokeWeight(wrong ? 2 : 1.2);
        p.rect(x + 55, y, w - 55, h, 10);
        p.noStroke();
        p.fill(wrong ? COLORS.wrong : COLORS.tealDark);
        p.textAlign(p.LEFT, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(count ? 15 : 18);
        p.text(country.toUpperCase(), x + 82, y + (count ? h * 0.38 : h / 2 + 1));
        if (count) {
            p.textStyle(p.NORMAL);
            p.textSize(10);
            p.fill(wrong ? COLORS.wrong : COLORS.muted);
            p.text(formatCount(count), x + 82, y + h * 0.70);
        }
        drawIcon(p, iconFor(manager, country), x + w - 60, y + 7, h - 14, icon && icon.color);
    }

    function slot(p, x, y, w, h, rank) {
        rankBadge(p, x - 26, y + h / 2, rank);
        p.fill('rgba(255,255,255,0.72)');
        p.stroke(COLORS.dash);
        p.strokeWeight(1.2);
        dashedRect(p, x, y, w, h, 10, COLORS.dash);
        p.noStroke();
        p.fill(COLORS.tealDark);
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.NORMAL);
        p.textSize(13);
        p.text('Drag a destination here', x + w / 2, y + h / 2);
    }

    function chip(p, manager, x, y, w, h, country, count, wrong) {
        var icon = ICONS[country];
        p.fill(wrong ? COLORS.wrongSoft : COLORS.panel);
        p.stroke(wrong ? COLORS.wrong : COLORS.teal);
        p.strokeWeight(wrong ? 2 : 1.35);
        p.rect(x, y, w, h, 9);
        p.noStroke();
        p.fill(wrong ? COLORS.wrong : COLORS.tealDark);
        p.textAlign(p.LEFT, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(count ? 14 : (country === 'Australia' ? 14 : 16));
        p.text(country.toUpperCase(), x + 24, y + (count ? h * 0.38 : h / 2 + 1));
        if (count) {
            p.textStyle(p.NORMAL);
            p.textSize(10);
            p.fill(wrong ? COLORS.wrong : COLORS.muted);
            p.text(formatCount(count), x + 24, y + h * 0.70);
        }
        drawIcon(p, iconFor(manager, country), x + w - 54, y + 7, h - 14, icon && icon.color);
    }

    function pointInRect(px, py, r) {
        return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }

    function ensureState(manager) {
        var state = manager.travelRanking;
        if (!state) return null;
        if (!state.chips) {
            state.slots = SLOTS.map(function (slot) {
                return { rank: slot.rank, x: slot.x, y: slot.y, w: slot.w, h: slot.h, country: null };
            });
            state.chips = BANK_LAYOUT.map(function (item) {
                return {
                    country: item.country,
                    x: item.x,
                    y: item.y,
                    w: item.w,
                    h: item.h,
                    homeX: item.x,
                    homeY: item.y,
                    slot: null
                };
            });
            state.dragging = null;
            state.wasPressed = false;
            state.revealed = false;
            state.wrongSlots = [];
        }
        return state;
    }

    function snapHome(chip) {
        chip.x = chip.homeX;
        chip.y = chip.homeY;
        chip.w = 200;
        chip.h = 58;
        chip.slot = null;
    }

    function placeChip(state, chip, slotIndex) {
        if (chip.slot != null && state.slots[chip.slot]) state.slots[chip.slot].country = null;
        var slot = state.slots[slotIndex];
        if (slot.country && slot.country !== chip.country) {
            var existing = state.chips.find(function (item) { return item.country === slot.country; });
            if (existing) snapHome(existing);
        }
        slot.country = chip.country;
        chip.slot = slotIndex;
        chip.x = slot.x;
        chip.y = slot.y;
        chip.w = slot.w;
        chip.h = slot.h;
    }

    function revealAnswer(state) {
        var guess = state.slots.map(function (slot) { return slot.country; });
        state.wrongSlots = POST_ANSWER.map(function (country, index) {
            return guess[index] !== country;
        });
        POST_ANSWER.forEach(function (country, index) {
            var chip = state.chips.find(function (item) { return item.country === country; });
            if (chip) placeChip(state, chip, index);
        });
        state.revealed = true;
    }

    function handleDrag(p, manager) {
        var state = ensureState(manager);
        if (!state || !state.layout) return;
        var mx = (p.mouseX - manager.margin.left - state.layout.x) / state.layout.scale;
        var my = (p.mouseY - manager.margin.top - state.layout.y) / state.layout.scale;
        var justPressed = p.mouseIsPressed && !state.wasPressed;
        var justReleased = !p.mouseIsPressed && state.wasPressed;

        if (justPressed && pointInRect(mx, my, REVEAL_BUTTON)) {
            revealAnswer(state);
            state.wasPressed = p.mouseIsPressed;
            return;
        }

        if (state.revealed) {
            state.wasPressed = p.mouseIsPressed;
            return;
        }

        if (justPressed) {
            for (var i = state.chips.length - 1; i >= 0; i--) {
                var chip = state.chips[i];
                if (pointInRect(mx, my, chip)) {
                    state.dragging = {
                        chip: chip,
                        dx: mx - chip.x,
                        dy: my - chip.y
                    };
                    if (chip.slot != null && state.slots[chip.slot]) state.slots[chip.slot].country = null;
                    chip.slot = null;
                    state.chips.splice(i, 1);
                    state.chips.push(chip);
                    break;
                }
            }
        }

        if (state.dragging && p.mouseIsPressed) {
            state.dragging.chip.x = mx - state.dragging.dx;
            state.dragging.chip.y = my - state.dragging.dy;
        }

        if (justReleased && state.dragging) {
            var dragged = state.dragging.chip;
            var center = { x: dragged.x + dragged.w / 2, y: dragged.y + dragged.h / 2 };
            var target = -1;
            for (var s = 0; s < state.slots.length; s++) {
                if (pointInRect(center.x, center.y, state.slots[s])) {
                    target = s;
                    break;
                }
            }
            if (target >= 0) placeChip(state, dragged, target);
            else snapHome(dragged);
            state.dragging = null;
        }

        state.wasPressed = p.mouseIsPressed;
    }

    function drawPanelRows(p, manager, x, y, w, countries, muted, counts, showCounts) {
        for (var i = 0; i < countries.length; i++) {
            row(p, manager, x + 28, y + 132 + i * 74, w - 56, 52, i + 1, countries[i], muted, showCounts ? counts[countries[i]] : null, false);
        }
    }

    function drawRevealButton(p, state) {
        var b = REVEAL_BUTTON;
        p.push();
        shadow(p, 13, 'rgba(0,124,120,0.20)', 0, 5);
        p.fill(state.revealed ? '#D9F3EE' : COLORS.teal);
        p.noStroke();
        p.rect(b.x, b.y, b.w, b.h, 12);
        noShadow(p);
        p.fill(state.revealed ? COLORS.tealDark : '#FFFFFF');
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(17);
        p.text(state.revealed ? 'Answer Revealed' : 'Reveal Answer', b.x + b.w / 2, b.y + b.h / 2);
        p.pop();
    }

    function drawTopFourBlocks(p, manager, x, y, scale) {
        p.push();
        p.translate(x, y);
        p.scale(scale);

        panel(p, 55, 145, 390, 570, COLORS.teal, false);
        panel(p, 475, 145, 390, 570, COLORS.teal, false);
        panel(p, 895, 145, 390, 570, COLORS.teal, false);
        panel(p, 1320, 145, 230, 570, COLORS.teal, true);

        header(p, 78, 177, '01', 'PRE-COVID', '(2019)', 'Open Borders', false);
        header(p, 498, 177, '02', 'DURING COVID', '(2021)', 'Restricted Travel', true);
        header(p, 918, 177, '03', 'POST-COVID', '(2024 guess)', 'Your Guess', false);

        p.fill(COLORS.tealDark);
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

        var state = ensureState(manager);
        drawPanelRows(p, manager, 55, 145, 390, PRE, false, COUNTS.pre, state.revealed);
        drawPanelRows(p, manager, 475, 145, 390, DURING, true, COUNTS.during, state.revealed);
        for (var i = 0; i < state.slots.length; i++) {
            if (!state.slots[i].country) {
                slot(p, state.slots[i].x, state.slots[i].y, state.slots[i].w, state.slots[i].h, i + 1);
            } else if (state.revealed) {
                row(p, manager, state.slots[i].x - 55, state.slots[i].y, state.slots[i].w + 55, state.slots[i].h, i + 1, state.slots[i].country, false, COUNTS.post[state.slots[i].country], state.wrongSlots[i]);
            }
        }
        for (var j = 0; j < state.chips.length; j++) {
            var item = state.chips[j];
            if (state.revealed && item.slot != null) continue;
            chip(p, manager, item.x, item.y, item.w, item.h, item.country, null, false);
        }
        drawRevealButton(p, state);

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
            var baseH = 840;
            var scale = Math.min(manager.width / baseW, manager.height / baseH);
            var x = (manager.width - baseW * scale) / 2;
            var y = (manager.height - baseH * scale) / 2;
            var state = ensureState(manager);
            state.layout = { x: x, y: y, scale: scale };
            handleDrag(p, manager);
            drawTopFourBlocks(p, manager, x, y, scale);
            p.pop();
        }
    };
})();

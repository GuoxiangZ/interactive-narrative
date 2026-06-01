// viz_travel_ranking.js
// Center blocks for the destination ranking game.
(function () {
    var ASSET_ROOT = 'assets/travel_ranking_landmarks/';
    var BACKGROUND_SRC = 'assets/figma_airport_arrivals/figma_codex_airport_arrivals_asset_pack/assets/backgrounds/airport_arrivals_hall_background.png';
    var ASSET_VERSION = '20260531-italy-china-landmarks';
    var BACKDROP = { x: 100, y: 0, w: 1500, h: 840 };
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
        'France': { src: 'france_eiffel.png', color: COLORS.teal },
        'U.S.': { src: 'us_statue.png', color: COLORS.teal },
        'Japan': { src: 'japan_torii.png', color: COLORS.teal },
        'Mexico': { src: 'mexico_pyramid.png', color: COLORS.teal },
        'Spain': { src: 'spain_sagrada.png', color: COLORS.teal },
        'Canada': { src: 'canada_toronto.png', color: COLORS.teal },
        'Australia': { src: 'australia_opera.png', color: COLORS.teal },
        'Turkey': { src: 'turkey_mosque.png', color: COLORS.teal },
        'Italy': { src: 'italy_colosseum.png', color: COLORS.teal },
        'China': { src: 'china_great_wall.png', color: COLORS.teal }
    };

    var PRE = ['France', 'Spain', 'U.S.', 'China', 'Italy'];
    var DURING = ['France', 'Mexico', 'Spain', 'Turkey', 'Italy'];
    var POST_ANSWER = ['France', 'Spain', 'U.S.', 'Turkey', 'Italy'];
    var BANK = ['France', 'Spain', 'U.S.', 'Turkey', 'Italy'];
    var COUNTS = {
        pre: {
            'France': 89322000,
            'Spain': 82808000,
            'U.S.': 79745920,
            'China': 62900000,
            'Italy': 61567200
        },
        during: {
            'France': 48400000,
            'Mexico': 31900000,
            'Spain': 31200000,
            'Turkey': 29900000,
            'Italy': 26900000
        },
        post: {
            'France': 102000000,
            'Spain': 93800000,
            'U.S.': 72400000,
            'Turkey': 60600000,
            'Italy': 57800000
        }
    };
    var BANK_LAYOUT = [
        { country: 'France', x: 1268, y: 340, w: 200, h: 58 },
        { country: 'Spain', x: 1268, y: 410, w: 200, h: 58 },
        { country: 'U.S.', x: 1268, y: 480, w: 200, h: 58 },
        { country: 'Turkey', x: 1268, y: 550, w: 200, h: 58 },
        { country: 'Italy', x: 1268, y: 620, w: 200, h: 58 }
    ];
    var SLOTS = [
        { rank: 1, x: 978, y: 333, w: 230, h: 58 },
        { rank: 2, x: 978, y: 411, w: 230, h: 58 },
        { rank: 3, x: 978, y: 489, w: 230, h: 58 },
        { rank: 4, x: 978, y: 567, w: 230, h: 58 },
        { rank: 5, x: 978, y: 645, w: 230, h: 58 }
    ];
    var REVEAL_BUTTON = { x: 1243, y: 750, w: 220, h: 56 };
    var INSIGHTS = [
        {
            label: 'Mexico rose while others were closed',
            body: 'Mexico did not need a full global rebound to move up. With fewer entry barriers and strong regional leisure demand, it reached #2 in 2021.'
        },
        {
            label: 'The U.S. left the top five in 2021',
            body: 'The U.S. had 79.7M visitors in 2018, but only 22.3M in 2021. That drop opened space for Mexico and Turkey during the shock.'
        },
        {
            label: 'Then the U.S. came back',
            body: 'By 2024, the U.S. returned to #3 with 72.4M visitors. Mexico also recovered, but the larger destinations recovered enough to push it out.'
        }
    ];

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

    function drawCoverImage(p, img, x, y, w, h) {
        if (!img || !img.complete || !img.naturalWidth) return;
        var iw = img.naturalWidth;
        var ih = img.naturalHeight;
        var scale = Math.max(w / iw, h / ih);
        var sw = iw * scale;
        var sh = ih * scale;
        p.drawingContext.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
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
        p.fill('rgba(255,255,255,0.90)');
        p.stroke(accent || COLORS.teal);
        p.strokeWeight(1.4);
        p.rect(x, y, w, h, 18);
        noShadow(p);
        if (dashed) dashedRect(p, x + 2, y + 2, w - 4, h - 4, 16, COLORS.dash);
        p.pop();
    }

    function outerFrame(p, x, y, w, h) {
        p.push();
        shadow(p, 24, 'rgba(16,42,67,0.12)', 0, 8);
        p.fill('rgba(255,255,255,0.68)');
        p.stroke('rgba(0,124,120,0.26)');
        p.strokeWeight(1.2);
        p.rect(x, y, w, h, 32);
        noShadow(p);
        p.stroke('rgba(255,255,255,0.78)');
        p.strokeWeight(3);
        p.noFill();
        p.rect(x + 8, y + 8, w - 16, h - 16, 26);
        p.pop();
    }

    function turnTag(p, x, y, w, h) {
        p.push();
        shadow(p, 7, 'rgba(0,124,120,0.18)', 0, 3);
        p.fill(COLORS.teal);
        p.noStroke();
        p.rect(x, y, w, h, 0, 12, 0, 12);
        noShadow(p);
        p.fill('#FFFFFF');
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.text('YOUR TURN', x + w / 2, y + h / 2 + 1);
        p.pop();
    }

    function sectionTitle(p, x, y) {
        p.push();
        p.noStroke();
        p.fill('rgba(102,229,223,0.26)');
        p.ellipse(x + 40, y + 42, 74, 74);
        p.fill(COLORS.teal);
        p.translate(x + 40, y + 42);
        p.rotate(-0.2);
        p.beginShape();
        p.vertex(-19, -4);
        p.vertex(7, -7);
        p.vertex(22, -1);
        p.vertex(7, 5);
        p.vertex(-19, 4);
        p.endShape(p.CLOSE);
        p.stroke(COLORS.teal);
        p.strokeWeight(4);
        p.line(-3, -6, -12, -20);
        p.line(-3, 6, -12, 20);
        p.pop();

        p.push();
        p.noStroke();
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(34);
        p.text('Destination Ranking Game', x + 100, y + 18);
        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(17);
        p.text('Guess how travel preferences shifted after COVID.', x + 100, y + 58);
        p.pop();
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
        return y + lineHeight;
    }

    function header(p, x, y, num, title, yearLabel, muted) {
        p.noStroke();
        p.fill(COLORS.teal);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(36);
        p.text(num, x, y);
        p.textSize(22);
        p.text(title + ' ' + yearLabel, x + 60, y + 7);
        p.textStyle(p.NORMAL);
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
        p.textSize(18);
        p.text(String(rank), x, y + 1);
    }

    function row(p, manager, x, y, w, h, rank, country, muted, count, wrong) {
        var icon = ICONS[country];
        rankBadge(p, x + 22, y + h / 2, rank);
        p.push();
        shadow(p, 7, 'rgba(16,42,67,0.08)', 0, 3);
        p.fill(wrong ? COLORS.wrongSoft : (muted ? COLORS.panelSoft : COLORS.panel));
        p.stroke(wrong ? COLORS.wrong : (muted ? COLORS.line : '#B9D2DF'));
        p.strokeWeight(wrong ? 2 : 1.2);
        p.rect(x + 55, y, w - 55, h, 10);
        noShadow(p);
        p.pop();
        p.noStroke();
        p.fill(wrong ? COLORS.wrong : COLORS.tealDark);
        p.textAlign(p.LEFT, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(count ? 16 : 20);
        p.text(country.toUpperCase(), x + 82, y + (count ? h * 0.38 : h / 2 + 1));
        if (count) {
            p.textStyle(p.NORMAL);
            p.textSize(11);
            p.fill(wrong ? COLORS.wrong : COLORS.muted);
            p.text(formatCount(count), x + 82, y + h * 0.70);
        }
        drawIcon(p, iconFor(manager, country), x + w - 61, y + 3, h - 6, icon && icon.color);
    }

    function slot(p, x, y, w, h, rank) {
        rankBadge(p, x - 26, y + h / 2, rank);
        p.push();
        shadow(p, 7, 'rgba(16,42,67,0.06)', 0, 3);
        p.fill('rgba(255,255,255,0.72)');
        p.noStroke();
        p.rect(x, y, w, h, 10);
        noShadow(p);
        p.pop();
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
        p.push();
        shadow(p, 7, 'rgba(16,42,67,0.08)', 0, 3);
        p.fill(wrong ? COLORS.wrongSoft : COLORS.panel);
        p.stroke(wrong ? COLORS.wrong : COLORS.teal);
        p.strokeWeight(wrong ? 2 : 1.35);
        p.rect(x, y, w, h, 9);
        noShadow(p);
        p.pop();
        p.noStroke();
        p.fill(wrong ? COLORS.wrong : COLORS.tealDark);
        p.textAlign(p.LEFT, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(count ? 15 : (country === 'Australia' ? 15 : 17));
        p.text(country.toUpperCase(), x + 24, y + (count ? h * 0.38 : h / 2 + 1));
        if (count) {
            p.textStyle(p.NORMAL);
            p.textSize(11);
            p.fill(wrong ? COLORS.wrong : COLORS.muted);
            p.text(formatCount(count), x + 24, y + h * 0.70);
        }
        drawIcon(p, iconFor(manager, country), x + w - 61, y + 3, h - 6, icon && icon.color);
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
            row(p, manager, x + 32, y + 132 + i * 74, 255, 52, i + 1, countries[i], muted, showCounts ? counts[countries[i]] : null, false);
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

    function drawInsightPanel(p, x, y, w, h) {
        p.push();
        p.noStroke();
        p.fill(COLORS.ink);
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(20);
        p.text('What changed?', x + 20, y + 26);

        p.textStyle(p.NORMAL);
        p.fill(COLORS.muted);
        p.textSize(11);
        drawWrappedText(p, 'Focus on the swap: Mexico enters while the U.S. drops out, then the U.S. returns as restrictions ease.', x + 20, y + 55, w - 40, 15);

        var cursorY = y + 106;
        for (var i = 0; i < INSIGHTS.length; i++) {
            var insight = INSIGHTS[i];
            p.fill(i === 1 ? COLORS.wrong : COLORS.teal);
            p.circle(x + 24, cursorY + 7, 8);
            p.fill(COLORS.tealDark);
            p.textStyle(p.BOLD);
            p.textSize(12);
            cursorY = drawWrappedText(p, insight.label, x + 40, cursorY, w - 58, 14);
            p.fill(COLORS.muted);
            p.textStyle(p.NORMAL);
            p.textSize(11);
            cursorY = drawWrappedText(p, insight.body, x + 40, cursorY + 3, w - 58, 13) + 8;
        }

        p.fill('rgba(0,124,120,0.08)');
        p.rect(x + 18, y + h - 78, w - 36, 52, 12);
        p.fill(COLORS.tealDark);
        p.textStyle(p.BOLD);
        p.textSize(11);
        drawWrappedText(p, 'Takeaway: Mexico gained rank temporarily; the U.S. returned as access reopened.', x + 32, y + h - 64, w - 64, 14);
        p.pop();
    }

    function drawTopFourBlocks(p, manager, x, y, scale) {
        p.push();
        p.translate(x, y);
        p.scale(scale);

        drawCoverImage(p, manager.travelRanking && manager.travelRanking.background, BACKDROP.x, BACKDROP.y, BACKDROP.w, BACKDROP.h);
        p.noStroke();
        p.fill('rgba(251,254,254,0.38)');
        p.rect(BACKDROP.x, BACKDROP.y, BACKDROP.w, BACKDROP.h);

        outerFrame(p, 160, 55, 1380, 760);
        sectionTitle(p, 218, 78);

        panel(p, 218, 200, 320, 525, COLORS.teal, false);
        panel(p, 558, 200, 320, 525, COLORS.teal, false);
        panel(p, 893, 185, 340, 550, COLORS.teal, false);
        panel(p, 1253, 200, 230, 525, COLORS.teal, false);
        turnTag(p, 1111, 185, 112, 32);

        header(p, 241, 232, '01', 'PRE-COVID', '(2018)', false);
        header(p, 581, 232, '02', 'DURING COVID', '(2021)', true);
        header(p, 916, 217, '03', 'POST-COVID', '(2024)', false);

        var state = ensureState(manager);
        if (state.revealed) {
            drawInsightPanel(p, 1253, 200, 230, 525);
        } else {
            p.fill(COLORS.tealDark);
            p.textAlign(p.CENTER, p.TOP);
            p.textStyle(p.BOLD);
            p.textSize(16);
            p.text('Available destinations', 1368, 233);
            p.textStyle(p.NORMAL);
            p.fill(COLORS.muted);
            p.textSize(12);
            p.text('Drag from here', 1368, 260);
            p.stroke(COLORS.teal);
            p.strokeWeight(1.5);
            p.line(1368, 286, 1368, 302);
            p.line(1362, 296, 1368, 302);
            p.line(1374, 296, 1368, 302);
            p.noStroke();
        }
        drawPanelRows(p, manager, 218, 200, 320, PRE, false, COUNTS.pre, state.revealed);
        drawPanelRows(p, manager, 558, 200, 320, DURING, true, COUNTS.during, state.revealed);
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
            if (state.revealed) continue;
            chip(p, manager, item.x, item.y, item.w, item.h, item.country, null, false);
        }
        drawRevealButton(p, state);

        p.pop();
    }

    window.VizTravelRanking = {
        setData: function (manager) {
            manager.travelRanking = { icons: {}, background: domImage(BACKGROUND_SRC) };
            Object.keys(ICONS).forEach(function (country) {
                manager.travelRanking.icons[country] = domImage(ASSET_ROOT + ICONS[country].src);
            });
            return Promise.resolve(manager.travelRanking);
        },

        draw: function (p, manager) {
            p.push();
            p.translate(manager.margin.left, manager.margin.top);
            p.background(COLORS.bg);
            var baseW = 1700;
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

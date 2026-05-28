// sketch_renderer.js

// Responsible for rendering the main visualization based on the current active index
(function () {
    function easeInOut(t) {
        t = Math.max(0, Math.min(1, t));
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function drawUSFocusTransition(p, manager, amount) {
        var wm = manager.worldMap || {};
        var countries = wm.countries || [];
        var t = easeInOut(amount);
        p.push();
        p.translate(manager.margin.left, manager.margin.top);
        p.background('#fbfefe');

        var x = 10;
        var y = 12;
        var w = manager.width - 20;
        var h = manager.height - 28;
        p.noStroke();
        p.fill('#123f4f');
        p.textAlign(p.LEFT, p.TOP);
        p.textStyle(p.BOLD);
        p.textSize(16);
        p.text('Worldwide Inbound Tourism Arrivals', x + 22, y + 4);
        p.textStyle(p.NORMAL);
        p.textSize(11);
        p.fill('#6f8388');
        p.text('Focusing on the United States', x + 22, y + 27);

        if (countries.length && typeof d3 !== 'undefined') {
            var projection = d3.geoNaturalEarth1();
            projection.fitExtent([[x + 10, y + 50], [x + w - 10, y + h - 34]], { type: 'Sphere' });
            var usPoint = projection([-98, 39]);
            var centerX = x + w * 0.50;
            var centerY = y + h * 0.50;
            var scale = 1 + 2.85 * t;
            var tx = t * (centerX - scale * usPoint[0]);
            var ty = t * (centerY - scale * usPoint[1]);
            var ctx = p.drawingContext;
            var path = d3.geoPath(projection, ctx);

            ctx.save();
            ctx.translate(tx, ty);
            ctx.scale(scale, scale);
            countries.forEach(function (feature) {
                var name = feature.properties && feature.properties.name;
                ctx.beginPath();
                path(feature);
                ctx.fillStyle = name === 'United States of America' ? '#2dbdb4' : '#d9e2e8';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 0.65 / scale;
                ctx.stroke();
            });
            ctx.restore();

            p.noFill();
            p.stroke('#2dbdb4');
            p.strokeWeight(1.8);
            p.ellipse(centerX, centerY, 30 + 90 * t, 30 + 90 * t);
            p.noStroke();
            p.fill('#187f7b');
            p.ellipse(centerX, centerY, 7 + 5 * t, 7 + 5 * t);
        }

        p.pop();
    }

    window.Renderer = {

        setData: function (manager) {
            var self = this;

            manager.offsetX = (manager.margin && manager.margin.left) || 20;
            manager.offsetY = (manager.margin && manager.margin.top) || 0;

            function computeLayout(data) {
                manager.data = data;
            }

            computeLayout([]);
            var loaders = [];
            if (window.VizWorldMap && typeof window.VizWorldMap.setData === 'function') {
                loaders.push(window.VizWorldMap.setData(manager));
            }
            if (window.VizUSArrivals && typeof window.VizUSArrivals.setData === 'function') {
                loaders.push(window.VizUSArrivals.setData(manager));
            }
            return Promise.all(loaders).then(function () { return manager.data; });
        },

        draw: function (p, manager, ai, progress) {
            var previousAI = manager._rendererActiveIndex;
            if (previousAI !== ai) {
                if (previousAI === 1 && ai === 2) {
                    manager._usFocusTransitionStart = Date.now();
                }
                manager._rendererActiveIndex = ai;
            }

            if (ai !== 1 && window.VizWorldMap && typeof window.VizWorldMap.hideOverlay === 'function') {
                window.VizWorldMap.hideOverlay(manager);
            }
            if (ai !== 2 && window.VizUSArrivals && typeof window.VizUSArrivals.hideOverlay === 'function') {
                window.VizUSArrivals.hideOverlay(manager);
            }

            if (ai === 0) {
                window.VizTitle.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 1 && window.VizWorldMap) {
                window.VizWorldMap.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 2 && window.VizUSArrivals) {
                if (manager._usFocusTransitionStart) {
                    var amount = (Date.now() - manager._usFocusTransitionStart) / 1650;
                    if (amount < 1) {
                        if (window.VizUSArrivals.hideOverlay) window.VizUSArrivals.hideOverlay(manager);
                        drawUSFocusTransition(p, manager, amount);
                        return;
                    }
                    manager._usFocusTransitionStart = 0;
                }
                window.VizUSArrivals.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 6  || ai === 9) {
                window.VizProgressColor.draw(p, manager, ai, progress);
                return;
            }

            if ((ai >= 4 && ai < 6)) {
                window.VizScatter.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 7) {
                window.VizBar.draw(p, manager, ai, progress);
                return;
            }
        }
    };
})();

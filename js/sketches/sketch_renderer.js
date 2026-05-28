// sketch_renderer.js

// Responsible for rendering the main visualization based on the current active index
(function () {
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

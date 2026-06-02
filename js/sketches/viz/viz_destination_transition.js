// viz_destination_transition.js
// Visual transition from spending recovery to destination-level examples.
(function () {
    var HAWAII_PHOTO = 'data/hawaii.png';
    var CANCUN_PHOTO = 'data/Cancun.png';
    var PRELOAD_URLS = [HAWAII_PHOTO, CANCUN_PHOTO, 'data/America.png', 'data/Mexico.png'];

    function preloadAssets(manager) {
        if (manager._destinationTransitionPreloaded) return;
        manager._destinationTransitionPreloaded = true;
        PRELOAD_URLS.forEach(function (url) {
            var img = new Image();
            img.decoding = 'async';
            img.src = url;
        });
    }

    function buildOverlay(manager) {
        var vis = document.getElementById('vis');
        if (!vis) return;
        if (manager._destinationTransitionOverlay && document.body.contains(manager._destinationTransitionOverlay)) return;
        preloadAssets(manager);

        if (getComputedStyle(vis).position === 'static') {
            vis.style.position = 'fixed';
        }

        var overlay = document.createElement('div');
        overlay.className = 'destination-transition-overlay';

        var panels = document.createElement('div');
        panels.className = 'destination-photo-panels';

        var hawaii = makePanel('Hawaii', 'United States', 'data/America.png', HAWAII_PHOTO, 'destination-panel-hawaii');
        var cancun = makePanel('Cancun', 'Mexico', 'data/Mexico.png', CANCUN_PHOTO, 'destination-panel-cancun');
        panels.appendChild(hawaii);
        panels.appendChild(cancun);

        var copy = document.createElement('div');
        copy.className = 'destination-transition-copy';
        copy.innerHTML = [
            '<div class="destination-transition-title">It looks like everything came back. But did it really?</div>',
            '<div class="destination-transition-body">Now, let&#39;s look at two specific examples.</div>'
        ].join('');

        overlay.appendChild(panels);
        overlay.appendChild(copy);
        vis.appendChild(overlay);
        manager._destinationTransitionOverlay = overlay;
    }

    function makePanel(place, country, flagUrl, photoUrl, extraClass) {
        var panel = document.createElement('div');
        panel.className = 'destination-photo-panel ' + extraClass;
        panel.style.backgroundImage = 'linear-gradient(180deg, rgba(18,63,79,0.08), rgba(18,63,79,0.48)), url("' + photoUrl + '")';

        var badge = document.createElement('div');
        badge.className = 'destination-flag-badge';
        badge.innerHTML = '<img class="destination-flag" src="' + flagUrl + '" alt="' + country + ' flag"><strong>' + place + '</strong><em>' + country + '</em>';

        panel.appendChild(badge);
        return panel;
    }

    window.VizDestinationTransition = {
        draw: function (p, manager, ai, progress) {
            buildOverlay(manager);
            if (manager._destinationTransitionOverlay) {
                manager._destinationTransitionOverlay.classList.add('is-visible');
                var pr = Math.max(0, Math.min(1, progress || 0.5));
                var fadeIn = Math.max(0, Math.min(1, pr / 0.16));
                var fadeOut = Math.max(0, Math.min(1, (1 - pr) / 0.18));
                var opacity = Math.min(fadeIn, fadeOut);
                var eased = opacity * opacity * (3 - 2 * opacity);
                var yOffset = 0;
                var exit = 0;
                if (pr < 0.16) {
                    yOffset = (1 - fadeIn) * 18;
                } else if (pr > 0.82) {
                    exit = Math.max(0, Math.min(1, (pr - 0.82) / 0.18));
                    yOffset = -exit * 26;
                }
                manager._destinationTransitionOverlay.style.opacity = eased.toFixed(3);
                manager._destinationTransitionOverlay.style.transform = 'translateY(' + yOffset.toFixed(2) + 'px) scale(' + (1 - exit * 0.025).toFixed(3) + ')';
                manager._destinationTransitionOverlay.style.setProperty('--destination-transition-progress', eased.toFixed(3));
                manager._destinationTransitionOverlay.style.setProperty('--destination-transition-y', yOffset.toFixed(2));
                manager._destinationTransitionOverlay.style.setProperty('--destination-transition-exit', exit.toFixed(3));
            }
            p.push();
            p.background('#fbfefe');
            p.pop();
        },

        hideOverlay: function (manager) {
            preloadAssets(manager);
            buildOverlay(manager);
            if (manager._destinationTransitionOverlay) {
                manager._destinationTransitionOverlay.classList.remove('is-visible');
                manager._destinationTransitionOverlay.style.opacity = '0';
                manager._destinationTransitionOverlay.style.transform = 'translateY(18px) scale(0.975)';
                manager._destinationTransitionOverlay.style.setProperty('--destination-transition-progress', '0');
                manager._destinationTransitionOverlay.style.setProperty('--destination-transition-y', '18');
                manager._destinationTransitionOverlay.style.setProperty('--destination-transition-exit', '0');
            }
        }
    };
})();

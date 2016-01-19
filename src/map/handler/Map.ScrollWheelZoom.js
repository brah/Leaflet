/*
 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
 */

L.Map.mergeOptions({
	scrollWheelZoom: true,
	wheelDebounceTime: 40
});

L.Map.ScrollWheelZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);

		this._delta = 0;
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll, this);
	},

	_onWheelScroll: function (e) {
        var delta = L.DomEvent.getWheelDelta(e);
        var debounce = this._map.options.wheelDebounceTime;

        if (!delta) {
            L.DomEvent.stop(e);
            return;
        }

        console.log(delta);

        if (delta % 4.000244140625 == 0) { // webkit wheel scrolling
            this._mode = 'wheel';
        } else if (Math.abs(delta) <= 4) { // small value: trackpad
            this._mode = 'trackpad';
        } else if (e.deltaMode !== 0) { // not pixel scroll: wheel
            this._mode = 'wheel';
        } else {
            this._mode = 'trackpad';
        }

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(debounce - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(L.bind(this._performZoom, this), left);

		L.DomEvent.stop(e);
	},

	_performZoom: function () {
		var map = this._map,
		    zoom = map.getZoom(),
            sigm_max, sigm_steepness;

		map._stop(); // stop panning and fly animations if any

        // sigmoid
        if (map.options.zoomAnimation) {
            sigm_max = 4;
            sigm_steepness = 200;
        }

        else {
            if (this._mode === 'trackpad') {
                sigm_max = 0.3;
                sigm_steepness = 20;
            }
            else {
                sigm_max = 1.3;
                sigm_steepness = 200;
            }
        }

		var v1 = 1 / (1 + Math.exp(-this._delta / sigm_steepness)) - 0.5;
		var v2 = v1 * sigm_max * 2;
		var delta = map._limitZoom(zoom + v2) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			map.setZoomAround(this._lastMousePos, zoom + delta);
		}
	}
});

L.Map.addInitHook('addHandler', 'scrollWheelZoom', L.Map.ScrollWheelZoom);

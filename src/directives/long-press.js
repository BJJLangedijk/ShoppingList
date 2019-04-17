exports.install = function (Vue, options) {
    options = options || {};
    options.duration = options.duration || 2000;

    Vue.directive('long-press', {
        bind: function (el, binding) {
            var self = this;

            this._timeout = null;
            this._setLongPressTimeout = function (e) {
                var context = this;

                self._timeout = setTimeout(function () {
                    binding.value.call(context, e)
                }, options.duration);
            };

            this._clearLongPressTimeout = function () {
                clearTimeout(self._timeout)
            };

            el.addEventListener('touchstart', this._setLongPressTimeout);
            el.addEventListener('mousedown', this._setLongPressTimeout);
            document.addEventListener('mouseup', this._clearLongPressTimeout);
            document.addEventListener('touchcancel', this._clearLongPressTimeout);
            document.addEventListener('touchend', this._clearLongPressTimeout);
            window.onscroll = this._clearLongPressTimeout;
        },
        unbind: function (el) {
            this._clearLongPressTimeout();
            el.removeEventListener('touchstart', this._setLongPressTimeout);
            el.removeEventListener('mousedown', this._setLongPressTimeout);
            document.removeEventListener('mouseup', this._clearLongPressTimeout);
            document.removeEventListener('touchcancel', this._clearLongPressTimeout);
            document.removeEventListener('touchend', this._clearLongPressTimeout);
            window.onscroll = null;
        }
    })
}

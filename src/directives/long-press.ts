import Vue from 'vue';

const options = {
    duration: 500
};

export const LongPressDirective = {
    bind: function (el, binding) {
        el.longPressTimeout = null;
        el._setLongPressTimeout = function (e) {
            var context = this;

            el.longPressTimeout = setTimeout(function () {
                binding.value.call(context, e);
            }, options.duration);
        };

        el._clearLongPressTimeout = function () {
            clearTimeout(el.longPressTimeout);
            el.longPressTimeout = null;
        };

        el.addEventListener('touchstart', el._setLongPressTimeout);
        el.addEventListener('mousedown', el._setLongPressTimeout);
        document.addEventListener('mouseup', el._clearLongPressTimeout);
        document.addEventListener('touchcancel', el._clearLongPressTimeout);
        document.addEventListener('touchend', el._clearLongPressTimeout);
        window.addEventListener('scroll', el._clearLongPressTimeout);
    },
    unbind: function (el) {
        el._clearLongPressTimeout();
        el.removeEventListener('touchstart', el._setLongPressTimeout);
        el.removeEventListener('mousedown', el._setLongPressTimeout);
        document.removeEventListener('mouseup', el._clearLongPressTimeout);
        document.removeEventListener('touchcancel', el._clearLongPressTimeout);
        document.removeEventListener('touchend', el._clearLongPressTimeout);
        window.removeEventListener('scroll', el._clearLongPressTimeout);
    }
};

Vue.directive('long-press', LongPressDirective);

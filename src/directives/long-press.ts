const options = {
    duration: 500
};

export default {
    beforeMount: function (el, binding) {
        el.longPressTimeout = null;
        el._setLongPressTimeout = function (e) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const context = this;

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
    beforeUnmount: function (el) {
        el._clearLongPressTimeout();
        el.removeEventListener('touchstart', el._setLongPressTimeout);
        el.removeEventListener('mousedown', el._setLongPressTimeout);
        document.removeEventListener('mouseup', el._clearLongPressTimeout);
        document.removeEventListener('touchcancel', el._clearLongPressTimeout);
        document.removeEventListener('touchend', el._clearLongPressTimeout);
        window.removeEventListener('scroll', el._clearLongPressTimeout);
    }
};

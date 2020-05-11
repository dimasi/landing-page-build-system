const isTouchDevice = (function() {
    return !!('ontouchstart' in window || navigator.maxTouchPoints);
}());

const tagHtml = document.getElementsByTagName('html')[0];
tagHtml.classList.add(isTouchDevice ? 'touchevents' : 'no-touchevents');

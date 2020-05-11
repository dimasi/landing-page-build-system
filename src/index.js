// Vendor
// import 'modernizr';
import svg4everybody from 'svg4everybody';

// Polyfills
// import 'babel-polyfill';

// Components
import '@/components/button';
import '@/components/sprite-png';
import '@/components/sprite-svg';
import '@/components/touch-detect';

// CSS
import './style.scss';

document.addEventListener('DOMContentLoaded', () => {
    svg4everybody();
});

function testPromise() {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, 3000);
    });
}

testPromise().then(function() {
    console.log('Promise resolve');
});

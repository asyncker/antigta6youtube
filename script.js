// ==UserScript==
// @name         antigta6
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  hidden GTA 6 video from YouTube
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const BLOCK_WORDS = ['gta 6','gta6','gta vi','гта 6','гта6','grand theft auto 6','grand theft auto vi'];
    const DEBUG = true;

    function log(...a){ if (DEBUG) console.log('[antigta6]', ...a); }

    function isBlocked(text){
        const t = (text||'').toLowerCase();
        return BLOCK_WORDS.some(w => t.includes(w));
    }

    function hide(el){
        if (el.dataset.antigta6 === '1') return;
        el.dataset.antigta6 = '1';
        el.style.setProperty('display','none','important');
        log('HIDDEN:', (el.innerText||'').slice(0,80).replace(/\n/g,' '));
    }

    function process(){
        const items = document.querySelectorAll(
            'ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer,' +
            'ytd-compact-video-renderer, ytd-reel-item-renderer,' +
            'ytd-rich-grid-media, ytd-rich-grid-slim-media,' +
            'yt-lockup-view-model'
        );
        if (DEBUG) log('scan items:', items.length);

        items.forEach(el => {
            const titleEl =
                el.querySelector('#video-title') ||
                el.querySelector('a#video-title-link') ||
                el.querySelector('yt-formatted-string#video-title') ||
                el.querySelector('h3 a') ||
                el.querySelector('a.yt-lockup-metadata-view-model__title') ||
                el.querySelector('[title]');
            const title = (titleEl && (titleEl.getAttribute('title') || titleEl.textContent)) || el.innerText;
            if (isBlocked(title)) hide(el);
        });
    }

    let t = null;
    const observer = new MutationObserver(() => {
        if (t) return;
        t = setTimeout(() => { t = null; process(); }, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    process();
    log('started on', location.href);
})();

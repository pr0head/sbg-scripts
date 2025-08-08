// ==UserScript==
// @name SBG Napalm attacker
// @description Allows you to attack multiple catalysts at the same time to counteract the portal's retention by charging.
// @version 0.0.1
// @author https://github.com/pr0head
// @homepage https://github.com/pr0head/sbg-scripts
// @downloadURL https://github.com/pr0head/sbg-scripts/raw/refs/heads/main/public/napalm.user.js
// @updateURL https://github.com/pr0head/sbg-scripts/raw/refs/heads/main/public/napalm.user.js
// @match https://sbg-game.ru/app/*
// @grant none
// @license MIT
// ==/UserScript==

(function() {
    'use strict';

    if (window.location.pathname.startsWith('/login')) { return; }

    if (['interactive', 'complete'].includes(document.readyState)) {
        main();
    }
    else {
        window.addEventListener('DOMContentLoaded', _ => main());
    }

    async function main() {
        //const amounts = [20, 30, 40, 50];
        const amounts = [1,2,3];
        const $block = $('<div class="attack-slider-highlevel"></div>');
        amounts.forEach(val => {
            $block.append(`<button class="attack-napalm" data-value="${val}" style="margin: 0 2px">x${val}</button>`);
        });
        $('.attack-slider-wrp').prepend($block);

        $('.attack-napalm').on('click', function() {
            const val = $(this).data('value');
            console.log(val);
            for (let i = 0; i < val; i++) {
                $('#attack-slider-fire').click();
            }
        });
    }

})();
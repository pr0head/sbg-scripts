// ==UserScript==
// @name SBG Point repairer
// @description Retrieves a list of keys from the inventory and charges each one fully.
// @version 0.0.1
// @author https://github.com/pr0head
// @homepage https://github.com/pr0head/sbg-scripts
// @downloadURL https://github.com/pr0head/sbg-scripts/raw/refs/heads/main/public/repairer.user.js
// @updateURL https://github.com/pr0head/sbg-scripts/raw/refs/heads/main/public/repairer.user.js
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

    const onlyRepairGuard = true; // Заряжать только точки где я владелец
    const myTeamID = 2;

    async function main() {
        console.log("loaded");
        $('.inventory').find('.inventory__controls').append('<button>Починятор</button>');
        $(document).on('click', '.inventory__controls button', function() {
            repair();
        });
    }

    async function repair() {
        $.get('https://sbg-game.ru/api/inventory', async function(data) {
            console.log('Fetching inventory...');
            const items = data.i.filter(item => item.t == 3);

            for (const item of items) {
                const delay = Math.floor(Math.random() * 501) + 500;
                await new Promise(res => setTimeout(res, delay));
                processKey(item.l, item.ti);
            }

            console.log('Done');
        });
    }

    function processKey(id, name) {
        $.get('https://sbg-game.ru/api/point', {guid: id, status: 1}, async function(data) {
            if (onlyRepairGuard && data.data.gu == null) {
                console.log(`It's not a guard: ${name}`);
                return;
            }

            if (data.data.te != myTeamID) {
                console.log(`My team does't own a point: ${name}`);
                return;
            }

            if (data.data.e == myTeamID) {
                console.log(`Already fully charged: ${name}`);
                return;
            }

            repairPoint(id, name);
        });
    }

    function repairPoint(id, name) {
        $.post('https://sbg-game.ru/api/repair', {guid: id, position: [0,0]}, async function(data) {
            if (data && data.data && data.xp) {
                console.log(`Fixed the point ${name}`);
                const delay = Math.floor(Math.random() * 501) + 500;
                await new Promise(res => setTimeout(res, delay));
                repairPoint(id, name);
                return;
            }

            if (data && data.error === "Точка полностью починена") {
                console.log(`The point ${name} is completely fixed!`);
                return;
            }

            console.error(`Unknown response during point repair ${name}:`, data);
            return;
        }).fail(function(err) {
            console.error(`Network or server error during point repair ${name}:`, err);
        });
    }

})();
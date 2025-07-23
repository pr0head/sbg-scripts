// ==UserScript==
// @name SBG Point charger
// @description Retrieves a list of keys from the inventory and charges each one fully.
// @version 0.0.1
// @author https://github.com/pr0head
// @homepage https://github.com/pr0head/sbg-scripts
// @downloadURL https://github.com/pr0head/sbg-scripts/raw/refs/heads/main/public/charger.user.js
// @updateURL https://github.com/pr0head/sbg-scripts/raw/refs/heads/main/public/charger.user.js
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

    const onlyRepairGuard = true; // Заряжать только точки, где я владелец
    const defaultButtonValue = 'Зарядить';
    const progressButtonValue = 'Заряжается';

    let myTeamID = 0;
    let inProgress = false;

    async function main() {
        $.get('https://sbg-game.ru/api/self', async function(data) {
            if (data.t !== undefined) {
                myTeamID = data.t

                $('.inventory').find('.inventory__controls').append(`<button id="chargerBtn">${defaultButtonValue}</button>`);
                $('#chargerBtn').on('click', function() {
                    if (inProgress) {
                        window.alert("Зарядка еще не завершена");
                        return;
                    }

                    $('#chargerBtn').text(progressButtonValue);
                    inProgress = true;
                    repair();
                });
            } else {
                console.error(`My team is undefined`, err);
            }
        }).fail(function(err) {
            console.error(`Network or server error during getting self`, err);
        });
    }

    async function repair() {
        $.get('https://sbg-game.ru/api/inventory', async function(data) {
            console.log('Fetching inventory...');
            const items = data.i.filter(item => item.t === 3);

            for (const item of items) {
                const delay = Math.floor(Math.random() * 501) + 500;
                await new Promise(res => setTimeout(res, delay));
                processKey(item.l, item.ti);
            }

            $('#chargerBtn').text(defaultButtonValue);
            inProgress = false;

            console.log('Done');
        });
    }

    function processKey(id, name) {
        $.get('https://sbg-game.ru/api/point', {guid: id, status: 1}, async function(data) {
            if (onlyRepairGuard && data.data.gu == null) {
                console.log(`It's not a guard: ${name}`);
                return;
            }

            if (data.data.te !== myTeamID) {
                console.log(`My team doesn't own a point: ${name}`);
                return;
            }

            if (data.data.e === myTeamID) {
                console.log(`Already fully charged: ${name}`);
                return;
            }

            repairPoint(id, name);
        });
    }

    function repairPoint(id, name) {
        $.post('https://sbg-game.ru/api/repair', {guid: id, position: [0,0]}, async function(data) {
            if (data && data.data && data.xp) {
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
        }).fail(function(err) {
            console.error(`Network or server error during point repair ${name}:`, err);
        });
    }

})();
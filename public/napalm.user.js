// ==UserScript==
// @name SBG Napalm attacker
// @description Allows you to attack multiple catalysts at the same time to counteract the portal's retention by charging.
// @version 0.0.4
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

    // Уровень катализаторов и их кол-во для уничтожения точки максимального уровня с расстояния 0(min) и 40(max) метров
    const destroySettings = {
        //1: {'min': 69, 'max': 1300},
        //2: {'min': 37, 'max': 217},
        //3: {'min': 29, 'max': 93},
        4: {'min': 16, 'max': 35},
        5: {'min': 12, 'max': 21},
        6: {'min': 8, 'max': 13},
        7: {'min': 7, 'max': 10},
        8: {'min': 5, 'max': 7},
        9: {'min': 4, 'max': 5},
        10: {'min': 4, 'max': 4}
    };
    // Минимальный поддерживаемый уровень катализаторов для напалма
    const $block = $('<div style="position: absolute; width: 100%; margin-top: -39px; text-align: center; display: none"></div>');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const $element = $(mutation.target);
                //console.log('Проверяется элемент:', $element.prop('tagName'), $element.attr('class')); // Дебаг
                if ($element.hasClass('is-active')) {
                    const selectedLevel = Number($element.attr('data-level'));
                    draw(selectedLevel);
                }
            }
        });
    });
    const listObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                //console.log('Добавлены узлы:', mutation.addedNodes); // Дебаг
                $(mutation.addedNodes).filter('li').each(function() {
                    //console.log('Новый <li> обнаружен:', $(this).text().trim()); // Дебаг
                    observer.observe(this, { attributes: true, attributeFilter: ['class'] });
                });
            }
        });
    });

    if (['interactive', 'complete'].includes(document.readyState)) {
        main();
    }
    else {
        window.addEventListener('DOMContentLoaded', _ => main());
    }

    async function main() {
        const $list = $('#catalysers-list');
        $('.attack-slider-wrp').prepend($block);
        observeListItems();

        if ($list.length) {
            $('#attack-menu').on('click', function() {
                $block.toggle();
                setTimeout(function(){
                    const selectedLevel = Number($list.find('li.is-active').attr('data-level'));
                    draw(selectedLevel);
                }, 500);
            });

            console.log('Список #catalysers-list найден, наблюдение начато'); // Дебаг
            listObserver.observe($list[0], { childList: true, subtree: false });
        } else {
            console.error('Список #catalysers-list не найден в DOM');
        }
    }

    // Функция для настройки наблюдения за <li>
    function observeListItems() {
        const $listItems = $('#catalysers-list li');
        if ($listItems.length === 0) {
            console.warn('На момент запуска <li> не найдены в #catalysers-list');
        } else {
            console.log('Найдено <li>:', $listItems.length); // Дебаг
        }
        $listItems.each(function() {
            observer.observe(this, { attributes: true, attributeFilter: ['class'] });
        });
    }

    function draw(selectedLevel) {
        $block.empty();

        if (!Number.isInteger(selectedLevel)) {
            console.log('Уровень катализатора не найден', selectedLevel);
            return;
        }

        if (!(selectedLevel in destroySettings)) {
            console.log('Неподдерживаемый катализатор ', selectedLevel);
            return;
        }

        const settings = destroySettings[selectedLevel];
        const minAmounts = Math.ceil((settings['min'] + settings['max'])/2);
        const amounts = [minAmounts, minAmounts*2, minAmounts*4];

        amounts.forEach(val => {
            $block.append(`<button class="attack-napalm" data-value="${val}" style="margin: 0 4px">x${val}</button>`);
        });

        $('.attack-napalm').on('click', function() {
            const val = $(this).data('value');
            console.log('Napalm attack: ', val);
            napalm(val);
        });
    };

    function napalm(count) {
        for (let i = 0; i < count; i++) {
            $('#attack-slider-fire').click();
        }
    };

})();

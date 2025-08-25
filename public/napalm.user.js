// ==UserScript==
// @name SBG Napalm attacker
// @description Allows you to attack multiple catalysts at the same time to counteract the portal's retention by charging.
// @version 0.0.2
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

    // Уровень катализаторов и их кол-во для уничтожения точки максимального уровня с расстояния 0(min) и 40(max) метров
    const destroySettings = {
        //'I': {'min': 69, 'max': 1300},
        //'II': {'min': 37, 'max': 217},
        //'III': {'min': 29, 'max': 93},
        'IV': {'min': 16, 'max': 35},
        'V': {'min': 12, 'max': 21},
        'VI': {'min': 8, 'max': 13},
        'VII': {'min': 7, 'max': 10},
        'VIII': {'min': 5, 'max': 7},
        'IX': {'min': 4, 'max': 5},
        'X': {'min': 4, 'max': 4}
    };
    // Минимальный поддерживаемый уровень катализаторов для напалма
    const $block = $('<div style="text-align: center; margin-bottom: 5px; display: none"></div>');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const $element = $(mutation.target);
                //console.log('Проверяется элемент:', $element.prop('tagName'), $element.attr('class')); // Дебаг
                if ($element.hasClass('is-active')) {
                    //console.log('Активный элемент:', $element.find(".catalysers-list__level").text().trim()); // Дебаг
                    draw($element.find(".catalysers-list__level").text().trim());
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

    async function main() {
        const $list = $('#catalysers-list');
        $('.attack-slider-wrp').prepend($block);
        observeListItems();

        if ($list.length) {
            $('#attack-menu').on('click', function() {
                $block.toggle();
                setTimeout(function(){
                    draw($list.find("li.is-active").find(".catalysers-list__level").text().trim());
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

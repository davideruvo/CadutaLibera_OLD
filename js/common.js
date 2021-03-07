var constants = {
    showChar: '%',
    space: ' ',
    mode: {
        home: 'home',
        presenter: 'presenter',
        single: 'single',
        multi: 'multi'
    },
    messageType: {
        info: 'info',
        warning: 'warning',
        error: 'error'
    }
};
var storage = {
    session: customStorage(sessionStorage),
    local: customStorage(localStorage)
}

//AJAX
function ajaxCall(url, method, options) {
    var opt = $.extend(true, {
        param: {},
        success_callback: null,
        error_callback: null
    }, options);

    $.ajax({
        type: method.toUpperCase(),
        url: url,
        data: JSON.stringify(opt.param),
        dataType: "json",
        contentType: "application/json;charset=utf-8"
    })
        .done(function (result) {
            if (typeof opt.success_callback === 'function') {
                opt.success_callback(result);
            }
        }).fail(function (request, error) {
            if (typeof opt.error_callback === 'function') {
                var errorObj = {
                    error: error,
                    errorDes: request.statusText,
                };
                opt.error_callback(errorObj);
            }
        });
}

//Common
preventRightClick();
function isLetter(c) {
    return new RegExp(/[\wÀÈÉÌÒÙàèéìòù]/).test(c);
}
function getUniqueId() {
    return 'id-' + (Date.now() + Math.random()).toString().replace('.', '');
}
function arrayContains(array, value) {
    return $.inArray(value, array) > -1;
}
function encode(v) {
    return btoa(JSON.stringify(v));
}
function decode(v) {
    var res = atob(v);
    if (typeof res === 'undefined') return null;
    return JSON.parse(res);
}
function randomNumber(min, max) {
    // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function getQueryString() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
function preventRefresh() {
    var exists = storage.session.get('currentWindow');
    if (exists) { window.close(); }
    else { storage.session.set('currentWindow', 1); }
}
function preventRightClick() {
    $(document).on('contextmenu', function (ev) {
        ev.preventDefault();
    });
}

//Foot
function getFootDiv(options) {
    var opt = $.extend(true, {
        side: '', // left/right ('' = both)
        opacity: 100, // 30/60/100
        white: false
    }, options);
    var bgUrl = 'url(./img/'
        + opt.side.substr(0, 1) + 'footprint'
        + (opt.white ? '-w' : '')
        + (opt.opacity === 30 ? '-03' : opt.opacity === 60 ? '-06' : '')
        + '.svg)';
    var res = $('<div>')
        .addClass('foot').addClass(opt.side !== '' ? 'foot-' + opt.side : '')
        .css('background-image', bgUrl)
        .css('background-size', 'contain')
        .css('background-repeat', 'no-repeat');
    if (opt.side === 'left') res.css('background-position', 'right');
    if (opt.side === 'right') res.css('background-position', 'left');
    return res;
}

//Logo
function createLogo(options) {
    var opt = $.extend(true, {
        container: $('.main')
    }, options);

    var logo = $('<div>').addClass('logo')
        .append(getFootDiv({ side: 'left' }))
        .append(getFootDiv({ side: 'right' }))
    opt.container.append($('<div>').addClass('logo-container').append(logo));
}

//Messages
function registerMessages(actions) {
    //actions = array of actions
    //e.g.		[{action: 'myAction', callback: myFunction},
    //			[{action: 'myAction2', callback: myFunction2}]
    $(window).on('message', function (ev) {
        var msgData = ev.originalEvent.data;
        var action = $.grep(actions, function (x) { return x.action === msgData.action; });
        if (action.length > 0) {
            if (typeof action[0].callback === 'function') {
                action[0].callback(msgData.data);
            }
        }
    });
}
function sendMessage(target, messageAction, messageData) {
    target.postMessage({
        action: messageAction ? messageAction : '',
        data: messageData ? messageData : {}
    }, '*');
}

//Modal and Popup
function openModal(options) {
    var opt = $.extend(true, {
        id: '',
        type: '',
        content: '',
        buttons: []
    }, options);
    if (opt.id === '') {
        opt.id = getUniqueId();
        $('body').append($('<div>').attr('id', opt.id));
    }
    if (opt.content !== '') {
        $('#' + opt.id).html('').append(opt.content);
    }
    if (opt.buttons.length > 0) {
        var buttonsContainer = $('<div>').addClass('modal-buttons');
        $('#' + opt.id).append(buttonsContainer);
        $.each(opt.buttons, function (i, e) {
            buttonsContainer.append($('<button>').tooltip({ content: e.tooltip, type: constants.messageType.info }).addClass(e.cssClass)
                .append($('<i>').addClass('bi bi-' + e.icon))
                .append(e.text)
                .on('click', function () {
                    if (typeof e.click === 'function') {
                        e.click();
                    }
                    if (e.close) {
                        $.modal.close();
                    }
                })
            );
        });
    }
    $('#' + opt.id).addClass(opt.type);
    $('#' + opt.id).modal({ showClose: false });
    return opt.id;
}
function openPopup(options) {
    var opt = $.extend(true, {
        url: '',
        target: '',
        top: null,
        left: null,
        height: null,
        width: null
    }, options);
    var specs = [];
    if (opt.top !== null) { specs.push('top=' + opt.top); }
    if (opt.left !== null) { specs.push('left=' + opt.left); }
    if (opt.height !== null) { specs.push('height=' + opt.height); }
    if (opt.width !== null) { specs.push('width=' + opt.width); }
    return window.open(opt.url, opt.target, specs.join(','));
}

// Mode
function getMode() {
    for (var m in constants.mode) {
        if ($('.page').hasClass(constants.mode[m])) {
            return constants.mode[m];
        }
    }
}
function setMode(options) {
    var opt = $.extend(true, {
        container: $('.controls'),
        mode: constants.mode.home,
        actions: {
            exit: {
                icon: 'box-arrow-left',
                tooltip: 'Esci',
                cssClass: '',
                callback: null,
                modes: [constants.mode.single, constants.mode.multi]
            },
            settings: {
                icon: 'gear',
                tooltip: 'Impostazioni',
                cssClass: '',
                callback: null,
                modes: [constants.mode.home]
            },
            presenter: {
                icon: 'person-square',
                tooltip: 'Apri finestra conduttore',
                cssClass: '',
                callback: null,
                modes: [constants.mode.home]
            },
            single: {
                icon: 'play',
                tooltip: 'Inizia',
                cssClass: '',
                callback: null,
                modes: [constants.mode.home, constants.mode.presenter]
            },
            multi: {
                icon: 'collection-play',
                tooltip: 'Inizia serie',
                cssClass: '',
                callback: null,
                modes: []
                //modes: [constants.mode.home, constants.mode.presenter]
            },
            next: {
                icon: 'skip-end',
                tooltip: 'Prossima domanda',
                cssClass: '',
                callback: null,
                modes: [constants.mode.single, constants.mode.multi]
            },
            solution: {
                icon: 'spellcheck',
                tooltip: 'Mostra soluzione',
                cssClass: '',
                callback: null,
                modes: [constants.mode.single, constants.mode.multi]
            },
            correct: {
                icon: 'hand-thumbs-up',
                tooltip: 'Risposta esatta',
                cssClass: '',
                callback: null,
                modes: [constants.mode.single, constants.mode.multi]
            }
        },
        exitConfirm: 'Sei sicuro di voler uscire?',
        questionFocus: null
    }, options);
    if (!$('.page').hasClass(opt.mode)) {
        for (var m in constants.mode) {
            $('.page').removeClass(constants.mode[m]);
        }
        $('.page').addClass(opt.mode);
    }
    opt.container.html('').addClass('btn-group');
    for (var a in opt.actions) {
        var action = opt.actions[a];
        if (!arrayContains(action.modes, opt.mode) || typeof action.callback !== 'function') { continue; }
        var onClick = action.callback;
        var hidden = false;
        if (a === 'next') {
            var nextCallback = action.callback;
            if (opt.mode === constants.mode.single) {
                onClick = function (ev) {
                    nextCallback(ev);
                    $('.btn-solution, .btn-correct').removeClass('hidden');
                    $(this).addClass('hidden')
                    if (opt.questionFocus !== null) {
                        $(opt.questionFocus).focus();
                    }
                };
            }
            else if (opt.mode === constants.mode.multi) {
                onClick = function (ev) {
                    nextCallback(ev);
                    if (opt.questionFocus !== null) {
                        $(opt.questionFocus).focus();
                    }
                };
            }
        }
        else if (a === 'solution') {
            if (opt.mode === constants.mode.single) {
                var solutionCallback = action.callback;
                hidden = true;
                onClick = function (ev) {
                    solutionCallback(ev);
                    $('.btn-next').removeClass('hidden');
                    $('.btn-correct').addClass('hidden');
                    $(this).addClass('hidden');
                };
            }
        }
        else if (a === 'correct') {
            if (opt.mode === constants.mode.single) {
                var correctCallback = action.callback;
                hidden = true;
                onClick = function (ev) {
                    correctCallback(ev);
                    $('.btn-next').removeClass('hidden');
                    $('.btn-solution').addClass('hidden');
                    $(this).addClass('hidden');
                };
            }
        }
        else if (a === 'exit') {
            var exitCallback = action.callback;
            onClick = function (ev) {
                openModal({
                    content: opt.exitConfirm,
                    buttons: [
                        {
                            text: 'Sì', cssClass: 'btn btn-round', close: true, click: function (ev) {
                                if (typeof exitCallback === 'function') {
                                    exitCallback(ev);
                                }
                            }
                        },
                        { text: 'No', cssClass: 'btn btn-round', close: true },
                    ]
                });
            };
        }
        opt.container.append($('<button>').tooltip({ content: action.tooltip, type: constants.messageType.info, left: true }).addClass('btn-' + a).addClass(hidden ? 'hidden' : '').addClass(action.cssClass).addClass('btn btn-circle shadow')
            .append($('<i>').addClass('bi bi-' + action.icon))
            .on('click', onClick)
        );
    }
}

//Question Area
function initQuestion(options) {
    var opt = $.extend(true, { selector: '.question' }, options);
    $(opt.selector).html('')
        .append($('<div>').addClass('definition'))
        .append($('<div>').addClass('word-container'));
}
function clearQuestion(options) {
    stopTimer();
    var opt = $.extend(true, { selector: '.question' }, options);
    $(opt.selector).hide();
    $(opt.selector + ' .definition, ' + opt.selector + ' .word-container').html('');
    $(opt.selector + ' .question-timer').remove();
    $(opt.selector + ' .fill-info').remove();
}
function loadQuestion(options) {
    questionTimer = null;
    timerContainer = null;
    var opt = $.extend(true, {
        selector: '.question',
        question: null,
        time: 0,
        solution: {
            allowTyping: true,
            showSolution: false,
            useAlternateForSolution: false,
            answer_callback: null
        },
        expired_callback: null
    }, options);
    clearQuestion();
    if (opt.question === null) return;
    var q = decode(opt.question);
    $(opt.selector + ' .definition').html(q.definition);
    loadWord($.extend(true, {
        question: q,
        isEncoded: false
    }, opt.solution));
    if (opt.solution.allowTyping) {
        var infoText = '<center>Scrivi la soluzione nel tempo disponibile, digitando anche le lettere già presenti.<br/>' +
            'Spazi e segni di punteggiatura sono facoltativi.<br/>' +
            'Se devi ricominciare a digitare premi Invio.</center>';
        var fillInfo = $('<div>').addClass('fill-info')
            .append($('<i>').addClass('bi bi-question-square-fill').tooltip({ content: infoText, type: constants.messageType.info }));
        $(opt.selector).append(fillInfo);
    }
    if (opt.time > 0) {
        questionTimer = $('<div>').addClass('timer');
        timerContainer = $('<div>').addClass('question-timer')
            .append(getFootDiv({ side: 'right' }))
            .append(questionTimer)
            .append(getFootDiv({ side: 'left' }))
            ;
        $(opt.selector).append(timerContainer);
        questionTimer.timer({ value: opt.time * 1000, autoStart: false });
        setTimeout(function () { startTimer() }, 0);
        $('.btn-solution').hide();
    }
    $(opt.selector).show();

    function startTimer() {
        questionTimer.addClass('ready');
        var almostExpired = 0;
        if (opt.time > 10) {
            almostExpired = 6.5;
        }
        questionTimer.timer({
            value: opt.time * 1000, almostExpired: almostExpired * 1000,
            almostExpired_repeat: {
                interval: 500,
                callback: function () {
                    timerContainer.toggleClass('inverted');
                    questionTimer.toggleClass('negative');
                }
            },
            expired_callback: function () {
                timerContainer.addClass('inverted');
                questionTimer.addClass('negative');
                $('.btn-solution').show();
                if (typeof opt.expired_callback === 'function') {
                    opt.expired_callback();
                }
                loadWord({
                    question: q,
                    isEncoded: false,
                    allowTyping: false
                });
            }
        });
    }
}
function loadWord(options) {
    var opt = $.extend(true, {
        selector: '.question',
        question: null,
        isEncoded: true,
        allowTyping: true,
        showSolution: false,
        useAlternateForSolution: false,
        answer_callback: null
    }, options);
    if (opt.question === null) return;
    stopTimer();
    var q = opt.isEncoded ? decode(opt.question) : opt.question;
    $(opt.selector + ' .word-container').html('');
    var word = $('<div>').addClass('word');
    $.each(q.letters, function (i, e) {
        if (e.value === constants.space) {
            $('.word-container').append(word);
            word = $('<div>').addClass('word');
        }
        else {
            var letter = $('<div>').addClass('letter').addClass('letter-box')
                .addClass(opt.useAlternateForSolution && isLetter(e.value) && e.hidden ? 'letter-box-alt' : '')
                .append(!opt.showSolution && isLetter(e.value) && e.hidden ? '' : e.value);
            word.append(letter);
        }
    });
    $(opt.selector + ' .word-container').append(word);
    destroyFill();
    //Typing solution
    if (opt.allowTyping && !opt.showSolution) {
        resetFill();
    }
    function resetFill() {
        destroyFill();
        $(opt.selector).addClass('filling').attr('tabindex', 0).on('keypress', function (ev) {
            key = ev.originalEvent.key;
            if (key === 'Enter') {
                resetFill();
                return;
            }
            var currLetter = $(opt.selector + ' .letter-box.filling').first();
            if (!isLetter(key) && key !== currLetter.html()) { return; }
            currLetter.removeClass('filling');
            var prev = currLetter.html();
            if (prev === '') {
                currLetter.html(key);
            }
            currLetter.addClass(prev === '' ? 'filled' : 'filled-prev');
            if ($(opt.selector + ' .letter-box.filling').length === 0) {
                checkFill();
            }
        });
        $(opt.selector + ' .letter-box').each(function (i, e) {
            var val = $(e).html();
            if (val === '' || isLetter(val)) {
                $(e).addClass('filling');
            }
        });
        $(opt.selector + ' .letter-box.filled').html('').removeClass('filled');
        $(opt.selector + ' .letter-box.filled-prev').removeClass('filled-prev');
        $(opt.selector).focus();
    }
    function destroyFill() {
        $(opt.selector).removeClass('filling').removeAttr('tabindex').off('keypress');
    }
    function checkFill() {
        var solution = $.map(q.letters, function (x) { return x.value; }).join('');
        var words = [];
        $(opt.selector + ' .word').each(function (i, w) {
            var word = '';
            $(w).find('.letter-box').each(function (ii, l) {
                word += $(l).html().toUpperCase();
            });
            words.push(word);
        });
        if (words.join(' ') === solution) { //Correct
            destroyFill();
            stopTimer();
            $('.btn-solution').addClass('hidden');
            $('.btn-next').removeClass('hidden');
            if (typeof opt.answer_callback === 'function') {
                opt.answer_callback(true);
            }
        }
        else { //Uncorrect
            resetFill();
            if (typeof opt.answer_callback === 'function') {
                opt.answer_callback(false);
            }
        }
    }
}
function stopTimer() {
    if (typeof questionTimer !== 'undefined' && questionTimer !== null) {
        questionTimer.stopTimer();
        questionTimer.parent().toggleClass('inverted', questionTimer.isExpired());
        questionTimer.toggleClass('negative', questionTimer.isExpired());
    }
}

//Questions
function getQuestions(options) {
    var _data = [];
    if (typeof getData === 'function') {
        _data = decode(getData());
    }
    var _opt = $.extend(true, {
        loop: true,
        useSession: true
    }, options);
    var self = {
        pick: function (n) {
            if (typeof n === 'undefined') { n = 1; }
            if (_data.length < n) return null;
            var i = iQuestion;
            var q = encode(pickQuestion(0, n));
            return { q: q, i: i, n: n, tot: _data.length };
        }
    };
    var iQuestion = 1;
    var data = [];
    var sessionKey = 'questions';
    function pickQuestion(i, n) {
        setData(n);
        if (data.length < n) return null;
        var res = takeQuestion(i, n);
        $.each(res, function (i, e) {
            formatQuestion(e);
        });
        if (n === 1) { res = res[0]; }
        return res;
    }
    function takeQuestion(i, n) {
        var res = data.splice(i, n);
        iQuestion = iQuestion + n;
        if (iQuestion > _data.length) {
            iQuestion = 1;
        }
        if (_opt.useSession) {
            storage.session.set(sessionKey, { data: data, iQuestion: iQuestion });
        }
        return res;
    }
    function formatQuestion(q) {
        q.letters = [];
        var wLetters = q.word.toUpperCase().split('');
        for (var i = 0; i < wLetters.length; i++) {
            var l = wLetters[wLetters[i] === constants.showChar ? i + 1 : i];
            q.letters.push({ value: l, hidden: wLetters[i] !== constants.showChar });
            if (wLetters[i] === constants.showChar) { i++; }
        }
        return q;
    }
    function setData(min) {
        if (_opt.useSession) {
            if (storage.session.exists(sessionKey)) {
                data = storage.session.get(sessionKey).data;
                iQuestion = storage.session.get(sessionKey).iQuestion;
                if (_opt.loop && typeof min !== 'undefined' && data.length < min) {
                    data = data.concat(_data);
                }
            }
            else {
                storage.session.set(sessionKey, { data: _data, iQuestion: iQuestion });
            }
        }
        else {
            if (_opt.loop) {
                data = data.concat(_data);
            }
            else {
                data = _data;
            }
        }
    }
    setData();
    return self;
}

//Storage
function customStorage(storage) {
    var self = {
        clear: function () { storage.clear(); },
        exists: function (k) {
            return typeof storage[encode(k)] !== 'undefined';
        },
        get: function (k) {
            var res = storage[encode(k)];
            if (typeof res === 'undefined') return null;
            return decode(res);
        },
        getArray: function (k) {
            var res = self.get(k);
            return res !== null ? res : [];
        },
        set: function (k, v) {
            if (typeof v === 'undefined') return;
            storage.setItem(encode(k), encode(v));
        },
        remove: function (k) {
            storage.removeItem(encode(k));
        }
    };
    return self;
};

//Window Unload
function registerWindowUnload(process, prevent) {
    if (typeof process === 'function') {
        $(window).on('beforeunload', function (ev) {
            process(ev);
            if (typeof prevent === 'function' && prevent()) {
                return false;
            }
        });
    }
}
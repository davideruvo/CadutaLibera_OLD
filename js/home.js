$(document).ready(function () {
    var game = null;
    init();

    //Init
    function init() {
        initGame();
        destroyPresenter();
        createLogo();
        initSettings();
        initHome();
        initQuestion();
        registerWindowUnload(destroy);
        registerMessages([
            { action: 'startPresenterGame', callback: startPresenterGame },
            { action: 'endGame', callback: endGame },
            { action: 'nextQuestion', callback: nextQuestion },
            { action: 'showPresenterSolution', callback: showPresenterSolution },
            { action: 'closePresenter', callback: closePresenter }
        ]);
    }
    function destroy() {
        destroyPresenter();
    }

    //Gameplay
    function initGame() {
        game = {
            questions: null,
            currentQuestion: null,
            settings: { time: 30 /*,countMulti: 10*/ },
            score: { correct: 0, total: 0 },
            windowPresenter: null
        };
    }
    function initQuestions(callback) {
        getQuestions({
            callback: function (q) {
                game.questions = q;
                if (typeof callback === 'function') {
                    if (game.questions.count === 0) {
                        openModal({
                            type: constants.messageType.warning,
                            content: 'Nessuna domanda disponibile'
                        });
                    }
                    callback(game.questions.count > 0);
                }
            }
        });
    }
    function initHome() {
        setMode({
            actions: game.windowPresenter !== null ? {} :
                {
                    settings: { callback: openSettings },
                    presenter: { callback: createPresenter },
                    single: { callback: initSingle },
                    multi: { callback: initMulti }
                }
        });
    }
    function initSingle() {
        initQuestions(function (res) {
            if (!res) { return; }
            setMode({
                mode: constants.mode.single,
                actions: {
                    exit: { callback: endGame },
                    next: { callback: nextQuestion },
                    solution: { callback: showSolution }
                },
                questionFocus: game.windowPresenter === null ? '.question' : null
            });
            $('.head-title').html('')
                .append($('<i>').addClass('bi bi-award-fill'))
                .append($('<span>').html('Punteggio'));
            showScore();
        });
    }
    function initMulti() {
        initQuestions(function (res) {
            if (!res) { return; }
            setMode({
                mode: constants.mode.multi,
                actions: {
                    exit: { callback: endGame },
                    next: { callback: nextQuestion },
                    solution: { callback: showSolution }
                },
                questionFocus: game.windowPresenter === null ? '.question' : null
            });
            $('.head-title').html('')
                .append($('<i>').addClass('bi bi-award-fill'))
                .append($('<span>').html('Punteggio'));
            showScore();
        });
    }
    function startPresenterGame(mode) {
        initQuestions(function (res) {
            if (!res) {
                destroyPresenter(true);
                return;
            }
            $('.head-title').html('')
                .append($('<i>').addClass('bi bi-award-fill'))
                .append($('<span>').html('Punteggio'));
            setMode({ mode: mode });
            showScore();
        });
    }
    function endGame() {
        $('.head-title').html('');
        resetScore(true);
        clearQuestion();
        initHome();
    }
    function nextQuestion() {
        var q = game.questions.pick();
        game.currentQuestion = q.q;
        loadQuestion({
            question: game.currentQuestion,
            time: game.settings.time,
            solution: {
                allowTyping: game.windowPresenter === null,
                answer_callback: game.windowPresenter !== null ? null : function (result) {
                    if (result) {
                        updateScore(true);
                    }
                }
            },
            expired_callback: function () {
                if (game.windowPresenter !== null) {
                    sendMessage(game.windowPresenter, 'timeExpired');
                }
            }
        });
        if (game.windowPresenter !== null) {
            sendMessage(game.windowPresenter, 'questionLoaded', q);
        }
    }
    function showSolution() {
        loadWord({
            question: game.currentQuestion,
            showSolution: true
        });
        updateScore(false);
    }
    function showPresenterSolution(result) {
        loadWord({
            question: game.currentQuestion,
            showSolution: true
        });
        updateScore(result.correct);
    }
    function updateScore(correct) {
        game.score.total++;
        if (correct) {
            game.score.correct++;
        }
        showScore();
    }
    function resetScore(empty) {
        game.score = { total: 0, correct: 0 };
        showScore(empty);
    }
    function showScore(empty) {
        var scoreText = empty ? '' : game.score.correct + (game.score.total === 0 ? '' : ' su ' + game.score.total);
        $('.head-score').html(scoreText);
        if (game.windowPresenter !== null) {
            sendMessage(game.windowPresenter, 'showScore', { text: scoreText });
        }
    }

    //Presenter
    function createPresenter() {
        game.windowPresenter = openPopup({
            url: './Presenter.html',
            target: 'cadutalibera_presenter'
        });
        if (game.windowPresenter !== null) {
            setMode(); //Home senza comandi
        }
    }
    function closePresenter() {
        destroyPresenter(false);
        endGame();
    }
    function destroyPresenter(close) {
        if (typeof close === 'undefined') {
            close = true;
        }
        if (close && game.windowPresenter !== null) {
            game.windowPresenter.close();
        }
        game.windowPresenter = null;
    }

    //Settings
    function initSettings() {
        $('.settings').html('');
        var optionsContainer = $('<div>').addClass('list-group');
        $('.settings').append(optionsContainer);
        if (typeof game.settings.time !== 'undefined') {
            var counterTime = $('<div>')
                .numericCounter({
                    value: game.settings.time,
                    min: 0,
                    max: 60,
                    step: 5,
                    icons: {
                        up: 'bi bi-caret-up',
                        down: 'bi bi-caret-down'
                    },
                    change: function (v) {
                        game.settings.time = v;
                    }
                });
            var optTime = $('<div>').addClass('list-group-item')
                .append($('<div>').addClass('col pad-5 w-75').text('Tempo per domanda')
                    .append($('<span>').addClass('info').tooltip({
                        type: constants.messageType.info,
                        icon: 'bi bi-question-circle-fill',
                        content: 'Numero di secondi a disposizione per ogni domanda (0 = tempo illimitato)'
                    })))
                .append($('<div>').addClass('col pad-5 w-25 right').append(counterTime));
            $(optionsContainer).append(optTime);
        }
        if (typeof game.settings.countMulti !== 'undefined') {
            var counterCount = $('<div>')
                .numericCounter({
                    value: game.settings.countMulti,
                    min: 5,
                    max: 20,
                    step: 5,
                    icons: {
                        up: 'bi bi-caret-up',
                        down: 'bi bi-caret-down'
                    },
                    change: function (v) {
                        game.settings.countMulti = v;
                    }
                });
            var optCount = $('<div>').addClass('list-group-item')
                .append($('<div>').addClass('col pad-5 w-75').text('Domande per serie')
                    .append($('<span>').tooltip({
                        type: constants.messageType.info,
                        icon: 'bi bi-question-circle-fill',
                        content: 'Numero di domande in una serie'
                    })))
                .append($('<div>').addClass('col pad-5 w-25 right').append(counterCount));
            $(optionsContainer).append(optCount);
        }
        var btnDataManager = $('<button>').addClass('btn btn-round').append('Gestione dati')
            .on('click', function () {
                openPopup({ url: './DataManager.html', target: '_new' });
                $.modal.close();
            });
        var optDataManager = $('<div>').addClass('list-group-item')
            .append($('<div>').addClass('col pad-5 w-75'))
            .append($('<div>').addClass('col pad-5 w-25 center').append(btnDataManager));
        $(optionsContainer).append(optDataManager);
    }
    function openSettings() {
        openModal({ id: 'settings' });
    }

});
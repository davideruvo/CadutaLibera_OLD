$(document).ready(function(){
	var game = null;	
	init();
	
	//Init
	function init(){
		restoreGame();
		destroyPresenter();
		createLogo();
		initSettings();
		initHome();
		initQuestion();
		registerWindowUnload(destroy);
		registerMessages([
			{action: 'startPresenterGame', callback: startPresenterGame },
			{action: 'endGame', callback: endGame },
			{action: 'nextQuestion', callback: nextQuestion },
			{action: 'showPresenterSolution', callback: showPresenterSolution },
			{action: 'closePresenter', callback: closePresenter }
		]);
	}
	function destroy(){
		destroyPresenter();
	}
	
	//Gameplay
	function initGame(){
		game = {
			questions: getQuestions(),
			currentQuestion: null,
			settings: { time: 30 /*,countMulti: 10*/ },
			score: { correct: 0, total: 0},
			windowPresenter: null
		};
	}
	function saveGame(){
		storage.session.set('game', { settings: game.settings, score: game.score });
	}
	function restoreGame(){
		if (game === null){ initGame(); }
		if (storage.session.exists('game')){
			$.extend(true, game, storage.session.get('game'));
		}
		else {
			saveGame();
		}
	}
	function initHome(){
		setMode({
			actions: game.windowPresenter != null ? {} :
			{
				settings: { callback: openSettings },
				presenter: { callback: createPresenter },
				single: { callback: initSingle },
				multi: { callback: initMulti }
			}
		});
	}	
	function initSingle(){
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
	}
	function initMulti(){
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
	}
	function startPresenterGame(mode){
		$('.head-title').html('')
			.append($('<i>').addClass('bi bi-award-fill'))
			.append($('<span>').html('Punteggio'));
		setMode({ mode:mode});
		showScore();
	}
	function endGame(){
		$('.head-title').html('');
		resetScore(true);
		clearQuestion();
		initHome();
	}
	function nextQuestion(){
		var q = game.questions.pick();
		game.currentQuestion = q.q;
		loadQuestion({
			question: game.currentQuestion,
			time: game.settings.time,
			solution: { 
				allowTyping: game.windowPresenter === null,
				answer_callback: game.windowPresenter !== null ? null : function(result){
					if (result){
						updateScore(true);
					}
				}
			},
			expired_callback: function(){
				if (game.windowPresenter !== null){
					sendMessage(game.windowPresenter, 'timeExpired');
				}
			}
		});
		if (game.windowPresenter !== null){
			sendMessage(game.windowPresenter, 'questionLoaded', q);
		}
	}
	function showSolution(){
		loadWord({
			question: game.currentQuestion,
			showSolution: true
		});
		updateScore(false);
	}
	function showPresenterSolution(result){
		loadWord({
			question: game.currentQuestion,
			showSolution: true
		});
		updateScore(result.correct);
	}
	function updateScore(correct){
		game.score.total++;
		if (correct){
			game.score.correct++;
		}
		saveGame();
		showScore();
	}
	function resetScore(empty){
		game.score = {total: 0, correct: 0};
		saveGame();
		showScore(empty);
	}
	function showScore(empty){
		var scoreText = empty ? '' :  game.score.correct + (game.score.total === 0 ? '' : ' su ' + game.score.total);
		$('.head-score').html(scoreText);
		if (game.windowPresenter !== null){
			sendMessage(game.windowPresenter, 'showScore', {text: scoreText });
		}
	}
	
	//Presenter
	function createPresenter(){
		game.windowPresenter = openPopup({
			url: './Presenter.html',
			target: 'cadutalibera_presenter',
			left: 400,
			height: 600,
			width: 800
		});
		if (game.windowPresenter != null){
			setMode(); //Home senza comandi
		}
	}
	function closePresenter(){
		destroyPresenter(false);
		endGame();
	}
	function destroyPresenter(close){
		if (typeof close === 'undefined'){
			close = true;
		}
		if (close && game.windowPresenter != null){
			game.windowPresenter.close();
		}
		game.windowPresenter = null;
	}
	
	//Settings
	function initSettings(){
		$('.settings').html('');		
		var optionsContainer = $('<div>').addClass('list-group');
		$('.settings').append(optionsContainer);
		if (typeof game.settings.time !== 'undefined'){
			var counterTime = $('<div>')
				.numericCounter({
					value: game.settings.time,
					min: 0,
					max: 60,
					step: 5,
					icons:{
						up: 'bi bi-caret-up',
						down: 'bi bi-caret-down'
					},
					change: function(v){
						game.settings.time = v;
						saveGame();
					}
				});
			counterTime.find('.counter-num');
			var optTime = $('<div>').addClass('list-group-item')
					.append($('<div>').addClass('col pad-5 w-75').text('Tempo per domanda')
						.append($('<span>').tooltip({
							type: constants.messageType.info,
							icon: 'bi bi-question-circle-fill',
							content: 'Numero di secondi a disposizione per ogni domanda (impostando il valore 0 il tempo è illimitato)' 
						})))
					.append($('<div>').addClass('col pad-5 w-25 right').append(counterTime));
			$(optionsContainer).append(optTime);
		}
		if (typeof game.settings.countMulti !== 'undefined'){
			var counterCount = $('<div>')
				.numericCounter({
					value: game.settings.countMulti, 
					min: 5, 
					max: 20, 
					step: 5,
					icons:{
						up: 'bi bi-caret-up',
						down: 'bi bi-caret-down'
					},
					change: function(v){
						game.settings.countMulti = v;
						saveGame();
					}
				});
			counterCount.find('.counter-num');
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
	}
	function openSettings(){
		openModal({ id: 'settings' }); 
	}
	
});
preventRefresh();
$(document).ready(function(){
	init();
	
	//Init
	function init(){
		createLogo();
		initPresenter();
		initQuestion();
		registerWindowUnload(destroy);
		registerMessages([
			{action: 'timeExpired', callback: timeExpired },
			{action: 'questionLoaded', callback: questionLoaded },
			{action: 'showScore', callback: showScore }
		]); 
	}
	function destroy(){
		sendMessage(window.opener, 'closePresenter');
	}
	
	//Gameplay
	function initPresenter(){
		setMode({
			mode: constants.mode.presenter,
			actions: {
				single: { callback: initSingle },
				multi: { callback: initMulti }
			}
		});
		$('.head-count').html('');
	}
	function initSingle(){
		startGame(constants.mode.single);
		setMode({
			mode: constants.mode.single,
			actions: {
				exit: { callback: endGame },
				next: { callback: nextQuestion },
				solution: { callback: showSolution },
				correct: { callback: showSolutionCorrect }
			}
		});
	}
	function initMulti(){
		startGame(constants.mode.multi);
		setMode({
			mode: constants.mode.multi,
			actions: {
				exit: { callback: endGame },
				next: { callback: nextQuestion },
				solution: { callback: showSolution },
				correct: { callback: showSolutionCorrect }
			}
		});
	}
	function startGame(mode){
		sendMessage(window.opener, 'startPresenterGame', mode);
	}
	function endGame(){
		sendMessage(window.opener, 'endGame');
		clearQuestion();
		initPresenter();
	}
	function nextQuestion(){
		sendMessage(window.opener, 'nextQuestion');
	}
	function showSolution(){
		sendMessage(window.opener, 'showPresenterSolution', {correct: false});
	}
	function showSolutionCorrect(){
		sendMessage(window.opener, 'showPresenterSolution', {correct: true});
	}
	function timeExpired(){
		openModal({content: 'Tempo scaduto'});
	}
	function questionLoaded(data){
		loadQuestion({
			ignoreUpdate: true,
			question: data.q,
			solution: { allowTyping: false, showSolution: true, useAlternateForSolution: true }
		});
		$('.head-count').html('')
			.append($('<i>').addClass('bi bi-question-square'))
			.append($('<span>').html(data.i + ' di ' + data.tot));
	}
	function showScore(data){
		$('.head-score').html('');
		if (data.text !== ''){
			$('.head-score')
				.append($('<i>').addClass('bi bi-award-fill'))
				.append($('<span>').html(data.text));
		}
	}

});
/* JQuery Components by DR */
jQuery.fn.extend({
	//Numeric Counter
	numericCounter: function(options){
		var opt = $.extend(true, {
			value: 0,
			max: 9,
			min: 0,
			step: 1,
			icons:{
				up: '',
				down: ''
			},
			change: null
		}, options);
		var self = $(this);
		var num = $('<span>').addClass('counter-num').text(opt.value);
		var up = $('<div>').addClass('counter-btn').append($('<i>').addClass('bi bi-' + opt.icons.up))
			.on('click', function(ev){
				self.find('.counter-btn').removeClass('disabled');
				var v = parseInt(self.find('.counter-num').text()) + opt.step;
				if (v >= opt.max){
					v = opt.max;
					up.addClass('disabled');
				}
				num.text(v);
				if (typeof opt.change === 'function'){
					opt.change(v);
				}
			});
		var down = $('<div>').addClass('counter-btn').append($('<i>').addClass('bi bi-' + opt.icons.down))
			.on('click', function(ev){
				self.find('.counter-btn').removeClass('disabled');
				var v = parseInt(self.find('.counter-num').text()) - opt.step;
				if (v <= opt.min){
					v = opt.min;
					down.addClass('disabled');
				}
				num.text(v);
				if (typeof opt.change === 'function'){
					opt.change(v);
				}
			});
		$(this).addClass('dr-numericCounter').append(down).append(num).append(up);
		return this;
	},
	//Timer
	timer: function(options){
		var opt = $.extend(true, {
			autoStart: true,
			value: 3000, //time unit is milliseconds
			showCents: true,
			almostExpired: 1000,
			expired_callback: null,
			almostExpired_callback: null,
			almostExpired_repeat: {
				interval: 0,
				callback: null
			},
			style: {
				noBorder: true,
				transparent: true,
				negative: false
			}
		}, options);
		var self = $(this);
		if (!self.hasClass('dr-timer')){
			createTimer();
		}
		if (opt.autoStart){
			startTimer();
		}
		function createTimer(){
			self.addClass('dr-timer').addClass(opt.style.negative ? 'negative' : '')
				.addClass(opt.style.noBorder ? 'no-border' : '')
				.addClass(opt.style.transparent ? 'transparent' : '')
				.append($('<div>').addClass('clock')
					.append($('<div>').addClass('face')
						.append($('<div>').addClass('digit')
							.append($('<div>').addClass('semi-digit semi-digit-top'))
							.append($('<div>').addClass('semi-digit semi-digit-bottom'))
						)
						.append($('<div>').addClass('digit')
							.append($('<div>').addClass('semi-digit semi-digit-top'))
							.append($('<div>').addClass('semi-digit semi-digit-bottom'))
						)
						.append($('<div>').addClass('digit-divider')
							.append($('<div>').addClass('dot'))
							.append($('<div>').addClass('dot'))
						)
						.append($('<div>').addClass('digit')
							.append($('<div>').addClass('semi-digit semi-digit-top'))
							.append($('<div>').addClass('semi-digit semi-digit-bottom'))
						)
						.append($('<div>').addClass('digit')
							.append($('<div>').addClass('semi-digit semi-digit-top'))
							.append($('<div>').addClass('semi-digit semi-digit-bottom'))
						)
					)
			);
			setTime(opt.value);
		}
		function startTimer(){
			var startTimeStamp = timeInMilliseconds();
			var intervalId = window.setInterval(function(){
				setTime(opt.value - (timeInMilliseconds()-startTimeStamp));
			},0);
			self.attr('data-intervalId', intervalId);
		}
		function setTime(value){
			if (opt.almostExpired > 0 && opt.almostExpired < opt.value && !self.hasClass('timer-almostExpired')){
				if (value <= opt.almostExpired){
					self.addClass('timer-almostExpired');
					if (typeof opt.almostExpired_callback === 'function'){
						opt.almostExpired_callback();
					}
					if (typeof opt.almostExpired_repeat.callback === 'function' && opt.almostExpired_repeat.interval > 0){
						var intervalId = window.setInterval(opt.almostExpired_repeat.callback, opt.almostExpired_repeat.interval);
						self.attr('data-almostIntervalId', intervalId);
					}
				}
			}
			
			if (value <= 0){
				self.stopTimer();
				value = 0;
				self.addClass('timer-expired').removeClass('timer-almostExpired');
				if (typeof opt.expired_callback === 'function'){
					opt.expired_callback();
				}
			}
			var timeSegments = [];
			
			var min = Math.floor(Math.ceil(value / 1000) / 60);
			var sec = 0;
			var cents = 0;
			
			if (value < 60000 && opt.showCents){
				sec = Math.floor(value / 1000);
				cents = Math.round((value - sec * 1000) / 10);
				timeSegments.push(sec);
				timeSegments.push(cents);
			}
			else{
				sec = Math.ceil(value / 1000) % 60;
				timeSegments.push(min);
				timeSegments.push(sec);				
			}
			
			var timeStr = $.map(timeSegments, function(x){ return padLeft(x.toString(),2,'0'); }).join('');
			$.each(self.find('.digit'), function(i,d){
				$(d).removeClass().addClass('digit digit-'+timeStr[i]);
			});
		}
		function timeInMilliseconds(){
			var time = new Date(); 
			return (time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds()) * 1000 + time.getMilliseconds();
		}
		function padLeft(string, minLength, fillChar){
			var res = string;
			var fillCount = minLength - string.length;
			if (fillCount > 0){
				for (var i = 0; i<fillCount; i++){
					res = fillChar + res;
				}
			}
			return res;
		}
		return self;
	},
	stopTimer: function(){
		var id = parseInt($(this).attr('data-intervalId'));
		var almostId = parseInt($(this).attr('data-almostIntervalId'));
		if (typeof id === 'number'){ window.clearInterval(id); }
		if (typeof almostId === 'number'){ window.clearInterval(almostId); }
	},
	isExpired: function(){
		return $(this).hasClass('timer-expired');
	},
	//Toggle Switch
	toggleSwitch: function(options){
		var opt = $.extend(true, {
			value: false,
			icons:{
				on: '',
				off: ''
			},
			disabled: false,
			change: null
		}, options);
		var i = $('<i>').addClass('bi bi-' + (opt.value ? opt.icons.on : opt.icons.off));
		$(this).prop('disabled', opt.disabled).attr('data-value', opt.value).addClass('dr-toggleSwitch')
			.append(i)
			.on('click', function(ev){
				if ($(this).prop('disabled')){ return; }
				var v = !($(this).attr('data-value') == 'true');
				$(this).attr('data-value', v);
				i.removeClass('bi-' + opt.icons.on).removeClass('bi-' + opt.icons.off)
					.addClass('bi-' + (v ? opt.icons.on : opt.icons.off));
				if (typeof opt.change === 'function'){
					opt.change(v);
				}
			});
		return this;
	},
	//Tooltip
	tooltip: function(options){
		var opt = $.extend(true, {
			type: '',
			icon: '',
			content: '',
			left: false,
			delay: 1000
		}, options);
		var timeoutId = 0;
		if (opt.content === ''){ return this; }
		var t = $('<div>').addClass('dr-tooltip hidden').addClass(opt.type).append(opt.content);
		if (opt.icon != ''){
			$(this).addClass('dr-tooltip-icon').addClass(opt.type)
				.append($('<i>').addClass(opt.icon));
		}
		$(this).addClass('dr-tooltip-cursor')
			.on('mouseenter', function(ev){
				timeoutId = window.setTimeout(function(ev, t){
					t.removeClass('hidden');
					t.css('top', ev.clientY + 20).css('left', opt.left ? ev.clientX - t.width() - 20 : ev.clientX + 20); 	
				},opt.delay, ev, t);
			})
			.on('mouseleave click', function(ev){ 
				window.clearTimeout(timeoutId);
				t.addClass('hidden'); 
			});
		$('body').append(t);
		return this;
	}
});
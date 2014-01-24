var TMW = window.TMW || {};

TMW.TOUCH_SUPPORTED = "ontouchstart" in window ? true : false;
TMW.MAX_TOUCHES_TO_TRACK = 9;

TMW.Base = {

	state : {
		pageType : null
	},


	init : function () {

		TMW.Tracker.init();



		$('.picker').on('touchstart', function () {
			TMW.Base.moveToState(2);
		});
		$('.start').on('touchstart', function () {
			TMW.Base.moveToState(25);
		});

		$('.play-again').on('touchstart', function () {
			window.location.href = "http://ashtag.tmwtest.co.uk/";
		});
		//TMW.Base.moveToState(3);

	},

	moveToState : function (state) {

		switch (state) {
			case 25:
				$('.state-instruction').addClass('show');
				$('.instr-go').on('touchstart', function () {
					TMW.Base.moveToState(3);
				});
				break;
			case 2:
				$('.picker').fadeOut();
				$('.touchbuddy').addClass('show');
				break;
			case 3:
				$('#state-1').fadeOut();
				$('.state-instruction').removeClass('show');
				TMW.Game.init();
				break;
			case 4:
				$('.final-overlay').addClass('show');
				$('.final-total').html(TMW.Game.score + ' pigeons')
				$('.amount').html(TMW.Game.score + 'p')
				break;
		}

	}

},

TMW.Game = {

	cells : [0,0,0,0,0,0,0,0,0],
	score : 0,
	time : 30,

	gameTimer : null,

	popUpTimer : null,
	popDownTimer : null,

	init : function () {

		TMW.Game.popUpTimer = setInterval(function () {
			TMW.Game.popUp(TMW.Game.pickRandom());
		}, '300');

		TMW.Game.popDownTimer = setInterval(function () {
			TMW.Game.popDown(TMW.Game.pickRandom(), false);
		}, '300');

		TMW.Game.startTimer();

	},

	startTimer : function ()  {

		TMW.Game.gameTimer = setInterval(function () {
			TMW.Game.time--;;
			$('.timer-num').html(TMW.Game.time);

			if (TMW.Game.time === 0) {
				TMW.Base.moveToState(4);
				clearInterval(TMW.Game.gameTimer);
				clearInterval(TMW.Game.popDownTimer);
				clearInterval(TMW.Game.popUpTimer);

			}
		}, '1000');

	},

	popUp : function (cellNum) {

		var cell = $('.cell').eq(cellNum);


		if (!cell.hasClass('active') && TMW.Game.cells[cellNum] === 0) {
			//set active state to true
			TMW.Game.cells[cellNum] = 1;

			cell.addClass('active');
		}

	},

	popDown : function (cellNum, hit) {

		var cell = $('.cell').eq(cellNum);


		if (cell.hasClass('active')) {
			cell.removeClass('active');

			//if its a hit, then score it
			if (hit) {
				cell.addClass('hit');

				TMW.Game.incrementScore();
			}

			TMW.Game.resetCell(cell, cellNum);
		}

	},

	incrementScore : function () {

		TMW.Game.score = TMW.Game.score + 1;
		var visualScore = (TMW.Game.score / 100);

		$('.total').html('£' + visualScore.toFixed(2));

	},

	resetCell : function (cell, cellNum) {
		setTimeout(function () {
			TMW.Game.cells[cellNum] = 0;

			if (cell.hasClass('hit')) {
				cell.removeClass('hit');
			}

		}, '250');
	},

	pickRandom : function () {
		var random = Math.floor(Math.random() * (9 - 0) + 0);

		return random;
	}

},

TMW.Tracker = {

	init : function () {

		// create a new Instance of the multitouch tracker. Only one instance is needed per application,
		// so it's useful to define this instance as a part of a global namespace.
		TMW.touchTracker = new TouchTracker (document.body, TMW.MAX_TOUCHES_TO_TRACK);
		TMW.touchTracker.onTouch = TMW.Tracker.touchHandler;
		TMW.touchTracker.onMove = TMW.Tracker.moveHandler;
		TMW.touchTracker.onRelease = TMW.Tracker.releaseHandler;

		TMW.touchTracker.start ();

	},

	touchHandler : function (trackedTouchesArray)
	{

			// When a touchstart is detected the multitouch tracker sends us the updated array of touch points.
			//log ("App:: [touchHandler] touchArray: ", trackedTouchesArray);
			if ($(trackedTouchesArray[0].target).hasClass('pigeon')) {
				var hitId = $(trackedTouchesArray[0].target).parent().attr('id');

				TMW.Game.popDown($('.cell').index($('#' + hitId)), true);
			}


	},

	moveHandler : function (trackedTouchesArray)
	{
			// When a touchmove is detected the multitouch tracker sends us the updated array of touch points.

			//log ("App:: [moveHandler]");
	},

	releaseHandler : function (releasedTouchesArray)
	{
			// When a touchend is detected. This time we don't really need the array of touch points.

			//log ("App:: [releaseHandler] touches: ", releasedTouchesArray);
	}

}




/*
		TouchTracker
		------------------------

		author        : Ivan Hayes
		twitter        : @munkychop
*/


// ------------------------------------------------------------------------
// CONSTRUCTOR
// ------------------------------------------------------------------------
function TouchTracker (context, maxTouchesToTrack)
{
		// return immediately if touch isn't supported.
		if ("ontouchstart" in window !== true)
		{
				//comment this back in!
				return;
		}

		// ------------------------------------------------------------------------
		// PRIVATE PROPERTIES
		// ------------------------------------------------------------------------
		var _self = this,
				_context = context,
				_maxTouchesToTrack = maxTouchesToTrack,
				_isTracking = false,
				_totalTrackedTouches = 0,
				_touchesDictionary = {};


		// ------------------------------------------------------------------------
		// PRIVATE METHODS
		// ------------------------------------------------------------------------
		function touchstartHandler (event)
		{
				event.preventDefault ();

				if (_totalTrackedTouches === _maxTouchesToTrack) return;

				var i = 0,
						changedTouchesArray = event.changedTouches,
						totalChangedTouches = changedTouchesArray.length,
						allTouches = _totalTrackedTouches + totalChangedTouches,
						totalNewTouchesToAdd = allTouches > _maxTouchesToTrack ? totalChangedTouches - (allTouches % _maxTouchesToTrack) : totalChangedTouches,
						currentTouch,
						updatedChangedTouchesArray = [];


				_totalTrackedTouches += totalNewTouchesToAdd;


				for (i; i < totalNewTouchesToAdd; i++)
				{
						currentTouch = changedTouchesArray[i];

						// add normalised x & y properties to the touch object.
						currentTouch.x = currentTouch.pageX || currentTouch.clientX;
						currentTouch.y = currentTouch.pageY || currentTouch.clientY;

						_touchesDictionary[currentTouch.identifier] = currentTouch;
						updatedChangedTouchesArray.push (currentTouch);
				}

				if (typeof _self.onTouch !== "undefined") _self.onTouch (updatedChangedTouchesArray);

				return false;
		}

		function touchmoveHandler (event)
		{
				event.preventDefault ();


				var i = 0,
						touchesArray = event.touches,
						touchesArrayLength = touchesArray.length,
						currentTouch,
						currentTrackedTouch,
						totalTouchesUpdated = 0,
						updatedTouchesArray = [];

				for (i; i < touchesArrayLength; i++)
				{
						currentTouch = touchesArray[i];

						if (typeof _touchesDictionary[currentTouch.identifier] !== "undefined")
						{
								currentTrackedTouch = _touchesDictionary[currentTouch.identifier];
								currentTrackedTouch.x = currentTouch.pageX || currentTouch.clientX;
								currentTrackedTouch.y = currentTouch.pageY || currentTouch.clientY;

								totalTouchesUpdated++;

								updatedTouchesArray.push (currentTrackedTouch);

								if (totalTouchesUpdated === _totalTrackedTouches)
								{
										break;
								}
						}
				}

				if (typeof _self.onMove !== "undefined") _self.onMove (updatedTouchesArray);

				return false;
		}

		function touchendHandler (event)
		{
				event.preventDefault ();

				var i = 0,
						changedTouchesArray = event.changedTouches,
						changedTouchesArrayLength = changedTouchesArray.length,
						currentTouch,
						currentTrackedTouch,
						updatedChangedTouchesArray = [];

				for (i; i < changedTouchesArrayLength; i++)
				{
						currentTouch = changedTouchesArray[i];

						if (typeof _touchesDictionary[currentTouch.identifier] !== "undefined")
						{
								currentTrackedTouch = _touchesDictionary[currentTouch.identifier];
								currentTrackedTouch.x = currentTouch.pageX || currentTouch.clientX;
								currentTrackedTouch.y = currentTouch.pageY || currentTouch.clientY;

								delete _touchesDictionary[currentTouch.identifier];
								_totalTrackedTouches--;

								updatedChangedTouchesArray.push (currentTrackedTouch);
						}
				}

				if (updatedChangedTouchesArray.length > 0 && typeof _self.onRelease !== "undefined") _self.onRelease (updatedChangedTouchesArray);

				return false;
		}


		// ------------------------------------------------------------------------
		// PUBLIC API
		// ------------------------------------------------------------------------

		_self.onTouch = undefined;
		_self.onMove = undefined;
		_self.onRelease = undefined;

		// start tracking touches. This also calls the public 'init' method, if
		// it hasn't been called explicitly.
		_self.start = function ()
		{
				if (_isTracking) return;

				context.addEventListener ("touchstart", touchstartHandler, false);
				context.addEventListener ("touchmove", touchmoveHandler, false);
				window.addEventListener ("touchend", touchendHandler, false);

				_self.isTracking = true;
		};

		// stop tracking touches.
		_self.stop = function ()
		{
				if (!_isTracking) return;

				context.removeEventListener ("touchstart", touchstartHandler);
				context.removeEventListener ("touchmove", touchmoveHandler);
				window.removeEventListener ("touchend", touchendHandler);

				_self.isTracking = false;
		};

		// get an array of all touches that are currently being tracked.
		_self.get = function ()
		{
				var currentTouch,
						touchArray = [];

				for (currentTouch in _touchesDictionary)
				{
						touchArray.push (currentTouch);
				}

				return touchArray;
		};

		// reset the tracker. This empties the array of touches and
		// also sets 'totalTouches' to 0.
		_self.reset = function ()
		{
				if (_isTracking) _self.stop ();

				_touchesDictionary = {};
				_totalTrackedTouches = 0;
		};
}

//  ================
//  === EASY LOG ===
//  ================
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
		window.log = function f() {
				log.history = log.history || [];
				log.history.push(arguments);
				if (this.console) {
						var args = arguments,
								newarr;
						try {
								args.callee = f.caller;
						} catch (e) {}
						newarr = [].slice.call(args);
						if (typeof console.log === 'object')  {
							log.apply.call(console.log, console, newarr);
						} else {
							console.log.apply(console, newarr);
						}
				}
		};


TMW.Base.init();
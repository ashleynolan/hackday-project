var TMW = window.TMW || {};

TMW.TOUCH_SUPPORTED = "ontouchstart" in window ? true : false;
TMW.MAX_TOUCHES_TO_TRACK = 6;

TMW.Base = {

	state : {
		pageType : null
	},


	init : function () {

		TMW.Tracker.init();

	}


},
TMW.Tracker = {

	init : function () {

		// create a new Instance of the multitouch tracker. Only one instance is needed per application,
		// so it's useful to define this instance as a part of a global namespace.
		TMW.touchTracker = new TouchTracker (document.body, TMW.MAX_TOUCHES_TO_TRACK);
		log(TMW.touchTracker);
		TMW.touchTracker.onTouch = TMW.Tracker.touchHandler;
		TMW.touchTracker.onMove = TMW.Tracker.moveHandler;
		TMW.touchTracker.onRelease = TMW.Tracker.releaseHandler;

		TMW.touchTracker.start ();

	},

	touchHandler : function (trackedTouchesArray)
	{
			// When a touchstart is detected the multitouch tracker sends us the updated array of touch points.
			log ("App:: [touchHandler] touchArray: ", trackedTouchesArray);
	},

	moveHandler : function (trackedTouchesArray)
	{
			// When a touchmove is detected the multitouch tracker sends us the updated array of touch points.

			//log ("App:: [moveHandler]");
	},

	releaseHandler : function (releasedTouchesArray)
	{
			// When a touchend is detected. This time we don't really need the array of touch points.

			log ("App:: [releaseHandler] touches: ", releasedTouchesArray);
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
				//return;
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


//  ===========================================
//  === globals Element:true, NodeList:true ===
//  ===========================================

		$ = (function (document, $) {
			var element = Element.prototype,
				nodeList = NodeList.prototype,
				forEach = 'forEach',
				trigger = 'trigger',
				each = [][forEach],

				dummyEl = document.createElement('div');

			nodeList[forEach] = each;

			element.on = function (event, fn) {
				this.addEventListener(event, fn, false);
				return this;
			};

			nodeList.on = function (event, fn) {
				each.call(this, function (el) {
					el.on(event, fn);
				});
				return this;
			};

			element.trigger = function (type, data) {
				var event = document.createEvent('HTMLEvents');
				event.initEvent(type, true, true);
				event.data = data || {};
				event.eventName = type;
				event.target = this;
				this.dispatchEvent(event);
				return this;
			};

			nodeList.trigger = function (event) {
				each.call(this, function (el) {
					el[trigger](event);
				});
				return this;
			};

			$ = function (s) {
				var r = document.querySelectorAll(s || '☺'),
					length = r.length;
				return length == 1 ? r[0] : !length ? nodeList : r;
			};

			$.on = element.on.bind(dummyEl);
			$.trigger = element[trigger].bind(dummyEl);

			return $;
		})(document);



TMW.Base.init();
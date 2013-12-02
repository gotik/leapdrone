var Leap = require('leapjs');
var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var controller = new Leap.Controller();

client.config('control:outdoor', 'FALSE');
client.config('control:ﬂight_without_shell', 'FALSE');

controller.on('frame', function (data) {

	if (data.hands.length) {

		var hand = data.hands[0];
		var position = hand.palmPosition; // [x, y, z]

		if (!drone.cero) {
			drone.cero = {
				x: parseInt(position[0]),
				y: parseInt(position[1]),
				z: parseInt(position[2])
			};
		}

		if (drone.flying) {

			var x = parseInt(position[0]);
			var y = parseInt(position[1]);
			var z = parseInt(position[2]);

			var dX = hand.direction[0];
			var dY = hand.direction[1];

			action = '';


			if (dX > 0.10 && dY < -0.60) {
				action = 'front';
			} else if (dX < 0.16 && dY > 0.52) {
				action = 'back';
			} else {
				if ((y - drone.config.upDown) > drone.cero.y) {
					action = 'up';
				} else if ((y + drone.config.upDown) < drone.cero.y) {
					action = 'down';
				}

				if ((x + drone.config.leftRight) < drone.cero.x) {
					action = 'left';
				} else if ((x - drone.config.leftRight) > drone.cero.x) {
					action = 'right';
				}
			}

			drone.action(action);
		} else {
			drone.takeoff();
		}
	} else {
		drone.land();
		drone.cero = '';
	}

});

controller.connect();

var drone = {

	_action: 'land',

	flying: false,

	cero: '',

	config: {
		speed: .2,
		upDown: 60,
		leftRight: 80
	},

	land: function() {
		if (this.flying) {
			client.land();
			this.flying = false;
			this._action = 'land';
			console.log('land');
		}
	},
	takeoff: function() {
		if (!this.flying) {
			this.flying = true;
			client.takeoff();
			this._action = '';
			console.log('takeoff');
		}
	},
	action: function(action) {

		if (action === this._action) {
			return;
		}

		this._action = action;

		if (!action) {
			client.stop();
			console.log('stop');
			return;
		}

		console.log(action);

		client[action](this.config.speed);
	}
};

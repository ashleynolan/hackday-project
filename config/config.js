
var path = require('path'),
	rootPath = path.normalize(__dirname + '/..'),
	config,
	sharedConfig;

var sharedConfig = {
	root: rootPath,
	db : {
		path: {}
	}
};

config = {
	local: {
		mode:	'local',
		port:	3005,
		app: {
			name: 'Node Basic Setup - Local'
		},
		url:	'',
		global:	sharedConfig
	},

	development: {
		mode:	'dev',
		port:	3005,
		app: {
			name: 'Node Basic Setup - Dev'
		},
		global:	sharedConfig
	},

	staging: {
		mode:	'staging',
		port:	3005,
		app: {
			name: 'Node Basic Setup - Staging'
		},
		global:	sharedConfig
	},

	production: {
		mode:	'prod',
		port:	3005,
		app: {
			name: 'Node Basic Setup - Production'
		},
		global:	sharedConfig
	},

	hosts: [
		{
			domain: 'ashtag.tmwtest.co.uk',
			target: ['localhost:3001']
		}
	]
};


// Export config
module.exports = config;
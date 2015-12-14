/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
	/**
	* Array of application names.
	*/
	app_name : ['Tempmonitor'],
	/**
	* Your New Relic license key.
	*/
	license_key : 'a71a7a96838f1c3a134e8e42994245647e97ac2d',
	logging : {
	/**
	* Level at which to log. 'trace' is most useful to New Relic when diagnosing
	* issues with the agent, 'info' and higher will impose the least overhead on
	* production applications.
	*/
		level : 'info'
	}
};
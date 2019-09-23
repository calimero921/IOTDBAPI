/**
 * @typedef Account
 * @property {string} id
 * @property {string} firstname.required - User firstname
 * @property {string} lastname.required - User lastname
 * @property {string} email.required - User email
 * @property {string} session_id - User last session id
 * @property {boolean} admin - User is an admin
 * @property {boolean} active - User is active
 * @property {number} creation_date - User creation date timestamp
 * @property {number} current_connexion_date - User current connection date timestamp
 * @property {number} last_connexion_date - User last connection date timestamp
 * @property {string} token - User token to validate next action
 */

/**
 * @typedef Device
 * @property {string} id
 * @property {string} key.required - Device security key
 * @property {string} user_id.required - Device owner id
 * @property {string} manufacturer.required - Device manufacturer
 * @property {string} model.required - Device model
 * @property {string} serial.required - Device serial number
 * @property {string} secret.required - Device manufacturer secret key
 * @property {string} name.required - Device name
 * @property {number} creation_date.required - Device creation date timestamp
 * @property {string} class.required - Device class
 * @property {string} local_ip - Device local IP address
 * @property {number} last_connexion_date - Device last connection date timestamp
 * @property {array.<Capability>} capabilities - List of Device capabilities
 */

/**
 * @typedef Capability
 * @property {string} name.required - Capability name
 * @property {string} type.required - Capability type
 * @property {string} last_value.required - Capability last value
 * @property {string} publish.required - Capability MQTT publish topic
 * @property {string} subscribe - Capability MQTT subscribe topic
 */

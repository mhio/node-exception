
/** 
 * Exception extends the Error class to more easily annotate Javascript errors with metadata.
 * @extends Error
 *
 *
 * ```
 * class MyException extends Exception {}
 * throw new MyException('normal code error message', {
 *   label: 'A UI Label for the error', 
 *   simple: 'A simple human message',
 *   code: 14
 * })
 * ``` 
 */

class Exception extends Error {

  constructor( message, metadata = {} ){
    super(message)

    /** @property {string} name - Standard Exception name */
    this.name = this.constructor.name

    /** @property {string} message - Standard Error message */
    this.message = message

    /** @property {string} metadata.label - Get a stack trace where we can */
    /* istanbul ignore else */
    if (typeof Error.captureStackTrace === 'function'){
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }

    /** @property {string} metadata.label - A standard place to store a more human readable error messages */
    if ('label' in metadata)   this.label  = metadata.label

    /** @property {string} metadata.simple - Simple error message, for the hoomans */
    if ('simple' in metadata)  this.simple = metadata.simple

    /** @property {string|number} metadata.code - An error code */
    if ('code' in metadata)    this.code   = metadata.code

  }

  /**
   * @summary Fix `Error.toJSON` for our Exception
   * @description Includes important non enumerable properties
   * @returns {object} 
   */ 
  toJSON(){
    let o = {}
    for (let key in this){
      o[key] = this[key]
    }
    // Non enumerable from `Error`
    o.message = this.message
    o.stack = this.stack
    return o
  }

}


/** 
 * An `Exception` that encapsulate an `Error` 
 * @extends Exception
*/
class ErrorException extends Exception {

  constructor( message, metadata = {} ){
    // Make it an `Exception`
    super(message, metadata)

    // Required but undefined is fine. 
    this.error = metadata.error
  }

  /**
   * @summary Attach an Error
   * @param {Error} error - The error to attach
   */
  setError( error ){
    return this.error = error
  }

}


/** 
 * An `Exception` for the web 
 * @extends Exception
 */
class WebException extends Exception {

  constructor( message, metadata = {} ){
    super(message, metadata)

    //** A http status code */
    if (this.constructor.status) this.status = this.constructor.status
    if ('status' in metadata)  this.status = metadata.status

  }

  /**
   * @summary statusCode
   * @description Support `.statusCode` for express
   */
  get statusCode(){
    return this.status
  }
  set statusCode(val){
    this.status = val
  }

  /**
   * @summary Turn an error into a JSON response
   * @description Turns the Exception into a format that can be sent to a client in a JSON response. `.stack` depends on the node environment (`NODE_ENV`)
   * @returns {object}
   */
  toResponse(){
    let o = this.toJSON()
    if ( process && process.env && process.env.NODE_ENV !== 'development' ) delete o.stack
    return o
  }

}



module.exports = { Exception, WebException, ErrorException }

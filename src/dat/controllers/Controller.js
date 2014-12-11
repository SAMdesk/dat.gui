/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

define([
   'dat/utils/common'
], function(common) {

  /**
   * @class An "abstract" class that represents a given property of an object.
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var Controller = function(name, value, type) {

    /**
     * Keep track of the property name
     */
    this.__name = name;

    /**
     * Keep track of the initial and current Controller values
     */
    this.__value = value;
    this.__initialValue = value;

    /**
     * Keep track of the type of Controller for style purposes
     */
    this.__type = type;

    /**
     * Those who extend this class will put their DOM elements in here.
     * @type {DOMElement}
     */
    this.el = document.createElement('div');

    /**
     * The function to be called on change.
     * @type {Function}
     * @ignore
     */
    this.__onChange = undefined;

    /**
     * The function to be called on finishing change.
     * @type {Function}
     * @ignore
     */
    this.__onFinishChange = undefined;

  };

  common.extend(

      Controller.prototype,

      /** @lends dat.controllers.Controller.prototype */
      {

        /**
         * Specify that a function fire every time someone changes the value with
         * this Controller.
         *
         * @param {Function} fnc This function will be called whenever the value
         * is modified via this Controller.
         * @returns {dat.controllers.Controller} this
         */
        onChange: function(fnc) {
          this.__onChange = fnc;
          return this;
        },

        /**
         * Specify that a function fire every time someone "finishes" changing
         * the value wih this Controller. Useful for values that change
         * incrementally like numbers or strings.
         *
         * @param {Function} fnc This function will be called whenever
         * someone "finishes" changing the value via this Controller.
         * @returns {dat.controllers.Controller} this
         */
        onFinishChange: function(fnc) {
          this.__onFinishChange = fnc;
          return this;
        },

        /**
         * Gets the value of <code>__name</code>
         *
         * @returns {Object} The current value of <code>__name</code>
         */
        getName: function() {
          return this.__name;
        },

        /**
         * Change the value of <code>__initialValue</code>
         *
         * @param {Object} value The new value of <code>__initialValue</code>
         */
        setInitialValue: function(value) {
          this.__initialValue = value;
          return this;
        },

        /**
         * Change the value of <code>__value</code>
         *
         * @param {Object} value The new value of <code>__value</code>
         */
        setValue: function(value) {
          if (value != this.__value) {
            this.__value = value;
            if (this.__onChange) {
              this.__onChange.call(this, value);
            }
          }
          this.updateDisplay();
          return this;
        },

        /**
         * Gets the value of <code>__value</code>
         *
         * @returns {Object} The current value of <code>__value</code>
         */
        getValue: function() {
          return this.__value;
        },

        /**
         * Gets the value of <code>__type</code>
         *
         * @returns {String} The current value of <code>__type</code>
         */
        getType: function() {
          return this.__type;
        },

        /**
         * Refreshes the visual display of a Controller in order to keep sync
         * with the object's current value.
         * @returns {dat.controllers.Controller} this
         */
        updateDisplay: function() {
          return this;
        },

        /**
         * @returns {Boolean} true if the value has deviated from initialValue
         */
        isModified: function() {
          return this.__initialValue !== this.getValue()
        }

      }

  );

  return Controller;


});
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
  'dat/controllers/Controller',
  'dat/dom/dom',
  'dat/utils/common'
], function(Controller, dom, common) {

  /**
   * @class Represents a given property of an object that is a number.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object} [params] Optional parameters
   * @param {Number} [params.min] Minimum allowed value
   * @param {Number} [params.max] Maximum allowed value
   * @param {Number} [params.step] Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberController = function(name, value, params) {

    NumberController.superclass.call(this, name, value, 'number');

    if (typeof this.getValue() !== 'number') {
      throw 'Provided value is not a number';
    }

    var _this = this;

    params = params || {};

    var UP_ARROW = 38;
    var DOWN_ARROW = 40;

    this.min(params.min);
    this.max(params.max);
    this.step(params.step || 1);

    this.__input = document.createElement('input');
    this.__input.setAttribute('type', 'text');

    this.__decrement_button = document.createElement('span');
    this.__decrement_button.textContent = '-';

    this.__increment_button = document.createElement('span');
    this.__increment_button.textContent = '+';

    dom.bind(this.__input, 'change', function() {
      var value = _this.__input.value;
      _this.setValue(isNaN(value) ? _this.getValue() : value);
    });

    dom.bind(this.__input, 'keydown', function(e) {
      switch(e.keyCode) {
        case DOWN_ARROW:
          e.preventDefault();
          decrement();
          break;
        case UP_ARROW:
          e.preventDefault();
          increment();
          break;
      }
    });

    dom.bind(this.__decrement_button, 'click', decrement);
    dom.bind(this.__increment_button, 'click', increment);

    function decrement() {
      _this.setValue(_this.__value - _this.__step);
    }

    function increment() {
      _this.setValue(_this.__value + _this.__step);
    }

    this.updateDisplay();

    this.el.appendChild(this.__decrement_button);
    this.el.appendChild(this.__input);
    this.el.appendChild(this.__increment_button);

  };

  NumberController.superclass = Controller;

  common.extend(

      NumberController.prototype,
      Controller.prototype,

      /** @lends dat.controllers.NumberController.prototype */
      {

        setValue: function(v) {

          // make sure v is a Number
          v = parseFloat(v);

          if (this.__min !== undefined && v < this.__min) {
            v = this.__min;
          } else if (this.__max !== undefined && v > this.__max) {
            v = this.__max;
          }

          if (this.__step !== undefined && v % this.__step != 0) {
            v = Math.round(v / this.__step) * this.__step;
          }

          if (this.__precision !== undefined) {
            v = parseFloat(v.toFixed(this.__precision));
          }

          return NumberController.superclass.prototype.setValue.call(this, v);

        },

        updateDisplay: function() {
          this.__input.value = this.getValue();
        },

        /**
         * Specify a minimum value for <code>object[property]</code>.
         *
         * @param {Number} minValue The minimum value for
         * <code>object[property]</code>
         * @returns {dat.controllers.NumberController} this
         */
        min: function(v) {
          this.__min = v;
          return this;
        },

        /**
         * Specify a maximum value for <code>object[property]</code>.
         *
         * @param {Number} maxValue The maximum value for
         * <code>object[property]</code>
         * @returns {dat.controllers.NumberController} this
         */
        max: function(v) {
          this.__max = v;
          return this;
        },

        /**
         * Specify a step value that dat.controllers.NumberController
         * increments by.
         *
         * @param {Number} stepValue The step value for
         * dat.controllers.NumberController
         * @default if minimum and maximum specified increment is 1% of the
         * difference otherwise stepValue is 1
         * @returns {dat.controllers.NumberController} this
         */
        step: function(v) {
          this.__step = v;
          this.__precision = numDecimals(v);
          return this;
        }

      }

  );

  function numDecimals(x) {
    x = x.toString();
    if (x.indexOf('.') > -1) {
      return x.length - x.indexOf('.') - 1;
    } else {
      return 0;
    }
  }

  return NumberController;

});
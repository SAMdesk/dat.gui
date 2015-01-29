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
  ],
  function (Controller, dom, common) {

    /**
     * @class Provides a select input to alter the property of an object, using a
     * list of accepted values.
     *
     * @extends dat.controllers.Controller
     *
     * @param {Object} object The object to be manipulated
     * @param {string} property The name of the property to be manipulated
     * @param {Object|string[]} options A map of labels to acceptable values, or
     * a list of acceptable string values.
     *
     * @member dat.controllers
     */
    var CustomOptionController = function (name, value, params, options) {

      CustomOptionController.superclass.call(this, name, value, 'option', options);

      var _this = this;

      params = params || {};

      /**
       * The drop down menu
       * @ignore
       */
      this.__select = document.createElement('div');
      dom.addClass(this.__select, 'select select-wide');

      this.__toggle = document.createElement('input');
      this.__toggle.setAttribute('id', params.key + ':toggle');
      this.__toggle.setAttribute('type', 'checkbox');
      dom.addClass(this.__toggle, 'select-controller');

      this.__current_label = document.createElement('label');
      this.__current_label.setAttribute('for', params.key + ':toggle');
      dom.addClass(this.__current_label, 'select-current');

      var span = document.createElement('span');
      dom.addClass(span, 'button-segment');

      var caret = document.createElement('div');
      dom.addClass(caret, 'caret-down');

      span.appendChild(caret);
      this.__current_label.appendChild(span);

      this.__dropdown = document.createElement('div');
      dom.addClass(this.__dropdown, 'select-dropdown');

      if (common.isArray(params)) {
        var map = {};
        common.each(params, function (element) {
          map[element] = element;
        });
        params = map;
      }

      this.__radios = [];
      for (var i = 0; i < params.options.length; i++) {

        var param = params.options[i];

        var option = document.createElement('label');
        option.setAttribute('for', params.key + ':toggle');
        dom.addClass(option, 'select-group');

        var radio = document.createElement('input');
        radio.setAttribute('id', params.key + ':option:' + i);
        radio.setAttribute('value', param.value);
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', params.key);
        dom.addClass(radio, 'select-option');
        dom.bind(radio, 'change', onRadioChange);

        var option_label = document.createElement('label');
        option_label.setAttribute('for', params.key + ':option:' + i);
        dom.addClass(option_label, 'select-option');
        option_label.innerHTML = param.display;

        var top_label = document.createElement('label');
        top_label.setAttribute('for', params.key + ':option:' + i);
        dom.addClass(top_label, 'select-top');
        top_label.innerHTML = param.display;

        option.appendChild(radio);
        option.appendChild(option_label);
        option.appendChild(top_label);

        _this.__dropdown.appendChild(option);
        _this.__radios.push(radio);

      }

      function onRadioChange(e) {
        var value = e.target.getAttribute('value');
        _this.setValue(value);
      }

      // Acknowledge original value
      this.updateDisplay();

      this.__firstClick = false;
      dom.bind(this.__toggle, 'click', function(e) {
        if (this.checked) {
          _this.__firstClick = true;
          dom.bind(window, 'click', closeDropdown);
        }
      });

      dom.bind(this.__current_label, 'click', function(e) {
        e.stopPropagation();
      });

      function closeDropdown(e) {
        if (_this.__firstClick) {
          _this.__firstClick = false;
        } else {
          _this.__toggle.checked = false;
          dom.unbind(window, 'click', closeDropdown);
        }
      }

      this.__select.appendChild(this.__toggle);
      this.__select.appendChild(this.__current_label);
      this.__select.appendChild(this.__dropdown);

      this.el.appendChild(this.__select);
    };

    CustomOptionController.superclass = Controller;

    common.extend(
      CustomOptionController.prototype,
      Controller.prototype,

      {

        updateDisplay: function () {

          var value = this.getValue();
          common.each(this.__radios, function(radio) {
            radio.checked = (value == radio.getAttribute('value'));
          });

          this.__toggle.disabled = this.getReadonly();

          return CustomOptionController.superclass.prototype.updateDisplay.call(this);

        }

      }
    );

    return CustomOptionController;

  });
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

    var units = ['px', 'em', 'pt'];

    var Unit = function(value) {

        if (value.substr) {
            this.num = value.substr(0, value.length - 2);
            this.unit = value.substr(-2);
        }

        if (this.num == '' || isNaN(this.num) || !common.contains(units, this.unit)) {
            throw 'Failed to interpret unit argument';
        }

        this.num = parseFloat(this.num);

    };

    common.extend(Unit.prototype, {

        toString: function() {
            return this.num + this.unit;
        }

    });


    /**
     * @class Represents a given property of an object that is a css unit.
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
    var UnitController = function(name, value, options) {

        UnitController.superclass.call(this, name, value, 'unit', options);

        this.__unit = new Unit(this.getValue());

        var _this = this;

        this.__input = document.createElement('input');
        this.__input.setAttribute('type', 'text');

        this.__select = document.createElement('select');

        this.__arrow = document.createElement('label');
        this.__arrow.className = 'caret-down';

        common.each(units, function(unit) {
            var option = document.createElement('option');
            option.innerHTML = unit;
            option.setAttribute('value', unit);
            _this.__select.appendChild(option);
        });

        dom.bind(this.__input, 'change', function() {
            var value = _this.__input.value;
            if (!isNaN(value)) _this.__unit.num = value;
            _this.setValue(_this.__unit.toString());
        });

        dom.bind(this.__select, 'change', function() {
            var value = this.options[this.selectedIndex].value;
            _this.__unit.unit = value;
            _this.setValue(_this.__unit.toString());
        });

        this.updateDisplay();

        this.el.appendChild(this.__input);
        this.el.appendChild(this.__select);
        this.el.appendChild(this.__arrow);

    };

    UnitController.superclass = Controller;

    common.extend(

        UnitController.prototype,
        Controller.prototype,

        /** @lends dat.controllers.NumberController.prototype */
        {

            updateDisplay: function() {
                this.__unit = new Unit(this.getValue());
                this.__input.value = this.__unit.num;
                this.__select.value = this.__unit.unit;

                this.__input.disabled = this.getReadonly();
                this.__select.disabled = this.getReadonly();
            }

        }

    );

    return UnitController;

});
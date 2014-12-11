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
  'dat/color/Color',
  'dat/color/interpret',
  'dat/utils/common'
], function(Controller, dom, Color, interpret, common) {

  var ColorController = function(property, value) {

    ColorController.superclass.call(this, property, value);

    this.__color = new Color(this.getValue());
    this.__temp = new Color(0);

    var _this = this;

    var alpha_grid = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAC9JREFUGBljvH///n8GJCAtLY3EY2BgQuFh4VCugPHXr18obnj69CmKRZRbQdAEADT3Cphpg+hIAAAAAElFTkSuQmCC")';

    dom.makeSelectable(this.el, false);

    this.__swatch = document.createElement('div');
    this.__swatch.className = 'ui-swatch';

    this.__swatch_container = document.createElement('div');
    this.__swatch_container.className = 'swatch-container';

    this.__selector = document.createElement('div');
    this.__selector.className = 'selector';

    this.__saturation_field = document.createElement('div');
    this.__saturation_field.className = 'saturation-field';

    this.__field_knob = document.createElement('div');
    this.__field_knob.className = 'field-knob';
    this.__field_knob_border = '2px solid ';

    this.__hue_knob = document.createElement('div');
    this.__hue_knob.className = 'hue-knob';

    this.__hue_field = document.createElement('div');
    this.__hue_field.className = 'hue-field';

    this.__alpha_knob = document.createElement('div');
    this.__alpha_knob.className = 'alpha-knob';

    this.__alpha_field = document.createElement('div');
    this.__alpha_field.className = 'alpha-field';

    this.__alpha_container = document.createElement('div');
    this.__alpha_container.className = 'alpha-container';

    this.__input = document.createElement('input');
    this.__input.type = 'text';
    this.__input_textShadow = '0 1px 1px ';

    dom.bind(this.__input, 'keydown', function(e) {
      if (e.keyCode === 13) { // on enter
        onBlur.call(this);
      }
    });

    dom.bind(this.__input, 'blur', onBlur);

    dom.bind(this.__selector, 'mousedown', function(e) {

      dom
          .addClass(this, 'drag')
          .bind(window, 'mouseup', function(e) {
            dom.removeClass(_this.__selector, 'drag');
          });

    });

    var value_field = document.createElement('div');

    common.extend(this.__selector.style, {
      width: '123px',
      height: '123px',
      padding: '3px',
      backgroundColor: '#222',
      boxShadow: '0px 1px 3px rgba(0,0,0,0.3)',
      display: 'none'
    });

    common.extend(this.__field_knob.style, {
      position: 'absolute',
      width: '12px',
      height: '12px',
      border: this.__field_knob_border + (this.__color.v < .5 ? '#fff' : '#000'),
      boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
      borderRadius: '12px',
      zIndex: 1
    });

    common.extend(this.__hue_knob.style, {
      position: 'absolute',
      width: '16px',
      height: '2px',
      borderRight: '4px solid #fff',
      zIndex: 1
    });

    common.extend(this.__alpha_knob.style, {
      position: 'absolute',
      width: '2px',
      height: '16px',
      borderBottom: '4px solid #fff',
      zIndex: 1
    });

    common.extend(this.__saturation_field.style, {
      width: '100px',
      height: '100px',
      border: '1px solid #555',
      marginRight: '3px',
      display: 'inline-block',
      cursor: 'pointer'
    });

    common.extend(value_field.style, {
      width: '100%',
      height: '100%',
      background: 'none'
    });

    linearGradient(value_field, 'top', 'rgba(0,0,0,0)', '#000');

    common.extend(this.__hue_field.style, {
      width: '16px',
      height: '100px',
      display: 'inline-block',
      border: '1px solid #555',
      cursor: 'ns-resize'
    });

    hueGradient(this.__hue_field);

    common.extend(this.__alpha_container.style, {
      width: '121px',
      height: '16px',
      display: 'inline-block',
      border: '1px solid #555',
      marginTop: '1px',
      cursor: 'ew-resize',
      backgroundImage: alpha_grid
    });

    common.extend(this.__alpha_field.style, {
      width: '100%',
      height: '100%'
    });

    common.extend(this.__input.style, {
      outline: 'none',
      border: 0
    });

    common.extend(this.__swatch_container.style, {
      width: '18px',
      height: '18px',
      backgroundImage: alpha_grid
    });

    common.extend(this.__swatch.style, {
      marginTop: '0px'
    });

    this.__visible = false;
    dom.bind(this.__swatch, 'click', function(e) {
      _this.__visible = !_this.__visible;
      common.extend(_this.__selector.style, {
        display: _this.__visible ? '' : 'none'
      });
    });

    dom.bind(this.__saturation_field, 'mousedown', fieldDown);
    dom.bind(this.__field_knob, 'mousedown', fieldDown);

    dom.bind(this.__hue_field, 'mousedown', function(e) {
      setH(e);
      dom.bind(window, 'mousemove', setH);
      dom.bind(window, 'mouseup', unbindH);
    });

    dom.bind(this.__alpha_field, 'mousedown', function(e) {
      setA(e);
      dom.bind(window, 'mousemove', setA);
      dom.bind(window, 'mouseup', unbindA);
    });

    function fieldDown(e) {
      setSV(e);
      dom.bind(window, 'mousemove', setSV);
      dom.bind(window, 'mouseup', unbindSV);
    }

    function unbindSV() {
      dom.unbind(window, 'mousemove', setSV);
      dom.unbind(window, 'mouseup', unbindSV);
    }

    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }

    function unbindH() {
      dom.unbind(window, 'mousemove', setH);
      dom.unbind(window, 'mouseup', unbindH);
    }

    function unbindA() {
      dom.unbind(window, 'mousemove', setA);
      dom.unbind(window, 'mouseup', unbindA);
    }

    this.__saturation_field.appendChild(value_field);
    this.__selector.appendChild(this.__field_knob);
    this.__selector.appendChild(this.__saturation_field);
    this.__selector.appendChild(this.__hue_field);
    this.__hue_field.appendChild(this.__hue_knob);
    this.__selector.appendChild(this.__alpha_container);
    this.__alpha_container.appendChild(this.__alpha_field);
    this.__alpha_field.appendChild(this.__alpha_knob);
    this.__swatch_container.appendChild(this.__swatch);

    this.el.appendChild(this.__swatch_container);
    this.el.appendChild(this.__input);
    this.el.appendChild(this.__selector);

    this.updateDisplay();

    function setSV(e) {

      e.preventDefault();

      var w = dom.getWidth(_this.__saturation_field);
      var o = dom.getOffset(_this.__saturation_field);
      var scroll = getScroll(_this.__saturation_field);
      var s = (e.clientX - o.left + scroll.left) / w;
      var v = 1 - (e.clientY - o.top + scroll.top) / w;

      if (v > 1) v = 1;
      else if (v < 0) v = 0;

      if (s > 1) s = 1;
      else if (s < 0) s = 0;

      _this.__color.v = v;
      _this.__color.s = s;

      _this.setValue(_this.__color.toOriginal());

      return false;

    }

    function setH(e) {

      e.preventDefault();

      var s = dom.getHeight(_this.__hue_field);
      var o = dom.getOffset(_this.__hue_field);
      var scroll = getScroll(_this.__hue_field);
      var h = 1 - (e.clientY - o.top + scroll.top) / s;

      if (h > 1) h = 1;
      else if (h < 0) h = 0;

      _this.__color.h = h * 360;

      _this.setValue(_this.__color.toOriginal());

      return false;

    }

    function setA(e) {

      e.preventDefault();

      var s = dom.getWidth(_this.__alpha_field);
      var o = dom.getOffset(_this.__alpha_field);
      var scroll = getScroll(_this.__alpha_field);
      var w = (e.clientX - o.left + scroll.left) / s;

      if (w > 1) w = 1;
      else if (w < 0) w = 0;

      _this.__color.a = w.toFixed(2);

      _this.setValue(_this.__color.toOriginal());

      return false;

    }

    function getScroll(el) {

      var scroll = { top: el.scrollTop, left: el.scrollLeft };
      while(el = el.parentNode) {
        scroll.top += (el.scrollTop || 0);
        scroll.left += (el.scrollLeft || 0);
      }
      return scroll;

    }

  };

  ColorController.superclass = Controller;

  common.extend(

      ColorController.prototype,
      Controller.prototype,

      {

        updateDisplay: function() {

          var i = interpret(this.getValue());

          if (i !== false) {

            var mismatch = false;

            // Check for mismatch on the interpreted value.

            common.each(Color.COMPONENTS, function(component) {
              if (!common.isUndefined(i[component]) &&
                  !common.isUndefined(this.__color.__state[component]) &&
                  i[component] !== this.__color.__state[component]) {
                mismatch = true;
                return {}; // break
              }
            }, this);

            // If nothing diverges, we keep our previous values
            // for statefulness, otherwise we recalculate fresh
            if (mismatch) {
              common.extend(this.__color.__state, i);
            }

          }

          common.extend(this.__temp.__state, this.__color.__state);

          this.__temp.a = 0;
          var x = this.__temp.toString();

          this.__temp.a = 1;
          var y = this.__temp.toString();

          linearGradient(this.__alpha_field, 'left', x, y);

          var a = common.isUndefined(this.__color.a) ? 1 : this.__color.a;
          this.__alpha_knob.style.marginLeft = (a * 121) - 1 + 'px';

          var flip = (this.__color.v < .5 || this.__color.s > .5) ? 255 : 0;

          common.extend(this.__field_knob.style, {
            marginLeft: 100 * this.__temp.s - 7 + 'px',
            marginTop: 100 * (1 - this.__temp.v) - 7 + 'px',
            backgroundColor: this.__temp.toString(),
            border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip +')'
          });

          this.__hue_knob.style.marginTop = ((1 - this.__color.h / 360) * 100) - 1 + 'px';

          this.__temp.s = 1;
          this.__temp.v = 1;

          linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toString());

          common.extend(this.__swatch.style, {
            backgroundColor: this.__input.value = this.__color.toString()
          });

        }

      }

  );
  
  var vendors = ['-moz-','-o-','-webkit-','-ms-',''];
  
  function linearGradient(elem, x, a, b) {
    elem.style.background = '';
    common.each(vendors, function(vendor) {
      elem.style.cssText += 'background: ' + vendor + 'linear-gradient('+x+', '+a+' 0%, ' + b + ' 100%); ';
    });
  }
  
  function hueGradient(elem) {
    elem.style.background = '';
    elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);'
    elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
    elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
    elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
    elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
  }


  return ColorController;

});
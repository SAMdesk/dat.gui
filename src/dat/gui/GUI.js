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

  'dat/utils/css',
  'text!dat/gui/style.css',

  'dat/controllers/Controller',
  'dat/controllers/BooleanController',
  'dat/controllers/ColorController',
  'dat/controllers/NumberController',
  'dat/controllers/OptionController',
  'dat/controllers/StringController',
  'dat/controllers/UnitController',

  'dat/dom/dom',
  'dat/utils/common'

], function(css, styleSheet, Controller, BooleanController, ColorController, NumberController, OptionController, StringController, UnitController, dom, common) {

  //css.inject(styleSheet);

  /** Outer-most className for GUI's */
  var CSS_NAMESPACE = 'dg';

  /**
   * A lightweight controller library for JavaScript. It allows you to easily
   * manipulate variables and fire functions on the fly.
   * @class
   *
   * @member dat.gui
   *
   * @param {Object} [params]
   * @param {String} [params.name] The name of this GUI.
   * @param {Object} [params.load] JSON object representing the saved state of
   * this GUI.
   * @param {Boolean} [params.auto=true]
   * @param {dat.gui.GUI} [params.parent] The GUI I'm nested in.
   * @param {Boolean} [params.closed] If true, starts closed
   */
  var GUI = function(params) {

    var _this = this;

    /**
     * Outermost DOM Element
     * @type el
     */
    this.el = document.createElement('div');
    this.__ul = document.createElement('ul');

    dom.addClass(this.el, CSS_NAMESPACE);

    /**
     * Nested GUI's by name
     * @ignore
     */
    this.__folders = {};

    this.__controllers = [];

    params = params || {};

    Object.defineProperties(this,

        /** @lends dat.gui.GUI.prototype */
        {

          /**
           * The parent <code>GUI</code>
           * @type dat.gui.GUI
           */
          parent: {
            get: function() {
              return params.parent;
            }
          },

          /**
           * The name of <code>GUI</code>. Used for folders. i.e
           * a folder's name
           * @type String
           */
          name: {
            get: function() {
              return params.name;
            },
            set: function(v) {
              // TODO Check for collisions among sibling folders
              params.name = v;
              if (title_row_name) {
                title_row_name.innerHTML = params.name;
              }
            }
          },

          /**
           * Whether the <code>GUI</code> is collapsed or not
           * @type Boolean
           */
          closed: {
            get: function() {
              return params.closed;
            },
            set: function(v) {
              params.closed = v;
              if (params.closed) {
                dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
              } else {
                dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
              }
            }
          }

        });

    if (common.isUndefined(params.parent)) {

      // Are we a root level GUI?

      params.closed = false;

      dom.addClass(this.el, GUI.CLASS_MAIN);
      dom.makeSelectable(this.el, false);


    } else {

      // Oh, you're a nested GUI!

      params.closed = false;

      var title_row_name = document.createTextNode(params.name);

      var title_row = document.createElement('div');
      title_row.appendChild(title_row_name);

      var caret = document.createElement('div');
      dom.addClass(caret, 'caret-down');
      title_row.appendChild(caret);

      this.el.appendChild(title_row);

      var on_click_title = function(e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        return false;
      };

      dom.addClass(title_row, 'title');
      dom.bind(title_row, 'click', on_click_title);

      if (!params.closed) {
        this.closed = false;
      }

    }

    this.el.appendChild(this.__ul);

  };

  GUI.CLASS_MAIN = 'main';
  GUI.CLASS_CONTROLLER_ROW = 'cr';
  GUI.CLASS_TOO_TALL = 'taller-than-window';
  GUI.CLASS_CLOSED = 'closed';
  GUI.CLASS_CLOSE_BUTTON = 'close-button';
  GUI.CLASS_DRAG = 'drag';

  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = 'Close Controls';
  GUI.TEXT_OPEN = 'Open Controls';

  common.extend(

      GUI.prototype,

      /** @lends dat.gui.GUI */
      {

        /**
         * @param object
         * @param property
         * @returns {dat.controllers.Controller} The new controller that was added.
         * @instance
         */
        add: function(controller) {
          return add(this, controller);
        },

        /**
         * @param controller
         * @instance
         */
        remove: function(controller) {

          // TODO listening?
          this.__ul.removeChild(controller.el);
          this.__controllers.splice(this.__controllers.indexOf(controller), 1);

        },

        /**
         * @param name
         * @returns {dat.gui.GUI} The new folder.
         * @throws {Error} if this GUI already has a folder by the specified
         * name
         * @instance
         */
        addFolder: function(name) {

          // We have to prevent collisions on names in order to have a key
          // by which to remember saved values
          if (this.__folders[name] !== undefined) {
            throw new Error('You already have a folder in this GUI by the' +
                ' name "' + name + '"');
          }

          var gui = new GUI({ name: name, parent: this });
          this.__folders[name] = gui;

          var li = addRow(this, gui.el);
          dom.addClass(li, 'folder');
          return gui;

        },

        open: function() {
          this.closed = false;
        },

        close: function() {
          this.closed = true;
        }

      }

  );

  function add(gui, controller) {

    var name = document.createElement('span');
    dom.addClass(name, 'property-name');
    name.innerHTML = controller.getName();

    var info = controller.getOption('info');
    if (info) {
      var el = document.createElement('span');
      dom.addClass(el, 'ui-info-badge');
      el.setAttribute('data-tooltip-hover', '');
      el.setAttribute('title', info);
      el.innerHTML = '?';
      name.appendChild(el);
    }

    if (controller.getOption('editable')) {
      var toggle = document.createElement('span');
      toggle.style.float = 'right';
      toggle.innerHTML = controller.getReadonly() ? 'edit' : 'x';

      var toggleReadonly = function() {
        var readonly = !controller.getReadonly();
        controller.setReadonly(readonly);
        toggle.innerHTML = readonly ? 'edit' : 'x';
        if (readonly) controller.resetValue();
      };

      dom.bind(toggle, 'click', function() {
        toggleReadonly();
      });

      dom.bind(controller.el, 'click', function() {
        if (controller.getReadonly()) {
          toggleReadonly();
        }
      });

      name.appendChild(toggle);
    }

    var container = document.createElement('div');
    container.appendChild(name);
    container.appendChild(controller.el);

    var li = addRow(gui, container);

    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    dom.addClass(li, controller.getType());

    gui.__controllers.push(controller);

    return controller;

  }

  /**
   * Add a row to the end of the GUI or before another row.
   *
   * @param gui
   * @param [dom] If specified, inserts the dom content in the new row
   * @param [liBefore] If specified, places the new row before another row
   */
  function addRow(gui, dom) {
    var li = document.createElement('li');
    if (dom) li.appendChild(dom);
    gui.__ul.appendChild(li);
    return li;
  }

  return GUI;

});

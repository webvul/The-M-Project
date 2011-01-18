// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) M-Way Solutions GmbH. All rights reserved.
// Creator:   Dominik
// Date:      27.10.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('core/utility/logger.js');

/**
 * @class
 *
 * Object for dispatching all incoming events.
 *
 * @extends M.Object
 */
M.EventDispatcher = M.Object.create(
/** @scope M.EventDispatcher.prototype */ {

    /**
     * The type of this object.
     *
     * @type String
     */
    type: 'M.EventDispatcher',

    /**
     * Saves the latest on click event to make sure that there are no multiple events
     * fired for one click.
     *
     * @type {Object}
     */
    lastOnClickEvent: null,

    /**
     * This method is called whenever an event is triggered within the app.
     *
     * @param {Object} evt The event.
     */
    eventDidHappen: function(evt) {
        this.delegateEvent(evt.type, evt.currentTarget.id, evt.keyCode);
    },

    /**
     * This method is called whenever an onClick event is triggered within the app. This is
     * not the common way to catch events, but in some cases it might be necessary to use
     * the onClick property. 
     *
     * @param {String} type The type of event that occured, e.g. 'click'.
     * @param {String} id The id of the element that triggered the event.
     * @param {Number} keyCode The keyCode property of the event, necessary for keypress event, e.g. keyCode is 13 when enter is pressed.
     * @param {String} orientation The orientation of the device (only passed if an orientationChange event did happen).
     */
    onClickEventDidHappen: function(type, id, keyCode) {
        var evt = {
            type: type,
            id: id,
            keyCode: keyCode,
            date: M.Date.create()
        };

        /* only delegate the incoming event if there hasn't been the same event within the last 100 milliseconds */
        if(!this.lastOnClickEvent || (this.lastOnClickEvent && this.lastOnClickEvent.date.timeBetween(evt.date, M.MILLISECONDS)) > 100) {
            this.lastOnClickEvent = evt;
            if(!M.Application.viewManager.getViewById(id).inEditMode) {
                this.delegateEvent(type, id, keyCode);
            }
        }
    },

    /**
     * This method looks for a corresponding event inside the view manager and
     * delegates the call directly to the responsible controller defined by the
     * target and action properties of the view.
     *
     * @param {String} type The type of event that occured, e.g. 'click'.
     * @param {String} id The id of the element that triggered the event.
     * @param {Number} keyCode The keyCode property of the event, necessary for keypress event, e.g. keyCode is 13 when enter is pressed.
     * @param {String} orientation The orientation of the device (only passed if an orientationChange event did happen).
     */
    delegateEvent: function(type, id, keyCode) {
        var view = M.Application.viewManager.getViewById(id);

        if(!view && type !== 'orientationchange') {
            return;
        }

        switch(type) {
            case 'click':
                if(view && view.internalTarget && view.internalAction) {
                    view.internalTarget[view.internalAction](id, view.modelId);
                }
                if(view && view.target && view.action && view.type !== 'M.TextFieldView' && view.type !== 'M.SearchBarView') {
                    view.target[view.action](id, view.modelId);
                }
                break;
            case 'change':
                view.setValueFromDOM(type);
                break;
            case 'keyup':
                if(keyCode === 13 && view.triggerActionOnEnter && (view.type === 'M.TextFieldView' || view.type === 'M.SearchBarView')) {
                    if(view && view.target && view.action) {
                        view.target[view.action](id);
                    }
                } else if(view.type === 'M.TextFieldView' || view.type === 'M.SearchBarView') {
                    view.setValueFromDOM(type);
                }
                break;
            case 'focusin':
                view.gotFocus(type);
                break;
            case 'focusout':
                view.lostFocus(type);
                break;
            case 'orientationchange':
                M.Application.viewManager.getCurrentPage().orientationDidChange();
                break;
        }
    },

    /**
     * Registers events given from eventList to a view defined by an id. Can be used to register events after application load.
     * @param {String} id The View Id, e.g. m_123
     * @param {String} eventList The Events one after another in a string divided by whitespace.
     */
    registerEvents: function(id, eventList) {
        var that = this;
        $('#' + id).bind(eventList, function(evt) {
            that.eventDidHappen(evt);
        });
    }

});

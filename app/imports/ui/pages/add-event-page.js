import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { Events, EventSchema } from '../../api/events/events.js';
import { organizationList } from './organizations.js';

/* eslint-disable object-shorthand, no-unused-vars, no-param-reassign, prefer-template */

const displaySuccessMessage = 'displaySuccessMessage';
const displayErrorMessages = 'displayErrorMessages';

Template.Add_Event_Page.onCreated(function onCreated() {
  this.subscribe('Events');
  this.messageFlags = new ReactiveDict();
  this.messageFlags.set(displaySuccessMessage, false);
  this.messageFlags.set(displayErrorMessages, false);
  this.context = EventSchema.namedContext('Add_Event_Page');
});

Template.Add_Event_Page.helpers({
  successClass() {
    return Template.instance().messageFlags.get(displaySuccessMessage) ? 'success' : '';
  },
  displaySuccessMessage() {
    return Template.instance().messageFlags.get(displaySuccessMessage);
  },
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';
  },
  fieldError(fieldName) {
    const invalidKeys = Template.instance().context.invalidKeys();
    const errorObject = _.find(invalidKeys, (keyObj) => keyObj.name === fieldName);
    return errorObject && Template.instance().context.keyErrorMessage(errorObject.name);
  },
  organizations() {
    return _.map(organizationList, function makeOrganizationObject(organization) {
      return { label: organization };
    });
  },
});

Template.Add_Event_Page.events({
  'submit .event-form'(event, instance) {
    event.preventDefault();
    const name = event.target.Name.value;
    const description = event.target.Description.value;
    const start = new Date(event.target.DateTime.value.toString().slice(0, 20));
    const end = new Date(event.target.DateTime.value.toString().slice(22, 42));
    const organizer = event.target.Organization.value;
    const email = event.target.Email.value;
    const phone = event.target.Phone.value;
    // fill in page-2 fields, will update in next page
    const newEventData = {
      name,
      description,
      start,
      end,
      organizer,
      email,
      phone,
      categories: ['none-set'],
      location: 'none',
      coordinates: [0, 0],
      website: 'none',
      picture: 'none',
    };
    // Clear out any old validation errors.
    instance.context.resetValidation();
    // Invoke clean so that newEventdata reflects what will be inserted.
    EventSchema.clean(newEventData);
    // Determine validity.
    instance.context.validate(newEventData);
    if (instance.context.isValid()) {
      const id = Events.insert(newEventData);
      instance.messageFlags.set(displayErrorMessages, false);
      FlowRouter.go(FlowRouter.path('Add_Event_2_Page', { _id: id }));
    } else {
      instance.messageFlags.set(displayErrorMessages, true);
    }
  },
});


import { Contact } from '../models/contact.model.js';

export const getAllContacts = async () => {
  return Contact.find();
};

export const getContactById = async (id) => {
  return Contact.findById(id);
};

export const addContact = async (contactData) => {
  return Contact.create(contactData);
};

export const updateContact = async (contactId, updateData) => {
  return Contact.findByIdAndUpdate(contactId, updateData, { new: true });
};

export const removeContact = async (contactId) => {
  return Contact.findByIdAndDelete(contactId);
};

import { Contact } from '../models/contact.model.js';

export const getAllContacts = async () => {
  return Contact.find();
};
export const getContactById = async (id) => {
  return Contact.findById(id);
};

import { Contact } from '../models/contact.model.js';

export const getAllContacts = async ({ page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc', type, isFavourite }) => {
  const filter = {};
  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined') filter.isFavourite = isFavourite === 'true' || isFavourite === true;

  const skip = (page - 1) * perPage;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [totalItems, data] = await Promise.all([
    Contact.countDocuments(filter),
    Contact.find(filter).sort(sort).skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);
  return {
    data,
    page: Number(page),
    perPage: Number(perPage),
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
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

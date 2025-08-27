import { Contact } from '../models/contact.model.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  type,
  isFavourite,
  userId,
}) => {
  const filter = { userId };
  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined')
    filter.isFavourite = isFavourite === 'true' || isFavourite === true;

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

export const getContactById = async (id, userId) => {
  return Contact.findOne({ _id: id, userId });
};

export const addContact = async (contactData, userId) => {
  return Contact.create({ ...contactData, userId });
};

export const updateContact = async (contactId, updateData, userId) => {
  return Contact.findOneAndUpdate({ _id: contactId, userId }, updateData, {
    new: true,
  });
};

export const removeContact = async (contactId, userId) => {
  return Contact.findOneAndDelete({ _id: contactId, userId });
};

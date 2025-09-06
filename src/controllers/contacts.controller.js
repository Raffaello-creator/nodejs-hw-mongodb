import mongoose from 'mongoose';
import createError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
} from '../services/contacts.js';

import { uploadToCloudinary } from '../utils/cloudinary.js';

export const getContactsController = async (req, res, next) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      type,
      isFavourite,
    } = req.query;
    const result = await getAllContacts({
      page,
      perPage,
      sortBy,
      sortOrder,
      type,
      isFavourite,
      userId: req.user._id,
    });
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactByIdController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw createError(400, 'Invalid contact ID');
    }
    const contact = await getContactById(contactId, req.user._id);
    if (!contact) {
      throw createError(404, 'Contact not found');
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const addContactController = async (req, res, next) => {
  try {
    const { name, phoneNumber, contactType } = req.body;
    if (!name || !phoneNumber || !contactType) {
      throw createError(
        400,
        'Missing required fields: name, phoneNumber, contactType',
      );
    }
    let photoUrl;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer);
    }
    const newContact = await addContact(
      { ...req.body, photo: photoUrl },
      req.user._id,
    );
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw createError(400, 'Invalid contact ID');
    }
    let photoUrl;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer);
    }
    const updateData = photoUrl ? { ...req.body, photo: photoUrl } : req.body;
    const updatedContact = await updateContact(
      contactId,
      updateData,
      req.user._id,
    );
    if (!updatedContact) {
      throw createError(404, 'Contact not found');
    }
    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const removeContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw createError(400, 'Invalid contact ID');
    }
    const removed = await removeContact(contactId, req.user._id);
    if (!removed) {
      throw createError(404, 'Contact not found');
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

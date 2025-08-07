import mongoose from 'mongoose';
import { getAllContacts, getContactById } from '../services/contacts.js';

export const getContactsController = async (req, res, next) => {
  try {
    const contacts = await getAllContacts();

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};
export const getContactByIdController = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }

    const contact = await getContactById(contactId);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
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

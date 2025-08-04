import express from 'express';
import bcrypt from 'bcryptjs';
import Application from '../models/Application.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    dispensaryName,
    legalName,
    address,
    licenseNumber,
    phoneNumber,
    websiteUrl,
    description,
    amenities,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const application = new Application({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dispensaryName,
      legalName,
      address,
      licenseNumber,
      phoneNumber,
      websiteUrl,
      description,
      amenities,
    });

    await application.save();

    res.status(201).json({ message: 'Application submitted' });
  } catch (error) {
    console.error(error);

    if (error.code === 11000 && error.keyValue?.email) {
      return res.status(400).json({ error: `Email ${error.keyValue.email} is already in use.` });
    }

    res.status(400).json({ error: 'Error submitting application' });
  }
});

export default router;

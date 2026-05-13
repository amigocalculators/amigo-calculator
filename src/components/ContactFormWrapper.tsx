'use client';

import { useState } from 'react';
import ContactForm from './ContactForm';

const ContactFormWrapper = () => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <ContactForm
      isOpen={showContactForm}
      onClose={() => setShowContactForm(!showContactForm)}
    />
  );
};

export default ContactFormWrapper;

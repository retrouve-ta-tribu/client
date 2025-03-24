import { FC } from 'react';

/**
 * Props for the ContactInfo component that displays contact information
 * @property email - The email address of the contact
 */
interface ContactInfoProps {
  email: string;
}

const ContactInfo: FC<ContactInfoProps> = ({ email }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h2 className="text-lg font-medium text-gray-700 mb-2">Contact</h2>
      <p className="text-gray-600">
        <span className="font-medium">Email:</span> {email}
      </p>
    </div>
  );
};

export default ContactInfo; 
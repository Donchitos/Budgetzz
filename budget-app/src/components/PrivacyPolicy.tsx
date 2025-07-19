import React from 'react';
import Card from './Card';
import './PrivacyPolicy.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-policy-container">
      <Card title="Privacy Policy">
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to BudgetApp. We are committed to protecting your privacy and handling your data in an open and transparent manner. This privacy policy explains how we collect, use, and protect your personal and financial information.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          We collect the following types of information to provide and improve our services:
        </p>
        <ul>
          <li><strong>Personal Information:</strong> Your name and email address, which you provide during registration.</li>
          <li><strong>Financial Information:</strong> Transaction data, budget details, and financial goals that you manually enter into the app. We do not store any bank login credentials.</li>
          <li><strong>Usage Data:</strong> We may collect anonymous data about how you interact with our app to help us improve the user experience.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>
          Your information is used to:
        </p>
        <ul>
          <li>Provide, maintain, and improve our budgeting services.</li>
          <li>Personalize your experience, such as by generating budget recommendations.</li>
          <li>Communicate with you about your account and our services.</li>
          <li>Ensure the security of your account and our platform.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We take the security of your data very seriously. We implement industry-standard security measures, including:
        </p>
        <ul>
          <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using SSL.</li>
          <li><strong>Secure Storage:</strong> Your data is stored in a secure, access-controlled database.</li>
          <li><strong>Anonymization:</strong> Where possible, we anonymize data for analytics purposes.</li>
        </ul>

        <h2>5. Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal information at any time. You can manage your data directly within the app or by contacting our support team.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact us at <a href="mailto:privacy@budgetapp.com">privacy@budgetapp.com</a>.
        </p>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
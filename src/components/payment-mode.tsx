
import React from 'react';

const PaymentModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md">
        <button onClick={onClose} className="float-right text-gray-500 hover:text-gray-700">
          Close
        </button>
        {children}
      </div>
    </div>
  );
};

export default PaymentModal;

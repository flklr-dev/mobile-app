import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaCheckCircle } from 'react-icons/fa';
import api from '../config/axios';

// Import feedback boy image
import feedbackBoyImage from '../assets/feedback-boy.png';

const FeedbackScreen = () => {
  const navigate = useNavigate();
  const [selectedFeedbacks, setSelectedFeedbacks] = useState([]);
  const [additionalComments, setAdditionalComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const feedbackOptions = [
    'Recommended', 
    'Good', 
    'Average', 
    'Friendly', 
    'Responsive'
  ];

  const handleFeedbackSelect = (option) => {
    setSelectedFeedbacks(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const goBack = () => {
    navigate(-1); // Go back to previous screen
  };

  const handleSubmitFeedback = async () => {
    if (selectedFeedbacks.length === 0) {
      setStatusMessage('Please select at least one feedback option');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Show success modal instead of status message
      setShowSuccessModal(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setSelectedFeedbacks([]);
        setAdditionalComments('');
        setShowSuccessModal(false);
        navigate('/home');
      }, 2000);

    } catch (error) {
      setStatusMessage('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Modal Component
  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
        <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-4" />
        <h2 className="text-2xl font-bold mb-4">Feedback Submitted!</h2>
        <p className="text-gray-600 mb-6">Thank you for sharing your thoughts with us.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10 bg-orange-500 shadow-md">
        <div className="flex items-center justify-between p-4">
          <button onClick={goBack} className="text-white">
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-white text-xl font-bold absolute left-1/2 transform -translate-x-1/2">
            Feedback
          </h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content with padding for header */}
      <div className="pt-20 px-4 flex flex-col items-center justify-center">
        {/* Feedback Image */}
        <div className="mb-8">
          <img 
            src={feedbackBoyImage} 
            alt="Feedback Illustration" 
            className="w-64 h-64 object-contain"
          />
        </div>

        {/* Feedback Options */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 w-full max-w-md">
          {feedbackOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleFeedbackSelect(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
                ${selectedFeedbacks.includes(option) 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Additional Comments Input */}
        <div className="w-full max-w-md mb-6">
          <textarea
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            placeholder="Share a few words about your experience..."
            className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="w-full max-w-md">
          <button
            onClick={handleSubmitFeedback}
            disabled={isSubmitting || selectedFeedbacks.length === 0}
            className={`w-full py-3 rounded-lg font-bold transition-all duration-300 
              ${selectedFeedbacks.length === 0 || isSubmitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600'}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mt-4 text-center 
            ${statusMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
            {statusMessage}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default FeedbackScreen;

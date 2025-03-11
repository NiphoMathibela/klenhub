import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping within South Africa takes 3-5 business days. Express shipping is available for 1-2 business days delivery. International shipping typically takes 7-14 business days depending on the destination."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards (Visa, Mastercard), Paystack, and bank transfers. All transactions are secure and encrypted for your safety."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also view your order status by logging into your account and visiting the 'My Orders' section."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 14-day return policy for unworn items in their original condition with tags attached. Some exclusions apply. Please visit our Returns & Exchanges page for complete details."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to select international destinations. Shipping costs and delivery times vary by location. International customers may be responsible for customs duties and taxes."
    },
    {
      question: "How do I know what size to order?",
      answer: "Please refer to our Size Guide for detailed measurements. If you're between sizes, we generally recommend sizing up for a more comfortable fit."
    },
    {
      question: "Are your clothes true to size?",
      answer: "Our clothing is designed to be true to standard South African sizing. However, we recommend checking the specific measurements in our Size Guide for each item as styles may vary."
    },
    {
      question: "How can I contact customer service?",
      answer: "You can reach our customer service team via email at info@klenhub.co.za or through our Contact page. We aim to respond to all inquiries within 24 hours during business days."
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Yes, we offer gift wrapping services for an additional fee. You can select this option during checkout and include a personalized message."
    },
    {
      question: "How do I care for my KlenHub items?",
      answer: "Care instructions are included on the tag of each item. Generally, we recommend washing in cold water and hanging to dry to preserve the quality and longevity of your garments."
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16">
      <h1 className="text-3xl font-bold mt-28 mb-8 text-center">Frequently Asked Questions</h1>
      
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="mb-4 border-b border-gray-200 pb-4"
          >
            <button
              className="flex justify-between items-center w-full text-left py-4 px-6 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
              onClick={() => toggleFAQ(index)}
            >
              <span className="text-lg font-medium">{faq.question}</span>
              <span className="ml-4 transition-transform duration-200 transform">
                {activeIndex === index ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
            </button>
            
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-gray-700">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-gray-700">
          Can't find what you're looking for? Contact us at{' '}
          <a href="mailto:info@klenhub.co.za" className="text-black underline">
            info@klenhub.co.za
          </a>
        </p>
      </div>
    </div>
  );
};

export default FAQ;

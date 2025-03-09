import React from 'react';

const ReturnsExchanges: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 mb-16">
      <h1 className="text-3xl font-bold mt-28 mb-8 text-center">Returns & Exchanges</h1>
      
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-md rounded-md">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Return Policy</h2>
          <p className="mb-4">
            We want you to be completely satisfied with your purchase. If you're not entirely happy with your order, we're here to help.
          </p>
          
          <h3 className="text-xl font-medium mb-2">Return Eligibility</h3>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Items must be returned within 14 days of delivery</li>
            <li>Products must be unworn, unwashed, and in their original condition with all tags attached</li>
            <li>Items on sale or marked as final sale cannot be returned</li>
            <li>Intimates and swimwear cannot be returned for hygiene reasons</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Exchange Process</h2>
          <p className="mb-4">
            If you need a different size or color, our exchange process is simple:
          </p>
          
          <ol className="list-decimal pl-5 mb-4 space-y-2">
            <li>Contact our customer service team at <a href="mailto:info@klenhub.co.za" className="text-black underline">info@klenhub.co.za</a></li>
            <li>Include your order number and details of the items you wish to exchange</li>
            <li>Our team will provide you with return instructions and process your exchange once we receive the original items</li>
          </ol>
          
          <p>
            Please note that exchanges are subject to availability. If your desired item is out of stock, we'll process a refund instead.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Refund Information</h2>
          <p className="mb-4">
            Once we receive and inspect your return, we'll process your refund. The money will be returned to your original payment method within 5-7 business days, depending on your bank's processing time.
          </p>
          
          <p>
            Shipping costs are non-refundable, and return shipping costs are the responsibility of the customer unless the return is due to our error.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Damaged or Defective Items</h2>
          <p className="mb-4">
            If you receive a damaged or defective item, please contact us immediately at <a href="mailto:info@klenhub.co.za" className="text-black underline">info@klenhub.co.za</a> with photos of the damage. We'll arrange for a replacement or refund as soon as possible.
          </p>
          
          <p>
            For any questions about returns or exchanges, please don't hesitate to contact our customer service team.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnsExchanges;

import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
          <h1 className="text-3xl md:text-4xl font-bold">About Our Fashion Store</h1>
          <p className="mt-2 opacity-90">Discover quality and style in one place</p>
        </div>
        
        <div className="p-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to our fashion destination, your number one source for the latest fashion trends. We're dedicated to giving you the very best of clothing, with a focus on quality, customer service, and uniqueness.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Founded in 2025, our store has come a long way from its beginnings. When we first started out, our passion for eco-friendly and stylish apparel drove us to do intense research, and gave us the impetus to turn hard work and inspiration into a booming online store. We now serve customers all over the world and are thrilled to be a part of the quirky, eco-conscious wing of the fashion industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-gray-200">
              <div className="text-purple-600 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Quality Products</h3>
              <p className="text-gray-600 text-sm">We ensure every product meets our high standards for quality and durability.</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-gray-200">
              <div className="text-purple-600 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Fast Shipping</h3>
              <p className="text-gray-600 text-sm">Quick and reliable delivery to get your favorite items to you on time.</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-gray-200">
              <div className="text-purple-600 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Customer Care</h3>
              <p className="text-gray-600 text-sm">Our dedicated support team is ready to assist you with any questions.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              Our mission is to provide high-quality fashion at affordable prices while maintaining sustainability and ethical practices. We believe that everyone should have access to stylish clothing that reflects their personal style.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

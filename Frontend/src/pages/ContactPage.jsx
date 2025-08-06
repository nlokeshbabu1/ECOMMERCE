import React from 'react';

const ContactPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-md border border-gray-200">
      <h1 className="text-4xl font-extrabold text-purple-700 mb-6">Contact Us</h1>
      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" id="name" className="mt-1 block w-full bg-gray-100 p-3 rounded-lg border-transparent focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" className="mt-1 block w-full bg-gray-100 p-3 rounded-lg border-transparent focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
          <textarea id="message" rows="4" className="mt-1 block w-full bg-gray-100 p-3 rounded-lg border-transparent focus:ring-2 focus:ring-purple-500 resize-y"></textarea>
        </div>
        <div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition">
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactPage;

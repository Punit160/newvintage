import React from 'react';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Footer Section */}
        <div className="py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
Empowering individuals with evidence-based health guidance, compassionate care, and seamless access to expert support.              
            </p>
            {/* <p className="text-sm text-gray-600 leading-relaxed">
              Developed by Cipher Mantra
            </p> */}
            <p className="text-sm text-gray-600 leading-relaxed">
              Visit our website: <a href="https://vintagehealthbody.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.vintagehealthbody.com</a>
            </p>
            <div className="flex space-x-4">
              {/* Social Media Icons */}
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                <FiFacebook size={20} />
              </a>
              {/* <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FiTwitter size={20} />
              </a> */}
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                <FiInstagram size={20} />
              </a>
              {/* <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                <FiLinkedin size={20} />
              </a> */}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="https://vintagehealthbody.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Help Center</a></li>
              {/* <li><a href="https://vintagehealthbody.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Documentation</a></li> */}
              <li><a href="https://vintagehealthbody.com/contact-us/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Contact Us</a></li>
              <li><a href="https://vintagehealthbody.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Contact Info */}
         {/* Contact Info */}
<div>
  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Contact</h3>
  <ul className="space-y-3">
    <li className="flex items-start space-x-2">
      <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
      <a href="mailto:info.multivisionwizards@gmail.com" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
        vinwithjenn@yahoo.com
      </a>
    </li>
    <li className="flex items-start space-x-2">
      <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
      </svg>
      <a href="tel:+61400000000" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
       +61 400 000 000
      </a>
    </li>
    <li className="flex items-start space-x-2">
      <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
<a
  href="https://www.google.com/maps?ll=32.379749,-90.039831&z=10&t=m&hl=en-GB&gl=US&mapclient=embed&q=112+Lake+Vista+Pl+Brandon,+MS+39047+USA"
  target="_blank"
  rel="noopener noreferrer"
  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
>
 Vintage Family Health, 112 Lake Vista Pl, Brandon, MS 39047, USA
</a>


    </li>
  </ul>
</div>

        </div>

        {/* Bottom Footer Section */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              © {new Date().getFullYear()} Vintage. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2">
              <a href="https://www.example.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="https://www.example.com/terms" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="https://www.example.com/cookies" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

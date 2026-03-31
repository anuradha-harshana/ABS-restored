import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-light tracking-wide">
          © {new Date().getFullYear()} AUTOMA8. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-2 font-light">
          Vehicle Service Management System
        </p>
      </div>
    </footer>
  )
}

export default Footer
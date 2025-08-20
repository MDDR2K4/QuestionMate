'use client';
import { useState } from 'react';
import { Github, Linkedin, Mail, Instagram } from 'lucide-react';

export default function Footer() {
  const [mailTooltip, setMailTooltip] = useState('Click to copy email');

  const handleMailClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const email = 'mdeerajdrao@gmail.com'; // <-- IMPORTANT: Put your email here
    navigator.clipboard.writeText(email);
    setMailTooltip('Email copied!');
    setTimeout(() => {
      setMailTooltip('Click to copy email');
    }, 2000);
  };

  return (
    <footer className="w-full bg-gray-800 text-white mt-auto py-6">
      <div className="container mx-auto text-center">
        <p className="mb-4">Developed by M Deeraj</p>
        <div className="flex justify-center gap-6">
          <a href="https://www.linkedin.com/in/mdeerajdrao/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
            <Linkedin size={24} />
          </a>
          <a href="https://github.com/MDDR2K4" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
            <Github size={24} />
          </a>
          <a href="https://instagram.com/dxxrxj" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
            <Instagram size={24} />
          </a>
          <div className="relative group">
            <a href="mailto:mdeerajdrao@gmail.com" onClick={handleMailClick} className="hover:text-red-400 transition-colors">
              <Mail size={24} />
            </a>
            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {mailTooltip}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          QuestionMate © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
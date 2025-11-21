import React, { useState } from 'react';
import { Heart, Code2, Github, Twitter, Mail, Shield, Star, Zap, Layout } from 'lucide-react';
import InfoModal from './InfoModal';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [activeModal, setActiveModal] = useState<'about' | 'features' | 'privacy' | 'contact' | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="w-full mt-16 border-t border-gray-200 pt-10 pb-6 animate-slide-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <div className="max-w-2xl mx-auto text-center space-y-6">

          {/* Brand & Developer */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg tracking-tight">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <Code2 className="w-5 h-5" />
              </div>
              <span>TaskMaster</span>
            </div>

            <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
              Crafted with
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              by <span className="text-slate-800 font-bold">Leirad Noznag</span>
            </p>
          </div>

          {/* Decorative Separator */}
          <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto"></div>

          {/* Links & Copyright */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-500">
              <button onClick={() => setActiveModal('about')} className="hover:text-indigo-600 transition-colors">About</button>
              <button onClick={() => setActiveModal('features')} className="hover:text-indigo-600 transition-colors">Features</button>
              <button onClick={() => setActiveModal('privacy')} className="hover:text-indigo-600 transition-colors">Privacy</button>
              <button onClick={() => setActiveModal('contact')} className="hover:text-indigo-600 transition-colors">Contact</button>
            </div>

            <p className="text-xs text-slate-400">
              © {currentYear} TaskMaster Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <InfoModal isOpen={activeModal === 'about'} onClose={closeModal} title="About TaskMaster">
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            TaskMaster is a premium productivity tool designed to help you organize your life with style and efficiency.
            Built with a focus on user experience, it combines powerful features with a beautiful, distraction-free interface.
          </p>
          <p>
            Whether you're managing work projects, personal goals, or daily errands, TaskMaster provides the clarity you need to get things done.
          </p>
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mt-4">
            <h4 className="font-bold text-indigo-900 mb-2">Our Mission</h4>
            <p className="text-sm text-indigo-700">
              To empower individuals to achieve more by simplifying the chaos of daily life through intuitive design and smart technology.
            </p>
          </div>
        </div>
      </InfoModal>

      <InfoModal isOpen={activeModal === 'features'} onClose={closeModal} title="Key Features">
        <div className="grid gap-4">
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm h-fit text-indigo-600"><Zap className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-slate-800">Focus Mode</h4>
              <p className="text-sm text-slate-500 mt-1">Eliminate distractions with a dedicated timer and single-task view.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm h-fit text-emerald-600"><Layout className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-slate-800">Smart Organization</h4>
              <p className="text-sm text-slate-500 mt-1">Categorize tasks, set priorities, and track deadlines effortlessly.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm h-fit text-amber-600"><Star className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-slate-800">Progress Tracking</h4>
              <p className="text-sm text-slate-500 mt-1">Visual insights into your daily productivity and completion rates.</p>
            </div>
          </div>
        </div>
      </InfoModal>

      <InfoModal isOpen={activeModal === 'privacy'} onClose={closeModal} title="Privacy Policy">
        <div className="space-y-4 text-slate-600">
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg mb-4">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-sm">Your Data is Secure</span>
          </div>
          <p>
            At TaskMaster, we take your privacy seriously. Here is how we handle your data:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Local Storage:</strong> All your tasks and preferences are stored locally on your device. We do not transmit your personal data to external servers.</li>
            <li><strong>No Tracking:</strong> We do not use cookies or third-party trackers to monitor your behavior.</li>
            <li><strong>Data Control:</strong> You have full control over your data. You can clear your data at any time through the browser settings.</li>
          </ul>
          <p className="text-xs text-slate-400 mt-4">
            Last updated: November 2025
          </p>
        </div>
      </InfoModal>

      <InfoModal isOpen={activeModal === 'contact'} onClose={closeModal} title="Contact Us">
        <div className="space-y-6 text-center">
          <p className="text-slate-600">
            Have questions, feedback, or just want to say hello? We'd love to hear from you!
          </p>

          <div className="flex flex-col gap-3">
            <a href="mailto:hello@taskmaster.app" className="flex items-center justify-center gap-3 p-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              <Mail className="w-5 h-5" />
              leiradcompany@gmail.com
            </a>

          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Developed by <span className="font-bold text-slate-800">Leirad Noznag</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Manila, Philippines
            </p>
          </div>
        </div>
      </InfoModal>
    </>
  );
};

export default Footer;
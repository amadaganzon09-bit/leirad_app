import React, { useState } from 'react';
import { Heart, Code2, Github, Twitter, Mail, Shield, Star, Zap, Layout, Wallet } from 'lucide-react';
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
              <span>LeiradMaster</span>
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
              <button onClick={() => setActiveModal('about')} className="hover:text-indigo-600 transition-colors">About </button>
              <button onClick={() => setActiveModal('features')} className="hover:text-indigo-600 transition-colors">Features</button>
              <button onClick={() => setActiveModal('privacy')} className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
              <button onClick={() => setActiveModal('contact')} className="hover:text-indigo-600 transition-colors">Contact</button>
            </div>

            <p className="text-xs text-slate-400">
              © {currentYear} LeiradMaster Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <InfoModal isOpen={activeModal === 'about'} onClose={closeModal} title="About LeiradMaster">
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            LeiradMaster is a comprehensive productivity and financial management application designed to help you organize your life with style and efficiency.
            Built with a focus on user experience, it combines powerful task management with personal finance tracking in a beautiful, distraction-free interface.
          </p>
          <p>
            Whether you're managing work projects, personal goals, daily errands, or tracking your income and expenses, LeiradMaster provides the clarity you need to get things done and stay financially healthy.
          </p>
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mt-4">
            <h4 className="font-bold text-indigo-900 mb-2">Our Mission</h4>
            <p className="text-sm text-indigo-700">
              To empower individuals to achieve more by simplifying the chaos of daily life through intuitive design and smart technology, while providing complete control over personal data and finances.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">Key Benefits</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              <li>Seamless task and financial management in one place</li>
              <li>Offline-first approach ensures your data stays private</li>
              <li>Beautiful, distraction-free interface</li>
              <li>Cross-platform synchronization</li>
            </ul>
          </div>
        </div>
      </InfoModal>

      <InfoModal isOpen={activeModal === 'features'} onClose={closeModal} title="Key Features">
        <div className="grid gap-4">
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm h-fit text-indigo-600"><Zap className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-slate-800">Focus Mode</h4>
              <p className="text-sm text-slate-500 mt-1">Eliminate distractions with a dedicated timer and single-task view. Complete tasks with full concentration and track your focus sessions.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm h-fit text-emerald-600"><Layout className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-slate-800">Smart Organization</h4>
              <p className="text-sm text-slate-500 mt-1">Categorize tasks, set priorities, and track deadlines effortlessly. Tasks are automatically sorted into smart sections for better management.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm h-fit text-amber-600"><Star className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-slate-800">Progress Tracking</h4>
              <p className="text-sm text-slate-500 mt-1">Visual insights into your daily productivity and completion rates. Celebrate achievements with rewarding animations.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm h-fit text-blue-600"><Wallet className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-slate-800">Financial Management</h4>
              <p className="text-sm text-slate-500 mt-1">Track income, expenses, budgets, and savings goals. Get visual insights into your financial health with comprehensive dashboards.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm h-fit text-purple-600"><Shield className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-slate-800">Privacy First</h4>
              <p className="text-sm text-slate-500 mt-1">All data is stored locally on your device. No servers, no tracking, no data sharing. Your information stays private and secure.</p>
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
            At LeiradMaster, we take your privacy seriously. Here is how we handle your data:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Local Storage:</strong> All your tasks, financial data, preferences, and settings are stored locally on your device. We do not transmit your personal data to external servers.</li>
            <li><strong>No Tracking:</strong> We do not use cookies, analytics, or third-party trackers to monitor your behavior. No information about your usage is collected.</li>
            <li><strong>Data Control:</strong> You have full control over your data. You can export, clear, or manage your data at any time through the application settings.</li>
            <li><strong>Financial Privacy:</strong> Your income, expenses, budgets, and financial goals are never shared, sold, or transmitted to any third parties.</li>
            <li><strong>Offline Functionality:</strong> LeiradMaster works completely offline. Internet access is only needed for initial loading of the application.</li>
          </ul>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4">
            <h4 className="font-bold text-slate-900 mb-2">Data Security</h4>
            <p className="text-sm text-slate-700">
              Your data is encrypted and stored securely in your browser's local storage. We recommend regularly backing up important financial information.
            </p>
          </div>
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
            <a href="mailto:leiradcompany@gmail.com" className="flex items-center justify-center gap-3 p-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              <Mail className="w-5 h-5" />
              leiradcompany@gmail.com
            </a>

          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
            <h4 className="font-bold text-slate-900 mb-2">Support Information</h4>
            <p className="text-sm text-slate-700 mb-2">
              For technical support, feature requests, or bug reports, please email us at the address above.
            </p>
            <p className="text-sm text-slate-700">
              We typically respond to all inquiries within 24-48 hours.
            </p>
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
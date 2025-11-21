import React, { useEffect, useState } from 'react';
import { ListTodo, Sparkles } from 'lucide-react';

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onFinish, 500); // Wait for exit animation
        }, 2500); // Display time

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div className="relative flex flex-col items-center">
                {/* Animated Background Blobs */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

                {/* Logo Container */}
                <div className="relative z-10 mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center transform animate-bounce-gentle">
                        <ListTodo className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                        <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-bold text-white tracking-tight animate-fade-in-up">
                        Leirad<span className="text-indigo-400">Master</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-widest uppercase animate-fade-in-up animation-delay-300">
                        Organize • Focus • Budget • Achieve
                    </p>
                </div>

                {/* Loading Bar */}
                <div className="mt-12 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-full animate-loading-bar rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;

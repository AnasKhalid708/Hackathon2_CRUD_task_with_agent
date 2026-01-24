import React from 'react';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-xl mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">
                            © {new Date().getFullYear()} TaskMaster. All rights reserved.
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-slate-400">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                        <span>by Syed</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

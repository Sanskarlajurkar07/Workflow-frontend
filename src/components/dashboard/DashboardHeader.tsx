import React from 'react';
import { Bell, Settings, User, Search, Zap } from 'lucide-react';
import { useTheme } from '../../utils/themeProvider';

export const DashboardHeader = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <header className={`${isLight ? 'bg-theme-white/90 backdrop-blur-sm border-b border-theme-light' : 'bg-theme-dark/90 backdrop-blur-sm border-b border-theme-medium-dark/50'}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="relative max-w-sm">
              <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isLight ? 'text-theme-medium-dark/70' : 'text-theme-light/70'}`} />
              <input 
                type="text" 
                placeholder="Search workflows..." 
                className={`pl-9 pr-4 py-2 w-64 ${
                  isLight 
                    ? 'bg-theme-light/70 border border-theme-light text-theme-dark placeholder-theme-medium-dark/60'
                    : 'bg-theme-medium-dark/20 border border-theme-medium-dark/40 text-theme-light placeholder-theme-light/50'
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-medium/40 focus:border-transparent`}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className={`relative p-2 ${
              isLight 
                ? 'text-theme-medium-dark hover:text-theme-medium hover:bg-theme-light/70' 
                : 'text-theme-light hover:text-theme-white hover:bg-theme-medium-dark/20'
              } rounded-full transition-colors`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-theme-medium rounded-full"></span>
            </button>
            
            <button className={`p-2 ${
              isLight 
                ? 'text-theme-medium-dark hover:text-theme-medium hover:bg-theme-light/70'
                : 'text-theme-light hover:text-theme-white hover:bg-theme-medium-dark/20'
              } rounded-full transition-colors`}>
              <Settings className="w-5 h-5" />
            </button>
            
            <div className={`flex items-center pl-4 ${isLight ? 'border-l border-theme-light' : 'border-l border-theme-medium-dark/30'}`}>
              <button className="flex items-center space-x-3 group">
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-medium ${
                    isLight 
                      ? 'text-theme-dark group-hover:text-theme-medium'
                      : 'text-theme-white group-hover:text-theme-medium'
                  } transition-colors`}>Sanskar</span>
                  <span className={`text-xs ${isLight ? 'text-theme-medium-dark/70' : 'text-theme-light/70'}`}>Pro Plan</span>
                </div>
                <div className={`w-8 h-8 ${
                  isLight 
                    ? 'bg-theme-medium/20 text-theme-medium-dark border border-theme-medium/30'
                    : 'bg-theme-medium/20 text-theme-light border border-theme-medium/30'
                } rounded-full flex items-center justify-center`}>
                  <User className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
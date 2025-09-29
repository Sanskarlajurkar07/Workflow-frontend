import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BrainCircuit, 
  LayoutDashboard, 
  Workflow, 
  Database, 
  FileText,
  Wand2,
  FolderOpen,
  Lightbulb,
  Plus,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useTheme } from '../../utils/themeProvider';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Workflows', icon: Workflow, href: '/workflows' },
  { name: 'Templates', icon: FolderOpen, href: '/templates' },
  { name: 'Smart Database', icon: Database, href: '/database' },
  { name: 'Documents', icon: FileText, href: '/documents' },
  { name: 'AI Tools', icon: Lightbulb, href: '/ai-tools' },
  { name: 'Scripts', icon: Wand2, href: '/scripts' },
];

export const DashboardSidebar = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className={`flex flex-col w-64 ${isLight ? 'bg-theme-light border-r border-theme-light/70' : 'bg-theme-dark border-r border-theme-medium-dark/50'}`}>
      <div className={`flex items-center h-16 px-4 ${isLight ? 'border-b border-theme-light bg-theme-light/80' : 'border-b border-theme-medium-dark/40 bg-theme-dark/80'}`}>
        <BrainCircuit className={`w-8 h-8 ${isLight ? 'text-theme-medium' : 'text-theme-medium'}`} />
        <span className={`ml-2 text-xl font-bold ${isLight ? 'text-theme-dark' : 'text-theme-white'}`}>FlowMind AI</span>
      </div>
      
      <div className="flex-1 px-3 py-5 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Create Workflow Button */}
          <Link 
            to="/workflow/create" 
            className={`flex items-center justify-center px-4 py-3 text-sm font-medium ${isLight ? 'text-theme-white bg-theme-medium hover:bg-theme-medium-dark' : 'text-theme-white bg-theme-medium hover:bg-theme-medium-dark'} rounded-lg transition-all shadow-md group`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Workflow
          </Link>

          {/* Navigation items */}
          <nav className="space-y-1.5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg group transition-all duration-200 ${
                  isActive(item.href) 
                  ? isLight 
                    ? 'bg-theme-medium/20 text-theme-medium-dark border border-theme-medium/30' 
                    : 'bg-theme-medium/20 text-theme-light border border-theme-medium/30'
                  : isLight
                    ? 'text-theme-medium-dark hover:bg-theme-light/70 hover:text-theme-dark border border-transparent'
                    : 'text-theme-light hover:bg-theme-medium-dark/20 hover:text-theme-white border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${
                  isActive(item.href) 
                    ? isLight ? 'text-theme-medium' : 'text-theme-medium'
                    : isLight 
                      ? 'text-theme-medium-dark/70 group-hover:text-theme-medium-dark' 
                      : 'text-theme-light/70 group-hover:text-theme-light'
                }`} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className={`mt-auto pt-5 ${isLight ? 'border-t border-theme-light' : 'border-t border-theme-medium-dark/30'} space-y-1.5`}>
          <Link
            to="/settings"
            className={`flex items-center px-3 py-2.5 text-sm font-medium ${
              isLight 
                ? 'text-theme-medium-dark hover:bg-theme-light/70 hover:text-theme-dark' 
                : 'text-theme-light hover:bg-theme-medium-dark/20 hover:text-theme-white'
            } rounded-lg transition-all group`}
          >
            <Settings className={`w-5 h-5 mr-3 ${
              isLight 
                ? 'text-theme-medium-dark/70 group-hover:text-theme-medium-dark' 
                : 'text-theme-light/70 group-hover:text-theme-light'
            }`} />
            Settings
          </Link>
          <Link
            to="/help"
            className={`flex items-center px-3 py-2.5 text-sm font-medium ${
              isLight 
                ? 'text-theme-medium-dark hover:bg-theme-light/70 hover:text-theme-dark' 
                : 'text-theme-light hover:bg-theme-medium-dark/20 hover:text-theme-white'
            } rounded-lg transition-all group`}
          >
            <HelpCircle className={`w-5 h-5 mr-3 ${
              isLight 
                ? 'text-theme-medium-dark/70 group-hover:text-theme-medium-dark' 
                : 'text-theme-light/70 group-hover:text-theme-light'
            }`} />
            Help & Support
          </Link>
          <button
            className={`flex items-center w-full px-3 py-2.5 text-sm font-medium ${
              isLight 
                ? 'text-theme-medium-dark hover:bg-theme-light/70 hover:text-theme-dark' 
                : 'text-theme-light hover:bg-theme-medium-dark/20 hover:text-theme-white'
            } rounded-lg transition-all group`}
          >
            <LogOut className={`w-5 h-5 mr-3 ${
              isLight 
                ? 'text-theme-medium-dark/70 group-hover:text-theme-medium-dark' 
                : 'text-theme-light/70 group-hover:text-theme-light'
            }`} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Moon, 
  Menu, 
  X, 
  ChevronDown, 
  Boxes, 
  Workflow, 
  Bot, 
  Gauge,
  Shield
} from 'lucide-react';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const platformFeatures = [
    {
      title: "Workflow Builder",
      description: "Visual drag-and-drop AI pipeline builder",
      icon: Workflow,
      path: "/workflow"
    },
    {
      title: "AI Models Hub",
      description: "Connect to 20+ AI models and APIs",
      icon: Bot,
      path: "/integrations"
    },
    {
      title: "Templates Gallery",
      description: "Pre-built workflows for quick starts",
      icon: Boxes,
      path: "/templates"
    },
    {
      title: "Enterprise Features",
      description: "Advanced security and compliance",
      icon: Shield,
      path: "/enterprise"
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Enhanced Logo Section */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FlowMind AI
              </span>
              <span className="text-xs text-gray-400">AI Workflow Automation</span>
            </div>
          </div>
          
          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="relative group">
              <button 
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Platform
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full -left-4 w-80 p-4 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                <div className="grid grid-cols-1 gap-3">
                  {platformFeatures.map((feature) => (
                    <Link 
                      key={feature.path}
                      to={feature.path} 
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <feature.icon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                      <div>
                        <div className="text-sm font-medium text-white">{feature.title}</div>
                        <div className="text-xs text-gray-400">{feature.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <Link to="/solutions" className="text-gray-300 hover:text-white transition-colors">Solutions</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="/docs" className="text-gray-300 hover:text-white transition-colors">Documentation</Link>
          </nav>
          
          {/* Enhanced Right Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors font-medium text-gray-300 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/signup" 
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-all duration-200 font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 flex items-center gap-2"
            >
              Start Free
              <Gauge className="w-4 h-4" />
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-white/5"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-white/5">
          <nav className="px-4 py-4 space-y-3">
            {platformFeatures.map((feature) => (
              <Link 
                key={feature.path}
                to={feature.path} 
                className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 rounded-lg"
              >
                <feature.icon className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm font-medium text-white">{feature.title}</div>
                  <div className="text-xs text-gray-400">{feature.description}</div>
                </div>
              </Link>
            ))}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2" />
            <Link to="/solutions" className="block px-4 py-2 text-gray-300 hover:bg-white/5 rounded-lg">Solutions</Link>
            <Link to="/pricing" className="block px-4 py-2 text-gray-300 hover:bg-white/5 rounded-lg">Pricing</Link>
            <Link to="/docs" className="block px-4 py-2 text-gray-300 hover:bg-white/5 rounded-lg">Documentation</Link>
          </nav>
        </div>
      )}
    </header>
  );
};
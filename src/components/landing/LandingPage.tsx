import React from 'react';
import { Brain, Code, Database, Zap, ArrowRight, Bot, Sparkles } from 'lucide-react';
import { Header } from './Header';
import { Features } from './Features';
import { UseCases } from './UseCases';
import { Integrations } from './Integrations';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black text-white">
      <Header />
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          The Fastest Way to Build
          <br />
          <span className="text-5xl sm:text-7xl">
            AI Apps and Workflows
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Automate workflows and back office processes without code
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-white/10 rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            Book a Demo
            <Bot className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Pipeline Demo */}
      <div className="max-w-6xl mx-auto px-4 mb-24">
        <div className="bg-indigo-950/50 rounded-2xl p-8 backdrop-blur-xl border border-purple-500/20">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold">Build Pipeline</h2>
            <div className="flex gap-2">
              {['All', 'LLMs', 'Multimodal', 'Data', 'VectorDB', 'Logic', 'Chat'].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    tab === 'All' ? 'bg-purple-600' : 'hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="h-96 bg-indigo-950/30 rounded-lg border border-purple-500/10 flex items-center justify-center">
            <p className="text-gray-400">Interactive Pipeline Builder Demo</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <Features />

      {/* Use Cases */}
      <UseCases />

      {/* Integrations */}
      <Integrations />
    </div>
  );
};
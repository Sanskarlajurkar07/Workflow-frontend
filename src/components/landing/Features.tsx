import React from 'react';
import { Code, Zap, Database, Bot } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      title: 'No-code Builder',
      description: 'Build and deploy powerful applications with drag and drop components. No coding required.',
      icon: Zap,
    },
    {
      title: 'Code SDK',
      description: 'Access all functionality through your IDE with simple, intuitive APIs. Complete interoperability between No-code and Code SDK.',
      icon: Code,
    },
    {
      title: 'Smart Database',
      description: 'Built-in vector database for AI-powered search and retrieval. Store and manage your data efficiently.',
      icon: Database,
    },
    {
      title: 'AI Agents',
      description: 'Create intelligent agents that can understand context and execute complex tasks autonomously.',
      icon: Bot,
    },
  ];

  return (
    <section className="py-24 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          An ecosystem to build, deploy,
          <br />
          and manage AI applications
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-indigo-950/30 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-colors"
            >
              <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
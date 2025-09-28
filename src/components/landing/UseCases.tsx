import React from 'react';
import { MessageSquare, Search, Zap } from 'lucide-react';

export const UseCases = () => {
  const cases = [
    {
      title: 'Marketplace: pre-built use cases',
      description: 'Access a library of pre-built workflows and templates to kickstart your projects.',
      icon: Zap,
      link: '#',
    },
    {
      title: 'Agents: execute complex tasks',
      description: 'Create AI agents that can understand context and execute multi-step tasks.',
      icon: MessageSquare,
      link: '#',
    },
    {
      title: 'Search: use the optimal data retrieval method',
      description: 'Implement intelligent search across your data using vector embeddings.',
      icon: Search,
      link: '#',
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((item) => (
            <div
              key={item.title}
              className="bg-indigo-950/30 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20"
            >
              <item.icon className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-400 mb-4">{item.description}</p>
              <a
                href={item.link}
                className="inline-flex items-center text-purple-400 hover:text-purple-300"
              >
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
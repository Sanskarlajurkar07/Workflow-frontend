import React from 'react';

export const Integrations = () => {
  const integrations = [
    {
      category: 'Integrations and automations',
      description: 'Live-sync, set up action based triggers, and automate actions across your tool stack',
      tools: [
        { name: 'Google Drive', logo: 'https://www.gstatic.com/images/branding/product/2x/drive_48dp.png' },
        { name: 'OneDrive', logo: 'https://img.icons8.com/fluency/48/000000/microsoft-onedrive-2019.png' },
        { name: 'Salesforce', logo: 'https://img.icons8.com/color/48/000000/salesforce.png' },
        { name: 'Hubspot', logo: 'https://img.icons8.com/color/48/000000/hubspot.png' },
        { name: 'Notion', logo: 'https://img.icons8.com/glyph-neue/48/000000/notion.png' },
        { name: 'Airtable', logo: 'https://img.icons8.com/color/48/000000/airtable.png' },
      ],
    },
    {
      category: 'Large language models',
      description: 'Access the latest models through the FlowMind AI platform',
      tools: [
        { name: 'OpenAI', logo: 'https://img.icons8.com/color/48/000000/openai.png' },
        { name: 'Anthropic', logo: 'https://img.icons8.com/color/48/000000/artificial-intelligence.png' },
        { name: 'Google', logo: 'https://img.icons8.com/color/48/000000/google-logo.png' },
        { name: 'Meta LLAMA', logo: 'https://img.icons8.com/color/48/000000/meta.png' },
        { name: 'AWS', logo: 'https://img.icons8.com/color/48/000000/amazon-web-services.png' },
        { name: 'Mistral AI', logo: 'https://img.icons8.com/color/48/000000/artificial-intelligence.png' },
      ],
    },
  ];

  return (
    <section className="py-24 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {integrations.map((section) => (
          <div key={section.category} className="mb-20">
            <h2 className="text-2xl font-bold mb-4">{section.category}</h2>
            <p className="text-gray-400 mb-8">{section.description}</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
              {section.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex flex-col items-center justify-center p-4 bg-indigo-950/30 rounded-xl backdrop-blur-sm border border-purple-500/20"
                >
                  <img src={tool.logo} alt={tool.name} className="w-12 h-12 mb-2" />
                  <span className="text-sm text-center text-gray-300">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
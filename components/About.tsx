
import React from 'react';
import { CatalogData } from '../types';

interface AboutProps {
  data: CatalogData;
}

const About: React.FC<AboutProps> = ({ data }) => {
  return (
    <div className="min-h-screen pt-40 px-6 md:px-20 lg:px-40 pb-20 animate-in fade-in slide-in-from-bottom-10 duration-500">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
            
            {/* Text Content */}
            <div className="space-y-10 order-2 md:order-1">
                <div className="space-y-4">
                    <div className="w-12 h-2 bg-accent mb-6"></div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] text-white">
                        About <br/><span className="text-stroke-2">James.</span>
                    </h1>
                </div>

                <div className="font-mono text-gray-300 leading-relaxed text-sm md:text-base space-y-6">
                    {data.aboutText ? (
                        data.aboutText.split('\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                        ))
                    ) : (
                        <p>Loading biography...</p>
                    )}
                </div>

                <div className="pt-8 border-t border-white/10">
                    <p className="text-accent uppercase font-black tracking-widest text-sm mb-4">Core Competencies</p>
                    <div className="flex flex-wrap gap-2">
                        {['Direction', 'Cinematography', 'Creative Direction', 'Editing', 'Automotive', 'Fashion', 'Narrative'].map(tag => (
                            <span key={tag} className="border border-white/20 px-3 py-1 text-xs font-mono uppercase text-gray-400 hover:border-accent hover:text-white transition-colors cursor-default">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Image Content */}
            <div className="order-1 md:order-2 relative">
                <div className="aspect-[4/5] bg-neutral-900 border border-white/10 p-2 relative group">
                    <div className="absolute inset-0 bg-accent translate-x-4 translate-y-4 -z-10 border border-white/10 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
                    <img 
                        src={data.aboutImage || "https://picsum.photos/seed/james/800/1000"} 
                        alt="James F Coton" 
                        className="w-full h-full object-cover grayscale contrast-125 filter group-hover:grayscale-0 transition-all duration-700"
                    />
                    
                    {/* Decorative Overlay */}
                    <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur border border-white/20 p-4 max-w-[200px]">
                        <p className="font-mono text-[10px] text-accent uppercase mb-1">Director Profile</p>
                        <p className="font-bold text-white uppercase text-sm">James F. Coton</p>
                        <p className="font-mono text-[10px] text-gray-500 mt-1">EST. 2024</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default About;


import React from 'react';
import { CatalogData } from '../types';
import { Mail, ArrowUpRight, Copy } from 'lucide-react';

interface ContactProps {
  data: CatalogData;
}

const Contact: React.FC<ContactProps> = ({ data }) => {

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Email copied to clipboard");
  };

  return (
    <div className="min-h-screen pt-40 px-6 md:px-20 pb-20 animate-in fade-in slide-in-from-bottom-10 duration-500">
        <div className="max-w-5xl mx-auto">
            <div className="mb-16">
                 <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] text-white mb-8">
                    Get In <br/><span className="text-accent">Touch.</span>
                 </h1>
                 <p className="font-mono text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
                     {data.contactText || "For commercial inquiries, creative collaborations, or just to say hello, please contact me or my representation."}
                 </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Contact */}
                <div className="group bg-neutral-900 border border-white/10 p-8 hover:border-accent transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ArrowUpRight className="w-6 h-6 text-accent" />
                    </div>
                    
                    <h3 className="text-gray-500 font-mono uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        Direct Contact
                    </h3>
                    
                    <div className="text-2xl md:text-4xl font-bold text-white break-all mb-6 uppercase">
                        {data.emailPersonal || "contact@jamesfcoton.com"}
                    </div>

                    <div className="flex gap-4">
                        <a 
                            href={`mailto:${data.emailPersonal}`} 
                            className="bg-white text-black px-6 py-3 font-bold uppercase text-xs tracking-widest hover:bg-accent transition-colors flex items-center gap-2"
                        >
                            <Mail className="w-4 h-4" /> Send Email
                        </a>
                        <button 
                            onClick={() => copyToClipboard(data.emailPersonal || "")}
                            className="border border-white/20 text-white px-4 py-3 hover:bg-white/10 transition-colors"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Agent Contact */}
                <div className="group bg-neutral-900 border border-white/10 p-8 hover:border-accent transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ArrowUpRight className="w-6 h-6 text-accent" />
                    </div>

                    <h3 className="text-gray-500 font-mono uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        Representation / Agent
                    </h3>
                    
                    <div className="text-2xl md:text-4xl font-bold text-white break-all mb-6 uppercase">
                        {data.emailAgent || "agent@representation.com"}
                    </div>

                    <div className="flex gap-4">
                        <a 
                            href={`mailto:${data.emailAgent}`} 
                            className="bg-white text-black px-6 py-3 font-bold uppercase text-xs tracking-widest hover:bg-accent transition-colors flex items-center gap-2"
                        >
                            <Mail className="w-4 h-4" /> Contact Agent
                        </a>
                        <button 
                            onClick={() => copyToClipboard(data.emailAgent || "")}
                            className="border border-white/20 text-white px-4 py-3 hover:bg-white/10 transition-colors"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
                 <div>
                     <h4 className="text-accent font-bold uppercase text-sm mb-4">Socials</h4>
                     <ul className="space-y-2 font-mono text-xs text-gray-400">
                         <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                         <li><a href="#" className="hover:text-white transition-colors">Vimeo</a></li>
                         <li><a href="#" className="hover:text-white transition-colors">Twitter / X</a></li>
                     </ul>
                 </div>
                 <div>
                     <h4 className="text-accent font-bold uppercase text-sm mb-4">Location</h4>
                     <ul className="space-y-2 font-mono text-xs text-gray-400">
                         <li>Los Angeles, CA</li>
                         <li>Paris, France</li>
                         <li>Tokyo, Japan</li>
                     </ul>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Contact;

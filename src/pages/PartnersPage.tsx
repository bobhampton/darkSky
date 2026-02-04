import { ExternalLink, Award } from 'lucide-react';

/**
 * Partners page component
 */
export function PartnersPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="bg-gradient-to-br backdrop-blur-[2px] border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] rounded-lg mb-8">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-blue-400 drop-shadow-[0_2px_10px_rgba(59,130,246,0.5)]">
            Partners & Resources
          </h1>
          <p className="mt-3 text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Organizations and contributors supporting dark sky preservation
          </p>
        </div>
      </header>

      <main className="space-y-8">
        {/* Featured Contributor */}
        <section className="bg-gradient-to-br backdrop-blur-[2px] border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] rounded-lg p-8">
          <div className="flex items-start space-x-3 mb-4">
            <Award className="w-8 h-8 text-nebula-purple flex-shrink-0" />
            <div>
              <h2 className="text-sm uppercase tracking-wide font-semibold">
                Featured Contributor
              </h2>
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-star-white mb-2">Lia Rabellino</h3>
          <p className="text-xl mb-4">Light Pollution Research</p>
          
          <p className="text-gray-300 leading-relaxed mb-6">
            Lia Rabellino is a conservation advocate and community scientist whose work is helping build 
            a long-term understanding of artificial light at night around the Great Salt Lake region. 
            As part of her senior capstone project at Utah Valley University, Lia partnered with Great 
            Salt Lake Audubon and local dark sky initiatives to design an accessible protocol for measuring 
            light pollution using handheld sky quality meters, collected data at the Audubon’s Gillmor Sanctuary, 
            and helped establish a growing database to track trends over time. Her efforts not only produced 
            real scientific measurements, but also laid the foundation for a new community science program 
            that invites volunteers across the Salt Lake Valley to monitor nighttime light and its impacts 
            on birds and habitat, while highlighting the importance of dark skies in conservation work.
          </p>
          
          <a
            href="https://www.audubon.org/rockies/news/measuring-light-pollution-great-salt-lake"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-nebula-purple/20 hover:bg-nebula-purple/30 
                     border border-nebula-purple/50 rounded-lg hover:text-star-white 
                     transition-all duration-200 shadow-star-glow hover:shadow-nebula-glow"
          >
            <span>Learn more about her work</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </section>

        {/* Partner Organizations */}
        <section className="bg-white/2 backdrop-blur-[2px] border-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Partner Organizations</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Audubon Society */}
            <div className="bg-white/5 border border-gray-600/30 rounded-lg p-6 hover:border-purple-500/40 
                          hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-200">
              <h3 className="text-2xl font-bold text-star-white mb-1">Audubon Society</h3>
              <p className="text-lg mb-4">Great Salt Lake Chapter</p>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                The National Audubon Society is dedicated to protecting birds and the places they need, 
                including dark skies essential for nocturnal species. The Great Salt Lake chapter focuses 
                on conservation efforts in the region, including advocacy for reduced light pollution.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.audubon.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-star-cyan/10 hover:bg-star-cyan/20 
                           border border-star-cyan/30 rounded-lg text-star-cyan hover:text-star-white 
                           transition-all duration-200"
                >
                  <span>Visit Audubon.org</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://www.audubon.org/rockies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-aurora-green/10 hover:bg-aurora-green/20 
                           border border-aurora-green/30 rounded-lg text-aurora-green hover:text-star-white 
                           transition-all duration-200"
                >
                  <span>Great Salt Lake Chapter</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="bg-white/2 backdrop-blur-[2px] border-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Resources</h2>
          <p className="text-gray-300 mb-4">
            Additional tools and information for astronomers and dark sky enthusiasts:
          </p>
          
          <ul className="space-y-3">
            <li>
              <a
                href="https://www.timeanddate.com/astronomy/astronomical-twilight.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-star-cyan hover:text-star-white transition-colors"
              >
                <span>What is Astronomical Twilight?</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-gray-400 text-sm mt-1 ml-6">
                Comprehensive explanation of astronomical twilight and the -18° threshold used in this calculator
              </p>
            </li>
            <li>
              <a
                href="https://www.timeanddate.com/astronomy/polar-night.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-star-cyan hover:text-star-white transition-colors"
              >
                <span>What is Polar Night?</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-gray-400 text-sm mt-1 ml-6">
                Learn about polar night conditions that can produce extended dark time windows at high latitudes
              </p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

// import React from 'react';
import LogoOverlayCalculator from './components/LogoOverlayCalculator';
// import { Calculator } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 ">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* <Calculator className="w-10 h-10 text-indigo-600" /> */}
            <h1 className=" text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Logo Overlay Studio
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform your calculator with custom branding. Upload your logo and position it perfectly with our intuitive design tools.
          </p>
        </header>
        
        <main className="max-w-6xl mx-auto">
          <LogoOverlayCalculator />
        </main>
        
        <footer className="mt-16 text-center text-gray-500">
          <p className="text-sm">
            © {new Date().getFullYear()} Logo Overlay Studio. Crafted with precision for professionals.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
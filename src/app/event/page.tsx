'use client';

import { useState } from 'react';
import { MapPin, Calendar, Building2, X, Send } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { pastExhibitions, galleryImages } from '@/data/exhibitions';
import { Exhibition, GalleryImage } from '@/types';

export default function EventPage() {
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedExhibition) {
      toast.error('Please select an exhibition to register for.');
      setLoading(false);
      return;
    }

    try {
      await emailjs.send(
        'YOUR_ACTUAL_SERVICE_ID',
        'YOUR_ACTUAL_TEMPLATE_ID',
        { exhibition_name: selectedExhibition.name, exhibition_date: selectedExhibition.dates, ...formData },
        'YOUR_ACTUAL_PUBLIC_KEY'
      );
      toast.success('Registration successful! We will contact you soon.');
      setShowRegistration(false);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    } catch {
      toast.error('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const groupedPastExhibitions = pastExhibitions.reduce<Record<number, Exhibition[]>>((acc, exhibition) => {
    if (!acc[exhibition.year]) acc[exhibition.year] = [];
    acc[exhibition.year].push(exhibition);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f0efef]">
      <Toaster position="top-right" />

      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Past Exhibitions */}
        <section id="past" className="pt-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Past Exhibitions</h2>
            <div className="flex-grow h-[1px] bg-slate-200" />
          </div>

          {Object.entries(groupedPastExhibitions)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, exhibitions]) => (
              <div key={year} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-2xl font-bold text-rose-600">{year}</h3>
                  <div className="flex-grow h-[1px] bg-rose-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(exhibitions as Exhibition[]).map((exhibition) => (
                    <div
                      key={exhibition.id}
                      onClick={() => setSelectedExhibition(exhibition)}
                      className="bg-white rounded-lg shadow-md overflow-hidden transition hover:shadow-lg hover:-translate-y-1 group cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedExhibition(exhibition); }}
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={exhibition.image}
                          alt={exhibition.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-rose-600 transition-colors">{exhibition.name}</h3>
                        <div className="flex items-center text-slate-600 mb-2">
                          <MapPin size={16} className="mr-2" />{exhibition.location}
                        </div>
                        <div className="flex items-center text-slate-600 mb-3">
                          <Calendar size={16} className="mr-2" />{exhibition.dates}
                        </div>
                        <p className="mb-3 text-slate-700">{exhibition.venue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>

        {/* Gallery */}
        <section id="gallery" className="py-0">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Exhibition Gallery</h2>
            <div className="flex-grow h-[1px] bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image.id || index}
                onClick={() => setSelectedImage(image)}
                className="overflow-hidden rounded-lg cursor-pointer hover:opacity-90 relative group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedImage(image); }}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  className="w-full h-[300px] object-cover transition-transform group-hover:scale-110 duration-500"
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Exhibition Detail Modal */}
      {selectedExhibition && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedExhibition(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setSelectedExhibition(null)}
                className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 z-10"
                aria-label="Close"
              >
                <X size={24} />
              </button>
              <img src={selectedExhibition.image} alt={selectedExhibition.name} className="w-full h-[300px] md:h-[500px] object-cover" />
            </div>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">{selectedExhibition.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-slate-600">
                <div className="flex items-center"><MapPin size={20} className="mr-3 text-rose-600 flex-shrink-0" /><span>{selectedExhibition.location}</span></div>
                <div className="flex items-center"><Calendar size={20} className="mr-3 text-rose-600 flex-shrink-0" /><span>{selectedExhibition.dates}</span></div>
                <div className="flex items-center"><Building2 size={20} className="mr-3 text-rose-600 flex-shrink-0" /><span>{selectedExhibition.venue}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistration && selectedExhibition && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">Register for:</h2>
                  <p className="text-rose-600 font-semibold">{selectedExhibition.name}</p>
                </div>
                <button onClick={() => setShowRegistration(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleRegistration} className="space-y-4 md:space-y-6">
                {['name', 'email', 'company', 'phone'].map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-sm font-medium text-slate-700 mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1)}{field !== 'company' && ' *'}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      id={field}
                      name={field}
                      required={field !== 'company'}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Registering...' : <><Send size={18} />Register Now</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 z-10"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.alt || 'Exhibition photo'}
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-xl"
            />
          </figure>
        </div>
      )}
    </div>
  );
}

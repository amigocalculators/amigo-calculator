import { useState } from "react"; // Added useEffect for potential future use (e.g., fetching data)
import { MapPin, Calendar, Building2, X, Send } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import emailjs from "@emailjs/browser";
// Make sure these paths and exported names are correct
import {
  /* upcomingExhibitions, */ pastExhibitions,
  galleryImages,
} from "../data/exhibitions"; // Commented out unused upcomingExhibitions
// import Banner4 from '../components/Banner/Banner4';
function App() {
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ensure an exhibition is selected if registration depends on it
    if (!selectedExhibition) {
      toast.error("Please select an exhibition to register for.");
      setLoading(false);
      return;
    }

    try {
      await emailjs.send(
        "YOUR_ACTUAL_SERVICE_ID", // <--- MUST REPLACE
        "YOUR_ACTUAL_TEMPLATE_ID", // <--- MUST REPLACE
        {
          exhibition_name: selectedExhibition.name,
          exhibition_date: selectedExhibition.dates,
          ...formData,
        },
        "YOUR_ACTUAL_PUBLIC_KEY" // <--- MUST REPLACE
      );
      toast.success("Registration successful! We will contact you soon.");
      setShowRegistration(false);
      setFormData({ name: "", email: "", company: "", phone: "", message: "" });
    } catch (error) {
      console.error("Registration error:", error); // Log the specific error
      toast.error("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const groupedPastExhibitions = pastExhibitions.reduce((acc, exhibition) => {
    const year = exhibition.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(exhibition);
    return acc;
  }, {});

  // Example: How you might open the registration modal (e.g., from the exhibition detail modal)
  // const openRegistrationModal = (exhibition) => {
  //   setSelectedExhibition(exhibition); // Ensure the correct exhibition is set for registration context
  //   setShowRegistration(true);
  // };

  return (
    <div className="min-h-screen bg-[#f0efef]">
      <Toaster position="top-right" />

      {/* Hero Section */}
      {/* <section className="relative bg-gradient-to-r from-blue-900 to-green-800 text-white h-[190vh] lg:h-[90vh] pt-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Business meeting with laptops" // More descriptive alt text
            className="w-full h-full object-cover opacity-70"
            style={{ filter: "blur(5px)" }}
          />
        </div>
        <div className="relative container mx-auto px-4 flex items-center justify-center h-full">
          <Banner4 /> 
        </div>
      </section> */}

      <main className="container mx-auto px-4 py-8">
        {/* Past Exhibitions */}
        <section id="past" className="pt-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-slate-800">
              Past Exhibitions
            </h2>
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
                  {exhibitions.map((exhibition) => (
                    <div
                      key={exhibition.id}
                      onClick={() => setSelectedExhibition(exhibition)}
                      className="bg-white rounded-lg shadow-md overflow-hidden transition hover:shadow-lg hover:-translate-y-1 group cursor-pointer"
                      role="button" // Added role for clickability
                      tabIndex={0} // Added for keyboard accessibility
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setSelectedExhibition(exhibition);
                      }} // Keyboard accessibility
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={exhibition.image}
                          alt={exhibition.name || "Exhibition visual"} // Fallback for alt text
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-rose-600 transition-colors">
                          {exhibition.name || "Exhibition Name"}
                        </h3>
                        <div className="flex items-center text-slate-600 mb-2">
                          <MapPin size={16} className="mr-2" />
                          {exhibition.location || "N/A"}
                        </div>
                        <div className="flex items-center text-slate-600 mb-3">
                          <Calendar size={16} className="mr-2" />
                          {exhibition.dates || "N/A"}
                        </div>
                        <p className="mb-3 text-slate-700">
                          {exhibition.venue || "Venue not specified"}
                        </p>

                        {/* {exhibition.stats && (
                          <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-100 text-center">
                            <div>
                              <div className="text-rose-600 font-semibold">
                                {(exhibition.stats.visitors || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-slate-500">Visitors</div>
                            </div>
                            <div>
                              <div className="text-rose-600 font-semibold">
                                {exhibition.stats.products || 0}
                              </div>
                              <div className="text-xs text-slate-500">Products</div>
                            </div>
                            <div>
                              <div className="text-rose-600 font-semibold">
                                {exhibition.stats.deals || 0}
                              </div>
                              <div className="text-xs text-slate-500">Deals</div>
                            </div>
                          </div>
                        )} */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>{" "}
        {/* Closing tag for past exhibitions section */}
        {/* Gallery */}
        <section id="gallery" className="py-0">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              Exhibition Gallery
            </h2>
            <div className="flex-grow h-[1px] bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image.id || index} // Prefer a stable ID if available
                onClick={() => setSelectedImage(image)}
                className="overflow-hidden rounded-lg cursor-pointer hover:opacity-90 relative group"
                role="button" // Added role for clickability
                tabIndex={0} // Added for keyboard accessibility
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setSelectedImage(image);
                }}
              >
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    `Gallery image ${index + 1} - ${image.location || ""}`
                  } // More descriptive fallback
                  className="w-full h-[300px] aspect-square object-cover transition-transform group-hover:scale-110 duration-500" // Added aspect-square for consistency if desired
                />
                {/* Optional: Overlay (your commented-out code was fine if you want it) */}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modals are below */}
      {/* Exhibition Detail Modal */}
      {selectedExhibition && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedExhibition(null)} // Close on backdrop click
          role="dialog"
          aria-modal="true"
          aria-labelledby="exhibition-detail-title"
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="relative">
              <button
                onClick={() => setSelectedExhibition(null)}
                className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 z-10" // Added z-10
                aria-label="Close exhibition details"
              >
                <X size={24} />
              </button>
              <img
                src={selectedExhibition.image}
                alt={selectedExhibition.name || "Exhibition image"}
                className="w-full h-[300px] md:h-[500px] object-cover" // Responsive height
              />
            </div>
            <div className="p-6 md:p-8">
              {" "}
              {/* Responsive padding */}
              <h2
                id="exhibition-detail-title"
                className="text-2xl md:text-3xl font-bold text-slate-800 mb-6"
              >
                {selectedExhibition.name || "Exhibition Details"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-slate-600">
                <div className="flex items-center">
                  <MapPin
                    size={20}
                    className="mr-3 text-rose-600 flex-shrink-0"
                  />
                  <span>{selectedExhibition.location || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar
                    size={20}
                    className="mr-3 text-rose-600 flex-shrink-0"
                  />
                  <span>{selectedExhibition.dates || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Building2
                    size={20}
                    className="mr-3 text-rose-600 flex-shrink-0"
                  />
                  <span>{selectedExhibition.venue || "N/A"}</span>
                </div>
              </div>
              {/* {selectedExhibition.stats && (
                <div className="bg-slate-50 p-6 rounded-xl mb-8">
                  <h3 className="text-xl font-semibold text-slate-700 mb-6">Exhibition Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <Users className="w-10 h-10 md:w-12 md:h-12 text-rose-600 flex-shrink-0" />
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-slate-800">{(selectedExhibition.stats.visitors || 0).toLocaleString()}</div>
                        <div className="text-slate-600 text-sm">Visitors</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                      <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-rose-600 flex-shrink-0" />
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-slate-800">{selectedExhibition.stats.products || 0}</div>
                        <div className="text-slate-600 text-sm">Products</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                      <Target className="w-10 h-10 md:w-12 md:h-12 text-rose-600 flex-shrink-0" />
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-slate-800">{selectedExhibition.stats.deals || 0}</div>
                        <div className="text-slate-600 text-sm">Deals</div>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}
              {/* Example button to open registration modal from here */}
              {/* <button
                onClick={() => openRegistrationModal(selectedExhibition)}
                className="mt-4 w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
              >
                Register for this Exhibition <Send size={20}/>
              </button> */}
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistration &&
        selectedExhibition && ( // Ensure selectedExhibition is present for this modal
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            // onClick={() => setShowRegistration(false)} // Optional: close on backdrop click
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-modal-title"
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" // Adjusted max-w & added scroll
              // onClick={e => e.stopPropagation()} // If backdrop click is enabled above
            >
              <div className="p-6 md:p-8">
                {" "}
                {/* Responsive padding */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2
                      id="registration-modal-title"
                      className="text-xl md:text-2xl font-bold text-slate-800"
                    >
                      Register for:
                    </h2>
                    <p className="text-rose-600 font-semibold">
                      {selectedExhibition.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRegistration(false)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Close registration form"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form
                  onSubmit={handleRegistration}
                  className="space-y-4 md:space-y-6"
                >
                  {["name", "email", "company", "phone"].map((field) => (
                    <div key={field}>
                      <label
                        htmlFor={field}
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                        {field !== "company" && " *"}
                      </label>
                      <input
                        type={
                          field === "email"
                            ? "email"
                            : field === "phone"
                            ? "tel"
                            : "text"
                        }
                        id={field}
                        name={field}
                        required={field !== "company"} // Company is optional
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                      />
                    </div>
                  ))}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3} // Reduced rows slightly
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Registering...
                      </>
                    ) : (
                      <>
                        Register Now <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" // Increased bg opacity, z-index
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors z-10"
            onClick={() => setSelectedImage(null)} // Ensure button also closes it
            aria-label="Close image view"
          >
            <X size={28} /> {/* Slightly larger X */}
          </button>
          <figure className="relative" onClick={(e) => e.stopPropagation()}>
            {" "}
            {/* Use figure for semantic meaning */}
            <img
              src={selectedImage.url}
              alt={selectedImage.alt || "Enlarged exhibition photo"}
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-xl" // Added rounded-lg & shadow
            />
            {/* {(selectedImage.location || selectedImage.year) && ( // Show caption only if there's content
                 <figcaption className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg text-white text-center text-sm">
                    {selectedImage.location && <div className="font-medium">{selectedImage.location}</div>}
                    {selectedImage.year && <div className="text-xs text-rose-300">{selectedImage.year}</div>}
                 </figcaption>
            )} */}
          </figure>
        </div>
      )}
    </div>
  );
}

export default App;

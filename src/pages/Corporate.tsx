import React, { useState, useEffect } from "react";
import {
  X,
  Gift,
  Briefcase,
  Award,
  Users,
  Send,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PenTool,
  PackageOpen,
} from "lucide-react";
import emailjs from "@emailjs/browser";
import toast, { Toaster } from "react-hot-toast";
import App2 from "../components/Ev1/App2";

// Banner Component
const Banner = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-500">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <p className="text-white text-sm md:text-base font-medium">
            🎁 Special offer: 15% off orders over 50 units! Limited time only
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-amber-100 transition-colors"
            aria-label="Close banner"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// // Hero Component
const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      className=" relative h-1/4 flex items-center pt-16 overflow-hidden "
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 z-0 "
        style={{ opacity: 0.97 }}
      />
      <div className="absolute inset-0 overflow-hidden z-0 ">
        <div
          className="absolute inset-0 opacity-80 bg-grid-white/[0.2] "
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1501959181532-7d2a3c064642?q=80&w=2093&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
          }}
        />
      </div>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-10"
            }`}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              Premium Calculators for <br />
              <span className="text-amber-400">Corporate Gifting</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Impress your clients and employees with sophisticated, branded
              Amigo calculators. The perfect blend of functionality and
              prestige.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/products"
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-8 py-3 rounded-md transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                Explore Products
              </a>
              <a
                href="#contact"
                className="bg-transparent hover:bg-white/10 text-white border border-white font-medium px-8 py-3 rounded-md transition-colors duration-300"
              >
                Request Quote
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <a href="#benefits" aria-label="Scroll down">
          <ChevronDown size={24} />
        </a>
      </div>
    </section>
  );
};

// // Benefits Component
const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
    <div className="text-amber-500 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const Benefits = () => {
  const benefits = [
    {
      icon: <Gift size={32} />,
      title: "Memorable Impression",
      description:
        "Stand out with premium calculators that leave a lasting impression on clients and partners.",
    },
    {
      icon: <Briefcase size={32} />,
      title: "Professional Utility",
      description:
        "Provide a practical gift that enhances daily work and keeps your brand top-of-mind.",
    },
    {
      icon: <Award size={32} />,
      title: "Custom Branding",
      description:
        "Elevate your corporate image with elegantly branded calculators featuring your logo and colors.",
    },
    {
      icon: <Users size={32} />,
      title: "Volume Solutions",
      description:
        "From small teams to large corporations, we offer flexible quantities with consistent quality.",
    },
  ];

  return (
    <section id="benefits" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Why Choose Amigo for Corporate Gifts
          </h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-lg">
            Our premium calculators combine functionality with prestige, making
            them the perfect corporate gift solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Past Clients Component
const PastClients = () => {
  return (
    <section className="py-4 bg-slate-900">
      <img src="/Image/Banner/CORPORATE-LOGO1.jpg" />
    </section>
  );
};

// // Process Component
const Process = () => {
  const steps = [
    {
      id: 1,
      icon: <MessageSquare size={32} />,
      title: "Consultation",
      description:
        "Connect with our corporate gifting specialists to discuss your needs, budget, and branding requirements.",
    },
    {
      id: 2,
      icon: <PenTool size={32} />,
      title: "Customization",
      description:
        "Approve your calculator designs, packaging options, and personalization details before production.",
    },
    {
      id: 3,
      icon: <PackageOpen size={32} />,
      title: "Production",
      description:
        "We carefully craft each calculator and packaging according to your specifications with rigorous quality control.",
    },
    {
      id: 4,
      icon: <CheckCircle size={32} />,
      title: "Delivery",
      description:
        "Your premium corporate gifts are delivered on time, whether to your office or directly to individual recipients.",
    },
  ];

  return (
    <section id="process" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            How It Works
          </h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-lg">
            Our streamlined process makes corporate gifting easy and
            hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="relative">
              <div className="bg-white rounded-lg p-8 shadow-md h-full flex flex-col items-center text-center transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="bg-amber-50 text-amber-500 p-3 rounded-full mb-5">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600">{step.description}</p>
              </div>

              {step.id < steps.length && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-12 h-0.5 bg-amber-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// // FAQ Component
const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is the minimum order quantity?",
      answer:
        "Our minimum order quantity varies by product line: 10 units for the Compact Series, 20 units for the Professional Series, and 25 units for the Executive Series. For larger corporate orders, we offer volume discounts.",
    },
    {
      question: "How long does customization and production take?",
      answer:
        "Standard production time is 2-3 weeks after design approval. Rush orders can be accommodated depending on volume and customization requirements, sometimes in as little as 7-10 business days for an additional fee.",
    },
    {
      question: "Can I customize different calculators within the same order?",
      answer:
        "Yes, we offer mixed orders with different calculator models, though minimum quantity requirements may apply per model. Custom branding can be consistent across different models for a cohesive corporate identity.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship worldwide. International shipping times vary by destination. For large corporate orders, we can arrange expedited shipping and provide tracking information for each package.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept corporate purchase orders, credit cards, wire transfers, and ACH payments. For new corporate clients, we offer net-30 terms after credit approval.",
    },
   {
      question: "Who Built This Website?",
      answer: "This website was developed by Probir Pal. \n\nPhone: +91 7029638278 \nEmail: mr.probirpal@gmail.com"
 },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-lg">
            Find answers to common questions about our corporate gifting
            program.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 border border-slate-200 rounded-lg bg-white overflow-hidden"
            >
              <button
                className="w-full text-left p-4 flex items-center justify-between focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-slate-800">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="text-amber-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="text-slate-400 flex-shrink-0" />
                )}
              </button>

              <div
                className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96 pb-4" : "max-h-0"
                }`}
              >
                <p className="text-slate-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Form Component
const ContactForm = () => {
  const [formState, setFormState] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
    quantity: "",
    product: "Executive Series",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await emailjs.send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        {
          from_name: formState.name,
          company: formState.company,
          email: formState.email,
          phone: formState.phone,
          message: formState.message,
          quantity: formState.quantity,
          product: formState.product,
        },
        "YOUR_PUBLIC_KEY"
      );

      setIsSubmitted(true);
      toast.success("Quote request sent successfully!");
      setFormState({
        name: "",
        company: "",
        email: "",
        phone: "",
        message: "",
        quantity: "",
        product: "Executive Series",
      });
    } catch (error) {
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Request a Quote
              </h2>
              <p className="text-slate-600 mb-6">
                Ready to impress your clients and team with premium Amigo
                calculators? Fill out the form, and our corporate gifting
                specialists will create a custom quote for you.
              </p>

              <div className="bg-slate-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="text-slate-500 min-w-32">Email:</span>
                    <span className="text-slate-800">
                      enquiry@amigocalculator.info
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 min-w-32">Phone:</span>
                    <span className="text-slate-800">+91 70444 80444</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 min-w-32">Hours:</span>
                    <span className="text-slate-800">
                      Mon-Sat, 10 AM - 6 PM{" "}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  Rush Orders Available
                </h3>
                <p className="text-amber-700">
                  Need calculators for an upcoming event? Ask about our
                  expedited production and shipping options!
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-100">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md">
                    Your quote request has been received. One of our corporate
                    gifting specialists will contact you within 24 hours.
                  </p>
                  <button
                    className="text-amber-500 font-medium"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formState.company}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="product"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Interested In
                      </label>
                      <select
                        id="product"
                        name="product"
                        value={formState.product}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      >
                        <option value="Executive Series">
                          Executive Series
                        </option>
                        <option value="Professional Series">
                          Professional Series
                        </option>
                        <option value="Compact Series">Compact Series</option>
                        <option value="Multiple Products">
                          Multiple Products
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Estimated Quantity
                      </label>
                      <input
                        type="text"
                        id="quantity"
                        name="quantity"
                        value={formState.quantity}
                        onChange={handleChange}
                        placeholder="e.g., 25, 50, 100+"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Message / Requirements
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center ${
                      isSubmitting
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-slate-800 hover:bg-slate-900"
                    } text-white font-medium py-3 px-4 rounded-md transition-colors duration-300`}
                  >
                    <Send size={18} className="mr-2" />
                    {isSubmitting ? "Sending..." : "Submit Quote Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main App Component
function App() {
  return (
    <div className="min-h-screen bg-white">
      <Banner />
      <Hero />
      <Benefits />
      {/* <Customization /> */}
      <App2 />
      <PastClients />
      <Process />
      <ContactForm />
      <Faq />
    </div>
  );
}

export default App;

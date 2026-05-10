import { Exhibition, GalleryImage } from '../types';

export const pastExhibitions: Exhibition[] = [
  // 2025
  {
    id: 1,
    name: "Paperworld India 2025",
    location: "Mumbai, India",
    dates: "January 21-23, 2024",
    venue: "Dubai World Trade Centre",
    image: "/Image/Banner/IMG_6904.JPG",
    description: "Join us at Dubai's premier technology exhibition where we'll be showcasing our latest calculator innovations and smart calculation tools.",
    year: 2025,
    stats: {
      visitors: 5000,
      products: 34,
      deals: 45
    }
  },
  // 2024
  {
    id: 2,
    name: "Paperworld Dubai 2024",
    location: "Dubai, UAE",
    dates: "November 21-23, 2024",
    venue: "Dubai World Trade Centre",
    image: "/Image/Banner/Untitled2.png",
    description: "Join us at Dubai's premier technology exhibition where we'll be showcasing our latest calculator innovations and smart calculation tools.",
    year: 2024,
    stats: {
      visitors: 5000,
      products: 34,
      deals: 45
    }
  },
  {
    id: 3,
    name: "Paperworld India 2024",
    location: "Mumbai, India",
    dates: "March 5-10, 2025",
    venue: "Bombay Exhibition Centre",
    image: "/Image/Banner/Untitled3.png",
    description: "Experience our groundbreaking calculator products at Mumbai's largest technology innovation event of the year.",
    year: 2024,
    stats: {
      visitors: 7500,
      products: 15,
      deals: 60
    }
  },
  // 2023
  {
    id: 4,
    name: "Paperworld Dubai 2023",
    location: "Dubai, UAE",
    dates: "November 21-23, 2023",
    venue: "Dubai World Trade Centre",
    image: "/Image/Banner/Untitled4.png",
    description: "A specialized exhibition where we launched our new scientific calculator series to European markets.",
    year: 2023,
    stats: {
      visitors: 4800,
      products: 10,
      deals: 38
    }
  },
  {
    id: 5,
    name: "Scofex South Africa 2023",
    location: "Johannesburg, South Africa",
    dates: "May 25-27, 2023",
    venue: "Sandton Convention Centre, Johannesburg",
    image: "/Image/Banner/Untitled5.png",
    description: "Showcased our latest graphing calculators and educational tools at Europe's premier tech event.",
    year: 2023,
    stats: {
      visitors: 6200,
      products: 14,
      deals: 52
    }
  },
  {
    id: 6,
    name: "Paperworld India 2023",
    location: "Mumbai, India",
    dates: "February 23-25, 2023",
    venue: "Hall 1, Bombay Exhibition Center, Mumbai",
    image: "/Image/Banner/Untitled6.png",
    description: "Introduced our revolutionary AI-powered calculator series to the American market.",
    year: 2023,
    stats: {
      visitors: 8500,
      products: 18,
      deals: 75
    }
  },
  // 2022
  {
    id: 7,
    name: "Paperworld Dubai 2022",
    location: "Dubai, UAE",
    dates: "November 15-17, 2022",
    venue: "Dubai World Trade Centre (DWTC)",
    image: "/Image/Banner/Untitled7.png",
    description: "Demonstrated our advanced financial calculators at Asia's largest tech gathering.",
    year: 2022,
    stats: {
      visitors: 4200,
      products: 8,
      deals: 32
    }
  },
  // 2020
  {
    id: 8,
    name: "Paperworld Frankfurt Germany 2020",
    location: "Messe Frankfurt, Frankfurt, Germany",
    dates: "January 25-28, 2020",
    venue: "Ludwig-Erhard-Anlage 1,",
    image: "/Image/Banner/Untitled8.png",
    description: "Our first virtual-hybrid exhibition showcasing remote learning calculator solutions.",
    year: 2020,
    stats: {
      visitors: 3500,
      products: 6,
      deals: 28
    }
  }
];

export const galleryImages: GalleryImage[] = [
  {
    url: "/Image/Banner/IMG-17.jpg",
    alt: "Product demonstration at Singapore Technology Week",
    location: "Singapore",
    year: 2024
  },
  {
    url: "/Image/Banner/IMG-11.jpg",
    alt: "Calculator booth at Tokyo Tech Showcase",
    location: "Tokyo",
    year: 2024
  },
  {
    url: "/Image/Banner/IMG-12.jpg",
    alt: "Team presentation at Berlin Calculator Conference",
    location: "Berlin",
    year: 2023
  },
  {
    url: "/Image/Banner/IMG-14.jpg",
    alt: "Product display at Paris Innovation Expo",
    location: "Paris",
    year: 2023
  },
  {
    url: "/Image/Banner/IMG-16.jpg",
    alt: "Customer interactions at New York Tech Summit",
    location: "New York",
    year: 2022
  },
  {
    url: "/Image/Banner/IMG-15.jpg",
    alt: "Product launch at Seoul Digital Week",
    location: "Seoul",
    year: 2021
  }
];
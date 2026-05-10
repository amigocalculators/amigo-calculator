// import { tr } from 'framer-motion/client';
import { Product } from "../types";

export const products: Product[] = [
  {
    id: 1,
    name: "Mi-140D",
    price: 540.0,
    prevprice: 600,
    images: [
      "/Image/Product/140D-1.webp",
      "/Image/Product/140D-4.webp",
      "/Image/Product/140D-2.webp",
      "/Image/Product/140D-3.webp",
    ],
    image: "/Image/Product/140D-1.webp",
    description:
      "Amigo Mi-140D is a 14-digit calculator featuring 112-step check, tax calculation, and durable acrylic keys. Perfect for professionals and students who need reliable calculations.",
    category: "14 Digits",
    rating: "Large Calculator",
    reviews: 156,
    inStock: true,
    features: [
      "14-Digit Display",
      "112 Steps Check",
      "AA Battery",
      "Tax Calculation Functions",
      "Dual Power (Solar + Battery)",
    ],
    specifications: {
      "Display Type": "LCD",
      "Power Source": "Solar & Battery",
      Keys: "Plastic",
      Dimensions: "20.3cm x 15cm x 4.2cm",
      Weight: "251g",
    },
    warranty: "1 Year Manufacturer Warranty",
    highlights: [
      "Durable and premium quality keys",
      "112-step check, Double correct feature(Input & Output)",
      "Tax calculation made easy",
      "Dual power for long-lasting use",
    ],
  },
  {
    id: 2,
    name: "Mi-912ND",
    price: 518.0,
    prevprice: 575,
    images: [
      "/Image/Product/912ND-1.jpg",
      "/Image/Product/MI-912ND.JPLL.jpg",
      "/Image/Product/MI-912ND.JPLL1.jpg",
      "/Image/Product/MI-912ND.JPLL2.jpg",
    ],
    image: "/Image/Product/912ND-1.jpg",
    description:
      "Exmico Mi-912ND is a 14-digit calculator with advanced tax calculation features and a sleek design. Ideal for financial professionals.",
    category: "14 Digits",
    rating: "Large Calculator",
    reviews: 120,
    inStock: true,
    features: [
      "14-Digit Display",
      "Tax Calculation Functions",
      "Dual Power (Solar + Battery)",
      "AA Battery",
      "Auto Replay",
    ],
    specifications: {
      "Display Type": "LCD",
      "Power Source": "Solar & Battery",
      Keys: "Plastic",
      Dimensions: "21cm x 15.4cm x 3.5cm",
      Weight: "254g",
    },
    warranty: "1 Year Manufacturer Warranty",
    highlights: [
      "Advanced tax calculation",
      "Drop function for easy corrections",
      "Dual power source",
    ],
  },
  {
    id: 3,
    name: "Mi-140GC",
    price: 585.0,
    prevprice: 650,
    images: [
      "/Image/Product/140gc-1.jpg",
      "/Image/Product/140gc-3.jpg",
      "/Image/Product/140gc-2.jpg",
      "/Image/Product/140gc-4.jpg",
    ],
    image: "/Image/Product/140gc-1.jpg",
    description:
      "Amigo Mi-140D is a 14-digit calculator featuring 112-step check, tax calculation, and durable acrylic keys. Perfect for professionals and students who need reliable calculations.",
    category: "14 Digits",
    rating: "Large Calculator",
    reviews: 156,
    inStock: true,
    features: [
      "14-Digit Display",
      "112 Steps Check",
      "Acrylic Keys for Durability",
      "Tax Calculation Functions",
      "Dual Power (Solar + Battery)",
    ],
    specifications: {
      "Display Type": "LCD",
      "Power Source": "Solar & Battery",
      Keys: "Acrylic",
      Dimensions: "20.3cm x 15cm x 4.2cm",
      Weight: "270g",
    },
    warranty: "1 Year Manufacturer Warranty",
    highlights: [
      "Durable and premium quality keys",
      "112-step check & correct feature",
      "Tax calculation made easy",
      "Dual power for long-lasting use",
    ],
  },
  {
    id: 4,
    name: "Mi-912GC",
    price: 563.0,
    prevprice: 625,
    images: [
      "/Image/Product/912 GC.jpg",
      "/Image/Product/912gc-2.jpg",
      "/Image/Product/912gc-3.jpg",
      "/Image/Product/912gc-4.jpg",
    ],
    image: "/Image/Product/912 GC.jpg",
    description:
      "Amigo Mi-140D is a 14-digit calculator featuring 112-step check, tax calculation, and durable acrylic keys. Perfect for professionals and students who need reliable calculations.",
    category: "14 Digits",
    rating: "Large Calculator",
    reviews: 156,
    inStock: true,
    features: [
      "14-Digit Display",
      "112 Steps Check",
      "Acrylic Keys for Durability",
      "Tax Calculation Functions",
      "Dual Power (Solar + Battery)",
    ],
    specifications: {
      "Display Type": "LCD",
      "Power Source": "Solar & Battery",
      Keys: "Acrylic",
      Dimensions: "21cm x 15.4cm x 3.5cm",
      Weight: "256g",
    },
    warranty: "1 Year Manufacturer Warranty",
    highlights: [
      "Durable and premium quality keys",
      "112-step check & correct feature",
      "Tax calculation made easy",
      "Dual power for long-lasting use",
    ],
  },
  {
    id: 5,
    name: "fx-82MS(Black)",
    price: 527.0,
    prevprice: 587,
    images: [
      "/Image/Product/SC-bk.jpg",
      "/Image/Product/SC-bk.jpg",
      "/Image/Product/SC-bk.jpg",
      "/Image/Product/SC-bk.jpg",
    ],
    image: "/Image/Product/SC-bk.jpg",
    description:
      "Amigo fx-82MS Scientific Calculator, 2 Line Display, LCD Display with Solar Power (Black)",
    category: "Scientific Calculator",
    rating: "Scientific Calculator",
    reviews: 156,
    inStock: true,
    features: [
      "2-Line Dual Display (shows input & result)",
      "Solar Powered Operation",
      "Scientific Functions (Trigonometry, Logarithms, Exponentials, Statistics)",
      "Memory Features (Replay, Answer Recall, Variable Storage)",
      "Fraction, DMS Conversion & Engineering Notation",
      "Compact Pink & White Design with Slide Cover and Well-Spaced Keys",
    ],

    specifications: {
      "Display Type": "2-Line LCD",
      Functions:
        "Scientific (Trigonometry, Logarithms, Exponentials, Statistics)",
      Memory: "Replay, Answer Recall, Variable Storage",
      "Special Features": "Fraction, DMS Conversion, Engineering Notation",
      Dimensions: "15.2cm x 8.4cm x 1.5cm",
      Weight: "126g",
    },

    warranty: "1 Year Manufacturer Warranty",
    highlights: [
      "Dual-line display for input and result",
      "Advanced scientific function support",
      "Memory and replay features for efficiency",
      "Versatile calculations including fractions and DMS",
      "Lightweight and student-friendly design",
    ],
  },
  {
    id: 6,
    name: "fx-82MS(Pink)",
    price: 527.0,
    prevprice: 587,
    images: [
      "/Image/Product/SC-PINK.jpg",
      "/Image/Product/82ms-pi-1.jpg",
      "/Image/Product/SC-PINK.jpg",
      "/Image/Product/SC-PINK.jpg",
    ],
    image: "/Image/Product/SC-PINK.jpg",
    description:
      "Amigo fx-82MS Scientific Calculator, 2 Line Display, LCD Display with Solar Power (Pink)",
    category: "Scientific Calculator",
    rating: "Scientific Calculator",
    reviews: 156,
    inStock: true,
    features: [
      "2-Line Dual Display (shows input & result)",
      "Solar Powered Operation",
      "Scientific Functions (Trigonometry, Logarithms, Exponentials, Statistics)",
      "Memory Features (Replay, Answer Recall, Variable Storage)",
      "Fraction, DMS Conversion & Engineering Notation",
      "Compact Pink & White Design with Slide Cover and Well-Spaced Keys",
    ],

    specifications: {
      "Display Type": "2-Line LCD",
      Functions:
        "Scientific (Trigonometry, Logarithms, Exponentials, Statistics)",
      Memory: "Replay, Answer Recall, Variable Storage",
      "Special Features": "Fraction, DMS Conversion, Engineering Notation",
      Dimensions: "15.2cm x 8.4cm x 1.5cm",
      Weight: "126g",
    },

    warranty: "1 Year Manufacturer Warranty",
    highlights: [
      "Dual-line display for input and result",
      "Advanced scientific function support",
      "Memory and replay features for efficiency",
      "Versatile calculations including fractions and DMS",
      "Lightweight and student-friendly design",
    ],
  },

  {
    id: 7,
    name: "fx-82MS(Green)",
    price: 527.0,
    prevprice: 587,
    images: [
      "/Image/Product/SC-GREEN.jpg",
      "/Image/Product/82ms-gn-1.jpg",
      "/Image/Product/SC-GREEN.jpg",
      "/Image/Product/SC-GREEN.jpg",
    ],
    image: "/Image/Product/SC-GREEN.jpg",
    description:
      "Amigo fx-82MS Scientific Calculator, 2 Line Display, LCD Display with Solar Power (Green)",
    category: "Scientific Calculator",
    rating: "Scientific Calculator",
    reviews: 156,
    inStock: true,
    features: [
      "2-Line Dual Display (shows input & result)",
      "Solar Powered Operation",
      "Scientific Functions (Trigonometry, Logarithms, Exponentials, Statistics)",
      "Memory Features (Replay, Answer Recall, Variable Storage)",
      "Fraction, DMS Conversion & Engineering Notation",
      "Compact Pink & White Design with Slide Cover and Well-Spaced Keys",
    ],

    specifications: {
      "Display Type": "2-Line LCD",
      Functions:
        "Scientific (Trigonometry, Logarithms, Exponentials, Statistics)",
      Memory: "Replay, Answer Recall, Variable Storage",
      "Special Features": "Fraction, DMS Conversion, Engineering Notation",
      Dimensions: "15.2cm x 8.4cm x 1.5cm",
      Weight: "126g",
    },

    warranty: "1 Year Manufacturer Warranty",
    highlights: [
      "Dual-line display for input and result",
      "Advanced scientific function support",
      "Memory and replay features for efficiency",
      "Versatile calculations including fractions and DMS",
      "Lightweight and student-friendly design",
    ],
  },
  {
    id: 8,
    name: "fx-82MS(Cyan)",
    price: 527.0,
    prevprice: 587,
    images: [
      "/Image/Product/SC-CYAN.jpg",
      "/Image/Product/82ms-cy-1.jpg",
      "/Image/Product/SC-CYAN.jpg",
      "/Image/Product/SC-CYAN.jpg",
    ],
    image: "/Image/Product/SC-CYAN.jpg",
    description:
      "Amigo fx-82MS Scientific Calculator, 2 Line Display, LCD Display with Solar Power (Cyan)",
    category: "Scientific Calculator",
    rating: "Scientific Calculator",
    reviews: 156,
    inStock: true,
   features: [
      "2-Line Dual Display (shows input & result)",
      "Solar Powered Operation",
      "Scientific Functions (Trigonometry, Logarithms, Exponentials, Statistics)",
      "Memory Features (Replay, Answer Recall, Variable Storage)",
      "Fraction, DMS Conversion & Engineering Notation",
      "Compact Pink & White Design with Slide Cover and Well-Spaced Keys",
    ],

    specifications: {
      "Display Type": "2-Line LCD",
      Functions:
        "Scientific (Trigonometry, Logarithms, Exponentials, Statistics)",
      Memory: "Replay, Answer Recall, Variable Storage",
      "Special Features": "Fraction, DMS Conversion, Engineering Notation",
      Dimensions: "15.2cm x 8.4cm x 1.5cm",
      Weight: "126g",
    },

    warranty: "1 Year Manufacturer Warranty",
    highlights: [
      "Dual-line display for input and result",
      "Advanced scientific function support",
      "Memory and replay features for efficiency",
      "Versatile calculations including fractions and DMS",
      "Lightweight and student-friendly design",
    ],
  },
  {
    id: 9,
    name: "fx-82MS(Gray)",
    price: 527.0,
    prevprice: 587,
    images: [
      "/Image/Product/SC-GRAY.jpg",
      "/Image/Product/82ms-gr-1.jpg",
      "/Image/Product/SC-GRAY.jpg",
      "/Image/Product/SC-GRAY.jpg",
    ],
    image: "/Image/Product/SC-GRAY.jpg",
    description:
      "Amigo fx-82MS Scientific Calculator, 2 Line Display, LCD Display with Solar Power (Gray)",
    category: "Scientific Calculator",
    rating: "Scientific Calculator",
    reviews: 156,
    inStock: true,
    features: [
      "2-Line Dual Display (shows input & result)",
      "Solar Powered Operation",
      "Scientific Functions (Trigonometry, Logarithms, Exponentials, Statistics)",
      "Memory Features (Replay, Answer Recall, Variable Storage)",
      "Fraction, DMS Conversion & Engineering Notation",
      "Compact Pink & White Design with Slide Cover and Well-Spaced Keys",
    ],

    specifications: {
      "Display Type": "2-Line LCD",
      Functions:
        "Scientific (Trigonometry, Logarithms, Exponentials, Statistics)",
      Memory: "Replay, Answer Recall, Variable Storage",
      "Special Features": "Fraction, DMS Conversion, Engineering Notation",
      Dimensions: "15.2cm x 8.4cm x 1.5cm",
      Weight: "126g",
    },

    warranty: "1 Year Manufacturer Warranty",
    highlights: [
      "Dual-line display for input and result",
      "Advanced scientific function support",
      "Memory and replay features for efficiency",
      "Versatile calculations including fractions and DMS",
      "Lightweight and student-friendly design",
    ],
  },
  {
    id: 10,
    name: "Mi-141E",
    price: 522.0,
    prevprice: 580,
    images: [
      "/Image/Product/MI-141E-1.jpg",
      "/Image/Product/MI-141E-1.jpg",
      "/Image/Product/MI-141E-1.jpg",
      "/Image/Product/MI-141E-1.jpg",
    ],
    image: "/Image/Product/MI-141E-1.jpg",
    description:
      "Amigo MI-141E Desktop Calculator, 14-Digit Tilt Display, Tax & 150-Step Check, Dual Power, Tilt Display",
    category: "14 Digits",
    rating: "Large Calculator",
    reviews: 156,
    inStock: true,
  "features": [
    "14-digit extra-large LCD with tilt display for better visibility",
    "Dual power: solar and battery backup",
    "Advanced functions including TAX+/-, GT, %, √, MU, and memory operations",
    "150-step check, correct, and auto replay function",
    "Durable keys with dedicated triple-zero key for business calculations"
  ],
  "specifications": {
    "Display": "14-digit tilt LCD",
    "Power": "Solar and battery",
    "Functions": "TAX+, TAX-, GT, √, %, MU, M+, M-, MRC, Auto Replay, Check, Correct",
    "Design": "Matte black finish with ergonomic and angled layout",
    "Dimensions": "Approx. 18.5cm x 12.5cm",
    "Weight": "Medium weight, suitable for desktop use"
  },
  "warranty": "Contact the retailer or authorized service center with proof of purchase for warranty support.",
  "highlights": [
    "Business-class 14-digit display with tilt view",
    "TAX and GT keys for fast financial entries",
    "Memory and replay functions for accurate checking",
    // "Bold and durable key design with triple-zero",
    // "Ideal for offices and heavy-duty use"
  ],
  },
  {
    id: 11,
    name: "Mi-847(White)",
    price: 360.0,
    prevprice: 400,
    images: [
      "/Image/Product/MI-847JPL1.jpg",
      "/Image/Product/847-1.png",
      "/Image/Product/MI-847JPL1.jpg",
      "/Image/Product/MI-847JPL1.jpg",
    ],
    image: "/Image/Product/MI-847JPL1.jpg",
    description:
      "Amigo MI-847 Desktop Calculator, 12-Digit LCD Display, Solar and Battery Powered (White)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 156,
    inStock: true,
    "features": [
    "12-digit LCD for clear visibility",
    "Dual power (solar + battery)",
    "Basic math, percentage & memory functions",
    "Includes square root, GT, Auto Replay & Check/Correct",
    "Compact, ergonomic design with a professional finish"
  ],
  "specifications": {
    "Display Type": "LCD",
    "Power Source": "Solar & Battery",
    "Keys": "Ergonomic",
    "Dimensions": "18.5cm x 15cm x 3.5cm",
    "Weight": "250g"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Bright 12-digit display for easy reading",
    "Reliable dual power with solar and battery backup",
    "Supports basic math, percentage, and memory functions",
    // "Special keys including square root, GT, Auto Replay, and Check/Correct",
    // "Compact design with ergonomic keys and professional finish"
  ],
  },
  {
    id: 12,
    name: "Mi-847(Black)",
    price: 360.0,
    prevprice: 400,
    images: [
      "/Image/Product/MI-847BK.jpg",
      "/Image/Product/MI-847 BLACK.jpg",
      "/Image/Product/MI-847BK.jpg",
      "/Image/Product/MI-847BK.jpg",
    ],
    image: "/Image/Product/MI-847BK.jpg",
    description:
      "Amigo MI-847 Desktop Calculator, 12-Digit LCD Display, Solar and Battery Powered (Black)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 156,
    inStock: true,
    "features": [
    "12-digit LCD for clear visibility",
    "Dual power (solar + battery)",
    "Basic math, percentage & memory functions",
    "Includes square root, GT, Auto Replay & Check/Correct",
    "Compact, ergonomic design with a professional finish"
  ],
  "specifications": {
    "Display Type": "LCD",
    "Power Source": "Solar & Battery",
    "Keys": "Ergonomic",
    "Dimensions": "18.5cm x 15cm x 3.5cm",
    "Weight": "250g"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Bright 12-digit display for easy reading",
    "Reliable dual power with solar and battery backup",
    "Supports basic math, percentage, and memory functions",
    // "Special keys including square root, GT, Auto Replay, and Check/Correct",
    // "Compact design with ergonomic keys and professional finish"
  ],
  },
  {
    id: 13,
    name: "Mi-512GC(White)",
    price: 369.0,
    prevprice: 410,
    images: [
      "/Image/Product/MI-512GC WHITE.jpg",
      "/Image/Product/MI-512GC WHITE.jpg",
      "/Image/Product/MI-512GC WHITE.jpg",
      "/Image/Product/MI-512GC WHITE.jpg",
    ],
    image: "/Image/Product/MI-512GC WHITE.jpg",
    description:
      "Amigo MI-512GC Desktop Calculator, Acrylic Key, 12-Digit Display, Dual Power (White)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 156,
    inStock: true,
    "features": [
    "12-digit display for clear visibility",
    "Dual power: battery and solar power",
    "Acrylic keys for durability",
    "Includes square root, GT, Auto Replay & Check/Correct",
    "Compact, ergonomic design suitable for professionals"
  ],
  "specifications": {
    "Display Type": "LCD",
    "Power Source": "Battery & Solar Power",
    "Model Name": "MI-512GT",
    "Dimensions": "18.5cm x 15cm x 3.5cm",
    "Weight": "250g"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear 12-digit LCD display",
    "Reliable dual power with battery and solar",
    "Acrylic keys for durability",
    // "Specialized financial and basic calculation functions",
    // "Includes advanced keys like GT, Auto Replay, and Check/Correct",
    // "Ergonomic and compact professional design"
  ],
  },
  {
    id: 14,
    name: "Mi-512GC(Black)",
    price: 369.0,
    prevprice: 410,
    images: [
      "/Image/Product/MI-512GC BK.jpg",
      "/Image/Product/MI-512GC BK.jpg",
      "/Image/Product/MI-512GC BK.jpg",
      "/Image/Product/MI-512GC BK.jpg",
    ],
    image: "/Image/Product/MI-512GC BK.jpg",
    description:
      "Amigo MI-512GC Desktop Calculator, Acrylic Key, 12-Digit Display, Dual Power (Black)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 156,
    inStock: true,
    "features": [
    "12-digit display for clear visibility",
    "Dual power: battery and solar power",
    "Acrylic keys for durability",
    "Includes square root, GT, Auto Replay & Check/Correct",
    "Compact, ergonomic design suitable for professionals"
  ],
  "specifications": {
    "Display Type": "LCD",
    "Power Source": "Battery & Solar Power",
    "Model Name": "MI-512GT",
    "Dimensions": "18.5cm x 15cm x 3.5cm",
    "Weight": "250g"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear 12-digit LCD display",
    "Reliable dual power with battery and solar",
    "Acrylic keys for durability",
    // "Specialized financial and basic calculation functions",
    // "Includes advanced keys like GT, Auto Replay, and Check/Correct",
    // "Ergonomic and compact professional design"
  ],
  },
  {
    id: 15,
    name: "Mi-512GST(White)",
    price: 249.0,
    prevprice: 390,
    images: [
      "/Image/Product/MI-512GST (WHITE).jpg",
      "/Image/Product/MI-512GST (WHITE).jpg",
      "/Image/Product/MI-512GST (WHITE).jpg",
      "/Image/Product/MI-512GST (WHITE).jpg",
    ],
    image: "/Image/Product/MI-512GST (WHITE).jpg",
    description:
      "Amigo MI-512 GST Desktop Calculator, 12-Digit Display, Check & Correct Function, Large Bright Screen (White)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 156,
    inStock: true,
    "features": [
    "Bright 12-digit LCD with tax indicators",
    "120-step check and auto replay",
    "Dual power: solar and battery",
    "Tax and percentage calculation functions",
    "Ergonomic, tactile keys"
  ],
  "specifications": {
    "Display Type": "12-digit LCD with tax indicators",
    "Power Source": "Solar and battery backup",
    "Check Function": "120-step check with auto replay",
    "Business Functions": "Tax and percentage calculations",
    "Dimensions": "18.5cm x 15cm x 3.5cm",
    "Weight": "250g"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear 12-digit display with tax indicators",
    "120-step check and correction feature",
    "Reliable dual power for all lighting conditions",
    // "Essential tax and percentage functions",
    // "Comfortable ergonomic key layout"
  ],
  },
  {
    id: 16,
    name: "Mi-512GST(Black)",
    price: 249.0,
    prevprice: 390,
    images: [
      "/Image/Product/MI-512GST (BLACK).jpg",
      "/Image/Product/MI-512GST (BLACK).jpg",
      "/Image/Product/MI-512GST (BLACK).jpg",
      "/Image/Product/MI-512GST (BLACK).jpg",
    ],
    image: "/Image/Product/MI-512GST (BLACK).jpg",
    description:
      "Amigo MI-512 GST Desktop Calculator, 12-Digit Display, Check & Correct Function, Large Bright Screen (Black)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 156,
    inStock: true,
    "features": [
    "Bright 12-digit LCD with tax indicators",
    "120-step check and auto replay",
    "Dual power: solar and battery",
    "Tax and percentage calculation functions",
    "Ergonomic, tactile keys"
  ],
  "specifications": {
    "Display Type": "12-digit LCD with tax indicators",
    "Power Source": "Solar and battery backup",
    "Check Function": "120-step check with auto replay",
    "Business Functions": "Tax and percentage calculations",
    "Dimensions": "18.5cm x 15cm x 3.5cm",
    "Weight": "250g"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear 12-digit display with tax indicators",
    "120-step check and correction feature",
    "Reliable dual power for all lighting conditions",
    // "Essential tax and percentage functions",
    // "Comfortable ergonomic key layout"
  ],
  },
  {
    id: 17,
    name: "Mi-837N(Black)",
    price: 351.0,
    prevprice: 390,
    images: [
      "/Image/Product/837-BK.jpg",
      "/Image/Product/837-BK.jpg",
      "/Image/Product/837-BK.jpg",
      "/Image/Product/837-BK.jpg",
    ],
    image: "/Image/Product/837-BK.jpg",
    description:
      "Amigo MI-837 Desktop Calculator, 12-Digit LCD Display, Solar Powered (Black)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 156,
    inStock: true,
    "features": [
    "12-digit solar display",
    "Compact and durable design",
    "Basic math with percentage, memory, and square root",
    "Check, Correct, and Auto Replay keys",
    "Quick input with responsive keypad"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar-powered",
    "Material": "Grey plastic",
    "Functions": "Basic math, %, √, memory",
    "Special Keys": "Check, Correct, Replay",
    "Keypad": "Large keys with double-zero"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear solar-powered LCD display",
    "Durable and ergonomic design",
    "Includes percentage and square root functions",
    // "Error-free calculations with check and correct keys",
    // "Fast input with large responsive buttons"
  ],
  },
  {
    id: 18,
    name: "Mi-837N(Pink)",
    price: 351.0,
    prevprice: 390,
    images: [
      "/Image/Product/837-Pink.jpg",
      "/Image/Product/837-Pink.jpg",
      "/Image/Product/837-Pink.jpg",
      "/Image/Product/837-Pink.jpg",
    ],
    image: "/Image/Product/837-Pink.jpg",
    description:
      "Amigo MI-837 Desktop Calculator, 12-Digit LCD Display, Solar Powered (Pink)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 156,
    inStock: false,
    "features": [
    "12-digit solar display",
    "Compact and durable design",
    "Basic math with percentage, memory, and square root",
    "Check, Correct, and Auto Replay keys",
    "Quick input with responsive keypad"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar-powered",
    "Material": "Grey plastic",
    "Functions": "Basic math, %, √, memory",
    "Special Keys": "Check, Correct, Replay",
    "Keypad": "Large keys with double-zero"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear solar-powered LCD display",
    "Durable and ergonomic design",
    "Includes percentage and square root functions",
    // "Error-free calculations with check and correct keys",
    // "Fast input with large responsive buttons"
  ],
  },
  {
    id: 19,
    name: "Mi-837N(Green)",
    price: 351.0,
    prevprice: 390,
    images: [
      "/Image/Product/837-Green.jpg",
      "/Image/Product/837-Green.jpg",
      "/Image/Product/837-Green.jpg",
      "/Image/Product/837-Green.jpg",
    ],
    image: "/Image/Product/837-Green.jpg",
    description:
      "Amigo MI-837 Desktop Calculator, 12-Digit LCD Display, Solar Powered (Green)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 156,
    inStock: true,
    "features": [
    "12-digit solar display",
    "Compact and durable design",
    "Basic math with percentage, memory, and square root",
    "Check, Correct, and Auto Replay keys",
    "Quick input with responsive keypad"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar-powered",
    "Material": "Grey plastic",
    "Functions": "Basic math, %, √, memory",
    "Special Keys": "Check, Correct, Replay",
    "Keypad": "Large keys with double-zero"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear solar-powered LCD display",
    "Durable and ergonomic design",
    "Includes percentage and square root functions",
    // "Error-free calculations with check and correct keys",
    // "Fast input with large responsive buttons"
  ],
  },
  {
    id: 20,
    name: "Mi-888N(White)",
    price: 415.0,
    prevprice: 460,
    images: [
      "/Image/Product/MI-888N (WHITE).jpg",
      "/Image/Product/MI-888N (WHITE).jpg",
      "/Image/Product/MI-888N (WHITE).jpg",
      "/Image/Product/MI-888N (WHITE).jpg",
    ],
    image: "/Image/Product/MI-888N (WHITE).jpg",
    description:
      "Amigo MI-888N Desktop Calculator, 12 Digits Display, Dual Power, Large LCD Screen (White)",
    category: "12 Digits",
    rating: "Desktop Calculator",
    reviews: 90,
    inStock: true,
    "features": [
    "12-digit LCD with dual power (solar and battery)",
    "Basic math, memory, square root, and percentage functions",
    "Double-zero key, decimal point, and correction function",
    "Compact, ergonomic design with durable black finish",
    "Auto power-off, GT key, and check/correct functionality"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar and battery",
    "Functions": "Arithmetic, memory, square root, percentage",
    "Special Features": "Auto power-off, GT key, check/correct",
    "Design": "Compact black desktop with ergonomic layout"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear 12-digit display with solar and battery power",
    "Supports key math functions including percentage and √",
    "Includes GT key and error correction",
    // "Efficient input with double-zero and decimal point keys",
    // "Durable, professional black design with auto power-off"
  ],
  },
  {
    id: 22,
    name: "Mi-888N(Black)",
    price: 415.0,
    prevprice: 460,
    images: [
      "/Image/Product/MI-888N (BLACK).jpg",
      "/Image/Product/MI-888N (BLACK).jpg",
      "/Image/Product/MI-888N (BLACK).jpg",
      "/Image/Product/MI-888N (BLACK).jpg",
    ],
    image: "/Image/Product/MI-888N (BLACK).jpg",
    description:
      "Amigo MI-888N Desktop Calculator, 12 Digits Display, Dual Power, Large LCD Screen (Black)",
    category: "12 Digits",
    rating: "Desktop Calculator",
    reviews: 110,
    inStock: true,
    "features": [
    "12-digit LCD with dual power (solar and battery)",
    "Basic math, memory, square root, and percentage functions",
    "Double-zero key, decimal point, and correction function",
    "Compact, ergonomic design with durable black finish",
    "Auto power-off, GT key, and check/correct functionality"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar and battery",
    "Functions": "Arithmetic, memory, square root, percentage",
    "Special Features": "Auto power-off, GT key, check/correct",
    "Design": "Compact black desktop with ergonomic layout"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear 12-digit display with solar and battery power",
    "Supports key math functions including percentage and √",
    "Includes GT key and error correction",
    // "Efficient input with double-zero and decimal point keys",
    // "Durable, professional black design with auto power-off"
  ],
  },
  {
    id: 23,
    name: "Mi-888N(Green)",
    price: 415.0,
    prevprice: 460,
    images: [
      "/Image/Product/MI-888N (MINT GREEN).jpg",
      "/Image/Product/MI-888N (MINT GREEN).jpg",
      "/Image/Product/MI-888N (MINT GREEN).jpg",
      "/Image/Product/MI-888N (MINT GREEN).jpg",
    ],
    image: "/Image/Product/MI-888N (MINT GREEN).jpg",
    description:
      "Amigo MI-888N Desktop Calculator, 12 Digits Display, Dual Power, Large LCD Screen (Green)",
    category: "12 Digits",
    rating: "Desktop Calculator",
    reviews: 95,
    inStock: true,
    "features": [
    "12-digit LCD with dual power (solar and battery)",
    "Basic math, memory, square root, and percentage functions",
    "Double-zero key, decimal point, and correction function",
    "Compact, ergonomic design with durable black finish",
    "Auto power-off, GT key, and check/correct functionality"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar and battery",
    "Functions": "Arithmetic, memory, square root, percentage",
    "Special Features": "Auto power-off, GT key, check/correct",
    "Design": "Compact black desktop with ergonomic layout"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear 12-digit display with solar and battery power",
    "Supports key math functions including percentage and √",
    "Includes GT key and error correction",
    // "Efficient input with double-zero and decimal point keys",
    // "Durable, professional black design with auto power-off"
  ],
  },
  {
    id: 24,
    name: "Mi-888N(Pink)",
    price: 415.0,
    prevprice: 460,
    images: [
      "/Image/Product/MI-888N (PINK).jpg",
      "/Image/Product/MI-888N (PINK).jpg",
      "/Image/Product/MI-888N (PINK).jpg",
      "/Image/Product/MI-888N (PINK).jpg",
    ],
    image: "/Image/Product/MI-888N (PINK).jpg",
    description:
      "Amigo MI-888N Desktop Calculator, 12 Digits Display, Dual Power, Large LCD Screen (Pink)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 200,
    inStock: true,
    "features": [
    "12-digit LCD with dual power (solar and battery)",
    "Basic math, memory, square root, and percentage functions",
    "Double-zero key, decimal point, and correction function",
    "Compact, ergonomic design with durable black finish",
    "Auto power-off, GT key, and check/correct functionality"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar and battery",
    "Functions": "Arithmetic, memory, square root, percentage",
    "Special Features": "Auto power-off, GT key, check/correct",
    "Design": "Compact black desktop with ergonomic layout"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear 12-digit display with solar and battery power",
    "Supports key math functions including percentage and √",
    "Includes GT key and error correction",
    // "Efficient input with double-zero and decimal point keys",
    // "Durable, professional black design with auto power-off"
  ],
  },
  {
    id: 25,
    name: "Mi-121DLX",
    price: 360.0,
    prevprice: 400,
    images: [
      "/Image/Product/dlx normal pic.jpg",
      "/Image/Product/121 DLX 1M.jpg",
      "/Image/Product/121 DLX 1P.jpg",
      "/Image/Product/dlx normal pic.jpg",
    ],
    image: "/Image/Product/dlx normal pic.jpg",
    description:
      "Amigo MI-121DLX Desktop Calculator, 12-Digit Display, 150 Steps Check, White",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 200,
    inStock: true,
    "features": [
    "12-digit LCD with dual solar and battery power",
    "150-step check function for review and correction",
    "Dedicated TAX+/TAX- buttons with memory support",
    "Square root, percentage, GT, and memory operations",
    "Compact ergonomic design with large, durable keys"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Dual (solar and battery)",
    "Check Function": "150-step check and correction",
    "Tax Function": "TAX+/TAX- with memory",
    "Special Features": "√, %, GT, memory recall/clear",
    "Design": "Compact desktop with ergonomic layout and large keys"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Reliable dual-powered 12-digit display",
    "150-step check ensures accurate calculations",
    // "Quick tax functions with memory",
    "Supports √, %, GT, and memory operations",
    // "Ergonomic and durable with large comfortable keys"
  ],
  },
  {
    id: 26,
    name: "913VS(Gary)",
    price: 239.0,
    prevprice: 265,
    images: [
      "/Image/Product/MI-913VS GRAY.jpg",
      "/Image/Product/MI-913VS GRAY.jpg",
      "/Image/Product/MI-913VS GRAY.jpg",
      "/Image/Product/MI-913VS GRAY.jpg",
    ],
    image: "/Image/Product/MI-913VS GRAY.jpg",
    description:
      "Amigo MI-913VS Desktop Calculator, 12-Digit LCD Display, 150-Step Check & Auto Replay, Dual Power",
    category: "12 Digits",
    rating: "Desktop Calculator",
    reviews: 200,
    inStock: false,
    "features": [
    "12-digit LCD screen with clear digits and dual power",
    "Advanced functions including %, √, MU, memory operations",
    "Check, Correct, and Auto Replay function for accurate results",
    "Sleek white and grey finish with large AC key in pink",
    "Ideal for school, home, and professional use"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar and battery",
    "Functions": "%, √, MU, MRC, M+, M-, Auto Replay, Check, Correct, AC, CE",
    "Design": "White and grey body with pink accent key, ergonomic keypad",
    "Dimensions": "Approx. 15cm x 12.5cm",
    "Weight": "Lightweight, portable design"
  },
  "warranty": "Contact the retailer or authorized service center with proof of purchase for warranty support.",
  "highlights": [
    "Soft keypress and clear layout",
    "Durable construction with modern aesthetic",
    "Perfect for education and small businesses",
    // "Fast and accurate entry with correction options",
    // "Bright LCD for easy viewing"
  ],
  },
  // {
  //   "id": 27,
  //   "name": "Mi-786N",
  //   "price": 297.00,
  //   "prevprice":330,
  //   "images": [
  //       "/Image/Product/837-BK.jpg",
  //       "/Image/Product/837-BK.jpg",
  //       "/Image/Product/837-BK.jpg",
  //       "/Image/Product/837-BK.jpg",
  //     ],
  //   "image": "/Image/Product/837-BK.jpg",
  //   "description": "Cmico Fx-82MS is a scientific calculator with advanced functions like trigonometric, logarithmic, and statistical calculations. Ideal for students and engineers.",
  //   "category": "12 Digits",
  //   "rating": 'Desk Calculator',
  //   "reviews": 200,
  //   "inStock": true,
  //   "features": [
  //       "Scientific Functions",
  //       "Trigonometric Calculations",
  //       "Logarithmic Calculations",
  //       "Statistical Functions",
  //       "Dual Power (Solar + Battery)"
  //   ],
  //   "specifications": {
  //       "Display Type": "LCD",
  //       "Power Source": "Solar & Battery",
  //       "Keys": "Plastic",
  //       "Dimensions": "19cm x 15.5cm x 3.5cm",
  //       "Weight": "270g"
  //   },
  //   "warranty": "1 Year Manufacturer Warranty",
  //   "highlights": [
  //       "Advanced scientific functions",
  //       "Trigonometric and logarithmic calculations",
  //       "Dual power source"
  //   ]
  // },
  {
    id: 28,
    name: "Mi-120D(Black)",
    price: 378.0,
    prevprice: 420,
    images: [
      "/Image/Product/120D BLACK 2.jpg",
      "/Image/Product/120d-bk1.jpg",
      "/Image/Product/120d-bk2.jpg",
      "/Image/Product/120D BLACK 2.jpg",
    ],
    image: "/Image/Product/120D BLACK 2.jpg",
    description:
      "Amigo MI-120D Desktop Calculator, 12 Digits Display, 150 Steps Check & Recheck, Dual Power (Black)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 200,
    inStock: true,
    "features": [
    "12-digit LCD with clear visibility and dual power (solar + battery)",
    "Supports tax, square root, percentage, and memory calculations",
    "150-step check and recheck function for verification",
    "Ergonomic keypad with durable keys and pink ON/C buttons",
    "Compact 15.2 x 12.7 cm design with angled display for desktop use"
  ],
  "specifications": {
    "Display": "12-digit LCD with angled view",
    "Power": "Dual (solar + battery)",
    "Functions": "Tax, √, %, memory",
    "Check Function": "150-step check and recheck",
    "Keyboard": "Durable ergonomic keys with pink ON/C buttons",
    "Dimensions": "15.2cm x 12.7cm"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear and reliable 12-digit dual-powered display",
    "Advanced 150-step check/recheck for accurate results",
    "Versatile tax, percentage, and memory functions",
    // "User-friendly design with color-highlighted keys",
    // "Compact and comfortable for daily desktop use"
  ],
  },
  {
    id: 29,
    name: "Mi-120D(White)",
    price: 378.0,
    prevprice: 420,
    images: [
      "/Image/Product/120D WHITE 2.jpg",
      "/Image/Product/120d-wh1.jpg",
      "/Image/Product/120d-wh2.jpg",
      "/Image/Product/120D WHITE 2.jpg",
    ],
    image: "/Image/Product/120D WHITE 2.jpg",
    description:
      "Amigo MI-120D Desktop Calculator, 12 Digits Display, 150 Steps Check & Recheck, Dual Power (White)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 200,
    inStock: false,
    "features": [
    "12-digit LCD with clear visibility and dual power (solar + battery)",
    "Supports tax, square root, percentage, and memory calculations",
    "150-step check and recheck function for verification",
    "Ergonomic keypad with durable keys and pink ON/C buttons",
    "Compact 15.2 x 12.7 cm design with angled display for desktop use"
  ],
  "specifications": {
    "Display": "12-digit LCD with angled view",
    "Power": "Dual (solar + battery)",
    "Functions": "Tax, √, %, memory",
    "Check Function": "150-step check and recheck",
    "Keyboard": "Durable ergonomic keys with pink ON/C buttons",
    "Dimensions": "15.2cm x 12.7cm"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    "Clear and reliable 12-digit dual-powered display",
    "Advanced 150-step check/recheck for accurate results",
    "Versatile tax, percentage, and memory functions",
    // "User-friendly design with color-highlighted keys",
    // "Compact and comfortable for daily desktop use"
  ],
  },
  {
    id: 30,
    name: "Mi-513(Red)",
    price: 256.0,
    prevprice: 285,
    images: [
      "/Image/Product/BNR-1.jpg",
      "/Image/Product/BNR-1.jpg",
      "/Image/Product/BNR-1.jpg",
      "/Image/Product/BNR-1.jpg",
    ],
    image: "/Image/Product/BNR-1.jpg",
    description:
      "Amigo MI-513GT Desktop Calculator, 12-Digit Display, Solar Powered, (Red)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 200,
    inStock: true,
    "features": [
    "12-digit LCD display with auto power-off for battery efficiency",
    "Dual power: solar panel and battery backup",
    "Ergonomic desktop design in red and white with responsive keys",
    "Supports %, √, memory operations, and auto replay",
    "Check and correct function with double-zero key for faster entry"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar and battery backup",
    "Functions": "Percentage, square root, memory, auto replay",
    "Special Features": "Check and correct, auto power-off, double-zero key",
    "Design": "Compact, ergonomic red and white body"
  },
  "warranty": "Contact the authorized service center or retailer with proof of purchase for warranty assistance.",
  "highlights": [
    "Clear 12-digit dual-powered display",
    "Energy-saving auto power-off feature",
    "Comprehensive calculation support",
    // "Quick and error-free entry with check/correct and double-zero",
    // "Attractive and practical red-white design"
  ],
  },
  {
    id: 31,
    name: "Mi-513(Blue)",
    price: 256.0,
    prevprice: 285,
    images: [
      "/Image/Product/BNR-2.jpg",
      "/Image/Product/BNR-2.jpg",
      "/Image/Product/BNR-2.jpg",
      "/Image/Product/BNR-2.jpg",
    ],
    image: "/Image/Product/BNR-2.jpg",
    description:
      "Amigo MI-513GT Desktop Calculator, 12-Digit Display, Solar Powered, (Blue)",
    category: "12 Digits",
    rating: "Desk Calculator",
    reviews: 200,
    inStock: true,
    "features": [
    "12-digit LCD display with auto power-off for battery efficiency",
    "Dual power: solar panel and battery backup",
    "Ergonomic desktop design in red and white with responsive keys",
    "Supports %, √, memory operations, and auto replay",
    "Check and correct function with double-zero key for faster entry"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar and battery backup",
    "Functions": "Percentage, square root, memory, auto replay",
    "Special Features": "Check and correct, auto power-off, double-zero key",
    "Design": "Compact, ergonomic red and white body"
  },
  "warranty": "Contact the authorized service center or retailer with proof of purchase for warranty assistance.",
  "highlights": [
    "Clear 12-digit dual-powered display",
    "Energy-saving auto power-off feature",
    "Comprehensive calculation support",
    // "Quick and error-free entry with check/correct and double-zero",
    // "Attractive and practical red-white design"
  ],
  },
  {
    id: 32,
    name: "Mi-912VS",
    price: 207.0,
    prevprice: 230,
    images: [
      "/Image/Product/MI-912VS.jpg",
      "/Image/Product/MI-912VS.jpg",
      "/Image/Product/MI-912VS.jpg",
      "/Image/Product/MI-912VS.jpg",
    ],
    image: "/Image/Product/MI-912VS.jpg",
    description:
      "Amigo MI-912VS Desktop Calculator, 12-Digit Display, Check & Correct Function, Dual Power",
    category: "12 Digits",
    rating: "Mini Calculator",
    reviews: 200,
    inStock: false,
    "features": [
    "12-digit LCD with dual power support (solar and battery)",
    "Includes memory operations, %, √, and MU function",
    "Check, Correct, and Auto Replay feature for 150-step verification",
    "Large ergonomic keys for fast and accurate input",
    "Compact black body with professional layout"
  ],
  "specifications": {
    "Display": "12-digit LCD",
    "Power": "Solar and battery",
    "Functions": "%, √, MU, MRC, M+, M-, Auto Replay, Check, Correct",
    "Design": "Black body with grey and green keys, ergonomic design",
    "Dimensions": "Approx. 15.2cm x 12.7cm",
    "Weight": "Moderate, stable on desktops"
  },
  "warranty": "Contact the retailer or authorized service center with proof of purchase for warranty support.",
  "highlights": [
    "Fast verification with 150-step check & replay",
    "Compact design suitable for daily office work",
    "Includes all standard functions with easy access",
    // "Sturdy and stylish build",
    // "Efficient layout for frequent use"
  ],
  },
  {
    id: 33,
    name: "Mi-201N",
    price: 112.0,
    prevprice: 125,
    images: [
      "/Image/Product/MI-201N PINK.jpg",
      "/Image/Product/MI-201N PINK.jpg",
      "/Image/Product/MI-201N PINK.jpg",
      "/Image/Product/MI-201N PINK.jpg",
    ],
    image: "/Image/Product/MI-201N PINK.jpg",
    description:
      "Cmico Fx-82MS is a scientific calculator with advanced functions like trigonometric, logarithmic, and statistical calculations. Ideal for students and engineers.",
    category: "8 Digits",
    rating: "Pocket Calculator",
    reviews: 200,
    inStock: true,
    "features": [
    "8-digit LCD display with clear visibility",
    "Dual power: solar panel and battery backup",
    "Basic arithmetic functions including %, √, MRC, M+, M-",
    "Compact design with large, soft-press pink keys",
    "Dedicated ON/OFF, C/CE, and double-zero functionality"
  ],
  "specifications": {
    "Display": "8-digit LCD",
    "Power": "Solar and battery",
    "Functions": "%, √, MRC, M+, M-, C/CE, OFF",
    "Design": "Pink and white body with ergonomic keypad",
    "Dimensions": "Approx. 12cm x 8cm",
    "Weight": "Lightweight, easy to carry"
  },
  "warranty": "1 Year Manufacturer Warranty",
  "highlights": [
    // "Stylish pink and white design",
    // "Energy-efficient dual power system",
    "Easy-to-use large keys with soft press",
    "Essential functions for everyday math",
    "Portable and ideal for school or home use"
  ],
  },
];

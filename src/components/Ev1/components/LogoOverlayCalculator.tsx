import React, { useState, useRef, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import DraggableResizableLogo from "./DraggableResizableLogo";
import ControlPanel from "./ControlPanel";
import { LogoState } from "../types";
import { Upload, Move } from "lucide-react";

// 🔧 Responsive constraint generator
const getResponsiveConstraintArea = () => {
  const width = window.innerWidth;

  if (width <= 480) {
    // Mobile
    return { x: 125, y: 95, width: 52, height: 30 };
  } else if (width <= 768) {
    // Tablet
    return { x: 180, y: 130, width: 80, height: 45 };
  } else if (width <= 1280) {
    // Small laptop
    return { x: 295, y: 225, width: 110, height: 60 };
  } else {
    // Large screen
    return { x: 290, y: 220, width: 120, height: 70 };
  }
};

const LogoOverlayCalculator: React.FC = () => {
  const [showLogoImage, setShowLogoImage] = useState(false);
  const calculatorImage = showLogoImage
    ? "./Image/Product/MI-847 no.jpg"
    : "./Image/Product/MI-847 No Logo.jpg";
    // : "./Image/Product/MI-121DLX2.jpg";

  const [logo, setLogo] = useState<string | null>(null);
  const [constraintArea, setConstraintArea] = useState(getResponsiveConstraintArea());

  const [logoState, setLogoState] = useState<LogoState>({
    x: 50,
    y: 120,
    width: 100,
    height: 100,
    constraintArea: getResponsiveConstraintArea(),
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const compositeRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const calculateScale = () => {
      if (imageRef.current) {
        const displayWidth = imageRef.current.clientWidth;
        const naturalWidth = imageRef.current.naturalWidth;
        setScale(naturalWidth / displayWidth);
      }
    };

    const img = new Image();
    img.src = calculatorImage;
    img.onload = calculateScale;

    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [calculatorImage]);

  // 🔁 Update constraint on resize
  useEffect(() => {
    const handleResize = () => {
      const newArea = getResponsiveConstraintArea();
      setConstraintArea(newArea);
      setLogoState((prev) => ({
        ...prev,
        constraintArea: newArea,
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogoUpload = (imageDataUrl: string) => {
    setLogo(imageDataUrl);
    setLogoState((prev) => ({
      ...prev,
      x: constraintArea.x + constraintArea.width / 2 - 50,
      y: constraintArea.y + constraintArea.height / 2 - 50,
      width: 100,
      height: 100,
    }));
  };

  const updateLogoState = (newState: Partial<LogoState>) => {
    setLogoState((prev) => {
      const updated = { ...prev, ...newState };
      const { x, y, width, height } = updated;
      const { x: cx, y: cy, width: cw, height: ch } = constraintArea;

      const constrainedX = Math.max(cx, Math.min(cx + cw - width, x));
      const constrainedY = Math.max(cy, Math.min(cy + ch - height, y));

      return {
        ...updated,
        x: constrainedX,
        y: constrainedY,
      };
    });
  };

  const downloadComposite = async () => {
    if (!compositeRef.current || !logo || !imageRef.current) return;
    setIsLoading(true);

    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) throw new Error("Unable to create canvas context");

      const calcImg = new Image();
      calcImg.crossOrigin = "anonymous";
      calcImg.src = calculatorImage;

      await new Promise((resolve, reject) => {
        calcImg.onload = resolve;
        calcImg.onerror = reject;
      });

      canvas.width = calcImg.naturalWidth;
      canvas.height = calcImg.naturalHeight;

      context.drawImage(calcImg, 0, 0);

      const logoImg = new Image();
      logoImg.src = logo;

      await new Promise((resolve) => (logoImg.onload = resolve));

      const scaledX = logoState.x * scale;
      const scaledY = logoState.y * scale;
      const scaledWidth = logoState.width * scale;
      const scaledHeight = logoState.height * scale;

      context.drawImage(logoImg, scaledX, scaledY, scaledWidth, scaledHeight);

      const link = document.createElement("a");
      link.download = "calculator-with-logo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating composite image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetLogo = () => {
    if (!logo) return;
    setLogoState((prev) => ({
      ...prev,
      x: constraintArea.x + constraintArea.width / 2 - 50,
      y: constraintArea.y + constraintArea.height / 2 - 50,
      width: 100,
      height: 100,
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-2/3 p-6 flex flex-col items-center justify-center relative bg-gradient-to-br from-gray-50 to-white">
          {!logo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
              <div className="text-center p-8 rounded-xl bg-white/80 shadow-lg border border-gray-100">
                <Upload className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Creating</h3>
                <p className="text-gray-600">Upload your logo to begin customizing</p>
              </div>
            </div>
          )}

          <div className="relative" ref={compositeRef}>
            <img
              ref={imageRef}
              src={calculatorImage}
              alt="Calculator"
              className="max-w-full h-auto rounded-lg shadow-md"
              crossOrigin="anonymous"
            />

            <div
              className="absolute border-2 border-indigo-300 border-dashed rounded-md bg-indigo-100/20 pointer-events-none"
              style={{
                left: `${constraintArea.x}px`,
                top: `${constraintArea.y}px`,
                width: `${constraintArea.width}px`,
                height: `${constraintArea.height}px`,
              }}
            />

            {logo && (
              <DraggableResizableLogo
                logo={logo}
                position={{
                  x: logoState.x,
                  y: logoState.y,
                  width: logoState.width,
                  height: logoState.height,
                }}
                constraintArea={constraintArea}
                onPositionChange={updateLogoState}
              />
            )}
          </div>

          {logo && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Move className="w-4 h-4" />
              <span>Drag to position and resize using the corner handles</span>
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3 bg-gray-50 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
          <span className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">Product Colour</span>
          <button onClick={() => setShowLogoImage(!showLogoImage)} className="mb-4">
            <div className="toggle-wrapper">
              <input className="toggle-checkbox" type="checkbox" />
              <div className="toggle-container">
                <div className="toggle-button">
                  <div className="toggle-button-circles-container">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="toggle-button-circle"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </button>

          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">Design Controls</h2>

          <ImageUploader onImageUpload={handleLogoUpload} />

          {logo && (
            <ControlPanel
              logoState={logoState}
              onLogoStateChange={updateLogoState}
              onReset={resetLogo}
              onDownload={downloadComposite}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoOverlayCalculator;

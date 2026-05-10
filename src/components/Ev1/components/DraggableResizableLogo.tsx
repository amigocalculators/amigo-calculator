import React, { useState, useRef, useEffect } from 'react';
import { LogoPosition } from '../types';

interface DraggableResizableLogoProps {
  logo: string;
  position: LogoPosition;
  constraintArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onPositionChange: (newPosition: Partial<LogoPosition>) => void;
}

const DraggableResizableLogo: React.FC<DraggableResizableLogoProps> = ({
  logo,
  position,
  constraintArea,
  onPositionChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
  const logoRef = useRef<HTMLDivElement>(null);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === logoRef.current) {
      setIsDragging(true);
      setStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle mouse down on resize handles
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPosition({ x: e.clientX, y: e.clientY });
    setStartDimensions({ 
      width: position.width, 
      height: position.height 
    });
  };

  // Handle mouse move for both dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position while ensuring logo stays within constraints
        const newX = e.clientX - startPosition.x;
        const newY = e.clientY - startPosition.y;
        
        onPositionChange({
          x: newX,
          y: newY,
        });
      } else if (isResizing && resizeHandle) {
        e.preventDefault();
        
        // Calculate dimension changes
        const deltaX = e.clientX - startPosition.x;
        const deltaY = e.clientY - startPosition.y;
        
        // Calculate new dimensions based on which handle was grabbed
        let newWidth = startDimensions.width;
        let newHeight = startDimensions.height;
        let newX = position.x;
        let newY = position.y;
        
        const aspectRatio = startDimensions.width / startDimensions.height;
        
        switch (resizeHandle) {
          case 'se':
            newWidth = Math.max(30, startDimensions.width + deltaX);
            newHeight = Math.max(30, startDimensions.height + deltaY);
            break;
          case 'sw':
            newWidth = Math.max(30, startDimensions.width - deltaX);
            newHeight = Math.max(30, startDimensions.height + deltaY);
            newX = position.x + (startDimensions.width - newWidth);
            break;
          case 'ne':
            newWidth = Math.max(30, startDimensions.width + deltaX);
            newHeight = Math.max(30, startDimensions.height - deltaY);
            newY = position.y + (startDimensions.height - newHeight);
            break;
          case 'nw':
            newWidth = Math.max(30, startDimensions.width - deltaX);
            newHeight = Math.max(30, startDimensions.height - deltaY);
            newX = position.x + (startDimensions.width - newWidth);
            newY = position.y + (startDimensions.height - newHeight);
            break;
        }
        
        // Ensure the logo stays within the constraint area
        if (newX < constraintArea.x) {
          newWidth = startDimensions.width - (constraintArea.x - position.x);
          newX = constraintArea.x;
        }
        
        if (newY < constraintArea.y) {
          newHeight = startDimensions.height - (constraintArea.y - position.y);
          newY = constraintArea.y;
        }
        
        if (newX + newWidth > constraintArea.x + constraintArea.width) {
          newWidth = constraintArea.x + constraintArea.width - newX;
        }
        
        if (newY + newHeight > constraintArea.y + constraintArea.height) {
          newHeight = constraintArea.y + constraintArea.height - newY;
        }
        
        // Ensure minimum size
        newWidth = Math.max(30, newWidth);
        newHeight = Math.max(30, newHeight);
        
        onPositionChange({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, onPositionChange, position.x, position.y, resizeHandle, startDimensions, startPosition, constraintArea]);

  // Define cursor styles for resize handles
  const getCursorStyle = (handle: string) => {
    switch (handle) {
      case 'nw':
      case 'se':
        return 'nwse-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      default:
        return 'move';
    }
  };

  return (
    <div
      ref={logoRef}
      className="absolute cursor-move"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        transform: isResizing || isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isResizing || isDragging ? 'none' : 'transform 0.2s ease',
        zIndex: 10,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Logo Image */}
      <img
        src={logo}
        alt="User logo"
        className="w-full h-full object-contain pointer-events-none"
      />
      
      {/* Resize Handles */}
      {['nw', 'ne', 'sw', 'se'].map((handle) => (
        <div
          key={handle}
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full z-20"
          style={{
            cursor: getCursorStyle(handle),
            top: handle.includes('n') ? '-8px' : 'auto',
            bottom: handle.includes('s') ? '-8px' : 'auto',
            left: handle.includes('w') ? '-8px' : 'auto',
            right: handle.includes('e') ? '-8px' : 'auto',
          }}
          onMouseDown={(e) => handleResizeStart(e, handle)}
        />
      ))}
    </div>
  );
};

export default DraggableResizableLogo;
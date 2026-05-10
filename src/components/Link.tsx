import React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export const Link: React.FC<LinkProps> = ({ 
  href, 
  children, 
  className = '', 
  external = false 
}) => {
  const externalProps = external ? { 
    target: '_blank', 
    rel: 'noopener noreferrer' 
  } : {};
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!external) {
      e.preventDefault();
      // This is where you'd implement routing logic if you had a router
      console.log(`Navigating to: ${href}`);
      // For now, we'll just update the location manually
      if (href === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.hash = href;
      }
    }
  };

  return (
    <a 
      href={href} 
      className={className}
      onClick={handleClick}
      {...externalProps}
    >
      {children}
    </a>
  );
};
import React from 'react';

// Simple placeholder particle effect component.
// The original implementation attempted to import the 'ogl' library, which is not installed.
// This component renders a static background that can be replaced with a proper particle library later.

export const Particles: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 opacity-30" />
    );
};

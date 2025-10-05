import React from 'react';

const WorldGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <div
        className="absolute inset-0 bg-repeat"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '3rem 3rem',
        }}
      ></div>
      <div
        className="absolute inset-0 bg-repeat"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '15rem 15rem',
        }}
      ></div>
    </div>
  );
};

export default WorldGrid;

import React from 'react';

const MappingBadge = ({ confidence }) => {
  const getLevel = (score) => {
    if (score >= 0.8) return { label: 'High', color: 'bg-green-100 text-green-700 border-green-200' };
    if (score >= 0.5) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'Low', color: 'bg-red-100 text-red-700 border-red-200' };
  };

  const level = getLevel(confidence);

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${level.color}`}>
      {level.label} Confidence
    </span>
  );
};

export default MappingBadge;

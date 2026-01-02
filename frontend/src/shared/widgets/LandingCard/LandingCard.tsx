// LandingCard.tsx
import React from 'react';

type LandingCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
};

const LandingCard = ({ icon: Icon, title, text }: LandingCardProps) => {
  return (
    <div className="bg-white border-2 border-[#c8d69b] shadow-md p-5 rounded-[15px] w-full max-w-[420px] min-h-[220px]">
      <div className="flex flex-col gap-3 items-start">
        <div className="bg-blue-400 p-2.5 rounded-[10px]">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 text-[22px]">{title}</h3>
        <p className="text-gray-600 text-md overflow-ellipsis">{text}</p>
      </div>
    </div>
  );
};

export default LandingCard;
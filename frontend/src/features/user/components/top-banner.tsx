import React from 'react';

export const TopBanner = () => {
  return (
    // w-full giúp banner trải dài hết chiều ngang phần nội dung
    // h-[300px] hoặc md:h-[400px] giúp chỉnh chiều cao cho vừa vặn
    
    <div className="w-full h-[150px] md:h-[350px] lg:h-[450px] mb-8 rounded-2xl overflow-hidden shadow-md relative">
      <img
        src="/banner.jpg" 
        alt="Banner"
        className="w-full h-full object-cover"
      />     
    </div>
  );
};
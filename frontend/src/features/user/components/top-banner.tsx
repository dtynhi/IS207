import React from 'react';
import { useLocation } from 'react-router-dom';

export const TopBanner = () => {
  // Lấy cả 'pathname' (đường dẫn chính) và 'search' (phần đuôi có chứa ?facet=...)
  const { pathname, search } = useLocation();

  // ĐIỀU KIỆN ẨN BANNER: 
  // Nếu không phải trang chủ ('/') HOẶC có đang chọn danh mục (search !== '') thì ẩn luôn
  if (pathname !== '/' || search !== '') {
    return null; 
  }

  return (
    // Phần giao diện banner của bạn giữ nguyên
    <div className="w-full h-[150px] md:h-[350px] lg:h-[450px] mb-8 rounded-2xl overflow-hidden shadow-md relative">
      <img
        src="/banner.jpg" 
        alt="Banner"
        className="w-full h-full object-cover"
      />     
    </div>
  );
};
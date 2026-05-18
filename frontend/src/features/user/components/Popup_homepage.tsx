import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';

export const PromoPopup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tự động hiện popup sau 2 giây khi vào trang
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={null}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
      width={480}
      centered
      styles={{ 
        body: { padding: 0, borderRadius: '16px', overflow: 'hidden' },
        mask: { backdropFilter: 'blur(4px)' } 
      }}
      closeIcon={
        <div className="bg-black/20 text-white hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center">
          ✕
        </div>
      }
    >
      <div className="flex flex-col">
        {/* Lấy ảnh trực tiếp từ thư mục public */}
        <div className="w-full h-[280px] bg-gray-100 relative overflow-hidden">
          <img
            src="/popup.jpg" // Đảm bảo ảnh này nằm trong thư mục public của dự án
            alt="Chương trình khuyến mãi đặc biệt"
            className="w-full h-full object-cover"
          />
          {/* Nút đỏ Siêu Ưu Đãi */}
          <div className="absolute top-2 left-0 bg-[#e11d48] text-white px-3 py-1 rounded-full font-bold shadow-md text-sm">
            Siêu ưu đãi
          </div>
        </div>

        {/* Vùng chứa nội dung chữ */}
        <div className="p-8 text-center bg-white">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Chào cốt iu!</h2>
          <p className="text-gray-600 mb-6 text-[15px]">
            Nhập mã <strong className="text-[#3EBF9A] text-lg">5N123</strong> để được giảm ngay 20% cho đơn hàng đầu tiên của bạn.
          </p>

          <Button
            type="primary"
            size="large"
            onClick={handleOk}
            className="w-full !bg-[#3EBF9A] hover:!bg-[#2ca683] !border-none !h-[48px] !text-[22px] !rounded-full font-bold shadow-lg"
          >
            Mua sắm ngay
          </Button>
        </div>
      </div>
    </Modal>
  );
};
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCampaignByIdApi } from "../../products/api/product.api";
import { ProductCard } from "../../products/components/product-card";
import { Spin, Empty, Button, Tag, Space } from "antd";
import { ArrowLeftOutlined, FireOutlined } from "@ant-design/icons";

export const CampaignDetailPage = () => {
  const { id } = useParams();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign-detail", id],
    queryFn: () => getCampaignByIdApi(id as string),
    enabled: !!id,
  });

  if (isLoading) return <div className="h-screen flex justify-center items-center"><Spin size="large" tip="Đang tải sự kiện..." /></div>;

  if (!campaign) return <div className="p-20 text-center"><Empty description="Sự kiện không tồn tại hoặc đã kết thúc" /><Link to="/"><Button className="mt-4">Quay về trang chủ</Button></Link></div>;

  const isUpcoming = new Date(campaign.startTime).getTime() > Date.now();

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* 1. BANNER ĐẦU TRANG */}
      <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden bg-pink-50">
        <img 
          src={campaign.bannerUrl || "https://img.freepik.com/free-vector/flash-sale-banner-template-design_23-2148995325.jpg"} 
          className={`w-full h-full object-cover ${isUpcoming ? 'opacity-90' : ''}`}
          alt="Campaign Banner"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center text-white px-4 flex flex-col items-center">
                {isUpcoming && (
                  <Tag color="orange" className="text-xl py-2 px-6 font-bold border-none shadow-xl mb-6 tracking-wider rounded-full">
                    SẮP DIỄN RA: {new Date(campaign.startTime).toLocaleString('vi-VN')}
                  </Tag>
                )}
                <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 drop-shadow-lg">{campaign.name}</h1>
                <Space size="large">
                    <Tag color="red" className="text-lg py-1 px-4 font-bold border-none shadow-lg">GIẢM ĐỒNG LOẠT {campaign.discount}%</Tag>
                </Space>
            </div>
        </div>
        <Link to="/" className="absolute top-6 left-6 z-40">
            <Button icon={<ArrowLeftOutlined />} className="rounded-full shadow-lg border-none font-semibold">Quay lại</Button>
        </Link>
      </div>

      {/* 2. DANH SÁCH SẢN PHẨM */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-8 border-b-2 border-red-500 pb-2 w-fit">
            <FireOutlined className="text-2xl text-red-500" />
            <h2 className="text-2xl font-bold uppercase text-gray-800">Sản phẩm ưu đãi</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {campaign.products?.map((product: any) => (
            isUpcoming ? (
              <div key={product.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="absolute top-3 left-3 z-10">
                  <Tag color="blue" className="font-bold border-none shadow-sm">CHỜ GIÁ SỐC</Tag>
                </div>
                <img src={product.thumbnail ?? ""} alt={product.title} className="w-full aspect-square object-cover rounded-xl group-hover:opacity-90 transition-opacity" />
                
                <div className="mt-4 text-sm font-semibold text-gray-800 line-clamp-2">{product.title}</div>
                
                <div className="mt-auto pt-4">
                  <div className="text-red-500 font-black text-2xl tracking-widest">đ ?.?00</div>
                  <div className="text-gray-400 line-through text-xs mt-1">Giá gốc: {product.price.toLocaleString('vi-VN')}đ</div>
                  
                  <Link to={`/products/${product.slug}`}>
                    <Button type="primary" danger ghost className="w-full mt-4 font-bold h-10 rounded-lg">
                      Xem trước sản phẩm
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <ProductCard key={product.id} product={product} />
            )
          ))}
        </div>
      </div>
    </div>
  );
};
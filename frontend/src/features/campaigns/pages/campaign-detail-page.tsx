import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCampaignByIdApi } from "../../products/api/product.api";
import { ProductCard } from "../../products/components/product-card";
import { Spin, Empty, Button, Tag, Space } from "antd";
import { ArrowLeftOutlined, FireOutlined } from "@ant-design/icons";

export const CampaignDetailPage = () => {
  const { id } = useParams(); // Lấy ID từ link web

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign-detail", id],
    queryFn: () => getCampaignByIdApi(id as string),
    enabled: !!id,
  });

  if (isLoading) return <div className="h-screen flex justify-center items-center"><Spin size="large" tip="Đang tải sự kiện..." /></div>;

  if (!campaign) return <div className="p-20 text-center"><Empty description="Sự kiện không tồn tại hoặc đã kết thúc" /><Link to="/"><Button className="mt-4">Quay về trang chủ</Button></Link></div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 1. BANNER ĐẦU TRANG */}
      <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden">
        <img 
          src={campaign.bannerUrl || "https://img.freepik.com/free-vector/flash-sale-banner-template-design_23-2148995325.jpg"} 
          className="w-full h-full object-cover"
          alt="Campaign Banner"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center text-white px-4">
                <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 drop-shadow-lg">{campaign.name}</h1>
                <Space size="large">
                    <Tag color="red" className="text-lg py-1 px-4 font-bold border-none shadow-lg">GIẢM ĐỒNG LOẠT {campaign.discount}%</Tag>
                </Space>
            </div>
        </div>
        <Link to="/" className="absolute top-6 left-6">
            <Button icon={<ArrowLeftOutlined />} className="rounded-full shadow-lg border-none">Quay lại</Button>
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
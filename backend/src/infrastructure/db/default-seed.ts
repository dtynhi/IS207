import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma.client";
import { hashPassword } from "../../shared/security/password";

type SeedCategory = {
  title: string;
  description: string;
  position: number;
  thumbnail: string;
};

type SeedProduct = {
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  school: string;
  brand?: string;
  categorySlug: string;
  thumbnail: string;
  featured?: boolean;
};

type SeedUser = {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: Array<{ mainAddress: string; isDefault: boolean }>;
};

const normalizeSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const vietnameseCategories: SeedCategory[] = [
  {
    title: "Chăm sóc da mặt",
    description: "Mỹ phẩm và sản phẩm chăm sóc da mặt chuyên sâu, từ làm sạch đến dưỡng ẩm.",
    position: 1,
    thumbnail: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Trang điểm",
    description: "Các sản phẩm trang điểm mắt, mũi, môi và các công cụ trang điểm chuyên dụng.",
    position: 2,
    thumbnail: "https://images.unsplash.com/photo-1596137867828-eb7dac2f13c6?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Chăm sóc cơ thể",
    description: "Sản phẩm dưỡng thể, sữa tắm, lotion và chăm sóc cơ thể toàn diện.",
    position: 3,
    thumbnail: "https://images.unsplash.com/photo-1556228515-49e6dfb8dca5?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Chăm sóc sức khỏe",
    description: "Vitamin, thực phẩm bổ sung, sản phẩm hỗ trợ sức khỏe và sắc đẹp từ bên trong.",
    position: 4,
    thumbnail: "https://images.unsplash.com/photo-1470075620677-ba5291ce1330?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Chăm sóc cá nhân",
    description: "Vệ sinh cá nhân, khử mùi, nước hoa, dầu gội và các sản phẩm cá nhân hóa.",
    position: 5,
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Chăm sóc tóc",
    description: "Dầu gội, dầu xả, tinh dầu tóc, mặt nạ tóc và các sản phẩm chăm sóc tóc.",
    position: 6,
    thumbnail: "https://images.unsplash.com/photo-1596289519410-327fed0b91c9?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Mẹ và Bé",
    description: "Sản phẩm chăm sóc cho mẹ bầu, mẹ sau sinh và sản phẩm chăm sóc cho bé.",
    position: 7,
    thumbnail: "https://images.unsplash.com/photo-1599569810694-b5ac4dd64b39?auto=format&fit=crop&q=80&w=400&h=400",
  },
];

const vietnameseProducts: SeedProduct[] = [
  // Chăm sóc da mặt
  {
    title: "Sữa rửa mặt dịu nhẹ cho da nhạy cảm",
    description: "Loại sữa rửa mặt pH cân bằng, làm sạch sâu mà không gây khô căng.",
    price: 145000,
    discountPercentage: 10,
    stock: 45,
    school: "Đại học Y Dược TP.HCM",
    brand: "CeraVe",
    categorySlug: normalizeSlug("Chăm sóc da mặt"),
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Toner cấp ẩm cho da khô",
    description: "Toner giàu dưỡng chất, cấp ẩm và cân bằng độ pH da.",
    price: 185000,
    discountPercentage: 8,
    stock: 38,
    school: "Đại học Kinh tế TP.HCM",
    brand: "Hada Labo",
    categorySlug: normalizeSlug("Chăm sóc da mặt"),
    thumbnail: "https://images.unsplash.com/photo-1556228915-e3f4a1ff5f46?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Kem dưỡng ẩm ban ngày SPF30",
    description: "Kem dưỡng nhẹ, có chứa SPF bảo vệ da từ tia UV.",
    price: 220000,
    discountPercentage: 12,
    stock: 32,
    school: "Đại học Mỹ phẩm",
    brand: "Neutrogena",
    categorySlug: normalizeSlug("Chăm sóc da mặt"),
    thumbnail: "https://images.unsplash.com/photo-1570194065650-a23a2f3de9a5?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Serum Vitamin C trị thâm nám",
    description: "Serum cô đặc, giúp làm sáng da và mờ các vết thâm.",
    price: 280000,
    discountPercentage: 15,
    stock: 28,
    school: "Đại học Y Dược TP.HCM",
    brand: "La Roche Posay",
    categorySlug: normalizeSlug("Chăm sóc da mặt"),
    thumbnail: "https://images.unsplash.com/photo-1596238207259-f2ee98f6be8d?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Mặt nạ dưỡng da tinh chất mật ong",
    description: "Mặt nạ cấp ẩm sâu với tinh chất mật ong tự nhiên.",
    price: 95000,
    discountPercentage: 5,
    stock: 50,
    school: "Đại học Kinh tế - Luật",
    brand: "Tony Moly",
    categorySlug: normalizeSlug("Chăm sóc da mặt"),
    thumbnail: "https://images.unsplash.com/photo-1596238207259-f2ee98f6be8d?auto=format&fit=crop&q=80&w=500&h=500",
  },
  // Trang điểm
  {
    title: "Phấn nền kiềm dầu 24h",
    description: "Phấn nền chống trôi, kiềm dầu và mịn lâu trên 24 giờ.",
    price: 165000,
    discountPercentage: 10,
    stock: 42,
    school: "Đại học Mỹ phẩm",
    brand: "Maybelline",
    categorySlug: normalizeSlug("Trang điểm"),
    thumbnail: "https://images.unsplash.com/photo-1596238207259-f2ee98f6be8d?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Son kem lì không chì",
    description: "Son kem có màu sắc đẹp, lì lâu không gây khô.",
    price: 125000,
    discountPercentage: 8,
    stock: 55,
    school: "Đại học Mỹ phẩm",
    brand: "Revlon",
    categorySlug: normalizeSlug("Trang điểm"),
    thumbnail: "https://images.unsplash.com/photo-1596238207259-f2ee98f6be8d?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Kẻ mắt nước không lem",
    description: "Kẻ mắt nước siêu mảnh, dễ vẽ và không lem theo thời gian.",
    price: 85000,
    discountPercentage: 7,
    stock: 48,
    school: "Đại học Mỹ phẩm",
    brand: "Etude House",
    categorySlug: normalizeSlug("Trang điểm"),
    thumbnail: "https://images.unsplash.com/photo-1596238207259-f2ee98f6be8d?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bộ phấn mắt 9 màu chuyên trang điểm",
    description: "Bộ phấn mắt nhiều sắc thái, dễ phối kết hợp cho bất kỳ lúc nào.",
    price: 210000,
    discountPercentage: 12,
    stock: 35,
    school: "Đại học Mỹ phẩm",
    brand: "Morphe",
    categorySlug: normalizeSlug("Trang điểm"),
    thumbnail: "https://images.unsplash.com/photo-1596238207259-f2ee98f6be8d?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Mascara dài mi và dày mi",
    description: "Mascara tạo mi dài, dày và cong tự nhiên.",
    price: 155000,
    discountPercentage: 9,
    stock: 40,
    school: "Đại học Mỹ phẩm",
    brand: "Loreal",
    categorySlug: normalizeSlug("Trang điểm"),
    thumbnail: "https://images.unsplash.com/photo-1596238207259-f2ee98f6be8d?auto=format&fit=crop&q=80&w=500&h=500",
  },
  // Chăm sóc cơ thể
  {
    title: "Sữa tắm dưỡng ẩm hương hoa",
    description: "Sữa tắm mềm mịn, không gây khô da và có mùi hương dễ chịu.",
    price: 95000,
    discountPercentage: 6,
    stock: 60,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc cơ thể"),
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Lotion dưỡng thể trắng da",
    description: "Lotion dưỡng trắng da, giúp da mơn mại và sáng hơn.",
    price: 185000,
    discountPercentage: 11,
    stock: 45,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc cơ thể"),
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Tẩy tế bào chết cơ thể mềm nhẹ",
    description: "Tẩy tế bào chết an toàn, không gây kích ứng cho da nhạy cảm.",
    price: 135000,
    discountPercentage: 8,
    stock: 38,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc cơ thể"),
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Mặt nạ cơ thể dưỡng trắng da",
    description: "Mặt nạ cơ thể dưỡng ẩm sâu, giúp da trắng sáng và mềm mịn.",
    price: 165000,
    discountPercentage: 10,
    stock: 42,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc cơ thể"),
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=500&h=500",
  },
  // Chăm sóc sức khỏe
  {
    title: "Vitamin C 1000mg hỗ trợ miễn dịch",
    description: "Vitamin C bổ sung, tăng cường hệ miễn dịch và sắc đẹp.",
    price: 215000,
    discountPercentage: 12,
    stock: 50,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Chăm sóc sức khỏe"),
    thumbnail: "https://images.unsplash.com/photo-1470075620677-ba5291ce1330?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Collagen uống trắng da từ cá",
    description: "Collagen dạng nước, hỗ trợ tăng đàn hồi da từ bên trong.",
    price: 280000,
    discountPercentage: 15,
    stock: 35,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc sức khỏe"),
    thumbnail: "https://images.unsplash.com/photo-1470075620677-ba5291ce1330?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Viên uống biotin giúp tóc khỏe",
    description: "Biotin bổ sung giúp tóc, da và móng tay khỏe mạnh.",
    price: 165000,
    discountPercentage: 9,
    stock: 45,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Chăm sóc sức khỏe"),
    thumbnail: "https://images.unsplash.com/photo-1470075620677-ba5291ce1330?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bộ 3 hộp Yến sào nuôi dưỡng da",
    description: "Yến sào chứa collagen tự nhiên, hỗ trợ dưỡng da và cơ thể.",
    price: 385000,
    discountPercentage: 10,
    stock: 28,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Chăm sóc sức khỏe"),
    thumbnail: "https://images.unsplash.com/photo-1470075620677-ba5291ce1330?auto=format&fit=crop&q=80&w=500&h=500",
  },
  // Chăm sóc cá nhân
  {
    title: "Khử mùi toàn thân dạng lăn",
    description: "Khử mùi hiệu quả 48 giờ, không gây kích ứng da.",
    price: 105000,
    discountPercentage: 7,
    stock: 55,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc cá nhân"),
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Nước hoa nam Eau de Cologne hương tươi",
    description: "Nước hoa nhẹ nhàng, hương tây ngọc, phù hợp mỗi ngày.",
    price: 245000,
    discountPercentage: 10,
    stock: 30,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc cá nhân"),
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Bộ tắm trắng 5 sao chuyên dùng",
    description: "Bộ sản phẩm tắm chứa pearl, giúp da trắng sáng.",
    price: 325000,
    discountPercentage: 14,
    stock: 40,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc cá nhân"),
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Vệ sinh phụ nữ an toàn từ thiên nhiên",
    description: "Vệ sinh phụ nữ có thành phần tự nhiên, an toàn cho da nhạy.",
    price: 75000,
    discountPercentage: 5,
    stock: 65,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Chăm sóc cá nhân"),
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=500&h=500",
  },
  // Chăm sóc tóc
  {
    title: "Dầu gội chiết xuất từ yên mạch",
    description: "Dầu gội mềm tay, làm sạch tóc mà không gây khô.",
    price: 115000,
    discountPercentage: 8,
    stock: 50,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc tóc"),
    thumbnail: "https://images.unsplash.com/photo-1596289519410-327fed0b91c9?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Dầu xả dưỡng ẩm cho tóc khô",
    description: "Dầu xả giàu dưỡng chất, mềm mịn tóc từ gốc đến ngọn.",
    price: 125000,
    discountPercentage: 9,
    stock: 48,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc tóc"),
    thumbnail: "https://images.unsplash.com/photo-1596289519410-327fed0b91c9?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Mặt nạ tóc collagen 3 phút",
    description: "Mặt nạ tóc nuôi dưỡng sâu, phục hồi tóc hư tổn nhanh.",
    price: 145000,
    discountPercentage: 12,
    stock: 42,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc tóc"),
    thumbnail: "https://images.unsplash.com/photo-1596289519410-327fed0b91c9?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Tinh dầu argan chống xơ rối tóc",
    description: "Tinh dầu tự nhiên, mềm tóc, chống xơ rối hiệu quả.",
    price: 185000,
    discountPercentage: 11,
    stock: 38,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc tóc"),
    thumbnail: "https://images.unsplash.com/photo-1596289519410-327fed0b91c9?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Xả lạnh tóc hồng tươi",
    description: "Xả lạnh giúp tóc mốt rạng rở, tóc sáng bóng.",
    price: 95000,
    discountPercentage: 6,
    stock: 55,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Chăm sóc tóc"),
    thumbnail: "https://images.unsplash.com/photo-1596289519410-327fed0b91c9?auto=format&fit=crop&q=80&w=500&h=500",
  },
  // Mẹ và Bé
  {
    title: "Kem trị hăm tã cho bé",
    description: "Kem trị hăm an toàn cho bé, khỏe lành da nhạy.",
    price: 125000,
    discountPercentage: 7,
    stock: 50,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Mẹ và Bé"),
    thumbnail: "https://images.unsplash.com/photo-1599569810694-b5ac4dd64b39?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Sữa tắm an toàn cho bé từ sơ sinh",
    description: "Sữa tắm dịu nhẹ, không chứa hóa chất, phù hợp bé sơ sinh.",
    price: 145000,
    discountPercentage: 9,
    stock: 45,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Mẹ và Bé"),
    thumbnail: "https://images.unsplash.com/photo-1599569810694-b5ac4dd64b39?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Kem dưỡng chuẩn y tế cho mẹ bầu",
    description: "Kem dưỡng an toàn cho mẹ bầu, giảm rạn da.",
    price: 215000,
    discountPercentage: 12,
    stock: 35,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Mẹ và Bé"),
    thumbnail: "https://images.unsplash.com/photo-1599569810694-b5ac4dd64b39?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Dầu massage cho bé giúp ngủ ngon",
    description: "Dầu massage tự nhiên, giúp bé dễ ngủ và thoải mái.",
    price: 165000,
    discountPercentage: 10,
    stock: 40,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Mẹ và Bé"),
    thumbnail: "https://images.unsplash.com/photo-1599569810694-b5ac4dd64b39?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Tinh dầu xông phòng trí trẻ em",
    description: "Tinh dầu an toàn cho trẻ, xông phòng tạo không khí sạch.",
    price: 85000,
    discountPercentage: 6,
    stock: 60,
    school: "Đại học Mỹ phẩm",
    categorySlug: normalizeSlug("Mẹ và Bé"),
    thumbnail: "https://images.unsplash.com/photo-1599569810694-b5ac4dd64b39?auto=format&fit=crop&q=80&w=500&h=500",
  },
];

const demoUsers: SeedUser[] = [
  {
    fullName: "Nguyễn Văn An",
    email: "nguyenvanan@unimarket.vn",
    phone: "0903000111",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300",
    addresses: [
      { mainAddress: "Ký túc xá khu B, Đại học Quốc gia TP.HCM", isDefault: true },
      { mainAddress: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM", isDefault: false },
    ],
  },
  {
    fullName: "Trần Minh Châu",
    email: "tranminhchau@unimarket.vn",
    phone: "0911222333",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300",
    addresses: [{ mainAddress: "45 Đường Võ Văn Ngân, TP Thủ Đức, TP.HCM", isDefault: true }],
  },
  {
    fullName: "Lê Hoàng Nam",
    email: "lehoangnam@unimarket.vn",
    phone: "0933888999",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
    addresses: [{ mainAddress: "22 Đường Lê Văn Việt, TP Thủ Đức, TP.HCM", isDefault: true }],
  },
  {
    fullName: "Phạm Ngọc Hân",
    email: "phamngochan@unimarket.vn",
    phone: "0944555666",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300",
    addresses: [{ mainAddress: "18 Đường D2, Quận Bình Thạnh, TP.HCM", isDefault: true }],
  },
  {
    fullName: "Vũ Thành Đạt",
    email: "vuthanhdat@unimarket.vn",
    phone: "0966777888",
    avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=300&h=300",
    addresses: [{ mainAddress: "70 Đường Tô Ký, Quận 12, TP.HCM", isDefault: true }],
  },
];

const defaultPassword = "123456";
const defaultPermissions = {
  dashboard: ["read"],
  products: ["read", "create", "update", "delete"],
  categories: ["read", "create", "update", "delete"],
  roles: ["read", "create", "update"],
  accounts: ["read", "create", "update"],
  settings: ["read", "update"],
};

const seedRolesAndAccounts = async () => {
  const adminRole = await prisma.role.upsert({
    where: { id: "role-admin-he-thong" },
    update: {
      title: "Quản trị hệ thống",
      description: "Toàn quyền quản trị hệ thống Uni Market",
      permissions: defaultPermissions as Prisma.InputJsonValue,
      status: "active",
      deleted: false,
    },
    create: {
      id: "role-admin-he-thong",
      title: "Quản trị hệ thống",
      description: "Toàn quyền quản trị hệ thống Uni Market",
      permissions: defaultPermissions as Prisma.InputJsonValue,
      status: "active",
      deleted: false,
    },
  });

  const operatorRole = await prisma.role.upsert({
    where: { id: "role-van-hanh" },
    update: {
      title: "Nhân viên vận hành",
      description: "Quản lý sản phẩm, đơn hàng và danh mục",
      permissions: {
        dashboard: ["read"],
        products: ["read", "create", "update"],
        categories: ["read", "create", "update"],
        accounts: ["read"],
      } as Prisma.InputJsonValue,
      status: "active",
      deleted: false,
    },
    create: {
      id: "role-van-hanh",
      title: "Nhân viên vận hành",
      description: "Quản lý sản phẩm, đơn hàng và danh mục",
      permissions: {
        dashboard: ["read"],
        products: ["read", "create", "update"],
        categories: ["read", "create", "update"],
        accounts: ["read"],
      } as Prisma.InputJsonValue,
      status: "active",
      deleted: false,
    },
  });

  const accounts = [
    {
      fullName: "Quản trị viên Uni Market",
      email: "admin@unimarket.vn",
      phone: "0909000001",
      roleId: adminRole.id,
    },
    {
      fullName: "Nhân viên vận hành A",
      email: "vanhanh@unimarket.vn",
      phone: "0909000002",
      roleId: operatorRole.id,
    },
    {
      fullName: "Nhân viên hỗ trợ khách hàng",
      email: "hotro@unimarket.vn",
      phone: "0909000003",
      roleId: operatorRole.id,
    },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { email: account.email },
      update: {
        fullName: account.fullName,
        phone: account.phone,
        roleId: account.roleId,
        status: "active",
        deleted: false,
      },
      create: {
        fullName: account.fullName,
        email: account.email,
        password: hashPassword(defaultPassword),
        phone: account.phone,
        roleId: account.roleId,
        status: "active",
        deleted: false,
      },
    });
  }
};

const seedGeneralSettings = async () => {
  const current = await prisma.settingGeneral.findFirst({ orderBy: { createdAt: "asc" } });

  if (!current) {
    await prisma.settingGeneral.create({
      data: {
        websiteName: "Uni Market - Chợ đồ sinh viên",
        logo: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=240&h=240",
        phone: "02873001234",
        email: "hotro@unimarket.vn",
        address: "Khu đô thị Đại học Quốc gia TP.HCM, TP Thủ Đức, TP.HCM",
        copyright: "© 2026 Uni Market. Dữ liệu mẫu phục vụ học tập và phát triển dự án.",
      },
    });
    return;
  }

  await prisma.settingGeneral.update({
    where: { id: current.id },
    data: {
      websiteName: current.websiteName || "Uni Market - Chợ đồ sinh viên",
      phone: current.phone || "02873001234",
      email: current.email || "hotro@unimarket.vn",
      address: current.address || "Khu đô thị Đại học Quốc gia TP.HCM, TP Thủ Đức, TP.HCM",
      copyright:
        current.copyright || "© 2026 Uni Market. Dữ liệu mẫu phục vụ học tập và phát triển dự án.",
    },
  });
};

const seedCategories = async () => {
  const map = new Map<string, string>();

  for (const category of vietnameseCategories) {
    const slug = normalizeSlug(category.title);
    const saved = await prisma.productCategory.upsert({
      where: { slug },
      update: {
        title: category.title,
        description: category.description,
        position: category.position,
        thumbnail: category.thumbnail,
        status: "active",
        deleted: false,
      },
      create: {
        title: category.title,
        slug,
        description: category.description,
        position: category.position,
        thumbnail: category.thumbnail,
        status: "active",
        deleted: false,
      },
    });

    map.set(slug, saved.id);
  }

  return map;
};

const seedProducts = async (categoryMap: Map<string, string>) => {
  for (const product of vietnameseProducts) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) continue;

    const slug = normalizeSlug(product.title);
    await prisma.product.upsert({
      where: { slug },
      update: {
        title: product.title,
        description: product.description,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        school: product.school,
        brand: product.brand,
        thumbnail: product.thumbnail,
        productCategoryId: categoryId,
        featured: product.featured ?? false,
        status: "active",
        deleted: false,
      },
      create: {
        title: product.title,
        slug,
        description: product.description,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        school: product.school,
        brand: product.brand,
        thumbnail: product.thumbnail,
        images: [] as Prisma.InputJsonValue,
        productCategoryId: categoryId,
        featured: product.featured ?? false,
        status: "active",
        deleted: false,
      },
    });
  }
};

const seedUsers = async () => {
  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        address: user.addresses.map((addr, index) => ({
          idAddress: `${normalizeSlug(user.email)}-dia-chi-${index + 1}`,
          mainAddress: addr.mainAddress,
          isDefault: addr.isDefault,
        })) as Prisma.InputJsonValue,
        status: "active",
        deleted: false,
      },
      create: {
        fullName: user.fullName,
        email: user.email,
        password: hashPassword(defaultPassword),
        tokenUser: `token-${normalizeSlug(user.email)}`,
        phone: user.phone,
        avatar: user.avatar,
        address: user.addresses.map((addr, index) => ({
          idAddress: `${normalizeSlug(user.email)}-dia-chi-${index + 1}`,
          mainAddress: addr.mainAddress,
          isDefault: addr.isDefault,
        })) as Prisma.InputJsonValue,
        status: "active",
        deleted: false,
      },
    });
  }
};

const seedDemoCartsAndOrders = async () => {
  const existingOrders = await prisma.order.count();
  if (existingOrders > 0) return;

  const users = await prisma.user.findMany({ where: { deleted: false }, take: 3, orderBy: { createdAt: "asc" } });
  const products = await prisma.product.findMany({ where: { deleted: false, status: "active" }, take: 9, orderBy: { createdAt: "asc" } });

  if (users.length === 0 || products.length === 0) return;

  for (let i = 0; i < Math.min(users.length, 3); i += 1) {
    const user = users[i];
    const userProducts = products.slice(i * 3, i * 3 + 3);
    if (userProducts.length === 0) continue;

    for (const product of userProducts.slice(0, 2)) {
      await prisma.cart.upsert({
        where: { userId_productId: { userId: user.id, productId: product.id } },
        update: { quantity: 1 },
        create: { userId: user.id, productId: product.id, quantity: 1 },
      });
    }

    const statusCycle: OrderStatus[] = ["pending", "processing", "completed"];
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        fullName: user.fullName,
        phone: user.phone || "0900000000",
        address: `Địa chỉ giao hàng mẫu của ${user.fullName}`,
        status: statusCycle[i % statusCycle.length],
      },
    });

    for (const product of userProducts) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          price: product.price,
          discountPercentage: product.discountPercentage,
          quantity: 1,
        },
      });
    }
  }
};

const runDefaultSeedData = async () => {
  await seedRolesAndAccounts();
  await seedGeneralSettings();
  const categoryMap = await seedCategories();
  await seedProducts(categoryMap);
  await seedUsers();
  await seedDemoCartsAndOrders();
};

const hasExistingBusinessData = async () => {
  const [roles, accounts, users, categories, products, orders, carts] = await Promise.all([
    prisma.role.count(),
    prisma.account.count(),
    prisma.user.count(),
    prisma.productCategory.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.cart.count(),
  ]);

  return roles + accounts + users + categories + products + orders + carts > 0;
};

const clearAllSeedableData = async () => {
  await prisma.orderItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.forgotPassword.deleteMany();
  await prisma.user.deleteMany();
  await prisma.account.deleteMany();
  await prisma.role.deleteMany();
  await prisma.settingGeneral.deleteMany();
};

export const ensureDefaultSeedData = async () => {
  const hasData = await hasExistingBusinessData();
  if (hasData) {
    return { seeded: false, reason: "db_not_empty" as const };
  }

  await runDefaultSeedData();
  return { seeded: true as const };
};

export const overwriteDefaultSeedData = async () => {
  await clearAllSeedableData();
  await runDefaultSeedData();
  return { seeded: true as const, reason: "overwrite" as const };
};

export const getSeedSummary = () => {
  return {
    taiKhoanAdminMacDinh: [
      { email: "admin@unimarket.vn", matKhau: defaultPassword },
      { email: "vanhanh@unimarket.vn", matKhau: defaultPassword },
      { email: "hotro@unimarket.vn", matKhau: defaultPassword },
    ],
    taiKhoanNguoiDungMau: demoUsers.map((user) => ({ email: user.email, matKhau: defaultPassword })),
    tongDanhMuc: vietnameseCategories.length,
    tongSanPham: vietnameseProducts.length,
  };
};

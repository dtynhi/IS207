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
    title: "Điện thoại & Máy tính bảng",
    description: "Điện thoại cũ, máy tính bảng và phụ kiện phù hợp sinh viên.",
    position: 1,
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Laptop & Thiết bị công nghệ",
    description: "Laptop học tập, màn hình rời, bàn phím và thiết bị phục vụ học tập.",
    position: 2,
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Sách & Giáo trình",
    description: "Giáo trình các môn đại cương và chuyên ngành cho sinh viên.",
    position: 3,
    thumbnail: "https://images.unsplash.com/photo-1491841651911-c44c30c34548?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Đồ dùng ký túc xá",
    description: "Đồ dùng thiết yếu cho sinh viên ở trọ và ký túc xá.",
    position: 4,
    thumbnail: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Phương tiện sinh viên",
    description: "Xe đạp, xe máy cũ và phụ kiện đi lại hằng ngày.",
    position: 5,
    thumbnail: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Dụng cụ học tập",
    description: "Máy tính cầm tay, balo, dụng cụ ghi chú và vật dụng học tập.",
    position: 6,
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Thiết bị mạng & Văn phòng",
    description: "Router, webcam, tai nghe và thiết bị học online.",
    position: 7,
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Thời trang sinh viên",
    description: "Trang phục cơ bản, giày dép và phụ kiện thường ngày cho sinh viên.",
    position: 8,
    thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Đồ điện gia dụng nhỏ",
    description: "Nồi cơm, quạt, bàn ủi và các thiết bị gia dụng nhỏ gọn.",
    position: 9,
    thumbnail: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Đồ thể thao",
    description: "Dụng cụ tập luyện, giày chạy bộ và phụ kiện thể thao.",
    position: 10,
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Chăm sóc cá nhân",
    description: "Mỹ phẩm cơ bản, máy cạo râu, máy sấy tóc cho nhu cầu cá nhân.",
    position: 11,
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Thực phẩm tiện lợi",
    description: "Thực phẩm khô, đồ uống và đồ ăn nhanh phù hợp sinh viên.",
    position: 12,
    thumbnail: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=400&h=400",
  },
];

const vietnameseProducts: SeedProduct[] = [
  {
    title: "Điện thoại Samsung Galaxy A54 128GB cũ đẹp",
    description: "Máy còn hoạt động tốt, pin ổn định, phù hợp sinh viên cần máy học và liên lạc.",
    price: 5500000,
    discountPercentage: 8,
    stock: 6,
    school: "Đại học Công nghệ Thông tin",
    categorySlug: normalizeSlug("Điện thoại & Máy tính bảng"),
    thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Điện thoại iPhone 11 64GB đã thay pin mới",
    description: "Máy hình thức khá, pin mới thay, dùng ổn định cho nhu cầu học tập và giải trí.",
    price: 6900000,
    discountPercentage: 5,
    stock: 4,
    school: "Đại học Bách Khoa TP.HCM",
    categorySlug: normalizeSlug("Điện thoại & Máy tính bảng"),
    thumbnail: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Máy tính bảng Lenovo Tab M10 phục vụ học online",
    description: "Màn hình lớn, xem tài liệu và họp trực tuyến thuận tiện.",
    price: 3200000,
    discountPercentage: 12,
    stock: 5,
    school: "Đại học Khoa học Tự nhiên",
    categorySlug: normalizeSlug("Điện thoại & Máy tính bảng"),
    thumbnail: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Laptop Dell Latitude 5420 i5 RAM 16GB SSD 512GB",
    description: "Máy bền, pin ổn, phù hợp lập trình và làm báo cáo đồ án.",
    price: 10900000,
    discountPercentage: 6,
    stock: 7,
    school: "Đại học Công nghệ Thông tin",
    categorySlug: normalizeSlug("Laptop & Thiết bị công nghệ"),
    thumbnail: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=500&h=500",
    featured: true,
  },
  {
    title: "Laptop HP ProBook 440 G8 phục vụ văn phòng",
    description: "Nhẹ, gọn, học online và làm việc nhóm ổn định.",
    price: 9300000,
    discountPercentage: 10,
    stock: 6,
    school: "Đại học Kinh tế TP.HCM",
    categorySlug: normalizeSlug("Laptop & Thiết bị công nghệ"),
    thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Màn hình LG 24 inch IPS dành cho học tập",
    description: "Màn hình sắc nét, phù hợp xử lý tài liệu và viết code.",
    price: 2200000,
    discountPercentage: 7,
    stock: 8,
    school: "Đại học Sư phạm Kỹ thuật",
    categorySlug: normalizeSlug("Laptop & Thiết bị công nghệ"),
    thumbnail: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Giáo trình Cấu trúc dữ liệu và giải thuật",
    description: "Bản in rõ chữ, phù hợp sinh viên năm nhất và năm hai khối công nghệ.",
    price: 65000,
    discountPercentage: 0,
    stock: 30,
    school: "Đại học Công nghệ Thông tin",
    categorySlug: normalizeSlug("Sách & Giáo trình"),
    thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Giáo trình Kinh tế vi mô căn bản",
    description: "Sách còn mới, có highlight nhẹ ở một số chương trọng tâm.",
    price: 48000,
    discountPercentage: 5,
    stock: 24,
    school: "Đại học Kinh tế TP.HCM",
    categorySlug: normalizeSlug("Sách & Giáo trình"),
    thumbnail: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bộ sách TOEIC nền tảng cho sinh viên năm nhất",
    description: "Bộ sách gồm lý thuyết và bài tập, phù hợp luyện thi đầu ra.",
    price: 120000,
    discountPercentage: 15,
    stock: 18,
    school: "Đại học Ngoại thương",
    categorySlug: normalizeSlug("Sách & Giáo trình"),
    thumbnail: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Quạt đứng Senko công suất tiết kiệm điện",
    description: "Quạt chạy êm, phù hợp phòng trọ 2-3 người.",
    price: 290000,
    discountPercentage: 0,
    stock: 20,
    school: "Đại học Sài Gòn",
    categorySlug: normalizeSlug("Đồ dùng ký túc xá"),
    thumbnail: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Nồi cơm điện mini 1.2 lít cho sinh viên",
    description: "Nấu nhanh, gọn, dễ vệ sinh, phù hợp ký túc xá.",
    price: 350000,
    discountPercentage: 8,
    stock: 16,
    school: "Đại học Công nghiệp TP.HCM",
    categorySlug: normalizeSlug("Đồ dùng ký túc xá"),
    thumbnail: "https://images.unsplash.com/photo-1584269600519-112d071b6fae?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Kệ để đồ 4 tầng lắp ráp cho phòng trọ",
    description: "Khung chắc, dễ lắp ráp, tiết kiệm diện tích.",
    price: 180000,
    discountPercentage: 10,
    stock: 22,
    school: "Đại học Tôn Đức Thắng",
    categorySlug: normalizeSlug("Đồ dùng ký túc xá"),
    thumbnail: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Xe đạp thể thao 26 inch đi học hằng ngày",
    description: "Khung nhẹ, phanh tốt, phù hợp quãng đường ngắn đến trường.",
    price: 1800000,
    discountPercentage: 5,
    stock: 9,
    school: "Đại học Quốc tế",
    categorySlug: normalizeSlug("Phương tiện sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Xe máy số cũ tiết kiệm xăng cho sinh viên",
    description: "Máy vận hành ổn định, giấy tờ đầy đủ.",
    price: 14500000,
    discountPercentage: 4,
    stock: 3,
    school: "Đại học Giao thông Vận tải",
    categorySlug: normalizeSlug("Phương tiện sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Nón bảo hiểm nửa đầu đạt chuẩn",
    description: "Thiết kế gọn nhẹ, đeo thoải mái khi đi học.",
    price: 220000,
    discountPercentage: 12,
    stock: 25,
    school: "Đại học Mở TP.HCM",
    categorySlug: normalizeSlug("Phương tiện sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Máy tính Casio FX-580VN X dùng cho môn đại cương",
    description: "Máy chính hãng, bấm ổn định, pin mới.",
    price: 420000,
    discountPercentage: 9,
    stock: 28,
    school: "Đại học Khoa học Tự nhiên",
    categorySlug: normalizeSlug("Dụng cụ học tập"),
    thumbnail: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Balo chống nước 20 lít cho sinh viên",
    description: "Ngăn rộng, đựng được laptop 15 inch và tài liệu.",
    price: 280000,
    discountPercentage: 14,
    stock: 19,
    school: "Đại học Sư phạm",
    categorySlug: normalizeSlug("Dụng cụ học tập"),
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bộ bút note và sổ tay học nhóm",
    description: "Bộ sản phẩm tiện dụng cho việc ghi chú môn học.",
    price: 75000,
    discountPercentage: 0,
    stock: 40,
    school: "Đại học Văn Lang",
    categorySlug: normalizeSlug("Dụng cụ học tập"),
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Router WiFi băng tần kép cho phòng trọ",
    description: "Phủ sóng ổn định cho 5-8 thiết bị cùng lúc.",
    price: 680000,
    discountPercentage: 10,
    stock: 14,
    school: "Đại học Công nghệ Thông tin",
    categorySlug: normalizeSlug("Thiết bị mạng & Văn phòng"),
    thumbnail: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Webcam full HD phục vụ học trực tuyến",
    description: "Hình ảnh rõ nét, tích hợp micro phù hợp lớp học online.",
    price: 520000,
    discountPercentage: 7,
    stock: 12,
    school: "Đại học Mở TP.HCM",
    categorySlug: normalizeSlug("Thiết bị mạng & Văn phòng"),
    thumbnail: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Tai nghe có mic chống ồn cho lớp online",
    description: "Âm thanh rõ, đeo lâu không đau tai.",
    price: 390000,
    discountPercentage: 11,
    stock: 20,
    school: "Đại học Hoa Sen",
    categorySlug: normalizeSlug("Thiết bị mạng & Văn phòng"),
    thumbnail: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Áo khoác chống nắng mỏng nhẹ cho sinh viên",
    description: "Chất liệu thoáng, phù hợp đi học hằng ngày.",
    price: 190000,
    discountPercentage: 6,
    stock: 35,
    school: "Đại học Tài chính - Marketing",
    categorySlug: normalizeSlug("Thời trang sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Giày sneaker trắng đơn giản đi học",
    description: "Thiết kế cơ bản, dễ phối đồ, đế êm.",
    price: 420000,
    discountPercentage: 12,
    stock: 27,
    school: "Đại học Kinh tế TP.HCM",
    categorySlug: normalizeSlug("Thời trang sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Áo sơ mi trắng thực tập cho sinh viên",
    description: "Form dễ mặc, phù hợp thuyết trình và thực tập.",
    price: 170000,
    discountPercentage: 9,
    stock: 31,
    school: "Đại học Ngoại thương",
    categorySlug: normalizeSlug("Thời trang sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bàn ủi hơi nước cầm tay mini",
    description: "Nhỏ gọn, tiện mang theo khi ở trọ hoặc ký túc xá.",
    price: 260000,
    discountPercentage: 10,
    stock: 18,
    school: "Đại học Sài Gòn",
    categorySlug: normalizeSlug("Đồ điện gia dụng nhỏ"),
    thumbnail: "https://images.unsplash.com/photo-1616627456509-4c6b7f5788f8?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Ấm đun siêu tốc 1.5 lít tiết kiệm điện",
    description: "Sử dụng an toàn, nấu nước nhanh cho sinh hoạt hằng ngày.",
    price: 240000,
    discountPercentage: 8,
    stock: 23,
    school: "Đại học Công nghiệp TP.HCM",
    categorySlug: normalizeSlug("Đồ điện gia dụng nhỏ"),
    thumbnail: "https://images.unsplash.com/photo-1578659255564-89a3aef17f53?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Đèn bàn LED chống cận ánh sáng trung tính",
    description: "Phù hợp học ban đêm, tiết kiệm điện.",
    price: 210000,
    discountPercentage: 14,
    stock: 26,
    school: "Đại học Quốc gia TP.HCM",
    categorySlug: normalizeSlug("Đồ điện gia dụng nhỏ"),
    thumbnail: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Thảm tập yoga dày 8mm chống trượt",
    description: "Thảm êm, phù hợp tập luyện tại phòng trọ.",
    price: 210000,
    discountPercentage: 7,
    stock: 21,
    school: "Đại học Thể dục Thể thao",
    categorySlug: normalizeSlug("Đồ thể thao"),
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Giày chạy bộ cơ bản cho người mới",
    description: "Đệm êm, thoáng khí, phù hợp chạy bộ hằng ngày.",
    price: 490000,
    discountPercentage: 10,
    stock: 17,
    school: "Đại học Văn hóa",
    categorySlug: normalizeSlug("Đồ thể thao"),
    thumbnail: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bình nước thể thao 1 lít giữ nhiệt",
    description: "Bình chắc chắn, phù hợp mang theo khi đi học và tập luyện.",
    price: 140000,
    discountPercentage: 5,
    stock: 33,
    school: "Đại học Công nghệ TP.HCM",
    categorySlug: normalizeSlug("Đồ thể thao"),
    thumbnail: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Máy sấy tóc ion công suất vừa",
    description: "Sấy nhanh, tiếng ồn thấp, phù hợp phòng trọ.",
    price: 280000,
    discountPercentage: 9,
    stock: 18,
    school: "Đại học Mở TP.HCM",
    categorySlug: normalizeSlug("Chăm sóc cá nhân"),
    thumbnail: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Sữa rửa mặt dịu nhẹ cho da nhạy cảm",
    description: "Làm sạch tốt, không gây khô da, phù hợp sinh viên.",
    price: 115000,
    discountPercentage: 6,
    stock: 42,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Chăm sóc cá nhân"),
    thumbnail: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bộ dao cạo và chăm sóc râu cơ bản",
    description: "Tiện dùng hằng ngày, phù hợp sinh viên nam ở trọ.",
    price: 170000,
    discountPercentage: 12,
    stock: 25,
    school: "Đại học Luật TP.HCM",
    categorySlug: normalizeSlug("Chăm sóc cá nhân"),
    thumbnail: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Mì ly thùng 24 ly cho sinh viên",
    description: "Giải pháp nhanh cho các buổi học khuya và deadline.",
    price: 168000,
    discountPercentage: 4,
    stock: 60,
    school: "Đại học Kinh tế - Luật",
    categorySlug: normalizeSlug("Thực phẩm tiện lợi"),
    thumbnail: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Cà phê hòa tan túi lớn tiết kiệm",
    description: "Dùng cho học khuya, tiện pha nhanh tại ký túc xá.",
    price: 125000,
    discountPercentage: 7,
    stock: 52,
    school: "Đại học Công nghệ Thông tin",
    categorySlug: normalizeSlug("Thực phẩm tiện lợi"),
    thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Yến mạch ăn liền cho bữa sáng nhanh",
    description: "Giải pháp bữa sáng lành mạnh cho sinh viên bận rộn.",
    price: 98000,
    discountPercentage: 10,
    stock: 38,
    school: "Đại học Nông Lâm TP.HCM",
    categorySlug: normalizeSlug("Thực phẩm tiện lợi"),
    thumbnail: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Tai nghe Bluetooth pin trâu cho sinh viên",
    description: "Kết nối ổn định, phù hợp nghe học liệu và gọi nhóm.",
    price: 560000,
    discountPercentage: 9,
    stock: 15,
    school: "Đại học FPT TP.HCM",
    categorySlug: normalizeSlug("Điện thoại & Máy tính bảng"),
    thumbnail: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Pin sạc dự phòng 20000mAh chuẩn nhanh",
    description: "Dung lượng cao, tiện mang theo cả ngày ở trường.",
    price: 430000,
    discountPercentage: 8,
    stock: 22,
    school: "Đại học Công nghệ TP.HCM",
    categorySlug: normalizeSlug("Điện thoại & Máy tính bảng"),
    thumbnail: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "MacBook Air M1 8GB 256GB đã qua sử dụng",
    description: "Hiệu năng tốt cho học tập, pin còn tốt, máy đẹp.",
    price: 16500000,
    discountPercentage: 4,
    stock: 4,
    school: "Đại học Bách Khoa TP.HCM",
    categorySlug: normalizeSlug("Laptop & Thiết bị công nghệ"),
    thumbnail: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bàn phím cơ Akko 3087 switch brown",
    description: "Gõ êm, phù hợp làm bài đêm ở ký túc xá.",
    price: 690000,
    discountPercentage: 11,
    stock: 13,
    school: "Đại học Khoa học Tự nhiên",
    categorySlug: normalizeSlug("Laptop & Thiết bị công nghệ"),
    thumbnail: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Giáo trình Xác suất thống kê đại cương",
    description: "Sách phù hợp sinh viên khối kỹ thuật năm nhất.",
    price: 59000,
    discountPercentage: 6,
    stock: 26,
    school: "Đại học Sư phạm Kỹ thuật",
    categorySlug: normalizeSlug("Sách & Giáo trình"),
    thumbnail: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Sách nhập môn Marketing hiện đại",
    description: "Nội dung cập nhật, dễ đọc cho sinh viên năm đầu.",
    price: 72000,
    discountPercentage: 5,
    stock: 20,
    school: "Đại học Kinh tế TP.HCM",
    categorySlug: normalizeSlug("Sách & Giáo trình"),
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Gối memory foam cho phòng trọ",
    description: "Êm cổ, ngủ thoải mái sau giờ học dài.",
    price: 210000,
    discountPercentage: 10,
    stock: 24,
    school: "Đại học Quốc tế",
    categorySlug: normalizeSlug("Đồ dùng ký túc xá"),
    thumbnail: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bộ ga giường đơn cho ký túc xá",
    description: "Vải mềm, dễ giặt, phù hợp giường tầng sinh viên.",
    price: 260000,
    discountPercentage: 9,
    stock: 19,
    school: "Đại học Tôn Đức Thắng",
    categorySlug: normalizeSlug("Đồ dùng ký túc xá"),
    thumbnail: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Áo mưa bộ đi học mùa mưa",
    description: "Chất liệu dày vừa, chống thấm tốt.",
    price: 120000,
    discountPercentage: 7,
    stock: 30,
    school: "Đại học Giao thông Vận tải",
    categorySlug: normalizeSlug("Phương tiện sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1501706362039-c6b2a3a73e9c?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Khóa chống trộm xe máy chữ U",
    description: "Tăng an toàn khi gửi xe ở khu trọ.",
    price: 185000,
    discountPercentage: 8,
    stock: 21,
    school: "Đại học Mở TP.HCM",
    categorySlug: normalizeSlug("Phương tiện sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bảng trắng mini kèm bút lông",
    description: "Hữu ích cho học nhóm và ôn bài nhanh.",
    price: 95000,
    discountPercentage: 0,
    stock: 34,
    school: "Đại học Văn Lang",
    categorySlug: normalizeSlug("Dụng cụ học tập"),
    thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bộ file kẹp tài liệu 20 cái",
    description: "Sắp xếp giấy tờ môn học gọn gàng, dễ mang.",
    price: 68000,
    discountPercentage: 5,
    stock: 45,
    school: "Đại học Sư phạm",
    categorySlug: normalizeSlug("Dụng cụ học tập"),
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Bộ phát WiFi di động 4G",
    description: "Hỗ trợ kết nối internet khi di chuyển nhiều nơi.",
    price: 890000,
    discountPercentage: 10,
    stock: 10,
    school: "Đại học Hoa Sen",
    categorySlug: normalizeSlug("Thiết bị mạng & Văn phòng"),
    thumbnail: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Micro USB thu âm cơ bản làm bài thuyết trình",
    description: "Âm thanh rõ ràng, cắm là dùng trên laptop.",
    price: 470000,
    discountPercentage: 8,
    stock: 14,
    school: "Đại học Quốc gia TP.HCM",
    categorySlug: normalizeSlug("Thiết bị mạng & Văn phòng"),
    thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Quần jean form basic cho sinh viên",
    description: "Dễ phối đồ, chất vải bền cho sử dụng hằng ngày.",
    price: 260000,
    discountPercentage: 9,
    stock: 32,
    school: "Đại học Tài chính - Marketing",
    categorySlug: normalizeSlug("Thời trang sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Dép quai ngang đi học trong khuôn viên",
    description: "Êm chân, chống trượt nhẹ, phù hợp đi lại hằng ngày.",
    price: 130000,
    discountPercentage: 6,
    stock: 37,
    school: "Đại học Sài Gòn",
    categorySlug: normalizeSlug("Thời trang sinh viên"),
    thumbnail: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Nồi lẩu điện mini cho nhóm bạn",
    description: "Dung tích vừa, phù hợp nấu ăn tại phòng trọ.",
    price: 460000,
    discountPercentage: 10,
    stock: 15,
    school: "Đại học Công nghiệp TP.HCM",
    categorySlug: normalizeSlug("Đồ điện gia dụng nhỏ"),
    thumbnail: "https://images.unsplash.com/photo-1590794056470-7f22f0ed8b30?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Máy xay sinh tố mini cầm tay",
    description: "Phù hợp làm đồ uống nhanh tại ký túc xá.",
    price: 330000,
    discountPercentage: 11,
    stock: 17,
    school: "Đại học Nông Lâm TP.HCM",
    categorySlug: normalizeSlug("Đồ điện gia dụng nhỏ"),
    thumbnail: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Dây kháng lực 5 mức tập tại phòng",
    description: "Gọn nhẹ, dễ mang, phù hợp luyện tập sau giờ học.",
    price: 125000,
    discountPercentage: 8,
    stock: 29,
    school: "Đại học Thể dục Thể thao",
    categorySlug: normalizeSlug("Đồ thể thao"),
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Áo thể thao nhanh khô cho hoạt động ngoài trời",
    description: "Thoáng mát, phù hợp chạy bộ và sinh hoạt câu lạc bộ.",
    price: 155000,
    discountPercentage: 7,
    stock: 36,
    school: "Đại học Văn hóa",
    categorySlug: normalizeSlug("Đồ thể thao"),
    thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Khăn giấy ướt kháng khuẩn gói lớn",
    description: "Tiện sử dụng trong lớp học và khi di chuyển.",
    price: 58000,
    discountPercentage: 5,
    stock: 48,
    school: "Đại học Y Dược TP.HCM",
    categorySlug: normalizeSlug("Chăm sóc cá nhân"),
    thumbnail: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Kem chống nắng SPF50 cho sinh viên",
    description: "Kết cấu nhẹ, phù hợp dùng mỗi ngày đi học.",
    price: 165000,
    discountPercentage: 9,
    stock: 33,
    school: "Đại học Mở TP.HCM",
    categorySlug: normalizeSlug("Chăm sóc cá nhân"),
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Sữa tươi không đường thùng 48 hộp",
    description: "Giải pháp bổ sung dinh dưỡng tiện lợi cho cả tháng.",
    price: 398000,
    discountPercentage: 6,
    stock: 26,
    school: "Đại học Kinh tế - Luật",
    categorySlug: normalizeSlug("Thực phẩm tiện lợi"),
    thumbnail: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=500&h=500",
  },
  {
    title: "Ngũ cốc dinh dưỡng ăn sáng gói lớn",
    description: "Dễ chuẩn bị, phù hợp lịch học dày của sinh viên.",
    price: 132000,
    discountPercentage: 8,
    stock: 41,
    school: "Đại học Quốc tế",
    categorySlug: normalizeSlug("Thực phẩm tiện lợi"),
    thumbnail: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&q=80&w=500&h=500",
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

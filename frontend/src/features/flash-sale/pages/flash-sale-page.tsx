import { useState, useMemo, useEffect } from "react";
import { Typography, Breadcrumb, Menu, Layout, Tag, Spin, Empty } from "antd";
import { ClockCircleOutlined, FireOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { FlashSaleCard } from "../components/flash-sale-card";
import { useQuery } from "@tanstack/react-query";
import { getFlashSaleSessionsApi, getCategories } from "../../products/api/product.api";
import type { FlashSaleSession } from "../../products/types/product.types";

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

// ─── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(targetIso: string | null) {
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    if (!targetIso) return;
    const tick = () => {
      const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
      const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0");
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetIso]);

  return timeLeft;
}

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  ONGOING:  { label: "Đang diễn ra", color: "red",    icon: <FireOutlined /> },
  UPCOMING: { label: "Sắp bắt đầu",  color: "orange", icon: <ClockCircleOutlined /> },
  ENDED:    { label: "Đã kết thúc",  color: "default", icon: null },
} as const;

function formatHour(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const FlashSalePage = () => {
  // 1. SỬA CHỖ NÀY: Đổi tên data thành 'rawSessions'
  const { data: rawSessions = [], isPending: isSessionsPending } = useQuery<FlashSaleSession[]>({
    queryKey: ["flash-sale-sessions"],
    queryFn: getFlashSaleSessionsApi,
    refetchInterval: 30_000, 
  });

  // 2. Đồng hồ đếm nhịp
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Xử lý logic trạng thái thời gian thực
  const sessions = useMemo(() => {
    // Thêm chữ ': FlashSaleSession' để TypeScript hết báo lỗi 'any'
    return rawSessions.map((session: FlashSaleSession) => {
      const end = new Date(session.endTime).getTime();
      const start = new Date(session.startTime).getTime();
      let realStatus = session.status;
      
      if (currentTime >= end) realStatus = "ENDED";
      else if (currentTime >= start && currentTime < end) realStatus = "ONGOING";
      else if (currentTime < start) realStatus = "UPCOMING";
      
      return { ...session, status: realStatus };
    });
  }, [rawSessions, currentTime]);  
  
  const { data: allCategories = [] } = useQuery({
    queryKey: ["client-categories"],
    queryFn: getCategories,
  });

  // Chọn ca ONGOING đầu tiên mặc định, nếu không có thì ca đầu tiên
  const defaultSession = useMemo(
    () => sessions.find((s) => s.status === "ONGOING") ?? sessions[0] ?? null,
    [sessions]
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Khi sessions load xong lần đầu, set default
  useEffect(() => {
    if (!selectedSessionId && defaultSession) {
      setSelectedSessionId(defaultSession.id);
    }
  }, [defaultSession, selectedSessionId]);

  const activeSession = sessions.find((s) => s.id === selectedSessionId) ?? defaultSession;

  const countdownTarget =
    activeSession?.status === "ONGOING"
      ? activeSession.endTime
      : activeSession?.status === "UPCOMING"
      ? activeSession.startTime
      : null;

  const countdown = useCountdown(countdownTarget);

  // Lọc theo danh mục
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const flashSaleProducts = activeSession?.products ?? [];

  const activeCategoryIds = useMemo(
    () => Array.from(new Set(flashSaleProducts.map((p) => p.productCategoryId))).filter(Boolean) as string[],
    [flashSaleProducts]
  );

  const displayedProducts = useMemo(() => {
    if (selectedCategoryId === "all") return flashSaleProducts;
    return flashSaleProducts.filter((p) => String(p.productCategoryId) === selectedCategoryId);
  }, [flashSaleProducts, selectedCategoryId]);

  const menuItems = [
    { key: "all", label: "Tất Cả Sản Phẩm" },
    ...activeCategoryIds.map((id) => {
      const cat = allCategories.find((c: any) => String(c.id) === String(id));
      return { key: id, label: cat?.title ?? "Danh mục khác" };
    }),
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-[#f8fafc] animate-in">
      <Breadcrumb
        className="mb-4"
        items={[
          { title: "TRANG CHỦ" },
          { title: "KHUYẾN MÃI" },
          { title: "FLASH SALE" },
        ]}
      />

      {/* ── BANNER HEADER ── */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-400 rounded-xl p-5 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <ThunderboltOutlined className="text-yellow-300 text-4xl drop-shadow" />
          <div>
            <h1 className="text-white font-black text-2xl sm:text-3xl tracking-wide leading-none mb-0.5">
              FLASH SALE
            </h1>
            {activeSession && (
              <p className="text-red-100 text-sm">
                {activeSession.status === "ONGOING"
                  ? `Kết thúc lúc ${formatHour(activeSession.endTime)}`
                  : activeSession.status === "UPCOMING"
                  ? `Bắt đầu lúc ${formatHour(activeSession.startTime)}`
                  : `Đã kết thúc lúc ${formatHour(activeSession.endTime)}`}
              </p>
            )}
          </div>
        </div>

        {/* Countdown */}
        {activeSession?.status !== "ENDED" && (
          <div className="flex flex-col items-center">
            <span className="text-red-100 text-xs mb-1 font-medium">
              {activeSession?.status === "ONGOING" ? "⏳ Kết thúc sau" : "⏳ Bắt đầu sau"}
            </span>
            <div className="flex items-center gap-1">
              {[countdown.h, countdown.m, countdown.s].map((val, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="bg-white text-red-600 font-black text-xl px-2.5 py-1 rounded-lg shadow min-w-[42px] text-center tabular-nums">
                    {val}
                  </span>
                  {i < 2 && <span className="text-white font-black text-xl">:</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── SESSION SELECTOR (khung giờ) ── */}
      {isSessionsPending ? (
        <div className="flex justify-center py-4"><Spin /></div>
      ) : sessions.length > 0 ? (
        <div className="flex gap-3 mb-5 overflow-x-auto pb-1 no-scrollbar">
          {sessions.map((session) => {
            const cfg = STATUS_CONFIG[session.status];
            const isSelected = session.id === selectedSessionId;
            return (
              <button
                key={session.id}
                onClick={() => {
                  setSelectedSessionId(session.id);
                  setSelectedCategoryId("all");
                }}
                className={`flex-shrink-0 flex flex-col items-center px-5 py-3 rounded-xl border-2 transition-all font-semibold
                  ${isSelected
                    ? "border-red-500 bg-red-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50"
                  }`}
              >
                <span className={`text-lg font-black ${isSelected ? "text-red-600" : "text-gray-700"}`}>
                  {formatHour(session.startTime)}
                </span>
                <span className={`text-xs ${isSelected ? "text-red-400" : "text-gray-400"}`}>
                  — {formatHour(session.endTime)}
                </span>
                <Tag
                  color={cfg.color}
                  icon={cfg.icon}
                  className="mt-1.5 text-[11px] font-semibold border-0"
                >
                  {cfg.label}
                </Tag>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center mb-5 border border-gray-100">
          <FireOutlined className="text-4xl text-gray-300 mb-2" />
          <p className="text-gray-500">Hôm nay chưa có ca Flash Sale nào được lên lịch.</p>
        </div>
      )}

      {activeSession && (
        <Layout className="bg-transparent gap-6 flex-row">
          {/* SIDEBAR DANH MỤC */}
          <Sider
            width={250}
            className="bg-white rounded-lg shadow-sm h-fit hidden md:block border border-gray-100"
          >
            <div className="p-4 border-b border-gray-100 bg-[#fff5f5] rounded-t-lg">
              <h3 className="font-bold text-lg mb-0 text-red-600 uppercase">Danh mục Sale</h3>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[selectedCategoryId]}
              onClick={(e) => setSelectedCategoryId(e.key)}
              className="border-none rounded-b-lg font-medium"
              items={menuItems}
            />
          </Sider>

          {/* PRODUCT GRID */}
          <Content>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center border border-gray-100">
              <Title level={4} className="!mb-0 text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <FireOutlined className="text-red-500" />
                {selectedCategoryId === "all"
                  ? "Tất cả sản phẩm Flash Sale"
                  : allCategories.find((c: any) => String(c.id) === selectedCategoryId)?.title ?? "Danh mục"}
              </Title>
              <Text className="text-gray-500 font-medium">{displayedProducts.length} sản phẩm</Text>
            </div>

            {activeSession.status === "ENDED" ? (
              <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
                <ClockCircleOutlined className="text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Ca Flash Sale này đã kết thúc.</p>
                <p className="text-gray-400 text-sm">Hãy chờ ca tiếp theo nhé!</p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
                <Empty description="Chưa có sản phẩm nào trong ca này." />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedProducts.map((product) => (
                  <FlashSaleCard key={product.id} product={product} status={activeSession.status} />
                ))}
              </div>
            )}
          </Content>
        </Layout>
      )}
    </div>
  );
};
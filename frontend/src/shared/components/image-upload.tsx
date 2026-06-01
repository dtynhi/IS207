import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, message, Spin } from "antd";
import axios from "axios";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

type MediaKind = "image" | "video";

type UploadItem = {
  id: string;
  previewUrl: string;
  kind: MediaKind;
};

export type ImageUploadProps = {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  accept?: string;
  maxImageSizeMB?: number;
  maxVideoSizeMB?: number;
  onUploadingChange?: (uploading: boolean) => void;
};

const DEFAULT_MAX_IMAGE_SIZE_MB = 5;
const DEFAULT_MAX_VIDEO_SIZE_MB = 50;
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v", ".mkv"];

const getAcceptTokens = (accept: string) =>
  accept
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const isVideoUrl = (url: string) => {
  const normalized = url.split("?")[0]?.split("#")[0]?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.some((ext) => normalized.endsWith(ext));
};

export const ImageUpload = ({
  value,
  onChange,
  maxFiles = 5,
  accept = "image/*",
  maxImageSizeMB = DEFAULT_MAX_IMAGE_SIZE_MB,
  maxVideoSizeMB = DEFAULT_MAX_VIDEO_SIZE_MB,
  onUploadingChange,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const urls = Array.isArray(value) ? value : [];
  const valueRef = useRef<string[]>(urls);
  const uploadsRef = useRef<UploadItem[]>(uploads);

  useEffect(() => {
    valueRef.current = urls;
  }, [urls]);

  useEffect(() => {
    uploadsRef.current = uploads;
    onUploadingChange?.(uploads.length > 0);
  }, [uploads, onUploadingChange]);

  useEffect(
    () => () => {
      uploadsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    []
  );

  const removeUrl = (url: string) => {
    const next = valueRef.current.filter((item) => item !== url);
    onChange?.(next);
  };

  const acceptTokens = getAcceptTokens(accept);
  const acceptsImage = acceptTokens.some((token) => token.startsWith("image/"));
  const acceptsVideo = acceptTokens.some((token) => token.startsWith("video/"));
  const allowedLabel = acceptsImage && acceptsVideo ? "ảnh/video" : acceptsVideo ? "video" : "ảnh";

  const uploadFile = async (file: File, previewUrl: string, id: string) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post<{ success: boolean; url?: string; message?: string }>(
        "/api/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (!response.data?.success || !response.data?.url) {
        throw new Error(response.data?.message || "Không thể tải tệp lên.");
      }
      const next = [...valueRef.current, response.data.url];
      onChange?.(next);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Không thể tải tệp lên.";
      message.error(messageText);
    } finally {
      setUploads((prev) => prev.filter((item) => item.id !== id));
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const remainingSlots = maxFiles - urls.length - uploadsRef.current.length;
    if (remainingSlots <= 0) {
      message.warning(`Chỉ được tải tối đa ${maxFiles} ${allowedLabel}.`);
      return;
    }

    if (files.length > remainingSlots) {
      message.warning(`Chỉ được tải tối đa ${maxFiles} ${allowedLabel}.`);
    }

    const selected = files.slice(0, remainingSlots);
    for (const file of selected) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (isImage && !acceptsImage) {
        message.error(`"${file.name}" không nằm trong danh sách định dạng cho phép.`);
        continue;
      }
      if (isVideo && !acceptsVideo) {
        message.error(`"${file.name}" không nằm trong danh sách định dạng cho phép.`);
        continue;
      }
      if (!isImage && !isVideo) {
        message.error(`"${file.name}" không phải là ${allowedLabel} hợp lệ.`);
        continue;
      }
      const maxSizeMB = isVideo ? maxVideoSizeMB : maxImageSizeMB;
      if (file.size > maxSizeMB * 1024 * 1024) {
        message.error(`"${file.name}" vượt quá ${maxSizeMB}MB.`);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const kind: MediaKind = isVideo ? "video" : "image";
      setUploads((prev) => [...prev, { id, previewUrl, kind }]);
      await uploadFile(file, previewUrl, id);
    }
  };

  const canAddMore = urls.length + uploads.length < maxFiles;

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} multiple hidden onChange={handleFileSelection} />
      <div className="flex flex-wrap gap-2">
        {urls.map((url, index) => (
          <div key={`${url}-${index}`} className="relative h-20 w-20 overflow-hidden rounded border">
            {isVideoUrl(url) ? (
              <video
                src={url}
                className="h-full w-full object-cover"
                controls
                preload="metadata"
                playsInline
              />
            ) : (
              <img src={url} alt={`Ảnh ${index + 1}`} className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeUrl(url)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <CloseOutlined className="text-[10px]" />
            </button>
          </div>
        ))}
        {uploads.map((item) => (
          <div key={item.id} className="relative h-20 w-20 overflow-hidden rounded border">
            {item.kind === "video" ? (
              <video
                src={item.previewUrl}
                className="h-full w-full object-cover opacity-70"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img src={item.previewUrl} alt="Đang tải ảnh" className="h-full w-full object-cover opacity-70" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Spin size="small" />
            </div>
          </div>
        ))}
        {canAddMore && (
          <Button
            type="dashed"
            icon={<UploadOutlined />}
            onClick={() => inputRef.current?.click()}
            className="h-20 w-28"
          >
            {acceptsVideo ? "Chọn ảnh/video" : "Chọn ảnh"}
          </Button>
        )}
      </div>
      <div className="mt-2 text-xs text-[var(--text-muted)]">
        {acceptsVideo
          ? `Tối đa ${maxFiles} ảnh/video. Ảnh ≤ ${maxImageSizeMB}MB, video ≤ ${maxVideoSizeMB}MB.`
          : `Tối đa ${maxFiles} ảnh, mỗi ảnh không quá ${maxImageSizeMB}MB.`}
      </div>
    </div>
  );
};

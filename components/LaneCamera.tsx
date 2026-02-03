import { Card, Spin, Tag, Space } from 'antd';
import { Video, CircleCheck } from 'lucide-react';
import LiveOverlay from './LiveOverlay';
import { useEffect, useState } from 'react';

interface Props {
  title: string;
  cameraId: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
}

export default function LaneCamera({
  title,
  cameraId,
  videoRef,
  isLoading,
}: Props) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card
      title={
        <Space>
          <Video size={18} /> {title} <Tag color="green">Active</Tag>
        </Space>
      }
      extra={
        <Tag icon={<CircleCheck size={14} />}>
          {cameraId} • {time.toLocaleTimeString()}
        </Tag>
      }
      bodyStyle={{ padding: 0 }}
    >
      <div className="relative rounded-b-lg overflow-hidden">
        {isLoading && (
          <Spin
            size="large"
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
          />
        )}

        {/* 🎥 KHUNG 16:9 CHUẨN CAMERA */}
        <div className="relative w-full aspect-video bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <LiveOverlay />
        </div>
      </div>
    </Card>
  );
}

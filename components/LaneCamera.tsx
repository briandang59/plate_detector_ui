import { Card, Spin, Tag, Space } from 'antd';
import { Video, CircleCheck } from 'lucide-react';
import LiveOverlay from './LiveOverlay';

interface Props {
  title: string;
  cameraId: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
}

export default function LaneCamera({ title, cameraId, videoRef, isLoading }: Props) {
  return (
    <Card
      title={
        <Space>
          <Video size={18} /> {title} <Tag color="green">Active</Tag>
        </Space>
      }
      extra={<Tag icon={<CircleCheck size={14} />}>{cameraId} • {new Date().toLocaleTimeString()}</Tag>}
      bodyStyle={{ padding: 0 }}
    >
      <div className="relative">
        {isLoading && (
          <Spin
            size="large"
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
          />
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-75 object-cover rounded-b-lg"
        />
        <LiveOverlay />
      </div>
    </Card>
  );
}
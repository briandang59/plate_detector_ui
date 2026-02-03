import { Card, Space, Tag } from 'antd';
import { Lock, LockOpen, CircleCheck, CircleAlert } from 'lucide-react';

interface Props {
  side: 'Entry' | 'Exit';
  plate: string;
  status: string;
  gateStatus: 'Open' | 'Closed';
  gateIcon: 'open' | 'closed';
}

export default function LastScannedCard({ side, plate, status, gateStatus, gateIcon }: Props) {
  const isSuccess = status.includes('Granted');
  const color = isSuccess ? 'success' : 'warning';
  const icon = gateIcon === 'open' ? <LockOpen size={16} /> : <Lock size={16} />;
  const gateColor = gateIcon === 'open' ? 'green' : 'warning';

  return (
    <Card title={`${side} - Last Scanned`}>
      <Space direction="vertical" className="w-full">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-mono bg-gray-800 p-4 rounded">{plate}</div>
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        </div>
        <Tag icon={gateIcon === 'open' ? <CircleCheck size={16} /> : <CircleAlert size={16} />} color={gateColor}>
          Gate {gateStatus}
        </Tag>
      </Space>
    </Card>
  );
}
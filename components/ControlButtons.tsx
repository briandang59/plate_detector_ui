import { Card, Button, Space } from 'antd';
import { Camera, RotateCcw, Printer, LockOpen, Ticket } from 'lucide-react';

interface Props {
  onCapture: () => void;
  onReset: () => void;
  disabledCapture: boolean;
}

export default function ControlButtons({ onCapture, onReset, disabledCapture }: Props) {
  return (
    <Card>
      <Space wrap size="large">
        <Button
          type="primary"
          icon={<Camera />}
          size="large"
          onClick={onCapture}
          disabled={disabledCapture}
        >
          Manual Trigger / Capture
        </Button>
        <Button icon={<RotateCcw />} size="large" onClick={onReset}>
          Reset Camera
        </Button>
        <Button icon={<Printer />} size="large">
          Print Ticket
        </Button>
        <Button type="default" icon={<LockOpen />} size="large">
          Open Gate
        </Button>
        <Button icon={<Ticket />} size="large">
          Issue Receipt
        </Button>
      </Space>
    </Card>
  );
}
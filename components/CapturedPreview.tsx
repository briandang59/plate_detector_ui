import { Card, Button } from 'antd';
import { Upload } from 'lucide-react';

interface Props {
  imageUrl: string;
  isSending: boolean;
  onSend: () => void;
}

export default function CapturedPreview({ imageUrl, isSending, onSend }: Props) {
  return (
    <Card title="Captured Frame">
      <img
        src={imageUrl}
        alt="Captured parking frame"
        className="max-h-100 mx-auto rounded shadow-lg"
      />
      <div className="mt-6">
        <Button
          type="primary"
          icon={<Upload />}
          loading={isSending}
          onClick={onSend}
          size="large"
          block
        >
          Gửi Frame lên Server (cho OCR / xử lý)
        </Button>
      </div>
    </Card>
  );
}
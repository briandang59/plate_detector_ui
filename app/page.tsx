'use client';

import { useEffect, useRef, useState } from 'react';
import { ConfigProvider, Row, Col, Alert } from 'antd';
import { theme as antdTheme } from 'antd';

import StatsCards from '@/components/StatsCards';
import LaneCamera from '@/components/LaneCamera';
import LastScannedCard from '@/components/LastScannedCard';
import ControlButtons from '@/components/ControlButtons';
import CapturedPreview from '@/components/CapturedPreview';
import TransactionTable from '@/components/TransactionTable';

import { captureFrame } from '@/utils/functions/captureFrame';

export default function SmartParkingDashboard() {
  const videoRefLeft = useRef<HTMLVideoElement | null>(null);
  const videoRefRight = useRef<HTMLVideoElement | null>(null);

  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Dữ liệu giả lập (sau này fetch từ API)
  const stats = { occupancy: 87, available: 42, volume: 1204 };
  const transactions = [
    { key: '1', time: '14:01:22', lane: 'Entry E01', lpn: 'KBA-4921', duration: '-', status: 'Allowed' },
    { key: '2', time: '13:58:45', lane: 'Exit X01', lpn: 'LMN-3321', duration: '2h 14m', status: 'Paid' },
    { key: '3', time: '13:55:10', lane: 'Entry E01', lpn: 'UNK-0000', duration: '-', status: 'Manual Review' },
  ];

  useEffect(() => {
    async function openCamera(ref: React.RefObject<HTMLVideoElement | null>) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
        });
        if (ref.current) ref.current.srcObject = stream;
      } catch (err) {
        setError('Không mở được camera. Vui lòng kiểm tra quyền truy cập.');
        console.error(err);
      }
    }

    setIsLoading(true);
    Promise.all([openCamera(videoRefLeft), openCamera(videoRefRight)]).then(() => setIsLoading(false));

    return () => {
      [videoRefLeft, videoRefRight].forEach((ref) => {
        if (ref.current?.srcObject) {
          (ref.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        }
      });
    };
  }, []);

  const handleCapture = async () => {
    const video = videoRefLeft.current ?? videoRefRight.current;
    if (!video) return;

    try {
      const blob = await captureFrame(video);
      setCapturedBlob(blob);
      setCapturedUrl(URL.createObjectURL(blob));
      video.pause();
    } catch (err) {
      console.error('Capture failed:', err);
    }
  };

  const handleReset = () => {
    [videoRefLeft.current, videoRefRight.current].forEach((v) => v?.play().catch(console.error));
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedBlob(null);
    setCapturedUrl(null);
  };

  const handleSend = async () => {
    if (!capturedBlob) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('image', capturedBlob, `frame-${Date.now()}.jpg`);
      formData.append('cameraId', 'CAM-01');
      formData.append('timestamp', new Date().toISOString());

      const res = await fetch('/api/upload-parking-frame', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      alert('Gửi thành công!');
      handleReset();
    } catch (err) {
      alert('Gửi thất bại');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: { colorPrimary: '#1677ff', borderRadius: 8 },
      }}
    >
      <div className="min-h-screen bg-[#0f172a] p-4 md:p-6">
        <div className="max-w-400 mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white! mb-1!">
              Smart Parking - Giám Sát Chung Cư
            </h1>
            <p className="text-gray-400">
              Camera tầng B2 - Khu A | Vinhomes Central Park
            </p>
          </div>

          <StatsCards stats={stats} />

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <LaneCamera
                title="Entry Lane - E01"
                cameraId="CAM-01"
                videoRef={videoRefLeft}
                isLoading={isLoading}
              />
            </Col>
            <Col xs={24} lg={12}>
              <LaneCamera
                title="Exit Lane - X01"
                cameraId="CAM-02"
                videoRef={videoRefRight}
                isLoading={isLoading}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <LastScannedCard
                side="Entry"
                plate="KBA-4921"
                status="Access Granted"
                gateStatus="Open"
                gateIcon="open"
              />
            </Col>
            <Col xs={24} lg={12}>
              <LastScannedCard
                side="Exit"
                plate="XYZ-9822"
                status="Payment Pending"
                gateStatus="Closed"
                gateIcon="closed"
              />
            </Col>
          </Row>

          <ControlButtons
            onCapture={handleCapture}
            onReset={handleReset}
            disabledCapture={!!capturedUrl}
          />

          {capturedUrl && (
            <CapturedPreview
              imageUrl={capturedUrl}
              isSending={isSending}
              onSend={handleSend}
            />
          )}

          <TransactionTable data={transactions} />

          {error && <Alert message={error} type="error" showIcon className="mt-6" />}
        </div>
      </div>
    </ConfigProvider>
  );
}
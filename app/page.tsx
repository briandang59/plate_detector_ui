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

  useEffect(() => {
    let streams: MediaStream[] = [];

    async function openCameras() {
      try {
        setIsLoading(true);

        // 1️⃣ xin quyền trước (để hiện label)
        await navigator.mediaDevices.getUserMedia({ video: true });

        // 2️⃣ lấy danh sách camera
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');

        console.log('Detected cameras:', videoDevices);

        if (videoDevices.length === 0) {
          throw new Error('Không tìm thấy camera');
        }

        // 3️⃣ ENTRY CAM
        if (videoRefLeft.current && videoDevices[0]) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: videoDevices[0].deviceId } },
          });
          videoRefLeft.current.srcObject = stream;
          streams.push(stream);
        }

        // 4️⃣ EXIT CAM (nếu có)
        if (videoRefRight.current && videoDevices[1]) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: videoDevices[1].deviceId } },
          });
          videoRefRight.current.srcObject = stream;
          streams.push(stream);
        }

        if (videoDevices.length === 1) {
          setError('Chỉ phát hiện 1 camera – hệ thống đang chạy chế độ 1 làn');
        }
      } catch (err) {
        console.error(err);
        setError('Không mở được camera hoặc không đủ số camera');
      } finally {
        setIsLoading(false);
      }
    }

    openCameras();

    return () => {
      streams.forEach(stream =>
        stream.getTracks().forEach(track => track.stop())
      );
    };
  }, []);

  // 📸 Capture frame (ưu tiên Entry trước)
  const handleCapture = async () => {
    const video =
      videoRefLeft.current?.srcObject
        ? videoRefLeft.current
        : videoRefRight.current;

    if (!video) return;

    try {
      const blob = await captureFrame(video);
      setCapturedBlob(blob);
      setCapturedUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Capture failed:', err);
    }
  };

  const handleReset = () => {
    [videoRefLeft.current, videoRefRight.current].forEach(v =>
      v?.play().catch(console.error)
    );
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

      const res = await fetch('/api/upload-parking-frame', {
        method: 'POST',
        body: formData,
      });

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

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <LaneCamera
                title="Entry Lane - E01"
                cameraId="CAM-01"
                videoRef={videoRefLeft}
                isLoading={isLoading}
              />
            </Col>

            {videoRefRight && (
              <Col xs={24} lg={12}>
                <LaneCamera
                  title="Exit Lane - X01"
                  cameraId="CAM-02"
                  videoRef={videoRefRight}
                  isLoading={isLoading}
                />
              </Col>
            )}
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

          {error && <Alert message={error} type="warning" showIcon />}
        </div>
      </div>
    </ConfigProvider>
  );
}

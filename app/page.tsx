"use client";

import { useEffect, useRef, useState } from "react";
import { ConfigProvider, Row, Col, Alert } from "antd";
import { theme as antdTheme } from "antd";

import LaneCamera from "@/components/LaneCamera";
import LastScannedCard from "@/components/LastScannedCard";
import ControlButtons from "@/components/ControlButtons";
import CapturedPreview from "@/components/CapturedPreview";

import { captureFrame } from "@/utils/functions/captureFrame";
import { api } from "@/lib/api";
import { DetectResponse } from "@/types/responses/detect";
import toast from "react-hot-toast";
import { urls } from "@/utils/constants/urls";

export default function SmartParkingDashboard() {
  const videoRefLeft = useRef<HTMLVideoElement | null>(null);
  const videoRefRight = useRef<HTMLVideoElement | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [cameraOnlineLeft, setCameraOnlineLeft] = useState(false);
  const [plateDetect, setPlateDetect] = useState<string>("unknow");

  useEffect(() => {
    let streams: MediaStream[] = [];

    async function openCameras() {
      try {
        setIsLoading(true);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRefLeft.current) {
          videoRefLeft.current.srcObject = stream;

          const track = stream.getVideoTracks()[0];

          setCameraOnlineLeft(true);

          track.onended = () => {
            setCameraOnlineLeft(false);
            setError("Camera Entry bị ngắt kết nối");
          };
        }
      } catch (err) {
        setCameraOnlineLeft(false);
        setError("Không mở được webcam");
      } finally {
        setIsLoading(false);
      }
    }

    openCameras();

    return () => {
      streams.forEach((stream) =>
        stream.getTracks().forEach((track) => track.stop()),
      );
    };
  }, []);

  const handleCapture = async () => {
    const video = videoRefLeft.current?.srcObject
      ? videoRefLeft.current
      : videoRefRight.current;

    if (!video) return;

    try {
      const blob = await captureFrame(video);
      setCapturedBlob(blob);
      setCapturedUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Capture failed:", err);
    }
  };

  const handleReset = () => {
    [videoRefLeft.current, videoRefRight.current].forEach((v) =>
      v?.play().catch(console.error),
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
      formData.append("file", capturedBlob, `frame-${Date.now()}.jpg`);
      formData.append("cameraId", "CAM-01");
      formData.append("timestamp", new Date().toISOString());

      const response = await api.upload<DetectResponse>(
        `/${urls.detect}`,
        formData,
      );

      if (!response.ok || response.error) {
        throw new Error(response.error || "Upload thất bại");
      }
      if (response.data?.plate) {
        setPlateDetect(response.data.plate);
        toast.success(
          `Phát hiện: ${response.data.plate} (độ tin cậy: ${response.data.confidence.toFixed(2)})`,
        );
      } else {
        toast.error(response.data?.message || "Không phát hiện biển số");
      }
      handleReset();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: { colorPrimary: "#1677ff", borderRadius: 8 },
      }}
    >
      <div className="min-h-screen bg-[#0f172a] p-4 md:p-6">
        <div className="max-w-400 mx-auto space-y-6">
          {/* <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white! mb-1!">
              Smart Parking - Giám Sát Chung Cư
            </h1>
            <p className="text-gray-400">
              Camera tầng B2 - Khu A | Vinhomes Central Park
            </p>
          </div> */}

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <LaneCamera
                title="Entry Lane - E01"
                cameraId="CAM-01"
                videoRef={videoRefLeft}
                isLoading={isLoading}
                online={cameraOnlineLeft}
              />
            </Col>

            {videoRefRight && (
              <Col xs={24} lg={12}>
                <LaneCamera
                  title="Exit Lane - X01"
                  cameraId="CAM-02"
                  videoRef={videoRefRight}
                  isLoading={isLoading}
                  online={!cameraOnlineLeft}
                />
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <LastScannedCard
                side="Entry"
                plate={plateDetect}
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

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const Scanface = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState("🔍 โปรดหันหน้าตรง แล้วกด 'เริ่มสแกนใบหน้า'");
  const [loading, setLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const loadModels = useCallback(async () => {
    try {
      setMessage("🔄 กำลังโหลดโมเดล...");
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      setMessage("📷 กล้องพร้อมแล้ว! กดปุ่มเพื่อเริ่มสแกน");
      startCamera();
    } catch (error) {
      console.error("❌ โหลดโมเดล Face API ไม่สำเร็จ:", error);
      setMessage("❌ โหลดโมเดลไม่สำเร็จ");
    }
  }, []);

  useEffect(() => {
    loadModels();
    return () => stopCamera();
  }, [loadModels]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("❌ ไม่สามารถเข้าถึงกล้องได้:", error);
      setMessage("❌ โปรดอนุญาตให้เว็บไซต์ใช้กล้องของคุณ");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const getGPSLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("❌ เบราว์เซอร์ไม่รองรับ GPS");
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          () => {
            reject("❌ เข้าถึง GPS ไม่สำเร็จ");
          }
        );
      }
    });
  };

  const scanFace = async () => {
    if (!videoRef.current || !videoReady) {
      setMessage("📷 รอกล้องโหลดให้เสร็จก่อน...");
      return;
    }

    setLoading(true);
    setMessage("🔎 กำลังตรวจจับใบหน้า...");

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections.length) {
      setMessage("❌ ไม่พบใบหน้า กรุณาลองใหม่");
      setLoading(false);
      return;
    }

    const descriptorArray = Array.from(detections[0].descriptor);

    try {
      const { latitude, longitude } = await getGPSLocation();

      const findRes = await fetch("http://localhost:5000/api/students/find-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ faceDescriptor: descriptorArray }),
      });

      const findData = await findRes.json();
      if (!findRes.ok) throw new Error(findData.message || "❌ ไม่พบใบหน้าในระบบ");

      const checkinRes = await fetch("http://localhost:5000/api/attendance/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          studentId: findData.studentId,
          fullName: findData.fullName,
          method: "face",
          latitude,
          longitude,
        }),
      });

      const checkinData = await checkinRes.json();
      if (!checkinRes.ok) throw new Error(checkinData.message || "❌ เช็คชื่อไม่สำเร็จ");

      alert(`✅ เช็คชื่อสำเร็จ! ขอบคุณ ${findData.fullName}`);
      stopCamera();
      navigate("/student-dashboard");

    } catch (error) {
      console.error("❌ ตรวจสอบใบหน้าผิดพลาด:", error);
      setMessage(error.message || "❌ เกิดข้อผิดพลาดในการเช็คชื่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-center mt-5">
      <h2>📸 สแกนใบหน้า</h2>
      <p>{message}</p>

      <div className="d-flex justify-content-center my-3">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width="400"
          height="300"
          onLoadedData={() => setVideoReady(true)} // ✅ กล้องโหลดเสร็จ
          className="rounded shadow"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      <div className="d-flex justify-content-center gap-2">
        <button className="btn btn-success" onClick={scanFace} disabled={loading}>
          {loading ? "กำลังตรวจสอบ..." : "✅ เริ่มสแกนใบหน้า"}
        </button>
        <button className="btn btn-secondary" onClick={() => { stopCamera(); navigate(-1); }}>
          🔙 กลับ
        </button>
      </div>
    </div>
  );
};

export default Scanface;

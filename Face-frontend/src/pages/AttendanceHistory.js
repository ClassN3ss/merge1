import React, { useEffect, useState } from "react";
import axios from "axios";

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/attendance/history/${user.studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHistory(res.data.history);
      } catch (err) {
        console.error("❌ ดึงข้อมูลไม่สำเร็จ", err);
      }
    };

    if (user?.studentId) {
      fetchHistory();
    }
  }, [user.studentId, token]);

  return (
    <div className="container mt-4">
      <h2>📜 ประวัติการเช็คชื่อ</h2>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>สถานะ</th>
            <th>ตำแหน่ง</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, idx) => (
            <tr key={idx}>
              <td>{new Date(h.scan_time).toLocaleDateString()}</td>
              <td>{new Date(h.scan_time).toLocaleTimeString()}</td>
              <td>{h.status}</td>
              <td>{`${h.location_data.latitude}, ${h.location_data.longitude}`}</td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">
                ❗ ไม่มีประวัติการเช็คชื่อ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceHistory;

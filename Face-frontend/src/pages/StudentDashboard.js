import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    if (!user) return;
    if (!user.faceScanned) {
      navigate("/save-face");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [attendanceRes, classRes] = await Promise.all([
          API.get(`/attendance/history/${user.studentId}`),
          API.get(`/classes/student/${user._id}`),
        ]);
        setAttendance(attendanceRes.data.history); // ✅ FIXED: ใช้ data ตรง ๆ
        setMyClasses(classRes.data);
      } catch (err) {
        console.error("❌ ดึงข้อมูลล้มเหลว", err);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>🎓 หน้าหลักนักศึกษา</h2>
      </div>

      {user && (
        <div className="card p-4 shadow mt-3">
          <h4>{user.studentId} {user.fullName}</h4>
          <p>Email: {user.email}</p>
        </div>
      )}

      <h3 className="mt-4">📚 วิชาที่ลงทะเบียน</h3>
      <ul className="list-group mb-4">
        {myClasses.length === 0 ? (
          <li className="list-group-item text-muted">ไม่มีข้อมูล</li>
        ) : (
          myClasses.map((cls) => (
            <li key={cls._id} className="list-group-item">
              {cls.courseCode} - {cls.courseName} (Section {cls.section})
            </li>
          ))
        )}
      </ul>

      <div className="text-center mb-4">
        <button className="btn btn-primary w-100" onClick={() => navigate("/scan-face")}>
          📸 สแกนใบหน้าเพื่อเช็คชื่อ
        </button>
      </div>

      <h3 className="mt-4">📅 ประวัติการเช็คชื่อ</h3>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record, index) => (
            <tr key={index}>
              <td>{new Date(record.scan_time).toLocaleDateString()}</td>
              <td>{new Date(record.scan_time).toLocaleTimeString()}</td>
              <td>
                <span className={`badge bg-${record.status === "Present" ? "success" : record.status === "Late" ? "warning" : "danger"}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentDashboard;

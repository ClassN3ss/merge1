import React, { useEffect, useState } from "react";
import API from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchHistoryAndEnrolls = async () => {
      try {
        const [historyRes, enrollsRes] = await Promise.all([
          API.get(`/attendance/history/${user.studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get(`/enrolls/enrolled/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const history = historyRes.data.history || [];
        const enrolls = enrollsRes.data.enrolled || []; // ✅ FIX

        setHistory(history);

        const options = enrolls
          .filter(e => e.courseCode && e.courseName && e.section)
          .map(e => {
            return `${e.classId}|${e.courseCode} - ${e.courseName} (Sec ${e.section})`;
          });


        setCourseOptions(options);
      } catch (err) {
        console.error("❌ ดึงข้อมูลไม่สำเร็จ", err);
      }
    };

    if (user?.studentId && user?._id) fetchHistoryAndEnrolls();
  }, [user.studentId, user?._id, token]);

  useEffect(() => {
    const filtered = history.filter((h) => {
      const matchCourse = !selectedCourse || h.classId?._id === selectedCourse;

      const formatDate = (d) => {
        const date = new Date(d);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
      };

      const matchDate = !selectedDate || formatDate(h.scan_time) === selectedDate;

      return matchCourse && matchDate;
    });
    setFilteredHistory(filtered);
  }, [selectedCourse, selectedDate, history]);

  return (
    <div className="container mt-4">
      <h2>📜 ประวัติการเช็คชื่อ</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <label>📝 เลือกวิชา</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- ทั้งหมด --</option>
            {courseOptions.map((c) => {
              const [id, name] = c.split("|");
              return <option key={id} value={id}>{name}</option>;
            })}
          </select>
        </div>
        <div className="col-md-6">
          <label>📅 เลือกวันที่</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>วิชา</th>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>สถานะ</th>
            <th>ตำแหน่ง</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map((h, idx) => (
            <tr key={idx}>
              <td>
                {h.classId
                  ? `${h.classId.courseCode} - ${h.classId.courseName} (Sec ${h.classId.section})`
                  : "-"}
              </td>
              <td>{new Date(h.scan_time).toLocaleDateString("th-TH")}</td>
              <td>{new Date(h.scan_time).toLocaleTimeString()}</td>
              <td className={
                h.status === "Present"
                  ? "status-present"
                  : h.status === "Late"
                    ? "status-late"
                    : "status-absent"
              }>
                {h.status}
              </td>
              <td>
                {`${h.location_data.latitude}, ${h.location_data.longitude}`}
              </td>
            </tr>
          ))}
          {filteredHistory.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                ❗ ไม่พบข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceHistory;

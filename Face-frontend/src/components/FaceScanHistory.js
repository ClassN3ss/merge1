import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function FaceScanHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/attendance/history-student').then(res => {
      setHistory(res.data);
    });
  }, []);

  return (
    <div>
      <h5>📊 ประวัติการสแกนใบหน้า</h5>
      <table className="table table-striped table-sm">
        <thead>
          <tr><th>นักศึกษา</th><th>เวลา</th><th>GPS</th><th>วิชา</th></tr>
        </thead>
        <tbody>
          {history.map(h => (
            <tr key={h._id}>
              <td>{h.student?.fullName}</td>
              <td>{new Date(h.timestamp).toLocaleString()}</td>
              <td>{h.location}</td>
              <td>{h.course?.courseName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
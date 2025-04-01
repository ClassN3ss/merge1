import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function RequestTable() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await axios.get('http://localhost:5000/api/enrollments/requests');
    setRequests(res.data);
  };

  const handleAction = async (id, status) => {
    await axios.patch(`http://localhost:5000/api/enrollments/approve`, { id, status });
    fetchRequests();
  };

  useEffect(() => { fetchRequests(); }, []);

  return (
    <div>
      <h5>📥 คำร้องขอเข้าเรียน</h5>
      <table className="table table-bordered table-sm">
        <thead>
          <tr><th>ชื่อ</th><th>วิชา</th><th>ตอน</th><th>จัดการ</th></tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req._id}>
              <td>{req.student?.fullName}</td>
              <td>{req.course?.courseName}</td>
              <td>{req.course?.section}</td>
              <td>
                <button onClick={() => handleAction(req._id, 'approved')} className="btn btn-success btn-sm">✅</button>
                <button onClick={() => handleAction(req._id, 'rejected')} className="btn btn-danger btn-sm ms-1">❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

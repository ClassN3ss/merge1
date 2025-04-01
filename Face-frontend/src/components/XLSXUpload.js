import React, { useState } from 'react';
import axios from 'axios';

export default function XLSXUpload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('กรุณาเลือกไฟล์ก่อน');

    const formData = new FormData();
    formData.append('csv', file); // ใช้ key 'csv' ให้ตรง backend

    try {
      const res = await axios.post('http://localhost:5000/api/classes/upload', formData);
      alert('✅ อัปโหลดสำเร็จ: ' + res.data.message);
    } catch (err) {
      console.error(err);
      alert('❌ XLSX Upload Failed');
    }
  };

  return (
    <div className="my-3">
      <label>📤 Upload Excel (xlsx): </label>
      <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files[0])} className="form-control my-2" />
      <button className="btn btn-success" onClick={handleUpload}>Upload XLSX</button>
    </div>
  );
}

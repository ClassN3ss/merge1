import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const NewRegister = () => {
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const trimmedStudentId = studentId.trim();
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
  
    if (!/^\d{13}$/.test(trimmedStudentId)) {
      return "รหัสนักศึกษาต้องเป็นตัวเลข 13 หลัก";
    }
  
    if (!/^(นาย|นางสาว|นาง)[^\s][\S\s]*$/.test(trimmedFullName)) {
      return "ชื่อต้องขึ้นต้นด้วย นาย, นางสาว หรือ นาง และไม่มีเว้นวรรค เช่น นายสมชาย";
    }
  
    if (!new RegExp(`^s${trimmedStudentId}@email\\.com$`).test(trimmedEmail)) {
      return `Email ต้องเป็น s${trimmedStudentId}@email.com เท่านั้น`;
    }
  
    return null;
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/auth/new-register", {
        studentId,
        fullName,
        email
      });
      setGenerated(res.data); // { username, password }
    } catch (err) {
      const msg = err.response?.data?.message || "❌ สมัครไม่สำเร็จ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generated) return;
    const text = `Username: ${generated.username}\nPassword: ${generated.password}`;
    navigator.clipboard.writeText(text);
    alert("📋 คัดลอกสำเร็จ!");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">📋 ลงทะเบียนใหม่</h3>

        {generated ? (
          <div>
            <p><strong>✅ ลงทะเบียนสำเร็จ!</strong></p>
            <p><strong>Username</strong></p>
            <input className="form-control mb-2" readOnly value={generated.username} />
            <p><strong>Password</strong></p>
            <input className="form-control mb-2" readOnly value={generated.password} />
            <button
              className="btn btn-outline-secondary w-100"
              onClick={handleCopy}
            >
              📋 คัดลอก
            </button>
            <button className="btn btn-success w-100 mt-2" onClick={() => navigate("/login")}>
              🔐 ไปหน้า Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="form-label">🎓 รหัสนักศึกษา</label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="เช่น 6505012345678"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              maxLength={13}
              disabled={loading}
              required
            />
            <div className="text-muted mb-2">* ต้องเป็นตัวเลข 13 หลัก</div>

            <label className="form-label">👤 ชื่อ-นามสกุล</label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="เช่น นายสมชาย ใจดี"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
            />
            <div className="text-muted mb-2">
              * ต้องขึ้นต้นด้วย <strong>นาย, นางสาว, นาง</strong> และไม่มีเว้นวรรคหลังคำนำหน้า
            </div>

            <label className="form-label">📧 Email นักศึกษา</label>
            <input
              type="email"
              className="form-control mb-2"
              placeholder={`เช่น s640406xxxxxxx@email.com`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <div className="text-muted mb-3">
              * รูปแบบต้องตรงกับ <code>s640406xxxxxxx@email.com</code>
            </div>

            {error && <div className="text-danger mb-2">{error}</div>}

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "⏳ กำลังบันทึก..." : "✅ บันทึกข้อมูล"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewRegister;

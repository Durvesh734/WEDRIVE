import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [email, setEmail] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [file, setFile] = useState(null);
  const [teacher, setTeacher] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showSnackbar = (text, type = "success") => {
    setSnackbar({ text, type });
    setIsExiting(false);

    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setSnackbar(null);
        setIsExiting(false);
      }, 300);
    }, 4500);
  };

  const fetchStudents = async () => {
    const res = await API.get("/students");
    setStudents(res.data);
  };

  const fetchTeacher = async () => {
    try {
      const res = await API.get("/me");
      setTeacher(res.data);
    } catch {
      setTeacher(null);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTeacher();

    const params = new URLSearchParams(location.search);
    const authStatus = params.get("auth");

    if (authStatus === "success") {
      showSnackbar("Student authorization completed successfully.", "success");
      navigate("/dashboard", { replace: true });
    }

    if (authStatus === "failed") {
      showSnackbar(
        "Authorization failed. The signed-in Google account does not match the registered student email.",
        "error"
      );
      navigate("/dashboard", { replace: true });
    }
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "All" || student.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const toggleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = filteredStudents.map((s) => s._id);

    if (selectedStudents.length === allIds.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allIds);
    }
  };

  const addStudent = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      showSnackbar("Email address is required.", "error");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      showSnackbar("Please enter a valid email format.", "error");
      return;
    }

    if (!trimmedEmail.endsWith("@slrtce.in")) {
      showSnackbar(
        "Only official SLRTCE email addresses (@slrtce.in) are allowed.",
        "error"
      );
      return;
    }

    try {
      setIsAdding(true);
      await API.post("/students", { email: trimmedEmail });
      setEmail("");
      fetchStudents();
      showSnackbar("Student registered successfully.", "success");
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Unable to register student.",
        "error"
      );
    } finally {
      setIsAdding(false);
    }
  };

  // ✅ CSV Upload Handler
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/students/bulk", formData);

      fetchStudents();

      showSnackbar(
        `Added ${res.data.added} students. ${res.data.invalid.length} invalid, ${res.data.duplicates.length} duplicates.`,
        "success"
      );
    } catch {
      showSnackbar("CSV upload failed.", "error");
    }

    e.target.value = null;
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      await API.delete("/students", {
        data: { studentIds: selectedStudents },
      });

      setSelectedStudents([]);
      fetchStudents();
      showSnackbar("Selected students removed successfully.", "success");
    } catch {
      showSnackbar("Unable to remove selected students.", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      showSnackbar("Please select a file before distribution.", "error");
      return;
    }

    if (selectedStudents.length === 0) {
      showSnackbar("Please select at least one student.", "error");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("studentIds", JSON.stringify(selectedStudents));

      const res = await API.post("/upload", formData);

      setFile(null);
      setSelectedStudents([]);
      showSnackbar(res.data.message, "success");
    } catch {
      showSnackbar("File distribution failed.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "http://localhost:5173";
  };

  return (
    <div className="app-wrapper">

      {/* HEADER */}
      <div className="header">
        <div>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>
            SLRTCE Drive Manager
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            File Distribution System
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {teacher && (
            <div
              style={{
                fontSize: "13px",
                background: "#f0f2f5",
                padding: "6px 12px",
                border: "1px solid #ddd",
              }}
            >
              {teacher.name} ({teacher.email})
            </div>
          )}
          <button className="secondary small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="dashboard-container">
        <div className="dashboard-grid">

          {/* LEFT COLUMN */}
          <div className="left-column">

            {/* REGISTER STUDENT */}
            <div className="card">
              <div className="section-title">Register Student</div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="email"
                  placeholder="student@slrtce.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1 }}
                />

                <button
                  className="primary"
                  onClick={addStudent}
                  disabled={isAdding}
                >
                  Register
                </button>

                <label className="secondary" style={{ cursor: "pointer" }}>
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={handleCSVUpload}
                  />
                </label>
              </div>
            </div>

            {/* STUDENTS PANEL */}
            <div className="card students-card">
              <div
                className="section-title"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Students ({students.length})</span>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {selectedStudents.length > 0 && (
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {selectedStudents.length} selected
                    </span>
                  )}

                  <button
                    className="danger small"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={selectedStudents.length === 0}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* SEARCH + FILTER */}
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
              >
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: 1 }}
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* SELECT ALL */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    filteredStudents.length > 0 &&
                    selectedStudents.length === filteredStudents.length
                  }
                  onChange={toggleSelectAll}
                />
                <span style={{ marginLeft: "6px" }}>Select All</span>
              </div>

              {/* LIST */}
              <div className="students-list">
                {filteredStudents.map((student) => (
                  <div key={student._id} className="student-row">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleStudentSelection(student._id)}
                      />
                      <span>{student.email}</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        className={
                          student.status === "Approved"
                            ? "badge badge-approved"
                            : "badge badge-pending"
                        }
                      >
                        {student.status}
                      </span>

                      {student.status === "Pending" && (
                        <button
                          className="primary small"
                          onClick={() =>
                            window.open(
                              `http://localhost:5000/auth/student/${student._id}`,
                              "_blank"
                            )
                          }
                        >
                          Authorize
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-column">
            <div className="card">
              <div className="section-title">Distribute File</div>

              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "16px",
                  background: "#fafafa",
                }}
              >
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />

                {file && (
                  <div style={{ marginTop: "8px", fontSize: "13px" }}>
                    Selected: {file.name}
                  </div>
                )}
              </div>

              <button
                className="primary"
                style={{ marginTop: "20px", width: "100%" }}
                onClick={handleFileUpload}
                disabled={selectedStudents.length === 0}
              >
                Distribute File
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Remove Selected Students</div>

            <div className="modal-body">
              You are about to permanently remove{" "}
              <strong>{selectedStudents.length}</strong> student(s).
              <br />
              <br />
              This action cannot be undone.
            </div>

            <div className="modal-footer">
              <button
                className="neutral"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SNACKBAR */}
      {snackbar && (
        <div className="snackbar-container">
          <div
            className={`snackbar ${snackbar.type} ${isExiting ? "exit" : ""}`}
          >
            {snackbar.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

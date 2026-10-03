import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  Spinner,
  Container,
} from "react-bootstrap";
import { API_BASE } from "../constant/Constant";
import Select from "react-select";
const feeStatusClass = (status) => {
  if (status === "paid") return "bg-green-100 text-green-700";
  if (status === "cancelled") return "bg-gray-100 text-gray-600";
  return "bg-red-100 text-red-700";
};

const ExtraAmount = () => {
  const [users, setUsers] = useState([]);
  const [feeUsers, setFeeUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");

  const token = localStorage.getItem("token");

  const axiosAuth = () =>
    axios.create({
      baseURL: `${API_BASE}/admin`,
      headers: { Authorization: `Bearer ${token}` },
    });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, feeRes] = await Promise.all([
        axiosAuth().get("/users"),
        axiosAuth().get("/extra-fee"),
      ]);
      setUsers(userRes.data.data.users);
      setFeeUsers(feeRes.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submitFee = async () => {
    if (!selectedUser || !amount) return alert("Fill all fields!");

    await axiosAuth().post(`/extra-fee/${selectedUser}`, { amount });
    setShowModal(false);
    setAmount("");
    setSelectedUser(null);
    fetchData();
  };

  const updateStatus = async (feeId, type) => {
    await axiosAuth().patch(`/extra-fee/${feeId}/${type}`);
    fetchData();
  };

  const options = useMemo(
    () =>
      users.map((user) => ({
        value: user._id,
        label: `${user.name} (${user.email})`,
      })),
    [users]
  );

  return (
    <Container fluid className="py-3">

      {/* Header Section */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-0">Extra fees</h4>
          <p className="text-muted small mb-0">Add a one-off charge, then mark it paid or cancel it.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Add extra fee</Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && feeUsers.length === 0 && (
        <p className="text-gray-500">No extra fees yet.</p>
      )}

      {!loading && feeUsers.length > 0 && (
        <div className="bg-white border border-line rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeUsers.map((req) => (
                <tr key={req._id} className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">{req.userId?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{req.userId?.email || "—"}</td>
                  <td className="px-4 py-3">${req.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${feeStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {req.status === "pending" ? (
                      <>
                        <button type="button" onClick={() => updateStatus(req._id, "pay")} className="text-pine font-medium mr-3">
                          Mark paid
                        </button>
                        <button type="button" onClick={() => updateStatus(req._id, "cancel")} className="text-red-600 font-medium">
                          Cancel
                        </button>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal centered show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Extra Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select User</Form.Label>
            <Select
              options={options}
              onChange={(opt) => setSelectedUser(opt?.value)}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              placeholder="Example: 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={submitFee}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ExtraAmount;

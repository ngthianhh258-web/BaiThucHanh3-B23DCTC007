import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CONTRACT_ADDRESS_DEFAULT,
  loadData,
  connectWallet,
  contribute,
  createProposal,
  vote,
  pay,
} from "./services/contract";

export default function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(CONTRACT_ADDRESS_DEFAULT);
  const [data, setData] = useState({
    daoBalance: "0",
    myContribution: "0",
    isStakeholder: false,
    proposals: [],
  });
  const [amount, setAmount] = useState("0.01");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    desc: "",
    beneficiary: "",
    amount: "0.005",
  });

  const refresh = async () => {
    if (!contract) return;
    try {
      setData(await loadData(contract, account));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refresh();
  }, [account, contract]);

  useEffect(() => {
    const t = setInterval(refresh, 10000);
    return () => clearInterval(t);
  }, [account, contract]);

  const onConnect = async () => {
    try {
      setAccount(await connectWallet());
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onContribute = async () => {
    try {
      const rc = await contribute(contract, amount);
      toast.success("Đóng góp thành công! Tx: " + rc.hash);
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onCreate = async () => {
    try {
      const rc = await createProposal(
        contract,
        form.title,
        form.desc,
        form.beneficiary,
        form.amount
      );
      toast.success("Tạo đề xuất! Tx: " + rc.hash);
      setShowCreate(false);
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onVote = async (id, support) => {
    try {
      const rc = await vote(contract, id, support);
      toast.success("Đã vote! Tx: " + rc.hash);
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onPay = async (id) => {
    try {
      const rc = await pay(contract, id);
      toast.success("Đã thanh toán! Tx: " + rc.hash);
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <div className="font-bold text-lg">PTIT Dominion</div>
        <button
          onClick={onConnect}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-full"
        >
          {account
            ? account.slice(0, 6) + "..." + account.slice(-4)
            : "CONNECT WALLET"}
        </button>
      </header>

      <div className="bg-white px-8 py-4 border-b flex gap-3 items-center">
        <span className="text-xs text-gray-500">CONTRACT:</span>
        <input
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-xs text-gray-500 uppercase">Số dư quỹ DAO</div>
          <div className="text-4xl font-bold mt-2">
            {Number(data.daoBalance).toFixed(2)}{" "}
            <span className="text-lg text-gray-500">ETH</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-xs text-gray-500 uppercase">Đóng góp của bạn</div>
          <div className="text-4xl font-bold mt-2">
            {Number(data.myContribution).toFixed(2)}{" "}
            <span className="text-lg text-gray-500">ETH</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {data.isStakeholder ? "• Bạn là cổ đông" : "• Chưa đủ ngưỡng cổ đông"}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-xs text-gray-500 uppercase">Đề xuất đang mở</div>
          <div className="text-4xl font-bold mt-2">
            {
              data.proposals.filter(
                (p) => Date.now() / 1000 < p.deadline && !p.paid
              ).length
            }
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Thời gian biểu quyết: 5 phút
          </div>
        </div>
      </div>

      {data.isStakeholder && (
        <div className="px-8 mb-4">
          <button
            onClick={() => setShowCreate(true)}
            className="bg-gray-800 text-white px-5 py-2 rounded-lg"
          >
            + Tạo đề xuất
          </button>
        </div>
      )}

      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Created By</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.proposals.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-gray-400 py-6">
                    Chưa có đề xuất
                  </td>
                </tr>
              )}
              {data.proposals.map((p) => {
                const expired = Date.now() / 1000 >= p.deadline;
                const passed = p.upvotes > p.downvotes;
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3 font-mono text-xs">
                      {p.proposer.slice(0, 6)}...{p.proposer.slice(-4)}
                    </td>
                    <td className="px-4 py-3">{p.title.slice(0, 60)}</td>
                    <td className="px-4 py-3">
                      {p.paid
                        ? "Đã thanh toán"
                        : expired
                        ? "Hết hạn"
                        : new Date(p.deadline * 1000).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 space-x-1">
                      <button
                        onClick={() => onVote(p.id, true)}
                        disabled={p.voted || expired || p.paid}
                        className="border border-green-600 text-green-600 text-xs px-3 py-1.5 rounded-full disabled:opacity-40"
                      >
                        Đồng ý ({p.upvotes})
                      </button>
                      <button
                        onClick={() => onVote(p.id, false)}
                        disabled={p.voted || expired || p.paid}
                        className="border border-red-600 text-red-600 text-xs px-3 py-1.5 rounded-full disabled:opacity-40"
                      >
                        Phản đối ({p.downvotes})
                      </button>
                      <button
                        onClick={() => onPay(p.id)}
                        disabled={p.paid || !expired || !passed}
                        className="border border-blue-600 text-blue-600 text-xs px-3 py-1.5 rounded-full disabled:opacity-40"
                      >
                        Thanh toán
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-green-50 border-t px-8 py-6">
        <div className="font-semibold text-lg">Thêm sức mạnh cho quỹ.</div>
        <div className="text-sm text-gray-600 mb-4">
          Cổ đông có quyền tạo đề xuất, biểu quyết và giải ngân.
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded px-3 py-2 w-32"
          />
          <span className="text-gray-600">ETH</span>
          <button
            onClick={onContribute}
            className="bg-green-800 text-white px-5 py-2 rounded"
          >
            Đóng góp ↗
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between mb-4">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                Raise Proposal
              </span>
              <button onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <input
              placeholder="0.005"
              type="number"
              step="0.001"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <input
              placeholder="0x... (beneficiary)"
              value={form.beneficiary}
              onChange={(e) =>
                setForm({ ...form, beneficiary: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3 font-mono text-sm"
            />
            <textarea
              placeholder="Description"
              rows={4}
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <button
              onClick={onCreate}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              SUBMIT PROPOSAL
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
}
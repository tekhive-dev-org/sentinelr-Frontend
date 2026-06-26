import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { parentalControlService } from "../services/parentalControlService";

// Material Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function TestParentalControls() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [members, setMembers] = useState([]);
  const [selectedUserIdState, setSelectedUserIdState] = useState("");
  const [selectedDeviceIdState, setSelectedDeviceIdState] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Form states for test inputs
  const [screenTimeLimit, setScreenTimeLimit] = useState(60);
  const [screenTimeEnabled, setScreenTimeEnabled] = useState(true);
  const [bedtimeEnabled, setBedtimeEnabled] = useState(true);
  const [bedtimeStart, setBedtimeStart] = useState("21:30");
  const [bedtimeEnd, setBedtimeEnd] = useState("07:00");
  const [appBlockingEnabled, setAppBlockingEnabled] = useState(true);
  const [blockedSiteUrl, setBlockedSiteUrl] = useState("example.com");
  const [blockedPackageName, setBlockedPackageName] = useState("com.android.chrome");
  const [blockAppToggle, setBlockAppToggle] = useState(true);
  const [categoryBlockName, setCategoryBlockName] = useState("Social");
  const [categoryBlockToggle, setCategoryBlockToggle] = useState(true);
  const [webFilteringEnabled, setWebFilteringEnabled] = useState(true);
  const [bonusTimeMinutes, setBonusTimeMinutes] = useState(30);
  const [activityLimit, setActivityLimit] = useState(10);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [appCategoryFilter, setAppCategoryFilter] = useState("Game");
  const [appSearchFilter, setAppSearchFilter] = useState("");

  // Custom Route Tester states
  const [customMethod, setCustomMethod] = useState("GET");
  const [customPath, setCustomPath] = useState("/parental-controls/members");
  const [customBody, setCustomBody] = useState("");
  const [executingCustom, setExecutingCustom] = useState(false);

  // Manual override states
  const [manualOverride, setManualOverride] = useState(false);
  const [manualUserId, setManualUserId] = useState("");
  const [manualDeviceId, setManualDeviceId] = useState("");

  // Mobile testing states
  const [mobileDeviceToken, setMobileDeviceToken] = useState("");
  const [mobileHeartbeatBattery, setMobileHeartbeatBattery] = useState(75);
  const [mobileHeartbeatCharging, setMobileHeartbeatCharging] = useState(false);
  const [mobileHeartbeatNetwork, setMobileHeartbeatNetwork] = useState("wifi");
  const [mobilePingLat, setMobilePingLat] = useState("40.7128");
  const [mobilePingLng, setMobilePingLng] = useState("-74.0060");
  const [mobilePingAccuracy, setMobilePingAccuracy] = useState(15);

  // Logs terminal state
  const [logs, setLogs] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load family members on mount
  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    addLog("system", "info", "Fetching family members...");
    try {
      const res = await parentalControlService.getMembers();
      setLoadingMembers(false);
      addLog("getMembers", "success", res);
      if (res.success && res.members?.length > 0) {
        setMembers(res.members);
        setSelectedUserIdState(String(res.members[0].userId));
        if (res.members[0].devices?.length > 0) {
          setSelectedDeviceIdState(String(res.members[0].devices[0].deviceId));
        }
      }
    } catch (err) {
      setLoadingMembers(false);
      addLog("getMembers", "error", err.message);
    }
  };

  // Helper to append logs
  const addLog = (apiName, type, data) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setLogs((prev) => [
      {
        id,
        timestamp: new Date().toLocaleTimeString(),
        apiName,
        type, // 'success' | 'error' | 'info'
        payload: data,
      },
      ...prev,
    ]);
    // Autoexpand new success/error payload
    if (type !== "info") {
      setExpandedLogId(id);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setExpandedLogId(null);
  };

  // Auto-update device selector when user changes
  const handleUserChange = (uId) => {
    setSelectedUserIdState(uId);
    const member = members.find((m) => String(m.userId) === uId);
    if (member && member.devices?.length > 0) {
      setSelectedDeviceIdState(String(member.devices[0].deviceId));
    } else {
      setSelectedDeviceIdState("");
    }
  };

  // Active references - resolved via manual override fallback
  const selectedUserId = manualOverride ? manualUserId : selectedUserIdState;
  const selectedDeviceId = manualOverride ? manualDeviceId : selectedDeviceIdState;

  const activeMember = members.find((m) => String(m.userId) === selectedUserIdState);
  const activeDevice = activeMember?.devices?.find((d) => String(d.deviceId) === selectedDeviceIdState);

  // API Call Handlers
  const testApi = async (name, callFn) => {
    addLog(name, "info", `Triggering ${name} API request...`);
    try {
      const res = await callFn();
      addLog(name, "success", res);
    } catch (err) {
      addLog(name, "error", err.message);
    }
  };

  const executeCustomRequest = async () => {
    if (!customPath.trim()) return;
    setExecutingCustom(true);
    addLog(`customRequest (${customMethod})`, "info", `Sending custom request to: ${customPath}`);
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${customPath}`;
      
      const config = {
        method: customMethod,
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
            "x-access-token": token,
          }),
        },
        ...(customBody.trim() && ["POST", "PUT", "PATCH", "DELETE"].includes(customMethod)
          ? { body: customBody }
          : {}),
      };

      const response = await fetch(url, config);
      const isJson = response.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await response.json() : await response.text();

      if (response.ok) {
        addLog(`customRequest (${customMethod})`, "success", {
          status: response.status,
          response: data
        });
      } else {
        addLog(`customRequest (${customMethod})`, "error", {
          status: response.status,
          error: data
        });
      }
    } catch (err) {
      addLog(`customRequest (${customMethod})`, "error", err.message);
    } finally {
      setExecutingCustom(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#3d09d0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Go to Dashboard"
          >
            <ArrowBackIcon />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Parental Controls API Tester</h1>
            <p className="text-xs text-gray-400 mt-0.5">Interactive sandbox for Sentinelr APIs</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">Authenticated as: <strong className="text-[#3d09d0]">{user.email}</strong></span>
          <button
            onClick={fetchMembers}
            disabled={loadingMembers}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-xs font-semibold rounded-lg border border-gray-700 transition"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${loadingMembers ? 'animate-spin' : ''}`} />
            Refresh Members
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left column: Selectors & Console Logs */}
        <section className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-gray-800 p-5 flex flex-col gap-4 flex-shrink-0 bg-gray-900/50">
          {/* Member & Device Selectors */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Target Reference</h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  id="manualOverrideCheckbox"
                  checked={manualOverride}
                  onChange={(e) => setManualOverride(e.target.checked)}
                  className="rounded text-[#3d09d0] focus:ring-0 w-3.5 h-3.5 bg-gray-950 border-gray-800 cursor-pointer"
                />
                <label htmlFor="manualOverrideCheckbox" className="text-[11px] text-gray-400 font-semibold cursor-pointer select-none">
                  Manual ID Override
                </label>
              </div>

              {!manualOverride ? (
                <>
                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">Select Family Member</label>
                    <select
                      value={selectedUserIdState}
                      onChange={(e) => handleUserChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-955 border border-gray-800 rounded-lg text-sm focus:border-[#3d09d0] focus:ring-1 focus:ring-[#3d09d0] outline-none text-white font-medium"
                    >
                      {members.length === 0 && <option>No members found</option>}
                      {members.map((m) => (
                        <option key={m.userId} value={String(m.userId)}>
                          {m.name} (ID: {m.userId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">Select Child Device</label>
                    <select
                      value={selectedDeviceIdState}
                      onChange={(e) => setSelectedDeviceIdState(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-955 border border-gray-800 rounded-lg text-sm focus:border-[#3d09d0] focus:ring-1 focus:ring-[#3d09d0] outline-none text-white font-medium"
                      disabled={!activeMember || activeMember.devices?.length === 0}
                    >
                      {!activeMember || activeMember.devices?.length === 0 ? (
                        <option>No paired devices</option>
                      ) : (
                        activeMember.devices.map((d) => (
                          <option key={d.deviceId} value={String(d.deviceId)}>
                            {d.name} (ID: {d.deviceId})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">Child User ID</label>
                    <input
                      type="text"
                      value={manualUserId}
                      onChange={(e) => setManualUserId(e.target.value)}
                      placeholder="e.g., 2"
                      className="w-full px-3 py-2 bg-gray-955 border border-gray-800 rounded-lg text-sm focus:border-[#3d09d0] focus:ring-1 focus:ring-[#3d09d0] outline-none text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">Child Device ID</label>
                    <input
                      type="text"
                      value={manualDeviceId}
                      onChange={(e) => setManualDeviceId(e.target.value)}
                      placeholder="e.g., dev_001"
                      className="w-full px-3 py-2 bg-gray-955 border border-gray-800 rounded-lg text-sm focus:border-[#3d09d0] focus:ring-1 focus:ring-[#3d09d0] outline-none text-white font-medium"
                    />
                  </div>
                </>
              )}

              <div className="border-t border-gray-800 pt-3 mt-1">
                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Device Token (Mobile API)</label>
                <input
                  type="text"
                  value={mobileDeviceToken}
                  onChange={(e) => setMobileDeviceToken(e.target.value)}
                  placeholder="Paste mobile JWT token"
                  className="w-full px-3 py-2 bg-gray-955 border border-gray-800 rounded-lg text-sm focus:border-[#3d09d0] focus:ring-1 focus:ring-[#3d09d0] outline-none text-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* On-Screen Console */}
          <div className="flex-1 flex flex-col min-h-[300px] bg-black border border-gray-800 rounded-xl overflow-hidden shadow-inner font-mono text-xs">
            <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Response Terminal</span>
              <button
                onClick={clearLogs}
                className="text-[10px] text-[#dc323f] hover:text-[#dc323f] font-semibold transition"
              >
                Clear Console
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="text-gray-600 italic text-center mt-8">Console idle. Trigger an API test...</div>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <div
                      key={log.id}
                      className={`border-l-2 pl-3 py-0.5 ${
                        log.type === "success"
                          ? "border-[#e6ae12]"
                          : log.type === "error"
                          ? "border-rose-500"
                          : "border-[#3d09d0]"
                      }`}
                    >
                      <div
                        className="flex justify-between items-start cursor-pointer hover:bg-gray-900/40 p-1 rounded transition"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      >
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                          {log.type === "success" && <CheckCircleIcon className="w-3.5 h-3.5 text-[#e6ae12]" />}
                          {log.type === "error" && <ErrorIcon className="w-3.5 h-3.5 text-rose-500" />}
                          {log.type === "info" && <span className="w-2 h-2 rounded-full bg-[#3d09d0] animate-pulse"></span>}
                          
                          <span className="font-semibold text-gray-300 truncate">{log.apiName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                          <span>{log.timestamp}</span>
                          {log.type !== "info" && (
                            isExpanded ? <KeyboardArrowUpIcon className="w-3.5 h-3.5" /> : <KeyboardArrowDownIcon className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                      
                      {isExpanded && log.type !== "info" && (
                        <pre className="mt-2 p-2 bg-gray-950 border border-gray-900 rounded overflow-x-auto text-[10px] text-gray-400 max-h-[220px]">
                          {typeof log.payload === "object"
                            ? JSON.stringify(log.payload, null, 2)
                            : log.payload}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Right column: API Test Cards grid */}
        <section className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
          {/* Card: Custom Route Tester */}
          <div className="col-span-1 md:col-span-2 xl:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">Custom API Route Tester (Diagnostic)</h4>
                <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-900 font-bold px-2 py-0.5 rounded-full uppercase">DIAGNOSTIC</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Execute raw HTTP requests directly to the staging backend. Handy for identifying the exact route parameters.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-semibold mb-1">Method</label>
                  <select
                    value={customMethod}
                    onChange={(e) => setCustomMethod(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs focus:border-[#3d09d0] outline-none text-white font-medium"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] text-gray-400 font-semibold mb-1">Path (e.g. /parental-controls/2/freeze)</label>
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="/parental-controls/2/freeze"
                    className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs focus:border-[#3d09d0] outline-none text-white font-medium"
                  />
                </div>
              </div>

              {["POST", "PUT", "PATCH", "DELETE"].includes(customMethod) && (
                <div className="mb-4">
                  <label className="block text-[10px] text-gray-400 font-semibold mb-1">Request Body (JSON)</label>
                  <textarea
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    placeholder='{ "deviceId": "dev_001" }'
                    rows={3}
                    className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs focus:border-[#3d09d0] outline-none text-white font-mono"
                  />
                </div>
              )}
            </div>

            <button
              onClick={executeCustomRequest}
              disabled={executingCustom || !customPath.trim()}
              className="w-full flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95 shadow"
            >
              <PlayArrowIcon className="w-4 h-4" /> {executingCustom ? "Executing..." : "Run Request"}
            </button>
          </div>

          {/* Card 1: Members */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">getMembers()</h4>
                <span className="text-[10px] bg-[#f5f1ff] text-[#3d09d0] border border-[#3d09d0] font-bold px-2 py-0.5 rounded-full uppercase">GET</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Fetch the family member profiles paired with devices.</p>
            </div>
            <button
              onClick={() => testApi("getMembers", () => parentalControlService.getMembers())}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Trigger Test
            </button>
          </div>

          {/* Card 2: Get Device Status */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">getDeviceStatus()</h4>
                <span className="text-[10px] bg-[#f5f1ff] text-[#3d09d0] border border-[#3d09d0] font-bold px-2 py-0.5 rounded-full uppercase">GET</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Fetch full device status summary (screen limits, blocking, bedtime details).</p>
            </div>
            <button
              onClick={() =>
                testApi("getDeviceStatus", () =>
                  parentalControlService.getDeviceStatus(selectedUserId, selectedDeviceId)
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 disabled:pointer-events-none text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Trigger Test
            </button>
          </div>

          {/* Card 3: Get Controls */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">getControls()</h4>
                <span className="text-[10px] bg-[#f5f1ff] text-[#3d09d0] border border-[#3d09d0] font-bold px-2 py-0.5 rounded-full uppercase">GET</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Fetch direct monitoring rules configured for the device.</p>
            </div>
            <button
              onClick={() =>
                testApi("getControls", () =>
                  parentalControlService.getControls(selectedUserId, selectedDeviceId)
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 disabled:pointer-events-none text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Trigger Test
            </button>
          </div>

          {/* Card 4: Freeze/Pause Device */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">Freeze / Unfreeze</h4>
                <span className="text-[10px] bg-[#fff8e8] text-[#b98b0e] border border-[#e6ae12] font-bold px-2 py-0.5 rounded-full uppercase">POST</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Instantly freeze (Quick Pause) or restore access to the child's device.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  testApi("freezeDevice", () =>
                    parentalControlService.freezeDevice(selectedUserId, selectedDeviceId)
                  )
                }
                disabled={!selectedUserId || !selectedDeviceId}
                className="flex-1 bg-red-600 hover:bg-[#dc323f] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
              >
                Freeze
              </button>
              <button
                onClick={() =>
                  testApi("unfreezeDevice", () =>
                    parentalControlService.unfreezeDevice(selectedUserId, selectedDeviceId)
                  )
                }
                disabled={!selectedUserId || !selectedDeviceId}
                className="flex-1 bg-[#e6ae12] hover:bg-[#e6ae12] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
              >
                Unfreeze
              </button>
            </div>
          </div>

          {/* Card 5: Screen Time Limits */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">updateScreenTime()</h4>
                <span className="text-[10px] bg-orange-950 text-orange-400 border border-orange-900 font-bold px-2 py-0.5 rounded-full uppercase">PUT</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Adjust daily limits and schedule.</p>
              
              <div className="space-y-2 mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">Enabled</span>
                  <input
                    type="checkbox"
                    checked={screenTimeEnabled}
                    onChange={(e) => setScreenTimeEnabled(e.target.checked)}
                    className="rounded text-[#3d09d0] focus:ring-0 w-4 h-4 bg-gray-900 border-gray-800 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Daily Limit (minutes)</label>
                  <input
                    type="number"
                    value={screenTimeLimit}
                    onChange={(e) => setScreenTimeLimit(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                testApi("updateScreenTime", () =>
                  parentalControlService.updateScreenTime(selectedUserId, selectedDeviceId, {
                    enabled: screenTimeEnabled,
                    dailyLimit: screenTimeLimit,
                    schedule: { weekdays: screenTimeLimit, weekends: screenTimeLimit + 60 },
                  })
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Save Screen Time
            </button>
          </div>

          {/* Card 6: Bedtime Settings */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">updateBedtime()</h4>
                <span className="text-[10px] bg-orange-950 text-orange-400 border border-orange-900 font-bold px-2 py-0.5 rounded-full uppercase">PUT</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Control sleep schedules restricting device usage at night.</p>
              
              <div className="space-y-2 mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">Enabled</span>
                  <input
                    type="checkbox"
                    checked={bedtimeEnabled}
                    onChange={(e) => setBedtimeEnabled(e.target.checked)}
                    className="rounded text-[#3d09d0] focus:ring-0 w-4 h-4 bg-gray-900 border-gray-800 cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-0.5">Start Time</label>
                    <input
                      type="text"
                      value={bedtimeStart}
                      onChange={(e) => setBedtimeStart(e.target.value)}
                      placeholder="21:30"
                      className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-0.5">End Time</label>
                    <input
                      type="text"
                      value={bedtimeEnd}
                      onChange={(e) => setBedtimeEnd(e.target.value)}
                      placeholder="07:00"
                      className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                testApi("updateBedtime", () =>
                  parentalControlService.updateBedtime(selectedUserId, selectedDeviceId, {
                    enabled: bedtimeEnabled,
                    startTime: bedtimeStart,
                    endTime: bedtimeEnd,
                  })
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Save Bedtime
            </button>
          </div>

          {/* Card 7: Grant Bonus Time */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">grantBonusTime()</h4>
                <span className="text-[10px] bg-[#fff8e8] text-[#b98b0e] border border-[#e6ae12] font-bold px-2 py-0.5 rounded-full uppercase">POST</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Add supplementary screen time minutes outside standard rules.</p>
              
              <div className="mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <label className="block text-[10px] text-gray-400 mb-0.5">Bonus Minutes</label>
                <input
                  type="number"
                  value={bonusTimeMinutes}
                  onChange={(e) => setBonusTimeMinutes(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                />
              </div>
            </div>
            <button
              onClick={() =>
                testApi("grantBonusTime", () =>
                  parentalControlService.grantBonusTime(selectedUserId, selectedDeviceId, bonusTimeMinutes)
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Add Bonus Time
            </button>
          </div>

          {/* Card 8: App Blocking Configuration */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">updateAppBlocking()</h4>
                <span className="text-[10px] bg-orange-950 text-orange-400 border border-orange-900 font-bold px-2 py-0.5 rounded-full uppercase">PUT</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Adjust primary app blocking toggle switch.</p>
              
              <div className="mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850 flex justify-between items-center">
                <span className="text-[11px] text-gray-400">Enable Blocking System</span>
                <input
                  type="checkbox"
                  checked={appBlockingEnabled}
                  onChange={(e) => setAppBlockingEnabled(e.target.checked)}
                  className="rounded text-[#3d09d0] focus:ring-0 w-4 h-4 bg-gray-900 border-gray-800 cursor-pointer"
                />
              </div>
            </div>
            <button
              onClick={() =>
                testApi("updateAppBlocking", () =>
                  parentalControlService.updateAppBlocking(selectedUserId, selectedDeviceId, {
                    enabled: appBlockingEnabled,
                  })
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Save App Blocking
            </button>
          </div>

          {/* Card 9: Block Specific App */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">toggleAppBlock()</h4>
                <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">PATCH</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Lock or unlock specific mobile app package.</p>
              
              <div className="space-y-2 mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">App Package Name</label>
                  <input
                    type="text"
                    value={blockedPackageName}
                    onChange={(e) => setBlockedPackageName(e.target.value)}
                    placeholder="com.instagram.android"
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">Block Status</span>
                  <select
                    value={blockAppToggle ? "block" : "unblock"}
                    onChange={(e) => setBlockAppToggle(e.target.value === "block")}
                    className="px-2 py-0.5 bg-gray-900 border border-gray-850 rounded text-xs text-white"
                  >
                    <option value="block">Blocked</option>
                    <option value="unblock">Allowed</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                testApi("toggleAppBlock", () =>
                  parentalControlService.toggleAppBlock(
                    selectedUserId,
                    selectedDeviceId,
                    blockedPackageName,
                    blockAppToggle
                  )
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Toggle App Rule
            </button>
          </div>

          {/* Card 10: Toggle Category Block */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">toggleCategoryBlock()</h4>
                <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">PATCH</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Manage entire app category blocks (e.g. Social, Games).</p>
              
              <div className="space-y-2 mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Category Name</label>
                  <input
                    type="text"
                    value={categoryBlockName}
                    onChange={(e) => setCategoryBlockName(e.target.value)}
                    placeholder="Social"
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">Block Category</span>
                  <input
                    type="checkbox"
                    checked={categoryBlockToggle}
                    onChange={(e) => setCategoryBlockToggle(e.target.checked)}
                    className="rounded text-[#3d09d0] focus:ring-0 w-4 h-4 bg-gray-900 border-gray-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                testApi("toggleCategoryBlock", () =>
                  parentalControlService.toggleCategoryBlock(
                    selectedUserId,
                    selectedDeviceId,
                    categoryBlockName,
                    categoryBlockToggle
                  )
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Toggle Category Block
            </button>
          </div>

          {/* Card 11: Web Filtering Toggle */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">updateWebFiltering()</h4>
                <span className="text-[10px] bg-orange-950 text-orange-400 border border-orange-900 font-bold px-2 py-0.5 rounded-full uppercase">PUT</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Adjust primary web filters and SafeSearch settings.</p>
              
              <div className="space-y-2 mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">Enable Web Filtering</span>
                  <input
                    type="checkbox"
                    checked={webFilteringEnabled}
                    onChange={(e) => setWebFilteringEnabled(e.target.checked)}
                    className="rounded text-[#3d09d0] focus:ring-0 w-4 h-4 bg-gray-900 border-gray-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                testApi("updateWebFiltering", () =>
                  parentalControlService.updateWebFiltering(selectedUserId, selectedDeviceId, {
                    enabled: webFilteringEnabled,
                    safeSearchEnabled: webFilteringEnabled,
                  })
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Save Web Filters
            </button>
          </div>

          {/* Card 12: Block/Unblock Website */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">Manage Site Filter</h4>
                <span className="text-[10px] bg-[#fff8e8] text-[#b98b0e] border border-[#e6ae12] font-bold px-2 py-0.5 rounded-full uppercase">POST/DEL</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Add or remove specific URL from child web filter block list.</p>
              
              <div className="mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <label className="block text-[10px] text-gray-400 mb-0.5">Website Domain URL</label>
                <input
                  type="text"
                  value={blockedSiteUrl}
                  onChange={(e) => setBlockedSiteUrl(e.target.value)}
                  placeholder="tiktok.com"
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  testApi("addBlockedSite", () =>
                    parentalControlService.addBlockedSite(selectedUserId, selectedDeviceId, blockedSiteUrl)
                  )
                }
                disabled={!selectedUserId || !selectedDeviceId}
                className="flex-1 bg-red-600 hover:bg-[#dc323f] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
              >
                Block Site
              </button>
              <button
                onClick={() =>
                  testApi("removeBlockedSite", () =>
                    parentalControlService.removeBlockedSite(selectedUserId, selectedDeviceId, blockedSiteUrl)
                  )
                }
                disabled={!selectedUserId || !selectedDeviceId}
                className="flex-1 bg-[#e6ae12] hover:bg-[#e6ae12] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
              >
                Unblock Site
              </button>
            </div>
          </div>

          {/* Card 13: Get Activity Feed */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">getActivity()</h4>
                <span className="text-[10px] bg-[#f5f1ff] text-[#3d09d0] border border-[#3d09d0] font-bold px-2 py-0.5 rounded-full uppercase">GET</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Fetch recent control logs, alerts, and system activities.</p>
              
              <div className="mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <label className="block text-[10px] text-gray-400 mb-0.5">Logs Count Limit</label>
                <input
                  type="number"
                  value={activityLimit}
                  onChange={(e) => setActivityLimit(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                />
              </div>
            </div>
            <button
              onClick={() =>
                testApi("getActivity", () =>
                  parentalControlService.getActivity(selectedUserId, selectedDeviceId, activityLimit)
                )
              }
              disabled={!selectedUserId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Fetch Logs
            </button>
          </div>

          {/* Card 14: Toggle Active Monitoring */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">toggleMonitoring()</h4>
                <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">PATCH</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Toggle live parent tracking and monitoring hooks on child device.</p>
              
              <div className="mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850 flex justify-between items-center">
                <span className="text-[11px] text-gray-400">Monitoring Active</span>
                <input
                  type="checkbox"
                  checked={monitoringEnabled}
                  onChange={(e) => setMonitoringEnabled(e.target.checked)}
                  className="rounded text-[#3d09d0] focus:ring-0 w-4 h-4 bg-gray-900 border-gray-800 cursor-pointer"
                />
              </div>
            </div>
            <button
              onClick={() =>
                testApi("toggleMonitoring", () =>
                  parentalControlService.toggleMonitoring(
                    selectedUserId,
                    monitoringEnabled,
                    selectedDeviceId
                  )
                )
              }
              disabled={!selectedUserId || !selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Toggle Monitoring
            </button>
          </div>

          {/* Card 15: Get Installed Apps list */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">getInstalledApps()</h4>
                <span className="text-[10px] bg-[#f5f1ff] text-[#3d09d0] border border-[#3d09d0] font-bold px-2 py-0.5 rounded-full uppercase">GET</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">List all applications installed on the client mobile device.</p>
              
              <div className="space-y-2 mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Filter Category</label>
                  <input
                    type="text"
                    value={appCategoryFilter}
                    onChange={(e) => setAppCategoryFilter(e.target.value)}
                    placeholder="Game"
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Filter Search Name</label>
                  <input
                    type="text"
                    value={appSearchFilter}
                    onChange={(e) => setAppSearchFilter(e.target.value)}
                    placeholder="Google"
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                testApi("getInstalledApps", () =>
                  parentalControlService.getInstalledApps(selectedDeviceId, {
                    category: appCategoryFilter,
                    search: appSearchFilter,
                  })
                )
              }
              disabled={!selectedDeviceId}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Fetch Apps List
            </button>
          </div>

          {/* Header: Mobile Device API Tests */}
          <div className="col-span-1 md:col-span-2 xl:col-span-3 border-t border-gray-800 pt-6 mt-4">
            <h3 className="text-base font-bold text-white mb-1">Mobile Device API Tests (Child Device simulation)</h3>
            <p className="text-xs text-gray-400">Test endpoints called from the mobile app. These require a valid Device Token.</p>
          </div>

          {/* Card: Mobile status */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">getParentalStatus()</h4>
                <span className="text-[10px] bg-[#f5f1ff] text-[#3d09d0] border border-[#3d09d0] font-bold px-2 py-0.5 rounded-full uppercase">GET</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Fetch read-only controls configuration for this device.</p>
            </div>
            <button
              onClick={() =>
                testApi("getMobileDeviceStatus", () =>
                  parentalControlService.getMobileDeviceStatus(mobileDeviceToken)
                )
              }
              disabled={!mobileDeviceToken}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Fetch Mobile Status
            </button>
          </div>

          {/* Card: Mobile activity */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">getParentalActivity()</h4>
                <span className="text-[10px] bg-[#f5f1ff] text-[#3d09d0] border border-[#3d09d0] font-bold px-2 py-0.5 rounded-full uppercase">GET</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Fetch recent parental control logs for the child device.</p>
            </div>
            <button
              onClick={() =>
                testApi("getMobileDeviceActivity", () =>
                  parentalControlService.getMobileDeviceActivity(mobileDeviceToken, activityLimit)
                )
              }
              disabled={!mobileDeviceToken}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Fetch Mobile Activity
            </button>
          </div>

          {/* Card: Send Mobile Heartbeat */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">sendMobileHeartbeat()</h4>
                <span className="text-[10px] bg-[#fff8e8] text-[#b98b0e] border border-[#e6ae12] font-bold px-2 py-0.5 rounded-full uppercase">POST</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Send periodic heartbeat reporting battery and network status.</p>
              
              <div className="space-y-2 mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-0.5">Battery %</label>
                    <input
                      type="number"
                      value={mobileHeartbeatBattery}
                      onChange={(e) => setMobileHeartbeatBattery(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-0.5">Network</label>
                    <select
                      value={mobileHeartbeatNetwork}
                      onChange={(e) => setMobileHeartbeatNetwork(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                    >
                      <option value="wifi">Wifi</option>
                      <option value="cellular">Cellular</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">Is Charging</span>
                  <input
                    type="checkbox"
                    checked={mobileHeartbeatCharging}
                    onChange={(e) => setMobileHeartbeatCharging(e.target.checked)}
                    className="rounded text-[#3d09d0] focus:ring-0 w-4 h-4 bg-gray-900 border-gray-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                testApi("sendMobileHeartbeat", () =>
                  parentalControlService.sendMobileHeartbeat(mobileDeviceToken, {
                    battery_level: mobileHeartbeatBattery,
                    is_charging: mobileHeartbeatCharging,
                    network_type: mobileHeartbeatNetwork,
                    app_version: "1.0.0"
                  })
                )
              }
              disabled={!mobileDeviceToken}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Send Heartbeat
            </button>
          </div>

          {/* Card: Send Location Ping */}
          <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">sendMobilePing()</h4>
                <span className="text-[10px] bg-[#fff8e8] text-[#b98b0e] border border-[#e6ae12] font-bold px-2 py-0.5 rounded-full uppercase">POST</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Upload periodic GPS coordinates representing the child's location.</p>
              
              <div className="space-y-2 mb-4 bg-gray-950 p-2.5 rounded-lg border border-gray-850">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-0.5">Latitude</label>
                    <input
                      type="text"
                      value={mobilePingLat}
                      onChange={(e) => setMobilePingLat(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-0.5">Longitude</label>
                    <input
                      type="text"
                      value={mobilePingLng}
                      onChange={(e) => setMobilePingLng(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Accuracy (meters)</label>
                  <input
                    type="number"
                    value={mobilePingAccuracy}
                    onChange={(e) => setMobilePingAccuracy(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                testApi("sendMobilePing", () =>
                  parentalControlService.sendMobilePing(mobileDeviceToken, {
                    latitude: Number(mobilePingLat),
                    longitude: Number(mobilePingLng),
                    accuracy: mobilePingAccuracy,
                    timestamp: new Date().toISOString()
                  })
                )
              }
              disabled={!mobileDeviceToken}
              className="w-full flex items-center justify-center gap-1 bg-[#3d09d0] hover:bg-[#3d09d0] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition active:scale-95"
            >
              <PlayArrowIcon className="w-4 h-4" /> Upload Ping
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

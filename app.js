const SUPABASE_URL = "https://bwlcnaruyjazaxyiiumd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bGhQso88Ml6VEpX4reo8QQ_VjwL7yND";

// This is a static GitHub Pages frontend. The Supabase publishable/anon key is safe
// only when RLS policies protect profiles, attempts, and favorites. Never add a
// service_role key, database password, JWT secret, or private key here.

const els = {
  userStatus: document.querySelector("#userStatus"),
  logoutButton: document.querySelector("#logoutButton"),
  authHeading: document.querySelector("#authHeading"),
  authMessage: document.querySelector("#authMessage"),
  guestActions: document.querySelector("#guestActions"),
  showLogin: document.querySelector("#showLogin"),
  showSignup: document.querySelector("#showSignup"),
  continueGuest: document.querySelector("#continueGuest"),
  authForm: document.querySelector("#authForm"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  authSubmit: document.querySelector("#authSubmit"),
  authCancel: document.querySelector("#authCancel"),
  adminCard: document.querySelector("#adminCard"),
  adminDashboard: document.querySelector("#adminDashboard"),
  refreshAdmin: document.querySelector("#refreshAdmin"),
  exportCsv: document.querySelector("#exportCsv"),
  totalStudents: document.querySelector("#totalStudents"),
  totalAttempts: document.querySelector("#totalAttempts"),
  amcBmoAttempts: document.querySelector("#amcBmoAttempts"),
  necAttempts: document.querySelector("#necAttempts"),
  averageAccuracy: document.querySelector("#averageAccuracy"),
  activeUsers: document.querySelector("#activeUsers"),
  contestFilter: document.querySelector("#contestFilter"),
  studentFilter: document.querySelector("#studentFilter"),
  topicFilter: document.querySelector("#topicFilter"),
  yearFilter: document.querySelector("#yearFilter"),
  dateFrom: document.querySelector("#dateFrom"),
  dateTo: document.querySelector("#dateTo"),
  studentTableTitle: document.querySelector("#studentTableTitle"),
  attemptTableTitle: document.querySelector("#attemptTableTitle"),
  studentRows: document.querySelector("#studentRows"),
  attemptRows: document.querySelector("#attemptRows"),
};

const state = {
  supabase: window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }),
  user: null,
  profile: null,
  authAction: "login",
  adminData: { profiles: [], attempts: [] },
};

function option(select, value, label) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = label;
  select.appendChild(node);
}

function fillSelect(select, rows, allLabel) {
  select.innerHTML = "";
  option(select, "all", allLabel);
  for (const [value, label] of rows) option(select, value, label);
}

function percent(correct, total) {
  return total ? `${Math.round((correct / total) * 100)}%` : "0%";
}

function dateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isAdmin() {
  return state.profile?.role === "admin";
}

function displayName(profile = state.profile) {
  return profile?.display_name || profile?.email || "Student";
}

async function loadProfile(user) {
  const { data, error } = await state.supabase
    .from("profiles")
    .select("id,email,display_name,role,created_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data || {
    id: user.id,
    email: user.email,
    display_name: user.email?.split("@")[0] || "Student",
    role: "student",
  };
}

function renderAuth() {
  const signedIn = Boolean(state.user);
  if (signedIn) {
    els.userStatus.textContent = `${displayName()} · ${state.profile?.email || state.user.email} · ${state.profile?.role || "student"}`;
    els.authHeading.textContent = "已登录 / Signed in";
    els.authMessage.textContent = "进入 AMC/BMO 或 NEC 时会继续使用当前 Supabase 会话，云端记录会写入同一个项目。";
  } else {
    els.userStatus.textContent = "未登录 / Not signed in";
    els.authHeading.textContent = "统一登录中心";
    els.authMessage.textContent = "游客可以进入平台，但练习记录只保存在本机。登录后跨 AMC/BMO 与 NEC 共用同一个账号。";
  }
  els.logoutButton.classList.toggle("is-hidden", !signedIn);
  els.guestActions.classList.toggle("is-hidden", signedIn);
  els.adminCard.classList.toggle("is-hidden", !isAdmin());
  if (!isAdmin()) els.adminDashboard.classList.add("is-hidden");
}

function openAuthForm(action) {
  state.authAction = action;
  els.authForm.classList.remove("is-hidden");
  els.authSubmit.textContent = action === "signup" ? "注册 / Sign up" : "登录 / Login";
  els.authMessage.textContent = action === "signup"
    ? "创建账号后，如果 Supabase 开启邮件验证，请先完成邮箱验证。"
    : "请输入邮箱和密码登录。";
  els.authEmail.focus();
}

function closeAuthForm() {
  els.authForm.classList.add("is-hidden");
  els.authPassword.value = "";
  renderAuth();
}

async function submitAuth(event) {
  event.preventDefault();
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value;
  if (!email || !password) {
    els.authMessage.textContent = "请输入邮箱和密码 / Please enter email and password.";
    return;
  }
  els.authMessage.textContent = "处理中... / Working...";
  const result = state.authAction === "signup"
    ? await state.supabase.auth.signUp({ email, password })
    : await state.supabase.auth.signInWithPassword({ email, password });
  if (result.error) {
    els.authMessage.textContent = result.error.message;
    return;
  }
  closeAuthForm();
}

async function applySession(session) {
  state.user = session?.user || null;
  state.profile = state.user ? await loadProfile(state.user) : null;
  renderAuth();
}

async function logout() {
  await state.supabase.auth.signOut();
  state.user = null;
  state.profile = null;
  state.adminData = { profiles: [], attempts: [] };
  renderAuth();
}

function profileFor(userId) {
  return state.adminData.profiles.find((profile) => profile.id === userId) || {};
}

function filteredAttempts() {
  const contest = els.contestFilter.value;
  const student = els.studentFilter.value;
  const topic = els.topicFilter.value;
  const year = els.yearFilter.value;
  const from = els.dateFrom.value ? new Date(`${els.dateFrom.value}T00:00:00`) : null;
  const to = els.dateTo.value ? new Date(`${els.dateTo.value}T23:59:59`) : null;
  return state.adminData.attempts.filter((attempt) => {
    if (contest !== "all" && attempt.contest_type !== contest) return false;
    if (student !== "all" && attempt.user_id !== student) return false;
    if (topic !== "all" && attempt.topic !== topic) return false;
    if (year !== "all" && String(attempt.year || "") !== year) return false;
    const submitted = attempt.submitted_at ? new Date(attempt.submitted_at) : null;
    if (from && submitted && submitted < from) return false;
    if (to && submitted && submitted > to) return false;
    return true;
  });
}

function setupAdminFilters() {
  fillSelect(els.contestFilter, [["AMC", "AMC"], ["BMO", "BMO"], ["NEC", "NEC"]], "全部竞赛 / All");
  fillSelect(
    els.studentFilter,
    state.adminData.profiles
      .slice()
      .sort((a, b) => String(a.email || "").localeCompare(String(b.email || "")))
      .map((profile) => [profile.id, `${displayName(profile)} · ${profile.email || ""}`]),
    "全部学生 / All Students"
  );
  const unique = (key) => [...new Set(state.adminData.attempts.map((row) => row[key]).filter(Boolean))];
  fillSelect(els.topicFilter, unique("topic").sort().map((topic) => [topic, topic]), "全部知识点 / All Topics");
  fillSelect(els.yearFilter, unique("year").sort((a, b) => b - a).map((year) => [String(year), String(year)]), "全部年份 / All Years");
}

function renderAdmin() {
  const attempts = filteredAttempts();
  const correct = attempts.filter((attempt) => attempt.is_correct).length;
  const amcBmo = attempts.filter((attempt) => attempt.contest_type === "AMC" || attempt.contest_type === "BMO").length;
  const nec = attempts.filter((attempt) => attempt.contest_type === "NEC").length;
  const activeSince = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const active = new Set(attempts.filter((attempt) => new Date(attempt.submitted_at).getTime() >= activeSince).map((attempt) => attempt.user_id));
  els.totalStudents.textContent = String(state.adminData.profiles.length);
  els.totalAttempts.textContent = String(attempts.length);
  els.amcBmoAttempts.textContent = String(amcBmo);
  els.necAttempts.textContent = String(nec);
  els.averageAccuracy.textContent = percent(correct, attempts.length);
  els.activeUsers.textContent = String(active.size);

  const byStudent = new Map(state.adminData.profiles.map((profile) => [profile.id, { profile, total: 0, amcBmo: 0, nec: 0, correct: 0, lastActive: "" }]));
  for (const attempt of attempts) {
    const row = byStudent.get(attempt.user_id) || { profile: profileFor(attempt.user_id), total: 0, amcBmo: 0, nec: 0, correct: 0, lastActive: "" };
    row.total += 1;
    if (attempt.contest_type === "NEC") row.nec += 1;
    if (attempt.contest_type === "AMC" || attempt.contest_type === "BMO") row.amcBmo += 1;
    if (attempt.is_correct) row.correct += 1;
    if (String(attempt.submitted_at || "") > String(row.lastActive || "")) row.lastActive = attempt.submitted_at;
    byStudent.set(attempt.user_id, row);
  }
  const studentRows = [...byStudent.values()].sort((a, b) => b.total - a.total);
  els.studentTableTitle.textContent = `${studentRows.length} students`;
  els.studentRows.innerHTML = studentRows.map((row) => `
    <tr>
      <td>${displayName(row.profile)}</td>
      <td>${row.profile.email || "-"}</td>
      <td>${row.total}</td>
      <td>${row.amcBmo}</td>
      <td>${row.nec}</td>
      <td>${row.correct}</td>
      <td>${percent(row.correct, row.total)}</td>
      <td>${dateTime(row.lastActive)}</td>
    </tr>
  `).join("") || '<tr><td colspan="8">暂无学生数据 / No student data</td></tr>';

  const recent = attempts.slice().sort((a, b) => String(b.submitted_at || "").localeCompare(String(a.submitted_at || "")));
  els.attemptTableTitle.textContent = `${recent.length} attempts`;
  els.attemptRows.innerHTML = recent.slice(0, 500).map((attempt) => {
    const profile = profileFor(attempt.user_id);
    return `
      <tr>
        <td>${displayName(profile)}</td>
        <td>${attempt.contest_type || "-"}</td>
        <td>${attempt.problem_id || "-"}</td>
        <td>${attempt.topic || "-"}</td>
        <td>${attempt.selected_answer || "-"}</td>
        <td>${attempt.correct_answer || "-"}</td>
        <td>${attempt.is_correct ? "正确 / Correct" : "错误 / Wrong"}</td>
        <td>${dateTime(attempt.submitted_at)}</td>
      </tr>
    `;
  }).join("") || '<tr><td colspan="8">暂无作答数据 / No attempts</td></tr>';
}

async function fetchAll(table, select, orderColumn) {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    let query = state.supabase.from(table).select(select).range(from, from + pageSize - 1);
    if (orderColumn) query = query.order(orderColumn, { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function loadAdmin() {
  if (!isAdmin()) return;
  els.adminDashboard.classList.remove("is-hidden");
  els.authMessage.textContent = "正在加载管理员数据... / Loading admin data...";
  const [profiles, attempts] = await Promise.all([
    fetchAll("profiles", "id,email,display_name,role,created_at", "created_at"),
    fetchAll("attempts", "id,user_id,problem_id,contest_type,platform,source_url,exam_id,year,level,form,number,topic,difficulty,selected_answer,correct_answer,is_correct,time_spent_seconds,mode,submitted_at", "submitted_at"),
  ]);
  state.adminData = { profiles, attempts };
  setupAdminFilters();
  renderAdmin();
  els.authMessage.textContent = `已加载 ${attempts.length} 条综合作答记录 / Loaded ${attempts.length} combined attempts.`;
}

function exportCsv() {
  const rows = filteredAttempts();
  const headers = ["student_email", "student_name", "contest_type", "problem_id", "topic", "selected_answer", "correct_answer", "is_correct", "platform", "source_url", "submitted_at"];
  const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((attempt) => {
      const profile = profileFor(attempt.user_id);
      return [profile.email, displayName(profile), attempt.contest_type, attempt.problem_id, attempt.topic, attempt.selected_answer, attempt.correct_answer, attempt.is_correct, attempt.platform, attempt.source_url, attempt.submitted_at].map(cell).join(",");
    }),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `szzx-contest-attempts-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  els.showLogin.addEventListener("click", () => openAuthForm("login"));
  els.showSignup.addEventListener("click", () => openAuthForm("signup"));
  els.continueGuest.addEventListener("click", () => {
    els.authMessage.textContent = "游客模式：进入平台后记录只保存在当前浏览器。 / Guest mode: records stay in this browser.";
  });
  els.authCancel.addEventListener("click", closeAuthForm);
  els.authForm.addEventListener("submit", submitAuth);
  els.logoutButton.addEventListener("click", logout);
  els.adminCard.addEventListener("click", loadAdmin);
  els.refreshAdmin.addEventListener("click", loadAdmin);
  els.exportCsv.addEventListener("click", exportCsv);
  [els.contestFilter, els.studentFilter, els.topicFilter, els.yearFilter, els.dateFrom, els.dateTo].forEach((control) => {
    control.addEventListener("change", renderAdmin);
  });
}

async function init() {
  bindEvents();
  const { data } = await state.supabase.auth.getSession();
  await applySession(data.session);
  state.supabase.auth.onAuthStateChange((_event, session) => {
    applySession(session);
  });
}

init();

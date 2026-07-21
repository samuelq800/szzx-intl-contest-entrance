const SUPABASE_URL = "https://bwlcnaruyjazaxyiiumd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bGhQso88Ml6VEpX4reo8QQ_VjwL7yND";
const BANK_URLS = {
  AMC: "https://samuelq800.github.io/amc-practice-platform/amc_aops_2010_present.json",
  NEC: "https://samuelq800.github.io/nec-practice-platform/nec_question_bank.json",
  LSESU: "https://samuelq800.github.io/lsesu-economics-practice-platform/lsesu_question_bank.json",
};

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
  memberAssignments: document.querySelector("#memberAssignments"),
  memberAssignmentList: document.querySelector("#memberAssignmentList"),
  adminDashboard: document.querySelector("#adminDashboard"),
  refreshAdmin: document.querySelector("#refreshAdmin"),
  exportCsv: document.querySelector("#exportCsv"),
  totalStudents: document.querySelector("#totalStudents"),
  totalAttempts: document.querySelector("#totalAttempts"),
  mathAttempts: document.querySelector("#mathAttempts"),
  economyAttempts: document.querySelector("#economyAttempts"),
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
  assignmentTitle: document.querySelector("#assignmentTitle"),
  assignmentDueAt: document.querySelector("#assignmentDueAt"),
  assignmentYear: document.querySelector("#assignmentYear"),
  assignmentLevel: document.querySelector("#assignmentLevel"),
  assignmentForm: document.querySelector("#assignmentForm"),
  assignmentNumber: document.querySelector("#assignmentNumber"),
  addAssignmentProblem: document.querySelector("#addAssignmentProblem"),
  assignmentDraftCount: document.querySelector("#assignmentDraftCount"),
  assignmentDraftProblems: document.querySelector("#assignmentDraftProblems"),
  assignmentInstructions: document.querySelector("#assignmentInstructions"),
  createAssignment: document.querySelector("#createAssignment"),
  assignmentMessage: document.querySelector("#assignmentMessage"),
  assignmentTableTitle: document.querySelector("#assignmentTableTitle"),
  adminAssignmentList: document.querySelector("#adminAssignmentList"),
  econAssignmentTitle: document.querySelector("#econAssignmentTitle"),
  econAssignmentDueAt: document.querySelector("#econAssignmentDueAt"),
  econAssignmentContest: document.querySelector("#econAssignmentContest"),
  econAssignmentProblem: document.querySelector("#econAssignmentProblem"),
  addEconAssignmentProblem: document.querySelector("#addEconAssignmentProblem"),
  econAssignmentDraftCount: document.querySelector("#econAssignmentDraftCount"),
  econAssignmentDraftProblems: document.querySelector("#econAssignmentDraftProblems"),
  econAssignmentInstructions: document.querySelector("#econAssignmentInstructions"),
  createEconAssignment: document.querySelector("#createEconAssignment"),
  econAssignmentMessage: document.querySelector("#econAssignmentMessage"),
  econAssignmentTableTitle: document.querySelector("#econAssignmentTableTitle"),
  adminEconAssignmentList: document.querySelector("#adminEconAssignmentList"),
  personalLearning: document.querySelector("#personalLearning"),
  recommendationMeta: document.querySelector("#recommendationMeta"),
  mathRecommendationLevel: document.querySelector("#mathRecommendationLevel"),
  mathRecommendationList: document.querySelector("#mathRecommendationList"),
  mathRecommendationLink: document.querySelector("#mathRecommendationLink"),
  economyRecommendationContest: document.querySelector("#economyRecommendationContest"),
  economyRecommendationList: document.querySelector("#economyRecommendationList"),
  economyRecommendationLink: document.querySelector("#economyRecommendationLink"),
  mathOverall: document.querySelector("#mathOverall"),
  economyOverall: document.querySelector("#economyOverall"),
  mathRadar: document.querySelector("#mathRadar"),
  economyRadar: document.querySelector("#economyRadar"),
  mathReportSummary: document.querySelector("#mathReportSummary"),
  economyReportSummary: document.querySelector("#economyReportSummary"),
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
  adminData: { profiles: [], attempts: [], assignments: [], econAssignments: [] },
  assignments: [],
  assignmentDraft: [],
  econAssignmentDraft: [],
  econBank: [],
  personalAttempts: [],
  dailyPlan: null,
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

function isMathClubMember() {
  return state.profile?.role === "mathclubmembers";
}

function isEconClubMember() {
  return state.profile?.role === "econclubmembers";
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
    els.authMessage.textContent = "进入 AMC/BMO、NEC 或 LSESU 时会继续使用当前 Supabase 会话，云端记录会写入同一个项目。";
  } else {
    els.userStatus.textContent = "未登录 / Not signed in";
    els.authHeading.textContent = "统一登录中心";
    els.authMessage.textContent = "游客可以进入平台，但练习记录只保存在本机。登录后跨 AMC/BMO、NEC 与 LSESU 共用同一个账号。";
  }
  els.logoutButton.classList.toggle("is-hidden", !signedIn);
  els.guestActions.classList.toggle("is-hidden", signedIn);
  els.adminCard.classList.toggle("is-hidden", !isAdmin());
  els.memberAssignments.classList.toggle("is-hidden", !isMathClubMember());
  els.personalLearning.classList.toggle("is-hidden", !signedIn);
  if (!isAdmin()) els.adminDashboard.classList.add("is-hidden");
  if (isMathClubMember()) loadMemberAssignments();
}

function recommendationProblemLabel(problem, contestType) {
  if (contestType === "AMC") return `${problem.year} AMC ${problem.level}${problem.form} #${problem.number}`;
  if (contestType === "LSESU") return `${problem.section || problem.topic} · #${problem.number}`;
  return `${problem.topic} · #${problem.number}`;
}

function renderRecommendationList(target, problems, contestType) {
  target.innerHTML = "";
  if (!problems.length) {
    const empty = document.createElement("p");
    empty.textContent = "当前题库中没有可推荐的新题 / No eligible problems today.";
    target.append(empty);
    return;
  }
  problems.forEach((problem, index) => {
    const row = document.createElement("div");
    row.className = "daily-problem-row";
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = recommendationProblemLabel(problem, contestType);
    const reason = document.createElement("small");
    reason.textContent = problem.recommendation_reason || "能力匹配 / Ability matched";
    copy.append(title, reason);
    row.append(number, copy);
    target.append(row);
  });
}

function renderReport(report, type) {
  const isMath = type === "math";
  const overall = isMath ? els.mathOverall : els.economyOverall;
  const summary = isMath ? els.mathReportSummary : els.economyReportSummary;
  const canvas = isMath ? els.mathRadar : els.economyRadar;
  overall.textContent = String(report.overall);
  summary.textContent = report.total
    ? `已纳入 ${report.total} 道题；当前薄弱项：${report.weakest.label}（${report.weakest.score}）。`
    : "完成练习后将生成个性化八维报告。 / Complete problems to build your profile.";
  window.SZZXRecommendations.drawRadar(canvas, report.dimensions, isMath
    ? { stroke: "#0a6b57", fill: "rgba(10, 107, 87, .22)" }
    : { stroke: "#24506f", fill: "rgba(36, 80, 111, .2)" });
}

function recommendationUrl(base, problems) {
  const params = new URLSearchParams({
    mode: "recommended",
    date: window.SZZXRecommendations.dayKey(),
    problems: problems.map((problem) => problem.id).join(","),
  });
  return `${base}?${params.toString()}`;
}

async function fetchBank(url) {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`题库读取失败 (${response.status})`);
  return response.json();
}

async function loadPersonalLearning() {
  if (!state.user || !window.SZZXRecommendations) return;
  els.recommendationMeta.textContent = "正在读取历史记录并生成今日推荐… / Building today's plan...";
  try {
    const attemptsResult = await state.supabase
      .from("attempts")
      .select("problem_id,contest_type,year,level,form,number,topic,difficulty,is_correct,mode,submitted_at")
      .eq("user_id", state.user.id)
      .order("submitted_at", { ascending: true });
    if (attemptsResult.error) throw attemptsResult.error;
    state.personalAttempts = attemptsResult.data || [];
    const [amc, nec, lsesu] = await Promise.all([
      fetchBank(BANK_URLS.AMC),
      fetchBank(BANK_URLS.NEC),
      fetchBank(BANK_URLS.LSESU),
    ]);
    state.dailyPlan = window.SZZXRecommendations.buildPlan({
      userId: state.user.id,
      attempts: state.personalAttempts,
      amcProblems: amc.problems || [],
      necProblems: nec.problems || [],
      lsesuProblems: lsesu.problems || [],
    });
    const plan = state.dailyPlan;
    els.recommendationMeta.textContent = `${plan.date} · 每日题组按北京时间零点更新，计算在当前浏览器完成。`;
    els.mathRecommendationLevel.textContent = plan.math.some((problem) => Number(problem.level) === 12) ? "AMC 10 / 12" : "AMC 10";
    els.economyRecommendationContest.textContent = plan.economyContest;
    renderRecommendationList(els.mathRecommendationList, plan.math, "AMC");
    renderRecommendationList(els.economyRecommendationList, plan.economy, plan.economyContest);
    els.mathRecommendationLink.href = recommendationUrl("https://samuelq800.github.io/amc-practice-platform/", plan.math);
    const economyBase = plan.economyContest === "LSESU"
      ? "https://samuelq800.github.io/lsesu-economics-practice-platform/"
      : "https://samuelq800.github.io/nec-practice-platform/";
    els.economyRecommendationLink.href = recommendationUrl(economyBase, plan.economy);
    renderReport(plan.mathReport, "math");
    renderReport(plan.economyReport, "economy");
  } catch (error) {
    els.recommendationMeta.textContent = `个人推荐暂时无法生成 / Recommendations unavailable: ${error.message}`;
    console.warn("Personal recommendations unavailable:", error);
  }
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
  if (state.user) await loadPersonalLearning();
}

async function logout() {
  await state.supabase.auth.signOut();
  state.user = null;
  state.profile = null;
  state.adminData = { profiles: [], attempts: [], assignments: [], econAssignments: [] };
  state.assignments = [];
  state.personalAttempts = [];
  state.dailyPlan = null;
  renderAuth();
}

function profileFor(userId) {
  return state.adminData.profiles.find((profile) => profile.id === userId) || {};
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[char]);
}

function assignmentProblemLabel(problemId) {
  return String(problemId || "").replace(/_(AMC)_(10|12)([AB])_(\d+)$/, " $1 $2$3 #$4").replaceAll("_", " ");
}

function assignmentProblemUrl(problemId) {
  return `https://samuelq800.github.io/amc-practice-platform/?problem=${encodeURIComponent(problemId)}`;
}

function assignmentDate(value) {
  return value ? `截止 / Due ${new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(value))}` : "无截止日期 / No due date";
}

function renderAssignmentItem(assignment, options = {}) {
  const item = document.createElement("article");
  item.className = "assignment-item";
  const head = document.createElement("div");
  head.className = "assignment-item-head";
  const title = document.createElement("h3");
  title.textContent = assignment.title || "AMC 练习任务 / AMC Assignment";
  const meta = document.createElement("span");
  meta.className = "assignment-meta";
  meta.textContent = assignmentDate(assignment.due_at);
  head.append(title, meta);
  item.append(head);
  if (assignment.instructions) {
    const note = document.createElement("p");
    note.textContent = assignment.instructions;
    item.append(note);
  }
  const problems = document.createElement("div");
  problems.className = "assignment-problems";
  for (const problemId of assignment.problem_ids || []) {
    const link = document.createElement("a");
    link.href = assignmentProblemUrl(problemId);
    link.textContent = assignmentProblemLabel(problemId);
    problems.append(link);
  }
  item.append(problems);
  if (options.showDelete) {
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "quiet-button";
    remove.textContent = "撤回任务 / Remove";
    remove.addEventListener("click", () => deleteAssignment(assignment.id));
    item.append(remove);
  }
  return item;
}

function renderMemberAssignments() {
  els.memberAssignmentList.innerHTML = "";
  if (!state.assignments.length) {
    const empty = document.createElement("p");
    empty.textContent = "目前没有布置的 AMC 题目 / No AMC assignments yet.";
    els.memberAssignmentList.append(empty);
    return;
  }
  state.assignments.forEach((assignment) => els.memberAssignmentList.append(renderAssignmentItem(assignment)));
}

async function loadMemberAssignments() {
  if (!isMathClubMember()) return;
  const { data, error } = await state.supabase
    .from("amc_assignments")
    .select("id,title,instructions,problem_ids,due_at,created_at")
    .eq("target_role", "mathclubmembers")
    .order("created_at", { ascending: false });
  if (error) {
    els.memberAssignmentList.innerHTML = "";
    const message = document.createElement("p");
    message.textContent = `任务暂时无法读取 / Assignments unavailable: ${error.message}`;
    els.memberAssignmentList.append(message);
    return;
  }
  state.assignments = data || [];
  renderMemberAssignments();
}

function renderAssignmentDraft() {
  els.assignmentDraftProblems.innerHTML = "";
  els.assignmentDraftCount.textContent = `${state.assignmentDraft.length} 题已选择 / selected`;
  state.assignmentDraft.forEach((problemId) => {
    const pill = document.createElement("span");
    pill.className = "assignment-pill";
    pill.append(document.createTextNode(assignmentProblemLabel(problemId)));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.title = "移除 / Remove";
    remove.addEventListener("click", () => {
      state.assignmentDraft = state.assignmentDraft.filter((id) => id !== problemId);
      renderAssignmentDraft();
    });
    pill.append(remove);
    els.assignmentDraftProblems.append(pill);
  });
}

function currentAssignmentProblemId() {
  const number = String(els.assignmentNumber.value).padStart(2, "0");
  return `${els.assignmentYear.value}_AMC_${els.assignmentLevel.value}${els.assignmentForm.value}_${number}`;
}

function setupAssignmentForm() {
  const currentYear = new Date().getFullYear();
  fillSelect(els.assignmentYear, Array.from({ length: currentYear - 2009 }, (_, index) => [String(currentYear - index), String(currentYear - index)]), "选择年份 / Year");
  els.assignmentYear.value = "2025";
  els.assignmentLevel.innerHTML = "";
  option(els.assignmentLevel, "10", "AMC 10");
  option(els.assignmentLevel, "12", "AMC 12");
  els.assignmentForm.innerHTML = "";
  option(els.assignmentForm, "A", "A 卷 / Form A");
  option(els.assignmentForm, "B", "B 卷 / Form B");
  els.assignmentNumber.innerHTML = "";
  for (let number = 1; number <= 25; number += 1) option(els.assignmentNumber, String(number), `第 ${number} 题 / #${number}`);
  renderAssignmentDraft();
}

function addAssignmentProblem() {
  const problemId = currentAssignmentProblemId();
  if (!state.assignmentDraft.includes(problemId)) state.assignmentDraft.push(problemId);
  els.assignmentMessage.textContent = "";
  renderAssignmentDraft();
}

async function createAssignment() {
  if (!isAdmin()) return;
  if (!state.assignmentDraft.length) {
    els.assignmentMessage.textContent = "请至少加入一道 AMC 题目 / Add at least one AMC problem.";
    return;
  }
  const title = els.assignmentTitle.value.trim() || `AMC 练习 · ${new Date().toLocaleDateString("zh-CN")}`;
  els.createAssignment.disabled = true;
  els.assignmentMessage.textContent = "正在发布任务... / Publishing assignment...";
  const { error } = await state.supabase.from("amc_assignments").insert({
    created_by: state.user.id,
    target_role: "mathclubmembers",
    title,
    instructions: els.assignmentInstructions.value.trim() || null,
    problem_ids: state.assignmentDraft,
    due_at: els.assignmentDueAt.value ? new Date(`${els.assignmentDueAt.value}T23:59:59`).toISOString() : null,
  });
  els.createAssignment.disabled = false;
  if (error) {
    els.assignmentMessage.textContent = `发布失败 / Failed to publish: ${error.message}`;
    return;
  }
  state.assignmentDraft = [];
  els.assignmentTitle.value = "";
  els.assignmentInstructions.value = "";
  els.assignmentDueAt.value = "";
  els.assignmentMessage.textContent = "已发布给 Math Club 成员 / Published to Math Club members.";
  renderAssignmentDraft();
  loadAdmin();
}

async function deleteAssignment(assignmentId) {
  if (!isAdmin() || !assignmentId) return;
  const { error } = await state.supabase.from("amc_assignments").delete().eq("id", assignmentId);
  if (error) {
    els.assignmentMessage.textContent = `撤回失败 / Failed to remove: ${error.message}`;
    return;
  }
  els.assignmentMessage.textContent = "任务已撤回 / Assignment removed.";
  loadAdmin();
}

const econBankUrls = {
  NEC: "https://samuelq800.github.io/nec-practice-platform/nec_question_bank.json",
  LSESU: "https://samuelq800.github.io/lsesu-economics-practice-platform/lsesu_question_bank.json",
};

function econProblemLabel(problem) {
  const area = problem.section || problem.topic || "Economics";
  return `${area} #${problem.number} · ${String(problem.statement || "").replace(/\s+/g, " ").slice(0, 70)}`;
}

function renderEconAssignmentDraft() {
  els.econAssignmentDraftProblems.innerHTML = "";
  els.econAssignmentDraftCount.textContent = `${state.econAssignmentDraft.length} 题已选择 / selected`;
  state.econAssignmentDraft.forEach((problemId) => {
    const problem = state.econBank.find((item) => item.id === problemId);
    const pill = document.createElement("span");
    pill.className = "assignment-pill";
    pill.append(document.createTextNode(problem ? econProblemLabel(problem) : problemId));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.title = "移除 / Remove";
    remove.addEventListener("click", () => {
      state.econAssignmentDraft = state.econAssignmentDraft.filter((id) => id !== problemId);
      renderEconAssignmentDraft();
    });
    pill.append(remove);
    els.econAssignmentDraftProblems.append(pill);
  });
}

async function loadEconBank() {
  const contest = els.econAssignmentContest.value;
  els.econAssignmentProblem.innerHTML = "<option value=\"\">正在加载题库 / Loading bank...</option>";
  state.econAssignmentDraft = [];
  renderEconAssignmentDraft();
  try {
    const response = await fetch(econBankUrls[contest]);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bank = await response.json();
    state.econBank = (bank.problems || []).slice().sort((a, b) => String(a.section || a.topic || "").localeCompare(String(b.section || b.topic || ""), "zh-CN") || Number(a.number) - Number(b.number));
    els.econAssignmentProblem.innerHTML = "";
    option(els.econAssignmentProblem, "", "选择题目 / Problem");
    state.econBank.forEach((problem) => option(els.econAssignmentProblem, problem.id, econProblemLabel(problem)));
    els.econAssignmentMessage.textContent = `已载入 ${state.econBank.length} 道 ${contest} 题目 / ${contest} bank loaded.`;
  } catch (error) {
    state.econBank = [];
    els.econAssignmentProblem.innerHTML = "<option value=\"\">题库加载失败 / Bank unavailable</option>";
    els.econAssignmentMessage.textContent = `无法读取 ${contest} 题库 / Unable to load ${contest} bank: ${error.message}`;
  }
}

function addEconAssignmentProblem() {
  const problemId = els.econAssignmentProblem.value;
  if (!problemId) return;
  if (!state.econAssignmentDraft.includes(problemId)) state.econAssignmentDraft.push(problemId);
  renderEconAssignmentDraft();
}

function renderEconAssignmentItem(assignment, options = {}) {
  const item = document.createElement("article");
  item.className = "assignment-item";
  const head = document.createElement("div");
  head.className = "assignment-item-head";
  const title = document.createElement("h3");
  title.textContent = assignment.title || `${assignment.contest_type} 练习任务 / Assignment`;
  const meta = document.createElement("span");
  meta.className = "assignment-meta";
  meta.textContent = `${assignment.contest_type} · ${assignmentDate(assignment.due_at)}`;
  head.append(title, meta);
  item.append(head);
  if (assignment.instructions) {
    const note = document.createElement("p");
    note.textContent = assignment.instructions;
    item.append(note);
  }
  const problems = document.createElement("p");
  problems.className = "assignment-problems";
  problems.textContent = `${assignment.problem_ids?.length || 0} 题 / problems`;
  item.append(problems);
  if (options.showDelete) {
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "quiet-button";
    remove.textContent = "撤回任务 / Remove";
    remove.addEventListener("click", () => deleteEconAssignment(assignment.id));
    item.append(remove);
  }
  return item;
}

async function createEconAssignment() {
  if (!isAdmin()) return;
  if (!state.econAssignmentDraft.length) {
    els.econAssignmentMessage.textContent = "请至少加入一道题 / Add at least one problem.";
    return;
  }
  const contest = els.econAssignmentContest.value;
  const title = els.econAssignmentTitle.value.trim() || `${contest} 练习 · ${new Date().toLocaleDateString("zh-CN")}`;
  els.createEconAssignment.disabled = true;
  const { error } = await state.supabase.from("econ_assignments").insert({
    created_by: state.user.id,
    target_role: "econclubmembers",
    contest_type: contest,
    title,
    instructions: els.econAssignmentInstructions.value.trim() || null,
    problem_ids: state.econAssignmentDraft,
    due_at: els.econAssignmentDueAt.value ? new Date(`${els.econAssignmentDueAt.value}T23:59:59`).toISOString() : null,
  });
  els.createEconAssignment.disabled = false;
  if (error) {
    els.econAssignmentMessage.textContent = `发布失败 / Failed to publish: ${error.message}`;
    return;
  }
  state.econAssignmentDraft = [];
  els.econAssignmentTitle.value = "";
  els.econAssignmentInstructions.value = "";
  els.econAssignmentDueAt.value = "";
  els.econAssignmentMessage.textContent = "已发布给 Econ Club 成员 / Published to Econ Club members.";
  renderEconAssignmentDraft();
  loadAdmin();
}

async function deleteEconAssignment(assignmentId) {
  if (!isAdmin() || !assignmentId) return;
  const { error } = await state.supabase.from("econ_assignments").delete().eq("id", assignmentId);
  els.econAssignmentMessage.textContent = error ? `撤回失败 / Failed to remove: ${error.message}` : "任务已撤回 / Assignment removed.";
  if (!error) loadAdmin();
}

async function updateProfileRole(userId, role) {
  if (!isAdmin()) return;
  const { error } = await state.supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) {
    els.assignmentMessage.textContent = `身份更新失败 / Role update failed: ${error.message}`;
    return;
  }
  els.assignmentMessage.textContent = "身份已更新 / Role updated.";
  loadAdmin();
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
  fillSelect(els.contestFilter, [["AMC", "AMC"], ["AIME", "AIME"], ["BMO", "BMO"], ["NEC", "NEC"], ["LSESU", "LSESU"]], "全部竞赛 / All");
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
  const mathAttempts = attempts.filter((attempt) => ["AMC", "AIME", "BMO"].includes(attempt.contest_type)).length;
  const economyAttempts = attempts.filter((attempt) => ["NEC", "LSESU"].includes(attempt.contest_type)).length;
  const activeSince = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const active = new Set(attempts.filter((attempt) => new Date(attempt.submitted_at).getTime() >= activeSince).map((attempt) => attempt.user_id));
  els.totalStudents.textContent = String(state.adminData.profiles.length);
  els.totalAttempts.textContent = String(attempts.length);
  els.mathAttempts.textContent = String(mathAttempts);
  els.economyAttempts.textContent = String(economyAttempts);
  els.averageAccuracy.textContent = percent(correct, attempts.length);
  els.activeUsers.textContent = String(active.size);

  const allAttemptsByStudent = new Map();
  for (const attempt of state.adminData.attempts) {
    const history = allAttemptsByStudent.get(attempt.user_id) || [];
    history.push(attempt);
    allAttemptsByStudent.set(attempt.user_id, history);
  }
  const scoresFor = (userId) => {
    const history = allAttemptsByStudent.get(userId) || [];
    if (!window.SZZXRecommendations) return { math: 50, economy: 50 };
    return {
      math: window.SZZXRecommendations.report(history, "math").overall,
      economy: window.SZZXRecommendations.report(history, "economy").overall,
    };
  };
  const blankStudent = (profile) => ({ profile, total: 0, mathAttempts: 0, economyAttempts: 0, correct: 0, lastActive: "" });
  const byStudent = new Map(state.adminData.profiles.map((profile) => [profile.id, blankStudent(profile)]));
  for (const attempt of attempts) {
    const row = byStudent.get(attempt.user_id) || blankStudent(profileFor(attempt.user_id));
    row.total += 1;
    if (["NEC", "LSESU"].includes(attempt.contest_type)) row.economyAttempts += 1;
    if (["AMC", "AIME", "BMO"].includes(attempt.contest_type)) row.mathAttempts += 1;
    if (attempt.is_correct) row.correct += 1;
    if (String(attempt.submitted_at || "") > String(row.lastActive || "")) row.lastActive = attempt.submitted_at;
    byStudent.set(attempt.user_id, row);
  }
  const studentRows = [...byStudent.entries()]
    .map(([userId, row]) => ({ ...row, scores: scoresFor(userId) }))
    .sort((a, b) => b.total - a.total);
  els.studentTableTitle.textContent = `${studentRows.length} students`;
  els.studentRows.innerHTML = studentRows.map((row) => `
    <tr>
      <td>${displayName(row.profile)}</td>
      <td>${row.profile.email || "-"}</td>
      <td>${row.profile.role === "admin" ? "admin" : `
        <select class="role-select" data-user-id="${row.profile.id}" aria-label="${displayName(row.profile)} 的身份">
          <option value="student" ${!['mathclubmembers', 'econclubmembers'].includes(row.profile.role) ? "selected" : ""}>student</option>
          <option value="mathclubmembers" ${row.profile.role === "mathclubmembers" ? "selected" : ""}>mathclubmembers</option>
          <option value="econclubmembers" ${row.profile.role === "econclubmembers" ? "selected" : ""}>econclubmembers</option>
        </select>
      `}</td>
      <td>${row.total}</td>
      <td>${row.mathAttempts}</td>
      <td>${row.economyAttempts}</td>
      <td><strong>${row.scores.math}</strong></td>
      <td><strong>${row.scores.economy}</strong></td>
      <td>${row.correct}</td>
      <td>${percent(row.correct, row.total)}</td>
      <td>${dateTime(row.lastActive)}</td>
    </tr>
  `).join("") || '<tr><td colspan="11">暂无学生数据 / No student data</td></tr>';
  els.studentRows.querySelectorAll(".role-select").forEach((select) => {
    select.addEventListener("change", () => updateProfileRole(select.dataset.userId, select.value));
  });

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

  els.assignmentTableTitle.textContent = `${state.adminData.assignments.length} assignments`;
  els.adminAssignmentList.innerHTML = "";
  if (!state.adminData.assignments.length) {
    const empty = document.createElement("p");
    empty.textContent = "还没有发布任务 / No assignments yet.";
    els.adminAssignmentList.append(empty);
  } else {
    state.adminData.assignments.forEach((assignment) => {
      els.adminAssignmentList.append(renderAssignmentItem(assignment, { showDelete: true }));
    });
  }

  els.econAssignmentTableTitle.textContent = `${state.adminData.econAssignments.length} assignments`;
  els.adminEconAssignmentList.innerHTML = "";
  if (!state.adminData.econAssignments.length) {
    const empty = document.createElement("p");
    empty.textContent = "还没有发布经济社任务 / No Econ Club assignments yet.";
    els.adminEconAssignmentList.append(empty);
  } else {
    state.adminData.econAssignments.forEach((assignment) => {
      els.adminEconAssignmentList.append(renderEconAssignmentItem(assignment, { showDelete: true }));
    });
  }
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
  try {
    const [profiles, attempts, assignments, econAssignments] = await Promise.all([
      fetchAll("profiles", "id,email,display_name,role,created_at", "created_at"),
      fetchAll("attempts", "id,user_id,problem_id,contest_type,platform,source_url,exam_id,year,level,form,number,topic,difficulty,selected_answer,correct_answer,is_correct,time_spent_seconds,mode,submitted_at", "submitted_at"),
      fetchAll("amc_assignments", "id,created_by,target_role,title,instructions,problem_ids,due_at,created_at", "created_at"),
      fetchAll("econ_assignments", "id,created_by,target_role,contest_type,title,instructions,problem_ids,due_at,created_at", "created_at"),
    ]);
    state.adminData = { profiles, attempts, assignments, econAssignments };
    setupAdminFilters();
    renderAdmin();
    els.authMessage.textContent = `已加载 ${attempts.length} 条作答记录、${assignments.length} 个 AMC 任务和 ${econAssignments.length} 个经济社任务。 / Loaded attempts and assignments.`;
  } catch (error) {
    els.authMessage.textContent = `管理员数据加载失败 / Failed to load admin data: ${error.message}`;
  }
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
  els.addAssignmentProblem.addEventListener("click", addAssignmentProblem);
  els.createAssignment.addEventListener("click", createAssignment);
  els.econAssignmentContest.addEventListener("change", loadEconBank);
  els.addEconAssignmentProblem.addEventListener("click", addEconAssignmentProblem);
  els.createEconAssignment.addEventListener("click", createEconAssignment);
  [els.contestFilter, els.studentFilter, els.topicFilter, els.yearFilter, els.dateFrom, els.dateTo].forEach((control) => {
    control.addEventListener("change", renderAdmin);
  });
}

async function init() {
  bindEvents();
  setupAssignmentForm();
  loadEconBank();
  const { data } = await state.supabase.auth.getSession();
  await applySession(data.session);
  state.supabase.auth.onAuthStateChange((_event, session) => {
    applySession(session);
  });
  window.addEventListener("resize", () => {
    if (!state.dailyPlan) return;
    renderReport(state.dailyPlan.mathReport, "math");
    renderReport(state.dailyPlan.economyReport, "economy");
  });
}

init();

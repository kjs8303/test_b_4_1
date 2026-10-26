export const GITHUB_USER = "kjs83036";
export const PROJECT_LIMIT = 100;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));

export const getRepositories = async (fetcher = window.fetch.bind(window)) => {
  const url = `https://api.github.com/users/${encodeURIComponent(GITHUB_USER)}/repos?sort=updated&direction=desc&per_page=${PROJECT_LIMIT}`;
  const response = await fetcher(url, {
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const repositories = await response.json();
  if (!Array.isArray(repositories)) {
    throw new Error("저장소 응답이 배열이 아닙니다.");
  }
  return repositories;
};

const repositoryCard = (repository) => {
  const { name, description, language, stargazers_count, html_url } = repository;
  const safeUrl = typeof html_url === "string" && html_url.startsWith("https://github.com/")
    ? html_url : `https://github.com/${GITHUB_USER}`;
  return `
    <article class="project-card">
      <h3><a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a></h3>
      <p class="project-description">${escapeHtml(description ?? "설명 없음")}</p>
      <p>언어: ${escapeHtml(language ?? "미지정")}</p>
      <p>별: ${Number(stargazers_count) || 0}</p>
    </article>
  `;
};

export const createProjects = (root, fetcher = window.fetch.bind(window)) => {
  const status = root.querySelector("#project-status");
  const detail = root.querySelector("#project-detail");
  const list = root.querySelector("#project-list");
  const loadButton = root.querySelector("#project-load");
  const retryButton = root.querySelector("#project-retry");
  const state = { phase: "idle", repositories: [], error: "" };

  const render = () => {
    const messages = {
      idle: "버튼을 누르면 공개 저장소를 조회합니다.",
      loading: "로딩 중...",
      success: "공개 저장소를 불러왔습니다.",
      empty: "표시할 프로젝트가 없습니다.",
      error: "프로젝트를 불러올 수 없습니다."
    };
    status.dataset.state = state.phase;
    status.textContent = messages[state.phase];
    detail.textContent = state.error;
    list.setAttribute("aria-busy", String(state.phase === "loading"));
    list.innerHTML = state.phase === "success"
      ? state.repositories.map(repositoryCard).join("") : "";
    loadButton.hidden = state.phase !== "idle";
    retryButton.hidden = state.phase !== "error";
  };

  const load = async () => {
    if (state.phase === "loading") {
      return;
    }
    state.phase = "loading";
    state.repositories = [];
    state.error = "";
    render();
    try {
      state.repositories = await getRepositories(fetcher);
      state.phase = state.repositories.length === 0 ? "empty" : "success";
    } catch (error) {
      state.phase = "error";
      state.error = error.message;
    }
    render();
  };

  loadButton.addEventListener("click", load);
  retryButton.addEventListener("click", load);
  render();
  return { load };
};
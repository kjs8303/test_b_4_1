import { createProjects } from "./projects.js";

createProjects(document);
const themeButton = document.querySelector("#theme-toggle");
const themeStatus = document.querySelector("#theme-status");
const menuButton = document.querySelector("#menu-toggle");
const navLinks = document.querySelector("#nav-links");
const header = document.querySelector("#site-header");
const topButton = document.querySelector("#scroll-top");
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const fields = [...form.querySelectorAll("[data-field]")];
const state = { theme: "light", errors: {} };

try {
  state.theme = localStorage.getItem("portfolio-theme") === "dark" ? "dark" : "light";
} catch {
  themeStatus.textContent = "테마 저장소를 읽을 수 없어 라이트 모드로 시작합니다.";
}
const renderTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  themeButton.textContent = state.theme === "dark" ? "라이트 모드 켜기" : "다크 모드 켜기";
  themeButton.setAttribute("aria-pressed", String(state.theme === "dark"));
};
themeButton.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  renderTheme();
  try {
    localStorage.setItem("portfolio-theme", state.theme);
    themeStatus.textContent = "테마 설정을 저장했습니다.";
  } catch {
    themeStatus.textContent = "테마를 저장하지 못했습니다. 브라우저 저장소 사용 가능 여부를 확인해 주세요.";
  }
});
renderTheme();

const closeMenu = () => {
  navLinks.classList.remove("active");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.textContent = "메뉴 열기";
};
menuButton.addEventListener("click", () => {
  const opened = navLinks.classList.toggle("active");
  menuButton.setAttribute("aria-expanded", String(opened));
  menuButton.textContent = opened ? "메뉴 닫기" : "메뉴 열기";
});
document.querySelectorAll("[data-scroll]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    closeMenu();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) {
    closeMenu();
  }
});
const renderScroll = () => {
  header.classList.toggle("scrolled", window.scrollY >= 60);
  topButton.hidden = window.scrollY < 300;
};
window.addEventListener("scroll", renderScroll, { passive: true });
topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
renderScroll();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (isIntersecting) {
      target.classList.add("visible");
      observer.unobserve(target);
    }
  });
}, { threshold: 0.2 });
document.documentElement.classList.add("js-ready");
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const getFieldError = (field) => {
  const value = field.value.trim();
  if (!value) {
    return "필수 입력 항목입니다.";
  }
  if (field.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "올바른 이메일 형식을 입력해 주세요.";
  }
  return "";
};
const renderErrors = () => {
  fields.forEach((field) => {
    const error = state.errors[field.name] ?? "";
    document.querySelector(`#${field.name}-error`).textContent = error;
    field.setAttribute("aria-invalid", String(Boolean(error)));
  });
};
fields.forEach((field) => {
  field.addEventListener("input", () => {
    state.errors[field.name] = getFieldError(field);
    formStatus.textContent = "";
    renderErrors();
  });
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  fields.forEach((field) => {
    state.errors[field.name] = getFieldError(field);
  });
  renderErrors();
  const invalidField = fields.find((field) => state.errors[field.name]);
  if (invalidField) {
    formStatus.textContent = "입력 내용을 확인해 주세요.";
    invalidField.focus();
    return;
  }
  formStatus.textContent = "입력 검증을 통과했습니다. 실습용 폼이며 실제 메시지는 전송되지 않습니다.";
});
document.querySelector("#year").textContent = String(new Date().getFullYear());
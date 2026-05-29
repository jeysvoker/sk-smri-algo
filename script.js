const buttons = document.querySelectorAll(".buy-btn");
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");

menuBtn.addEventListener("click", () => {
  menuBtn.classList.toggle("active");
  nav.classList.toggle("active");
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    menuBtn.classList.remove("active");
    nav.classList.remove("active");
  });
});

const modal = document.createElement("div");

modal.className = "modal";
modal.innerHTML = `
  <div class="modal-box">
    <button class="modal-close">×</button>

    <h2>Оплата скоро будет доступна</h2>

    <p>
      Сейчас сайт находится на этапе подготовки. Следующий шаг —
      подключение платежной системы, лицензий и автоматической выдачи доступа.
    </p>

    <div class="modal-actions">
      <button class="modal-ok">Понятно</button>
    </div>
  </div>
`;

document.body.appendChild(modal);

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    modal.classList.add("active");
  });
});

modal.querySelector(".modal-close").addEventListener("click", () => {
  modal.classList.remove("active");
});

modal.querySelector(".modal-ok").addEventListener("click", () => {
  modal.classList.remove("active");
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.remove("active");
  }
});
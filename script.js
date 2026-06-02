const API_URL = "https://sk-samurai-api.vess0092.workers.dev";
const PAYMENT_WALLET = "TJ1zxPC26iV64qTiEa5rZTKNy17Evv8sGL";

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
const buttons = document.querySelectorAll(".buy-btn");

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

document.body.appendChild(modal);

function openModal(content) {
  modal.innerHTML = `
    <div class="modal-box">
      <button class="modal-close">×</button>
      ${content}
    </div>
  `;

  modal.classList.add("active");

  modal.querySelector(".modal-close").addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
}

function closeModal() {
  modal.classList.remove("active");
}

function ownBrokerForm() {
  openModal(`
    <h2>Own Broker / Prop firm</h2>

    <p>
      Стоимость подключения: <strong>350 USDT TRC20</strong><br>
      Ежемесячное продление: <strong>30 USDT</strong>
    </p>

    <div class="wallet-box">
      <span>USDT TRC20 кошелек:</span>
      <strong>${PAYMENT_WALLET}</strong>
    </div>

    <input class="form-input" id="ownEmail" placeholder="Email" />
    <input class="form-input" id="ownTelegram" placeholder="Telegram username" />
    <input class="form-input" id="ownTxid" placeholder="TXID транзакции" />

    <button class="modal-ok" id="verifyPaymentBtn">
      Проверить оплату
    </button>

    <p class="form-note">
      После успешной проверки оплаты система автоматически создаст license key.
    </p>
  `);

  document.querySelector("#verifyPaymentBtn").addEventListener("click", verifyOwnBrokerPayment);
}

async function verifyOwnBrokerPayment() {
  const email = document.querySelector("#ownEmail").value.trim();
  const telegram = document.querySelector("#ownTelegram").value.trim();
  const txid = document.querySelector("#ownTxid").value.trim();

  if (!telegram || !txid) {
    alert("Введите Telegram и TXID.");
    return;
  }

  const button = document.querySelector("#verifyPaymentBtn");
  button.disabled = true;
  button.textContent = "Проверяем...";

  try {
    const response = await fetch(`${API_URL}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        telegram,
        txid,
        plan: "own-broker"
      })
    });

    const data = await response.json();

    if (!data.ok) {
      button.disabled = false;
      button.textContent = "Проверить оплату";

      alert(data.message || "Оплата не подтверждена.");
      return;
    }

    openModal(`
      <h2>Оплата подтверждена</h2>

      <p>
        Ваш лицензионный ключ создан.
      </p>

      <div class="license-box">
        ${data.license_key}
      </div>

      <p>
        Срок действия: <strong>${data.expires_at}</strong>
      </p>

      <button class="modal-ok" onclick="navigator.clipboard.writeText('${data.license_key}')">
        Скопировать ключ
      </button>
    `);
  } catch (error) {
    button.disabled = false;
    button.textContent = "Проверить оплату";

    alert("Ошибка проверки оплаты. Попробуйте позже.");
  }
}

function referralForm() {
  openModal(`
    <h2>Referral Access</h2>

    <p>
      Зарегистрируйтесь в FxPro по реферальной ссылке, пополните баланс от $500
      и отправьте заявку на проверку.
    </p>

    <input class="form-input" id="refEmail" placeholder="Email" />
    <input class="form-input" id="refTelegram" placeholder="Telegram username" />
    <input class="form-input" id="refFxpro" placeholder="FxPro ID / Email аккаунта" />

    <button class="modal-ok" id="sendReferralBtn">
      Отправить заявку
    </button>

    <p class="form-note">
      После проверки менеджер активирует доступ.
    </p>
  `);

  document.querySelector("#sendReferralBtn").addEventListener("click", sendReferralRequest);
}

async function sendReferralRequest() {
  const email = document.querySelector("#refEmail").value.trim();
  const telegram = document.querySelector("#refTelegram").value.trim();
  const fxproId = document.querySelector("#refFxpro").value.trim();

  if (!telegram || !fxproId) {
    alert("Введите Telegram и FxPro ID.");
    return;
  }

  const button = document.querySelector("#sendReferralBtn");
  button.disabled = true;
  button.textContent = "Отправляем...";

  try {
    const response = await fetch(`${API_URL}/create-referral-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        telegram,
        fxpro_id: fxproId
      })
    });

    const data = await response.json();

    if (!data.ok) {
      button.disabled = false;
      button.textContent = "Отправить заявку";

      alert(data.message || "Не удалось отправить заявку.");
      return;
    }

    openModal(`
      <h2>Заявка отправлена</h2>

      <p>
        Ваша заявка на Referral Access сохранена.
        Менеджер проверит подключение и свяжется с вами.
      </p>

      <a class="support-link" href="https://t.me/manager_sksamurai" target="_blank">
        Написать менеджеру
      </a>
    `);
  } catch (error) {
    button.disabled = false;
    button.textContent = "Отправить заявку";

    alert("Ошибка отправки заявки. Попробуйте позже.");
  }
}

buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    if (index === 0) {
      ownBrokerForm();
    } else {
      referralForm();
    }
  });
});
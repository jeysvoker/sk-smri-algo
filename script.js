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
      Стоимость подключения: <strong>200 USDT TRC20</strong> (первый месяц включен)<br>
      Далее продление: <strong>30 USDT / месяц</strong>
    </p>

    <div class="wallet-box">
      <span>USDT TRC20 кошелек:</span>
      <strong>${PAYMENT_WALLET}</strong>
    </div>

    <input class="form-input" id="ownEmail" placeholder="Email" />
    <input class="form-input" id="ownTelegram" placeholder="Telegram username *" />
    <input class="form-input" id="ownAccount" placeholder="Номер торгового счета cTrader *" />
    <input class="form-input" id="ownAccount2" placeholder="Второй счет (prop firm) — необязательно" />
    <input class="form-input" id="ownTxid" placeholder="TXID транзакции *" />

    <button class="modal-ok" id="verifyPaymentBtn">
      Проверить оплату
    </button>

    <p class="form-note">
      Лицензия работает максимум на 2 торговых счетах.
      Номер счета указан в cTrader рядом с названием брокера.
    </p>

    <p class="form-note">
      <a href="#" id="renewLink">Уже есть лицензия? Продлить за 30 USDT</a>
    </p>
  `);

  document.querySelector("#verifyPaymentBtn").addEventListener("click", verifyOwnBrokerPayment);

  document.querySelector("#renewLink").addEventListener("click", (event) => {
    event.preventDefault();
    renewalForm();
  });
}

function formatExpires(value) {
  if (!value || value === "lifetime") return "бессрочно";

  const date = new Date(value);

  if (isNaN(date.getTime())) return value;

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function licenseSuccessModal(title, data, extraNote) {
  openModal(`
    <h2>${title}</h2>

    <p>
      Сохраните ваш лицензионный ключ — он понадобится для запуска бота:
    </p>

    <div class="license-box" style="word-break: break-all;">
      ${data.license_key}
    </div>

    <p>
      Срок действия: до <strong>${formatExpires(data.expires_at)}</strong>
    </p>

    <button class="modal-ok" id="copyKeyBtn">
      Скопировать ключ
    </button>

    <p>
      <strong>Как подключить:</strong><br>
      1. Откройте cTrader<br>
      2. Перейдите в раздел Algo и добавьте cBot SK SAMURAI ALGO<br>
      3. Вставьте License Key в параметры бота<br>
      4. Запустите бота
    </p>

    ${extraNote ? `<p class="form-note">${extraNote}</p>` : ""}

    <p class="form-note">
      Файл бота .algo и подробную инструкцию пришлет менеджер:
      <a href="https://t.me/manager_sk_ua" target="_blank" rel="noopener">@manager_sk_ua</a>
    </p>
  `);

  document.querySelector("#copyKeyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(data.license_key);
    document.querySelector("#copyKeyBtn").textContent = "Скопировано ✓";
  });
}

async function verifyOwnBrokerPayment() {
  const email = document.querySelector("#ownEmail").value.trim();
  const telegram = document.querySelector("#ownTelegram").value.trim();
  const accountNumber = document.querySelector("#ownAccount").value.trim();
  const accountNumber2 = document.querySelector("#ownAccount2").value.trim();
  const txid = document.querySelector("#ownTxid").value.trim();

  if (!telegram || !txid || !accountNumber) {
    alert("Введите Telegram, номер торгового счета и TXID.");
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
        plan: "own-broker",
        account_number: accountNumber,
        account_number_2: accountNumber2
      })
    });

    const data = await response.json();

    if (!data.ok) {
      button.disabled = false;
      button.textContent = "Проверить оплату";

      alert(data.message || "Оплата не подтверждена.");
      return;
    }

    licenseSuccessModal("Оплата подтверждена", data, "");
  } catch (error) {
    button.disabled = false;
    button.textContent = "Проверить оплату";

    alert("Ошибка проверки оплаты. Попробуйте позже.");
  }
}

function renewalForm() {
  openModal(`
    <h2>Продление лицензии</h2>

    <p>
      Стоимость продления: <strong>30 USDT TRC20</strong> (+30 дней к лицензии)
    </p>

    <div class="wallet-box">
      <span>USDT TRC20 кошелек:</span>
      <strong>${PAYMENT_WALLET}</strong>
    </div>

    <input class="form-input" id="renewKey" placeholder="Ваш License Key *" />
    <input class="form-input" id="renewTxid" placeholder="TXID транзакции *" />

    <button class="modal-ok" id="renewBtn">
      Проверить оплату
    </button>
  `);

  document.querySelector("#renewBtn").addEventListener("click", verifyRenewalPayment);
}

async function verifyRenewalPayment() {
  const licenseKey = document.querySelector("#renewKey").value.trim();
  const txid = document.querySelector("#renewTxid").value.trim();

  if (!licenseKey || !txid) {
    alert("Введите License Key и TXID.");
    return;
  }

  const button = document.querySelector("#renewBtn");
  button.disabled = true;
  button.textContent = "Проверяем...";

  try {
    const response = await fetch(`${API_URL}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        txid,
        plan: "own-broker-renewal",
        license_key: licenseKey
      })
    });

    const data = await response.json();

    if (!data.ok) {
      button.disabled = false;
      button.textContent = "Проверить оплату";

      alert(data.message || "Оплата не подтверждена.");
      return;
    }

    licenseSuccessModal(
      "Лицензия продлена",
      data,
      "Если вы запускаете бота на телефоне или в облаке cTrader — замените ключ в параметрах бота на новый (выше). На компьютере прежний ключ продолжит работать автоматически."
    );
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
      Зарегистрируйтесь в FxPro по реферальной ссылке, пополните баланс от $400
      и отправьте заявку на проверку.
    </p>

    <a class="ref-link" href="https://fxpro-direct.com/ru/partner/11310160?platform=web" target="_blank" rel="noopener">
      Зарегистрироваться в FxPro по реферальной ссылке →
    </a>

    <input class="form-input" id="refEmail" placeholder="Email" />
    <input class="form-input" id="refTelegram" placeholder="Telegram username *" />
    <input class="form-input" id="refFxpro" placeholder="FxPro ID / Email аккаунта *" />
    <input class="form-input" id="refAccount" placeholder="Номер торгового счета cTrader *" />

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
  const accountNumber = document.querySelector("#refAccount").value.trim();

  if (!telegram || !fxproId || !accountNumber) {
    alert("Введите Telegram, FxPro ID и номер торгового счета.");
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
        fxpro_id: fxproId,
        account_number: accountNumber
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
        Напишите менеджеру, чтобы он проверил подключение и активировал доступ.
      </p>

      <a class="support-link" href="https://t.me/manager_sk_ua" target="_blank">
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
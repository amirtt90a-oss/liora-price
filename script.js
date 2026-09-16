let prices = {};

function formatPrice(value) {
  return Number(value).toLocaleString("fa-IR") + " تومان";
}

async function loadPrices() {
  try {
    const response = await fetch("prices.json?x=" + Date.now());
    prices = await response.json();

    document.getElementById("gold18").textContent =
      formatPrice(prices.gold18.value);

    document.getElementById("gold24").textContent =
      formatPrice(prices.gold24.value);

    document.getElementById("coin").textContent =
      formatPrice(prices.coin.value);

  } catch (error) {
    document.getElementById("gold18").textContent = "خطا";
    document.getElementById("gold24").textContent = "خطا";
    document.getElementById("coin").textContent = "خطا";
  }
}


function calculateGold() {

  const type = document.getElementById("goldType").value;
  const weight = Number(document.getElementById("weight").value);
  const wage = Number(document.getElementById("wage").value) || 0;
  const profit = Number(document.getElementById("profit").value) || 0;
  const tax = Number(document.getElementById("tax").value) || 0;

  const result = document.getElementById("priceResult");

  if (!weight || weight <= 0) {
    result.textContent = "وزن را وارد کنید";
    return;
  }

  if (!prices[type]) {
    result.textContent = "قیمت هنوز دریافت نشده";
    return;
  }

  const base = prices[type].value * weight;
  const wageAmount = base * wage / 100;
  const profitAmount = (base + wageAmount) * profit / 100;
  const subtotal = base + wageAmount + profitAmount;
  const taxAmount = subtotal * tax / 100;
  const finalPrice = subtotal + taxAmount;

  result.innerHTML =
    "ارزش طلا: " + formatPrice(base) +
    "<br>اجرت: " + formatPrice(wageAmount) +
    "<br>سود: " + formatPrice(profitAmount) +
    "<br>مالیات: " + formatPrice(taxAmount) +
    "<hr>" +
    "<strong>قیمت نهایی: " + formatPrice(finalPrice) + "</strong>";
}


function convertKarat() {

  const weight = Number(document.getElementById("karatWeight").value);
  const fromKarat = Number(document.getElementById("fromKarat").value);
  const toKarat = Number(document.getElementById("toKarat").value);

  const result = document.getElementById("karatResult");

  if (
    weight <= 0 ||
    fromKarat <= 0 ||
    toKarat <= 0
  ) {
    result.textContent = "همه مقادیر را درست وارد کنید";
    return;
  }

  const newWeight =
    weight * fromKarat / toKarat;

  result.innerHTML =
    "<strong>" +
    newWeight.toLocaleString("fa-IR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }) +
    " گرم</strong>";
}


loadPrices();

// ===============================
// Liora Price
// ===============================

const PRICE_FILE = "prices.json";

let prices = {
    gold18: 0,
    gold24: 0,
    coin: 0
};


// -------------------------------
// اعداد فارسی
// -------------------------------

function toPersianNumber(value) {
    return String(value).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit]);
}


// -------------------------------
// فرمت تومان
// -------------------------------

function formatPrice(value) {
    if (!value || isNaN(value)) {
        return "—";
    }

    return toPersianNumber(
        Math.round(value).toLocaleString("en-US")
    );
}


// -------------------------------
// دریافت قیمت‌ها
// -------------------------------

async function loadPrices() {

    const updateText = document.getElementById("updateText");

    try {

        const response = await fetch(
            `${PRICE_FILE}?t=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Price file could not be loaded.");
        }

        const data = await response.json();

        prices.gold18 = Number(data.gold18?.value || 0);
        prices.gold24 = Number(data.gold24?.value || 0);
        prices.coin = Number(data.coin?.value || 0);


        document.getElementById("gold18").textContent =
            formatPrice(prices.gold18);

        document.getElementById("gold24").textContent =
            formatPrice(prices.gold24);

        document.getElementById("coin").textContent =
            formatPrice(prices.coin);


        const lastUpdate = data.updated_fa || data.updated_at || "نامشخص";

        document.getElementById("lastUpdate").textContent =
            toPersianNumber(lastUpdate);

        updateText.textContent = "قیمت‌ها به‌روز هستند";


        calculatePrice();

    } catch (error) {

        console.error("Price loading error:", error);

        updateText.textContent = "خطا در دریافت قیمت";

        document.getElementById("gold18").textContent = "—";
        document.getElementById("gold24").textContent = "—";
        document.getElementById("coin").textContent = "—";
        document.getElementById("lastUpdate").textContent = "نامشخص";
    }
}


// -------------------------------
// ماشین حساب قیمت طلا
// -------------------------------

function calculatePrice() {

    const type = document.getElementById("goldType").value;

    const weight =
        Number(document.getElementById("weight").value) || 0;

    const wage =
        Number(document.getElementById("wage").value) || 0;

    const profit =
        Number(document.getElementById("profit").value) || 0;

    const tax =
        Number(document.getElementById("tax").value) || 0;


    const price =
        type === "gold24"
            ? prices.gold24
            : prices.gold18;


    const base = price * weight;

    const wageAmount =
        base * wage / 100;

    const profitAmount =
        (base + wageAmount) * profit / 100;

    const subtotal =
        base + wageAmount + profitAmount;

    const taxAmount =
        subtotal * tax / 100;

    const finalPrice =
        subtotal + taxAmount;


    document.getElementById("baseAmount").textContent =
        `${formatPrice(base)} تومان`;

    document.getElementById("wageAmount").textContent =
        `${formatPrice(wageAmount)} تومان`;

    document.getElementById("profitAmount").textContent =
        `${formatPrice(profitAmount)} تومان`;

    document.getElementById("taxAmount").textContent =
        `${formatPrice(taxAmount)} تومان`;

    document.getElementById("finalAmount").textContent =
        `${formatPrice(finalPrice)} تومان`;
}


// -------------------------------
// تبدیل عیار
// -------------------------------

function convertKarat() {

    const weight =
        Number(document.getElementById("karatWeight").value) || 0;

    const fromKarat =
        Number(document.getElementById("fromKarat").value);

    const toKarat =
        Number(document.getElementById("toKarat").value);


    if (
        !weight ||
        !fromKarat ||
        !toKarat
    ) {
        document.getElementById("convertedWeight").textContent = "۰";
        return;
    }


    // وزن جدید =
    // وزن اولیه × عیار اولیه ÷ عیار مقصد

    const result =
        weight * fromKarat / toKarat;


    document.getElementById("convertedWeight").textContent =
        toPersianNumber(
            result.toLocaleString("en-US", {
                maximumFractionDigits: 4
            })
        );
}


// -------------------------------
// اتصال ورودی‌ها
// -------------------------------

function setupCalculator() {

    const calculatorInputs = [
        "goldType",
        "weight",
        "wage",
        "profit",
        "tax"
    ];

    calculatorInputs.forEach(id => {

        const element = document.getElementById(id);

        element.addEventListener("input", calculatePrice);
        element.addEventListener("change", calculatePrice);
    });


    const converterInputs = [
        "karatWeight",
        "fromKarat",
        "toKarat"
    ];

    converterInputs.forEach(id => {

        const element = document.getElementById(id);

        element.addEventListener("input", convertKarat);
        element.addEventListener("change", convertKarat);
    });
}


// -------------------------------
// شروع سایت
// -------------------------------

document.addEventListener("DOMContentLoaded", () => {

    setupCalculator();

    loadPrices();

    // هر ۱ دقیقه قیمت موجود در سایت را بررسی می‌کند.
    // منبع اصلی قیمت توسط زمان‌بندی GitHub به‌روزرسانی می‌شود.
    setInterval(loadPrices, 60 * 1000);

});
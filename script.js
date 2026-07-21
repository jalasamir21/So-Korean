/* ===================================================================
   EDITABLE RATES
   =================================================================== */
const DOLLAR_RATE = 54;
const SHIPPING_PER_KG = 405;   // EGP per kg
const DISCOUNT = 0.3;          // 30% off, applied on the "discounted" branch
const PROFIT = 0.3;            // 30% profit margin

/*
  Order-type -> which pricing branch it uses.
  usesFullPrice: true  -> serviceFee = price * DOLLAR_RATE
  usesFullPrice: false -> serviceFee = (price - DISCOUNT * price) * DOLLAR_RATE

  Assumption: "Time Deal" and "Eligible for code" use the full-price branch,
  "Non Time Deal" and "Non-eligible for code" use the discounted branch —
  same mapping as the original time/non-time logic. Flip these booleans if
  YesStyle should work the other way round.
*/
// non: price*54 + 3% + 405*weight +30% 
// eligible for code:price*54 + 3% + 405*weight + 20%
const RATES = {
  style_korean: {
    time:   { label: "Time Deal",     usesFullPrice: true , sk: true},
    normal: { label: "Non Time Deal", usesFullPrice: false, sk: true}
  },
  yes_style: {
    eligible:    { label: "Eligible for code",     usesFullPrice: true, eligible: true , sk: false},
    noneligible: { label: "Non-eligible for code", usesFullPrice: true , eligible: false, sk: false}
  }
};

const PLATFORM_META = {
  style_korean: {
    title: "StyleKorean order",
    orderTypeKey: "style_korean",
    options: ["time", "normal"]
  },
  yes_style: {
    title: "YesStyle order",
    orderTypeKey: "yes_style",
    options: ["eligible", "noneligible"]
  }
};

let selectedPlatform = null;

const page1 = document.getElementById("page-1");
const page2 = document.getElementById("page-2");
const tracker = document.getElementById("tracker");
const orderTypeGroup = document.getElementById("orderTypeGroup");
const page2Title = document.getElementById("page2Title");
const platformChosenLabel = document.getElementById("platformChosenLabel");
const result = document.getElementById("result");

/* ---------- Page 1: platform selection ---------- */
document.querySelectorAll(".platform-card").forEach(card => {
  card.addEventListener("click", () => {
    selectedPlatform = card.dataset.platform;
    goToPage2();
  });
});

function goToPage2(){
  const meta = PLATFORM_META[selectedPlatform];

  page2Title.textContent = meta.title;
  platformChosenLabel.textContent =
    "Change platform (" + (selectedPlatform === "style_korean" ? "StyleKorean" : "YesStyle") + ")";

  orderTypeGroup.innerHTML = '<legend>Order type</legend>';
  meta.options.forEach((key, i) => {
    const cfg = RATES[meta.orderTypeKey][key];
    const wrap = document.createElement("div");
    wrap.className = "radio-option";
    wrap.innerHTML = `
      <input type="radio" name="orderType" id="opt-${key}" value="${key}" ${i === 0 ? "checked" : ""}>
      <label for="opt-${key}">${cfg.label}</label>
    `;
    orderTypeGroup.appendChild(wrap);
  });

  result.classList.remove("is-visible");

  page1.classList.remove("is-active");
  page2.classList.add("is-active");
  setTrackerStep(2);
}

/* ---------- Back button ---------- */
document.getElementById("backBtn").addEventListener("click", () => {
  page2.classList.remove("is-active");
  page1.classList.add("is-active");
  setTrackerStep(1);
});

function setTrackerStep(step){
  tracker.querySelectorAll(".tracker__step").forEach(el => {
    el.classList.toggle("is-active", Number(el.dataset.step) <= step);
  });
}

/* ---------- Calculate ---------- */
document.getElementById("calculateBtn").addEventListener("click", calculate);

function calculate(){
  const price = Number(document.getElementById("price").value);
  const weight = Number(document.getElementById("weight").value);
  const orderType = document.querySelector('input[name="orderType"]:checked')?.value;

  if (price <= 0 || weight <= 0 || !orderType){
    alert("Please enter valid values.");
    return;
  }

  const meta = PLATFORM_META[selectedPlatform];
  const cfg = RATES[meta.orderTypeKey][orderType];

  const shipping = (weight / 1000) * SHIPPING_PER_KG;
  let total, totalWithProfit;

  let serviceFee;
  if (cfg.usesFullPrice){
    serviceFee = price * DOLLAR_RATE;
  } else {
    serviceFee = (price - (DISCOUNT * price)) * DOLLAR_RATE;
  }
  // non: price*54 + 3% + 405*weight +30% 
  // eligible for code:price*54 + 3% + 405*weight + 20%
  if (cfg.eligible === true && cfg.sk === false) {
     total = serviceFee + (0.03 * serviceFee) + shipping ;
     totalWithProfit = total + (0.2 * total);
  }
  else if (cfg.eligible === false && cfg.sk === false) {
     total = serviceFee + (0.03 * serviceFee) + shipping ;
     totalWithProfit = total + (0.3 * total);
  }
  else{
     total = serviceFee + (0.03 * serviceFee) + (0.07 * (serviceFee * 0.03 + serviceFee)) + shipping;
     totalWithProfit = total + PROFIT * total;

  }

  

  document.getElementById("outProductPrice").innerHTML = price.toLocaleString() + " $";
  document.getElementById("outTotalEGP").innerHTML = totalWithProfit.toLocaleString() + " EGP";

  result.classList.add("is-visible");
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
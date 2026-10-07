const numberPrompt = document.querySelector("#number-prompt");
const answerForm = document.querySelector("#answer-form");
const answerInput = document.querySelector("#answer");
const feedback = document.querySelector("#feedback");
const categorySelect = document.querySelector("#category");
const correctCount = document.querySelector("#correct-count");
const answeredCount = document.querySelector("#answered-count");
const checkButton = answerForm.querySelector("button[type='submit']");

const ranges = {
  "0-20": [0, 20],
  "20-70": [20, 70],
  "70-100": [70, 100],
  "0-100": [0, 100],
};

const units = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
];

function underHundred(number) {
  if (number <= 16) return units[number];
  if (number < 20) return `dix-${units[number - 10]}`;

  if (number < 70) {
    const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];
    const ten = Math.floor(number / 10);
    const remainder = number % 10;
    if (remainder === 0) return tens[ten];
    if (remainder === 1) return `${tens[ten]} et un`;
    return `${tens[ten]}-${units[remainder]}`;
  }

  if (number < 80) {
    const remainder = number - 60;
    if (remainder === 11) return "soixante et onze";
    return `soixante-${underHundred(remainder)}`;
  }

  const remainder = number - 80;
  if (remainder === 0) return "quatre-vingts";
  return `quatre-vingt-${underHundred(remainder)}`;
}

function underThousand(number) {
  if (number < 100) return underHundred(number);

  const hundreds = Math.floor(number / 100);
  const remainder = number % 100;
  const prefix = hundreds === 1 ? "cent" : `${units[hundreds]} cent`;
  if (remainder === 0) return hundreds > 1 ? `${prefix}s` : prefix;
  return `${prefix} ${underHundred(remainder)}`;
}

function numberInFrench(number) {
  if (number === 1000000) return "un million";
  if (number < 1000) return underThousand(number);

  const thousands = Math.floor(number / 1000);
  const remainder = number % 1000;
  const thousandsInFrench = underThousand(thousands)
    .replace(/cents\b/g, "cent")
    .replace(/vingts\b/g, "vingt");
  const prefix = thousands === 1 ? "mille" : `${thousandsInFrench} mille`;
  if (remainder === 0) return prefix;
  return `${prefix} ${underThousand(remainder)}`;
}

function normalizeAnswer(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z]/g, "");
}

function nextQuestion() {
  window.clearTimeout(questionTimer);
  const [minimum, maximum] = ranges[categorySelect.value];
  const nextNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  numberPrompt.textContent = nextNumber.toLocaleString("fr-FR");
  numberPrompt.dataset.answer = nextNumber;
  answerInput.value = "";
  answerInput.disabled = false;
  checkButton.disabled = false;
  answerInput.focus();
  feedback.textContent = "Take your time — you’ve got this.";
  feedback.className = "feedback";
}

function checkAnswer(event) {
  event.preventDefault();
  if (answerInput.disabled) return;
  const value = answerInput.value.trim();
  if (!value) {
    feedback.textContent = "Type your answer in French first.";
    feedback.className = "feedback is-incorrect";
    answerInput.focus();
    return;
  }

  const expected = numberInFrench(Number(numberPrompt.dataset.answer));
  const isCorrect = normalizeAnswer(value) === normalizeAnswer(expected);
  answerInput.disabled = true;
  checkButton.disabled = true;
  const answered = Number(answeredCount.textContent) + 1;
  answeredCount.textContent = answered;

  if (isCorrect) {
    correctCount.textContent = Number(correctCount.textContent) + 1;
    feedback.textContent = "Très bien ! That’s exactly right.";
    feedback.className = "feedback is-correct";
  } else {
    feedback.replaceChildren(
      document.createTextNode("Not quite — it’s "),
      Object.assign(document.createElement("strong"), {
        className: "correct-answer",
        textContent: expected,
      }),
      document.createTextNode(". Give the next one a try!"),
    );
    feedback.className = "feedback is-incorrect";
  }

  questionTimer = window.setTimeout(nextQuestion, isCorrect ? 1400 : 6000);
}

let questionTimer;

answerForm.addEventListener("submit", checkAnswer);
categorySelect.addEventListener("change", nextQuestion);
document.querySelector("#skip-button").addEventListener("click", nextQuestion);
document.querySelector("#reset-button").addEventListener("click", () => {
  correctCount.textContent = "0";
  answeredCount.textContent = "0";
  nextQuestion();
});

nextQuestion();

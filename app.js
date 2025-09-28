const STORAGE_KEY = 'flashcards_app_final';
let data = { categories: [], currentCategoryIndex: 0 };
let currentCardIndex = 0;
let showingFront = true;
let editingIndex = null;

// DOM
const flashcard = document.getElementById('flashcard');
const counter = document.getElementById('cardCounter');
const categorySelect = document.getElementById('categorySelect');
const modal = document.getElementById('formModal');
const frontInput = document.getElementById('frontInput');
const backInput = document.getElementById('backInput');
const formTitle = document.getElementById('formTitle');
const categoryModal = document.getElementById('categoryModal');
const categoryNameInput = document.getElementById('categoryNameInput');
const showUnlearnedOnly = document.getElementById('showUnlearnedOnly');

// --- Load / Save ---
function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw)
    try {
      data = JSON.parse(raw);
    } catch {
      data = { categories: [], currentCategoryIndex: 0 };
    }
  if (data.categories.length === 0) {
    data.categories = [
      {
        name: 'Mặc định',
        cards: [{ front: 'Nhấn để lật', back: 'Mặt sau', learned: false }],
      },
    ];
  }
  renderCategorySelect();
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- Render ---
function getVisibleCards() {
  const cat = data.categories[data.currentCategoryIndex];
  if (showUnlearnedOnly.checked) {
    return cat.cards.filter((c) => !c.learned);
  }
  return cat.cards;
}

function renderCard() {
  const cardsToShow = getVisibleCards();
  if (cardsToShow.length === 0) {
    flashcard.textContent = 'Chưa có thẻ';
    counter.textContent = '0 / 0';
    return;
  }
  if (currentCardIndex >= cardsToShow.length) currentCardIndex = 0;
  const card = cardsToShow[currentCardIndex];
  flashcard.textContent = showingFront ? card.front : card.back;
  counter.textContent = `${currentCardIndex + 1} / ${cardsToShow.length}`;
}

// --- Category ---
function renderCategorySelect() {
  categorySelect.innerHTML = '';
  data.categories.forEach((c, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = c.name;
    if (i === data.currentCategoryIndex) opt.selected = true;
    categorySelect.appendChild(opt);
  });
}

// --- Card Control ---
function flipCard() {
  showingFront = !showingFront;
  if (!showingFront) {
    // đánh dấu đã học khi lật sang mặt sau
    const card = getVisibleCards()[currentCardIndex];
    const cat = data.categories[data.currentCategoryIndex];
    const realIndex = cat.cards.indexOf(card);
    cat.cards[realIndex].learned = true;
    saveData();
  }
  renderCard();
}

function nextCard() {
  const cardsToShow = getVisibleCards();
  if (cardsToShow.length === 0) return;
  currentCardIndex = (currentCardIndex + 1) % cardsToShow.length;
  showingFront = true;
  renderCard();
}

function prevCard() {
  const cardsToShow = getVisibleCards();
  if (cardsToShow.length === 0) return;
  currentCardIndex =
    (currentCardIndex - 1 + cardsToShow.length) % cardsToShow.length;
  showingFront = true;
  renderCard();
}

// --- Modal Form ---
function showForm(isEdit = false) {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  const cat = data.categories[data.currentCategoryIndex];
  if (isEdit) {
    editingIndex = currentCardIndex;
    const card = getVisibleCards()[currentCardIndex];
    formTitle.textContent = 'Sửa thẻ';
    frontInput.value = card.front;
    backInput.value = card.back;
  } else {
    editingIndex = null;
    formTitle.textContent = 'Thêm thẻ';
    frontInput.value = '';
    backInput.value = '';
  }
  frontInput.focus();
}
function hideForm() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function saveForm() {
  const front = frontInput.value.trim();
  const back = backInput.value.trim();
  if (!front) {
    alert('Mặt trước không được để trống');
    return;
  }
  const cat = data.categories[data.currentCategoryIndex];
  if (editingIndex !== null) {
    const card = getVisibleCards()[editingIndex];
    const realIndex = cat.cards.indexOf(card);
    cat.cards[realIndex] = {
      front,
      back,
      learned: cat.cards[realIndex].learned || false,
    };
    currentCardIndex = editingIndex;
  } else {
    cat.cards.push({ front, back, learned: false });
    currentCardIndex = cat.cards.length - 1;
  }
  saveData();
  hideForm();
  showingFront = true;
  renderCard();
}

// --- Category Modal ---
function showCategoryModal() {
  categoryModal.classList.remove('hidden');
  categoryNameInput.value = '';
  categoryNameInput.focus();
}
function hideCategoryModal() {
  categoryModal.classList.add('hidden');
}
function saveCategory() {
  const name = categoryNameInput.value.trim();
  if (!name) return;
  data.categories.push({ name, cards: [] });
  data.currentCategoryIndex = data.categories.length - 1;
  saveData();
  hideCategoryModal();
  renderCategorySelect();
  currentCardIndex = 0;
  renderCard();
}

// --- Event Listeners ---
flashcard.addEventListener('touchend', (e) => {
  e.preventDefault();
  flipCard();
});
flashcard.addEventListener('click', flipCard);

document.getElementById('nextBtn').addEventListener('click', nextCard);
document.getElementById('prevBtn').addEventListener('click', prevCard);
document
  .getElementById('addBtn')
  .addEventListener('click', () => showForm(false));
document
  .getElementById('editBtn')
  .addEventListener('click', () => showForm(true));
document.getElementById('deleteBtn').addEventListener('click', () => {
  const cardsToShow = getVisibleCards();
  if (cardsToShow.length === 0) return;
  const cat = data.categories[data.currentCategoryIndex];
  const card = cardsToShow[currentCardIndex];
  const realIndex = cat.cards.indexOf(card);
  cat.cards.splice(realIndex, 1);
  currentCardIndex = 0;
  showingFront = true;
  saveData();
  renderCard();
});

document.getElementById('saveBtn').addEventListener('click', saveForm);
document.getElementById('cancelBtn').addEventListener('click', hideForm);

categorySelect.addEventListener('change', (e) => {
  data.currentCategoryIndex = parseInt(e.target.value);
  currentCardIndex = 0;
  showingFront = true;
  renderCard();
});

document
  .getElementById('addCategoryBtn')
  .addEventListener('click', showCategoryModal);
document
  .getElementById('cancelCategoryBtn')
  .addEventListener('click', hideCategoryModal);
document
  .getElementById('saveCategoryBtn')
  .addEventListener('click', saveCategory);

showUnlearnedOnly.addEventListener('change', () => {
  currentCardIndex = 0;
  showingFront = true;
  renderCard();
});

// Dark mode
document.getElementById('themeToggleBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderCard();
});

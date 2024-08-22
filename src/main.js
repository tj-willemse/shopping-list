import '/styles/modern.css';
import '/styles/style.css';
import '/styles/components/header.css';
import '/styles/components/form.css';
import '/styles/components/items.css';
import '/styles/util.css';

// Selecting DOM elements
const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const formBtn = itemForm.querySelector('button');
const clearBtn = document.getElementById('clear');
const itemFilter = document.getElementById('filter');
let isEditMode = false;
let currentItem = null; // To track the item being edited
const STORAGE_NAMESPACE = 'myShoppingListApp';

// Utility functions
function saveDataToLocalStorage(data) {
  localStorage.setItem(
    `${STORAGE_NAMESPACE}-shoppingList`,
    JSON.stringify(data)
  );
}

function getDataFromLocalStorage() {
  const storedData = localStorage.getItem(`${STORAGE_NAMESPACE}-shoppingList`);
  return storedData ? JSON.parse(storedData) : [];
}

// Functions
// adding function once clicking on enter item
function onAddItemSubmit(e) {
  e.preventDefault();
  const newItem = itemInput.value.trim().toLowerCase();
  if (newItem === '') {
    alert('Please enter a value');
    return;
  }

  if (isDuplicateItem(newItem)) {
    alert('This item is already in your list.');
    return;
  }

  if (isEditMode) {
    // Update the current item
    currentItem.firstChild.textContent = newItem;
    clearEditMode();
    updateLocalStorage();
  } else {
    // Add a new item
    addItemToDom(newItem);
    updateLocalStorage();
  }

  itemInput.value = '';
  toggleClearButton();

  function isDuplicateItem(item) {
    const items = itemList.getElementsByTagName('li');
    return Array.from(items).some((existingItem) => {
      return existingItem.firstChild.textContent.toLowerCase() === item;
    });
  }
}

// Adding / Creating an item to the DOM
function addItemToDom(item) {
  const li = document.createElement('li'); // Create a new list item
  li.className = 'list-content';
  li.appendChild(document.createTextNode(item));

  // Create a container for the icons
  const iconsContainer = document.createElement('div');
  iconsContainer.className = 'icons';

  // Create the edit button
  const editButton = document.createElement('button');
  editButton.className = 'icon-button';
  editButton.innerHTML = '<i class="lni lni-pencil"></i>';
  editButton.id = 'editItem';
  iconsContainer.appendChild(editButton);

  // Create the remove button
  const removeButton = document.createElement('button');
  removeButton.className = 'icon-button';
  removeButton.id = 'removeButtonId';
  removeButton.innerHTML = '<i class="lni lni-trash-can"></i>';
  iconsContainer.appendChild(removeButton);

  li.appendChild(iconsContainer);
  itemList.appendChild(li);
}

// Editing the item once clicking on the icon
function setItemToEdit(e) {
  if (e.target.closest('button').id === 'editItem') {
    isEditMode = true;
    currentItem = e.target.closest('li'); // Get the closest li element
    itemList
      .querySelectorAll('li')
      .forEach((i) => i.classList.remove('edit-mode'));
    currentItem.classList.add('edit-mode'); // Add edit-mode class to the current item
    formBtn.innerHTML = '<i class="lni lni-pencil"></i> Update Item';
    formBtn.style.backgroundColor = '#228B22';
    itemInput.value = currentItem.firstChild.textContent.trim();
  }
}

// Removing an item after clicking on the icon
function removeItem(e) {
  if (e.target.closest('button').id === 'removeButtonId') {
    if (confirm('Are you sure?')) {
      const item = e.target.closest('li');
      item.remove();
      updateLocalStorage();
      toggleClearButton();

      // If the item being edited is removed, clear edit mode
      if (isEditMode && currentItem === item) {
        clearEditMode();
      }
    }
  }
}

// Clear the edit mode
function clearEditMode() {
  isEditMode = false;
  currentItem = null;
  formBtn.innerHTML = '<i class="lni lni-plus"></i> Add Item';
  formBtn.style.backgroundColor = '#333';
  itemInput.value = '';
  itemList
    .querySelectorAll('li')
    .forEach((i) => i.classList.remove('edit-mode'));
}
// clear all button
function clearAll(e) {
  while (itemList.firstChild) {
    itemList.removeChild(itemList.firstChild);
  }
  localStorage.removeItem(`${STORAGE_NAMESPACE}-shoppingList`);
  toggleClearButton();
}

// toggle clear button
function toggleClearButton() {
  const clearAll = clearBtn;
  if (itemList.children.length > 0) {
    clearAll.style.display = 'block';
  } else {
    clearAll.style.display = 'none';
  }
  updateLocalStorage();
}

// filter items
function filterItems(e) {
  const text = e.target.value.toLowerCase();
  const items = itemList.getElementsByTagName('li');

  Array.from(items).forEach((item) => {
    const itemName = item.firstChild.textContent.toLowerCase();
    item.classList.toggle('hidden', !itemName.includes(text));
  });
}

// Function to load items from local storage
function loadItemsFromLocalStorage() {
  const savedData = getDataFromLocalStorage();

  if (savedData.items) {
    savedData.items.forEach((item) => addItemToDom(item));
  }
}

// Update local storage with the current list
function updateLocalStorage() {
  const items = Array.from(itemList.getElementsByTagName('li')).map((item) =>
    item.firstChild.textContent.trim().toLowerCase()
  );
  const shouldShowClearButton = itemList.children.length > 0;
  const data = {
    items,
    shouldShowClearButton,
  };
  saveDataToLocalStorage(data);
}

// Event listeners
itemForm.addEventListener('submit', onAddItemSubmit);
itemList.addEventListener('click', setItemToEdit);
itemList.addEventListener('click', removeItem);
itemFilter.addEventListener('keyup', filterItems);
clearBtn.addEventListener('click', clearAll);

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadItemsFromLocalStorage);

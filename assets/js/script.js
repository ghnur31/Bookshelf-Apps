const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('form');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBooks();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const unreadBooklist = document.getElementById('belumDibaca');
  unreadBooklist.innerHTML = '';

  const readedBooklist = document.getElementById('selesaiDibaca');
  readedBooklist.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete)
      unreadBooklist.append(bookElement);
    else
      readedBooklist.append(bookElement);
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

const searchForm = document.querySelector('.cari-buku');
searchForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const keyword = document.getElementById('cariBuku').value.toLowerCase();
  searchBooks(keyword);
});


function addBooks() {
  const title = document.getElementById('judul').value;
  const author = document.getElementById('penulis').value;
  const year = document.getElementById('tahun').value;
  const isComplete = document.getElementById('isRead').checked;


  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete, false);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id: +new Date,
    title,
    author,
    year: Number(year),
    isComplete
  }
}

function makeBook(bookObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = "Penulis : " + bookObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = "Tahun : " + bookObject.year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  const btnWrap = document.createElement('div');
  btnWrap.classList.add('btn-wrap');

  if (bookObject.isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');

    undoButton.addEventListener('click', function () {
      undoBookFromReaded(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');

    deleteButton.addEventListener('click', function () {
      Swal.fire({
        title: 'Apakah kamu yakin?',
        text: "Kamu tidak bisa mengembalikannya",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
          removeBookFromReaded(bookObject.id);
        }
      });
    });    

    btnWrap.append(undoButton, deleteButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');

    checkButton.addEventListener('click', function () {
      addBookReaded(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');

    deleteButton.addEventListener('click', function () {
      Swal.fire({
        title: 'Apakah kamu yakin?',
        text: "Kamu tidak bisa mengembalikannya",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
          removeBookFromReaded(bookObject.id);
        }
      });
    });  

    btnWrap.append(checkButton, deleteButton);
  }
  container.appendChild(btnWrap);
  return container;
}

function addBookReaded(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function removeBookFromReaded(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromReaded(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks(keyword) {
  const unreadBooklist = document.getElementById('belumDibaca');
  const readedBooklist = document.getElementById('selesaiDibaca');

  const matchingBooks = books.filter(function (book) {
    const bookTitle = book.title.toLowerCase();
    return bookTitle.includes(keyword);
  });

  unreadBooklist.innerHTML = '';
  readedBooklist.innerHTML = '';

  for (const bookItem of matchingBooks) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      unreadBooklist.append(bookElement);
    } else {
      readedBooklist.append(bookElement);
    }
  }
}

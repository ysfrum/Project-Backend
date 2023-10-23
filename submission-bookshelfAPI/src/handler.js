/* eslint-disable max-len */
const { nanoid } = require('nanoid');
const books = require('./books');

// Menambahkan buku
const addBookHandler = (request, h) => {
    const { 
      name, 
      year, 
      author, 
      summary, 
      publisher, 
      pageCount, 
      readPage, 
      reading,
    } = request.payload;

    /*
      Client tidak melampirkan properti name pada request body. 
      Bila hal ini terjadi, server akan merespons dengan:
        Status Code: 400
        Response Body:
    */

    if (!name) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      });

      response.code(400);
      return response;
    }

    /*
      Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount. 
      Bila hal ini terjadi, server akan merespons dengan:
        Status Code: 400
        Response Body:
    */

    if (readPage > pageCount) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      });
    
      response.code(400);
      return response;
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };

    books.push(newBook);
    const isSuccess = books.filter((book) => book.id === id).length > 0;

    /*
      Bila buku berhasil dimasukkan, server akan mengembalikan respons dengan:
        Status Code: 201
        Response Body:
    */

    if (isSuccess) {
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      });

      response.code(201);
      return response;
    }

    /*
      Server gagal memasukkan buku karena alasan umum (generic error).
      Bila hal ini terjadi, server akan merespons dengan:
        Status Code: 500
        Response Body:
    */
        
    const response = h.response({
      status: 'error',
      message: 'Buku gagal ditambahkan',
    });

    response.code(500);
    return response;
};

// Mendapatkan seluruh buku yang disimpan
const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  let filteredBooks = books;

  if (name) {
    filteredBooks = books.filter((bookName) => bookName.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (reading) {
    filteredBooks = books.filter((book) => Number(book.reading) === Number(reading));
  }

  if (finished) {
    filteredBooks = books.filter((book) => Number(book.finished) === Number(finished));
  }

  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });

  response.code(200);
  return response;
};

// Mennampilkan detail buku melalui ID Buku
const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((booksId) => booksId.id === id)[0];

  /*
    Bila buku dengan id yang dilampirkan oleh client 
    tidak ditemukan, maka server mengembalikan respons dengan:
      Status Code: 404
      Response Body:
  */
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  /*
    Bila buku dengan id yang dilampirkan oleh client 
    ditemukan, maka server mengembalikan respons dengan:
      Status Code: 200
      Response Body:
  */
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

// Mengedit isi buku
const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const updatedAt = new Date().toISOString();
  const index = books.findIndex((book) => book.id === id);

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  /*
    Client tidak melampirkan properti name pada request body.
    Bila hal ini terjadi, server akan meresponse dengan:
      Status Code: 400
      Response Body: 
  */

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });

    response.code(400);
    return response;
  }

  /*
    Client melampirkan nilai properti readPage yang lebih
    besar dari nilai properti pageCount.Bila hal ini terjadi, 
    server akan meresponse dengan:
      Status Code: 400
      Response Body: 
  */
  
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
      
    response.code(400);
    return response;
  }

  if (index !== -1) {
    const finished = pageCount === readPage;

    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    /*
      Buku berhasil diperbarui, server akan meresponse dengan:
        Status Code: 200
        Response Body: 
    */  
    
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  /*
    Buku gagal diperbarui, server akan meresponse dengan:
      Status Code: 404
      Response Body:
  */

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });

  response.code(404);
  return response;
};

// Menghapus buku
const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const index = books.findIndex((nt) => nt.id === id);

  /*
    Bila id dimiliki oleh salah satu buku, buku akan dihapus
    dan server akan mengembalikan respons dengan:
      Status COde: 200
      Response Body:
  */

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });

    response.code(200);
    return response;
  }

  /*
    Bila id yang dilampirkan tidak dimiliki oleh buku manapun,
    server akan mengembalikan respons dengan:
      Status Code: 404
      Response Body:
  */

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });

  response.code(404);
  return response;
};

module.exports = {
  addBookHandler, 
  getAllBooksHandler, 
  getBookByIdHandler, 
  editBookByIdHandler, 
  deleteBookByIdHandler,
};

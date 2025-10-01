import Axios from "./caller.service"

let listBooks = () => {
    return Axios.get(`/api/books/`)
}

export const bookService = {
    listBooks
}
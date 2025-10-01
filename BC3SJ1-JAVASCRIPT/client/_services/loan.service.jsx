import Axios from "./caller.service"

let newLoan = (payload) => {
    return Axios.post('/api/loans/new', payload)
}

let returnLoan = (id) => {
    return Axios.post(`/api/loans/${id}/return`)
}

let myLoans = () => {
    return Axios.get(`/api/loans/me`)
}
let listLoans = () => {
    return Axios.get(`/api/loans/`)
}

export const loanService = {
    newLoan, returnLoan, myLoans, listLoans
}
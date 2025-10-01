
let saveToken = (token => {
    localStorage.setItem('token', token)
})

let getToken = () => {
    return localStorage.getItem('token')
}

let logout = () => {
    localStorage.removeItem('token')
}

let isLogged = () => {
    let token = localStorage.getItem('token')
    return !!token
}

export const userService = {
    saveToken, getToken, logout, isLogged
}
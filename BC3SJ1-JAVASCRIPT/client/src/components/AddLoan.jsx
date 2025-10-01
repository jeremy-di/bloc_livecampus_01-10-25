import React, { useEffect, useState } from 'react';
import { loanService } from '../../_services/loan.service.jsx';
import { bookService } from '../../_services/book.service.jsx';
import { useNavigate } from 'react-router-dom';

const AddLoan = () => {

    const navigate = useNavigate()

    const [form, setForm] = useState({ livre_id: "" });
    const [books, setBooks] = useState([]);
    const [err, setErr] = useState(null);
    const [loaded, setLoaded] = useState(false);

    const naviagte = useNavigate()

    useEffect(() => {
        bookService.listBooks()
            .then(res => {
                console.log(res.data)
                setBooks(res.data)
                setLoaded(true)
            })
            .catch(error => {
                setErr(error)
                setLoaded(true)
            })
    }, [])

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        loanService.newLoan(form)
            .then(res => {
                navigate('/')
            })
            .catch(error => {
                console.log(error)
                setErr(error)
            })
    }

    if ( !loaded ) {
        return (
            <div>
                <h1>Chargement...</h1>
            </div>
        )
    }
    else if (err) {
        return (
            <div>
                <h1>Erreur : </h1>
            </div>
        )
    }
    else {
        return (
            <div>
                <form onSubmit={handleSubmit}>
                        <label htmlFor="livre_id">Choix du livre</label>
                        <select name="livre_id" id="livre_id" onChange={onChange} value={form.livre_id}>
                            {books.map(book => (
                            <option value={book.id}>{book.titre}</option>
                            ))}
                        </select>
                        <button type="submit">Valider l'emprunt</button>
                    </form>
            </div>
        );
    }

};

export default AddLoan;
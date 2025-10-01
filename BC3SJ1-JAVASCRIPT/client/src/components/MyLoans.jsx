import React, { useEffect, useState } from 'react';
import { loanService } from '../../_services/loan.service';
import { Link, useNavigate, useParams } from 'react-router-dom';

const MyLoans = () => {

    const {id} = useParams()
    const navigate = useNavigate()

    const [ loans, setLoans ] = useState(null)
    const [err, setErr] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        loanService.myLoans()
            .then(res => {
                setLoans(res.data)
                setLoaded(true)
            })
            .catch(error => {
                setErr(error)
                setLoaded(true)
            })
    },[])

     const handleReturn = () => {
        loanService.returnLoan(id)
        navigate("/loans/myloans")
    };

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
                <h1>Erreur :</h1>
            </div>
        )
    }
    else {
        return (
            <div>
                {loans.map(loan => (
                <div>
                    <h1>{loan.titre}</h1>
                    <p>Auteur : {loan.auteur}</p>
                    <p>Date d'emprunt le : {
                           new Date(loan.date_emprunt).toLocaleString("fr-FR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            }) 
                        }</p>
                    <p>Date de retour prévu le : {
                           new Date(loan.date_retour_prevue).toLocaleString("fr-FR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            }) 
                        }</p>
                    {loan.date_retour_effective !== null && (
                        <p>Date de retour effective le : {
                           new Date(loan.date_retour_effective).toLocaleString("fr-FR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            }) 
                        }</p>
                    )}
                    <a onClick={handleReturn}>rendre le livre</a>
                </div>
                ))}
                <Link to="/dashboard"><button>retour</button></Link>
            </div>
        );
    }

};

export default MyLoans;
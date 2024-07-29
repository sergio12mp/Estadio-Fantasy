import React from 'react';
import { Jugador } from '@/libs/data';
import { text } from 'stream/consumers';

const PlayerSelection: React.FC<Jugador> = ({idJugador, Nombre,idEquipo, Posicion}) => {
    return (
       <div className="col-md-3"> <a href='/perfil' style={{ textDecoration: 'none' }}> 
            <div className="card p-3 mb-2">
                <div className="d-flex justify-content-between">
                    <div className="d-flex flex-row align-items-center">
                        <div className="icon"> <i className="bx bxl-mailchimp"></i> </div>
                        <div className="ms-2 c-details">
                            <h6 className="mb-0">Equipo{idEquipo}</h6> <span>{Posicion}</span>
                        </div>
                    </div>
                </div>  
                <div className="mt-5">
                    <h3 className="heading">Nombre Jugador{Nombre}<br />Objetos{}</h3>
                    {/* <div className="mt-5">
                            <div className="progress">
                                    <div className="progress-bar" role="progressbar" style={{ width: '50%' }} aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}></div>
                                </div>
                                <div className="mt-3"> <span className="text1">32 Applied <span className="text2">of 50 capacity</span></span> </div>
                           </div> */}
                </div>
            </div></a>
        </div>
    );
};

export default PlayerSelection;

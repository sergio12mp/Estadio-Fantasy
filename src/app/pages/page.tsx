import { FooterHome } from "@/components/footer";

export default function Perfil() {
    //const user = User.FromJSON(props.user);
    //const auctions = props.auctions.map(auction => Auction.FromJSON(auction));
    //const bids = props.bids.map(bid => Bid.FromJSON(bid));
    //const ligas = props.ligas.map(liga => Liga.FromJSON(liga));
    //const equipoDeCadaJornada = props.equipoDeCadaJornada.map(equipoDeCadaJornada => EquipoDeCadaJornada.FromJSON(equipoDeCadaJornada));
    return (
        <><div className="gradient-custom-2" style={{ backgroundColor: "#0000" }}>
            <div className="py-5 h-100 container">
                <div className="justify-content-center align-items-center h-100 row">
                    <div className="col-lg-9 col-xl-7">
                        <div className="card">
                            <div className="rounded-top text-white d-flex flex-row" style={{ backgroundColor: "#000", height: "200px" }}>
                                <div className="ms-4 mt-5 d-flex flex-column" style={{ width: "150px" }}>
                                </div>
                                <div className="ms-4" style={{ marginTop: "130px" }}>
                                    <h5>{"user.UserName"}</h5>
                                    <a href={`/usuario/direccion`}> {"direccion"} </a>
                                </div>
                            </div>
                            <div className="p-4 text-black" style={{ backgroundColor: "#f8f9fa" }}>
                                <div className="d-flex justify-content-center text-center">
                                    <div className="px-3">
                                        <div>
                                            <p className="mb-1 h5">{"auctions.length"}</p>
                                            <p><a href={`/usuario/`} className="small text-muted mb-0">Subastas publicadas</a></p>
                                        </div>
                                    </div>
                                    <div className="px-3">
                                        <div>
                                            <p className="mb-1 h5">{"bids.length"}</p>
                                            <p><a href={`/usuario/pujas`} className="small text-muted mb-0">Pujas realizadas</a></p>
                                        </div>
                                    </div>
                                    <div className="px-3">
                                        <div>
                                            <p className="mb-1 h5">{"auctionsAchieved.length"}</p>
                                            <p className="small text-muted mb-0">Subastas conseguidas</p>
                                        </div>
                                    </div>
                                    <div className="px-3">
                                        <div>
                                            <p className="mb-1 h5">{"reviews.length"}</p>
                                            <p className="small text-muted mb-0">Reviews</p>
                                        </div>
                                    </div>
                                    <div className="px-3">
                                        <div>
                                            <p className="mb-1 h5">{"reviewsScore.toFixed(2)"}</p>
                                            <p className="small text-muted mb-0"> Valoracion media
                                                {/*
    {props.showReviewButton ?
        <a href={`/usuario}/valorar`}>
            <button
                className="button btn btn-outline-dark"
                style={{ height: "36px", overflow: "visible" }}
            >
                Valorar
            </button></a>
        :
        <></>
    }*/}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body text-black p-4">
                                <div className="row">
                                    {/* Aquí puedes agregar contenido para las subastas recientes
    {props.auctions.length === 0 ? (
        <h4>No has hecho subastas todavia</h4>
    ) : (
        <AuctionList auctions={auctions.map(auction => auction.ToJSON())}></AuctionList>
    )}
    */}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div><footer>
                <FooterHome />
            </footer></>
    );
}
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components'
import { getAuth } from "firebase/auth";
import Maps from "../Map/Maps";


export default function Home() {
    const auth = getAuth();
    const user = auth.currentUser;
    console.log(user)
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (!user) {
            const timer = setTimeout(() => {
                setShowPopup(true);
            }, 5000); 

            return () => clearTimeout(timer);
        }
    }, [user]);

    const MapContainer = styled.div`
        display: flex;
        position: sticky;
    `;

    const HomePage = styled.div`
        display: grid;
        grid-template-columns: 1fr 1fr;
        flex-direction: column;
        text-align: center;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin-top: 55px;
    `;

    const Column = styled.div`
        border: 5px solid red;
        height: 97vh;
        width: 500px;
    `;

    const PopupBackground = styled.div`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
        backdrop-filter: blur(10px); /* Apply blur effect */
        display: ${showPopup && !user ? 'flex' : 'none'}; /* Show only when popup is active */
        justify-content: center;
        align-items: center;
    `;

    const Popup = styled.div`
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 9999;
    `;

    return (
        <HomePage>
            <Column>
                <h1>1</h1>
            </Column>

            <Column>
            <MapContainer>
            <Maps />
            </MapContainer>
                <h1>2</h1>
            </Column>

            {showPopup && !user && (
                <PopupBackground>
                    <Popup>
                        <p style={{
                            color: 'black'
                        }}><strong>Login</strong> or <strong>Signup</strong> to continue</p>

                        <Link to="/login">
                            <button>Login</button>
                        </Link>
                        
                        <Link to="/signup">
                            <button>Signup</button>
                        </Link>
                    </Popup>
                </PopupBackground>
            )}
        </HomePage>
    )
}
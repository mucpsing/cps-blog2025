import { useState, useRef, useEffect } from "react";

function LoadingPage() {
    const mainText = "< Capsion's Hub ... / >";
    const subText = "laoding ...";

    return (
        <section className="loading-page">
            <div className="loading-container">
                <div className="loading-main-text">{mainText}</div>
                <div className="loading-sub-text">{subText}</div>
            </div>
        </section>
    );
}

export default LoadingPage;

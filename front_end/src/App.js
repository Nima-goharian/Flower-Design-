import './App.css';
import React from "react";
import FlowerDesign from "./blog/components/FlowerDesign";
import Homepage from "./blog/components/homepage";


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
    // If you want to disable the animation just use the disabled `prop` like below on your page's component
    // return <AnimationRevealPage disabled>xxxxxxxxxx</AnimationRevealPage>;


    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Homepage/>} />
                    <Route path="/flowerdesign" element={<FlowerDesign />} />
                </Routes>
            </Router>
        </>
    );
}
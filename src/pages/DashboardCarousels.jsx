import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ClaimsDashboard from "./ClaimsDashboard";
import ClaimSideDashboard from "./ClaimSideDashboard";
const DashboardCarousels = () => {
    const settings = {
        infinite: true,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 8000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1,
                },
            },
        ],
    };

    return (
        <div className="w-full h-screen overflow-hidden">
            <Slider {...settings}>
                <div className="w-full h-screen">
                    <ClaimsDashboard />
                </div>
                <div className="w-full h-screen">
                    <ClaimSideDashboard />
                </div>
            </Slider>
        </div>
    );
};

export default DashboardCarousels;

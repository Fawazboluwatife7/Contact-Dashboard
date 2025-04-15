import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { CiCalendar } from "react-icons/ci";

const ClaimDashboard = () => {
    const navigate = useNavigate();
    const handleNavigate = (path) => {
        navigate(path);
    };
    const user = JSON.parse(localStorage.getItem("user"));
    const [data, setData] = useState([]);
    const [declined, setDeclinedPA] = useState([]);
    const [
        authorizationApprovedClaimPending,
        setAuthorizationApprovedClaimPending,
    ] = useState([]);
    const [AuthorizationPending, setAuthorizationPending] = useState([]);
    const [AuthorisationPending, setAuthorisationPending] = useState([]);
    const [exceedingTimeItems, setExceedingTimeItems] = useState([]);
    const [totalExceedingItems, setTotalExceedingItems] = useState(0);
    const [openPAOne, setOpenPAOne] = useState([]);
    const [openPATwo, setOpenPATwo] = useState([]);
    const combinedOpenPA = [...openPAOne, ...openPATwo];
    const [totalPA, TotalPA] = useState("");
    const [paAboveSevenMinutes, setPaAboveSevenMinutes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [todayDate, setTodayDate] = useState("");
    const [dailyPA, setDailyPA] = useState("");
    const [date, setTodaysDate] = useState("");
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [currentDate, setCurrentDate] = useState("");
    const [approvedPeople, getApprovedPeople] = useState("");
    const [rejectedPeople, SetRejectedPeople] = useState("");
    const [totalPeople, setTotalEnrollees] = useState("");

    const [pendingPA, setPendingPA] = useState([]);
    const [peopleWaiting, setPeopleWaiting] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(pendingPA.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedResults = pendingPA.slice(startIndex, endIndex);

    function formatISOToCustom(dateString) {
        if (!dateString) return ""; // Handle cases where DateIssued might be undefined/null

        const date = new Date(dateString);

        // Extract components
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");

        // Convert to 12-hour format with AM/PM
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert 0 to 12 for midnight

        return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
    }

    console.log(
        "paaa",
        fetch(
            `${apiUrl}api/EnrolleeProfile/GetEnrolleePreauthorizations?Fromdate=${currentDate}&Todate=${currentDate}&cifno=0&PAStatus&visitid`,
            {
                method: "GET",
            },
        ),
    );

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0]; // Gets YYYY-MM-DD
        setCurrentDate(today);

        console.log("date", today);
    }, []);

    useEffect(() => {
        if (currentDate) {
            getDailyPA();

            const interval = setInterval(() => {
                getDailyPA();
            }, 300000);

            return () => clearInterval(interval);
        }
    }, [currentDate]);

    async function getDailyPA() {
        setLoading(true);
        try {
            const response = await fetch(
                `${apiUrl}api/EnrolleeProfile/GetEnrolleePreauthorizations?Fromdate=${currentDate}&Todate=${currentDate}&cifno=0&PAStatus&visitid`,
                {
                    method: "GET",
                },
            );

            const data = await response.json();
            console.log("xp", data.result);

            const totalMemberNumbers = new Set(
                data.result.map((item) => item.MemberNumber),
            );

            setTotalEnrollees(totalMemberNumbers.size);
            TotalPA(data.result.length);

            const validStatuses = [
                "Authorization Pending",
                "Authorisation pending",
                "Approved",
                "Declined",
            ];

            const filteredData = data.result.filter((item) =>
                validStatuses.includes(item.PAStatus),
            );

            const PendingPA = filteredData.filter(
                (item) =>
                    item.PAStatus.toLowerCase() === "authorization pending",
            );

            console.log("pending", PendingPA);

            const uniqueMemberNumbers = new Set(
                PendingPA.map((item) => item.MemberNumber),
            );

            const uniqueMemberCount = uniqueMemberNumbers.size;

            console.log("count", uniqueMemberCount);

            const PendingPATwo = filteredData.filter(
                (item) =>
                    item.PAStatus.toLowerCase() === "authorisation pending",
            );

            // const getPendingPATimeExceedingSevenMinutes = (
            //     filteredData,
            // ) => {
            //     const exceedingTimeItems = [];

            //     filteredData.forEach((item) => {
            //         // Ensure the PAStatus is "authorization pending" or "authorisation pending"
            //         const isPendingPA = item.PAStatus
            //             ? [
            //                   "authorization pending",
            //                   "authorisation pending",
            //               ].includes(item.PAStatus.toLowerCase().trim())
            //             : false;

            //         if (!isPendingPA) return;

            //         // Check if DateIssued and ApprovedTime exist
            //         if (!item.DateIssued || !item.ApprovedTime) return;

            //         // Convert dates and calculate time difference
            //         const dateIssued = new Date(item.DateIssued);
            //         const [approvedHours, approvedMinutes] =
            //             item.ApprovedTime.split(":").map(Number);
            //         const approvedDate = new Date(dateIssued);
            //         approvedDate.setHours(
            //             approvedHours,
            //             approvedMinutes,
            //             0,
            //             0,
            //         );

            //         const timeDifference = Math.floor(
            //             (approvedDate - dateIssued) / 60000, // Convert to minutes
            //         );

            //         // If time difference is above 7 minutes, add to list
            //         if (timeDifference > 7) {
            //             exceedingTimeItems.push({
            //                 ...item,
            //                 timeDifference: timeDifference,
            //             });
            //         }
            //     });

            //     return {
            //         items: exceedingTimeItems,
            //         totalItems: exceedingTimeItems.length,
            //     };
            // };

            // Usage
            // const pendingPATimeExceeding =
            //     getPendingPATimeExceedingSevenMinutes(filteredData);
            // console.log(
            //     "Items exceeding 7 minutes:",
            //     pendingPATimeExceeding.items,
            // );
            // console.log(
            //     "Items exceeding 7 length:",
            //     pendingPATimeExceeding.items,
            // );
            // setPaAboveSevenMinutes(pendingPATimeExceeding.totalItems);

            const getPendingPATimeExceedingSevenMinutes = (filteredData) => {
                const exceedingTimeItems = [];

                filteredData.forEach((item) => {
                    // Ensure the PAStatus is "authorization pending" or "authorisation pending"
                    const isPendingPA = item.PAStatus
                        ? [
                              "authorization pending",
                              "authorisation pending",
                          ].includes(item.PAStatus.toLowerCase().trim())
                        : false;

                    if (!isPendingPA) return;

                    // Check if DateIssued exists
                    if (!item.DateIssued) return;

                    // Convert DateIssued to Date object
                    const dateIssued = new Date(item.DateIssued);
                    const now = new Date();

                    const timeDifference = Math.floor(
                        (now - dateIssued) / 60000,
                    ); // in minutes

                    // If time difference is more than 7 minutes
                    if (timeDifference > 7) {
                        exceedingTimeItems.push({
                            ...item,
                            timeDifference,
                        });
                    }
                });

                console.log("Exceeding Time Items:", exceedingTimeItems);
                console.log(
                    "Total Exceeding Items:",
                    exceedingTimeItems.length,
                );

                return {
                    items: exceedingTimeItems,
                    totalItems: exceedingTimeItems.length,
                };
            };

            const result = getPendingPATimeExceedingSevenMinutes(filteredData);

            setExceedingTimeItems(result.items);
            setTotalExceedingItems(result.totalItems);

            const uniqueMember = new Set(
                PendingPATwo.map((item) => item.MemberNumber),
            );

            const uniqueMembercc = uniqueMember.size;

            console.log("counttwo", uniqueMembercc);

            setPeopleWaiting(uniqueMembercc + uniqueMemberCount);

            const ClaimPending = filteredData.filter(
                (item) => item.PAStatus.toLowerCase() === "approved",
            );

            const uniqueApprovePeople = new Set(
                ClaimPending.map((item) => item.MemberNumber),
            );

            console.log("approvedPeople", uniqueApprovePeople);

            getApprovedPeople(uniqueApprovePeople.size);

            console.log("apporved", ClaimPending);
            const DeclinedPA = filteredData.filter(
                (item) => item.PAStatus.toLowerCase() === "declined",
            );

            const uniqueDeclinedPeople = new Set(
                DeclinedPA.map((item) => item.MemberNumber),
            );

            console.log("declined", uniqueDeclinedPeople);

            SetRejectedPeople(uniqueDeclinedPeople.size);

            const allPendingPa = [...PendingPA, ...PendingPATwo];
            setPendingPA(allPendingPa);
            setOpenPAOne(PendingPA);
            setOpenPATwo(PendingPATwo);

            setAuthorizationPending(PendingPA.length);
            setAuthorisationPending(PendingPATwo.length);
            setAuthorizationApprovedClaimPending(ClaimPending.length);
            setDeclinedPA(DeclinedPA.length);

            setAdjudicated(filteredData.length); // Fix: adjudicatedItems wasn't defined
        } catch (error) {
            console.error("get pa:", error);
            setDailyPA([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0]; // Gets YYYY-MM-DD
        setCurrentDate(today);
    }, []);
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSeeAll = () => {
        navigate("/ticket", { state: { filter: "Escalation" } });
    };

    if (error) {
        return (
            <div className="w-full p-5 bg-lightblue mt-10">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const paginateData = showAll ? data : data.slice(0, 7);

    function getTodayDate() {
        const today = new Date();
        const day = today.getDate().toString().padStart(2, "0"); // Ensure two-digit format
        const month = today.toLocaleString("en-US", { month: "short" }); // Get three-letter month
        const year = today.getFullYear();

        setTodaysDate(today);

        return `${day}-${month}-${year}`;
    }

    useEffect(() => {
        setTodayDate(getTodayDate());
    }, []);

    return (
        <div>
            <div className="bg-lightblue w-[100%] ml-auto h-[100vh]">
                <div className=" px-4">
                    <div className="px-2">
                        <div className="flex justify-between items-center w-full pt-5">
                            {/* Logo on the left */}
                            <img
                                src="leadway_health_logo-dashboard.png"
                                alt="Logo"
                                className="w-32"
                            />

                            {/* Calendar box on the right */}
                            <div className="bg-white rounded-md w-[10rem] h-[3rem] py-2 flex items-center gap-2 px-3">
                                <CiCalendar className="text-[20px]" />
                                <h1 className="font-medium">{todayDate}</h1>
                            </div>
                        </div>

                        <h4 className="mt-2 mb-2 text-[20px] text-red-500 font-bold">
                            Call centre dashboard{" "}
                        </h4>
                    </div>

                    <div className="flex w-full  overflow-y-visible ">
                        <div className=" w-full  flex gap-2 mr-1 ">
                            <div className=" flex-1 bg-bl bg-[#5f5f8c84] w-full h-[17.5rem] rounded-md py-4 px-4">
                                <p className="text-white  text-[30px] pt-2">
                                    {" "}
                                    Total PA Request / Number Of Enrolles
                                </p>
                                <h1 className="text-[80px] font-bold pt-[1rem]">
                                    {totalPA} / {totalPeople}
                                </h1>
                            </div>
                            <div className=" flex-1 bg-bl bg-[#5f5f8c84] w-full h-[17.5rem] rounded-md py-4 px-4">
                                <p className="text-white text-[35px]">
                                    Open Tickets/ Number Of Enrolles
                                </p>
                                <h1 className="text-[80px] font-bold ">
                                    {AuthorisationPending +
                                        AuthorizationPending}{" "}
                                    {""} {"/"} {peopleWaiting}
                                </h1>
                            </div>
                            <div className=" flex-1 bg-bl bg-[#5f5f8c84] w-full h-[17.5rem] rounded-md py-4 px-4">
                                <p className="text-white text-[35px]">
                                    Pending PA Above Seven Minutes
                                </p>
                                <h1 className="text-[80px] font-bold ">
                                    {totalExceedingItems}
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className=" w-full flex gap-2 mt-4">
                        <div className="w-full  flex gap-2 mr-1 ">
                            <div
                                className="
                   flex-1 bg-bl  bg-[#5f5f8c84] w-full h-[18.5rem] rounded-md py-4 px-4"
                            >
                                <p className="text-white text-[40px]">
                                    Approved PA Requests/ Number Of Enrolles
                                </p>
                                <span className="text-[100px] font-bold">
                                    {authorizationApprovedClaimPending} /{" "}
                                    {approvedPeople}
                                </span>
                            </div>
                            <div className="flex-1 bg-bl bg-[#5f5f8c84] w-full h-[18.5rem] rounded-md py-4 px-4">
                                <p className="text-white text-[48px]">
                                    Declined PA/ Number Of Enrolles
                                </p>
                                <h1 className="text-[100px]  mt-8 font-bold">
                                    {declined} / {rejectedPeople}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClaimDashboard;

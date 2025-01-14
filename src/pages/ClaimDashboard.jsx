import React, { useEffect, useState } from "react";
import { MdFilterAlt } from "react-icons/md";
import DashboardCarousels from "./DashboardCarousels";

function DateDropdown({ options, sendNumber, className }) {
    const [dateType, setDateType] = useState("1");

    const pickDate = (event) => {
        const number = event.target.value;
        setDateType(number);
        console.log("Number selected:", number);
        sendNumber(number);
    };

    return (
        <div>
            <select value={dateType} onChange={pickDate} className={className}>
                <option value="" disabled>
                    Treatment date
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

const ClaimDashboard = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [open, setOpen] = useState("");

    const [items, setItems] = useState([]);
    const [filteredClaimsItems, setClaimsItems] = useState([]);
    const [totalApiData, setTotalApiData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [startDate, setStartDate] = useState("2024-11-12");
    const [endDate, setEndDate] = useState("2024-12-29");
    const [dateType, setDateType] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [totalUnpaidCLaims, setUnpaidCLaims] = useState("");
    const [uniqueProvidersAboveFiveDays, setUniqueProvidersAboveFiveDays] =
        useState("");
    const [totalUnpaidClaimValue, setTotalUnpaidClaimValue] = useState("");
    const [claimAboveFiveDaysDuration, setClaimAboveFiveDaysDuration] =
        useState("");
    const [totalClaimValueAboveFiveDays, setTotalClaimValueAboveFiveDays] =
        useState("");

    const dateTypes = [
        { label: "TreatmentDate", value: 1 },
        { label: "Finance on", value: 2 },
        { label: "Encounter month to", value: 3 },
        { label: "Batch received on", value: 6 },
    ];

    const [claimsOperationsTAT, setClaimsOperationsTAT] = useState(0);
    const [internalControlTAT, setInternalControlTAT] = useState(0);
    const [financeTAT, setFinanceTAT] = useState(0);
    const [turnAroundTAT, setTurnAroundTAT] = useState(0);

    useEffect(() => {
        getDashboardData();

        const today = new Date();
        const end = today.toISOString().split("T")[0];

        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 30);
        const start = pastDate.toISOString().split("T")[0];

        setStartDate(start);
        setEndDate(end);

        getBatchTotalOfTheLastThirtyDays();
    }, []);

    async function getDashboardData() {
        console.log(
            `${apiUrl}/api/EnrolleeClaims/GetBatchSumaary?Fromdate=${startDate}&Todate=${endDate}&DateType=${dateType}`,
        );
        const response = await fetch(
            `${apiUrl}/api/EnrolleeClaims/GetBatchSumaary?Fromdate=${startDate}&Todate=${endDate}&DateType=${dateType}`,
            {
                method: "GET",
            },
        );

        const data = await response.json();

        if (data.status === 200) {
            const validStatuses = [
                "Awaiting Adjudication",
                "Open                ",
                "Quality Assurance",
                "Adjudicated",
            ];

            const filteredData = data.result.filter((item) =>
                validStatuses.includes(item.BatchStatus),
            );
            setClaimsItems(filteredData);
        }
        setTotalApiData(data);
    }

    const totalUnits = filteredClaimsItems.reduce(
        (sum, item) => sum + (item.Units || 0),
        0,
    );

    const totalBatchTotal = filteredClaimsItems.reduce(
        (sum, item) => sum + (item.BatchTotal || 0),
        0,
    );

    const formattedTotal = totalBatchTotal.toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
    });
    const unitsTotal = totalUnits.toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
    });

    // const filteredItems = filteredClaimsItems.reduce(
    //     (sum, item) =>
    //         item.DateDiffWithoutWeekend > 5 ? sum + (item.Units || 0) : sum,
    //     0,
    // );

    // const formattedfilteredItems = filteredItems.toLocaleString("en-US");

    // setClaimAboveFiveDaysDuration(formattedfilteredItems);

    async function getBatchTotalOfTheLastThirtyDays() {
        const response = await fetch(
            `${apiUrl}/api/EnrolleeClaims/GetBatchSumaary?Fromdate=${startDate}&Todate=${endDate}&DateType=2`,
            {
                method: "GET",
            },
        );
        const data = await response.json();

        const paidItemsCount = data.result.filter(
            (item) => item.BatchStatus === "Paid",
        ).length;

        console.log(`Total paid items: ${paidItemsCount}`);
    }
    return (
        <div className=" w-full h-[100vh]">
            <DashboardCarousels />
        </div>
    );
};

export default ClaimDashboard;

import React, { useEffect, useState } from "react";

import { MdFilterAlt } from "react-icons/md";

function DateDropdown({ options, sendNumber, className }) {
    const [dateType, setDateType] = useState("1"); // Remember your choice

    const pickDate = (event) => {
        const number = event.target.value;
        setDateType(number);

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

const ClaimsDashboard = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [open, setOpen] = useState("");

    const [items, setItems] = useState([]);

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

    const [tat, setTat] = useState("");

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

    const [adjudicated, setAdjudicated] = useState("");
    const [awaitingAdj, setAwaitingAdj] = useState("");
    const [opens, setOpens] = useState("");
    const [qualityAssuarance, setQualityAssuarance] = useState("");
    const [thrirtyDaysPaidBatches, setThrirtyDaysPaidBatches] = useState(0);
    const [sixtyDaysPaidBatches, setSixtyDaysPaidBatches] = useState(0);

    // useEffect(() => {
    //     const today = new Date();
    //     const end = today.toISOString().split("T")[0];

    //     const pastDate = new Date();
    //     pastDate.setDate(today.getDate() - 30);
    //     const start = pastDate.toISOString().split("T")[0];

    //     setStartDate(start);
    //     setEndDate(end);
    //     console.log("start", start), console.log("end", end);

    //     if (start && end) {
    //         getDashboardData(start, end);
    //         getBatchTotalOfTheLastThirtyDays();
    //     }

    //     console.log("start", start), console.log("end", end);
    // }, []);

    useEffect(() => {
        const today = new Date();
        const end = today.toISOString().split("T")[0];

        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 30);
        const start = pastDate.toISOString().split("T")[0];

        // Update state
        setStartDate(start);
        setEndDate(end);

        if (start.trim() && end.trim()) {
            getDashboardData(start, end);
            getBatchTotalOfTheLastThirtyDays(start, end);
            getLastMonthBatchTotal();
            getMonthlyCurrentPaidBatchTotal();
        }
    }, []);

    async function getDashboardData(fromDate, toDate) {
        console.log("start", fromDate), console.log("end", toDate);
        // setIsLoading(true);
        console.log(
            "xxxb",
            await fetch(
                `${apiUrl}api/EnrolleeClaims/GetBatchSumaary?Fromdate=${fromDate}&Todate=${toDate}&DateType=${dateType}`,
                {
                    method: "GET",
                },
            ),
        );

        const response = await fetch(
            `${apiUrl}api/EnrolleeClaims/GetBatchSumaary?Fromdate=${fromDate}&Todate=${toDate}&DateType=${dateType}`,
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
            setItems(filteredData);

            setTurnAroundTAT(data);

            const adjudicatedItems = filteredData.filter(
                (item) => item.BatchStatus.toLowerCase() === "adjudicated",
            );

            const awaitingAdjudicationItems = filteredData.filter(
                (item) =>
                    item.BatchStatus.toLowerCase() === "awaiting adjudication",
            );

            const open = filteredData.filter(
                (item) =>
                    item.BatchStatus.toLowerCase() === "open                ",
            );

            const qualityAssurance = filteredData.filter(
                (item) =>
                    item.BatchStatus.toLowerCase() === "quality assurance",
            );

            console.log("adj", awaitingAdjudicationItems.length);
            setAdjudicated(adjudicatedItems.length);
            setAwaitingAdj(awaitingAdjudicationItems.length);
            setOpens(open.length);
            setQualityAssuarance(qualityAssurance.length);

            const totalUnits = filteredData.reduce(
                (sum, item) => sum + (item.Units || 0),
                0,
            );

            const totalBatchTotal = filteredData.reduce(
                (sum, item) => sum + (item.BatchTotal || 0),
                0,
            );

            // Format the total with commas (e.g., 997,252.5)
            const formattedTotal = totalBatchTotal.toLocaleString("en-US", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
            });
            const unitsTotal = totalUnits.toLocaleString("en-US", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
            });

            const filteredItems = filteredData.reduce(
                (sum, item) =>
                    item.DateDiffWithoutWeekend > 5
                        ? sum + (item.Units || 0)
                        : sum,
                0,
            );

            const formattedfilteredItems =
                filteredItems.toLocaleString("en-US");

            // Get the total number of such items
            setClaimAboveFiveDaysDuration(formattedfilteredItems);

            const calculateTAT = () => {
                const validItems = data?.result.filter(
                    (item) =>
                        item.PaidDate !== null &&
                        item.ReceivedOn !== null &&
                        item.QAOn !== null &&
                        item.AuditOn !== null &&
                        item.BatchStatus === "Paid",
                );

                const calculateTATSum = (key1, key2) =>
                    validItems.reduce((sum, item) => {
                        const date1 = new Date(item[key1]);
                        const date2 = new Date(item[key2]);

                        // Exclude weekends
                        const diffWithoutWeekends =
                            calculateDaysWithoutWeekends(date1, date2) - 1;

                        return sum + diffWithoutWeekends;
                    }, 0);

                const calculateAverageInternalClaimByDay = () => {
                    // // Filter out items with null PaidDate
                    // const validEntries = data.filter(
                    //     (item) => item.PaidDate !== null,
                    // );

                    // Calculate time differences in whole days
                    const differences = validItems
                        .map((item) => {
                            const auditDate = new Date(item.AuditOn);
                            const qaDate = new Date(item.QAOn);

                            // Ensure both dates are valid
                            if (isNaN(auditDate) || isNaN(qaDate)) return null;

                            // Calculate the difference in whole days
                            return Math.floor(
                                (auditDate - qaDate) / (1000 * 60 * 60 * 24),
                            );
                        })
                        .filter((diff) => diff !== null); // Filter out invalid calculations

                    // Calculate total and average
                    const total = differences.reduce(
                        (sum, value) => sum + value,
                        0,
                    );
                    const average =
                        differences.length > 0 ? total / differences.length : 0;
                };

                const totalClaims = validItems.length;

                function calculateFinanceInternalClaim() {
                    // Filter out items where PaidDate is null
                    const validClaims = validItems.filter(
                        (item) => item.PaidDate !== null,
                    );

                    // Calculate the difference between AuditOn and PaidDate for each valid claim
                    const dateDifferences = validClaims.map((item) => {
                        const auditDate = new Date(item.AuditOn).setHours(
                            0,
                            0,
                            0,
                            0,
                        ); // Only use the date
                        const paidDate = new Date(item.PaidDate).setHours(
                            0,
                            0,
                            0,
                            0,
                        ); // Only use the date
                        return (paidDate - auditDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
                    });

                    // Calculate the total and average days
                    const totalDays = dateDifferences.reduce(
                        (sum, diff) => sum + diff,
                        0,
                    );
                    const averageDays = totalDays / dateDifferences.length;

                    return {
                        totalDays,
                        claimsCounted: dateDifferences.length,
                        averageDays,
                    };
                }

                function calculateInternalClaims() {
                    // Filter out items where AuditOn, QAOn, or PaidDate is null
                    const validClaims = validItems.filter(
                        (item) =>
                            item.AuditOn !== null &&
                            item.QAOn !== null &&
                            item.PaidDate !== null,
                    );

                    // Calculate the difference between AuditOn and QAOn for each valid claim
                    const dateDifferences = validClaims.map((item) => {
                        const auditDate = new Date(item.AuditOn).setHours(
                            0,
                            0,
                            0,
                            0,
                        ); // Only use the date
                        const qaDate = new Date(item.QAOn).setHours(0, 0, 0, 0); // Only use the date
                        return (auditDate - qaDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
                    });

                    // Calculate the total and average days
                    const totalDays = dateDifferences.reduce(
                        (sum, diff) => sum + diff,
                        0,
                    );
                    const averageDays = totalDays / dateDifferences.length;

                    return {
                        totalDays,
                        claimsCounted: dateDifferences.length,
                        averageDays,
                    };
                }

                // Claims Operations TAT: QAOn - ReceivedOn
                const claimsOperationsTAT =
                    totalClaims > 0
                        ? calculateTATSum("ReceivedOn", "QAOn") / totalClaims
                        : 0;

                // Internal Control TAT: AuditOn - QAOn
                const internalControlTAT =
                    totalClaims > 0
                        ? calculateInternalClaims("QAOn", "AuditOn")
                        : 0;
                setInternalControlTAT(
                    internalControlTAT?.averageDays?.toFixed(2),
                );

                // Finance TAT: PaidDate - AuditOn
                const financeTAT =
                    totalClaims > 0
                        ? calculateFinanceInternalClaim("AuditOn", "PaidDate")
                        : 0;

                const overallTAT =
                    claimsOperationsTAT +
                    internalControlTAT.averageDays +
                    financeTAT.averageDays;

                return { claimsOperationsTAT, internalControlTAT, financeTAT };
            };

            const calculateDaysWithoutWeekends = (startDate, endDate) => {
                let count = 0;
                let currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    const day = currentDate.getDay();
                    if (day !== 0 && day !== 6) {
                        count++;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                return count;
            };

            // Calculate TATs
            const { claimsOperationsTAT, internalControlTAT, financeTAT } =
                calculateTAT(turnAroundTAT);

            // Set TAT values to state
            setClaimsOperationsTAT(claimsOperationsTAT?.toFixed(2));
            //setInternalControlTAT(internalControlTAT?.averageDays.toFixed(2));
            setFinanceTAT(Math.round(financeTAT?.averageDays ?? 0));

            setTotalUnpaidClaimValue(formattedTotal);

            setUnpaidCLaims(unitsTotal);

            const calculateAverage = (data) => {
                // if (
                //     !data ||
                //     !Array.isArray(data.result) ||
                //     data.result.length === 0
                // ) {
                //     return 0;
                // }

                const validItems = data.filter(
                    (item) =>
                        item.PaidDate !== null &&
                        item.DateDiffWithoutWeekend !== null,
                );

                const dayCounts = validItems.reduce((acc, item) => {
                    const day = item.DateDiffWithoutWeekend;
                    acc[day] = (acc[day] || 0) + 1;

                    return acc;
                }, {});

                const totalAccumulated = Object.entries(dayCounts).reduce(
                    (sum, [day, count]) => sum + day * count,
                    0,
                );

                const totalCount = validItems.length;

                const average =
                    totalCount > 0 ? totalAccumulated / totalCount : 0;

                return average.toLocaleString("en-US", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2,
                });
            };

            // setTat(average?.toFixed(2));

            calculateAverage(data.result);

            const calculateAverages = (data) => {
                if (
                    !data ||
                    !Array.isArray(data.result) ||
                    data.result.length === 0
                ) {
                    return {
                        claimsOperationsTAT: 0,
                        internalControlTAT: 0,
                        financeTAT: 0,
                    };
                }

                // Utility to calculate the difference between two dates without weekends
                const dateDiffWithoutWeekends = (start, end) => {
                    let count = 0;
                    const currentDate = new Date(start);
                    const endDate = new Date(end);

                    while (currentDate <= endDate) {
                        const dayOfWeek = currentDate.getDay();
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                            // Exclude Sundays (0) and Saturdays (6)
                            count++;
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                    return count;
                };

                const validItems = data.result.filter(
                    (item) =>
                        item.PaidDate !== null &&
                        item.ReceivedOn !== null &&
                        item.QAOn !== null &&
                        item.AuditOn !== null,
                );

                let claimsOperationsSum = 0;
                let internalControlSum = 0;
                let financeSum = 0;

                validItems.forEach((item) => {
                    // Calculate Claims Operations TAT: QAOn - ReceivedOn
                    claimsOperationsSum += dateDiffWithoutWeekends(
                        item.ReceivedOn,
                        item.QAOn,
                    );

                    // Calculate Internal Control TAT: AuditOn - QAOn
                    internalControlSum += dateDiffWithoutWeekends(
                        item.QAOn,
                        item.AuditOn,
                    );

                    // Calculate Finance TAT: PaidDate - AuditOn
                    financeSum += dateDiffWithoutWeekends(
                        item.AuditOn,
                        item.PaidDate,
                    );
                });

                const totalCount = validItems.length;

                return {
                    claimsOperationsTAT:
                        totalCount > 0
                            ? (claimsOperationsSum / totalCount).toFixed(2)
                            : 0,
                    internalControlTAT:
                        totalCount > 0
                            ? (internalControlSum / totalCount).toFixed(2)
                            : 0,
                    financeTAT:
                        totalCount > 0
                            ? (financeSum / totalCount).toFixed(2)
                            : 0,
                };
            };

            const filteredProviders = filteredData
                .filter((item) => item.DatediffWithweekend > 5) // Step 1: Filter based on DatediffWithweekend
                .map((item) => item.Prorider); // Step 2: Extract the 'Prorider' (Provider) names

            // Step 3: Use a Set to get unique provider names
            const uniqueProviders = new Set(filteredProviders);

            // Set the count of unique providers
            setUniqueProvidersAboveFiveDays(uniqueProviders.size);

            // Assuming 'data.result' contains the API response array
            const totalFilteredClaimsValueAboveFiveDays = filteredData.filter(
                (item) => item.DateDiffWithoutWeekend > 5,
            ); // Step 1: Filter based on DatediffWithweekend

            // Step 2: Calculate the sum of BatchTotal values for the filtered items
            const sumBatchTotal = totalFilteredClaimsValueAboveFiveDays.reduce(
                (sum, item) => sum + item.BatchTotal,
                0,
            );

            const formattedTotalClaimAboveFiveDays =
                sumBatchTotal.toLocaleString("en-US");

            // Step 3: Set the total sum in state
            setTotalClaimValueAboveFiveDays(formattedTotalClaimAboveFiveDays);

            // setIsLoading(false);

            const sortedItems = data.result.sort(
                (a, b) => b.BatchTotal - a.BatchTotal,
            ); // Sort by BatchTotal descending

            // Get the total number of such items
            filteredItems.length;
        } else {
            console.error(
                "Failed to fetch data or unexpected response format.",
            );
        }
    }

    async function getBatchTotalOfTheLastThirtyDays(fromDate, toDate) {
        console.log("startzz", fromDate), console.log("endzzz", toDate);

        const response = await fetch(
            `${apiUrl}/api/EnrolleeClaims/GetBatchSumaary?Fromdate=${fromDate}&Todate=${toDate}&DateType=2`,
            {
                method: "GET",
            },
        );
        const data = await response.json();

        const paidItems = data.result.filter(
            (item) => item.BatchStatus === "Paid",
        );

        // Count the number of paid items
        const paidItemsCount = paidItems.length;

        // Calculate the total BatchTotal for paid items
        const totalBatchTotal = paidItems.reduce(
            (sum, item) => sum + item.BatchTotal,
            0,
        );
        const paymentItems = data.result.filter(
            (item) => item.BatchStatus === "Payment Requisition",
        );

        // Count the number of paid items
        const paymentCount = paymentItems.length;

        // Calculate the total BatchTotal for paid items
        const tpaymentTotal = paymentItems.reduce(
            (sum, item) => sum + item.BatchTotal,
            0,
        );

        const totalThirty = totalBatchTotal;

        // console.log("jkdcwc1", totalBatchTotal);
        // console.log("jkdcwc2", tpaymentTotal);
        // console.log("jkdcwc3", totalThirty);

        // console.log(`Total paid items: ${paidItemsCount}`);
        // console.log(`Total BatchTotal for paid items: ${totalBatchTotal}`);
        // console.log(`Total payment items: ${paymentCount}`);
        // console.log(`Total BatchTotal for payment : ${tpaymentTotal}`);

        setThrirtyDaysPaidBatches(totalThirty.toLocaleString("en-US"));
    }

    async function getDashboardRefreshData(fromDate, toDate) {
        //  setIsLoading(true);
        const response = await fetch(
            `${apiUrl}/api/EnrolleeClaims/GetBatchSumaary?Fromdate=${fromDate}&Todate=${toDate}&DateType=${dateType}`,
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
            setItems(filteredData);

            setTurnAroundTAT(data);

            const adjudicatedItems = filteredData.filter(
                (item) => item.BatchStatus.toLowerCase() === "adjudicated",
            );

            const awaitingAdjudicationItems = filteredData.filter(
                (item) =>
                    item.BatchStatus.toLowerCase() === "awaiting adjudication",
            );

            const open = filteredData.filter(
                (item) =>
                    item.BatchStatus.toLowerCase() === "open                ",
            );

            const qualityAssurance = filteredData.filter(
                (item) =>
                    item.BatchStatus.toLowerCase() === "quality assurance",
            );

            setAdjudicated(adjudicatedItems.length);
            setAwaitingAdj(awaitingAdjudicationItems.length);
            setOpens(open.length);
            setQualityAssuarance(qualityAssurance.length);

            const totalUnits = filteredData.reduce(
                (sum, item) => sum + (item.Units || 0),
                0,
            );

            const totalBatchTotal = filteredData.reduce(
                (sum, item) => sum + (item.BatchTotal || 0),
                0,
            );

            // Format the total with commas (e.g., 997,252.5)
            const formattedTotal = totalBatchTotal.toLocaleString("en-US", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
            });
            const unitsTotal = totalUnits.toLocaleString("en-US", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
            });

            const filteredItems = filteredData.reduce(
                (sum, item) =>
                    item.DateDiffWithoutWeekend > 5
                        ? sum + (item.Units || 0)
                        : sum,
                0,
            );

            const formattedfilteredItems =
                filteredItems.toLocaleString("en-US");

            // Get the total number of such items
            setClaimAboveFiveDaysDuration(formattedfilteredItems);

            const calculateTAT = () => {
                const validItems = data?.result.filter(
                    (item) =>
                        item.PaidDate !== null &&
                        item.ReceivedOn !== null &&
                        item.QAOn !== null &&
                        item.AuditOn !== null &&
                        item.BatchStatus === "Paid",
                );

                const calculateTATSum = (key1, key2) =>
                    validItems.reduce((sum, item) => {
                        const date1 = new Date(item[key1]);
                        const date2 = new Date(item[key2]);

                        // Exclude weekends
                        const diffWithoutWeekends =
                            calculateDaysWithoutWeekends(date1, date2) - 1;

                        return sum + diffWithoutWeekends;
                    }, 0);

                const calculateAverageInternalClaimByDay = () => {
                    // // Filter out items with null PaidDate

                    const differences = validItems
                        .map((item) => {
                            const auditDate = new Date(item.AuditOn);
                            const qaDate = new Date(item.QAOn);

                            // Ensure both dates are valid
                            if (isNaN(auditDate) || isNaN(qaDate)) return null;

                            // Calculate the difference in whole days
                            return Math.floor(
                                (auditDate - qaDate) / (1000 * 60 * 60 * 24),
                            );
                        })
                        .filter((diff) => diff !== null); // Filter out invalid calculations

                    // Calculate total and average
                    const total = differences.reduce(
                        (sum, value) => sum + value,
                        0,
                    );
                    const average =
                        differences.length > 0 ? total / differences.length : 0;
                };

                const totalClaims = validItems.length;

                function calculateFinanceInternalClaim() {
                    // Filter out items where PaidDate is null
                    const validClaims = validItems.filter(
                        (item) => item.PaidDate !== null,
                    );

                    // Calculate the difference between AuditOn and PaidDate for each valid claim
                    const dateDifferences = validClaims.map((item) => {
                        const auditDate = new Date(item.AuditOn).setHours(
                            0,
                            0,
                            0,
                            0,
                        ); // Only use the date
                        const paidDate = new Date(item.PaidDate).setHours(
                            0,
                            0,
                            0,
                            0,
                        ); // Only use the date
                        return (paidDate - auditDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
                    });

                    // Calculate the total and average days
                    const totalDays = dateDifferences.reduce(
                        (sum, diff) => sum + diff,
                        0,
                    );
                    const averageDays = totalDays / dateDifferences.length;

                    return {
                        totalDays,
                        claimsCounted: dateDifferences.length,
                        averageDays,
                    };
                }

                function calculateInternalClaims() {
                    // Filter out items where AuditOn, QAOn, or PaidDate is null
                    const validClaims = validItems.filter(
                        (item) =>
                            item.AuditOn !== null &&
                            item.QAOn !== null &&
                            item.PaidDate !== null,
                    );

                    // Calculate the difference between AuditOn and QAOn for each valid claim
                    const dateDifferences = validClaims.map((item) => {
                        const auditDate = new Date(item.AuditOn).setHours(
                            0,
                            0,
                            0,
                            0,
                        ); // Only use the date
                        const qaDate = new Date(item.QAOn).setHours(0, 0, 0, 0); // Only use the date
                        return (auditDate - qaDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
                    });

                    // Calculate the total and average days
                    const totalDays = dateDifferences.reduce(
                        (sum, diff) => sum + diff,
                        0,
                    );
                    const averageDays = totalDays / dateDifferences.length;

                    return {
                        totalDays,
                        claimsCounted: dateDifferences.length,
                        averageDays,
                    };
                }

                // Claims Operations TAT: QAOn - ReceivedOn
                const claimsOperationsTAT =
                    totalClaims > 0
                        ? calculateTATSum("ReceivedOn", "QAOn") / totalClaims
                        : 0;

                // Internal Control TAT: AuditOn - QAOn
                const internalControlTAT =
                    totalClaims > 0
                        ? calculateInternalClaims("QAOn", "AuditOn")
                        : 0;
                setInternalControlTAT(
                    internalControlTAT?.averageDays?.toFixed(2),
                );

                // Finance TAT: PaidDate - AuditOn
                const financeTAT =
                    totalClaims > 0
                        ? calculateFinanceInternalClaim("AuditOn", "PaidDate")
                        : 0;

                const overallTAT =
                    claimsOperationsTAT +
                    internalControlTAT.averageDays +
                    financeTAT.averageDays;

                return { claimsOperationsTAT, internalControlTAT, financeTAT };
            };

            const calculateDaysWithoutWeekends = (startDate, endDate) => {
                let count = 0;
                let currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    const day = currentDate.getDay();
                    if (day !== 0 && day !== 6) {
                        count++;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                return count;
            };

            // Calculate TATs
            const { claimsOperationsTAT, internalControlTAT, financeTAT } =
                calculateTAT(turnAroundTAT);

            // Set TAT values to state
            setClaimsOperationsTAT(claimsOperationsTAT?.toFixed(2));
            //setInternalControlTAT(internalControlTAT?.averageDays.toFixed(2));
            setFinanceTAT(financeTAT?.averageDays?.toFixed(2));

            setTotalUnpaidClaimValue(formattedTotal);

            setUnpaidCLaims(unitsTotal);

            const calculateAverage = (data) => {
                // if (
                //     !data ||
                //     !Array.isArray(data.result) ||
                //     data.result.length === 0
                // ) {
                //     return 0;
                // }

                const validItems = data.filter(
                    (item) =>
                        item.PaidDate !== null &&
                        item.DateDiffWithoutWeekend !== null,
                );

                const dayCounts = validItems.reduce((acc, item) => {
                    const day = item.DateDiffWithoutWeekend;
                    acc[day] = (acc[day] || 0) + 1;

                    return acc;
                }, {});

                const totalAccumulated = Object.entries(dayCounts).reduce(
                    (sum, [day, count]) => sum + day * count,
                    0,
                );

                const totalCount = validItems.length;

                const average =
                    totalCount > 0 ? totalAccumulated / totalCount : 0;

                return average.toLocaleString("en-US", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2,
                });
            };

            // setTat(average?.toFixed(2));

            calculateAverage(data.result);

            const calculateAverages = (data) => {
                if (
                    !data ||
                    !Array.isArray(data.result) ||
                    data.result.length === 0
                ) {
                    return {
                        claimsOperationsTAT: 0,
                        internalControlTAT: 0,
                        financeTAT: 0,
                    };
                }

                // Utility to calculate the difference between two dates without weekends
                const dateDiffWithoutWeekends = (start, end) => {
                    let count = 0;
                    const currentDate = new Date(start);
                    const endDate = new Date(end);

                    while (currentDate <= endDate) {
                        const dayOfWeek = currentDate.getDay();
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                            // Exclude Sundays (0) and Saturdays (6)
                            count++;
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                    return count;
                };

                const validItems = data.result.filter(
                    (item) =>
                        item.PaidDate !== null &&
                        item.ReceivedOn !== null &&
                        item.QAOn !== null &&
                        item.AuditOn !== null,
                );

                let claimsOperationsSum = 0;
                let internalControlSum = 0;
                let financeSum = 0;

                validItems.forEach((item) => {
                    // Calculate Claims Operations TAT: QAOn - ReceivedOn
                    claimsOperationsSum += dateDiffWithoutWeekends(
                        item.ReceivedOn,
                        item.QAOn,
                    );

                    // Calculate Internal Control TAT: AuditOn - QAOn
                    internalControlSum += dateDiffWithoutWeekends(
                        item.QAOn,
                        item.AuditOn,
                    );

                    // Calculate Finance TAT: PaidDate - AuditOn
                    financeSum += dateDiffWithoutWeekends(
                        item.AuditOn,
                        item.PaidDate,
                    );
                });

                const totalCount = validItems.length;

                return {
                    claimsOperationsTAT:
                        totalCount > 0
                            ? (claimsOperationsSum / totalCount).toFixed(2)
                            : 0,
                    internalControlTAT:
                        totalCount > 0
                            ? (internalControlSum / totalCount).toFixed(2)
                            : 0,
                    financeTAT:
                        totalCount > 0
                            ? (financeSum / totalCount).toFixed(2)
                            : 0,
                };
            };

            const filteredProviders = filteredData
                .filter((item) => item.DatediffWithweekend > 5) // Step 1: Filter based on DatediffWithweekend
                .map((item) => item.Prorider); // Step 2: Extract the 'Prorider' (Provider) names

            // Step 3: Use a Set to get unique provider names
            const uniqueProviders = new Set(filteredProviders);

            // Set the count of unique providers
            setUniqueProvidersAboveFiveDays(uniqueProviders.size);

            // Assuming 'data.result' contains the API response array
            const totalFilteredClaimsValueAboveFiveDays = filteredData.filter(
                (item) => item.DateDiffWithoutWeekend > 5,
            ); // Step 1: Filter based on DatediffWithweekend

            // Step 2: Calculate the sum of BatchTotal values for the filtered items
            const sumBatchTotal = totalFilteredClaimsValueAboveFiveDays.reduce(
                (sum, item) => sum + item.BatchTotal,
                0,
            );

            const formattedTotalClaimAboveFiveDays =
                sumBatchTotal.toLocaleString("en-US");

            // Step 3: Set the total sum in state
            setTotalClaimValueAboveFiveDays(formattedTotalClaimAboveFiveDays);

            // setIsLoading(false);

            const sortedItems = data.result.sort(
                (a, b) => b.BatchTotal - a.BatchTotal,
            ); // Sort by BatchTotal descending

            // Get the total number of such items
            filteredItems.length;
        } else {
            console.error(
                "Failed to fetch data or unexpected response format.",
            );
        }
    }

    async function getLastMonthBatchTotal() {
        const today = new Date();
        const previousMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            2,
        );
        const lastDayOfPreviousMonth = new Date(
            previousMonth.getFullYear(),
            previousMonth.getMonth() + 1,
            1,
        );

        // Format dates to YYYY-MM-DD
        const start = previousMonth.toISOString().split("T")[0];
        const end = lastDayOfPreviousMonth.toISOString().split("T")[0];
        console.log("Last month start date:", start);
        console.log("Last month end date:", end);

        try {
            // Fetch data from the API
            const response = await fetch(
                `${apiUrl}/api/EnrolleeClaims/GetBatchSumaary?Fromdate=${start}&Todate=${end}&DateType=2`,
                {
                    method: "GET",
                },
            );

            // Parse the JSON response
            const data = await response.json();

            // Check if the data is valid
            if (!data || !data.result) {
                console.error("Invalid API response:", data);
                return 0;
            }

            // Filter items where BatchStatus is "Paid" and PaidDate is within the last month
            const paidItems = data.result.filter(
                (item) =>
                    item.BatchStatus === "Paid" &&
                    item.PaidDate &&
                    new Date(item.PaidDate) >= previousMonth &&
                    new Date(item.PaidDate) <= lastDayOfPreviousMonth,
            );

            // Sum up BatchTotal for the filtered items
            const totalBatchTotal = paidItems.reduce(
                (sum, item) => sum + (item.BatchTotal || 0),
                0,
            );

            console.log("paid for last month December", totalBatchTotal);
        } catch (error) {
            console.error("Error fetching data from API:", error);
            return 0;
        }
    }

    async function getMonthlyCurrentPaidBatchTotal() {
        const today = new Date();
        const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1,
        );
        const firsttDate = firstDayOfMonth.toLocaleDateString("en-CA");

        const PresentDate = today.toLocaleDateString("en-CA");

        console.log("FirstDate:", firsttDate);
        console.log("EndDate:", PresentDate);

        try {
            const response = await fetch(
                `${apiUrl}/api/EnrolleeClaims/GetBatchSumaary?Fromdate=${firsttDate}&Todate=${PresentDate}&DateType=2`,
                {
                    method: "GET",
                },
            );

            const data = await response.json();

            if (!data || !data.result) {
                console.error("Invalid API response:", data);
                return 0;
            }

            const paidItems = data.result.filter(
                (item) => item.BatchStatus === "Paid",
            );

            console.log("current month total items", paidItems.length);

            const totalBatchTotal = paidItems.reduce(
                (sum, item) => sum + (item.BatchTotal || 0),
                0,
            );

            console.log(`Total Paid Batch Amount: ${totalBatchTotal}`);
            return totalBatchTotal;
        } catch (error) {
            console.error("Error fetching data from API:", error);
            return 0;
        }
    }

    useEffect(() => {
        const intervalId = setInterval(
            () => {
                const today = new Date();
                const end = today.toISOString().split("T")[0];

                const pastDate = new Date();
                pastDate.setDate(today.getDate() - 30);
                const start = pastDate.toISOString().split("T")[0];

                // Update state
                setStartDate(start);
                setEndDate(end);

                if (start.trim() && end.trim()) {
                    getDashboardData(start, end);
                    getBatchTotalOfTheLastThirtyDays(start, end);
                }
            },
            5 * 60 * 1000,
        );

        return () => clearInterval(intervalId);
    }, []);

    const ranges = [
        {
            dayRange: "06-10",
            min: 6,
            max: 10,
            totalUnits: 0,
            totalBatchTotal: 0,
        },
        {
            dayRange: "11-20",
            min: 11,
            max: 20,
            totalUnits: 0,
            totalBatchTotal: 0,
        },
        {
            dayRange: "21-30",
            min: 21,
            max: 30,
            totalUnits: 0,
            totalBatchTotal: 0,
        },
        {
            dayRange: "over 30",
            min: 31,
            max: Infinity,
            totalUnits: 0,
            totalBatchTotal: 0,
        },
    ];

    useEffect(() => {
        // Process the data
        ranges.forEach((range) => {
            range.DateDiffWithoutWeekend = 0; // Existing logic
            range.totalUnits = 0; // New: Sum of Units
            range.totalBatchTotal = 0; // New: Sum of BatchTotal
        });

        // Process the data
        items?.forEach((item) => {
            const { DateDiffWithoutWeekend, Units, BatchTotal } = item;

            // Find the range for the current item's DatediffWithweekend
            const range = ranges.find(
                (r) =>
                    DateDiffWithoutWeekend != null && // Exclude null values
                    DateDiffWithoutWeekend >= r.min &&
                    DateDiffWithoutWeekend <= r.max,
            );

            if (range) {
                // Accumulate Units and BatchTotal
                range.totalUnits += Units || 0; // Add Units (default to 0 if null)
                range.totalBatchTotal += BatchTotal || 0; // Add BatchTotal (default to 0 if null)
            }
        });

        setTableData(
            ranges.map((range) => ({
                dayRange: range.dayRange,

                totalUnits: range.totalUnits,
                totalBatchTotal: range.totalBatchTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 1,
                }),
            })),
        );
    }, [items]);

    return (
        <div className="bg-[#1B1464] w-full  h-[100vh]">
            <div className="justify-between flex">
                <img
                    src="/leadway_health_logo-dashboard.png"
                    alt=""
                    className=" w-[10rem] h-[5rem]"
                />
                <div className=" flex gap-7 py-3 px-3">
                    <div className="   rounded-sm">
                        <label className="block text-white   ">
                            {" "}
                            Start date
                        </label>
                        <input
                            className=" outline-none bg-[#5f5f8c84] rounded-md py-1 text-white"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className=" block   text-white"> End date</label>
                        <input
                            className=" outline-none bg-[#5f5f8c84] rounded-md py-1 text-white"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block  text-white"> Date type</label>
                        <DateDropdown
                            options={dateTypes}
                            sendNumber={setDateType}
                            className=" outline-none bg-[#5f5f8c84] rounded-md py-1 text-white"
                        />
                    </div>

                    <button
                        className="  bg-[#5f5f8c84] w-[6rem] rounded-md h-8 mt-6 text-white flex justify-center  py-1"
                        onClick={getDashboardData}
                    >
                        <MdFilterAlt className=" text-[1.5rem] " />
                        Filter
                    </button>
                </div>
            </div>

            <div className="flex  w-full pt-3 gap-3 rounded-md px-3">
                <div className="flex-1 bg-bl  bg-[#5f5f8c84] border-white h-[18rem] rounded-md">
                    <div>
                        <h1 className="  text-white  px-3 text-[25px] underline">
                            Total Unpaid Claims
                        </h1>

                        <h1 className="  text-white  py-4 px-3 text-[25px]">
                            Total No of Claim: {totalUnpaidCLaims}
                        </h1>
                        <h1 className="  text-white  py-4 px-3 text-[25px]">
                            Total No of Providers:{" "}
                            {[
                                ...new Set(items?.map((item) => item.Prorider)),
                            ].length.toLocaleString("en-US")}
                        </h1>
                        <h1 className="  text-white  py-4 px-3 text-[25px]">
                            Total Claim Value: #{totalUnpaidClaimValue}
                        </h1>
                    </div>
                </div>
                <div className="flex-1 bg-bl  bg-[#5f5f8c84] border-white h-[18rem] rounded-md">
                    <div className="">
                        <div className="">
                            <h1 className="  text-white  py-2 px-3 text-[25px] underline">
                                Total Pending Claims Over 5 Days
                            </h1>
                            <h1 className="  text-white  py-2 px-3 text-[25px] ">
                                No of Pending Claims Over 5 Days:{" "}
                                {claimAboveFiveDaysDuration}
                            </h1>
                            <h1 className="  text-white  py-2 px-3 text-[25px] ">
                                No of Providers: {uniqueProvidersAboveFiveDays}
                            </h1>
                            <h1 className="  text-white  py-2 px-3 text-[25px] ">
                                Total claim request over 5 days: #
                                {totalClaimValueAboveFiveDays}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1  bg-[#5f5f8c84] border-white h-[18rem] rounded-md">
                    <h1 className="text-xl font-bold px-3 text-white">
                        Claims Summary
                    </h1>
                    <table className="table-auto border-collapse  w-full rounded-md">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border  border-gray-300 px-2">
                                    Days range
                                </th>

                                <th className="border border-gray-300 px-2">
                                    Total Claims
                                </th>
                                <th className="border border-gray-300 px-2">
                                    Claims Value
                                </th>
                            </tr>
                        </thead>
                        <tbody className="rounded-md h-[3rem]">
                            {tableData.length > 0 ? (
                                tableData.map((group, index) => (
                                    <tr key={index}>
                                        {/* Days range */}
                                        <td className="border border-gray-300 px-1 py-4 text-white">
                                            {group.dayRange}
                                        </td>

                                        {/* Total Claims */}
                                        <td className="border border-gray-300 px-1 py-4 text-white">
                                            {group.totalUnits}{" "}
                                            {/* Display totalUnits */}
                                        </td>

                                        {/* Claims Value */}
                                        <td className="border border-gray-300 px-1 py-[1.05rem] text-white">
                                            {group.totalBatchTotal}{" "}
                                            {/* Display totalBatchTotal */}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="text-center py-2 text-gray-500"
                                    >
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex  w-full pt-3 gap-3 rounded-md px-3">
                <div className="flex-1 bg-bl  bg-[#5f5f8c84] border-white h-[20rem] rounded-md">
                    <div className="">
                        <div className="">
                            <h1 className="  text-white  py-2 px-3 text-[50px] underline">
                                Average Turn Around Time:
                            </h1>
                            <span className="  text-white  py-2 px-3 text-[75px] ">
                                {(
                                    Number(claimsOperationsTAT) +
                                    Number(internalControlTAT) +
                                    Number(financeTAT)
                                ).toFixed(2)}
                                Days
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-bl  bg-[#5f5f8c84] border-white h-[20rem]">
                    <div className="">
                        <div className="">
                            <h1 className="  text-white  py-2 px-3 text-[30px] underline">
                                Total unpaid claims
                            </h1>
                            <div className=" flex">
                                <h1 className="  text-white  py-1 px-3 text-[30px] ">
                                    Total Adjudicated: {adjudicated}
                                </h1>
                            </div>

                            <div className=" flex">
                                <h1 className="  text-white  py-1 px-3 text-[30px] ">
                                    Total Awaiting Adjudication: {awaitingAdj}
                                </h1>
                            </div>

                            <div className=" flex">
                                <h1 className="  text-white  py-1 px-3 text-[30px] ">
                                    Total Open: {opens}
                                </h1>
                            </div>

                            <div className=" flex">
                                <h1 className="  text-white  py-1 px-3 text-[30px] ">
                                    Total Q.A: {qualityAssuarance}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-bl  bg-[#5f5f8c84] border-white h-[20rem] rounded-md">
                    <div className="">
                        <div className="">
                            <h2 className="capitalize underline text-white pb-2  px-3 text-[30px] ">
                                Break Down of average turn around time
                            </h2>

                            <h2 className="  text-white   px-3 text-[35px] ">
                                Claims TAT: {claimsOperationsTAT}
                            </h2>

                            <h2 className="  text-white  px-3 text-[35px] ">
                                Internal Control TAT: {internalControlTAT}
                            </h2>
                            <h2 className="  text-white  px-3 text-[35px] ">
                                Finance TAT: {financeTAT}
                            </h2>
                        </div>
                    </div>
                </div>
                {/* <div className="flex-1 bg-bl  bg-[#5f5f8c84] border-white h-[20rem] rounded-md">
                    <div className="">
                        <div className="">
                            <h2 className="capitalize underline text-white pb-4 pt-2 px-3 text-[30px] ">
                                Total claims paid in the past 30 days:
                            </h2>

                            <h2 className="capitalize  text-white pb-4 pt-2 px-3 text-[50px] ">
                                #{thrirtyDaysPaidBatches}
                            </h2>
                            <h2 className="capitalize underline text-white pb-4 pt-2 px-3 text-[15px] ">
                                Total claims paid in the past 60 days: #
                                {sixtyDaysPaidBatches}
                            </h2> 
                        </div>
                    </div>
                </div> */}
            </div>

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-[#5f5f8c84] rounded-md p-6 w-[66%] shadow-lg flex flex-col items-center justify-center gap-5">
                        <img src="/Loader.gif" alt="" className=" w-16" />
                        <h2 className="text-xl font-bold mb-4 text-white ">
                            Updating Data...
                        </h2>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimsDashboard;

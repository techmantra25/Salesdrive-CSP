import React from "react";
import { Card, Button, Badge } from "flowbite-react";
import { mergeOutletPoints, mergeOutletsByMobile } from "../../api/outletApi";

const DuplicateOutlet = ({ duplicateGroups, onDataRefetch }) => {
  // Calculate total duplicates
  const totalDuplicates = duplicateGroups.reduce(
    (sum, group) => sum + group.count,
    0
  );

  // Calculate total outlets with phone numbers and non-zero points in duplicate groups (where more than one outlet has points)
  const outletsWithPhoneAndPoints = duplicateGroups.reduce((total, group) => {
    // Check if group has a phone number (not null)
    const hasPhone = group.mobile1 && group.mobile1 !== "NULL";
    if (!hasPhone) return total;

    // Count outlets in this group that have non-zero points
    const outletsWithPoints =
      group.currentPointBalances?.filter(
        (balance) => balance !== null && balance !== undefined && balance > 0
      ).length || 0;

    // Only include if more than one outlet has non-zero points
    if (outletsWithPoints > 1) {
      return total + outletsWithPoints;
    }

    return total;
  }, 0);

  // Get all phone numbers from groups that have MORE than one outlet with non-zero points
  const phoneNumbersWithPoints = duplicateGroups
    .filter((group) => {
      const hasPhone = group.mobile1 && group.mobile1 !== "NULL";
      const outletsWithPoints =
        group.currentPointBalances?.filter(
          (balance) => balance !== null && balance !== undefined && balance > 0
        ).length || 0;
      return hasPhone && outletsWithPoints > 1;
    })
    .map((group) => group.mobile1);

  const handlePrint = () => {
    window.print();
  };

  const handleFixDuplicate = async (mobileNumber) => {
    try {
      await mergeOutletsByMobile({ mobileNumber });
      alert("Duplicates merged successfully");
      if (onDataRefetch) {
        onDataRefetch();
      }
    } catch (error) {
      alert("Error merging duplicates");
    }
  };

  const checkdisable = (outlets) => {
    console.log(outlets, "outlets");
 
    return outlets.currentPointBalances.every((balance) => Number(balance) > 0);
  };

  const handlePointsMerge = async (mobileNumber) => {
    try {
      await mergeOutletPoints(mobileNumber);
      alert("Duplicates merged successfully");
      if (onDataRefetch) {
        onDataRefetch();
      }
    } catch (error) {
      alert("Error merging duplicates");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <Card className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">
            🔍 Duplicate Outlet Data Report
          </h1>
          <Button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            🖨️ Print Complete Report
          </Button>
        </div>

        {/* Executive Summary */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-3">
            📊 Executive Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">
                Total Duplicate Groups Found:
              </span>
              <Badge color="info" className="w-fit mt-1">
                {duplicateGroups.length}
              </Badge>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">
                Total Duplicate Outlets:
              </span>
              <Badge color="warning" className="w-fit mt-1">
                {totalDuplicates}
              </Badge>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">
                Outlets with Phone {">"}1 Non-Zero Points:
              </span>
              <Badge color="success" className="w-fit mt-1">
                {outletsWithPhoneAndPoints}
              </Badge>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">Report Generated:</span>
              <span className="text-gray-600 mt-1">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Phone Numbers with Non-Zero Points */}
        {phoneNumbersWithPoints.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">
              📱 Phone Numbers with Non-Zero Points
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-12 gap-2">
                {phoneNumbersWithPoints.map((phone, index) => (
                  <Badge
                    key={index}
                    color="success"
                    className="text-sm text-center"
                  >
                    {phone}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Total phone numbers: {phoneNumbersWithPoints.length}
              </p>
            </div>
          </div>
        )}

        {/* Detailed Duplicate Groups */}
        <h2 className="text-xl font-semibold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">
          📋 Detailed Duplicate Groups
        </h2>

        {duplicateGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="mb-6 border border-gray-300 rounded-lg overflow-hidden"
          >
            <div className="bg-gray-100 p-3 border-b border-gray-300 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                Group {groupIndex + 1}: {group.count} outlets sharing mobile "
                {group.mobile1 || "NULL"}"
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleFixDuplicate(group.mobile1)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={checkdisable(group)}
                >
                  Fix duplicate
                </Button>
                {group.mobile1 && checkdisable(group) && (
                  <Button
                    onClick={() => handlePointsMerge(group.mobile1)}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                    color="dark"
                  >
                    Merge Points
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-600">
                    <th className="border border-gray-300 px-2 py-2 text-center w-16 text-white font-semibold">
                      S.No.
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-32 text-white font-semibold">
                      Outlet UID
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-48 text-white font-semibold">
                      Outlet Name
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-32 text-white font-semibold">
                      Point Balance
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-32 text-white font-semibold">
                      Outlet Source
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-32 text-white font-semibold">
                      Duplicate Mobile
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-20 text-white font-semibold">
                      Group Size
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.outletUIDs.map((uid, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-2 py-2 text-center text-black">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center text-black">
                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs text-black">
                          {uid}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-black">
                        {group.outletNames?.[index] || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center text-black">
                        {group.currentPointBalances?.[
                          index
                        ]?.toLocaleString() || "0"}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium text-black ${
                            group.outletSources?.[index] === "Admin"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {group.outletSources?.[index] || "N/A"}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        <span className="font-bold text-red-600">
                          {group.mobile1 || "NULL"}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center font-semibold text-black">
                        {group.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* End of Report */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          <strong className="text-gray-700">End of Report</strong>
          <br />
          <span className="text-gray-600">
            Total Groups: {duplicateGroups.length} | Total Duplicate Outlets:{" "}
            {totalDuplicates}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default DuplicateOutlet;

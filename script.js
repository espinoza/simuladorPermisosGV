setBarsFromInputs();

document.querySelectorAll('.changes-bar').forEach((item) => {
  item.addEventListener('input', setBarsFromInputs);
});

function setBarsFromInputs() {
    const startTimeString = document.getElementById("startTime").value;
    const maxStartTimeString = document.getElementById("maxStartTime").value;
    const shiftHoursString = document.getElementById("shiftHours").value;

    const permissionSchedule = document.getElementsByName("permissionSchedule");
    const hasPermission = document.getElementById("hasPermission").checked;

    const hasPunch = document.getElementById("hasPunch").checked;
    const punchEntryTimeString = document.getElementById("punchEntryTime").value;
    const punchExitTimeString = document.getElementById("punchExitTime").value;
    const punchEntryTimeInput = document.getElementById("punchEntryTime");
    const punchExitTimeInput = document.getElementById("punchExitTime");

    let [startTime, maxStartTime, shift] = getShiftDataInMinutes(
        startTimeString, maxStartTimeString, shiftHoursString
    );

    let permissionScheduleValue = getPermissionScheduleValue(permissionSchedule);

    let [assignedStartTime, assignedMaxStartTime, assignedShift] =
        getAssignedEntryRange(startTime, maxStartTime, shift, hasPermission,
                              permissionScheduleValue
        );

    let ultimateEndTime = maxStartTime + shift;

    permissionSchedule.forEach(item => item.disabled = !hasPermission)
    punchEntryTimeInput.disabled = !hasPunch;
    punchExitTimeInput.disabled = !hasPunch;

    let punchEntryTime, punchExitTime, delayStartTime, advanceEndTime;
    let shiftRealStartTime = assignedMaxStartTime;
    let shiftRealEndTime = assignedMaxStartTime + assignedShift;

    if (hasPunch) {
        [punchEntryTime, punchExitTime] = getPunchTime(
            punchEntryTimeString, punchExitTimeString
        );

        shiftRealStartTime = Math.min(
            Math.max(punchEntryTime, assignedStartTime), assignedMaxStartTime
        );
        shiftRealEndTime = shiftRealStartTime + assignedShift;

        delayStartTime = Math.min(punchEntryTime, shiftRealStartTime);
        advanceEndTime = Math.max(punchExitTime, shiftRealEndTime);
    } else {
        [punchEntryTime, punchExitTime, delayStartTime, advanceEndTime] =
            [startTime, startTime, startTime, startTime];
    };

    let permissionAM = permissionScheduleValue == "AM";
    let permitStartTime, permitEndTime, fillPermitStartTime, fillPermitEndTime;
    if (hasPermission && permissionAM) {
        permitStartTime = maxStartTime;
        permitEndTime = shiftRealStartTime;
        fillPermitStartTime = ultimateEndTime - (assignedMaxStartTime - permitEndTime);
    } else if (hasPermission && !permissionAM) {
        permitStartTime = shiftRealEndTime;
        permitEndTime = permitStartTime + assignedShift;
        fillPermitStartTime = ultimateEndTime;
    } else {
        permitStartTime = ultimateEndTime;
        permitEndTime = ultimateEndTime;
        fillPermitStartTime = ultimateEndTime;
    }
    fillPermitEndTime = ultimateEndTime;

    let infinityTime = Math.max(ultimateEndTime + 120, hasPunch ? punchExitTime : 0);
    let minusInfinityTime = Math.min(startTime, hasPunch ? punchEntryTime : 10000000);

    let clientPermitEndTime = hasPermission ? permitEndTime - assignedShift : permitEndTime;

    setBar("beforeEntryRangeBar", minusInfinityTime, assignedStartTime, minusInfinityTime, infinityTime);
    setBar("entryRangeBar", assignedStartTime, assignedMaxStartTime, minusInfinityTime, infinityTime);
    setBar("afterEntryRangeBar", assignedMaxStartTime, ultimateEndTime, minusInfinityTime, infinityTime);

    setBar("beforeWorkedRangeBar", minusInfinityTime, delayStartTime, minusInfinityTime, infinityTime);
    setBar("delayRangeBar", delayStartTime, punchEntryTime, minusInfinityTime, infinityTime);
    setBar("workedRangeBar", punchEntryTime, punchExitTime, minusInfinityTime, infinityTime);
    setBar("advanceRangeBar", punchExitTime, advanceEndTime, minusInfinityTime, infinityTime);
    setBar("afterWorkedRangeBar", advanceEndTime, ultimateEndTime, minusInfinityTime, infinityTime);

    setBar("beforePermitBar", minusInfinityTime, clientPermitEndTime, minusInfinityTime, infinityTime);
    setBar("PermitBar", clientPermitEndTime, permitEndTime, minusInfinityTime, infinityTime);
    setBar("afterPermitBar", permitEndTime, fillPermitStartTime, minusInfinityTime, infinityTime);

    setBar("beforeEntryRangeBarGV", minusInfinityTime, startTime, minusInfinityTime, infinityTime);
    setBar("entryRangeBarGV", startTime, maxStartTime, minusInfinityTime, infinityTime);
    setBar("afterEntryRangeBarGV", maxStartTime, ultimateEndTime, minusInfinityTime, infinityTime);

    setBar("beforePermitBarGV", minusInfinityTime, permitStartTime, minusInfinityTime, infinityTime);
    setBar("PermitBarGV", permitStartTime, permitEndTime, minusInfinityTime, infinityTime);
    setBar("afterPermitBarGV", permitEndTime, fillPermitStartTime, minusInfinityTime, infinityTime);
    setBar("fillPermitBarGV", fillPermitStartTime, fillPermitEndTime, minusInfinityTime, infinityTime);
    setBar("afterFillPermitBarGV", fillPermitEndTime, ultimateEndTime, minusInfinityTime, infinityTime);
};


function getShiftDataInMinutes(startTimeString, maxStartTimeString,
                               shiftHoursString) {
    let startDT = new Date("1970-01-01 " + startTimeString);
    let startTime = 60 * startDT.getHours() + startDT.getMinutes();

    let maxStartDT = new Date("1970-01-01 " + maxStartTimeString);
    let maxStartTime = 60 * maxStartDT.getHours() + maxStartDT.getMinutes();

    if (maxStartTime < startTime) maxStartTime += 24 * 60;

    let shift = 60 * parseFloat(shiftHoursString);

    return [startTime, maxStartTime, shift]
};


function getPermissionScheduleValue(permissionSchedule) {
    for (var i = 0; i < permissionSchedule.length; i++) {
        if (permissionSchedule[i].checked) {
            permissionScheduleValue = permissionSchedule[i].value;
            break;
        };
    };
    return permissionScheduleValue;
};


function getAssignedEntryRange(startTime, maxStartTime, shift, hasPermission,
                               permissionScheduleValue) {
    let assignedStartTime = startTime;
    let assignedMaxStartTime = maxStartTime;
    let assignedShift = shift;
    if (hasPermission) assignedShift /= 2;

    if (hasPermission && permissionScheduleValue == "AM") {
        assignedStartTime += assignedShift;
        assignedMaxStartTime += assignedShift;
    };

    return [assignedStartTime, assignedMaxStartTime, assignedShift]
};


function getPunchTime(punchEntryTimeString, punchExitTimeString) {
    let punchEntryDT = new Date("1970-01-01 " + punchEntryTimeString);
    let punchEntryTime = 60 * punchEntryDT.getHours() + punchEntryDT.getMinutes();

    let punchExitDT = new Date("1970-01-01 " + punchExitTimeString);
    let punchExitTime = 60 * punchExitDT.getHours() + punchExitDT.getMinutes();

    if (punchExitTime < punchEntryTime) punchExitTime += 24 * 60;

    return [punchEntryTime, punchExitTime]
}


function setBar(barId, start, end, minValue, maxValue) {
    bar = document.getElementById(barId);
    bar.setAttribute("aria-valuenow", minValue + end - start);
    bar.setAttribute("aria-valuemin", minValue);
    bar.setAttribute("aria-valuemax", maxValue);
    newWidthPercentage = (end - start) / (maxValue - minValue) * 100 + "%";
    bar.innerHTML = parseTimeInMinutesToTimeString(start) + " - "
                    + parseTimeInMinutesToTimeString(end);
    bar.style.width = newWidthPercentage
};


function parseTimeInMinutesToTimeString(timeInMinutes) {
    let timeDays = Math.trunc(timeInMinutes / (24 * 60));
    let timeHour = Math.trunc((timeInMinutes) / 60) - 24 * timeDays;
    let timeMinute = timeInMinutes - 60 * timeHour - (24 * 60) * timeDays;

    let timeString = String(timeHour).padStart(2, '0') + ":"
                     + String(timeMinute).padStart(2, '0');
    return timeString;
};

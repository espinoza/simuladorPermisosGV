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
    const punchEntryTime = document.getElementById("punchEntryTime");
    const punchExitTime = document.getElementById("punchExitTime");

    let [startTime, maxStartTime, shift] = getShiftDataInMinutes(
        startTimeString, maxStartTimeString, shiftHoursString
    );

    let permissionScheduleValue = getPermissionScheduleValue(permissionSchedule);

    let [assignedStartTime, assignedMaxStartTime] = getAssignedEntryRange(
        startTime, maxStartTime, shift, hasPermission, permissionScheduleValue
    );

    let ultimateEndTime = maxStartTime + shift;

    permissionSchedule.forEach(item => item.disabled = !hasPermission)

    setBar("beforeEntryRangeBar", startTime, assignedStartTime,
           startTime, ultimateEndTime);

    setBar("entryRangeBar", assignedStartTime, assignedMaxStartTime,
           startTime, ultimateEndTime);

    setBar("afterEntryRangeBar", assignedMaxStartTime, ultimateEndTime,
           startTime, ultimateEndTime);
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
    for (var i = 0, length = permissionSchedule.length; i < length; i++) {
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

    if (hasPermission && permissionScheduleValue == "AM") {
        assignedStartTime += shift / 2;
        assignedMaxStartTime += shift / 2;
    };

    return [assignedStartTime, assignedMaxStartTime]
};


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

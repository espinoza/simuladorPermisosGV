setBarsFromInputs();

document.querySelectorAll('.changes-bar').forEach((item) => {
  item.addEventListener('input', setBarsFromInputs);
});

function setBarsFromInputs() {
    let startTimeString = document.getElementById("startTime").value;
    let maxStartTimeString = document.getElementById("maxStartTime").value;
    let shiftHoursString = document.getElementById("shiftHours").value;
    let hasPunch = document.getElementById("hasPunch").checked;
    let hasPermission = document.getElementById("hasPermission").checked;
    let permissionSchedule = document.getElementsByName("permissionSchedule");
    let punchEntryTime = document.getElementById("punchEntryTime");
    let punchExitTime = document.getElementById("punchExitTime");

    let startDT = new Date("1970-01-01 " + startTimeString);
    let startTime = 60 * startDT.getHours() + startDT.getMinutes();

    let maxStartDT = new Date("1970-01-01 " + maxStartTimeString);
    let maxStartTime = 60 * maxStartDT.getHours() + maxStartDT.getMinutes();

    if (maxStartTime < startTime) maxStartTime += 24 * 60;

    let shift = 60 * parseFloat(shiftHoursString);

    let entryRange = maxStartTime - startTime;

    let totalRange = entryRange + shift;

    let endOfTotalRange = startTime + totalRange;

    let newStartTime = startTime;
    let newMaxStartTime = maxStartTime;

    let permissionScheduleChecked;
    for (var i = 0, length = permissionSchedule.length; i < length; i++) {
        if (permissionSchedule[i].checked) {
            permissionScheduleChecked = permissionSchedule[i].value;
            break;
        };
    };

    console.log(hasPunch)
    document.querySelectorAll("punch-time").forEach(
        item => console.log(item)
    );

    if (hasPermission) {
        permissionSchedule.forEach(item => item.disabled = false)
        if (permissionScheduleChecked == "AM") {
            newStartTime += shift / 2;
            newMaxStartTime += shift / 2;
    };
    } else if (!hasPermission){
        permissionSchedule.forEach(item => item.disabled = true);
    };

    setBar("beforeEntryRangeBar", startTime, newStartTime,
           startTime, endOfTotalRange);

    setBar("entryRangeBar", newStartTime, newMaxStartTime,
           startTime, endOfTotalRange);

    setBar("afterEntryRangeBar", newMaxStartTime, endOfTotalRange,
           startTime, endOfTotalRange);
};

function setBar(barId, start, end, minValue, maxValue) {
    bar = document.getElementById(barId);
    bar.setAttribute("aria-valuenow", minValue + end - start);
    bar.setAttribute("aria-valuemin", minValue);
    bar.setAttribute("aria-valuemax", maxValue);
    newWidthPercentage = (end - start) / (maxValue - minValue) * 100 + "%";
    bar.innerHTML = parseTimeInMinutesToTimeString(start) + " - "
                    + parseMinutesToTimeString(end);
    bar.style.width = newWidthPercentage
}

function parseTimeInMinutesToTimeString(timeInMinutes) {
    let timeDays = Math.trunc(timeInMinutes / (24 * 60));
    let timeHour = Math.trunc((timeInMinutes) / 60) - 24 * timeDays;
    let timeMinute = timeInMinutes - 60 * timeHour - (24 * 60) * timeDays;

    let timeString = String(timeHour).padStart(2, '0') + ":"
                     + String(timeMinute).padStart(2, '0');
    return timeString;
}
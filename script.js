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

    let startTime = new Date("1970-01-01 " + startTimeString);
    let minutesFromMidnightToStartTime = 60 * startTime.getHours()
                                         + startTime.getMinutes();

    let maxStartTime = new Date("1970-01-01 " + maxStartTimeString);
    let minutesFromMidnightToMaxStartTime = 60 * maxStartTime.getHours()
                                            + maxStartTime.getMinutes();

    if (maxStartTime < startTime) minutesFromMidnightToMaxStartTime += 24 * 60;

    let shiftHours = parseFloat(shiftHoursString);
    let shiftMinutes = 60 * shiftHours;

    let entryRangeMinutes = minutesFromMidnightToMaxStartTime
                            - minutesFromMidnightToStartTime;

    let totalRangeMinutes = entryRangeMinutes + shiftMinutes;

    let minutesFromMidnightToEndOfTotalRange = minutesFromMidnightToStartTime
                                               + totalRangeMinutes;

    let minutesFromMidnightToNewStartTime = minutesFromMidnightToStartTime;
    let minutesFromMidnightToNewMaxStartTime = minutesFromMidnightToMaxStartTime;

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
            minutesFromMidnightToNewStartTime += shiftMinutes / 2;
            minutesFromMidnightToNewMaxStartTime += shiftMinutes / 2;
    };
    } else if (!hasPermission){
        permissionSchedule.forEach(item => item.disabled = true);
    };

    setBar("beforeEntryRangeBar",
           minutesFromMidnightToStartTime,
           minutesFromMidnightToNewStartTime,
           minutesFromMidnightToStartTime,
           minutesFromMidnightToEndOfTotalRange);

    setBar("entryRangeBar",
           minutesFromMidnightToNewStartTime,
           minutesFromMidnightToNewMaxStartTime,
           minutesFromMidnightToStartTime,
           minutesFromMidnightToEndOfTotalRange);

    setBar("afterEntryRangeBar",
           minutesFromMidnightToNewMaxStartTime,
           minutesFromMidnightToEndOfTotalRange,
           minutesFromMidnightToStartTime,
           minutesFromMidnightToEndOfTotalRange);
};

function setBar(barId, start, end, minValue, maxValue) {
    bar = document.getElementById(barId);
    bar.setAttribute("aria-valuenow", minValue + end - start);
    bar.setAttribute("aria-valuemin", minValue);
    bar.setAttribute("aria-valuemax", maxValue);
    newWidthPercentage = (end - start) / (maxValue - minValue) * 100 + "%";
    bar.innerHTML = parseMinutesFromMidnightToTimeString(start) + " - "
                    + parseMinutesFromMidnightToTimeString(end);
    bar.style.width = newWidthPercentage
}

function parseMinutesFromMidnightToTimeString(minutesFromMidnight) {
    let timeDays = Math.trunc(minutesFromMidnight / (24 * 60));
    let timeHour = Math.trunc((minutesFromMidnight) / 60) - 24 * timeDays;
    let timeMinute = minutesFromMidnight - 60 * timeHour - (24 * 60) * timeDays;
    let timeString = String(timeHour).padStart(2, '0') + ":"
                     + String(timeMinute).padStart(2, '0');
    return timeString;
}
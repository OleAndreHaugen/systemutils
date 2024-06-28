const fs = modules.fs;

const fileName = "./log/requests/" + req.query.fileName;
const fileContent = fs.readFileSync(fileName, "utf8");
const fileFormatted = fileContent.split("\n").reverse();

let logContent = [];
let topUrl = {};
let users = {};
let reqOK = 0;
let reqNOK = 0;
let totReq = 0;
let totDuration = 0;

try {
    fileFormatted.forEach((element) => {
        if (!element) return;

        let log;

        try {
            log = JSON.parse(element);
        } catch (e) {}

        if (req.query.pathing === "without") {
            log.message.request.url = log.message.request.url.split("?")[0];
        }

        if (
            req.query?.minutes !== "All" &&
            !isWithinLastMinutes(log.message.request.timestamp, req.query.minutes)
        ) {
            return;
        }

        // Request Path
        const path = log.message.request.url;

        if (!topUrl[path])
            topUrl[path] = {
                requests: 0,
                duration: 0,
                errors: 0,
            };
        topUrl[path].requests++;
        topUrl[path].duration = topUrl[path].duration + log.message.response.duration;

        if (log.message.response.statusCode === 200) {
            reqOK++;
        } else {
            reqNOK++;
            topUrl[path].errors++;
        }

        // Request Users
        if (log.message.user.username) {
            if (!users[log.message.user.username])
                users[log.message.user.username] = {
                    requests: 0,
                    duration: 0,
                    errors: 0,
                };
            users[log.message.user.username].requests++;
            users[log.message.user.username].duration =
                users[log.message.user.username].duration + log.message.response.duration;
        }

        totReq++;
        totDuration = totDuration + log.message.response.duration;
    });

// Paths
    const keyValueArray = Object.entries(topUrl);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    const sortedJsonObject = Object.fromEntries(keyValueArray);

    const topUrlList = [];

    for (const key in sortedJsonObject) {
        topUrlList.push({
            url: key,
            requests: sortedJsonObject[key].requests,
            duration: parseFloat(sortedJsonObject[key].duration.toFixed(2)),
            errors: sortedJsonObject[key].errors,
        });
    }

    topUrlList?.forEach(function (item) {
        item.avg = item.duration / item.requests;
    });

// Users
    const keyValueArray2 = Object.entries(users);
    keyValueArray2.sort((a, b) => b[1] - a[1]);
    const sortedJsonObject2 = Object.fromEntries(keyValueArray2);

    const usersList = [];

    for (const key in sortedJsonObject2) {
        usersList.push({
            username: key,
            requests: sortedJsonObject2[key].requests,
            duration: parseFloat(sortedJsonObject2[key].duration.toFixed(2)),
            errors: sortedJsonObject2[key].errors,
        });
    }

    usersList?.forEach(function (item) {
        item.avg = item.duration / item.requests;
    });    

    result.data = {
        topUrlList,
        usersList,
        requestInfo: {
            reqOK,
            reqNOK,
            totReq,
            totDuration: (totDuration / 1000).toFixed(2),
        },
    };
} catch (e) {
    result.data = {
        error: e,
    };
}

complete();

function isWithinLastMinutes(logtime, minutes) {
    const timestamp = new Date(logtime).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - timestamp;
    const minutesDifference = timeDifference / (1000 * 60);
    return minutesDifference <= minutes;
}

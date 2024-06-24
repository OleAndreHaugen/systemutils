const fs = modules.fs;

const fileName = "./log/requests/" + req.query.fileName;
const fileContent = fs.readFileSync(fileName, "utf8");
const fileFormatted = fileContent.split("\n").reverse();

let logContent = [];
let topUrl = {};
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

        const path = log.message.request.host + log.message.request.url;

        if (!topUrl[path])
            topUrl[path] = {
                requests: 0,
                duration: 0,
                errors: 0
            };
        topUrl[path].requests++;
        topUrl[path].duration = topUrl[path].duration + log.message.response.duration;

        if (log.message.response.statusCode === 200) {
            reqOK++;
        } else {
            reqNOK++;
            topUrl[path].errors++;
        }

        totReq++;
        totDuration = totDuration + log.message.response.duration;
    });

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

    result.data = {
        topUrlList: topUrlList,
        requestInfo: {
            reqOK,
            reqNOK,
            totReq,
            totDuration,
        },
    };
} catch (e) {
    result.data = {
        error: e,
    };

    // console.log(result.data);
}

complete();

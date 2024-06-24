const fs = modules.fs;

// const fileName = "C:/Planet9/planet9/log/requests/2024-06-24-planet9.log";

const fileName = "./log/requests/" + req.query.fileName;
const fileContent = fs.readFileSync(fileName, "utf8");
const fileFormatted = fileContent.split("\n").reverse();

let logContent = [];
let topUrl = {};

try {
    fileFormatted.forEach((element) => {
        if (!element) return;

        let log;

        try {
            log = JSON.parse(element);
        } catch (e) {}

        logContent.push(log);

        const path = log.message.request.host + log.message.request.url;

        if (!topUrl[path])
            topUrl[path] = {
                requests: 0,
                duration: 0,
            };
        topUrl[path].requests++;
        topUrl[path].duration = topUrl[path].duration + log.message.response.duration;
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
        });
    }

    console.log(topUrlList);

    result.data = {
        logContent: logContent,
        topUrlList: topUrlList,
    };
} catch (e) {
    result.data = {
        error: e,
    };

    // console.log(result.data);
}

complete();
